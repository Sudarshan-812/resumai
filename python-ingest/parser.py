"""StructuralDocumentParser - docling-backed PDF/DOCX parsing for resumes.

Adapted from Cortex's parser. Each returned chunk carries:
  * `headers`  - its section-heading path (e.g. ["EXPERIENCE"])
  * `text`     - the body only (NO breadcrumb prefix; the Next side adds one)
  * `is_table` - true when `text` is a clean Markdown table
  * `page_number`
  * `confidence` in [0, 1] from docling's quality report
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path
from typing import Final

logger = logging.getLogger("viva.ingest.parser")

SUPPORTED_EXTENSIONS: Final[frozenset[str]] = frozenset({".pdf", ".docx"})

_GRADE_TO_SCORE: Final[dict[str, float]] = {
    "excellent": 0.95, "good": 0.85, "fair": 0.60, "poor": 0.30, "unspecified": 0.50,
}
_DEFAULT_CONFIDENCE: Final[float] = 0.80

MAX_CHUNK_CHARS = 1_800
MIN_MERGE_CHARS = 220


class DocumentParseError(RuntimeError):
    """docling failed to convert the source."""


class UnsupportedFormatError(ValueError):
    """Extension outside SUPPORTED_EXTENSIONS."""


@dataclass(slots=True)
class Chunk:
    text: str
    headers: list[str] = field(default_factory=list)
    is_table: bool = False
    page_number: int | None = None
    confidence: float = _DEFAULT_CONFIDENCE

    def as_dict(self) -> dict:
        return {
            "text": self.text,
            "headers": self.headers,
            "is_table": self.is_table,
            "page_number": self.page_number,
            "confidence": round(self.confidence, 4),
        }


@dataclass(slots=True)
class ParsedDocument:
    chunks: list[Chunk]
    markdown: str
    page_count: int
    source_confidence: float


class StructuralDocumentParser:
    def __init__(self) -> None:
        self._converter = None  # lazy: docling import + model warmup is heavy

    # ---- public API --------------------------------------------------

    def parse_document(self, data: bytes, *, filename: str) -> ParsedDocument:
        ext = Path(filename).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise UnsupportedFormatError(f"{ext!r} not in {sorted(SUPPORTED_EXTENSIONS)}")

        result = self._convert(data, ext, filename)
        doc = result.document

        markdown = _safe(lambda: doc.export_to_markdown(), "")
        page_count = _safe(lambda: doc.num_pages(), 0) or _pages_from_result(result)
        doc_conf, page_conf = _confidence_table(result)

        chunks = self._build_chunks(result, doc_conf, page_conf)
        logger.info("parsed %s: %d chunks, %d pages, conf=%.2f",
                    filename, len(chunks), page_count, doc_conf)
        return ParsedDocument(chunks, markdown, page_count, doc_conf)

    # ---- docling plumbing ------------------------------------------

    def _get_converter(self):
        if self._converter is not None:
            return self._converter
        try:
            from docling.datamodel.base_models import InputFormat
            from docling.datamodel.pipeline_options import (
                PdfPipelineOptions,
                TableFormerMode,
            )
            from docling.document_converter import DocumentConverter, PdfFormatOption
        except Exception as exc:  # noqa: BLE001
            raise DocumentParseError("docling not installed. `pip install docling`.") from exc

        # Resumes lean on layout the default (fast) pipeline mangles: two-column
        # bodies, skills/experience in tables, and the occasional scanned export.
        opts = PdfPipelineOptions()
        opts.do_ocr = True  # pick up scanned / image-only resumes
        opts.do_table_structure = True
        opts.table_structure_options.mode = TableFormerMode.ACCURATE
        opts.table_structure_options.do_cell_matching = True
        # Digital PDFs: OCR only the bitmap regions, don't re-OCR text we have.
        try:
            opts.ocr_options.force_full_page_ocr = False
        except Exception:  # noqa: BLE001 - older docling without this knob
            pass

        self._converter = DocumentConverter(
            allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=opts),
            },
        )
        return self._converter

    def _convert(self, data: bytes, ext: str, filename: str):
        from docling.datamodel.base_models import DocumentStream

        try:
            return self._get_converter().convert(
                DocumentStream(name=filename or f"upload{ext}", stream=BytesIO(data))
            )
        except Exception as exc:  # noqa: BLE001
            raise DocumentParseError(f"docling failed on {filename!r}: {exc}") from exc

    # ---- chunking -------------------------------------------------

    def _build_chunks(self, result, doc_conf, page_conf) -> list[Chunk]:
        try:
            from docling_core.transforms.chunker.hierarchical_chunker import HierarchicalChunker
        except Exception:  # noqa: BLE001
            HierarchicalChunker = None  # type: ignore
        if HierarchicalChunker is not None:
            try:
                return self._chunks_via_docling(result, HierarchicalChunker(), doc_conf, page_conf)
            except Exception as exc:  # noqa: BLE001
                logger.warning("docling chunker failed (%s); using item walk", exc)
        return self._chunks_via_item_walk(result, doc_conf, page_conf)

    def _chunks_via_docling(self, result, chunker, doc_conf, page_conf) -> list[Chunk]:
        doc = result.document
        out: list[Chunk] = []
        for ck in chunker.chunk(doc):
            meta = ck.meta
            headings = [h for h in (getattr(meta, "headings", None) or []) if h]
            items = list(getattr(meta, "doc_items", []) or [])
            is_table = any(_is_table_item(it) for it in items)
            page_no = _first_page(items)
            body = (_table_markdown(doc, items) or ck.text) if is_table else ck.text
            if not body.strip():
                continue
            out.append(Chunk(
                text=body.strip(),
                headers=headings,
                is_table=is_table,
                page_number=page_no,
                confidence=_chunk_confidence(doc_conf, page_conf, page_no, is_table, items),
            ))
        return _merge_small(out)

    def _chunks_via_item_walk(self, result, doc_conf, page_conf) -> list[Chunk]:
        doc = result.document
        header_stack: list[tuple[int, str]] = []
        buf: list[str] = []
        buf_page: int | None = None
        out: list[Chunk] = []

        def flush() -> None:
            nonlocal buf, buf_page
            body = "\n".join(b for b in buf if b.strip())
            if body.strip():
                out.append(Chunk(
                    text=body.strip(),
                    headers=[h for _, h in header_stack],
                    page_number=buf_page,
                    confidence=_chunk_confidence(doc_conf, page_conf, buf_page, False, []),
                ))
            buf, buf_page = [], None

        for item, level in doc.iterate_items():
            page_no = _first_page([item])
            text = (getattr(item, "text", "") or "").strip()

            if _is_heading_item(item):
                flush()
                while header_stack and header_stack[-1][0] >= level:
                    header_stack.pop()
                if text:
                    header_stack.append((level, text))
                continue

            if _is_table_item(item):
                flush()
                md = _table_markdown(doc, [item]) or text
                if md.strip():
                    out.append(Chunk(
                        text=md.strip(),
                        headers=[h for _, h in header_stack],
                        is_table=True,
                        page_number=page_no,
                        confidence=_chunk_confidence(doc_conf, page_conf, page_no, True, [item]),
                    ))
                continue

            if not text:
                continue
            if buf_page is None:
                buf_page = page_no
            buf.append(text)
            if sum(len(b) for b in buf) >= MAX_CHUNK_CHARS:
                flush()
        flush()
        return _merge_small(out)


# ---- module helpers ------------------------------------------------


def _is_table_item(it) -> bool:
    lbl = getattr(it, "label", None)
    return str(getattr(lbl, "value", lbl)).lower() == "table"


def _is_heading_item(it) -> bool:
    lbl = getattr(it, "label", None)
    return str(getattr(lbl, "value", lbl)).lower() in {"section_header", "title", "subtitle"}


def _table_markdown(doc, items) -> str:
    for it in items:
        exporter = getattr(it, "export_to_markdown", None)
        if exporter is None:
            continue
        for call in (lambda: exporter(doc), lambda: exporter()):
            try:
                md = call()
                if md and md.strip():
                    return md
            except TypeError:
                continue
            except Exception:  # noqa: BLE001
                return ""
    return ""


def _first_page(items) -> int | None:
    for it in items:
        for prov in getattr(it, "prov", None) or []:
            pno = getattr(prov, "page_no", None)
            if isinstance(pno, int) and pno >= 1:
                return pno
    return None


def _confidence_table(result) -> tuple[float, dict[int, float]]:
    rep = getattr(result, "confidence", None)
    if rep is None:
        return _DEFAULT_CONFIDENCE, {}
    doc_score = _grade_to_score(getattr(rep, "mean_grade", None)) or _DEFAULT_CONFIDENCE
    pages: dict[int, float] = {}
    for pno, pinfo in (getattr(rep, "pages", None) or {}).items():
        s = _grade_to_score(getattr(pinfo, "mean_grade", None))
        if s is not None:
            pages[int(pno)] = s
    return doc_score, pages


def _grade_to_score(grade) -> float | None:
    if grade is None:
        return None
    return _GRADE_TO_SCORE.get(str(getattr(grade, "value", grade)).lower())


def _chunk_confidence(doc_conf, page_conf, page_no, is_table, items) -> float:
    base = page_conf.get(page_no, doc_conf) if page_no is not None else doc_conf
    if is_table:
        gridded = any(
            getattr(getattr(it, "data", None), "num_rows", 0)
            and getattr(getattr(it, "data", None), "num_cols", 0)
            for it in items
        )
        base *= 1.0 if gridded else 0.85
    return round(max(0.0, min(1.0, base)), 4)


def _merge_small(chunks: list[Chunk]) -> list[Chunk]:
    merged: list[Chunk] = []
    for ck in chunks:
        prev = merged[-1] if merged else None
        if (
            prev
            and not ck.is_table
            and not prev.is_table
            and prev.headers == ck.headers
            and len(prev.text) < MIN_MERGE_CHARS
            and len(prev.text) + len(ck.text) <= MAX_CHUNK_CHARS
        ):
            merged[-1] = Chunk(
                text=f"{prev.text}\n{ck.text}".strip(),
                headers=prev.headers,
                page_number=prev.page_number,
                confidence=min(prev.confidence, ck.confidence),
            )
        else:
            merged.append(ck)
    return merged


def _pages_from_result(result) -> int:
    pages = getattr(result, "pages", None)
    return len(pages) if pages else 0


def _safe(fn, default):
    try:
        return fn()
    except Exception:  # noqa: BLE001
        return default
