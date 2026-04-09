"""FastAPI application entrypoint for JobMatch AI backend."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import router as analysis_router
from app.core.exceptions import ApplicationError

app = FastAPI(title="JobMatch AI API", version="0.1.0")
app.include_router(analysis_router)


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
