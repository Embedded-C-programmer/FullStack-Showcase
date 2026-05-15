"""
LLM Service — supports three backends:
  1. openai   — OpenAI API (requires OPENAI_API_KEY + internet)
  2. ollama   — local Ollama server (free, no API key, runs on your machine)
  3. none     — no LLM; returns well-formatted chunk summaries (always works)

Set LLM_BACKEND in .env to choose. Defaults to auto-detect:
  - "openai"  if OPENAI_API_KEY is set and non-empty
  - "ollama"  if Ollama is running at OLLAMA_BASE_URL
  - "none"    otherwise (safe fallback, no crash)
"""
from __future__ import annotations

import asyncio
from typing import Dict, List, Optional, Tuple

import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from ..config import settings

log = structlog.get_logger()

SYSTEM_PROMPT = """\
You are a precise, helpful AI assistant. Answer ONLY from the context excerpts provided.

Rules:
1. Base your answer strictly on the provided context — do not use outside knowledge.
2. If the context does not contain the answer, say so clearly.
3. Be concise and direct. Avoid filler phrases.
4. Preserve technical terms exactly as they appear.
5. Format lists and code blocks clearly when relevant."""


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _build_messages(
    query: str,
    chunks: List[Dict],
    history: Optional[List[Dict]] = None,
) -> List[Dict]:
    """Build the messages list for any OpenAI-compatible chat API."""
    messages: List[Dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Inject conversation history (all but the last user turn which we add below)
    if history:
        for msg in history[:-1]:
            if msg.get("role") in ("user", "assistant"):
                messages.append({"role": msg["role"], "content": msg["content"]})

    # Context block
    ctx_parts = [
        f"[Excerpt {i} — relevance {c.get('score', 0):.0%}]\n{c['content']}"
        for i, c in enumerate(chunks, 1)
    ]
    context_block = "\n\n---\n\n".join(ctx_parts)

    messages.append({
        "role": "user",
        "content": (
            f"Context excerpts from the document:\n\n{context_block}"
            f"\n\n---\n\nQuestion: {query}"
        ),
    })
    return messages


def _format_chunks_as_answer(query: str, chunks: List[Dict]) -> str:
    """
    Fallback when no LLM is available.
    Returns a readable markdown summary of the top chunks.
    """
    lines = [
        f"**No LLM configured** — showing the most relevant excerpts for: *{query}*\n"
    ]
    for i, c in enumerate(chunks[:5], 1):
        score_pct = f"{c.get('score', 0):.0%}"
        lines.append(f"### Excerpt {i} &nbsp;·&nbsp; relevance {score_pct}")
        lines.append(c["content"].strip())
        lines.append("")
    lines.append(
        "> **To enable AI answers:** set `LLM_BACKEND=openai` + `OPENAI_API_KEY` "
        "or `LLM_BACKEND=ollama` in `backend-python/.env` and restart the service."
    )
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# LLMService
# ─────────────────────────────────────────────────────────────────────────────

class LLMService:
    """
    Auto-detects the best available LLM backend on startup.
    Priority: openai → ollama → none (chunk display).
    """

    def __init__(self):
        self.backend: str = "none"
        self.model: str = settings.OPENAI_MODEL
        self._openai_client = None

        chosen = (settings.LLM_BACKEND or "auto").lower()

        if chosen in ("openai", "auto"):
            if self._try_init_openai():
                return

        if chosen in ("ollama", "auto"):
            if self._try_init_ollama():
                return

        # "none" or nothing worked
        log.warning(
            "llm_no_backend",
            message=(
                "No LLM backend is configured. Chat will return raw document excerpts. "
                "Set LLM_BACKEND=openai + OPENAI_API_KEY or LLM_BACKEND=ollama in .env."
            ),
        )
        self.backend = "none"

    # ── backend initialisation ────────────────────────────────────────────

    def _try_init_openai(self) -> bool:
        key = settings.OPENAI_API_KEY
        if not key or key.startswith("sk-your"):
            log.info("openai_skipped", reason="OPENAI_API_KEY is not set")
            return False
        if not key.startswith("sk-"):
            log.warning("openai_skipped", reason="OPENAI_API_KEY does not look valid (should start with sk-)")
            return False
        try:
            from openai import AsyncOpenAI
            # Use a custom httpx client with explicit timeouts to avoid
            # the Windows SSL/connection bug in httpx 0.28
            transport = httpx.AsyncHTTPTransport(retries=1)
            http_client = httpx.AsyncClient(
                transport=transport,
                timeout=httpx.Timeout(30.0, connect=10.0),
            )
            self._openai_client = AsyncOpenAI(
                api_key=key,
                http_client=http_client,
            )
            self.backend = "openai"
            self.model = settings.OPENAI_MODEL
            log.info("llm_backend_ready", backend="openai", model=self.model)
            return True
        except Exception as exc:
            log.warning("openai_init_failed", error=str(exc))
            return False

    def _try_init_ollama(self) -> bool:
        base = settings.OLLAMA_BASE_URL
        try:
            # Sync check — just see if Ollama is listening
            r = httpx.get(f"{base}/api/tags", timeout=3.0)
            if r.status_code != 200:
                return False
            models = [m["name"] for m in r.json().get("models", [])]
            model = settings.OLLAMA_MODEL
            if not models:
                log.info("ollama_skipped", reason="No models pulled yet. Run: ollama pull llama3.2")
                return False
            # Pick the requested model or fall back to first available
            if model not in models:
                model = models[0]
                log.info("ollama_model_fallback", requested=settings.OLLAMA_MODEL, using=model)
            self.backend = "ollama"
            self.model = model
            log.info("llm_backend_ready", backend="ollama", model=model, available=models)
            return True
        except Exception:
            log.info("ollama_skipped", reason=f"Ollama not reachable at {base}")
            return False

    # ── generation ────────────────────────────────────────────────────────

    @retry(
        retry=retry_if_exception_type(Exception),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        reraise=True,
    )
    async def _call_openai(self, messages: List[Dict]) -> Tuple[str, int]:
        response = await self._openai_client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=settings.OPENAI_TEMPERATURE,
        )
        answer = response.choices[0].message.content.strip()
        tokens = response.usage.total_tokens if response.usage else 0
        return answer, tokens

    async def _call_ollama(self, messages: List[Dict]) -> Tuple[str, int]:
        base = settings.OLLAMA_BASE_URL
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": settings.OPENAI_TEMPERATURE},
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(f"{base}/api/chat", json=payload)
            r.raise_for_status()
            data = r.json()
            answer = data["message"]["content"].strip()
            # Ollama returns prompt_eval_count + eval_count
            tokens = data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
            return answer, tokens

    async def generate(
        self,
        query: str,
        chunks: List[Dict],
        history: Optional[List[Dict]] = None,
    ) -> Tuple[str, int]:
        """Generate an answer. Always returns (str, int) — never raises."""
        if self.backend == "none" or not chunks:
            return _format_chunks_as_answer(query, chunks), 0

        messages = _build_messages(query, chunks, history)

        try:
            if self.backend == "openai":
                return await self._call_openai(messages)
            if self.backend == "ollama":
                return await self._call_ollama(messages)
        except httpx.ConnectError as exc:
            log.error(
                "llm_connection_error",
                backend=self.backend,
                error=str(exc),
                hint=(
                    "OpenAI: check internet + firewall. "
                    "Ollama: run 'ollama serve'. "
                    "No LLM: set LLM_BACKEND=none."
                ),
            )
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            if status == 401:
                log.error("llm_auth_error", hint="OPENAI_API_KEY is invalid or expired. Check your key at platform.openai.com.")
            elif status == 429:
                log.error("llm_rate_limit", hint="OpenAI rate limit hit. Check your usage tier at platform.openai.com/usage.")
            else:
                log.error("llm_http_error", status=status, error=str(exc))
        except Exception as exc:
            log.error("llm_generate_error", backend=self.backend, error=str(exc))

        # Graceful degradation — always return something useful
        log.info("llm_degraded_to_chunks")
        return _format_chunks_as_answer(query, chunks), 0
