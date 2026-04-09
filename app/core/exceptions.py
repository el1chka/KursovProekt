"""Custom exceptions used to return consistent API errors."""


class ApplicationError(Exception):
    """Base exception carrying an HTTP status code and readable message."""

    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ValidationError(ApplicationError):
    """Raised when user input is invalid for business constraints."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=400)


class ParsingError(ApplicationError):
    """Raised when CV or model output cannot be parsed correctly."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=422)


class UpstreamServiceError(ApplicationError):
    """Raised when Cloudflare AI calls fail."""

    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message=message, status_code=status_code)


class SessionNotFoundError(ApplicationError):
    """Raised when a temporary CV session token cannot be resolved."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=404)
