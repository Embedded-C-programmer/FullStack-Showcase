from fastapi import APIRouter, Request
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    embedding_ready = hasattr(request.app.state, "embedding_service")
    faiss_ready = hasattr(request.app.state, "faiss_service")

    return {
        "status": "ok",
        "service": "rag-python-ai",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "embedding": "ready" if embedding_ready else "not_initialised",
            "faiss": "ready" if faiss_ready else "not_initialised",
        },
    }
