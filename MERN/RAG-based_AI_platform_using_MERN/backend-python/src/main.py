from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
import time

from .config import settings
from .routers import process, chat, search, health

log = structlog.get_logger()


# ── Lifespan (replaces deprecated @app.on_event) ──────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise heavy singletons once at startup, clean up on shutdown."""
    log.info("startup_begin", model=settings.EMBEDDING_MODEL)

    # Import here so a missing torch/faiss installation doesn't break the
    # module-level import; the error surfaces cleanly at startup.
    from .services.embedding_service import EmbeddingService
    from .services.faiss_service import FAISSService

    app.state.embedding_service = EmbeddingService()
    app.state.faiss_service = FAISSService()

    log.info("startup_complete")
    yield
    log.info("shutdown")


# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="RAG Platform — AI Service",
    version="1.0.0",
    description="FastAPI service: document ingestion, FAISS vector search, RAG + LLM.",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", settings.NODE_API_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing ─────────────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time"] = f"{elapsed_ms:.1f}ms"
    log.debug(
        "http_request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        ms=round(elapsed_ms, 1),
    )
    return response


# ── Global exception handler ───────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("unhandled_exception", path=request.url.path, error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred",
        },
    )


# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(health.router, tags=["health"])
app.include_router(process.router, tags=["processing"])
app.include_router(chat.router, tags=["chat"])
app.include_router(search.router, tags=["search"])
