"""Asynchronous client for Cloudflare Workers AI chat model calls."""

from typing import Any

import httpx

from app.core.exceptions import UpstreamServiceError
from app.core.config import Settings


class CloudflareAiClient:
    """Small API wrapper that sends prompts and extracts text responses."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def run_chat(self, messages: list[dict[str, str]]) -> str:
        """Send chat messages to Cloudflare AI and return raw model text."""

        url = (
            "https://api.cloudflare.com/client/v4/accounts/"
            f"{self._settings.cf_account_id}/ai/run/{self._settings.cf_model}"
        )
        headers = {
            "Authorization": f"Bearer {self._settings.cf_ai_api_key}",
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 700,
        }

        async with httpx.AsyncClient(timeout=self._settings.request_timeout_seconds) as client:
            response = await client.post(url, json=payload, headers=headers)

        if response.status_code >= 400:
            raise UpstreamServiceError(
                f"Cloudflare AI request failed with status {response.status_code}."
            )

        data = response.json()
        output = _extract_output_text(data)
        if not output:
            raise UpstreamServiceError("Cloudflare AI returned an empty response payload.")
        return output


def _extract_output_text(payload: dict[str, Any]) -> str:
    """Support multiple Cloudflare response shapes and return model output text."""

    result = payload.get("result", {}) if isinstance(payload, dict) else {}
    if isinstance(result, dict):
        if isinstance(result.get("response"), str):
            return result["response"]
        if isinstance(result.get("text"), str):
            return result["text"]

        choices = result.get("choices")
        if isinstance(choices, list) and choices:
            first = choices[0]
            if isinstance(first, dict):
                message = first.get("message", {})
                if isinstance(message, dict) and isinstance(message.get("content"), str):
                    return message["content"]
                if isinstance(first.get("text"), str):
                    return first["text"]

    return ""
