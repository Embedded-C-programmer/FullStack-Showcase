import json
import threading
from pathlib import Path
from typing import List, Dict, Optional

import faiss
import numpy as np
import structlog

from ..config import settings

log = structlog.get_logger()


class FAISSService:
    """
    Manages per-user FAISS indices stored on disk.
    Each user gets a FlatIP index (cosine similarity via L2-normalised vectors).
    Thread-safe with per-index locks.

    Dimension guard: if a stored index has a different dimension than the
    currently configured model, it is rebuilt from scratch with a warning.
    """

    def __init__(self):
        self._indices: Dict[str, faiss.Index] = {}
        self._metadata: Dict[str, List[dict]] = {}
        self._locks: Dict[str, threading.Lock] = {}
        self._base_dir = settings.FAISS_INDEX_DIR
        self._dim = settings.FAISS_DIMENSION

    # ── private helpers ───────────────────────────────────────────────────

    def _index_path(self, user_id: str) -> Path:
        return self._base_dir / f"{user_id}.index"

    def _meta_path(self, user_id: str) -> Path:
        return self._base_dir / f"{user_id}.meta.json"

    def _get_lock(self, user_id: str) -> threading.Lock:
        if user_id not in self._locks:
            self._locks[user_id] = threading.Lock()
        return self._locks[user_id]

    def _new_index(self) -> faiss.Index:
        """Create a fresh FlatIP index with the configured dimension."""
        return faiss.IndexFlatIP(self._dim)

    def _load_or_create(self, user_id: str) -> None:
        idx_path = self._index_path(user_id)
        meta_path = self._meta_path(user_id)

        if idx_path.exists():
            try:
                loaded = faiss.read_index(str(idx_path))
                # Dimension guard — rebuild if model changed
                if loaded.d != self._dim:
                    log.warning(
                        "faiss_dimension_mismatch_rebuilding",
                        user_id=user_id,
                        stored_dim=loaded.d,
                        expected_dim=self._dim,
                    )
                    self._indices[user_id] = self._new_index()
                    self._metadata[user_id] = []
                    # Remove stale files so they don't survive a restart
                    idx_path.unlink(missing_ok=True)
                    meta_path.unlink(missing_ok=True)
                    return

                self._indices[user_id] = loaded
                if meta_path.exists():
                    with open(meta_path, encoding="utf-8") as f:
                        self._metadata[user_id] = json.load(f)
                else:
                    self._metadata[user_id] = []
                log.info("faiss_index_loaded", user_id=user_id, vectors=loaded.ntotal)
            except Exception as exc:
                log.error("faiss_load_error_rebuilding", user_id=user_id, error=str(exc))
                self._indices[user_id] = self._new_index()
                self._metadata[user_id] = []
        else:
            self._indices[user_id] = self._new_index()
            self._metadata[user_id] = []
            log.info("faiss_index_created", user_id=user_id)

    def _ensure_loaded(self, user_id: str) -> None:
        if user_id not in self._indices:
            self._load_or_create(user_id)

    def _save(self, user_id: str) -> None:
        faiss.write_index(self._indices[user_id], str(self._index_path(user_id)))
        with open(self._meta_path(user_id), "w", encoding="utf-8") as f:
            json.dump(self._metadata[user_id], f)

    # ── public API ────────────────────────────────────────────────────────

    def add_chunks(
        self,
        user_id: str,
        document_id: str,
        chunks: List[str],
        embeddings: np.ndarray,
    ) -> int:
        """Index document chunks. Returns the number of chunks added."""
        if embeddings.shape[1] != self._dim:
            raise ValueError(
                f"Embedding dimension {embeddings.shape[1]} does not match "
                f"configured FAISS_DIMENSION {self._dim}. "
                f"Check that EMBEDDING_MODEL and FAISS_DIMENSION are in sync."
            )

        lock = self._get_lock(user_id)
        with lock:
            self._ensure_loaded(user_id)
            self._indices[user_id].add(embeddings.astype(np.float32))
            self._metadata[user_id].extend(
                {"document_id": document_id, "chunk_index": i, "content": chunk}
                for i, chunk in enumerate(chunks)
            )
            self._save(user_id)
            log.info("chunks_added", user_id=user_id, doc=document_id, n=len(chunks))
            return len(chunks)

    def search(
        self,
        user_id: str,
        query_embedding: np.ndarray,
        top_k: int = 5,
        document_id: Optional[str] = None,
        min_score: float = 0.0,
    ) -> List[Dict]:
        """Return top-K matching chunks, optionally filtered to one document."""
        lock = self._get_lock(user_id)
        with lock:
            self._ensure_loaded(user_id)
            idx = self._indices[user_id]
            if idx.ntotal == 0:
                return []

            q = query_embedding.reshape(1, -1).astype(np.float32)
            fetch_k = min(top_k * 10 if document_id else top_k, idx.ntotal)
            scores, indices = idx.search(q, fetch_k)

            results = []
            for score, fi in zip(scores[0], indices[0]):
                if fi == -1 or score < min_score:
                    continue
                meta = self._metadata[user_id][fi]
                if document_id and meta["document_id"] != document_id:
                    continue
                results.append({**meta, "score": float(score)})
                if len(results) >= top_k:
                    break
            return results

    def delete_document(self, user_id: str, document_id: str) -> int:
        """
        Remove all vectors for a document by rebuilding the index without them.
        FlatIP does not support in-place deletion.
        """
        lock = self._get_lock(user_id)
        with lock:
            self._ensure_loaded(user_id)
            keep = [
                (i, m)
                for i, m in enumerate(self._metadata[user_id])
                if m["document_id"] != document_id
            ]

            new_idx = self._new_index()
            if keep:
                keep_indices, keep_meta = zip(*keep)
                old_idx = self._indices[user_id]
                vectors = np.vstack(
                    [old_idx.reconstruct(int(i)) for i in keep_indices]
                ).astype(np.float32)
                new_idx.add(vectors)
                self._metadata[user_id] = list(keep_meta)
            else:
                self._metadata[user_id] = []

            self._indices[user_id] = new_idx
            self._save(user_id)
            log.info("document_deleted_from_faiss", user_id=user_id, doc=document_id)
            return len(self._metadata[user_id])

    def get_stats(self, user_id: str) -> Dict:
        lock = self._get_lock(user_id)
        with lock:
            self._ensure_loaded(user_id)
            doc_ids = {m["document_id"] for m in self._metadata[user_id]}
            return {
                "user_id": user_id,
                "total_vectors": self._indices[user_id].ntotal,
                "document_count": len(doc_ids),
                "dimension": self._dim,
            }
