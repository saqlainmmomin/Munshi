"""Database contract tests using a transaction-shaped fake connection."""

from __future__ import annotations

from datetime import date
from typing import Any, Self
from uuid import UUID

from worker.db import upsert_listing
from worker.models import Listing, ListingPhoto


class FakeCursor:
    def __init__(self) -> None:
        self.calls: list[tuple[str, tuple[Any, ...] | None]] = []
        self.fetchone_value = (UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),)

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def execute(self, query: str, params: tuple[Any, ...] | None = None) -> None:
        self.calls.append((query, params))

    def fetchone(self) -> tuple[UUID]:
        return self.fetchone_value


class FakeConnection:
    def __init__(self) -> None:
        self.cursor_obj = FakeCursor()
        self.committed = False
        self.rolled_back = False

    def __enter__(self) -> Self:
        return self

    def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
        self.committed = exc_type is None
        self.rolled_back = exc_type is not None

    def cursor(self) -> FakeCursor:
        return self.cursor_obj


def _listing() -> Listing:
    return Listing(
        source="whatsapp_manual",
        source_ref="intake:upsert",
        raw={"raw_text": "text"},
        title="Bright home",
        rent=43000,
        deposit=200000,
        bhk=2,
        furnishing="semi",
        location={"area": "Indiranagar"},
        available_from=date(2026, 10, 1),
        description="text",
        amenities=["lift"],
        maintenance_details={"applicable": True, "amount": None},
        brokerage_applicable=True,
        claims=["1 km from metro"],
        extraction_meta={"rent": {"confidence": 0.8, "source": "text"}},
        missing_fields=[],
        restricted_attrs=["family_only"],
        poster_contact={"raw": "available via operator"},
        photos=[ListingPhoto(url="https://example.invalid/1.jpg", position=0)],
    )


def test_upsert_writes_listing_and_replaces_photos_in_one_transaction(
    monkeypatch: Any,
) -> None:
    connection = FakeConnection()
    monkeypatch.setenv("DATABASE_URL", "postgresql://example.invalid/munshi")

    listing_id = upsert_listing(_listing(), lambda: connection)

    assert listing_id == "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    assert connection.committed is True
    assert connection.rolled_back is False
    assert len(connection.cursor_obj.calls) == 3
    upsert_query, upsert_params = connection.cursor_obj.calls[0]
    assert "ON CONFLICT (source, source_ref) DO UPDATE" in upsert_query
    assert "first_seen_at" not in upsert_query.split("DO UPDATE", 1)[1]
    assert upsert_params is not None
    assert upsert_params[0:2] == ("whatsapp_manual", "intake:upsert")
    assert connection.cursor_obj.calls[1][0].startswith("DELETE FROM listing_photos")
    assert connection.cursor_obj.calls[2][0].startswith("INSERT INTO listing_photos")


def test_upsert_rolls_back_when_photo_write_fails() -> None:
    class FailingCursor(FakeCursor):
        def execute(self, query: str, params: tuple[Any, ...] | None = None) -> None:
            super().execute(query, params)
            if query.startswith("INSERT INTO listing_photos"):
                raise RuntimeError("photo write failed")

    class FailingConnection(FakeConnection):
        def __init__(self) -> None:
            self.cursor_obj = FailingCursor()
            self.committed = False
            self.rolled_back = False

    connection = FailingConnection()

    try:
        upsert_listing(_listing(), lambda: connection)
    except RuntimeError as exc:
        assert str(exc) == "photo write failed"
    else:  # pragma: no cover - defensive assertion for the test itself
        raise AssertionError("photo failures must abort the transaction")

    assert connection.committed is False
    assert connection.rolled_back is True
