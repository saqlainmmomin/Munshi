"""The worker's WRITE side of the contract (AGENTS.md §3).

Upserts listings + enrichment into shared Postgres. This is the ONLY way the
worker communicates with apps/web — no HTTP, no shared code.
"""

from __future__ import annotations

import os

from worker.models import Listing


def _dsn() -> str:
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL not set — copy services/worker/.env.example to .env")
    return dsn


def upsert_listing(listing: Listing) -> str:
    """Insert or update one listing (keyed on source + source_ref). Returns its id.

    TODO: open a psycopg connection to _dsn() and upsert into `listings`
    (ON CONFLICT (source, source_ref) DO UPDATE ... last_seen_at = now()).
    Import psycopg lazily inside this function.
    """
    _ = listing
    raise NotImplementedError("TODO: implement listings upsert against db/schema.sql.")
