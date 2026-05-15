import re
from pathlib import Path
from typing import List, Tuple
import structlog

log = structlog.get_logger()


class DocumentParser:
    """
    Extracts raw text from PDF, DOCX, TXT, and Markdown files.
    Uses pypdf (>= 4.x) — NOT the deprecated PyPDF2.
    """

    def parse(self, file_path: str) -> Tuple[str, dict]:
        """Returns (full_text, metadata). metadata: {page_count}."""
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix == ".pdf":
            return self._parse_pdf(path)
        elif suffix in (".docx", ".doc"):
            return self._parse_docx(path)
        elif suffix in (".md", ".markdown"):
            return self._parse_markdown(path)
        else:
            return self._parse_text(path)

    # ── parsers ────────────────────────────────────────────────────────────

    def _parse_pdf(self, path: Path) -> Tuple[str, dict]:
        try:
            from pypdf import PdfReader  # pypdf >= 3 / pypdf >= 4
            text_parts = []
            with open(path, "rb") as f:
                reader = PdfReader(f)
                page_count = len(reader.pages)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text_parts.append(extracted)
            text = "\n\n".join(text_parts)
            return text, {"page_count": page_count}
        except Exception as exc:
            log.error("pdf_parse_error", file=str(path), error=str(exc))
            raise

    def _parse_docx(self, path: Path) -> Tuple[str, dict]:
        try:
            from docx import Document  # python-docx
            doc = Document(path)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            text = "\n\n".join(paragraphs)
            return text, {"page_count": None}
        except Exception as exc:
            log.error("docx_parse_error", file=str(path), error=str(exc))
            raise

    def _parse_markdown(self, path: Path) -> Tuple[str, dict]:
        text = path.read_text(encoding="utf-8", errors="replace")
        # Strip the most common markdown syntax so embeddings focus on content
        clean = re.sub(r"#{1,6}\s+", "", text)
        clean = re.sub(r"\*{1,2}([^*]+)\*{1,2}", r"\1", clean)
        clean = re.sub(r"`{1,3}[^`]*`{1,3}", "", clean)
        clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", clean)
        clean = re.sub(r"^\s*[-*+]\s+", "", clean, flags=re.MULTILINE)
        return clean, {"page_count": None}

    def _parse_text(self, path: Path) -> Tuple[str, dict]:
        text = path.read_text(encoding="utf-8", errors="replace")
        return text, {"page_count": None}


class TextChunker:
    """
    Paragraph-aware, token-counted chunker with configurable size and overlap.
    Falls back to whitespace splitting when tiktoken is not available.
    """

    def __init__(self, chunk_size: int = 512, overlap: int = 64):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self._encoder = None
        try:
            import tiktoken
            self._encoder = tiktoken.get_encoding("cl100k_base")
        except Exception:
            log.warning("tiktoken_unavailable_using_word_split")

    # ── tokenisation ──────────────────────────────────────────────────────

    def _token_count(self, text: str) -> int:
        if self._encoder:
            return len(self._encoder.encode(text))
        return len(text.split())

    def _split_to_tokens(self, text: str) -> list:
        if self._encoder:
            return self._encoder.encode(text)
        return text.split()

    def _tokens_to_text(self, tokens: list) -> str:
        if self._encoder:
            return self._encoder.decode(tokens)
        return " ".join(tokens)

    # ── public API ────────────────────────────────────────────────────────

    def chunk(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.
        Paragraph boundaries are respected wherever possible.
        Very short chunks (< 10 words) are dropped.
        """
        paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
        chunks: List[str] = []
        current_tokens: list = []

        for para in paragraphs:
            para_tokens = self._split_to_tokens(para)

            if len(current_tokens) + len(para_tokens) <= self.chunk_size:
                current_tokens.extend(para_tokens)
            else:
                # Flush current buffer
                if current_tokens:
                    chunks.append(self._tokens_to_text(current_tokens))
                    current_tokens = current_tokens[-self.overlap :]

                # If a single paragraph exceeds chunk_size, split it directly
                if len(para_tokens) > self.chunk_size:
                    for start in range(0, len(para_tokens), self.chunk_size - self.overlap):
                        window = para_tokens[start : start + self.chunk_size]
                        if window:
                            chunks.append(self._tokens_to_text(window))
                    current_tokens = para_tokens[-self.overlap :]
                else:
                    current_tokens = list(para_tokens)

        # Flush remainder
        if current_tokens:
            chunks.append(self._tokens_to_text(current_tokens))

        # Drop trivially short chunks
        return [c for c in chunks if len(c.split()) >= 10]
