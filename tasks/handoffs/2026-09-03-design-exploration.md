# Handoff — Design exploration: brand + screen prototypes from inspiration

**From:** Claude (prior session)  ·  **To:** Claude (fresh session)  ·  **Date:** 2026-09-03

## Goal

Saqlain will attach several design inspiration images/sites to the message that starts this session. Turn those into a small set of genuinely distinct visual-direction prototypes for Munshi's web app — from brand guidelines (color/type/tone) through end-to-end screen mockups — that he can compare side by side before committing to one direction.

Definition of done: Saqlain has looked at 3-4 prototype directions, each internally consistent and clearly different from the others, and has picked one (or asked for a hybrid/another round).

**Do not skip straight to building.** The value of this session is in the analysis-and-question step before any prototype exists — see Process below.

## Current state

- Munshi is a renter-side apartment search agent for India (pilot: Bengaluru). Read [`docs/PRD.md`](../../docs/PRD.md) for product truth before proposing any screen.
- `apps/web/` already has a working **swipe-based review interface** for the daily listing review loop (see [`components/ReviewCard.tsx`](../../apps/web/components/ReviewCard.tsx) and [`app/party/[id]/review/`](../../apps/web/app/party/[id]/review/)). Saqlain has said this core interaction **feels okay as-is** — this is a baseline to preserve and skin, not reinvent. Don't propose a different core review interaction unless he asks for one.
- No brand guidelines exist yet (no defined color system, type scale, voice/tone doc). This session is establishing that from scratch, driven by inspiration rather than invented from nothing.
- Other surfaces that exist and will eventually need the same visual language: landing/waitlist, auth, search-party creation, operator intake console, shortlist, qualify/Mira draft review. Full inventory: skim `apps/web/app/` for current routes.
- Per [`AGENTS.md`](../../AGENTS.md) §2, Claude owns "product/design craft" and all of `apps/web/`. This work is inside that lane — no coordination needed with Codex (who owns `services/worker/` only).

## Process (follow in order — do not collapse steps)

1. **Look at every inspiration Saqlain attaches.** For each one, name concretely what's present: layout structure, color palette, type choices, density, motion/interaction cues, tone of copy, iconography, imagery style — whatever is actually visible. Don't editorialize yet.
2. **Ask, don't assume, what he liked.** For each inspiration, ask specifically what drew him to it — is it the color, the density/whitespace, the typography, a specific component, the overall mood/tone, something else? Different people pull different things from the same reference; guessing wrong here wastes the whole exploration. Ask as one batched set of focused questions (per global instructions: 2-3 concrete alternatives per question, not open-ended).
3. **Only after he answers, synthesize.** Identify which liked elements are compatible with each other and which pull in different directions — that's the raw material for making the prototypes *actually* different from each other rather than variations on one look.
4. **Build 3-4 prototype directions**, each combining a distinct subset/emphasis of the liked elements — deliberately varied in feel (e.g. one warm/editorial, one dense/utilitarian, one minimal/quiet, one bold/high-contrast — actual axes should come from what he liked, not this example list). Each direction should include:
   - A short brand rationale (2-3 sentences: what this direction is going for and why, tied back to what he said he liked).
   - A color + type system (not just "looks nice" — name the actual palette and type scale).
   - 2-3 representative screens applying that system: at minimum the swipe review card (skinned, not restructured) and one or two other surfaces (e.g. landing, shortlist, or search-party setup — pick what best shows off the direction's range).
5. Present all directions together so they're easy to compare, and ask which one to take forward (or whether to hybridize).

## Key files

- [`docs/PRD.md`](../../docs/PRD.md) — product truth; read before designing any screen so mockups reflect real flows, not invented ones.
- [`AGENTS.md`](../../AGENTS.md) — role split and guardrails (§7 — non-discrimination, AI disclosure, etc. apply to copy/UI too, not just backend logic).
- [`components/ReviewCard.tsx`](../../apps/web/components/ReviewCard.tsx) — the existing swipe review card to preserve and skin.
- [`app/`](../../apps/web/app/) — current routes/surfaces, for inventory of what else may need the visual language.
- `docs/` — check for any existing design notes before assuming there are none.

## Constraints

- Prototypes are for **comparison, not production**. Build them as fast-to-iterate artifacts (standalone HTML/CSS, or throwaway isolated routes/components) — not wired into real data, auth, or the production component tree. Optimize for "easy to look at and discard," not code quality.
- Keep the swipe interaction itself intact across all directions — vary its skin (color, type, card layout, motion) not its mechanics, unless Saqlain explicitly asks to also explore alternative interactions.
- Follow PRD §10 guardrails in any copy shown in mockups: AI disclosure language where Mira appears, no discriminatory framing in card copy, no naming of sourcing mechanisms (never say "scraping" or name NoBroker in user-facing copy).
- Two-pass design rule (from Saqlain's global guidelines): one pass to build each direction, one pass after he picks a direction to refine it. Don't over-polish all 3-4 directions to production quality — that defeats the point of comparing directions cheaply.
- This is exploration — do not commit prototype code to `apps/web/` production paths or open a PR. Keep it scoped to a scratch location or a clearly-marked `design/` area until a direction is chosen.

## Verification

Not applicable in the usual smoke-test sense (no backend behavior to prove). "Done" here means: Saqlain has viewed all directions and made a choice, or told you what to change and you're iterating within the two-pass rule.

## Report back

Append a `## Results` section to this file: which directions were built (short description of each), which one Saqlain picked (or what hybrid/next step he asked for), and where the winning prototype's assets/code live so a future session can build the real thing from it.

## Results

### What was reviewed

Looked at all 5 inspiration sources before asking anything:
- **Orchid screenshot** (attached image): dark-navy serif display headline, blurred mesh-gradient background, white mega-menu card grid, pill nav buttons.
- **Caldera** (`styles.refero.design/style/fe8cdcf9...`): warm limestone canvas, ember-orange (#fc5000) + violet halftone accent, ultrabold condensed display type to 189px, fully flat/shadowless, 40px card radii + full-pill controls.
- **Origami Fold Menu** (Fable 038): cream/kraft palette, serif headline + italic terracotta accent, monospace numbered labels, panels that hinge-swing then accordion-unfold.
- **Magnetic Microinteractions** (Fable 054): white cards on lavender gradient, indigo accent, 10 spring-physics interactions (magnetic button, liquid toggle, drawn checkmark, particle-burst like, elastic slider, ripple tabs, cursor-lit border, floating-label input, springy segments, morphing download).
- **Originkit** (most-copied sort): dark-themed gallery of motion components — coverflow/carousel, particle globe, neon/pulsating glow borders, magnetic carousel, radial-reveal and starfield hover buttons.

### What Saqlain said he liked (asked as one batched, multi-select question set)

- **Orchid** → the blurred mesh-gradient background specifically (not the type or mega-menu).
- **Caldera** → the ultrabold condensed display type *and* the halftone dot texture (not the flat-pill shape language or the color system per se).
- **Motion throughline** → Origami's unhurried paper-fold easing, applied broadly across the app (not Magnetic's snappy spring-physics as the general feel).
- **Originkit** → all three categories were fair game: card/gallery motion, button/CTA effects, and ambient glow/border accents.

### Directions built

Four self-contained HTML directions in one comparison file, each with a brand rationale, color palette, type scale, and 3 skinned screens (landing, the swipe review card, and shortlist + search-party activity with a Mira AI-disclosure bubble). Copy follows PRD §10 guardrails (no NoBroker/scraping mention, restricted attrs shown as informational-only, Mira discloses as AI).

1. **Atmosphere** — Orchid-led. Near-black canvas, soft blurred mesh-gradient (violet/coral/teal), quiet serif (Fraunces) headlines, glass cards with a cursor-lit glow border on hover, gentle overshoot easing.
2. **Volcanic Graphic** — Caldera-led. Warm limestone canvas, ultrabold condensed Oswald display type at architectural scale, halftone dot texture in the hero, fully flat/shadowless, full-pill buttons with a snappy press/hover motion (Originkit radial-reveal energy) to match the type's loudness.
3. **Paper & Ink** — Origami-led, the most tactile/slowest-paced of the four. Kraft/cream palette, serif + italic terracotta accent headline, monospace numbered labels, paper-panel cards, and — concretely demonstrating the "unhurried" throughline — the pass/shortlist buttons fold the card away on a slow 900ms 3D hinge instead of snapping it off-screen.
4. **Gradient Type** — deliberate hybrid reconciling the two references that were in tension (soft Orchid atmosphere vs. loud Caldera type): huge condensed display type gradient-filled and floating inside the blurred mesh, faint halftone texture underneath, cursor-lit glow + magnetic-feeling press on CTAs.

All four keep the swipe review card's data and mechanics (photos, light/space score, price/deposit/BHK, why-picked, verifying/restricted-attr chips, pass/shortlist) — only the skin and motion vary, per the constraint.

**Assets:** [`design/explorations/index.html`](../../design/explorations/index.html) — single file, tab-switcher across the 4 directions, no build step, open directly in a browser. Verified in-browser (all 4 directions render correctly; pass/shortlist buttons trigger their direction-specific fly-off/fold-away animation). Not wired to real data, not on any production path — throwaway per the constraints in this handoff.

### Decision

**Picked: Direction 2, Volcanic Graphic** (Caldera-led — ultrabold condensed type + halftone). Saqlain asked for a closer, more detailed look at this direction alone, with full-size real photos in the review card instead of the placeholder gradient strip used in the 4-way comparison.

### Second pass — Volcanic Graphic, detailed

Built [`design/explorations/volcanic-graphic.html`](../../design/explorations/volcanic-graphic.html) — Volcanic Graphic only, full page (no tab-switcher), one polish/detail pass covering every field in the real data model (`ReviewListing`/`MatchState` in [`apps/web/lib/types.ts`](../../apps/web/lib/types.ts)) so it reads as a believable full build, not a sketch:

- **Photo-led review card**: full-bleed 4:5 real photos (4-image carousel, dot pagination + tap-zones, photo counter), freshness badge, light/space score badges over the image — replaces the earlier small placeholder strip.
- **Full field set**: commute chips per anchor (Koramangala 18 min, Domlur 22 min, two-wheeler), why-picked callout, light/space assessment text, amenities chips, "Verifying" chips (missing_fields), an informational-only restricted-attr chip (vegetarian-tenants, §10.1-compliant — not a filter), an unverified poster-claim chip, and a source line that names capability not mechanism (§10.3).
- **Pass flow**: clicking Pass reveals the optional multi-select reason-chip panel (PRD §5.2) inline, then "Confirm pass" flies the card off; Shortlist flies it off directly with a toast ("Added to shared shortlist").
- **Card stack depth**: two rotated cards behind the front card to suggest a queue, keyboard-control hint footer (←/→/↑).
- Shortlist screen also updated with real photos and a "Qualify this flat" button per §5.3, plus the Mira AI-disclosure bubble (§9.4) auto-verifying missing facts (§5.4).

Verified in-browser: real Unsplash photos load, carousel dot/tap navigation works, pass reveals the reason-chip panel and chips toggle on click, confirm-pass/shortlist trigger the fly-off animation.

**Note on images:** uses hot-linked Unsplash stock photos as stand-ins (not Bengaluru-specific, just representative interiors) since no real listing photos exist yet — swap for real worker-sourced photos when wiring to `apps/web/`.

### Third pass — hero backdrop + edge-to-edge cards

Saqlain flagged two things after the second pass: the halftone-circle hero graphic "looked off," and asked for it to be replaced with a dynamic breathing gradient mesh like [Fable 009 "Breathe"](https://miaai-lab.github.io/Fable-5.1-100-HTML-Files/009-morphing-gradient-mesh.html), specifically its **Reef** palette; and asked for the property cards to be edge-to-edge (they read as too small/narrow relative to the page).

- **Hero backdrop**: replaced the violet halftone circle with a full-bleed animated gradient mesh — 4 blurred, screen-blended blobs in Reef colors (`#00c2c7` aqua, `#2748ff` ultramarine, `#5be7a9` mint, `#ff7ab6` pink on a `#03131f` base), each on an independent eased-sine orbit (ported from the reference's `sign(sin)·|sin|^0.8` "breathing hesitation" easing, 26–46s periods, individual phase/rotation/scale pulse), plus a flickering film-grain canvas overlay and a radial vignette, all scoped to the hero section only — rest of the page stays the flat Caldera-style light canvas. Headline switched to white/cream with the "sleeps." word kept in ember-orange for brand continuity.
- **Edge-to-edge cards**: review card widened from a narrow 420px floating stack to a 640px full-width card, photo aspect ratio changed from 4:5 to 4:3 so the larger card doesn't get excessively tall.

**Verification caveat:** confirmed the mesh renders correctly (colors, blur, grain, vignette, contrast) and confirmed the blob-motion math is correct by executing it directly in the browser console — but could not confirm the `requestAnimationFrame` loop animates live *inside this session's automated preview tab*, because that tab never receives `document.hasFocus() === true` (a harness quirk, not a code issue — generic rAF loops tested the same way in the same tab also didn't run on schedule). This should animate normally in a real, user-focused browser tab. **Ask Saqlain to confirm the motion is actually breathing when he opens the file directly**, since this couldn't be fully verified end-to-end this session.

### Fourth pass — hero rework (the reef mesh read as jarring, not soothing)

Saqlain's reaction to the third pass: "the landing page looks terrible... jarring," while confirming the cards and the next section were fine — scoped the fix to the hero only. Root causes, diagnosed by re-screenshotting the third-pass output:

- 4 fully-saturated, widely-separated Reef hues (aqua/blue/mint/**hot pink**) at 90% opacity created distinct competing color zones instead of one blended mood, and teal+pink overlap produced a muddy olive/brown patch.
- The radial vignette read as a patchy dark smudge rather than a smooth darken.
- The hero ended in a hard rectangular cut straight into the light section below — no transition.
- Pink had zero relationship to the rest of the Caldera brand (ember/violet), so the hero felt like a bolted-on foreign element rather than part of the same system.

Fixes:
- **Dropped the pink blob**, replaced it with a low-opacity (`.28`) **ember**-colored blob — ties the mesh back to the Caldera brand instead of importing Reef's palette wholesale.
- Fewer, larger, more overlapping blobs (56–62vmax vs. 42–58vmax) at lower individual opacity (.5–.62) so hues blend into each other rather than sitting in separate zones; blur increased (~70–150px vs ~40–100px) for a creamier, less segmented look.
- Added a faint (5% opacity) halftone-dot overlay across the hero — a direct nod back to Caldera's signature motif, so the mesh reads as "this brand's hero," not a generic gradient demo.
- Added an explicit bottom fade (`hero-fade`, linear-gradient into `var(--bg)`) so the hero dissolves into the pumice canvas below instead of cutting off.
- Softened the vignette (smaller ellipse, lower-opacity dark tint) and cut grain opacity from .16 to .06 so texture no longer reads as murk.
- **Replaced the JS/`requestAnimationFrame` orbit motion with pure CSS `@keyframes` drift animations** (`driftA`–`driftD`, 34–46s, `ease-in-out`, translate + scale only) — this was also a reliability fix: the previous rAF-driven version could never be confirmed as actually animating inside this session's automated preview tab (see third-pass note), because that tab never receives real focus. CSS animations don't have that dependency. **Verified this time**: read the blob's `getComputedStyle().transform` twice, 2s apart, and confirmed it actually changed — motion is genuinely live now, not just asserted.

### Fifth pass — gradient dropped entirely, duotone photo hero

Saqlain's reaction to the fourth pass: flat "no, don't like it, get rid of the gradient." Two gradient-mesh attempts in a row hadn't landed, so rather than iterate on the mesh again, dropped the abstract-gradient approach entirely and went back to what he'd actually confirmed liking about Caldera in the original round: ultrabold condensed type + halftone texture — grounded in a real photo this time instead of an abstract graphic.

**New hero**: flat split layout, no background effects at all.
- Left: pumice canvas, ultrabold Oswald headline in ink black with "sleeps." in ember, body copy, CTAs — unchanged from the original Caldera system.
- Right: a full-height **duotone halftone photo panel** — one of the same real interior photos used elsewhere in the file, desaturated (`grayscale + contrast`), overlaid with an ember→violet linear-gradient at `mix-blend-mode:color` for the duotone effect, plus the halftone dot pattern at `mix-blend-mode:multiply` directly on the photo (not as a separate decorative shape) — this is the same halftone motif from the original Caldera pick, just applied to real product photography instead of an abstract circle or a moving gradient. A small pill tag ("Indiranagar, Bengaluru") grounds it as a real listing, not stock art.
- Fully static, no JS, no animation — removes any risk of another motion/reliability question. Responsive: stacks to a single column with the photo on top under 860px.

All prior gradient-mesh CSS/JS (blobs, grain canvas, vignette, drift keyframes) was deleted, not just hidden — the file no longer carries dead code from the two abandoned attempts.

### Sixth pass — motion back in, without reviving the gradient

Saqlain confirmed he still wants animation/motion — the fifth pass had gone fully static, which was a step too far in the other direction. Rather than resurrect the gradient mesh, added motion to the duotone-photo hero itself, drawing on the two motion references he liked earliest in this exploration (Origami's unhurried easing, Magnetic Microinteractions' spring-physics buttons):

- **Ken Burns pan on the hero photo** — slow 24s alternating scale/translate (`kenBurns` keyframes), cinematic rather than busy.
- **Halftone dots drift** — the dot texture on the photo panel slowly cycles its `background-position` (16s linear loop), so the texture itself feels alive.
- **Staggered headline entrance** — each line of the h1 slides up on load (`lineUp`, clip-masked via `overflow:hidden`), followed by the subhead and CTA row fading up, then the hero photo itself scale-reveals in — a proper load-in sequence instead of everything appearing at once.
- **Magnetic-pull CTA buttons** — ported directly from the Fable 054 reference Saqlain flagged early on: on mousemove within a 70px radius, the button drifts toward the cursor and its label drifts a little further, springing back with an overshoot easing on mouse-leave. Applied to all `.pill-btn` (nav + hero).
- All of it respects `prefers-reduced-motion: reduce` (entrance animations skip straight to their end state, Ken Burns/dot-drift/magnetic pull disable).

**Verified, not just asserted this time**: dispatched a synthetic `mousemove` event at the CTA button in-browser and confirmed both `button.style.transform` and `.lbl.style.transform` updated with the label offset larger than the button's, matching the reference's "label drifts a little further than the body" behavior. Screenshotted the loaded hero to confirm the Ken Burns/entrance treatment renders without layout breakage.

### Next step

Saqlain is reviewing the sixth-pass hero (duotone photo + Ken Burns + staggered entrance + magnetic buttons, no gradient mesh). Once he confirms this direction (or asks for another iteration), it becomes the reference for building the real `apps/web/` components — at that point stop iterating on throwaway HTML and move the system (palette, Oswald/DM Sans type scale, 40px radii, full-pill controls, card field layout, duotone-halftone photo treatment, magnetic buttons, entrance choreography) into actual React components under `apps/web/`.
