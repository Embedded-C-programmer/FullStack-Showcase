from typing import Optional
from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
import structlog

from ..config import settings

log = structlog.get_logger()
router = APIRouter()


class SearchResult(BaseModel):
    document_id: str
    chunk_index: int
    content: str
    score: float


class SearchResponse(BaseModel):
    success: bool
    query: str
    results: list[SearchResult]
    total: int


@router.get("/search", response_model=SearchResponse)
async def semantic_search(
    request: Request,
    q: str = Query(..., min_length=1, description="Search query"),
    user_id: str = Query(...),
    document_id: Optional[str] = Query(None),
    top_k: int = Query(10, ge=1, le=50),
    min_score: float = Query(0.2, ge=0.0, le=1.0),
):
    """
    Pure semantic search across a user's document corpus.
    Optionally scoped to a single document.
    """

    from ..services.service_factory import (
        get_embedding_service,
        get_faiss_service,
    )

    embedding_svc = get_embedding_service(request)
    faiss_svc = get_faiss_service(request)

    query_emb = embedding_svc.embed_single(q)

    results = faiss_svc.search(
        user_id=user_id,
        query_embedding=query_emb,
        top_k=top_k,
        document_id=document_id,
        min_score=min_score,
    )

    log.info(
        "semantic_search",
        user=user_id,
        query=q[:60],
        results=len(results),
    )

    return SearchResponse(
        success=True,
        query=q,
        results=[
            SearchResult(
                document_id=r["document_id"],
                chunk_index=r["chunk_index"],
                content=r["content"],
                score=r["score"],
            )
            for r in results
        ],
        total=len(results),
    )

@router.get("/search/stats")
async def index_stats(request: Request, user_id: str = Query(...)):
    """Return FAISS index stats for a user."""
    from ..services.service_factory import get_faiss_service

    faiss_svc = get_faiss_service(request)
    stats = faiss_svc.get_stats(user_id)
    return {"success": True, "data": stats}
