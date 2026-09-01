"""Cross-channel dedupe (PRD §8.5).

The same physical flat is often posted on multiple channels. Detect duplicates
and point the duplicate row at a canonical one (listings.duplicate_of).
"""

from __future__ import annotations

from worker.models import Listing


def find_duplicate(listing: Listing, existing: list[Listing]) -> Listing | None:
    """Return an existing listing judged to be the same flat, or None.

    TODO: match on location proximity + rent + bhk + fuzzy title/photos. Skeleton
    returns None (treat everything as new).
    """
    _ = (listing, existing)
    return None
