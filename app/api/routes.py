"""HTTP routes for CV and job description analysis operations."""

from fastapi import APIRouter, File, Form, UploadFile

from app.core.exceptions import ValidationError
from app.schemas.analysis import AnalysisResult
from app.services.analysis_service import analyze_candidate
from app.services.cv_session_store import consume_cv_session, create_cv_session
from app.services.file_parser import parse_cv_file

router = APIRouter(prefix="/api/v1", tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(cv_file: UploadFile = File(...), jd_text: str = Form(...)) -> AnalysisResult:
    """Process uploaded CV and job description, then return fit analysis."""

    cv_text = await parse_cv_file(cv_file)
    return await analyze_candidate(cv_text=cv_text, jd_text=jd_text)


@router.post("/cv-sessions")
async def create_cv_upload_session(cv_file: UploadFile = File(...)) -> dict[str, str]:
    """Store a parsed CV temporarily so the next screen can reuse it."""

    cv_text = await parse_cv_file(cv_file)
    session = create_cv_session(cv_text=cv_text, file_name=cv_file.filename or "cv")
    return {"session_token": session.session_token, "file_name": session.file_name}


@router.post("/analyze-session", response_model=AnalysisResult)
async def analyze_session(
    cv_session_token: str = Form(...),
    jd_text: str = Form(...),
) -> AnalysisResult:
    """Analyze a previously uploaded CV session against a pasted job description."""

    if not cv_session_token.strip():
        raise ValidationError("A CV session token is required before analysis.")

    session = consume_cv_session(cv_session_token.strip())
    return await analyze_candidate(cv_text=session.cv_text, jd_text=jd_text)
