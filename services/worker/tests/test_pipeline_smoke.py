"""Safe end-to-end smoke proof for approved intake through worker enrichment."""

from __future__ import annotations

from typing import Any, Self

from worker import db, normalize, schedule, vision
from worker.sources import intake


class IntakeCursor:
    def __init__(self, row: tuple[Any, ...]) -> None:
        self.row = row

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def execute(self, query: str, params: tuple[Any, ...] | None = None) -> None:
        assert "status = 'approved'" in query
        assert params is None

    def fetchall(self) -> list[tuple[Any, ...]]:
        return [self.row]


class IntakeConnection:
    def __init__(self, row: tuple[Any, ...]) -> None:
        self.row = row

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def cursor(self) -> IntakeCursor:
        return IntakeCursor(self.row)


def test_approved_intake_becomes_one_enriched_listing_on_repeat_run(
    monkeypatch: Any,
) -> None:
    row = (
        "submission-smoke",
        "whatsapp_manual",
        "2BHK in Indiranagar. Family and bachelors welcome.",
        {"rent": 43000, "bhk": 2, "area": "Indiranagar"},
        "https://example.invalid/post",
        "available via operator",
        None,
        None,
        None,
        [
            {
                "id": "photo-1",
                "storage_path": "p/1",
                "url": "https://example.invalid/1.jpg",
                "position": 0,
            }
        ],
    )
    connection = IntakeConnection(row)
    writes: list[Any] = []

    monkeypatch.setattr(intake, "_connect", lambda: connection)
    monkeypatch.setattr(schedule.nobroker, "fetch", list)
    monkeypatch.setattr(schedule.x_api, "fetch", list)
    monkeypatch.setattr(
        normalize,
        "extract_facts",
        lambda _: {
            "deposit": "₹2,00,000",
            "furnishing": "semi-furnished",
            "availability_text": "July or August",
            "amenities": ["lift", "power backup"],
            "maintenance": {"applicable": True, "amount": None},
            "brokerage_applicable": True,
            "claims": ["1 km from metro"],
        },
    )
    monkeypatch.setattr(
        vision,
        "assess_photo",
        lambda _: vision.PhotoAssessment(0.9, 0.72, "Bright and open-looking room."),
    )

    def capture_write(listing: Any) -> str:
        writes.append(listing)
        return "listing-smoke"

    monkeypatch.setattr(db, "upsert_listing", capture_write)

    assert schedule.run_once() == 1
    assert schedule.run_once() == 1
    assert len(writes) == 2
    first, second = writes
    assert first.source_ref == second.source_ref == "intake:submission-smoke"
    assert first.rent == 43000
    assert first.deposit == 200000
    assert first.furnishing == "semi"
    assert first.availability_text == "July or August"
    assert "available_from" not in first.missing_fields
    assert first.restricted_attrs == []
    assert first.photos[0].light_score == 0.9
    assert first.photos[0].space_score == 0.72
