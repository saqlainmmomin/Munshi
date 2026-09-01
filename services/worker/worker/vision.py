"""Photo light/spaciousness assessment (PRD §7, §11).

Produces scores (0..1) + a short explanation per photo. These RANK and EXPLAIN
listings; they must NEVER auto-discard one (PRD §11). Scores go to
listing_photos.{light_score, space_score}.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PhotoAssessment:
    light_score: float  # 0..1
    space_score: float  # 0..1
    explanation: str


def assess_photo(image_url: str) -> PhotoAssessment:
    """Assess a single photo with the Anthropic vision model.

    TODO: fetch the image and call the Anthropic Python SDK. Import the SDK
    lazily inside this function so importing the module stays dependency-light.
    """
    raise NotImplementedError("TODO: implement photo assessment (PRD §11). Never auto-discard.")
