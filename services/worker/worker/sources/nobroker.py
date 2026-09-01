"""NoBroker source — automated read-only scraping of public listing pages (PRD §8.1).

Risk posture: knowingly accepted for pilot scale (competitor-scraping angle).
Treated as descope-able to manual intake if fragile — see PRD §12.2. Public copy
must NEVER name NoBroker or mention scraping (PRD §10.3, AGENTS.md §7.3).
"""

from __future__ import annotations

from worker.models import RawItem

# Pilot corridor only (PRD §8.1): Koramangala–Indiranagar–Domlur.
CORRIDOR = "koramangala-indiranagar-domlur"


def fetch() -> list[RawItem]:
    """Scrape current corridor listings into RawItems.

    TODO: drive Playwright over the public corridor pages, extract listing
    fields into payload. Import playwright lazily. Return [] on failure so a
    fragile scraper never blocks the rest of the pipeline (PRD §12.2).
    """
    return []
