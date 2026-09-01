# db/migrations

Schema changes to Munshi's contract live here as **numbered, append-only SQL files**.

- [`../schema.sql`](../schema.sql) is the **flattened current truth** — the shape as it stands today.
- Each migration is one forward change: `001_<slug>.sql`, `002_<slug>.sql`, …
- **Only Claude authors migrations** (schema ownership — see [../../AGENTS.md](../../AGENTS.md) §3). Codex proposes a change via a handoff; it never edits the schema directly.

## Convention

1. Add `NNN_<slug>.sql` with the forward change (and, where practical, how to reverse it in a comment).
2. Apply it to the shared Postgres.
3. Fold the change into `../schema.sql` so the flattened file stays the single source of truth.
4. If it changes the shape of a `listings` row, flag it in the handoff so Codex adapts the worker in the same cycle.

No migration files exist yet — `schema.sql` is the initial state.
