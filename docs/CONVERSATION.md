# Munshi product-discovery conversation

**Date:** 29 August 2026

**Participants:** Saqlain Momin and Codex

**Status:** Product discovery complete enough for a PRD; PRD not yet written.

> This is a chronological reconstruction from the visible conversation in the Codex task. It preserves every substantive exchange and decision, with some long responses condensed for readability. It excludes hidden reasoning, tool internals, and unrelated environment metadata; it is not represented as a byte-for-byte platform export.

## 1. Initial idea

**Saqlain:** Described years of mixed experiences finding rental apartments in India. A good broker can quickly find a suitable flat, while a poor search means browsing hundreds of listings, repeatedly explaining requirements, requesting photos, and visiting obvious mismatches. Important sources include Facebook Flat and Flatmates groups, Twitter/X accounts, Discord servers, Google-listed brokers, NoBroker, and personal referrals.

Proposed a product where a renter provides location, budget, furnishing needs, and qualitative preferences such as natural light. An agent searches existing public listings, analyses descriptions and photos, returns suitable options and contact details, asks brokers or posters for missing information, and eventually arranges visits. Requested that the idea first be fleshed out and then grilled for feasibility.

**Codex:** Split the initial concept into four possible promises: rental search assistant, rental concierge, broker/owner network, or end-to-end agent. Flagged that public visibility does not automatically permit automated reuse, and that automated Facebook/X collection and WhatsApp outreach carry platform constraints. Initially recommended starting with a search-assistant wedge.

## 2. End-to-end scope rather than timid wedges

**Saqlain:** Challenged the assumption that the product should start with only one component. Argued that none of the individual pieces is substantial alone and that many working components probably already exist online. Suggested that honest effort could assemble the whole process.

**Codex:** Accepted the correction. Distinguished technical assembly from operational reliability. Existing components cover search orchestration, listing extraction, vision analysis, preference ranking, messaging, scheduling, and human-review queues. The difficult parts are durable data access, listing freshness, outbound contact, truthfulness of photos, exception handling, and unit economics. Revised the recommendation to a thin end-to-end product rather than disconnected mini-products.

## 3. Persistent search and taste learning

**Saqlain:** Proposed giving agents their own social-media accounts so they could persistently monitor the right pages over multiple days. Suggested calibrating taste by showing varied properties and learning from what users approve or reject.

**Codex:** Agreed with the multi-day search and feedback loop. Clarified that an agent-controlled account does not itself authorise scraping: Meta acts against accounts associated with unauthorised scraping, and X restricts non-API automation. Proposed a loop of search → shortlist → feedback → taste profile → monitoring → improved shortlist → qualification → scheduling. Recommended separating hard constraints from learned soft preferences, keeping learning editable and reversible, and avoiding early feedback bubbles.

## 4. Hybrid sourcing posture

**Codex:** Presented three sourcing postures: durable/compliant, fast-but-brittle scraping, and hybrid.

**Saqlain:** Chose hybrid.

**Codex:** Defined hybrid as durable sources forming the core, with disclosed human-operated sourcing during the pilot to test the value of restricted channels before pursuing partnerships or other durable access.

## 5. Real pilot search

**Saqlain:** Supplied the first real use case:

- Saqlain and a roommate seeking a 2BHK in Bengaluru.
- Offices in Koramangala and Domlur.
- Preferred corridor around Koramangala, Indiranagar, and sensible areas between them.
- Approximately ₹60,000 rent, with brokerage acceptable.
- Deposit around ₹2.5–3 lakh.
- Fully furnished preferred.
- Abundant natural light, large windows, and a spacious/non-cramped feel are the most important qualitative needs.
- Gated society versus standalone building is not important.
- Corrected move-in date: 1 October 2026.

**Codex:** Turned this into the pilot search profile and clarified the remaining trade-offs.

### Search decisions

**Saqlain:** Chose a ₹60,000 target with exceptional options permitted up to ₹65,000.

**Saqlain:** Chose natural light and spaciousness as the primary preference, while requiring the property to remain practically close to both offices because Bengaluru travel is painful.

**Saqlain:** Confirmed two-wheeler as the usual commute mode, with autos sometimes used.

**Saqlain:** Set a maximum typical weekday peak commute of approximately 35 minutes to either office.

## 6. Contact autonomy

**Codex:** Asked whether the agent should contact every match automatically, ask before every contact, or contact after a user shortlists a property.

**Saqlain:** Chose contact after a participant shortlists or likes a property.

Later, an exception was added: if a potentially excellent listing is missing information required to evaluate it, the agent may automatically contact the poster only to verify those missing facts. Complete listings still require a participant to request qualification.

## 7. Interface direction

**Saqlain:** Asked that UI ideas be covered and that Codex give a genuine opinion when the discussion reached them.

**Saqlain:** Proposed a clean, non-stressful feed with a Tinder-style accept/reject review mechanic for newly found flats. Asked for an unusually fresh and professional experience—described as “GTA 6 level” attention to quality.

**Codex:** Supported a photo-led review interaction but recommended a finite decision queue rather than an addictive infinite feed. The product should say that the agent found a bounded number of new matches and let the user review them quickly. Each property should show photos, price, deposit, freshness, commute, why the agent selected it, natural-light/spaciousness assessment, uncertainties, and source. Passing should be immediate, with optional reasons. Shortlisting should be collaborative. “GTA 6 level” was translated into excellent pacing, transitions, photography, hierarchy, speed, microcopy, and confidence rather than noisy gamification.

**Saqlain:** Asked to resolve rough edges before building an interaction prototype.

## 8. Search-party collaboration

**Saqlain:** Chose a shared shortlist rather than independent or primary-searcher-only review.

**Saqlain:** Chose the rule that any participant may explicitly tap “Qualify this flat”; shortlisting alone does not automatically contact anyone.

**Saqlain:** Initially discussed two roommates, then clarified that searches may have one participant or three or more—not always exactly two roommates.

**Codex:** Generalised the actor model from “roommates” to a **search party**.

**Saqlain:** Chose these group rules:

- The search creator controls budget, locations, move date, and hard constraints.
- Other participants may suggest changes.
- Any participant can trigger qualification or request a visit, with the group notified.
- Each person has an individual taste profile and review state.
- Everyone receives the same complete hard-constraint-matching property pool, but ordering is personalised.
- Individual rejection hides a property only for that participant; it does not remove the property for everyone.

## 9. Qualification and scheduling

**Saqlain:** Chose the scheduling rule that either/any participant may request a visit, choose from available times, and notify the rest of the search party. Unanimous approval is not required.

**Saqlain:** Chose new-match delivery consisting of immediate alerts for exceptional or fast-moving matches plus a calm daily review batch.

**Saqlain:** Preferred the daily batch to contain every listing that satisfies hard requirements rather than an arbitrary cap, ordered by predicted fit.

**Saqlain:** Clarified that incomplete but promising listings should be verified by the agent before being treated as real matches. Automatic outreach is allowed only to obtain missing information.

## 10. Agent identity

**Codex:** Asked whether outreach should be framed as a transparent AI assistant, a human concierge, or the renter directly.

**Saqlain:** Initially selected a transparent assistant but expressed a preference for labelling the agent as human, reasoning that shortlist qualification is a fairly flat process and in-person negotiations establish final trust.

**Codex:** Strongly advised against concealed automation because it creates trust, platform, and reputational risk. Proposed a warm named concierge that discloses once that it is an AI assistant.

**Saqlain:** Agreed.

**Decision:** The concierge may have a human name and personality, but its first message must clearly identify it as an AI assistant. A real human joining later must also be explicit.

## 11. Taste feedback and visual analysis

**Saqlain:** Chose immediate rejection with optional reason chips rather than mandatory feedback or only occasional prompts.

**Saqlain:** Later suggested that one rejection may have multiple reasons.

**Decision:** Rejection feedback is optional and multi-select—for example, “too dark,” “feels cramped,” and “dated interiors” may all apply. It tunes only that participant's personal profile.

**Saqlain:** Accepted Codex's recommendation that photo-based natural-light and spaciousness analysis should rank and explain properties but never automatically discard them. This can be revisited after observing the real quality of the analysis.

## 12. Interaction prototype

**Saqlain:** Approved building a focused browser prototype of the daily review loop.

**Codex:** Built a directional prototype, temporarily named **Luma**, using original generated Bengaluru apartment imagery. It covered:

- Opening a daily batch.
- Reviewing photo-led property cards.
- Passing and providing optional feedback.
- Adding a property to a shared shortlist.
- Displaying search-party activity.
- Asking the AI concierge, Mira, to qualify a complete listing.
- Showing that Mira is already verifying missing facts for an incomplete listing.
- Desktop and mobile layouts, keyboard review controls, and polished motion.

The prototype was verified in a browser with no console errors. The interaction code was retained in temporary prototype storage rather than added to this repository.

**Saqlain:** Liked the rough direction while noting that colours, typography, formatting, and other visual elements may change. Asked for multi-reason rejection feedback and confirmed that nothing had yet been designed after qualification.

**Codex:** Added and verified multi-select rejection reasons. Confirmed that the first prototype deliberately stopped at “Qualification started.”

## 13. Post-qualification direction

**Codex:** Presented three mechanisms:

1. The property evolves in place into a verified dossier.
2. Mira reports through an agent-update inbox.
3. A hybrid where Mira's update draws attention while the shortlist property record remains canonical.

**Saqlain:** Chose the hybrid and stopped further prototyping.

**Decision:** Mira's update announces qualification results, while the canonical shortlist record contains verified facts, changed facts, group reactions, and visit actions. Detailed post-qualification states remain for later design.

## 14. Pilot success criterion

**Saqlain:** Defined success as shortlisting three flats through the product. Even if none becomes the final home, the pilot is successful if shortlisting is smooth and hassle-free and the renter's only meaningful work is approving what they like. That result should create confidence that a suitable flat will arrive in the following days.

**Codex:** Formalised the success criterion:

> A search succeeds when it produces at least three genuinely visit-worthy shortlisted flats while the renter's work is limited to reviewing and approving options.

## 15. Feasibility grill

**Codex:** Gave the concept a strong problem and pilot-readiness score but warned that current differentiation, data durability, and scalable economics remain weak or unproven.

Key conclusions:

- The problem is real and technically feasible.
- “AI matching plus a personalised feed” is already crowded and is not the moat.
- The core product is reliable delegation: users express requirements once and current, contactable, suitable flats continue appearing.
- Facebook/X-dependent scraping is existentially brittle.
- Human-operated sourcing can validate demand but cannot masquerade as a scalable ingestion strategy.
- Freshness and qualification create operational costs because every incomplete listing can require a conversation.
- Rental search is episodic, so customer acquisition must be cheap, referral-driven, employer-supported, or monetised strongly during the active search window.
- Photo-based taste is valuable but will commoditise and must remain explainable and reversible.
- Search-party identity, offices, budget, taste, and broker conversations require deliberate privacy and deletion rules.
- The product must not optimise around discriminatory preferences.

Three product shapes were compared:

1. AI rental marketplace.
2. Renter-side search agent.
3. Search-party workspace.

**Codex recommendation:** Build the **renter-side search agent**, using the search-party workspace as its interaction model. Do not position it as another property marketplace.

Recommended initial promise:

> Give us your requirements once. We continuously find and qualify flats until you have three worth visiting.

Recommended validation shape: 5–10 Bengaluru search parties in a narrow geographic corridor, durable sources where possible, disclosed manual sourcing for restricted communities, and gradual replacement of manual acquisition with broker/community feeds where evidence supports it.

## 16. Repository creation

**Saqlain:** Named the project **Munshi** and requested a new local folder, a Markdown record of the conversation, and a push to `https://github.com/saqlainmmomin/Munshi.git`.

**Codex:** Created this repository and recorded the visible product-discovery conversation. The next intended product step is to confirm the recommended renter-side search-agent shape and write the PRD.
