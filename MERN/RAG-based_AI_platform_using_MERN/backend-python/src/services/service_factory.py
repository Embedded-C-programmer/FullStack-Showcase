from fastapi import Request

from .embedding_service import EmbeddingService
from .faiss_service import FAISSService


def get_embedding_service(request: Request):
    if request.app.state.embedding_service is None:
        request.app.state.embedding_service = EmbeddingService()

    return request.app.state.embedding_service


def get_faiss_service(request: Request):
    if request.app.state.faiss_service is None:
        request.app.state.faiss_service = FAISSService()

    return request.app.state.faiss_service