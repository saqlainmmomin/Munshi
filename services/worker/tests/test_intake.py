"""Focused tests for the approved manual-intake source."""

from __future__ import annotations

from functools import partial
from typing import Any, Self

from worker.sources import intake


class FakeCursor:
    def __init__(self, rows: list[tuple[Any, ...]]) -> None:
        self.rows = rows
        self.executed: tuple[str, tuple[Any, ...] | None] | None = None

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def execute(self, query: str, params: tuple[Any, ...] | None = None) -> None:
        self.executed = (query, params)

    def fetchall(self) -> list[tuple[Any, ...]]:
        return self.rows


class FakeConnection:
    def __init__(self, rows: list[tuple[Any, ...]]) -> None:
        self.cursor_obj = FakeCursor(rows)

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def cursor(self) -> FakeCursor:
        return self.cursor_obj


def return_connection(connection: FakeConnection) -> FakeConnection:
    return connection


def test_fetch_reads_only_approved_rows_and_preserves_ordered_photos() -> None:
    connection = FakeConnection(
        [
            (
                "submission-1",
                "whatsapp_manual",
                "2BHK in Indiranagar",
                {"rent": 43000},
                "https://example.invalid/post",
                "available via operator",
                "2026-09-03T10:00:00+00:00",
                None,
                None,
                [
                    {
                        "id": "photo-2",
                        "storage_path": "p/2",
                        "url": "https://img/2",
                        "position": 1,
                    },
                    {
                        "id": "photo-1",
                        "storage_path": "p/1",
                        "url": "https://img/1",
                        "position": 0,
                    },
                ],
            )
        ]
    )

    items = intake.fetch(lambda: connection)

    assert len(items) == 1
    assert items[0].source == "whatsapp_manual"
    assert items[0].source_ref == "intake:submission-1"
    assert items[0].payload["raw_text"] == "2BHK in Indiranagar"
    assert items[0].payload["poster_contact"] == "available via operator"
    assert items[0].payload["intake_photos"][0]["position"] == 1
    assert connection.cursor_obj.executed is not None
    assert "status = 'approved'" in connection.cursor_obj.executed[0]
    assert "listings" not in connection.cursor_obj.executed[0].lower()


def test_fetch_accepts_each_manual_source_channel() -> None:
    for source in ("facebook_manual", "whatsapp_manual", "self_submitted"):
        connection = FakeConnection(
            [
                (
                    f"submission-{source}",
                    source,
                    "listing text",
                    {},
                    None,
                    None,
                    None,
                    None,
                    None,
                    [],
                )
            ]
        )

        items = intake.fetch(partial(return_connection, connection))

        assert items[0].source == source


def test_fetch_propagates_database_failures() -> None:
    def fail_connect() -> FakeConnection:
        raise RuntimeError("database unavailable")

    try:
        intake.fetch(fail_connect)
    except RuntimeError as exc:
        assert str(exc) == "database unavailable"
    else:  # pragma: no cover - defensive assertion for the test itself
        raise AssertionError("database failures must not be swallowed")
