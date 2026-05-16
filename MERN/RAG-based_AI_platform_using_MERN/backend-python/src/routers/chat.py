import time
from typing import List, Optional

import structlog
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from ..config import settings
from ..services.llm_service import LLMService

log = structlog.get_logger()
router = APIRouter()

# Initialised once at module load; shared across all requests
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


# ── Schemas ───────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    query: str
    document_id: str
    user_id: str
    conversation_history: Optional[List[Message]] = []
    top_k: int = 5


class SourceChunk(BaseModel):
    chunk_index: int
    content: str
    score: float
    document_id: str


class ChatResponse(BaseModel):
    success: bool
    answer: str
    sources: List[SourceChunk]
    tokens_used: int
    latency_ms: int
    llm_backend: str   # tells the frontend which backend was used


# ── Route ─────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def rag_chat(body: ChatRequest, request: Request):
    """
    Full RAG pipeline:
    1. Embed the query
    2. Retrieve top-K chunks from FAISS
    3. Call LLM
    4. Return answer + sources
    """

    from ..services.service_factory import (
        get_embedding_service,
        get_faiss_service,
    )

    embedding_svc = get_embedding_service(request)
    faiss_svc = get_faiss_service(request)

    llm_svc = get_llm_service()

    start = time.time()

    if not body.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty.",
        )

    # 1. Embed query
    query_emb = embedding_svc.embed_single(body.query)

    # 2. Retrieve
    top_k = min(body.top_k, settings.TOP_K_RESULTS)

    chunks = faiss_svc.search(
        user_id=body.user_id,
        query_embedding=query_emb,
        top_k=top_k,
        document_id=body.document_id,
        min_score=settings.MIN_SIMILARITY_SCORE,
    )

    log.info(
        "rag_retrieved",
        doc=body.document_id,
        user=body.user_id,
        n_chunks=len(chunks),
        query_preview=body.query[:60],
        backend=llm_svc.backend,
    )

    if not chunks:
        return ChatResponse(
            success=True,
            answer=(
                "I couldn't find relevant information in this document "
                "to answer your question."
            ),
            sources=[],
            tokens_used=0,
            latency_ms=int((time.time() - start) * 1000),
            llm_backend=llm_svc.backend,
        )

    # 3. Generate answer
    history = [
        m.model_dump()
        for m in (body.conversation_history or [])
    ]

    answer, tokens_used = await llm_svc.generate(
        query=body.query,
        chunks=chunks,
        history=history,
    )

    latency_ms = int((time.time() - start) * 1000)

    log.info(
        "rag_done",
        doc=body.document_id,
        tokens=tokens_used,
        ms=latency_ms,
        backend=llm_svc.backend,
    )

    return ChatResponse(
        success=True,
        answer=answer,
        sources=[
            SourceChunk(
                chunk_index=c["chunk_index"],
                content=c["content"][:500],
                score=c["score"],
                document_id=c["document_id"],
            )
            for c in chunks
        ],
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        llm_backend=llm_svc.backend,
    )