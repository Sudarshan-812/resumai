# python-ingest - structural resume parsing (optional)

A small FastAPI service that parses a resume PDF/DOCX with
[docling](https://github.com/DS4SD/docling) and returns **structural chunks**:
section-heading paths, tables rendered as Markdown, page numbers, and a
per-chunk quality/confidence score.

The main app falls back to `pdf-parse` (a flat text extractor). That works, but
it produces mediocre text and mediocre *retrieval* chunks - no headings, no
table structure, brittle whitespace heuristics, and nothing for scanned PDFs.
When this service is configured the upload path prefers its output for **both**
the ATS analysis text and the retrieval chunks, which lifts every downstream
step (Resume Copilot, Versions, the voice-interview brief).

The pipeline runs OCR (scanned / image resumes) and TableFormer in `ACCURATE`
mode (skills / experience tables) - see `parser.py::_get_converter`.

## It's opt-in

Nothing changes until you run this service **and** set `STRUCTURAL_PARSE_URL`
in the Next.js environment. When it's unset, unreachable, or errors, the upload
path silently falls back to `pdf-parse` text + the text-only chunker.

When it *is* configured it runs on the synchronous upload path (before the
Gemini analysis), so keep it warm - the FastAPI `startup` hook pre-loads the
models, and `upload-resume.ts` sets `maxDuration = 60`. If docling grades a
document poorly (`source_confidence < 0.6`) the app makes one more attempt with
Gemini multimodal (`src/app/lib/pdf-vision.ts`) before settling.

## Cost / weight

docling downloads layout + OCR models on first run (~700 MB-1.5 GB). With OCR +
accurate tables a cold parse of a 2-page PDF is several seconds; warm parses are
~2-4 s. Run it as an always-warm service (not scale-to-zero), not an inline
dependency.

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

New uploads then take their text and chunks from docling output. To re-process
existing resumes you'd need the original file (the app stores extracted text
only), so this improves resumes going forward.

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
