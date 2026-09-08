# python-ingest - structural resume parsing (optional)

A small FastAPI service that parses a resume PDF/DOCX with
[docling](https://github.com/DS4SD/docling) and returns **structural chunks**:
section-heading paths, tables rendered as Markdown, page numbers, and a
per-chunk quality/confidence score.

The main app uses `pdf-parse` (a flat text extractor) by default. That is fine
for the ATS analysis, but it produces mediocre *retrieval* chunks - no headings,
no table structure, brittle whitespace heuristics. This service replaces the chunking input
with something docling-quality, which lifts every downstream retrieval step
(Resume Copilot, Versions, the voice-interview brief).

## It's opt-in

Nothing changes until you run this service **and** set `STRUCTURAL_PARSE_URL`
in the Next.js environment. When it's unset, unreachable, or errors, the upload
path silently falls back to the existing text-only chunker. It also never
touches the synchronous upload/analysis path - it runs in the post-response
background task that already does chunking + the "analysis ready" email.

## Cost / weight

docling downloads layout + OCR models on first run (~700 MB-1.5 GB) and a
cold parse of a 2-page PDF is a few seconds. Warm parses are ~1-2 s. This is
why it's a separate service, not an inline dependency.

## Run

```bash
cd python-ingest
python -m venv .venv && . .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -e .
uvicorn app:app --port 8100
# first request will download models
```

## Enable in the Next.js app

Add to `.env.local` (and your deploy env):

```
STRUCTURAL_PARSE_URL=http://localhost:8100
STRUCTURAL_PARSE_TOKEN=<optional shared secret, must match this service's env>
```

New uploads then chunk from docling output. To re-chunk existing resumes you'd
need the original file (the app currently stores extracted text only), so this
improves resumes going forward.

## A/B before committing to the infra

1. Upload the same resume with the service off, then on.
2. Compare `resume_chunks` rows (`metadata.header`, `metadata.is_table`,
   `metadata.confidence`, chunk boundaries).
3. Ask the Resume Copilot a pointed question both ways and compare the cited
   `[S#]` sections.

## Endpoints

- `GET /health` → `{ "ok": true }`
- `POST /parse` (multipart `file`) → `{ chunks: [{text, headers, is_table, page_number, confidence}], markdown, page_count, source_confidence }`
  - `X-Parse-Token` header required iff `STRUCTURAL_PARSE_TOKEN` is set here.
