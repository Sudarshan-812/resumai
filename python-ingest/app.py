"""Viva structural ingest service.

A tiny FastAPI wrapper around docling. The Next.js upload path POSTs the raw
resume file here (best-effort, in a background task) and gets back structural
chunks - section headings, tables as Markdown, per-chunk confidence - which
produce far better retrieval chunks than the plain pdf-parse text extractor.

Enable it by setting STRUCTURAL_PARSE_URL (and, if set here, STRUCTURAL_PARSE_TOKEN)
in the Next.js environment. If it's unset or this service is down, the app falls
back to the existing text-only chunker with no behaviour change.

Run:
  cd python-ingest
  pip install -e .
  uvicorn app:app --port 8100
"""
from __future__ import annotations

import asyncio
import logging
import os

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from parser import (
    DocumentParseError,
    StructuralDocumentParser,
    UnsupportedFormatError,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("viva.ingest")

MAX_BYTES = 8 * 1024 * 1024
PARSE_TOKEN = os.getenv("STRUCTURAL_PARSE_TOKEN", "")

app = FastAPI(title="viva-ingest", version="0.1.0")
_parser = StructuralDocumentParser()


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


@app.post("/parse")
async def parse(request: Request, file: UploadFile = File(...)) -> JSONResponse:
    if PARSE_TOKEN and request.headers.get("x-parse-token") != PARSE_TOKEN:
        raise HTTPException(status_code=401, detail="bad or missing X-Parse-Token")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="file too large")

    filename = file.filename or "upload.pdf"
    try:
        parsed = await asyncio.to_thread(_parser.parse_document, data, filename=filename)
    except UnsupportedFormatError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except DocumentParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return JSONResponse(
        {
            "chunks": [c.as_dict() for c in parsed.chunks],
            "markdown": parsed.markdown,
            "page_count": parsed.page_count,
            "source_confidence": parsed.source_confidence,
        }
    )
