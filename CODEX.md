# CODEX.md — Codex startup (Munshi)

Intentionally short. It tells you what to read; it does not duplicate the rules.
**Full rules live in [AGENTS.md](AGENTS.md) — read it every session.**

## Role

Codex owns the **sourcing worker**. You build `services/worker/` — the NoBroker scraper, the X poller, intake normalization, dedupe, vision, commute precompute, and the scheduler. You **read** `db/schema.sql` but never edit it; propose schema changes via a handoff to Claude.

## Read order

1. [AGENTS.md](AGENTS.md) — shared rules & coordination.
2. [docs/PRD.md](docs/PRD.md) **§8 (sourcing)** — your product truth.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — the seam & data flow.
4. [db/schema.sql](db/schema.sql) — the contract you write against.
5. `tasks/handoffs/<task>.md` — if handed one.

## Your boundaries

- Write only under `services/worker/`. Never touch `apps/web/` or `db/schema.sql`.
- **X: official paid API only — never scrape X. Facebook: never automate.** NoBroker scraping is knowingly accepted for pilot scale (PRD §8).
- Your only handoff to the app is **writing `listings` (+ enrichment) into Postgres** per the schema. No HTTP to the app.
- Branch `feat/worker`. Never commit to `main` directly (this env auto-pushes — see AGENTS.md §5).
- Test every module (`pytest`) and report a smoke run before "done".
