"""Worker entrypoint — runs the pipeline a few times a day (PRD §8, §5.2).

    python -m worker.schedule            # one pass now
    python -m worker.schedule --loop     # run on an interval (TODO)

Pipeline: collect from every source -> normalize -> dedupe -> enrich -> upsert.
"""

from __future__ import annotations

from worker import db, dedupe, normalize
from worker.models import Listing, RawItem
from worker.sources import intake, nobroker, x_api


def collect() -> list[RawItem]:
    """Gather raw items from all sources for this pass."""
    items: list[RawItem] = []
    items += nobroker.fetch()   # PRD §8.1 (scraping accepted for pilot)
    items += x_api.fetch()      # PRD §8.2 (official API only)
    items += intake.fetch()     # PRD §8.3–8.4 (self-submitted + manual FB)
    return items


def run_once() -> int:
    """Run one full pass. Returns the number of listings upserted."""
    seen: list[Listing] = []
    count = 0
    for item in collect():
        listing = normalize.normalize(item)
        if dedupe.find_duplicate(listing, seen) is not None:
            continue
        # TODO: enrich with vision + commute before/after upsert.
        db.upsert_listing(listing)
        seen.append(listing)
        count += 1
    return count


if __name__ == "__main__":
    print(f"upserted {run_once()} listings")
