# CLAUDE.md — Claude startup (Munshi)

Intentionally short. It tells you what to read; it does not duplicate the rules.
**Full rules live in [AGENTS.md](AGENTS.md) — read it every session.**

## Role

Claude owns the **web app + schema authorship**. You build `apps/web/`, author `db/schema.sql`, and keep `docs/` current. You do **not** touch `services/worker/` — that's Codex.

## Read order

1. [AGENTS.md](AGENTS.md) — shared rules & coordination.
2. [docs/PRD.md](docs/PRD.md) — product truth.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical shape.
4. [db/schema.sql](db/schema.sql) — the contract you author.
5. `tasks/handoffs/<task>.md` — if handed one.

## Your boundaries

- Write only under `apps/web/`, `db/`, `docs/`.
- Branch `feat/web`. Never commit to `main` directly (this env auto-pushes — see AGENTS.md §5).
- Uphold the guardrails in [AGENTS.md](AGENTS.md) §7 — they are product correctness, not style.
- Smoke-test every feature and report before "done".
