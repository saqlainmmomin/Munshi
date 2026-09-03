# Munshi — Development Roadmap

The ordered build plan for the pilot. Companion to [PRD.md](PRD.md) (what & why) and [ARCHITECTURE.md](ARCHITECTURE.md) (how it's shaped). This is the *sequence*.

**How to read this**
- Phases are **dependency-ordered** — don't start a phase until its predecessor's milestone is met.
- Every step is tagged by owner: **[C]** Claude (`apps/web` + `db`), **[X]** Codex (`services/worker`), **[S]** Saqlain (ops/data — things no agent can do).
- Each phase ends with a **Milestone** — the observable proof it's done.
- Section refs point back to [PRD.md](PRD.md).
- Maps to the PRD §12.3 week sequence, shown per phase.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Phase 0 — Foundations *(unblocks everything)* · Week 1

Goal: a live, seeded database both services can talk to, plus the real-world accounts/keys.

**Ops — do these first; they have lead time (PRD §13)**
- [x] **[S]** Create the Supabase project (DB + Auth + Storage). *(Mumbai region; keys in per-service `.env`.)*
- [ ] **[S]** Provision the **ordinary WhatsApp number** for Mira (SIM/eSIM — not Business API, PRD §9.2).
- [x] ~~**[S]** Buy X paid API access~~ — **deferred** (Basic tier is $200/month, exceeds pilot budget; 2026-09-02). X listings are manually pasted into intake.
- [x] ~~**[S]** Curate ~20 Bengaluru broker X accounts~~ — deferred with X API.
- [ ] **[S]** Pick a **maps/routing provider** → `MAPS_API_KEY` (PRD §13 Q2); coarse distance-band is the fallback.

**Database**
- [x] **[C]** Apply `db/schema.sql` + `db/seed.sql` to Supabase; confirm the seeded reference party + 2 listings exist. *(Verified via REST.)*
- [ ] **[C]** Generate typed DB bindings (`supabase gen types typescript`) → replace hand-written `apps/web/lib/types.ts`.
- [x] **[C]** Wire `apps/web/lib/db.ts` to real env; add query helpers. *(`getReviewListings(partyId)` added; `getShortlist`/`getPendingDrafts` still TODO.)*

**Milestone 0:** ✅ `SELECT` from Supabase returns the seeded listing; `apps/web` reads it via `lib/db.ts`. Keys in hand (X API pending purchase).

---

## Phase 1 — Vertical slice: *"the app renders a listing the worker wrote"* · Week 1→2

Goal: the single most important integration checkpoint (AGENTS.md §4) — one real, manually-submitted listing appears in the review loop.

**Worker**
- [ ] **[X]** Implement `sources/intake.fetch()` — read approved intake submissions → `RawItem`s.
- [ ] **[X]** Implement per-source normalization → `Listing` (rent/deposit/bhk/furnishing/location), calling `finalize()`.
- [ ] **[X]** Implement `db.upsert_listing()` (psycopg upsert on `source, source_ref`).
- [ ] **[X]** `pytest` for the intake mapper; run `python -m worker.schedule` once and confirm rows land.

**Web**
- [ ] **[C]** Search-party **create/join** + auth (Supabase Auth) — creator sets hard constraints + commute anchors (PRD §4, §5.1).
- [~] **[C]** Review page reads listings, `ReviewCard` renders price/deposit/bhk/area/source/light-space/missing-fields + restricted-attr facts (PRD §5.2). *(Read path + card done against seed; still TODO: per-participant daily-batch ordering, commute + why-selected, real photos.)*
- [ ] **[C]** **Pass** (with multi-select reason chips) and **add-to-shortlist** actions writing `match_states` (PRD §5.2, §11).

**Milestone 1:** create a party → the review loop shows a real listing submitted through intake → pass/shortlist persists. *End-to-end proof the two services meet.*

---

## Phase 2 — Sourcing breadth *(worker-heavy)* · Week 2→3

Goal: a multi-source pool with dedupe and enrichment.

- [ ] **[C]** Public **intake form** → `intake` store (PRD §8.4); accepts FB, X, WhatsApp, broker listings + photos. **Pulled to Phase 1** — now the primary sourcing path for the pilot.
- [ ] **[C]** Operator **intake sanity-check** queue → approve submissions into the pipeline (PRD §8.4).
- [ ] **[X]** `sources/intake.fetch()` — approved intake submissions (all manual sources) → `RawItem`s (PRD §8.3–8.4).
- [ ] **[X]** `dedupe.find_duplicate()` — cross-channel, set `duplicate_of` (PRD §8.5).
- [ ] **[X]** `vision.assess_photo()` — light/space scores + explanation → `listing_photos` (PRD §11; never auto-discard).
- [ ] **[X]** `commute.peak_minutes()` → `listing_commutes` per anchor (PRD §5.1; distance-band fallback).
- [ ] **[X]** `sources/nobroker.fetch()` — Playwright corridor scraper, **timeboxed**; return `[]` on failure so it never blocks the pipeline. *Descope to manual paste-into-intake if fragile (PRD §12.2).*

**Milestone 2:** the pool is fed by intake (+ NoBroker if it held), deduped, with photo scores and commute times attached.

---

## Phase 3 — Qualify + Mira outreach · Week 2→3

Goal: shortlist → qualify → Mira drafts → Saqlain sends → result logged.

- [ ] **[C]** **"Qualify this flat"** action → open a `qualification_thread` (purpose `qualify`), notify the party (PRD §5.3).
- [ ] **[C]** **Auto-verify** path: a listing with `missing_fields` opens a `purpose = auto_verify` thread without a shortlist (PRD §5.4).
- [ ] **[C]** `lib/mira/draftOutreach()` — draft the message; **first outbound discloses AI** (`discloses_ai = true`, PRD §9.4).
- [ ] **[C]** Operator **draft queue** — approve / edit / send one-tap; send = copy/deep-link to the ordinary WhatsApp number (PRD §9.5).
- [ ] **[C]** Capture replies into the thread; write `verified_facts` + `result_summary` (manual logging ok at pilot volume, PRD §13 Q1).

**Milestone 3:** a full qualification round completes — Mira drafts, Saqlain sends, a reply updates the shortlist record.

---

## Phase 4 — Ranking, collaboration & guardrails · Week 3

Goal: the search *feels* personalized and safe, and a party works together.

- [ ] **[C]** `lib/ranking/rankForParticipant()` — real per-participant scoring from soft prefs + taste weights + commute + light/space + freshness (PRD §4, §5.2). **Never uses `restricted_attrs`.**
- [ ] **[C]** Pass reason chips tune that participant's `taste_weights`; editable/reversible (PRD §11).
- [ ] **[C]** Shared shortlist + **party activity feed** (Supabase realtime) + reactions (PRD §5.3).
- [ ] **[C]** **Request a visit** — any participant, notify the party (PRD §5.5).
- [ ] **[C]** Post-qualification **hybrid update** — Mira announces; shortlist record stays canonical (PRD §5.6).
- [ ] **[C]** Guardrails end-to-end: restricted attrs render as **facts only**; `closeSearch()` **default-deletes** party data (PRD §10.1–10.2). *(Already stubbed in `lib/guardrails`.)*

**Milestone 4:** two participants in one party get personalized orderings over a shared pool; closing a search deletes its data.

---

## Phase 5 — Launch surface + polish · Week 4

Goal: ready to put in front of the waitlist.

- [ ] **[C]** Landing + **waitlist persistence** (`api/waitlist` → table); copy is **capability-only**, never sourcing (PRD §10.3, §11.2).
- [ ] **[C]** **Design pass** — the pre-exposure craft pass (PRD §6; the second of the two allowed design passes).
- [ ] **[C/S]** **End-to-end dry run** with the real reference search (PRD §5) — the honest smoke test before exposure.
- [ ] **[S]** **Twitter waitlist launch** under Saqlain's own name; decide the capacity cap from actual signup response (PRD §11.2).

**Milestone 5 (= pilot live):** a real search party can be onboarded from the waitlist and reach 3 visit-worthy shortlisted flats with review-only effort (PRD §2 success criterion).

---

## Cross-cutting (every phase, not a separate step)

- **Branch + PR discipline** — feature branches, PRs into `main`; `main` auto-pushes (AGENTS.md §5).
- **Smoke-test default** — every feature ships with a check you ran and reported (AGENTS.md §6, §8).
- **Schema changes** — Claude-authored in `db/`; Codex proposes via a handoff (AGENTS.md §3).
- **Handoffs** across the C↔X boundary use `tasks/handoffs/_TEMPLATE.md`.

## Status

- **Phase 0:** ✅ essentially done — scaffold merged (PR #1), Supabase live + seeded, keys wired, `lib/db.ts` reading real rows. Remaining: generated DB types, Storage bucket (Phase 2). X API deferred (2026-09-02).
- **Phase 1:** 🚧 read half proven — the review page renders real DB listings end-to-end (build + runtime verified). Remaining: the write half (Codex intake reader), party create/join + auth, pass/shortlist actions, per-participant ordering. Intake form (Claude) is now the critical-path item.

*Update the checkboxes as work lands; this file is the living source of build sequence.*
