# services/worker — Munshi sourcing worker

Python. **Owned by Codex** ([../../AGENTS.md](../../AGENTS.md) §2). Sources and
enriches listings, then writes them to shared Postgres — the only handoff to the
web app (§3). Never touches `apps/web/` or `db/schema.sql`.

## Run

```bash
cd services/worker
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env          # fill in DATABASE_URL, X_BEARER_TOKEN, etc.
python -m worker.schedule     # one pass
pytest                        # smoke tests
```

## Pipeline (`worker/schedule.py`)

`sources/* → normalize → dedupe → enrich (vision, commute) → db.upsert_listing`

| Module | Purpose | PRD |
|---|---|---|
| `sources/nobroker.py` | scrape corridor (accepted risk; descope-able to manual) | §8.1 |
| `sources/x_api.py` | official paid API poller — **never scrape X** | §8.2 |
| `sources/intake.py` | self-submitted + manually-pasted FB — **no FB automation** | §8.3–8.4 |
| `normalize.py` | RawItem → canonical Listing + missing-field flagging | §5.4 |
| `dedupe.py` | cross-channel dedupe | §8.5 |
| `vision.py` | photo light/space scores — **never auto-discard** | §11 |
| `commute.py` | precompute commute per anchor (distance-band fallback ok) | §5.1 |
| `db.py` | upsert into `listings` per `db/schema.sql` | §7 |

## Rules that are correctness, not preference (AGENTS.md §6–7)

- Match `worker/models.Listing` to `db/schema.sql`. Need a new column? Propose it
  to Claude via a handoff — don't invent it worker-side.
- Type-hint everything; `pytest` + `mypy` + `ruff` before "done".
