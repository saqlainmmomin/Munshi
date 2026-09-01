"""X (Twitter) source — official paid API only (PRD §8.2). NEVER scrape X.

Polls ~20 curated Bengaluru broker/listing accounts a few times a day
(~$40–50 total for the pilot). The account list is a Week-1 data task
(PRD §13 open question #3).
"""

from __future__ import annotations

from worker.models import RawItem

# TODO: fill from the curated account list (PRD §13 Q3).
BROKER_ACCOUNTS: list[str] = []


def fetch() -> list[RawItem]:
    """Pull recent posts from tracked accounts via the official API into RawItems.

    TODO: httpx GET the X API with X_BEARER_TOKEN; keep listing-like posts;
    map to payload. Import httpx lazily.
    """
    return []
