"""Parse potentially noisy LLM output and recover the first valid JSON object."""

import json

from app.core.exceptions import ParsingError


def parse_json_object(raw_text: str) -> dict:
    """Extract and decode the first JSON object from model output text."""

    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = _strip_markdown_fence(cleaned)

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ParsingError("Model response did not contain a JSON object.")

    json_segment = cleaned[start : end + 1]
    try:
        parsed = json.loads(json_segment)
    except json.JSONDecodeError as exc:
        raise ParsingError("Model response contained invalid JSON.") from exc

    if not isinstance(parsed, dict):
        raise ParsingError("Model response JSON root must be an object.")
    return parsed


def _strip_markdown_fence(text: str) -> str:
    """Remove leading and trailing markdown code fences if present."""

    lines = text.splitlines()
    if len(lines) >= 3 and lines[0].startswith("```") and lines[-1].startswith("```"):
        return "\n".join(lines[1:-1]).strip()
    return text
