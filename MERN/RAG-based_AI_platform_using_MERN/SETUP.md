# Setup & Troubleshooting Guide

## Prerequisites
- Node.js 20+
- Python 3.11 (3.12 works too; **avoid 3.13** — some ML wheels not yet published)
- MongoDB running locally or a MongoDB Atlas URI
- An OpenAI API key

---

## 1 · Node API

```bash
cd backend-node
cp .env.example .env          # fill in MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run dev                   # http://localhost:5000
```

---

## 2 · Python AI Service

### 2a · Create venv and install deps in the correct order

```bash
cd backend-python
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install PyTorch CPU first — MUST come before transformers/sentence-transformers
pip install torch==2.5.1 --extra-index-url https://download.pytorch.org/whl/cpu

# Install the rest
pip install -r requirements.txt

cp .env.example .env          # fill in OPENAI_API_KEY
uvicorn src.main:app --reload --port 8000
```

> **Why install torch separately?**  
> `pip` resolves all packages simultaneously and sometimes picks a torch version
> incompatible with `transformers`. Installing torch first guarantees the right
> version is already present when `transformers` is installed.

### 2b · GPU support (optional)

Replace the torch install line with:
```bash
pip install torch==2.5.1 --extra-index-url https://download.pytorch.org/whl/cu121
```
Then set `EMBEDDING_DEVICE=cuda` in `.env`.

---

## 3 · React Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

---

## Common Errors

### `AttributeError: module 'torch.utils._pytree' has no attribute 'register_pytree_node'`

**Cause:** `sentence-transformers==2.3.1` + `transformers` >= 4.40 + PyTorch >= 2.2 are incompatible.  
**Fix:** Install the pinned versions in `requirements.txt` in the order shown above.

```bash
pip install torch==2.5.1 --extra-index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

---

### `Document processing failed: Python AI service is not running`

**Cause:** You uploaded a file before starting the Python service.  
**Fix:**
1. Start the Python service: `uvicorn src.main:app --reload --port 8000`
2. Use the **Reprocess** button on the failed document's detail page, or re-upload.

The Node service now checks `/health` before attempting to process and gives a clear error message if Python is unreachable.

---

### `ECONNREFUSED` on document upload

Same as above — Python service is not running. The document will be marked `failed` with the error message. Start Python and use the reprocess endpoint:

```
POST /api/documents/:id/reprocess
Authorization: Bearer <token>
```

---

## Running all three services together

```bash
# Terminal 1
cd backend-python && uvicorn src.main:app --reload --port 8000

# Terminal 2
cd backend-node && npm run dev

# Terminal 3
cd frontend && npm run dev
```

Or use Docker Compose for everything in one command:
```bash
docker compose up --build
```
