"""Smoke tests for the one piece of real skeleton logic: completeness flagging.

This is the rule that feeds the auto-verify path (PRD §5.4), so it's worth
locking down from day one.
"""

from worker.models import Listing, RawItem
from worker.normalize import compute_missing_fields, normalize


def test_complete_listing_has_no_missing_fields():
    listing = Listing(
        source="x",
        source_ref="x:post:1",
        raw={},
        rent=62000,
        deposit=300000,
        bhk=2,
        furnishing="furnished",
        location={"area": "Indiranagar"},
    )
    assert compute_missing_fields(listing) == []


def test_missing_deposit_is_flagged():
    listing = Listing(
        source="self_submitted",
        source_ref="intake:2",
        raw={},
        rent=58000,
        bhk=2,
        furnishing="semi",
        location={"area": "Koramangala"},
    )
    assert "deposit" in compute_missing_fields(listing)


def test_normalize_populates_missing_fields_for_empty_item():
    listing = normalize(RawItem(source="nobroker", source_ref="nb:3", payload={}))
    # An empty item is missing every required fact.
    assert set(listing.missing_fields) == {
        "rent",
        "deposit",
        "bhk",
        "furnishing",
        "location",
    }
