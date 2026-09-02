# Handoff — Implement the X (Twitter) source poller

**From:** Claude  ·  **To:** Codex  ·  **Date:** 2026-09-02

## Goal

Make `services/worker` produce **real listings from X** and write them to the shared Postgres, so they show up in the web review loop. Concretely: implement `sources/x_api.fetch()`, the X→`Listing` normalization, and `db.upsert_listing()`, so that running `python -m worker.schedule` inserts rows into `listings` (+ `listing_photos`) that the app already renders.

This is the **write half of Milestone 1** — the read half is done (the review page already renders whatever is in `listings`). When this lands, a real X-sourced flat appears in a party's review page end-to-end.

**Definition of done:** `pytest` green (mapper + idempotent upsert), and — with a bearer token and ≥1 real account configured — a `python -m worker.schedule` run inserts rows that then render on `/party/<id>/review`.

## Current state

- **Branch:** cut `feat/worker` from `main`. `main` has the merged scaffold + roadmap + seed fix. (The web read path is on open PR #4 — you don't need it merged; it only *reads* `listings`.)
- **DB is live** (Supabase, Mumbai). `db/schema.sql` is applied; `db/seed.sql` has 2 sample rows. Your `services/worker/.env` already has `DATABASE_URL`. **`X_BEARER_TOKEN` is empty** — Saqlain is purchasing X API access; build + test against mocked payloads until it lands.
- **Worker skeleton exists** and the pipeline is already wired in `worker/schedule.py` (`collect → normalize → dedupe → upsert`). Three pieces are stubs you will implement.
- `worker/normalize.py` already has **real completeness logic** (`compute_missing_fields` / `finalize`) with passing tests — reuse it; don't reinvent missing-field flagging.

## Key files

- [`services/worker/worker/sources/x_api.py`](services/worker/worker/sources/x_api.py) — **implement `fetch()`** (currently returns `[]`). `BROKER_ACCOUNTS` is an empty list with a TODO.
- [`services/worker/worker/normalize.py`](services/worker/worker/normalize.py) — extend with X-specific field extraction; end by calling `finalize()`.
- [`services/worker/worker/db.py`](services/worker/worker/db.py) — **implement `upsert_listing()`** (currently `NotImplementedError`).
- [`services/worker/worker/models.py`](services/worker/worker/models.py) — `RawItem` and `Listing` shapes; `REQUIRED_FACTS` drives completeness. **Match these to `db/schema.sql`.**
- [`services/worker/worker/schedule.py`](services/worker/worker/schedule.py) — the entrypoint that ties it together (already calls your functions).
- [`db/schema.sql`](db/schema.sql) — the contract. `listings` (unique on `source, source_ref`) + `listing_photos`.
- [`services/worker/tests/test_normalize.py`](services/worker/tests/test_normalize.py) — existing test style to follow.
- [`docs/PRD.md`](docs/PRD.md) §8.2 (X sourcing) · [`AGENTS.md`](AGENTS.md) §3, §6, §7.

## Scope — the work

1. **`x_api.fetch()`** — official X API v2 via `httpx` with `X_BEARER_TOKEN`.
   - **Recommended approach:** one `GET /2/tweets/search/recent` query built from the tracked handles — `(from:acct1 OR from:acct2 …) (rent OR BHK OR flat OR apartment)` — rather than N per-user calls. Adapt to whatever access tier Saqlain's purchase grants (if `search/recent` isn't available on the tier, fall back to per-user `GET /2/users/:id/tweets`). Request `expansions=attachments.media_keys` + `media.fields=url` so photos come through.
   - Keep a light listing-like filter (keyword/shape heuristic) so obvious non-listings are dropped. Return `RawItem(source="x", source_ref=f"x:{tweet_id}", payload={...})` with the full tweet + media in `payload`.
   - Minimal pagination/rate-limit handling is fine — this runs a few times a day over ~20 accounts. **Never scrape; API only** (PRD §8.2).
   - Leave `BROKER_ACCOUNTS = []` with the TODO — curating it is Saqlain's data task (PRD §13 Q3).

2. **X → `Listing` normalization.** Tweet text is unstructured, so extract `rent`, `deposit`, `bhk`, `furnishing`, `location`, `available_from` from free text. **Decision (made — build this, don't relitigate): use an Anthropic structured-extraction call** (the `anthropic` Python dep is already declared) with a strict JSON schema, because regex alone won't survive real broker-tweet variety. Make the extractor a single well-typed function so it's mockable in tests; degrade gracefully (missing fields just become `missing_fields`, never a crash). End every mapping with `finalize()` so completeness is set consistently.
   - If a tweet signals a restricted-tenancy attribute (veg-only, bachelors-not-allowed, family-only, gender/caste), record it in `restricted_attrs` (**informational only**). **Never** use it to decide which posts to keep or rank — that's a hard guardrail (AGENTS §7.1, PRD §10.1).

3. **`db.upsert_listing()`** — `psycopg` connection to `DATABASE_URL`; `INSERT … ON CONFLICT (source, source_ref) DO UPDATE` refreshing normalized fields + `last_seen_at = now()`. Insert any media into `listing_photos`. Return the listing `id`. Import `psycopg` lazily (keep module import cheap, per the existing pattern).

## Constraints — decisions already made, do not relitigate

- **X = official paid API only, never scrape** (PRD §8.2). This is the whole reason the channel exists.
- **Write only under `services/worker/`.** Never touch `apps/web/` or `db/schema.sql`. If you need a new column, **propose it in a return handoff to Claude** — don't invent it worker-side (AGENTS §3).
- **Match `worker/models.Listing` to `db/schema.sql`** exactly.
- **Branch `feat/worker`; never commit to `main`** (this env auto-pushes — AGENTS §5).
- Restricted attrs are informational, never a filter (guardrail above).

## Verification

- `pytest` green:
  - X-tweet → `Listing` mapper against **fixture payloads** (complete tweet → no missing fields; sparse tweet → correct `missing_fields`; a restricted-tenancy tweet → `restricted_attrs` populated). Mock the Anthropic extractor so tests need no network.
  - `upsert_listing` idempotency (same `source_ref` twice → one row, `last_seen_at` advances). Use a transaction/rollback or a mock.
- **End-to-end (once `X_BEARER_TOKEN` + ≥1 real account exist):** run `python -m worker.schedule`, confirm new rows via Supabase, then confirm they render on `/party/11111111-1111-1111-1111-111111111111/review` (that party's ₹65k ceiling admits typical listings). Report the row count and a screenshot/curl of the review page.
- Read it back as if you were about to build tomorrow: if the X API tier changes the endpoint you can use, resolve it in code and note it in Results rather than leaving it ambiguous.

## Report back

Append a `## Results` section with: the final files/functions, how the extractor is structured (and its mock seam), the `pytest` summary, the end-to-end smoke result (or "blocked on `X_BEARER_TOKEN`" if the token hasn't landed — mapper/upsert tests should still pass), and any schema change you had to request from Claude.
