"""Intake source — self-submitted listings + manually-pasted Facebook finds
(PRD §8.3, §8.4).

One generic intake feeds the SAME pipeline — not a second product surface.
Marketed only to outgoing tenants; owners/brokers may use it if found organically.
Facebook is manual only: Saqlain pastes promising group listings here. No FB
automation, ever (AGENTS.md §6). Saqlain sanity-checks each submission before it
enters the pipeline (PRD §8.4).
"""

from __future__ import annotations

from worker.models import RawItem


def fetch() -> list[RawItem]:
    """Return operator-approved intake submissions not yet in the pipeline.

    TODO: read approved rows from the intake store (a table the web form writes,
    approved in the operator console) and map to RawItems.
    """
    return []
