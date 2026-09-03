"""Pipeline integration tests with real worker objects and fake DB writes."""

from __future__ import annotations

from typing import Any

from worker import db, schedule, vision
from worker.models import RawItem


def test_run_once_keeps_restricted_listings_and_is_repeatable(monkeypatch: Any) -> None:
    item = RawItem(
        source="self_submitted",
        source_ref="intake:schedule",
        payload={"raw_text": "Family only, 2BHK in Indiranagar"},
    )
    writes: list[str] = []

    monkeypatch.setattr(schedule, "collect", lambda: [item])
    original_normalize = schedule.normalize.normalize
    monkeypatch.setattr(
        schedule.normalize,
        "normalize",
        lambda raw: original_normalize(
            raw,
            extractor=lambda _: {
                "rent": 43000,
                "deposit": 200000,
                "bhk": 2,
                "furnishing": "semi",
                "area": "Indiranagar",
            },
        ),
    )
    monkeypatch.setattr(vision, "assess_photo", lambda _: None)

    def record_write(listing: Any) -> str:
        writes.append(listing.source_ref)
        return "listing-id"

    monkeypatch.setattr(db, "upsert_listing", record_write)

    assert schedule.run_once() == 1
    assert schedule.run_once() == 1
    assert writes == ["intake:schedule", "intake:schedule"]


def test_malformed_submission_does_not_block_a_valid_submission(
    monkeypatch: Any,
) -> None:
    malformed = RawItem(
        source="facebook_manual", source_ref="intake:bad", payload={"raw_text": None}
    )
    valid = RawItem(
        source="whatsapp_manual",
        source_ref="intake:good",
        payload={"raw_text": "listing"},
    )
    writes: list[str] = []

    monkeypatch.setattr(schedule, "collect", lambda: [malformed, valid])
    original_normalize = schedule.normalize.normalize
    monkeypatch.setattr(
        schedule.normalize,
        "normalize",
        lambda raw: original_normalize(
            raw,
            extractor=lambda _: (
                {"rent": 40000}
                if raw.source_ref.endswith("good")
                else (_ for _ in ()).throw(ValueError("bad extraction"))
            ),
        ),
    )

    def record_write(listing: Any) -> str:
        writes.append(listing.source_ref)
        return "listing-id"

    monkeypatch.setattr(db, "upsert_listing", record_write)

    assert schedule.run_once() == 2
    assert writes == ["intake:bad", "intake:good"]


def test_source_failure_does_not_prevent_approved_intake(monkeypatch: Any) -> None:
    item = RawItem(
        source="self_submitted",
        source_ref="intake:source-recovery",
        payload={"raw_text": "Approved listing"},
    )

    def fail() -> list[RawItem]:
        raise RuntimeError("source unavailable")

    monkeypatch.setattr(schedule.nobroker, "fetch", fail)
    monkeypatch.setattr(schedule.x_api, "fetch", fail)
    monkeypatch.setattr(schedule.intake, "fetch", lambda: [item])
    writes: list[str] = []

    def record_write(listing: Any) -> str:
        writes.append(listing.source_ref)
        return "listing-id"

    monkeypatch.setattr(
        schedule.db,
        "upsert_listing",
        record_write,
    )

    assert schedule.run_once() == 1
    assert writes == ["intake:source-recovery"]
