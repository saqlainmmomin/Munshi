# AGENTS.md — Munshi coordination & rules

**Canonical. Read by both Claude and Codex at the start of every session.**
This is the one place shared rules live. Per-agent startup files ([CLAUDE.md](CLAUDE.md), [CODEX.md](CODEX.md)) are thin and point here — do not duplicate rules into them.

Munshi is a renter-side apartment search agent for India (pilot: Bengaluru). Product truth is [docs/PRD.md](docs/PRD.md). This file governs *how the two of us build it together without colliding.*

---

## 1. Read order

Read the minimum needed for the task; don't re-read long history unless the task depends on it.

1. **AGENTS.md** (this file) — rules & coordination.
2. **[docs/PRD.md](docs/PRD.md)** — product truth (what & why). Non-relitigable decisions.
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — technical shape (services, seam, deploy).
4. **[db/schema.sql](db/schema.sql)** — *the contract* (the shared data shape).
5. **`tasks/handoffs/<task>.md`** — the specific task, if you were handed one.

---

## 2. Roles & ownership

Split **by service**, so the two agents never edit the same files.

| Agent | Owns (writes only here) | Responsibilities | Never touches |
|---|---|---|---|
| **Claude** | `apps/web/`, `db/`, `docs/` | The Next.js web app (Luma review loop, search parties, auth, shortlist, qualify flow, Mira drafting, operator queue, ranking, guardrails UI, landing/waitlist), **schema authorship**, product/design craft | `services/worker/` |
| **Codex** | `services/worker/` | The Python sourcing worker (NoBroker scraper, X poller, intake normalization, dedupe, vision, commute precompute, scheduler) | `apps/web/`, `db/schema.sql` |

If you find yourself needing to edit the other agent's territory, **stop and write a handoff** (§8) instead.

---

## 3. The contract — the single most important rule

**`db/schema.sql` is the ONLY integration point between the two services.**

- The **worker WRITES** `listings` (+ photos, commutes, enrichment). The **app READS** them.
- Neither service imports the other's code. **No HTTP call between them.** The database *is* the interface.
- **Schema changes are authored by Claude only**, in `db/schema.sql` + a numbered file in `db/migrations/`, as a deliberate, reviewed change. **Codex never edits the schema** — it proposes a change via a handoff, and codes against the schema as-is.
- If a field's meaning is unclear, that's a **schema-comment fix**, not a private assumption on either side.

---

## 4. Coordination protocol

1. **Schema first, frozen.** Claude authors the schema before either service is built. Treat it as frozen between explicit changes.
2. **Disjoint directories → zero merge collisions.** Ownership in §2 guarantees no file is edited by both agents.
3. **The DB is the handshake.** `db/seed.sql` provides realistic rows so each side develops without the other running.
4. **Integration check:** "the app renders a listing the worker actually wrote." That's the definition of the two halves meeting.

---

## 5. Git rules

- **Feature branches only.** Claude → `feat/web`. Codex → `feat/worker`. **Never commit directly to `main`.**
- Open PRs into `main` for review; keep `main` releasable.
- **Environment note:** this machine **auto-pushes commits to `origin` within ~25s** via a concurrent process (not a repo hook — verified). So (a) assume every commit reaches the remote immediately, and (b) working on feature branches is what keeps `main` clean despite the auto-push.
- Conventional-commit messages. End commit bodies with `Co-Authored-By:` for the agent that wrote them. Never force-push a shared branch.

---

## 6. Coding standards

**Shared**
- Fix **root causes**, not workarounds. Touch only what the task needs. Match surrounding style.
- **Smoke-test default:** every feature ships with a quick check (script, curl, or browser step) that you *run and report* before claiming done. Never "done" on faith.
- No secrets in code — use env vars. No personal data in logs or URLs.

**Web — `apps/web/` (TypeScript)**
- Next.js App Router, TypeScript `strict`, server components by default.
- DB types are **generated/derived** from the schema, never hand-duplicated.
- Anthropic **TypeScript** SDK for Mira drafting.

**Worker — `services/worker/` (Python)**
- Type hints + `mypy`; `ruff` + `black`; `pytest` for every source module.
- Playwright for scraping. **X: official paid API only — never scrape X.** **Facebook: never automate.** (PRD §8.)
- Anthropic **Python** SDK for vision analysis.

---

## 7. Non-negotiable product guardrails (PRD §10 — violating these is a defect, not a style nit)

1. **Non-discrimination.** Restricted-tenancy attributes (vegetarian-only, bachelors-not-allowed, family-only, gender/caste signals) are **informational facts only** — surfaced to the renter, **never** a search filter and **never** a ranking input.
2. **Retention — default-delete.** All search-party data is deleted when a search closes, unless the user opted to keep it. No indefinite retention, no cross-search aggregate learning in the pilot.
3. **Public copy = capability, never mechanism.** Landing/Twitter copy describes what Munshi *does*. **Never name NoBroker; never say "scraping."**
4. **AI disclosure + human-in-the-loop.** Mira's **first outbound message discloses she is an AI**. **Mira drafts, Saqlain sends** — no autonomous sending in the pilot.

---

## 8. Definition of done

- Feature works, **proven by a smoke test you ran and reported** (not asserted).
- Tests added that would catch the regression.
- No guardrail in §7 violated.
- If working from a handoff, its `## Results` section is updated.

---

## 9. Handoffs

- All handoffs live in **`tasks/handoffs/`**, named `YYYY-MM-DD-<slug>.md`.
- Start from **[tasks/handoffs/_TEMPLATE.md](tasks/handoffs/_TEMPLATE.md)**.
- Use a handoff to hand work across the Claude↔Codex boundary, or to a fresh session. The receiving agent appends `## Results` when done.
- See **[tasks/handoffs/README.md](tasks/handoffs/README.md)** for the convention.
