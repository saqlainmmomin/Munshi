"""Intake source — self-submitted listings + manually-pasted Facebook finds
(PRD §8.3, §8.4).

One generic intake feeds the SAME pipeline — not a second product surface.
Marketed only to outgoing tenants; owners/brokers may use it if found organically.
Facebook is manual only: Saqlain pastes promising group listings here. No FB
automation, ever (AGENTS.md §6). Saqlain sanity-checks each submission before it
enters the pipeline (PRD §8.4).
"""

from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from datetime import date, datetime
from typing import Any, cast
from uuid import UUID

from worker.models import SOURCE_CHANNELS, RawItem, SourceChannel

INTAKE_QUERY = """
SELECT
    s.id,
    s.source::text,
    s.raw_text,
    s.structured,
    s.source_url,
    s.poster_contact,
    s.submitted_at,
    s.reviewed_at,
    s.reviewer_notes,
    COALESCE(
        json_agg(
            json_build_object(
                'id', p.id,
                'storage_path', p.storage_path,
                'url', p.url,
                'position', p.position
            ) ORDER BY p.position, p.id
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::json
    ) AS intake_photos
FROM intake_submissions AS s
LEFT JOIN intake_photos AS p ON p.submission_id = s.id
WHERE s.status = 'approved'
GROUP BY s.id, s.source, s.raw_text, s.structured, s.source_url,
         s.poster_contact, s.submitted_at, s.reviewed_at, s.reviewer_notes
ORDER BY s.submitted_at ASC, s.id ASC
"""

ConnectionFactory = Callable[[], Any]


def _dsn() -> str:
    import os

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError(
            "DATABASE_URL not set — copy services/worker/.env.example to .env"
        )
    return dsn


def _connect() -> Any:
    """Open a worker read connection; psycopg stays lazy for local imports/tests."""
    import psycopg

    return psycopg.connect(_dsn())


def _row_value(row: Sequence[Any] | Mapping[str, Any], index: int, key: str) -> Any:
    if isinstance(row, Mapping):
        return row.get(key)
    return row[index]


def _json_safe(value: Any) -> Any:
    """Convert common psycopg values into JSON-compatible raw-capture values."""
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, (UUID,)):
        return str(value)
    if isinstance(value, Mapping):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    return value


def _source(value: Any) -> SourceChannel:
    source = str(value)
    if source not in SOURCE_CHANNELS:
        raise ValueError(f"Unsupported intake source channel: {source}")
    return cast(SourceChannel, source)


def fetch(connection_factory: ConnectionFactory | None = None) -> list[RawItem]:
    """Return all operator-approved submissions with their source photos.

    Approval is the only eligibility check here. The stable ``intake:<id>``
    reference lets the downstream upsert safely revisit the same submission.
    """
    connect = connection_factory or _connect
    items: list[RawItem] = []
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute(INTAKE_QUERY)
        rows = cursor.fetchall()

    for row in rows:
        submission_id = str(_row_value(row, 0, "id"))
        photos = _row_value(row, 9, "intake_photos")
        payload = {
            "submission_id": submission_id,
            "raw_text": _json_safe(_row_value(row, 2, "raw_text")),
            "structured": _json_safe(_row_value(row, 3, "structured")) or {},
            "source_url": _json_safe(_row_value(row, 4, "source_url")),
            "poster_contact": _json_safe(_row_value(row, 5, "poster_contact")),
            "submitted_at": _json_safe(_row_value(row, 6, "submitted_at")),
            "reviewed_at": _json_safe(_row_value(row, 7, "reviewed_at")),
            "reviewer_notes": _json_safe(_row_value(row, 8, "reviewer_notes")),
            "intake_photos": _json_safe(photos if isinstance(photos, list) else []),
        }
        items.append(
            RawItem(
                source=_source(_row_value(row, 1, "source")),
                source_ref=f"intake:{submission_id}",
                payload=payload,
            )
        )
    return items
