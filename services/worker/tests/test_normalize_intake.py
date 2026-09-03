"""Behavioral tests for manual-intake normalization."""

from __future__ import annotations

from typing import Any

from worker.models import RawItem
from worker.normalize import normalize


def test_condensed_listing_normalizes_structured_hints_and_text_facts() -> None:
    item = RawItem(
        source="whatsapp_manual",
        source_ref="intake:example",
        payload={
            "raw_text": "2BHK in Indiranagar on 80ft Road. Maintenance applies, amount unknown. 1 km from metro. July or August. Family and bachelors welcome.",
            "structured": {"rent": 43000, "area": "Indiranagar"},
            "source_url": "https://example.invalid/post",
            "poster_contact": "available via operator",
            "intake_photos": [
                {"url": "https://example.invalid/photo.jpg", "position": 0}
            ],
        },
    )

    def extract(_: str) -> dict[str, Any]:
        return {
            "deposit": "₹2,00,000",
            "bhk": "2 BHK",
            "furnishing": "semi-furnished",
            "availability_text": "July or August",
            "amenities": ["lift", "power backup", "security guard", "bike parking"],
            "maintenance": {"applicable": True, "amount": None},
            "brokerage_applicable": True,
            "claims": ["1 km from metro"],
            "confidence": {"deposit": 0.91, "amenities": 0.77},
        }

    listing = normalize(item, extractor=extract)

    assert listing.rent == 43000
    assert listing.deposit == 200000
    assert listing.bhk == 2
    assert listing.furnishing == "semi"
    assert listing.location == {"area": "Indiranagar"}
    assert listing.availability_text == "July or August"
    assert listing.available_from is None
    assert listing.amenities == [
        "lift",
        "power_backup",
        "security_guard",
        "bike_parking",
    ]
    assert listing.maintenance_details == {"applicable": True, "amount": None}
    assert listing.brokerage_applicable is True
    assert listing.claims == ["1 km from metro"]
    assert listing.restricted_attrs == []
    assert set(listing.missing_fields) == set()
    assert listing.extraction_meta["deposit"] == {"confidence": 0.91, "source": "text"}
    assert listing.extraction_meta["amenities"] == {
        "confidence": 0.77,
        "source": "text",
    }
    assert listing.poster_contact == {"raw": "available via operator"}
    assert "poster_contact" not in listing.raw
    assert len(listing.photos) == 1


def test_structured_values_take_precedence_over_model_values() -> None:
    item = RawItem(
        source="self_submitted",
        source_ref="intake:precedence",
        payload={
            "raw_text": "The rent is 50,000 for a 2BHK in Koramangala.",
            "structured": {"rent": 47000, "bhk": 1, "area": "Indiranagar"},
        },
    )

    listing = normalize(
        item,
        extractor=lambda _: {
            "rent": 50000,
            "bhk": 2,
            "area": "Koramangala",
            "deposit": 150000,
        },
    )

    assert listing.rent == 47000
    assert listing.bhk == 1
    assert listing.location == {"area": "Indiranagar"}
    assert listing.extraction_meta["deposit"] == {"confidence": 0.8, "source": "text"}
    assert listing.extraction_meta["title"] == {"confidence": 0.6, "source": "inferred"}


def test_sparse_or_malformed_extraction_degrades_to_missing_fields() -> None:
    item = RawItem(
        source="facebook_manual",
        source_ref="intake:sparse",
        payload={
            "raw_text": "A flat is available soon.",
            "structured": "not an object",
        },
    )

    def malformed(_: str) -> object:
        return ["not", "a", "mapping"]

    listing = normalize(item, extractor=malformed)  # type: ignore[arg-type]

    assert listing.rent is None
    assert listing.deposit is None
    assert listing.furnishing is None
    assert listing.available_from is None
    assert set(listing.missing_fields) == {
        "rent",
        "deposit",
        "bhk",
        "furnishing",
        "location",
    }


def test_restricted_language_is_informational_and_inclusive_language_is_not_restricted() -> (
    None
):
    restrictive = RawItem(
        source="self_submitted",
        source_ref="intake:restricted",
        payload={"raw_text": "2BHK, family only, no bachelors, veg only"},
    )
    inclusive = RawItem(
        source="self_submitted",
        source_ref="intake:inclusive",
        payload={"raw_text": "Family, bachelors, and couples welcome"},
    )

    restrictive_listing = normalize(restrictive, extractor=lambda _: {})
    inclusive_listing = normalize(inclusive, extractor=lambda _: {})

    assert restrictive_listing.restricted_attrs == [
        "vegetarian_only",
        "bachelors_not_allowed",
        "family_only",
    ]
    assert inclusive_listing.restricted_attrs == []
    assert restrictive_listing.source_ref != inclusive_listing.source_ref


def test_ambiguous_availability_is_preserved_without_auto_verify_missing_flag() -> None:
    listing = normalize(
        RawItem(
            source="whatsapp_manual",
            source_ref="intake:ambiguous",
            payload={"raw_text": "Available July or August"},
        ),
        extractor=lambda _: {"availability": "July or August", "rent": 40000},
    )

    assert listing.available_from is None
    assert listing.availability_text == "July or August"
    assert "available_from" not in listing.missing_fields


def test_text_phone_capture_stays_in_poster_contact_and_not_claims() -> None:
    listing = normalize(
        RawItem(
            source="self_submitted",
            source_ref="intake:contact",
            payload={"raw_text": "Call the poster for details."},
        ),
        extractor=lambda _: {"poster_contact": "contact supplied privately"},
    )

    assert listing.poster_contact == {"raw": "contact supplied privately"}
    assert listing.claims == []
    assert "poster_contact" not in listing.raw


def test_invalid_bhk_does_not_reach_smallint_persistence() -> None:
    listing = normalize(
        RawItem(
            source="self_submitted",
            source_ref="intake:bad-bhk",
            payload={"raw_text": "Large flat"},
        ),
        extractor=lambda _: {"bhk": 40000},
    )

    assert listing.bhk is None
    assert "bhk" in listing.missing_fields


def test_nested_contact_is_redacted_and_contact_claims_are_not_shared() -> None:
    listing = normalize(
        RawItem(
            source="self_submitted",
            source_ref="intake:nested-contact",
            payload={
                "raw_text": "2BHK in Indiranagar",
                "structured": {
                    "area": "Indiranagar",
                    "contact": {"email": "owner@example.com", "phone": "9999999999"},
                },
            },
        ),
        extractor=lambda _: {
            "rent": 40000,
            "deposit": 100000,
            "bhk": 2,
            "furnishing": "semi",
            "claims": ["Email owner@example.com", "Call 9999999999"],
        },
    )

    assert listing.poster_contact is None
    assert listing.claims == []
    assert listing.raw["structured"] == {"area": "Indiranagar"}


def test_negative_amenity_wording_is_not_normalized_as_available() -> None:
    listing = normalize(
        RawItem(
            source="self_submitted",
            source_ref="intake:negative-amenities",
            payload={"raw_text": "Flat without lift"},
        ),
        extractor=lambda _: {"amenities": ["no parking", "lift unavailable", "gym"]},
    )

    assert listing.amenities == ["gym"]
