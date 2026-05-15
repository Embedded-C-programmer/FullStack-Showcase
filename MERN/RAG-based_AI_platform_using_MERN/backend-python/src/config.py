from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"

    # ── LLM backend ────────────────────────────────────────────────────────
    # "auto"   → try openai, then ollama, then none  (default)
    # "openai" → OpenAI API — requires OPENAI_API_KEY + internet access
    # "ollama" → local Ollama server — free, no API key, runs on your machine
    # "none"   → no LLM — returns formatted document excerpts as answers
    LLM_BACKEND: str = "auto"

    # OpenAI settings (used when LLM_BACKEND = "openai" or "auto")
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_MAX_TOKENS: int = 1500
    OPENAI_TEMPERATURE: float = 0.2

    # Ollama settings (used when LLM_BACKEND = "ollama" or "auto")
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"   # any model you've pulled with `ollama pull`

    # ── Embedding ──────────────────────────────────────────────────────────
    # all-MiniLM-L6-v2  → 22 MB,  384-dim  ← default, works on any machine
    # all-mpnet-base-v2 → 438 MB, 768-dim  ← higher quality, needs ~2GB RAM
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DEVICE: str = "cpu"   # "cuda" for GPU

    # ── FAISS ──────────────────────────────────────────────────────────────
    FAISS_INDEX_DIR: Path = Path("./faiss_indices")
    FAISS_DIMENSION: int = 384   # MUST match EMBEDDING_MODEL output dim

    # ── Chunking ───────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64

    # ── RAG ────────────────────────────────────────────────────────────────
    TOP_K_RESULTS: int = 5
    MIN_SIMILARITY_SCORE: float = 0.3

    # ── Node API ───────────────────────────────────────────────────────────
    NODE_API_URL: str = "http://localhost:5000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
settings.FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)
