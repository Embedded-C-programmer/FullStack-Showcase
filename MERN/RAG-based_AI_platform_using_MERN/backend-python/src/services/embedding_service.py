import numpy as np
from typing import List
import structlog

from ..config import settings

log = structlog.get_logger()


class EmbeddingService:
    """
    Wraps a SentenceTransformer model.
    Loaded once at startup; all requests share the same instance.

    Compatible with sentence-transformers >= 3.x (new encode() API).
    """

    def __init__(self):
        # Lazy-import so the module itself is importable even if torch isn't
        # installed yet (e.g. during unit-test collection).
        from sentence_transformers import SentenceTransformer  # noqa: PLC0415

        log.info("loading_embedding_model", model=settings.EMBEDDING_MODEL)
        self.model = SentenceTransformer(
            settings.EMBEDDING_MODEL,
            device=settings.EMBEDDING_DEVICE,
        )
        # get_sentence_embedding_dimension() is stable across all ST versions
        self.dimension = self.model.get_sentence_embedding_dimension()
        log.info("embedding_model_ready", dimension=self.dimension)

    def embed(self, texts: List[str], batch_size: int = 64) -> np.ndarray:
        """
        Embed a list of strings.
        Returns a float32 ndarray of shape (N, dimension).
        Vectors are L2-normalised so dot-product == cosine similarity.
        """
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)

        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=len(texts) > 100,
        )
        return embeddings.astype(np.float32)

    def embed_single(self, text: str) -> np.ndarray:
        return self.embed([text])[0]
