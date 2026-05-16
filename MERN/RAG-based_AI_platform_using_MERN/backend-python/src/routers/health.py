from fastapi import APIRouter, Request
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def health(request: Request):

    embedding_ready = (
        getattr(request.app.state, "embedding_service", None) is not None
    )

    faiss_ready = (
        getattr(request.app.state, "faiss_service", None) is not None
    )

    return {
        "status": "ok",
        "service": "rag-python-ai",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "embedding": (
                "ready"
                if embedding_ready
                else "lazy_not_loaded"
            ),
            "faiss": (
                "ready"
                if faiss_ready
                else "lazy_not_loaded"
            ),
        },
    }