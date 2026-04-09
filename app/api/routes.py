"""HTTP routes for CV and job description analysis operations."""

from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.analysis import AnalysisResult
from app.services.analysis_service import analyze_candidate
from app.services.file_parser import parse_cv_file

router = APIRouter(prefix="/api/v1", tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(cv_file: UploadFile = File(...), jd_text: str = Form(...)) -> AnalysisResult:
    """Process uploaded CV and job description, then return fit analysis."""

    cv_text = await parse_cv_file(cv_file)
    return await analyze_candidate(cv_text=cv_text, jd_text=jd_text)
