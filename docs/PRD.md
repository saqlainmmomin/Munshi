# Munshi — Pilot PRD

**Version:** 1.0 (pilot)
**Date:** 2026-08-31
**Owner / sole builder:** Saqlain Momin
**Build window:** pilot live within 3–4 weeks of 2026-08-31
**Status:** Ready to build. Product discovery ([`CONVERSATION.md`](CONVERSATION.md)) and a follow-up grill session are both complete; every decision below is settled, not open, unless listed under **Open questions**.

---

## 1. Summary

Munshi is a **renter-side apartment search agent** for India. A renter (alone or with roommates — a *search party*) describes what they need once. Munshi then continuously finds, ranks, and qualifies rental flats from multiple sources, and — through an AI concierge named **Mira** — coordinates outreach to posters, so the renter's only real job is reviewing a calm daily batch of photo-led cards and approving the ones worth visiting.

The pilot is a **concierge-assisted** build: automated sourcing where it's durable, manual sourcing where automation is too risky, and human-in-the-loop outreach for the entire pilot. It is deliberately *not* a marketplace and *not* an owner/broker product.

> **Product promise:** Give us your requirements once. We continuously find and qualify flats until you have three worth visiting.

**Pilot corridor:** the Koramangala–Indiranagar–Domlur belt, Bengaluru.

---

## 2. Goals and success criteria

### Primary success criterion (unchanged from `CONVERSATION.md` §14)

> A search succeeds when it produces **at least three genuinely visit-worthy shortlisted flats** while the renter's work is limited to reviewing and approving options.

"Genuinely visit-worthy" means: matches all hard constraints, plausibly matches the soft preferences (natural light, spaciousness, commute), is currently available, and has a reachable poster.

### Pilot-level goals

- Run **5–10 real search parties** through at least one full cycle (requirements → daily batches → shortlist → qualification → visit request).
- Prove that **reliable delegation** is the value: the renter expresses requirements once and current, contactable, suitable flats keep arriving without them re-explaining themselves.
- Validate the **outgoing-tenant intake channel** as a differentiated, low-competition supply source.
- Establish enough of a track record (real conversations, real shortlists) to decide post-pilot on autonomy, monetization, and scaling.

### Explicit ambition framing

This is a **startup bet, not just a personal tool** — but it will be bootstrapped and validated before being treated as fundable. No monetization in the pilot (see §11).

### What "done" means for the pilot build

A working web app where a search party can be created, receives daily batches of real sourced listings, can shortlist and trigger qualification, and where Mira drafts outreach that Saqlain approves and sends from an ordinary WhatsApp number. Everything in §12's scope, nothing beyond it.

---

## 3. Non-goals (explicitly out of scope for the pilot)

- **No marketplace.** No two-sided product, no listing fees, no transactions.
- **No owner/broker-facing product.** No listing-management dashboard. The self-submission form (§8.4) is a single generic intake, not a second product surface.
- **No monetization.** No pricing, no payment ask to anyone (§11).
- **No fully autonomous outreach.** Mira drafts; Saqlain approves and sends every message for the entire pilot (§9).
- **No WhatsApp Business API / Cloud API** in the pilot (§9). Deferred to post-pilot.
- **No Facebook automation** of any kind (§8.3).
- **No cross-search learning / aggregate taste model.** Data is default-deleted per search party (§10.2).
- **No discriminatory filtering.** Restricted-tenancy attributes are shown as facts, never as filters (§10.1).
- **No verification pipeline** beyond Saqlain's personal sanity-check of self-submitted listings (§8.4).
- **No detailed post-qualification workflow design.** Qualification produces a dossier update; deep post-visit states (negotiation, agreement, move-in tracking) are later work (§5.6).
- **No native mobile app.** Responsive web only (§6).

---

## 4. Actors and the search-party model

The unit of use is a **search party** — one or more people searching together. (Generalized from "roommates" in `CONVERSATION.md` §8.)

| Actor | Role |
|---|---|
| **Search creator** | Owns the search. Controls budget, locations, move date, and hard constraints. |
| **Participant** | Any other member. Reviews listings, shortlists, triggers qualification, requests visits. May *suggest* constraint changes but not set them. |
| **Mira** | The AI concierge. Ranks, explains, drafts outreach, and reports qualification results. Discloses she is an AI on first contact. |
| **Saqlain (concierge operator)** | For the pilot only: sanity-checks self-submitted listings, and reviews/approves/sends every Mira-drafted outbound message. Invisible to the search party as an operator except where a real human is explicitly introduced. |

### Search-party rules (from `CONVERSATION.md` §8–9, binding)

- Everyone in a party sees the **same complete pool** of listings that satisfy the hard constraints; **ordering is personalized** per participant.
- Each participant has an **individual taste profile and review state**.
- An **individual rejection** hides a listing only for that person — it does not remove it for the party.
- The **shared shortlist** is collaborative. Shortlisting alone contacts no one.
- **Any participant** may tap **"Qualify this flat"** or request a visit; the whole party is notified. **Unanimous approval is not required.**
- Constraint changes are creator-controlled; others suggest.

---

## 5. Core user flows

### 5.1 Create a search party

1. Creator provides: **locations/corridor**, **budget** (target + exceptional ceiling), **move-in date**, **furnishing need**, **BHK / occupancy**, **commute anchors** (office locations + acceptable peak commute + mode), and **qualitative preferences** (free text + guided prompts, e.g. natural light, spaciousness).
2. Creator separates **hard constraints** (must-match; used to build the pool) from **soft preferences** (used to rank, never to exclude).
3. Creator invites participants (link/code). Each new participant starts with an empty taste profile.

*Reference profile (the real pilot search, `CONVERSATION.md` §5): 2BHK, Koramangala/Indiranagar corridor, offices in Koramangala + Domlur, ~₹60k target / ₹65k exceptional ceiling, deposit ~₹2.5–3L, fully furnished preferred, natural light + spaciousness primary, ≤~35 min weekday peak commute to either office, two-wheeler commute, move-in 1 Oct 2026.*

### 5.2 Daily review loop (the core interaction)

- Munshi assembles a **finite daily batch** — *every* listing that matches the hard constraints since the last batch, ordered by predicted fit (no arbitrary cap). This is a bounded queue, **not an infinite feed**.
- **Exceptional or fast-moving** matches also trigger an **immediate alert** outside the daily batch.
- Each **property card** shows: photos (photo-led), price, deposit, freshness, computed commute to each anchor, **why Mira selected it**, a **natural-light / spaciousness assessment**, **uncertainties**, and **source**.
- Review controls: **pass** (immediate, with optional **multi-select reason chips** — e.g. "too dark," "feels cramped," "dated interiors" — tuning only that participant's profile) or **add to shared shortlist**. Keyboard controls supported.
- Passing/shortlisting is fast and low-stress. Feedback is optional.

### 5.3 Shortlist and qualification

- The **shared shortlist** shows all party-shortlisted properties plus search-party activity.
- Any participant taps **"Qualify this flat."** This is the trigger — not shortlisting — that authorizes contacting the poster (§9). The party is notified.
- Mira drafts the outreach; Saqlain approves and sends (§9). Mira reports results back.

### 5.4 Auto-verify exception (from `CONVERSATION.md` §6, §9)

- If an **otherwise-promising listing is incomplete** (missing a fact needed to evaluate it — e.g. deposit, furnishing, availability), Mira may **auto-contact the poster solely to verify those missing facts**, *without* waiting for a shortlist. This is the only pre-shortlist outreach allowed. Complete listings always require an explicit qualify action.
- Even this auto-verify outreach goes through the same **draft → Saqlain approves → send** gate as all other outreach in the pilot.

### 5.5 Scheduling a visit

- Any participant may **request a visit**, choose from available times, and the rest of the party is notified. Unanimous approval not required.
- Pilot scheduling is lightweight: Mira drafts a scheduling message; times are coordinated over the same WhatsApp thread. No calendar-integration build required for the pilot.

### 5.6 Post-qualification (hybrid model, `CONVERSATION.md` §13)

- Mira posts an **update announcing the qualification result** (an agent-update that draws attention).
- The **canonical shortlist record** holds the verified facts, any changed facts, group reactions, and visit actions.
- Detailed post-qualification states (negotiation, agreement, move-in) are **out of scope** for the pilot build.

---

## 6. Interface and design direction

**Visual-design reference (binding, chosen 2026-09-04):** [`design/explorations/volcanic-graphic.html`](../design/explorations/volcanic-graphic.html) — the "Volcanic Graphic" direction, picked by Saqlain after a multi-round exploration (see [`tasks/handoffs/2026-09-03-design-exploration.md`](../tasks/handoffs/2026-09-03-design-exploration.md) for the full history and rejected alternatives). Going forward, UI work should follow its system: warm limestone/pumice canvas (`#e2e2df`/`#f7f6f2`), ember-orange (`#fc5000`) as the sole aggressive accent with violet (`#524ae9`) as a secondary, ultrabold condensed display type (Oswald) paired with DM Sans body copy, flat/shadowless surfaces with 40px card radii and full-pill controls, a duotone-halftone treatment for hero photography (not abstract gradients — that direction was explicitly tried and rejected), and restrained, purposeful motion (Ken Burns pans, staggered entrances, magnetic-pull buttons) rather than decorative animation. Treat the mock as the reference to match, not just inspiration — update it (two-pass rule still applies) rather than diverging from it silently.

Continues the earlier **Luma** prototype direction (`CONVERSATION.md` §7, §12):

- **Photo-led review cards.**
- **Finite daily batch**, not an infinite feed.
- **Shared shortlist** + **search-party activity**.
- **Keyboard review controls**, polished motion, desktop and mobile responsive layouts.
- "GTA 6 level" translated (per §7) as **excellent pacing, transitions, photography, hierarchy, speed, microcopy, and confidence** — not gamification.

**Sequencing:** **functionality first**, but with genuine design/UX/color craftsmanship considered *from the start of the build* — not bolted on at the end. **If the deadline forces a tradeoff, ship a working, less-polished version rather than slip the date.** (This is the standing two-pass design rule: one design pass at build, one before exposure, none between.)

Platform: **responsive web app** (no native app in the pilot).

---

## 7. Data model (product level)

Enough to build against; not a schema spec. All of this is subject to the retention rules in §10.2.

- **SearchParty** — id, creator, members[], status (active / closed), created_at. Holds the hard constraints (budget target + ceiling, locations/corridor, move date, BHK/occupancy, furnishing, commute anchors + max peak minutes + mode) and soft preferences (free text + tags).
- **Participant** — id, party_id, display name, individual **TasteProfile** (learned soft-preference weights + reason-chip history), individual review state.
- **Listing** — id, source channel (nobroker / x / facebook-manual / self-submitted / whatsapp-manual), source ref/url, raw captured fields, normalized fields (price, deposit, BHK, furnishing, location, availability), photos[], freshness/seen_at, **completeness flags** (which required facts are missing), **restricted-tenancy attributes** (informational only — see §10.1), poster contact (if known).
- **MatchState** — per (participant, listing): ranked / passed / shortlisted; pass reasons[]; predicted-fit score; light/spaciousness assessment; uncertainties.
- **Shortlist** — party-level set of listings, with activity log and group reactions.
- **QualificationThread** — links a shortlisted (or auto-verify) listing to the outreach conversation: drafted messages, approval state, sent messages, replies, verified/changed facts, result summary.
- **DailyBatch** — per participant per day: the ordered set of newly-matching listings surfaced.

Photo-based natural-light/spaciousness analysis **ranks and explains** but **never auto-discards** (`CONVERSATION.md` §11). Revisit-able after observing real analysis quality.

---

## 8. Sourcing — three channels + self-submitted intake

Each channel carries a **deliberately different risk posture**. These were settled in the grill session and are not to be relitigated.

### 8.1 NoBroker — automated, read-only scraping

- **Mechanism:** automated read-only scraping of **public listing pages** in the pilot corridor.
- **Risk posture:** knowingly accepted. This carries an **unfair-competition / competitor-scraping** angle (beyond ordinary ToS exposure). **Saqlain is aware and has accepted this for pilot scale.** No public messaging will name NoBroker or mention scraping (§10.3).
- **Build:** scheduled scraper for the corridor; normalize into `Listing`; dedupe against other channels; flag incomplete listings for the auto-verify path.

### 8.2 X (Twitter) — deferred to post-pilot

- **Original plan:** official paid X API (~$40–50) polling ~20 broker accounts.
- **Decision (2026-09-02):** the cheapest paid X API tier (Basic) is **$200/month**, which doesn't fit the pilot budget. X sourcing is **deferred**. Any promising X listings Saqlain spots while browsing are pasted into the manual intake form (§8.4), same as Facebook.
- **No code is built for this channel in the pilot.**

### 8.3 Facebook groups — manual only

- **Mechanism:** **Saqlain personally browses** relevant Bengaluru Flat/Flatmates groups. **No automation, no bot account, no scraping.**
- **Why manual:** Meta's scraping enforcement is the most aggressive of the three and, **as of Jan 2025, covers logged-out access too.** The automation risk here was judged not worth taking at any scale.
- **Build:** a simple **manual-entry path** (reuses the self-submission intake, §8.4) so Saqlain can paste a promising Facebook listing into the same pipeline. No Facebook integration code.

### 8.4 Self-submitted listing intake

- **One generic intake form/channel** feeding the **same pipeline** as scraped/API listings. It is **explicitly not a second product surface** — no dashboard, no owner/broker product.
- **Marketing target:** actively solicited **only from outgoing tenants** (current tenants moving out, seeking someone to take their room/flat) in the pilot corridor. This is the **differentiated, low-competition segment** — today it lives entirely in WhatsApp/word-of-mouth with no durable channel. Owners/brokers aren't *blocked* from using the form if they find it organically, but **no marketing effort targets them** (they already have NoBroker, Facebook, personal networks).
- **Verification:** none beyond **Saqlain personally sanity-checking** each submission before it enters the pipeline. Justified by tiny expected volume at 5–10 search parties.
- **Build:** a public form → submissions queue → Saqlain approves → `Listing` in pipeline. This same queue absorbs the manual Facebook entries from §8.3.

### 8.5 Cross-channel handling

- All inputs normalize into the **same `Listing` model** and the **same daily-batch pipeline**. For the pilot, active channels are **NoBroker (automated, if stable)** and **manual intake (Facebook, X, WhatsApp groups, broker forwards)**. Dedupe across channels (same flat posted in multiple places). Incomplete listings from any channel are eligible for the auto-verify exception (§5.4).

---

## 9. Outreach — Mira, the AI concierge

### 9.1 When outreach happens

- **Only after a participant taps "Qualify this flat"** (`CONVERSATION.md` §6), **plus** the single exception: **auto-verify missing facts** on an otherwise-promising incomplete listing (§5.4).

### 9.2 Channel: ordinary WhatsApp number (deliberate reversal in the grill)

- Outreach goes through a **separate ordinary WhatsApp number** — **not** the WhatsApp Business API / Cloud API.
- **Why:** cold-messaging brokers who have never messaged first **would violate WhatsApp's opt-in policy for business-initiated conversations.** Research confirmed this is a **real policy violation, not a gray area**, and block-rate risk on a brand-new Business number at tiny volume is high. An **ordinary WhatsApp number sidesteps this**: it is not a Business-API business-initiated conversation under Meta's rules — it's **mechanically identical to a person texting a broker**, which is normal, everyday practice.

### 9.3 Human-in-the-loop: Mira drafts, Saqlain sends

- **For the entire pilot:** Mira **drafts** every outbound message; each is **queued for one-tap human review/approval** before Saqlain sends it. **Not fully autonomous.** This applies to qualification outreach *and* auto-verify outreach.
- Full autonomy is **revisited post-pilot**, once there's a track record of real conversations.

### 9.4 Identity disclosure (binding, `CONVERSATION.md` §10)

- Mira may have a **human name and warm personality**, but her **first message must clearly identify her as an AI assistant.** A real human joining a thread later must be **explicit** about it too.

### 9.5 Build for outreach

- A **draft queue UI** for Saqlain: shows the target listing, the drafted message, and a one-tap approve/edit/send. Because the pilot uses an ordinary WhatsApp number, "send" can be as simple as copy-to-clipboard / deep-link into WhatsApp, or a lightweight WhatsApp automation Saqlain drives manually — **no Business API integration is built.**
- Replies are captured back into the `QualificationThread` (manually logged is acceptable at pilot volume).

### 9.6 Post-pilot (explicitly deferred)

- WhatsApp Business API + automation becomes a consideration **once real opt-in exists** (e.g. a broker replies first, legitimately opening a window) **and** volume justifies the compliance setup: Meta Business verification takes **3–10 business days**; per-conversation pricing is roughly **₹0.86/marketing conversation in India (2026)**, though a BSP's platform/subscription fee is the larger cost driver at real scale.

---

## 10. Guardrails

### 10.1 Non-discrimination

- Restricted-tenancy attributes common in Indian rental ads — **vegetarian-only, bachelors-not-allowed, family-only, gender-restrictive, caste/community signals** — are surfaced to the renter as **informational facts only** (e.g. "this listing requires vegetarian tenants").
- They are **never exposed as a search filter**. **Munshi itself must not be the thing doing discriminatory sorting.** Ranking uses the party's soft preferences (light, space, commute), never these attributes.

### 10.2 Data retention — default-delete

- **Default-delete all search-party data** — budget, contact info, chat transcripts, taste profile — **once a search closes** (flat found, or party disbands), **unless the user explicitly opts to keep it.**
- **No indefinite retention. No cross-search aggregate learning** for the pilot.
- **Build:** a `status` on `SearchParty`; closing a search triggers deletion of its associated participant/taste/thread data unless a "keep" flag is set. Privacy and deletion rules were called out as required in `CONVERSATION.md` §15.

### 10.3 Public-facing messaging — capability, not mechanism

- The Twitter launch and any landing-page copy describe Munshi's **capability**, **never its sourcing mechanism.** **Do not name NoBroker. Do not state that scraping is involved.**
- **Why:** to avoid drawing a scraped competitor's attention exactly when traffic is being driven to Saqlain's own public account.

---

## 11. Business model and launch

### 11.1 Pilot is free

- **Entirely free** — no payment ask to renters, owners, or outgoing tenants.
- **Pricing model is deferred** until after **5–10 real search parties** complete a cycle. Rental search is episodic (`CONVERSATION.md` §15), so eventual acquisition must be cheap, referral-driven, employer-supported, or monetized strongly within the active-search window — but **none of that is decided or built in the pilot.**

### 11.2 Launch mechanism

- A **waitlist**, announced **on Twitter under Saqlain's own name.**
- **Capacity cap is not pre-committed.** Decide how many waitlist signups convert to active search parties **based on actual signup response** — Saqlain is the sole concierge, and an uncapped commitment he can't service is worse than a tight cap.
- **Build:** a public **waitlist signup** + landing page (capability-only copy, §10.3). Converting a waitlist entry to a live search party is a manual, Saqlain-gated step.

---

## 12. Build scope and 3–4 week plan

**Builder:** Saqlain, solo, using Claude Code and Codex. No collaborators.
**Target:** pilot live within 3–4 weeks of 2026-08-31.

### 12.1 What ships in the pilot

1. **Web app** (responsive): create/join search party; daily review loop (photo-led cards, keyboard controls, multi-select pass reasons); shared shortlist + party activity; qualify action; Mira updates.
2. **Sourcing pipeline:** NoBroker scraper (corridor, timeboxed), manual intake form (absorbs Facebook, X, WhatsApp groups, broker forwards — all manual for the pilot), normalization + dedupe into one `Listing` model, completeness flagging.
3. **Ranking:** hard-constraint pool + per-participant soft-preference ordering; photo-based light/spaciousness assessment that ranks + explains (never auto-discards); computed commute to anchors.
4. **Mira outreach:** draft queue with one-tap approve/edit/send via ordinary WhatsApp; AI-identity disclosure baked into first-message templates; auto-verify path for incomplete listings; reply logging into qualification threads.
5. **Guardrails:** restricted-attributes shown as facts (never filters); default-delete on search close; capability-only public copy.
6. **Launch surface:** landing page + waitlist; manual waitlist→party conversion.

### 12.2 Feasibility assessment (solo, 3–4 weeks, Claude Code/Codex)

**Achievable in the window:**
- The **review-loop web app** is the largest but most tractable piece (the Luma prototype already proved the interaction).
- **X API** is deferred (Basic tier is $200/month, exceeds pilot budget); X listings are manually pasted into intake.
- **Self-submission form + manual queue** is trivial and doubles as the Facebook path.
- **Draft-and-send outreach** over an ordinary WhatsApp number is deliberately low-tech (copy/deep-link), avoiding any Business-API build.
- **Guardrails** (facts-not-filters, default-delete, copy discipline) are policy + small code, not heavy engineering.

**The genuine risk / effort concentration — flag:**
- The **NoBroker scraper** is the least predictable item: anti-bot measures, page-structure changes, and corridor coverage can eat time unpredictably. **Mitigation:** the pipeline is source-agnostic — if the scraper proves fragile within the window, the pilot can still run on **X API + self-submission + manual Facebook/NoBroker entry** (Saqlain pasting listings into the same intake queue) without blocking launch. Treat full NoBroker automation as the **first thing to descope to manual** if the 3–4 week date is at risk.
- **Ranking quality** (soft-preference ordering, photo assessment) can be shipped simple and improved live; it does not gate launch.

**Net:** the scope **fits one person in 3–4 weeks** provided NoBroker automation is treated as descope-able to manual entry rather than a hard launch dependency. Nothing else in scope looks like it won't fit.

### 12.3 Suggested sequencing (functionality-first, craft-throughout)

- **Week 1:** search-party creation + data model + review-loop shell with real cards from **manual intake** (all sources manual for the pilot). Design system established up front. Self-submission / intake form live.
- **Week 2:** shortlist + qualify + Mira draft queue + WhatsApp send flow + AI-disclosure templates + auto-verify path.
- **Week 3:** NoBroker scraper (timeboxed; fall back to manual entry if fragile), dedupe/normalization hardening, guardrails (facts-not-filters, default-delete), commute + photo ranking.
- **Week 4:** landing page + waitlist, polish pass (the pre-exposure design pass), end-to-end dry run with the real reference search, launch.

---

## 13. Open questions

None of these block the start of the build; each is flagged rather than silently resolved, per the handoff's verification step.

1. **Reply capture fidelity.** §9.5 assumes manual logging of WhatsApp replies into `QualificationThread` is acceptable at pilot volume. If reply volume is higher than expected, a lightweight capture mechanism may be needed mid-pilot. *Recommendation: start manual, revisit only if it becomes a bottleneck.*
2. **Commute computation source.** The plan requires computed weekday-peak commute to office anchors (≤~35 min in the reference profile). The specific routing/traffic data source (e.g. a maps API and its cost/quota) is not pinned down. *Recommendation: pick a single maps provider in Week 1; if cost/quota is a concern at pilot scale, a coarse distance-band estimate is an acceptable fallback since commute ranks rather than excludes.*
3. ~~**X account list.**~~ Deferred with X API (2026-09-02). Saqlain manually pastes promising X listings into the intake form.
4. **"Search closed" trigger for default-delete.** §10.2 deletes on flat-found or party-disband, but the pilot has no explicit "we found a place" event modeled beyond visit requests. *Recommendation: a manual "close search" action (creator-triggered, or Saqlain-triggered) is sufficient for the pilot; full lifecycle automation is post-pilot.*

---

*All decisions in this PRD trace to [`CONVERSATION.md`](CONVERSATION.md) and the 2026-08-31 grill session. Sections 8–11 reflect settled, non-relitigable decisions.*
