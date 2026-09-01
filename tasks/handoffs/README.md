# tasks/handoffs

Self-contained kickoff files for handing work **across the Claude↔Codex boundary** or **to a fresh session** — instead of carrying context in someone's head.

## When to write one

- Handing work to the other agent (e.g. Claude needs a new field the worker must populate → handoff to Codex).
- Handing work to a fresh session of yourself.
- Anytime the receiver would otherwise have to reconstruct context you already hold.

## Convention

- **Location:** this folder.
- **Name:** `YYYY-MM-DD-<slug>.md` (e.g. `2026-09-01-worker-x-poller.md`).
- **Template:** start from [`_TEMPLATE.md`](_TEMPLATE.md).
- **Self-contained:** a handoff must stand alone — include file paths, the goal, decisions already made, and how to verify. The receiver should not need to find the person who wrote it.
- **Results:** the receiving agent appends a `## Results` section when the work is done (final locations, a short summary, any open questions flagged rather than resolved).

## Existing handoffs

- `2026-08-31-munshi-prd.md` — write the pilot PRD (complete; see its Results).
