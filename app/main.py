"""FastAPI application entrypoint for JobMatch AI backend."""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import router as analysis_router
from app.core.exceptions import ApplicationError

app = FastAPI(title="JobMatch AI API", version="0.1.0")
frontend_directory = Path(__file__).resolve().parent.parent / "frontend"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.mount("/ui", StaticFiles(directory=frontend_directory, html=True), name="ui")


@app.get("/")
async def root() -> dict[str, str]:
    """Return basic API information for quick manual checks."""

    return {"name": "JobMatch AI API", "status": "ready"}


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    """Lightweight health endpoint for readiness checks."""

    return {"status": "ok"}


@app.exception_handler(ApplicationError)
async def application_error_handler(
    _: Request,
    exc: ApplicationError,
) -> JSONResponse:
    """Convert custom application errors to consistent JSON responses."""

    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    _: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Normalize FastAPI validation errors into a compact JSON payload."""

    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    _: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """Return a consistent structure for framework-level HTTP errors."""

    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
