"""Extract plain text from uploaded CV files in PDF or DOCX format."""

from io import BytesIO
from pathlib import Path

from docx import Document
from fastapi import UploadFile
from PyPDF2 import PdfReader

from app.core.config import get_settings
from app.core.exceptions import ParsingError, ValidationError

SUPPORTED_SUFFIXES = {".pdf", ".docx"}


async def parse_cv_file(upload: UploadFile) -> str:
    """Validate file type and extract text content from an uploaded CV."""

    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in SUPPORTED_SUFFIXES:
        raise ValidationError("Only .pdf and .docx CV files are supported.")

    file_bytes = await upload.read()
    if not file_bytes:
        raise ValidationError("Uploaded CV file is empty.")

    _validate_file_size(file_bytes)

    if suffix == ".pdf":
        text = _extract_pdf_text(file_bytes)
    else:
        text = _extract_docx_text(file_bytes)

    cleaned_text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not cleaned_text:
        raise ParsingError("Could not extract readable text from the uploaded CV.")
    return cleaned_text


def _extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from each page of a PDF file."""

    try:
        reader = PdfReader(BytesIO(file_bytes))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception as exc:
        raise ParsingError("Failed to parse PDF file.") from exc


def _extract_docx_text(file_bytes: bytes) -> str:
    """Extract text from paragraph blocks inside a DOCX file."""

    try:
        document = Document(BytesIO(file_bytes))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    except Exception as exc:
        raise ParsingError("Failed to parse DOCX file.") from exc


def _validate_file_size(file_bytes: bytes) -> None:
    """Reject CV uploads that exceed the configured maximum size."""

    settings = get_settings()
    max_bytes = settings.max_cv_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise ValidationError(
            f"Uploaded CV file exceeds the {settings.max_cv_file_size_mb} MB limit."
        )
