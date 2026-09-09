# Viva

**Retrieval-grounded resume intelligence + a voice AI interviewer briefed on your analysis.**

Viva scores a resume against a specific job description, then turns that resume into a
retrieval index you can interrogate: a grounded chat copilot that cites the exact
lines it's coaching from, and a spoken AI mock interview whose interviewer has read
your ATS analysis and probes the gaps it found.


🔗 **Live application:** https://column8.sudarshank.com/

---

## What it does

### 1. ATS match analysis
A weighted rubric (keyword match, experience alignment, demonstrated skills, ATS-safe
formatting) scores the resume against any pasted job description, with the exact
missing keywords, formatting problems, and rewrites for the weakest bullets.

### 2. Grounded Resume Copilot
Chat with your resume. Every question runs a **hybrid retrieval pipeline**:

```
embed query
  → hybrid search   (pgvector dense + Postgres BM25, fused with Reciprocal Rank Fusion)
  → LLM re-rank      (cross-encoder-style scoring of the top candidates)
  → Corrective RAG   (grade the set; if it's weak, rewrite the query and re-retrieve once)
  → answer, with the resume sections cited inline as [S1], [S2], ...
```

The model is instructed to answer only from the retrieved sections and the full
resume text, and to say "I don't see that" instead of inventing experience. The
same pipeline feeds the Versions "find relevant sections" tool and the voice
interviewer's brief.

### 3. Voice mock interview
A real-time spoken interview over LiveKit WebRTC. The interviewer is handed a
**structured brief** built server-side: the ATS match score, years of experience,
already-matched strengths, the JD gaps to press on, the recruiter summary, and the
resume sections most relevant to that job (retrieved with the pipeline above). The
persona runs a phased ~5-minute plan (warm-up → technical depth → behavioural →
rapid-fire → wrap), asks one pointed follow-up on any vague or metric-free answer,
ladders difficulty, and never asks filler questions. A post-session summary is
scored on a shared rubric and saved to your interview history.

### 4. Text mock interview
Typed Q&A with per-answer scoring and coaching on the same rubric. Also saved to
history.

### 5. Cover letters & version history
Role-specific cover letters mapped to the job description; every analysis and
interview saved so you can track score changes across iterations.

---

## Architecture & tech stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Auth & data** | Supabase (Postgres + Auth), `pgvector` |
| **Retrieval** | pgvector (HNSW) dense + Postgres FTS (BM25) → RRF, in `search_resume_chunks_hybrid` |
| **Embeddings** | `gemini-embedding-001`, Matryoshka-truncated to 768 dims; model tracked per row |
| **Re-rank / Corrective RAG** | `gemini-3.5-flash-lite`, structured JSON scoring, time-boxed with graceful fallback |
| **Resume analysis** | Google Gemini (`gemini-3.8-flash`) |
| **Text interview Q&A + grading** | Groq (Llama 3.3 70B) / voice summary on `gemini-3.8-flash` |
| **Voice interview** | LiveKit WebRTC + a Python worker (`python/agent.py`): Deepgram STT, Groq Llama 3.3, Deepgram Aura-2 TTS, Silero VAD |
| **Document parsing** | `pdf-parse` (magic-byte / page-cap guard + fallback) → `python-ingest/` FastAPI + docling with OCR & `ACCURATE` tables (preferred for analysis text *and* chunks when `STRUCTURAL_PARSE_URL` is set) → `gemini-3.8-flash` multimodal for low-confidence docs (`src/app/lib/pdf-vision.ts`) |
| **Payments** | one-time credit packs |
| **Rate limiting** | Upstash Redis |
| **Hosting** | Vercel |

### The retrieval pipeline in code

* `supabase/migrations/002_*.sql` - `embedding_model` column, FTS + HNSW indexes, and
  `search_resume_chunks_hybrid()` (dense + BM25 + RRF).
* `src/app/lib/embedding.ts` - `gemini-embedding-001` @ 768 dims, `RETRIEVAL_QUERY` /
  `RETRIEVAL_DOCUMENT` task types, retry with backoff.
* `src/app/lib/chunking.ts` - section-aware chunking with a `[Context: ...]` breadcrumb
  baked into each chunk; accepts docling structural chunks when available.
* `src/app/actions/upload-resume.ts` - the parse ladder: pdf-parse → docling
  (`structural-parse.ts`) → Gemini vision (`pdf-vision.ts`), then analysis + chunking.
* `src/app/lib/retrieval.ts` - `hybridSearch` → `rerankChunks` → Corrective RAG;
  every LLM step falls back to the previous stage on failure or timeout.
* `src/app/api/chat/route.ts` - the Resume Copilot; renders cited `[S#]` blocks.

### The voice interviewer in code

* `src/app/api/interview/get-token/route.ts` - builds the structured brief and mints
  the LiveKit token.
* `python/agent.py` - the interviewer persona (phased plan, follow-up rule,
  difficulty ladder, injection guard).
* `src/app/lib/interview-rubric.ts` - the single 4×25 rubric shared by every grader.
* `supabase/migrations/003_interviews.sql` + `/api/interview/{complete,history}` -
  durable interview history for voice and text.

---

## Running the pieces

The Next.js app and the LiveKit voice worker are required; the docling service is
optional but recommended - without it, parsing falls back to `pdf-parse` (plus a
Gemini-vision attempt only when that text is unreadable).

```bash
# Next.js app
npm run dev

# LiveKit voice worker (needs LIVEKIT_*, GROQ_API_KEY, DEEPGRAM_API_KEY)
cd python && python agent.py dev

# optional: structural parsing service (~1 GB docling models on first run)
cd python-ingest && pip install -e . && uvicorn app:app --port 8100
#   then set STRUCTURAL_PARSE_URL in the Next.js env
```

### Migrations

Apply in order in the Supabase SQL editor:

1. `supabase/migrations/001_resume_version_control.sql`
2. `supabase/migrations/002_hybrid_search_and_embedding_model.sql`
   - then run `node scripts/reembed-resume-chunks.mjs` once to re-embed existing chunks.
3. `supabase/migrations/003_interviews.sql`

---

## FinOps & abuse protection

Voice interviews are the most expensive request path: each session spins up a
LiveKit room, a Python worker, and a live STT/LLM/TTS pipeline. The
`/api/interview/get-token` route is guarded by an Upstash Redis sliding-window
limiter - **3 token requests per IP per 10 minutes** - checked before any auth/DB
calls, returning `HTTP 429` with `Retry-After` / `X-RateLimit-*` headers.

This sits on top of an app-wide limiter in `src/proxy.ts` (20 requests / 10s per
user or IP across all `/api/*` routes). Every retrieval LLM call (re-rank, CRAG) is
time-boxed and degrades to a cheaper path rather than retrying indefinitely.

---

## Source code notice

This repository contains the core architecture for a proprietary, closed-source
SaaS product. Local development and cloning instructions are intentionally omitted.

---
*Architected and developed by Sudarshan Kulkarni.*
