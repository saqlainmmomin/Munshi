"""Source adapters. Each exposes `fetch() -> list[RawItem]`.

Risk posture differs per channel (PRD §8, AGENTS.md §6):
  - nobroker : automated scraping, knowingly accepted for pilot scale
  - x_api    : official paid API ONLY — never scrape X
  - intake   : self-submitted form + manually-pasted Facebook finds (no FB automation)
"""
