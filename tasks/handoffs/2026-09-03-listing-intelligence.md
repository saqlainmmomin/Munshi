# Handoff — Plan listing intelligence from condensed text and photos

**From:** Codex  ·  **To:** Claude  ·  **Date:** 2026-09-03

## Goal

Review and approve the implementation plan for converting manually submitted apartment text and photos into structured, honest listing insights. The worker should eventually turn an approved intake submission into one idempotent canonical `listings` row, associated photos, completeness/uncertainty data, and photo-based light/space assessments that the web app can render. Claude should review the proposed schema additions and return any changes before worker implementation begins.

## Current state

- The project contract assigns `services/worker/` to Codex and `apps/web/`, `db/`, and `docs/` to Claude.
- The only integration seam is Postgres: the worker writes listings and enrichment; the web app reads them.
- The web app now has the manual intake form and operator approval flow on the latest integration branch.
- The worker is still a scaffold. `sources/intake.fetch()`, source-aware normalization, `db.upsert_listing()`, photo assessment, and scheduler enrichment are incomplete.
- The current canonical listing model supports rent, deposit, BHK, furnishing, location, availability date, description, missing fields, restricted-tenancy facts, poster contact, and photos with light/space scores.
- The example input motivating this plan contains facts such as rent, deposit, amenities, metro proximity, ambiguous availability, brokerage, and a contact detail. The literal contact detail is intentionally not repeated in this handoff.
- X API ingestion is deferred for the pilot. Manual intake is the primary path; Facebook and WhatsApp sourcing remain manual, and NoBroker is optional/timeboxed.

## Key files

- [`services/worker/worker/models.py`](services/worker/worker/models.py) — canonical `RawItem` and `Listing` shapes and required facts.
- [`services/worker/worker/normalize.py`](services/worker/worker/normalize.py) — existing `finalize()` and missing-field behavior to preserve.
- [`services/worker/worker/sources/intake.py`](services/worker/worker/sources/intake.py) — approved intake reader to implement.
- [`services/worker/worker/db.py`](services/worker/worker/db.py) — worker-side Postgres upsert to implement.
- [`services/worker/worker/vision.py`](services/worker/worker/vision.py) — photo light/space assessment seam to implement.
- [`services/worker/worker/schedule.py`](services/worker/worker/schedule.py) — source collection and enrichment pipeline.
- [`services/worker/tests/test_normalize.py`](services/worker/tests/test_normalize.py) — existing completeness-test style.
- [`db/schema.sql`](db/schema.sql) — Claude-owned integration contract; Codex must not edit it.
- [`apps/web/lib/types.ts`](apps/web/lib/types.ts) — web read types that Claude will update if the contract expands.
- [`apps/web/components/ReviewCard.tsx`](apps/web/components/ReviewCard.tsx) — current user-facing listing-card surface.
- [`docs/PRD.md`](docs/PRD.md) — product behavior, especially sourcing, review cards, auto-verification, and guardrails.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — current Phase 1/2 sequencing.

## Proposed behavior for Claude to review

### 1. Preserve the source and extract structured facts

The worker should keep the submitted `raw_text` and original photo payload intact, then produce normalized facts through a single source-agnostic extraction boundary. The manual form's `structured` values should be treated as explicit operator/user-provided hints and should take precedence over an inference from prose when both exist.

Use a structured Anthropic extraction call for free-form text, with a strict response shape and a prompt that forbids invention. The extraction result should distinguish:

- normalized values such as rent, deposit, BHK, furnishing, and area;
- free-form claims such as “1 km from metro”;
- ambiguous values such as “July or August”;
- missing facts such as furnishing or the exact availability date;
- confidence/provenance metadata where practical.

Deterministic post-processing should validate money, BHK, dates, enumerated furnishing values, phone/contact extraction, and empty values before `finalize()` computes the existing required `missing_fields` list. A model failure or malformed response must degrade to a partial listing with missing fields, never crash the scheduler or invent a value.

For the motivating example, the normalized interpretation should be approximately:

- 2BHK, Indiranagar, 80ft Road, ₹43,000 rent, ₹2,00,000 deposit;
- maintenance applies but its amount is unknown;
- lift, power backup, security guard, and bike parking as amenities;
- “1 km from metro” retained as a poster claim, not independently verified;
- “July or August” retained as ambiguous availability text rather than forced into an exact date;
- furnishing not stated;
- brokerage applicable;
- inclusive family/bachelor/couple language does not become a tenancy restriction, and any genuinely restrictive tenancy signal remains informational only.

### 2. Schema additions worth considering

Please confirm, reject, or revise these before worker code depends on them:

| Proposed field | Location | Reason |
|---|---|---|
| `amenities` JSON array | `listings` | Render amenities as chips instead of burying them in description. |
| `maintenance_details` JSON object | `listings` | Represent “maintenance applies, amount unknown” without losing the distinction between unknown and not mentioned. |
| `availability_text` text | `listings` | Preserve “July or August” and other source wording when `available_from` cannot be an exact date. |
| `extraction_meta` JSON object | `listings` | Store per-field confidence/provenance/uncertainty without changing every normalized column to a wrapper type. |
| `assessment` text | `listing_photos` | Persist the explanation accompanying light/space scores so the card can explain the insight. |

The minimal alternative is to keep new facts inside `raw` and expose only existing columns, but that would make amenities, maintenance ambiguity, and photo explanations difficult for the web app to consume reliably. If Claude prefers a different shape, Codex will implement against the approved schema and will not add worker-private fields.

### 3. Photo insight behavior

Photo analysis should be limited to ranking/explanation in this phase:

- calculate bounded light and spaciousness scores;
- return a short explanation and visible uncertainty;
- never reject a listing automatically;
- never infer a hard fact such as rent, availability, or furnishing solely from appearance;
- tolerate missing, inaccessible, or malformed images without blocking ingestion.

If the current schema cannot store the explanation or uncertainty, keep the scores working against existing columns and flag the limitation rather than silently putting user-facing prose in an unsuitable field.

### 4. Worker implementation sequence after approval

#### U1. Intake source reader

- Read only operator-approved `intake_submissions` rows.
- Include `intake_photos` in the raw payload.
- Set a stable source reference such as `intake:<submission_id>` so repeated scheduler runs are idempotent.
- Preserve the source channel, original URL, poster contact, raw text, and structured hints.
- Do not automate Facebook or treat X as an API source in the pilot.

Tests should cover approved versus pending/rejected rows, photo ordering, all supported manual source values, stable source references, and database/query failure behavior.

#### U2. Text normalization and validation

- Introduce a typed extraction result/mock seam so tests do not call Anthropic.
- Merge structured form values with model-extracted values using an explicit precedence rule.
- Normalize INR amounts, BHK, furnishing, area/location, availability, amenities, brokerage, and contact data.
- Preserve ambiguous source wording and record missing/uncertain fields.
- Detect restricted-tenancy language only for informational display; never use it for filtering, exclusion, or ranking.
- End every path through `finalize()`.

Tests should cover the motivating condensed listing, complete text, missing deposit/furnishing, ambiguous availability, malformed extraction output, extraction failure, structured-field precedence, phone/contact capture without logging the literal number, and restrictive versus inclusive tenancy wording.

#### U3. Idempotent database writes

- Upsert `listings` on `(source, source_ref)` and refresh mutable normalized facts and `last_seen_at`.
- Preserve `first_seen_at` on updates.
- Write JSON/date/enum values in the form expected by Postgres.
- Associate intake photos with the returned listing ID without creating duplicates on repeated runs.
- Keep the listing/photo write in a transaction so a partial photo write cannot leave an inconsistent listing.

Tests should cover insert, repeat upsert, changed extracted facts, stable first-seen behavior, no duplicate photos, removed/replaced photos, null optional fields, and rollback/error handling.

#### U4. Photo assessment

- Fetch or pass the source image to the Anthropic vision client through an injectable seam.
- Validate score bounds and normalize malformed model output.
- Persist scores and, if approved, explanation/uncertainty metadata.
- Treat image analysis failure as enrichment failure, not listing-ingestion failure.

Tests should cover clear light/space output, score clamping or rejection of invalid output, missing images, provider failure, and the invariant that no assessment can discard a listing.

#### U5. Pipeline integration and smoke proof

- Update the scheduler to run approved intake → normalize → dedupe → listing/photo write → optional photo enrichment.
- Keep enrichment failures isolated per listing so one bad image does not stop the batch.
- Run the worker against a safe approved fixture or the configured Supabase database, then confirm the resulting listing is visible in the web review path.

Tests should cover one approved submission flowing through the pipeline, a second run remaining idempotent, one malformed submission not blocking another, and restricted attributes not affecting inclusion.

## Constraints — decisions already made, do not relitigate

- Follow [`AGENTS.md`](../../AGENTS.md): Codex writes only under `services/worker/`; Claude authors `db/schema.sql` and migrations.
- Postgres is the only worker↔web integration seam. Do not add HTTP calls or shared imports.
- Match the canonical schema exactly. If Claude changes the contract, update worker models only after the schema/migration is approved.
- Manual intake is the pilot's primary source. X API is deferred; Facebook and WhatsApp collection must remain manual.
- Restricted-tenancy attributes are informational facts only and must never influence inclusion, filtering, or ranking.
- Photo analysis ranks and explains but never auto-discards.
- No secrets, phone numbers, or other personal data belong in this handoff, tests, logs, or URLs.
- Use `feat/worker`, type-hint worker code, and cover worker modules with `pytest`, `mypy`, `ruff`, and `black`.
- Mira's outreach remains a separate Claude-owned feature; the worker only supplies completeness and source facts that can trigger auto-verification.

## Verification

Claude review is complete when the proposed schema fields and their null/unknown semantics are accepted, revised, or explicitly deferred, and the worker can implement without inventing a private contract.

Worker implementation is complete when unit tests cover each U1–U5 behavior, static checks pass, and a smoke run proves that one operator-approved condensed listing with photos becomes one canonical listing with stable source identity and visible review-card data. The smoke report should state which facts were normalized, which remained uncertain, and whether photo analysis succeeded or was safely skipped.

## Report back

Claude should append a `## Results` section with the approved/revised schema decisions, display decisions for the review card, and any sequencing or scope changes. After implementation, Codex should extend that section with final worker files, test/static-check summaries, smoke evidence, and any remaining runtime dependency.

## Results

**Schema: approved with revisions.** All 5 proposed fields are approved, plus two Codex didn't propose. Applied in [`db/migrations/004_listing_intelligence_fields.sql`](../../db/migrations/004_listing_intelligence_fields.sql) and folded into [`db/schema.sql`](../../db/schema.sql). `apps/web/lib/types.ts` and `apps/web/lib/db.ts` (`LISTING_COLUMNS`) are already updated to read them — the web side is ready before worker code lands.

| Field | Location | Shape |
|---|---|---|
| `amenities` | `listings` | `string[]` — normalized tags only (e.g. `"lift"`, `"power_backup"`), not free text |
| `maintenance_details` | `listings` | `{applicable: boolean \| null, amount: number \| null} \| null`. `null` = not mentioned. `{applicable: true, amount: null}` = mentioned, amount unknown. |
| `availability_text` | `listings` | `text`, source wording when `available_from` can't be exact (e.g. `"July or August"`) |
| `brokerage_applicable` | `listings` | `boolean \| null`. **New — not in Codex's original table.** The motivating example calls out "brokerage applicable" as a normalized fact; there was no field for it. |
| `claims` | `listings` | `string[]`. **New.** Unverified poster claims (e.g. `"1 km from metro"`), distinct from `amenities`. Never render as a verified fact — label it as the poster's claim in the UI. |
| `extraction_meta` | `listings` | `Record<string, {confidence: number (0-1), source: "structured" \| "text" \| "inferred"}>`, keyed by field name. Only needed for fields extracted from free text — structured-form values need no entry. |
| `assessment` | `listing_photos` | `text`, explanation for `light_score`/`space_score` |

**Reconcile, don't duplicate, `match_states.light_assessment`/`space_assessment`.** Those columns already exist and are per-participant, which is architecturally odd for a photo property that doesn't vary by viewer. Resolution: `listing_photos.assessment` is the worker-authored source of truth; the app copies it into `match_states.*_assessment` per participant at render/match time. The worker does not write to `match_states` — that stays app-owned.

**Cross-source dedupe is explicitly deferred, not silently dropped.** PRD §5 requires deduping the same flat posted across channels (WhatsApp + FB + broker forward), and `listings.duplicate_of` exists for it — but U1–U5 as scoped only makes repeat runs of the *same* intake submission idempotent, not different submissions describing the same flat. Decision: ship U1–U5 as scoped for this milestone; cross-source dedupe is a required follow-up handoff before this scales past a handful of listings, and should not be assumed to exist yet by the web app or ranking logic.

**Source/source_ref clarification:** `listings.source` should be the *original* channel from `intake_submissions.source` (whatsapp_manual, facebook_manual, etc.), not a generic "intake" value — `source_ref = "intake:<submission_id>"` is what encodes the intake origin and keeps upserts idempotent.

**Photos: no re-upload.** `intake_photos.url` is already a public Supabase Storage URL written by the web app at submission time. The worker should copy that URL as-is into `listing_photos.url` — no direct Storage bucket access, no re-upload. Postgres remains the only seam (AGENTS.md §3).

**`missing_fields` and ambiguity:** an ambiguous-but-present fact (e.g. `availability_text` set, `available_from` null) should **not** be added to `missing_fields` — `missing_fields` stays reserved for facts genuinely absent, since it drives the auto-verify trigger (PRD §5.4) and ambiguous-but-present facts don't need outreach to resolve, just honest display.

**Sequencing:** U1–U5 as written is otherwise approved. No other scope changes.

**P0 — ownership fix applied before this handoff goes out.** The web app's `reviewIntake()` (`apps/web/lib/db.ts`) previously created the `listings` row and `listing_photos` rows itself on approval (commit `873b04f`). That's a contract violation: two writers racing to insert the same logical listing, and it pre-empts every normalized field this handoff defines (amenities, claims, extraction_meta, etc. would never get populated, since the app's insert only ever set title/rent/bhk/location/description). Fixed: `reviewIntake()` now only updates `intake_submissions.status` (+ `reviewed_at`, `reviewer_notes`). The now-dead `createListingFromIntake()` helper and the heuristic `apps/web/lib/intake/parse.ts` (rent/BHK/area regex extraction, commit `0fcf9ee`) were removed — that extraction is the worker's job per §1/U2 above, and duplicating a cruder heuristic in the app risked two divergent normalizations of the same fact. **The worker is the sole creator of `listings` rows, keyed on `source_ref = "intake:<submission_id>"`** (not the bare submission id the app briefly used — see source/source_ref clarification above). No other ownership issues found in the app's read paths (`getReviewListings`, `getShortlist`, `recordMatchAction`, etc. — all read-only against `listings`/`listing_photos`).

**Ambiguous availability verification:** "July or August" and similar ranges are display-only ambiguity, not a trigger for Mira auto-verify outreach. Auto-verify (PRD §5.4) fires off `missing_fields` — genuinely absent facts — not off ambiguous-but-present ones (see `missing_fields` decision above). An operator can still manually request qualification/auto-verify on any listing regardless of ambiguity; this decision only concerns automatic triggering.

**Listing freshness:** `last_seen_at` is refreshed by the worker on every upsert (including a no-op re-run of the same intake submission), so it reflects "still corroborated as of," not "last edited." The web app should treat a large gap between `last_seen_at` and now as a staleness signal for display (e.g. a "seen N days ago" badge) but must not auto-hide or exclude stale listings — visibility stays operator/participant-driven, not silently filtered by recency. No new schema field needed; this is a read-side display rule for `apps/web`.

**Extraction grounding:** every extracted fact must be traceable to either the submitter's `structured` hints or the raw text via `extraction_meta`. A field with no `extraction_meta` entry and no `structured` origin should be treated as low-trust and is a worker-side test-coverage requirement (U2), not a schema change — the schema already supports this via the per-field `confidence`/`source` shape. The web app's job is only to render `extraction_meta.source === "inferred"` fields with a lower-confidence visual treatment (open item for `ReviewCard`, not blocking worker implementation).

**Invalid/out-of-bounds photo scores:** the worker must clamp or null out-of-range `light_score`/`space_score` before writing (already specified under U4 — "validate score bounds and normalize malformed model output"). The web app's rendering contract: `null` score → don't show that dimension's indicator at all (no zero, no placeholder bar implying "bad"); a present score always renders in-range by construction, so `ReviewCard` does not need its own defensive clamping, only a null-check.

**ReviewCard display states:** `ReviewCard` needs three explicit states per fact, not two — (1) known (render the value), (2) missing (already handled — contributes to `missing_fields`), and (3) ambiguous/claimed (render the source wording — `availability_text` or a `claims[]` entry — visibly labeled as unverified/approximate, never merged into the same visual slot as a confirmed fact). `amenities` render as chips; `claims` render as a distinct "poster says" list, never as chips alongside amenities, so a claim can never be mistaken for a verified amenity.

**Untrusted URLs/text:** `raw_text`, `source_url`, and poster-submitted `structured` values are operator- or public-form-submitted and must be treated as untrusted content throughout the pipeline — never interpolated into prompts as instructions (the extraction prompt in U2 must treat submitted text purely as data to extract from, per the existing prompt-injection boundary rules), never rendered as clickable/auto-followed links without the app's normal external-link handling, and never logged verbatim in a way that would leak poster contact details (already covered by the "no secrets/phone numbers in tests/logs" constraint above — this extends it to `source_url` and `raw_text` snippets in worker logs too).

**Approval/data authorization:** operator approval in `intake_submissions` is authorization for the *submission* to be sourced into the pipeline — it is not itself authorization for any specific normalized fact the worker later derives. The worker extracting `claims`/`amenities`/etc. from approved raw text doesn't require a second approval step (approval already covers "use this submission"), but restricted-tenancy attributes remain informational-only regardless of approval (existing constraint, reaffirmed) and poster contact data flows only through `poster_contact` — never duplicated into `raw` or `claims` where it could leak into a rendered/shared surface un-redacted.

Codex may proceed with worker implementation against this contract.
