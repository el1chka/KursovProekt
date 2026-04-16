"""Vercel ASGI handler that routes all requests to the FastAPI application."""

from app.main import app

# Vercel expects an ASGI app to be exported as 'app'
# The FastAPI app is already defined and properly configured
