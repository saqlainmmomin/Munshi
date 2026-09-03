"""Precompute commute per (listing, anchor) → listing_commutes (PRD §5.1, §13 Q2).

Commute RANKS, it never excludes — so a coarse distance-band fallback is an
acceptable stand-in if the maps provider is a cost/quota concern (PRD §13).
"""

from __future__ import annotations


def peak_minutes(
    origin: dict[str, float],  # listing location {lat, lng}
    anchor: dict[str, float],  # commute anchor {lat, lng}
    mode: str,  # commute_mode enum value
) -> int | None:
    """Weekday-peak travel time in minutes, or None if unknown.

    TODO: call the maps/routing provider (MAPS_API_KEY). Fallback: haversine
    distance → coarse band. Import any HTTP client lazily.
    """
    _ = (origin, anchor, mode)
    raise NotImplementedError(
        "TODO: implement commute (PRD §5.1). Fallback = distance band."
    )
