# apps/web — Munshi web app

TypeScript · Next.js (App Router). **Owned by Claude** ([../../AGENTS.md](../../AGENTS.md) §2).
Everything the user touches, plus Mira's drafting and the operator queue. Reads
listings the worker wrote; never talks to the worker directly (§3).

## Run

```bash
cd apps/web
cp .env.example .env.local   # fill in Supabase + Anthropic
npm install
npm run dev                  # http://localhost:3000
```

## Layout

| Path | Purpose | PRD |
|---|---|---|
| `app/(marketing)/` | landing + waitlist | §11 |
| `app/party/[id]/review/` | daily-batch review loop (Luma) | §5.2 |
| `app/party/[id]/shortlist/` | shared shortlist + activity | §5.3 |
| `app/party/[id]/settings/` | constraints, close-search | §10.2 |
| `app/operator/` | approve/send queue + intake check | §8.4, §9 |
| `lib/db.ts` | Supabase read side of the contract | §7 |
| `lib/mira/` | Mira drafting + AI disclosure | §9 |
| `lib/ranking/` | per-participant ordering | §4, §11 |
| `lib/guardrails/` | facts-not-filters, default-delete | §10 |

## Before "done" (AGENTS.md §6, §8)

`npm run typecheck && npm run lint`, plus a browser smoke check of the page you
changed. Never mark done on faith.
