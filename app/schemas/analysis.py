"""Response models for candidate evaluation results."""

from typing import List

from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    """Normalized output returned by the API for frontend rendering."""

    score: float = Field(ge=0, le=10)
    strong_points: List[str] = Field(default_factory=list)
    weak_points: List[str] = Field(default_factory=list)
