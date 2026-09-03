"""Photo assessment tests; provider access is always injected."""

from __future__ import annotations

from typing import Any

from worker.vision import assess_photo


def test_assess_photo_clamps_scores_without_discarding_the_photo() -> None:
    result = assess_photo(
        "https://example.invalid/photo.jpg",
        analyzer=lambda _: {
            "light_score": 1.8,
            "space_score": -0.4,
            "explanation": "Bright room",
        },
    )

    assert result is not None
    assert result.light_score == 1.0
    assert result.space_score == 0.0
    assert result.explanation == "Bright room"


def test_assess_photo_returns_no_enrichment_for_missing_image_or_provider_failure() -> (
    None
):
    assert assess_photo("", analyzer=lambda _: {"light_score": 0.5}) is None

    def fail(_: str) -> dict[str, Any]:
        raise RuntimeError("vision unavailable")

    assert assess_photo("https://example.invalid/photo.jpg", analyzer=fail) is None


def test_assess_photo_nulls_malformed_scores_but_keeps_explanation() -> None:
    result = assess_photo(
        "https://example.invalid/photo.jpg",
        analyzer=lambda _: {
            "light_score": "unknown",
            "space_score": float("nan"),
            "explanation": "Unclear view",
        },
    )

    assert result is not None
    assert result.light_score is None
    assert result.space_score is None
    assert result.explanation == "Unclear view"
