"""Turn a RawItem from any source into a canonical Listing, and flag missing facts.

This is the one piece of worker logic with real behavior in the skeleton, so the
completeness rule (which feeds the auto-verify path, PRD §5.4) is testable now.
"""

from __future__ import annotations

from worker.models import REQUIRED_FACTS, Listing, RawItem


def compute_missing_fields(listing: Listing) -> list[str]:
    """Return required facts that are absent — drives listings.missing_fields."""
    return [f for f in REQUIRED_FACTS if getattr(listing, f) in (None, "", [], {})]


def finalize(listing: Listing) -> Listing:
    """Fill missing_fields on an otherwise-normalized listing."""
    listing.missing_fields = compute_missing_fields(listing)
    return listing


def normalize(item: RawItem) -> Listing:
    """Map a source-specific RawItem to a Listing.

    TODO: per-source field extraction lives in each sources/*.py, which should
    return already-normalized Listings and call finalize(). This generic path
    just wraps an empty listing so unknown sources still flow through.
    """
    listing = Listing(source=item.source, source_ref=item.source_ref, raw=item.payload)
    return finalize(listing)
