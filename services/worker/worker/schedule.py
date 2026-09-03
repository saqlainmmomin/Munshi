"""Worker entrypoint — runs the pipeline a few times a day (PRD §8, §5.2).

    python -m worker.schedule            # one pass now
    python -m worker.schedule --loop     # run on an interval (TODO)

Pipeline: collect from every source -> normalize -> dedupe -> enrich -> upsert.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from worker import db, dedupe, normalize, vision
from worker.models import Listing, RawItem
from worker.sources import intake, nobroker, x_api


def _safe_fetch(fetcher: Callable[[], list[RawItem]]) -> list[RawItem]:
    """Keep one source outage from preventing the other sources from running."""
    try:
        return fetcher()
    except Exception:  # noqa: BLE001 - source failures are isolated per scheduled pass
        return []


def collect() -> list[RawItem]:
    """Gather raw items from all sources for this pass."""
    items: list[RawItem] = []
    items += _safe_fetch(nobroker.fetch)  # PRD §8.1 (scraping accepted for pilot)
    items += _safe_fetch(x_api.fetch)  # PRD §8.2 (official API only)
    items += _safe_fetch(intake.fetch)  # PRD §8.3–8.4 (self-submitted + manual FB)
    return items


def _normalize_item(item: RawItem) -> Listing | None:
    try:
        return normalize.normalize(item)
    except Exception:  # noqa: BLE001 - one malformed source item cannot stop the batch
        return None


def _enrich_photo(photo: Any) -> None:
    try:
        assessment = vision.assess_photo(photo.url)
    except Exception:  # noqa: BLE001 - enrichment is isolated from ingestion
        return
    if assessment is None:
        return
    photo.light_score = assessment.light_score
    photo.space_score = assessment.space_score
    photo.assessment = assessment.explanation


def run_once() -> int:
    """Run one full pass. Returns the number of listings upserted."""
    seen: list[Listing] = []
    count = 0
    for item in collect():
        # A malformed submission is isolated to its own item. Normalization
        # usually degrades to missing fields, but this guard also protects the
        # batch from an unexpected source-specific mapper failure.
        listing = _normalize_item(item)
        if listing is None:
            continue
        if dedupe.find_duplicate(listing, seen) is not None:
            continue
        for photo in listing.photos:
            _enrich_photo(photo)
        db.upsert_listing(listing)
        seen.append(listing)
        count += 1
    return count


if __name__ == "__main__":
    print(f"upserted {run_once()} listings")
