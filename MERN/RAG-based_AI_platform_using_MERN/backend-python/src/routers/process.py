import asyncio
import os
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

import aiofiles
import structlog
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel

from ..config import settings
from ..services.document_parser import DocumentParser, TextChunker

log = structlog.get_logger()
router = APIRouter()

# Thread pool for CPU-bound work (parsing + embedding) so it doesn't block
# the async event loop. Workers = 2 keeps memory predictable on small machines.
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="doc-worker")

parser = DocumentParser()
chunker = TextChunker(chunk_size=settings.CHUNK_SIZE, overlap=settings.CHUNK_OVERLAP)


class ProcessResponse(BaseModel):
    success: bool
    document_id: str
    chunk_count: int
    word_count: int
    page_count: Optional[int] = None


def _parse_chunk_embed(tmp_path: str, doc_id: str, user_id: str,
                        embedding_svc, faiss_svc) -> dict:
    """
    Blocking CPU work — runs inside a thread via run_in_executor.
    Returns a dict suitable for ProcessResponse.
    """
    t0 = time.time()

    # 1. Parse
    text, meta = parser.parse(tmp_path)
    if not text.strip():
        raise ValueError("Could not extract any text from document.")

    # word_count = len(text.split())
    word_count = text.count(" ") + 1
    log.info("parsed", doc=doc_id, words=word_count, seconds=round(time.time() - t0, 1))

    # 2. Chunk
    chunks = chunker.chunk(text)
    if not chunks:
        raise ValueError("Document produced no usable text chunks.")

    log.info("chunked", doc=doc_id, n=len(chunks))

    # 3. Embed — the slow part; runs in thread so event loop stays free
    t1 = time.time()
    embeddings = embedding_svc.embed(chunks, batch_size=8)
    log.info("embedded", doc=doc_id, n=len(chunks), seconds=round(time.time() - t1, 1))

    # 4. Index
    faiss_svc.add_chunks(
        user_id=user_id,
        document_id=doc_id,
        chunks=chunks,
        embeddings=embeddings,
    )

    return {
        "chunk_count": len(chunks),
        "word_count": word_count,
        "page_count": meta.get("page_count"),
    }


@router.post("/process", response_model=ProcessResponse)
async def process_document(
    request: Request,
    file: UploadFile = File(...),
    document_id: str = Form(...),
    user_id: str = Form(...),
):
    """
    Ingest a document: stream to disk → parse → chunk → embed → FAISS.
    Heavy CPU work runs in a ThreadPoolExecutor so the event loop stays free.
    """
    from ..services.service_factory import (
    get_embedding_service,
    get_faiss_service,
)

    embedding_svc = get_embedding_service(request)
    faiss_svc = get_faiss_service(request)

    log.info("process_start", doc=document_id, user=user_id,
             filename=file.filename, size=file.size)

    # Stream upload to a temp file (avoids loading whole file into RAM)
    suffix = os.path.splitext(file.filename or "doc")[1] or ".tmp"
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(tmp_fd)

    try:
        # Async streaming write — 64 KB chunks
        async with aiofiles.open(tmp_path, "wb") as f:
            while chunk := await file.read(65536):
                await f.write(chunk)

        file_size_mb = os.path.getsize(tmp_path) / 1_048_576
        log.info("file_written", doc=document_id, size_mb=round(file_size_mb, 2))

        # Run blocking CPU work in thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            _executor,
            _parse_chunk_embed,
            tmp_path, document_id, user_id,
            embedding_svc, faiss_svc,
        )

        log.info("process_done", doc=document_id, **result)

        return ProcessResponse(
            success=True,
            document_id=document_id,
            **result,
        )

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        log.error("process_error", doc=document_id, error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, user_id: str, request: Request):
    """Remove all FAISS vectors for a document."""
    from ..services.service_factory import get_faiss_service

    faiss_svc = get_faiss_service(request)
    
    loop = asyncio.get_event_loop()
    removed = await loop.run_in_executor(
        _executor,
        faiss_svc.delete_document,
        user_id,
        document_id,
    )
    return {"success": True, "removed_chunks": removed}
