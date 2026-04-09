"""In-memory storage for temporary CV sessions between frontend steps."""

from dataclasses import dataclass
from time import time
from uuid import uuid4

from app.core.config import get_settings
from app.core.exceptions import SessionNotFoundError


@dataclass(slots=True)
class CvSession:
    """Persist extracted CV text and metadata for a short-lived workflow."""

    session_token: str
    cv_text: str
    file_name: str
    created_at: float


_CV_SESSIONS: dict[str, CvSession] = {}


def create_cv_session(cv_text: str, file_name: str) -> CvSession:
    """Create a new temporary session for an uploaded CV."""

    cleanup_expired_sessions()

    session = CvSession(
        session_token=str(uuid4()),
        cv_text=cv_text,
        file_name=file_name,
        created_at=time(),
    )
    _CV_SESSIONS[session.session_token] = session
    return session


def get_cv_session(session_token: str) -> CvSession:
    """Return a stored CV session or raise a not-found error."""

    cleanup_expired_sessions()

    session = _CV_SESSIONS.get(session_token)
    if session is None:
        raise SessionNotFoundError("The CV upload session is missing or has expired.")
    return session


def consume_cv_session(session_token: str) -> CvSession:
    """Return and remove a stored CV session in one step."""

    session = get_cv_session(session_token)
    _CV_SESSIONS.pop(session_token, None)
    return session


def cleanup_expired_sessions() -> None:
    """Remove sessions older than the configured maximum lifetime."""

    settings = get_settings()
    max_age_seconds = settings.cv_session_ttl_minutes * 60
    now = time()

    expired_tokens = [
        token
        for token, session in _CV_SESSIONS.items()
        if now - session.created_at > max_age_seconds
    ]
    for token in expired_tokens:
        _CV_SESSIONS.pop(token, None)