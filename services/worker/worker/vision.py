"""Photo light/spaciousness assessment (PRD §7, §11).

Scores help rank and explain listings; no result from this module can discard a
listing. Provider and image failures return ``None`` so ingestion can continue.
"""

from __future__ import annotations

import base64
import math
import mimetypes
import os
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Any

VisionAnalyzer = Callable[[str], Mapping[str, Any]]

VISION_TOOL: dict[str, Any] = {
    "name": "assess_listing_photo",
    "description": "Score visible natural light and spaciousness only; do not infer other listing facts.",
    "input_schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "light_score": {"type": ["number", "null"]},
            "space_score": {"type": ["number", "null"]},
            "explanation": {"type": ["string", "null"]},
        },
        "required": ["light_score", "space_score", "explanation"],
    },
}


@dataclass
class PhotoAssessment:
    light_score: float | None  # 0..1, or None when unavailable
    space_score: float | None  # 0..1, or None when unavailable
    explanation: str | None


def _download_image(image_url: str) -> tuple[str, str]:
    import httpx

    response = httpx.get(image_url, timeout=10.0, follow_redirects=True)
    response.raise_for_status()
    content_type = response.headers.get("content-type", "").split(";", 1)[0].strip()
    media_type = content_type if content_type.startswith("image/") else None
    if media_type is None:
        media_type = mimetypes.guess_type(image_url)[0] or "image/jpeg"
    return media_type, base64.b64encode(response.content).decode("ascii")


def _analyze_with_anthropic(image_url: str) -> Mapping[str, Any]:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {}

    import anthropic

    media_type, encoded_image = _download_image(image_url)
    client = anthropic.Anthropic()
    response = client.messages.create(  # type: ignore
        model=os.environ.get("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022"),
        max_tokens=500,
        system=(
            "Assess only the visible natural light and spaciousness of this apartment photo. "
            "Do not infer rent, availability, furnishing, tenancy, or any other hard fact. "
            "Return bounded scores or null when the image is unclear, plus a short explanation."
        ),
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": encoded_image,
                        },
                    },
                    {
                        "type": "text",
                        "text": "Assess this photo for review-card ranking and explanation.",
                    },
                ],
            }
        ],
        tools=[VISION_TOOL],
        tool_choice={"type": "tool", "name": "assess_listing_photo"},
    )
    for block in response.content:
        if getattr(block, "type", None) == "tool_use":
            value = getattr(block, "input", None)
            return value if isinstance(value, Mapping) else {}
    return {}


def _score(value: Any) -> float | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        score = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(score):
        return None
    return min(1.0, max(0.0, score))


def assess_photo(
    image_url: str, analyzer: VisionAnalyzer | None = None
) -> PhotoAssessment | None:
    """Assess one image through an injectable provider seam.

    Invalid scores are clamped into the database contract's range. A provider
    failure or missing image yields no enrichment, never a rejected listing.
    """
    if not isinstance(image_url, str) or not image_url.strip():
        return None
    try:
        result = (analyzer or _analyze_with_anthropic)(image_url.strip())
    except Exception:  # noqa: BLE001 - image/provider failures are best-effort
        return None
    if not isinstance(result, Mapping):
        return None

    explanation_value = result.get("explanation")
    explanation = (
        explanation_value.strip()[:500] if isinstance(explanation_value, str) else None
    )
    light_score = _score(result.get("light_score"))
    space_score = _score(result.get("space_score"))
    if light_score is None and space_score is None and not explanation:
        return None
    return PhotoAssessment(light_score, space_score, explanation)
