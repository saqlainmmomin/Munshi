"""Munshi sourcing worker.

Pipeline (schedule.py): sources -> normalize -> dedupe -> enrich (vision,
commute) -> WRITE listings to shared Postgres. The database is the only handoff
to apps/web (AGENTS.md §3). This package never imports or calls the web app.
"""

__all__ = ["models"]
