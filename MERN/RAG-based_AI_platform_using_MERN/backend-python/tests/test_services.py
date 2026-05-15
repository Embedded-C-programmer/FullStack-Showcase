"""
backend-python/tests/test_services.py
Unit tests for document chunker and FAISS service.
Run: pytest tests/ -v
"""
import numpy as np
import pytest
import tempfile
import shutil
from pathlib import Path


# ──────────────────────────────────────────────────────────
# TextChunker
# ──────────────────────────────────────────────────────────

from src.services.document_parser import TextChunker


class TestTextChunker:
    def setup_method(self):
        self.chunker = TextChunker(chunk_size=50, overlap=10)

    def test_empty_text_returns_empty(self):
        assert self.chunker.chunk("") == []

    def test_short_text_returns_single_chunk(self):
        text = "This is a short sentence that fits in one chunk easily."
        chunks = self.chunker.chunk(text)
        assert len(chunks) >= 1

    def test_long_text_produces_multiple_chunks(self):
        words = " ".join([f"word{i}" for i in range(500)])
        chunks = self.chunker.chunk(words)
        assert len(chunks) > 1

    def test_chunks_are_non_empty_strings(self):
        text = "\n\n".join([f"Paragraph {i}. " + "word " * 30 for i in range(10)])
        chunks = self.chunker.chunk(text)
        for chunk in chunks:
            assert isinstance(chunk, str)
            assert len(chunk.strip()) > 0

    def test_overlap_maintains_context(self):
        """Words from the end of chunk N should appear at the start of chunk N+1."""
        words = " ".join([f"w{i}" for i in range(200)])
        chunks = self.chunker.chunk(words)
        if len(chunks) >= 2:
            # The last few words of chunk 0 should overlap into chunk 1
            end_words = set(chunks[0].split()[-5:])
            start_words = set(chunks[1].split()[:15])
            assert len(end_words & start_words) > 0, "Expected some overlap between consecutive chunks"

    def test_filters_very_short_chunks(self):
        text = "Short.\n\n" + "This is a proper paragraph. " * 30
        chunks = self.chunker.chunk(text)
        for chunk in chunks:
            assert len(chunk.split()) > 5


# ──────────────────────────────────────────────────────────
# FAISSService
# ──────────────────────────────────────────────────────────

from src.services.faiss_service import FAISSService
from src.config import settings


@pytest.fixture
def tmp_faiss_dir(tmp_path):
    original = settings.FAISS_INDEX_DIR
    settings.FAISS_INDEX_DIR = tmp_path
    yield tmp_path
    settings.FAISS_INDEX_DIR = original


@pytest.fixture
def faiss_svc(tmp_faiss_dir):
    return FAISSService()


def make_embeddings(n: int, dim: int = 768) -> np.ndarray:
    """Generate random normalised embeddings."""
    vecs = np.random.randn(n, dim).astype(np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    return vecs / norms


class TestFAISSService:
    def test_add_and_search_basic(self, faiss_svc):
        user_id = "user_001"
        chunks = ["chunk A about machine learning", "chunk B about databases", "chunk C about cooking"]
        embeddings = make_embeddings(len(chunks))

        count = faiss_svc.add_chunks(user_id, "doc_1", chunks, embeddings)
        assert count == 3

        query = make_embeddings(1)[0]
        results = faiss_svc.search(user_id, query, top_k=3)
        assert len(results) <= 3
        assert all("content" in r for r in results)
        assert all("score" in r for r in results)

    def test_search_filtered_by_document(self, faiss_svc):
        user_id = "user_002"
        emb_doc1 = make_embeddings(3)
        emb_doc2 = make_embeddings(3)

        faiss_svc.add_chunks(user_id, "doc_A", ["a1", "a2", "a3"], emb_doc1)
        faiss_svc.add_chunks(user_id, "doc_B", ["b1", "b2", "b3"], emb_doc2)

        query = make_embeddings(1)[0]
        results = faiss_svc.search(user_id, query, top_k=10, document_id="doc_A")

        assert all(r["document_id"] == "doc_A" for r in results)

    def test_delete_document_removes_vectors(self, faiss_svc):
        user_id = "user_003"
        emb = make_embeddings(5)
        faiss_svc.add_chunks(user_id, "doc_DEL", [f"chunk {i}" for i in range(5)], emb)

        stats_before = faiss_svc.get_stats(user_id)
        assert stats_before["total_vectors"] == 5

        faiss_svc.delete_document(user_id, "doc_DEL")

        stats_after = faiss_svc.get_stats(user_id)
        assert stats_after["total_vectors"] == 0

    def test_persist_and_reload(self, tmp_faiss_dir):
        """Data saved by one instance should be loadable by a new instance."""
        user_id = "user_004"
        svc1 = FAISSService()
        emb = make_embeddings(4)
        svc1.add_chunks(user_id, "doc_persist", ["p1", "p2", "p3", "p4"], emb)

        svc2 = FAISSService()
        stats = svc2.get_stats(user_id)
        assert stats["total_vectors"] == 4

    def test_empty_index_returns_empty_results(self, faiss_svc):
        query = make_embeddings(1)[0]
        results = faiss_svc.search("new_user_xyz", query, top_k=5)
        assert results == []

    def test_multi_user_isolation(self, faiss_svc):
        """Vectors from user A should not appear in user B's results."""
        emb_a = make_embeddings(3)
        emb_b = make_embeddings(3)
        faiss_svc.add_chunks("user_A", "doc_a", ["a_chunk_1", "a_chunk_2", "a_chunk_3"], emb_a)
        faiss_svc.add_chunks("user_B", "doc_b", ["b_chunk_1", "b_chunk_2", "b_chunk_3"], emb_b)

        query = make_embeddings(1)[0]
        results_a = faiss_svc.search("user_A", query, top_k=10)
        results_b = faiss_svc.search("user_B", query, top_k=10)

        assert all(r["document_id"] == "doc_a" for r in results_a)
        assert all(r["document_id"] == "doc_b" for r in results_b)

    def test_get_stats_accuracy(self, faiss_svc):
        user_id = "user_stats"
        faiss_svc.add_chunks(user_id, "doc_1", ["c1", "c2"], make_embeddings(2))
        faiss_svc.add_chunks(user_id, "doc_2", ["c3", "c4", "c5"], make_embeddings(3))

        stats = faiss_svc.get_stats(user_id)
        assert stats["total_vectors"] == 5
        assert stats["document_count"] == 2
        assert stats["dimension"] == settings.FAISS_DIMENSION
