"""Orchestrate validation, prompt construction, AI call, and output normalization."""

import re

from app.core.config import get_settings
from app.core.exceptions import ParsingError, ValidationError
from app.schemas.analysis import AnalysisResult
from app.services.cloudflare_client import CloudflareAiClient
from app.services.prompt_builder import build_analysis_messages
from app.utils.json_parser import parse_json_object

MIN_JD_LENGTH = 50
URL_START_PATTERN = re.compile(r"^\s*https?://", re.IGNORECASE)


async def analyze_candidate(cv_text: str, jd_text: str) -> AnalysisResult:
    """Score candidate fit based on CV and job description texts."""

    normalized_jd = jd_text.strip()
    _validate_job_description(normalized_jd)

    messages = build_analysis_messages(cv_text=cv_text, jd_text=normalized_jd)
    client = CloudflareAiClient(settings=get_settings())
    raw_output = await client.run_chat(messages=messages)

    parsed = parse_json_object(raw_output)
    return _normalize_result(parsed)


def _validate_job_description(jd_text: str) -> None:
    """Apply minimum length and anti-URL business rules."""

    if len(jd_text) < MIN_JD_LENGTH:
        raise ValidationError("Job description must contain at least 50 characters.")
    if URL_START_PATTERN.match(jd_text):
        raise ValidationError("Job description must be pasted text, not a URL.")


def _normalize_result(parsed: dict) -> AnalysisResult:
    """Validate model output shape and coerce values into API schema."""

    try:
        score = float(parsed["score"])
        strong_points = [str(item).strip() for item in parsed["strong_points"]]
        weak_points = [str(item).strip() for item in parsed["weak_points"]]
    except (KeyError, TypeError, ValueError) as exc:
        raise ParsingError("Model output JSON does not match required schema.") from exc

    strong_points = [item for item in strong_points if item]
    weak_points = [item for item in weak_points if item]
    return AnalysisResult(score=score, strong_points=strong_points, weak_points=weak_points)
