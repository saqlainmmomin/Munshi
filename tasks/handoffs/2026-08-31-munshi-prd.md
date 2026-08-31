# Handoff — Write the Munshi PRD

## Goal

Write the first PRD for **Munshi**, a renter-side apartment search agent for India (pilot: Bengaluru). Product discovery and a full feasibility grill are both complete — nothing in this handoff should be relitigated with Saqlain unless it's genuinely new information the PRD process surfaces. Definition of done: a PRD document (location/format at your discretion, e.g. `docs/PRD.md`) that a solo builder could execute against for a 3-4 week pilot build, covering scope, user flows, data model at a product level, sourcing/outreach mechanics, guardrails, and what's explicitly out of scope for the pilot.

## Current state

- Repo currently contains only `README.md` and `docs/CONVERSATION.md` — a reconstructed record of the original product-discovery conversation. No code, no PRD, no prototype artifacts (an earlier browser prototype called "Luma" was built and verified in a separate session but was **not** committed to this repo — it lived in temporary prototype storage).
- Since `CONVERSATION.md` was written, a second session ran the `grilling` skill against the concept and settled 16 additional decisions not yet reflected in any repo file. Those decisions are authoritative and are captured in full below — treat them as already-decided, not open questions.

## Key files

- [/Users/saqlainmomin/Munshi/README.md](/Users/saqlainmomin/Munshi/README.md) — one-paragraph pitch and current product thesis.
- [/Users/saqlainmomin/Munshi/docs/CONVERSATION.md](/Users/saqlainmomin/Munshi/docs/CONVERSATION.md) — the full original product-discovery conversation (search-party model, contact autonomy, scheduling, taste feedback, agent identity, pilot success criterion, the original three-shapes feasibility grill). Read this in full before writing the PRD; the decisions below build on top of it and assume it as background.
- This file — the grill-session decisions layered on top of `CONVERSATION.md`.

## Constraints — decisions already made, do not relitigate

These came out of a structured `grilling`-skill session with Saqlain on 2026-08-31, after `CONVERSATION.md`. Each is a settled answer to a specific tension, not a default — treat pushback on these as out of scope unless the PRD process surfaces a genuinely new consideration.

**Positioning**
- Renter-side search agent, not a marketplace. Search-party workspace is the interaction model (see `CONVERSATION.md` §8 for search-party rules).
- Pilot corridor: Koramangala–Indiranagar–Domlur belt, Bengaluru.
- Success criterion (unchanged from `CONVERSATION.md` §14): 3+ genuinely visit-worthy shortlisted flats per search party, renter's work limited to reviewing/approving.
- Startup ambition, not just a personal tool — but bootstrap and validate before treating it as fundable. No pricing/monetization in the pilot (see Business, below).

**Sourcing — three channels, each with a different risk posture**
1. **NoBroker**: automated read-only scraping of public listing pages. Accepted knowingly as a competitor-scraping risk (unfair-competition angle, not just ordinary ToS exposure) — Saqlain is aware and has accepted this for pilot scale.
2. **X (Twitter)**: official paid API, not scraping. Estimated ~$40–50 total for the pilot at expected volume (~20 broker accounts, checked a few times a day). Chosen specifically to remove X from ToS/ban risk given Meta and X are both actively litigating scrapers, and Saqlain is launching this pilot publicly on Twitter under his own name.
3. **Facebook groups**: manual only. Saqlain personally browses relevant Bengaluru Flat/Flatmates groups — no automation, no bot account. This is the one platform where automation risk was judged not worth taking, given Meta's scraping enforcement is the most aggressive of the three and now covers logged-out access too (as of Jan 2025).

**Self-submitted listing intake**
- A single generic intake form/channel feeds the *same* pipeline as scraped/API listings — it is explicitly **not** a second product surface. No listing-management dashboard, no owner/broker-facing product for the pilot.
- Actively marketed/solicited only to **outgoing tenants** (current tenants moving out, looking for someone to take their room/flat) in the pilot corridor — this is the differentiated, low-competition segment with no existing durable channel today (it currently lives entirely in WhatsApp/word-of-mouth). Owners and brokers are not blocked from using the same form if they find it organically, but no marketing effort targets them — they already have channels (NoBroker, Facebook, personal networks).
- No verification step for the pilot beyond Saqlain personally sanity-checking submissions before they enter the pipeline (justified by tiny expected volume at 5-10 search parties).

**Outreach — Mira, the AI concierge**
- Contact happens only after a participant shortlists a property (unchanged from `CONVERSATION.md` §6), plus the existing exception: the agent may auto-contact a poster *only* to verify missing facts on an otherwise-promising incomplete listing.
- Channel: a **separate ordinary WhatsApp number**, not the WhatsApp Business API/Cloud API. This was a deliberate reversal during the grill — cold-messaging brokers who've never messaged first would violate WhatsApp's opt-in policy for business-initiated conversations (confirmed via research: this is a real policy violation, not a gray area, and block-rate risk on a brand-new number is high at tiny volume). Using an ordinary WhatsApp number sidesteps this because it isn't a Business-API business-initiated conversation under Meta's rules — it's mechanically identical to a person texting a broker, which is normal practice today.
- **Mira drafts, Saqlain sends.** AI-drafted messages are queued for one-tap human review/approval before sending, for the entire pilot — not fully autonomous. Revisit full autonomy post-pilot once there's a track record of real conversations.
- First message must still disclose AI identity (unchanged from `CONVERSATION.md` §10 — this is the concierge-identity decision, still binding).
- WhatsApp Business API + automation is an explicit **post-pilot** consideration, once real opt-in exists (e.g. a broker replies first, which legitimately opens a window) and volume justifies the compliance setup (Meta Business verification takes 3-10 business days; there's per-conversation pricing, roughly ₹0.86/marketing conversation in India as of 2026, though a BSP's platform/subscription fee is the larger cost driver at any real scale).

**Guardrails**
- Discriminatory listing attributes commonly seen in Indian rental ads (vegetarian-only, bachelors-not-allowed, family-only, gender-restrictive, caste/community signals) are surfaced to the renter as **informational facts only** ("this listing requires vegetarian tenants") — never exposed as a search filter. Munshi itself must not be the thing doing discriminatory sorting.
- Data retention: **default-delete** all search-party data (budget, contact info, chat transcripts, taste profile) once a search closes (flat found or party disbands), unless the user explicitly opts to keep it. No indefinite retention or cross-search aggregate learning for the pilot.
- Public-facing messaging (the Twitter launch, any landing page copy) must describe Munshi's **capability**, never its sourcing **mechanism** — do not name NoBroker or state that scraping is involved. This is specifically to avoid drawing a scraped competitor's attention right as traffic is being driven to Saqlain's own public account.

**Business**
- Pilot is entirely free — no payment ask from renters, owners, or outgoing tenants. Pricing model is explicitly deferred until after 5-10 real search parties complete a cycle.
- Launch mechanism: a waitlist, announced on Twitter under Saqlain's own name. The exact capacity cap (how many of the waitlist convert to active search parties) is **not pre-committed** — decide based on actual signup response, since Saqlain is the sole concierge and an uncapped commitment he can't service would be worse than a tight cap.

**Build**
- Solo build: Saqlain, using Claude Code and Codex, no collaborators for the pilot.
- Target: pilot live in **3-4 weeks** from 2026-08-31.
- Interface continues the direction of the earlier "Luma" prototype (photo-led review cards, finite daily batch not an infinite feed, shared shortlist, search-party activity, keyboard review controls — see `CONVERSATION.md` §7 and §12 for the full interaction spec already designed). Sequencing is **functionality first**, but with genuine design/UX/color-theory craftsmanship considered from the start of the build — not neglected and bolted on as a separate polish pass at the end. If the deadline forces a tradeoff, ship a working, less-polished version rather than slip the date for polish.

## Verification

Before reporting the PRD as done:
- Confirm the PRD explicitly addresses every section above (sourcing per-channel, outreach/compliance mechanics, guardrails, business model, build scope) — a reader should not need to go back to this handoff file or `CONVERSATION.md` to find a decision that's already been made.
- Confirm the PRD's stated scope is achievable by one person in 3-4 weeks using Claude Code/Codex — flag explicitly anything that looks like it won't fit, rather than silently including it.
- Read the PRD back once as if you were Saqlain about to start building tomorrow: is there any ambiguity left that would make you stop and ask a question mid-build? If yes, resolve it in the doc or flag it as an open question in a dedicated "Open questions" section — don't leave it implicit.

## Report back

Append a `## Results` section to this file with: the PRD's final location, a one-paragraph summary of its structure, and a list of any open questions you flagged rather than resolved.

## Results

**PRD location:** [`docs/PRD.md`](/Users/saqlainmomin/Munshi/docs/PRD.md) (v1.0, pilot).

**Structure summary:** The PRD runs 13 sections. It opens with a summary, promise, and pilot corridor (§1), then goals and the unchanged three-visit-worthy-flats success criterion plus startup-vs-personal-tool framing (§2), and an explicit non-goals list (§3). The middle builds the product: the search-party actor model and its collaboration rules (§4), the core user flows from party creation through the daily review loop, qualification, the auto-verify exception, scheduling, and the hybrid post-qualification model (§5), the Luma-derived interface/design direction with the functionality-first-craft-throughout sequencing rule (§6), and a product-level data model (§7). The decision-heavy back half maps one-to-one onto the handoff's settled constraints: sourcing per-channel with each channel's distinct risk posture plus the self-submitted intake (§8), Mira's outreach and full WhatsApp/opt-in compliance mechanics with the drafts-Saqlain-sends gate (§9), guardrails covering non-discrimination, default-delete retention, and capability-not-mechanism public messaging (§10), the free-pilot business model and waitlist launch (§11), and a build-scope section with an honest solo/3–4-week feasibility assessment, a week-by-week sequence, and an explicit descope path (§12). It closes with flagged open questions (§13). A reader does not need to consult this handoff or `CONVERSATION.md` to find any already-made decision.

**Feasibility flag:** The scope fits one person in 3–4 weeks using Claude Code/Codex, with one caveat made explicit in §12.2 — the **NoBroker scraper is the only item with unpredictable effort** (anti-bot, page changes). It is designed to be descoped to manual paste-into-intake if it threatens the date, since the pipeline is source-agnostic and X API + self-submission + manual entry can carry the pilot alone. Nothing else in scope looks like it won't fit.

**Open questions flagged (not resolved), from §13 — each with a recommended default, none blocking the build:**
1. **Reply capture fidelity** — manual logging of WhatsApp replies assumed acceptable at pilot volume; revisit only if it bottlenecks.
2. **Commute computation source** — specific maps/routing provider and its cost/quota not pinned; pick one in Week 1, coarse distance-band fallback acceptable since commute ranks rather than excludes.
3. **X account list** — the ~20 curated Bengaluru broker accounts must be assembled (a Week-1 data task, not a build task).
4. **"Search closed" trigger for default-delete** — no explicit flat-found event is modeled; a manual creator/Saqlain-triggered "close search" action suffices for the pilot.
