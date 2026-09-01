# Munshi — Architecture

**Status:** pilot build (3–4 weeks). Companion to [PRD.md](PRD.md) (what & why) and [../AGENTS.md](../AGENTS.md) (how we build together). This doc is the *technical shape*.

---

## 1. One idea

Two services that share nothing but a database:

- **`apps/web`** — a TypeScript **Next.js** app: everything the user touches, plus Mira's drafting and the operator queue.
- **`services/worker`** — a **Python** worker: everything that sources and enriches listings (scrapers, the X poller, intake, dedupe, vision, commute).

They meet at **one Postgres database**. The worker writes listings; the app reads them. That's the entire coupling.

```
  SOURCES                    services/worker (Python · Codex)          shared DB              apps/web (TS · Claude)         USER
 ┌─────────┐   scrape/poll  ┌──────────────────────────────────┐   ┌────────────┐   read    ┌──────────────────────────┐
 │ NoBroker│ ─────────────▶ │ sources → normalize → dedupe →   │──▶│  Postgres  │◀───────── │ review loop (Luma)       │◀── daily batch
 │ X API   │ ─────────────▶ │ vision (light/space) → commute → │   │ (Supabase) │           │ shortlist + party feed   │◀── shortlist/qualify
 │ intake  │ ─────────────▶ │ WRITE listings + enrichment      │   │  listings  │           │ Mira drafts → operator   │──▶ approve & send
 │ (FB/self)│               └──────────────────────────────────┘   │  + party   │           │ landing + waitlist       │
 └─────────┘                        (runs a few times/day)         └────────────┘           └──────────────────────────┘
                                                                          ▲                              │
                                                                          └──────── app writes party/match/shortlist/threads
```

No arrow goes **worker → app** or **app → worker**. Both arrows go through Postgres.

---

## 2. Directory layout (monorepo)

```
munshi/
├── AGENTS.md · CLAUDE.md · CODEX.md      # coordination + per-agent startup
├── docs/  PRD.md · CONVERSATION.md · ARCHITECTURE.md
│
├── db/                                   # ⟵ THE CONTRACT (Claude owns)
│   ├── schema.sql                        #    single source of truth (PRD §7)
│   ├── seed.sql                          #    realistic rows for local dev
│   └── migrations/                       #    every schema change, numbered
│
├── apps/web/                             # ═══ TypeScript · Next.js ═══ (Claude)
│   ├── app/
│   │   ├── (marketing)/                  # landing + waitlist            (PRD §11)
│   │   ├── party/[id]/
│   │   │   ├── review/                   # daily-batch review loop       (PRD §5.2)
│   │   │   ├── shortlist/                # shared shortlist + activity   (PRD §5.3)
│   │   │   └── settings/                 # constraints, close-search     (PRD §10.2)
│   │   ├── operator/                     # approve/send queue + intake sanity-check
│   │   └── api/                          # parties · listings · qualify · outreach
│   ├── components/                       # review cards, keyboard controls
│   └── lib/
│       ├── db.ts                         # reads worker-written listings
│       ├── mira/                         # LLM drafting + AI-disclosure   (PRD §9)
│       ├── ranking/                      # per-participant ordering       (PRD §4)
│       └── guardrails/                   # facts-not-filters, default-delete (PRD §10)
│
└── services/worker/                      # ═══ Python ═══ (Codex)
    ├── sources/
    │   ├── nobroker.py                   # Playwright scraper, corridor   (PRD §8.1)
    │   ├── x_api.py                      # official paid API poller       (PRD §8.2)
    │   └── intake.py                     # self-submission + manual FB    (PRD §8.3–8.4)
    ├── normalize.py                      # → canonical Listing shape
    ├── dedupe.py                         # cross-channel dedupe           (PRD §8.5)
    ├── vision.py                         # light/spaciousness assessment  (PRD §7, §11)
    ├── commute.py                        # precompute commute-to-anchors
    ├── db.py                             # WRITES listings to Postgres
    └── schedule.py                       # runs the above a few times/day
```

Ownership (who may write where) is enforced socially by [AGENTS.md](../AGENTS.md) §2, not by tooling — but the directories are disjoint, so collisions can't happen in practice.

---

## 3. The seam — why coupling stays tiny

The only question the two services must agree on is: **what does a `listings` row look like?** That agreement is [db/schema.sql](../db/schema.sql).

- **Worker → DB:** scrape/poll → `normalize` to the canonical shape → `dedupe` → enrich (`vision`, `commute`) → `INSERT`/`UPDATE` `listings`, `listing_photos`, `listing_commutes`, and set `missing_fields` for the auto-verify path.
- **App ← DB:** the review loop queries `listings` filtered to a party's hard constraints, ranks per participant into `match_states` + `daily_batches`, and renders cards. Auth, shortlist, qualify threads, and Mira all live app-side.
- **Schema changes** are a deliberate Claude-authored edit (schema + a `db/migrations/` file). Codex proposes via handoff. See [AGENTS.md](../AGENTS.md) §3.

Because the interface is *data at rest*, not a live API, either side can be developed, restarted, or rewritten independently as long as the row shape holds.

---

## 4. Deploy targets

| Piece | Host | Why |
|---|---|---|
| `apps/web` | **Vercel** | first-class Next.js; instant preview deploys |
| `services/worker` | **Railway / Render** | persistent process — Playwright + a scheduler need a long-running box, not serverless functions (which time out) |
| Postgres + Auth + Storage | **Supabase** | one service covers the DB (PRD §7), search-party auth (PRD §4), and photo storage; realtime powers the party activity feed nearly for free |

Keeping the worker off Vercel is deliberate: serverless timeouts and cron limits make scraping fragile. The worker is where long-running, scheduled, browser-driven work belongs.

---

## 5. External dependencies

- **X API** — official paid tier, ~$40–50 for the pilot (PRD §8.2). Never scraped.
- **Maps/routing API** — commute-to-anchor computation (worker `commute.py`). Provider TBD (PRD §13 open question #2); coarse distance-band fallback acceptable since commute ranks, never excludes.
- **Anthropic API** — Mira drafting (web, TS SDK) and photo light/space assessment (worker, Python SDK).
- **WhatsApp** — an **ordinary number**, not the Business API (PRD §9.2). Sending is operator-driven (copy/deep-link); no Business-API integration is built in the pilot.

---

## 6. Where each PRD concern lives

| PRD concern | Home |
|---|---|
| Sourcing (§8) | `services/worker/sources/*` |
| Ranking / taste (§4, §11) | `apps/web/lib/ranking` + worker `vision.py` (scores only) |
| Mira outreach + disclosure (§9) | `apps/web/lib/mira` + `apps/web/app/operator` |
| Auto-verify incomplete listings (§5.4) | worker sets `missing_fields`; app opens an `auto_verify` thread |
| Guardrails (§10) | `apps/web/lib/guardrails` (facts-not-filters, default-delete) + copy discipline everywhere |
| Business / launch (§11) | `apps/web/app/(marketing)` |
