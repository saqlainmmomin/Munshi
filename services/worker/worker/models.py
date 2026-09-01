"""Canonical shapes the worker produces — must match db/schema.sql (the contract).

Keep these fields aligned with the `listings` table. If a new field is needed,
propose a schema change to Claude via a handoff (AGENTS.md §3); do not invent
columns worker-side.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any, Literal

SourceChannel = Literal["nobroker", "x", "facebook_manual", "self_submitted"]
Furnishing = Literal["unfurnished", "semi", "furnished", "any"]


@dataclass
class RawItem:
    """A single item as captured from a source, before normalization."""

    source: SourceChannel
    source_ref: str  # url / post id / submission id
    payload: dict[str, Any]  # untouched captured data -> listings.raw


@dataclass
class Listing:
    """Normalized listing ready to write to Postgres (maps to `listings`)."""

    source: SourceChannel
    source_ref: str
    raw: dict[str, Any]
    title: str | None = None
    rent: int | None = None
    deposit: int | None = None
    bhk: int | None = None
    furnishing: Furnishing | None = None
    location: dict[str, Any] | None = None  # {area, lat, lng}
    available_from: date | None = None
    description: str | None = None
    # which required facts are missing -> auto-verify path (PRD §5.4)
    missing_fields: list[str] = field(default_factory=list)
    # informational only, NEVER a filter (PRD §10.1)
    restricted_attrs: list[str] = field(default_factory=list)
    poster_contact: dict[str, Any] | None = None


# Facts a listing needs before it counts as "complete" (drives missing_fields).
REQUIRED_FACTS: tuple[str, ...] = ("rent", "deposit", "bhk", "furnishing", "location")
