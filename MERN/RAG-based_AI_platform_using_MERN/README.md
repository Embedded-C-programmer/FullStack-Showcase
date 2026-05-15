# RAG Platform — Full-Stack AI Knowledge Base

A production-ready Retrieval-Augmented Generation (RAG) platform built with MERN + FastAPI + FAISS.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     React Frontend                   │
│           (Auth, Upload, Chat, Dashboard)            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP / REST
┌──────────────────▼──────────────────────────────────┐
│              Node.js / Express API                   │
│    (Auth, Users, Documents, Sessions, Rate Limit)    │
└──────────┬──────────────────────┬───────────────────┘
           │ MongoDB               │ HTTP proxy to Python
┌──────────▼───────┐  ┌───────────▼───────────────────┐
│   MongoDB Atlas  │  │       FastAPI (Python)         │
│  (Users, Docs,   │  │  (Embeddings, FAISS Search,   │
│   Chat History)  │  │   LLM Orchestration, RAG)     │
└──────────────────┘  └───────────────────────────────┘
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Node API | Express, JWT, Mongoose, Multer |
| Python AI | FastAPI, FAISS, Sentence-Transformers, LangChain |
| Database | MongoDB (users, docs, chat) |
| Vector Store | FAISS (per-user namespaced indices) |
| Auth | JWT + Refresh Tokens + bcrypt |

## Quick Start

### Prerequisites
- Node.js 18+, Python 3.10+, MongoDB running

### 1. Node Backend
```bash
cd backend-node
cp .env.example .env          # fill in your values
npm install
npm run dev
```

### 2. Python AI Service
```bash
cd backend-python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Features

- **Multi-user** — isolated document namespaces per user
- **Document Ingestion** — PDF, DOCX, TXT, MD with chunking
- **Semantic Search** — FAISS vector search with cosine similarity
- **RAG Chat** — LLM answers grounded in your documents
- **Chat History** — persistent per-document conversation threads
- **JWT Auth** — access + refresh token rotation
- **Rate Limiting** — per-user request throttling

## Environment Variables

See `.env.example` in each sub-package.
