"""The worker's WRITE side of the contract (AGENTS.md §3).

Upserts listings + enrichment into shared Postgres. This is the ONLY way the
worker communicates with apps/web — no HTTP, no shared code.
"""

from __future__ import annotations

import os
from collections.abc import Callable
from typing import Any

from worker.models import Listing

ConnectionFactory = Callable[[], Any]

LISTING_UPSERT_SQL = """INSERT INTO listings (
    source, source_ref, title, rent, deposit, bhk, furnishing, location,
    available_from, availability_text, description, amenities, maintenance_details,
    brokerage_applicable, claims, extraction_meta, raw, missing_fields,
    restricted_attrs, poster_contact
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
ON CONFLICT (source, source_ref) DO UPDATE SET
    title = EXCLUDED.title,
    rent = EXCLUDED.rent,
    deposit = EXCLUDED.deposit,
    bhk = EXCLUDED.bhk,
    furnishing = EXCLUDED.furnishing,
    location = EXCLUDED.location,
    available_from = EXCLUDED.available_from,
    availability_text = EXCLUDED.availability_text,
    description = EXCLUDED.description,
    amenities = EXCLUDED.amenities,
    maintenance_details = EXCLUDED.maintenance_details,
    brokerage_applicable = EXCLUDED.brokerage_applicable,
    claims = EXCLUDED.claims,
    extraction_meta = EXCLUDED.extraction_meta,
    raw = EXCLUDED.raw,
    missing_fields = EXCLUDED.missing_fields,
    restricted_attrs = EXCLUDED.restricted_attrs,
    poster_contact = EXCLUDED.poster_contact,
    last_seen_at = now()
RETURNING id
"""

PHOTO_INSERT_SQL = """INSERT INTO listing_photos (
    listing_id, url, position, light_score, space_score, assessment
) VALUES (%s, %s, %s, %s, %s, %s)
"""


def _dsn() -> str:
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError(
            "DATABASE_URL not set — copy services/worker/.env.example to .env"
        )
    return dsn


def _connect() -> Any:
    """Open a worker write connection while keeping psycopg import-lazy."""
    import psycopg

    return psycopg.connect(_dsn())


def _jsonb(value: Any) -> Any:
    """Wrap JSON values for psycopg without importing it at module import time."""
    try:
        from psycopg.types.json import Jsonb
    except ImportError:
        # Tests can use a connection fake without installing the optional runtime.
        return value
    return Jsonb(value)


def upsert_listing(
    listing: Listing, connection_factory: ConnectionFactory | None = None
) -> str:
    """Insert or update one listing (keyed on source + source_ref). Returns its id.

    The listing row and its complete replacement photo set share one transaction.
    ``first_seen_at`` is omitted from the update clause, while ``last_seen_at``
    is refreshed on every repeat observation.
    """
    connect = connection_factory or _connect
    params = (
        listing.source,
        listing.source_ref,
        listing.title,
        listing.rent,
        listing.deposit,
        listing.bhk,
        listing.furnishing,
        _jsonb(listing.location),
        listing.available_from,
        listing.availability_text,
        listing.description,
        _jsonb(listing.amenities),
        _jsonb(listing.maintenance_details),
        listing.brokerage_applicable,
        _jsonb(listing.claims),
        _jsonb(listing.extraction_meta),
        _jsonb(listing.raw),
        _jsonb(listing.missing_fields),
        _jsonb(listing.restricted_attrs),
        _jsonb(listing.poster_contact),
    )

    with connect() as connection, connection.cursor() as cursor:
        cursor.execute(LISTING_UPSERT_SQL, params)
        result = cursor.fetchone()
        if not result:
            raise RuntimeError("listing upsert returned no id")
        listing_id = str(result[0])

        # Replacing the source photo set makes repeat runs idempotent and also
        # removes photos that disappeared from a later intake read.
        cursor.execute(
            "DELETE FROM listing_photos WHERE listing_id = %s", (listing_id,)
        )
        for photo in listing.photos:
            cursor.execute(
                PHOTO_INSERT_SQL,
                (
                    listing_id,
                    photo.url,
                    photo.position,
                    photo.light_score,
                    photo.space_score,
                    photo.assessment,
                ),
            )
    return listing_id
