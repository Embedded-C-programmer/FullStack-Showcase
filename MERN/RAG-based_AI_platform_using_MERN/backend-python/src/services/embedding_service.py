import numpy as np
from typing import List
import structlog

from ..config import settings

log = structlog.get_logger()


class EmbeddingService:
    """
    Lazy-loaded SentenceTransformer service.

    Model loads only on first request instead of app startup.
    This reduces Render startup memory usage significantly.
    """

    def __init__(self):
        self.model = None
        self.dimension = None

    def _load_model(self):
        """
        Load model only once when actually needed.
        """
        if self.model is None:
            from sentence_transformers import SentenceTransformer

            log.info(
                "loading_embedding_model",
                model=settings.EMBEDDING_MODEL,
            )

            self.model = SentenceTransformer(
                settings.EMBEDDING_MODEL,
                device=settings.EMBEDDING_DEVICE,
            )

            self.dimension = (
                self.model.get_sentence_embedding_dimension()
            )

            log.info(
                "embedding_model_ready",
                dimension=self.dimension,
            )

    def embed(
        self,
        texts: List[str],
        batch_size: int = 64,
    ) -> np.ndarray:
        """
        Embed a list of strings.
        Returns normalized float32 vectors.
        """

        if not texts:
            if self.dimension is None:
                return np.empty((0, 384), dtype=np.float32)

            return np.empty((0, self.dimension), dtype=np.float32)

        # Lazy load happens here
        self._load_model()

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