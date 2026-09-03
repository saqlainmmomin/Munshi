-- 004: listing intelligence fields (extraction from condensed intake text/photos)
-- Reviewed against tasks/handoffs/2026-09-03-listing-intelligence.md (2026-09-03).
-- Adds structured facts the worker's text/vision extraction produces that the
-- current `listings`/`listing_photos` columns can't represent without losing
-- the distinction between "not mentioned", "mentioned but unknown", and an
-- unverified poster claim.

ALTER TABLE listings
    ADD COLUMN amenities             jsonb NOT NULL DEFAULT '[]',   -- normalized tags, e.g. ["lift","power_backup"]
    ADD COLUMN maintenance_details   jsonb,                          -- {applicable: bool|null, amount: int|null}; null = not mentioned
    ADD COLUMN availability_text     text,                           -- source wording when available_from can't be an exact date, e.g. "July or August"
    ADD COLUMN brokerage_applicable  boolean,                        -- null = not mentioned
    ADD COLUMN claims                jsonb NOT NULL DEFAULT '[]',    -- unverified poster claims, e.g. ["1 km from metro"]
    ADD COLUMN extraction_meta       jsonb NOT NULL DEFAULT '{}';    -- per-field confidence/provenance, keyed by field name

ALTER TABLE listing_photos
    ADD COLUMN assessment text;   -- explanation accompanying light_score/space_score

COMMENT ON COLUMN listings.maintenance_details IS
    'null = maintenance not mentioned. {"applicable": true, "amount": null} = mentioned, amount unknown. {"applicable": true, "amount": 1500} = known.';
COMMENT ON COLUMN listings.claims IS
    'Free-form poster claims retained verbatim, not independently verified (e.g. proximity, view). Never rendered as a verified fact.';
COMMENT ON COLUMN listings.extraction_meta IS
    'Shape: {"<field>": {"confidence": 0.0-1.0, "source": "structured"|"text"|"inferred"}}. Covers fields extracted from free text; structured-form values need no entry.';
COMMENT ON COLUMN listing_photos.assessment IS
    'Worker-authored explanation for light_score/space_score. match_states.light_assessment/space_assessment are copied from here per participant, not independently generated.';

-- Cross-source dedupe (same flat posted via multiple channels, PRD §5) is
-- deliberately deferred past this migration. `listings.duplicate_of` already
-- exists for it; U1-U5 only covers idempotency of repeat runs of the SAME
-- intake submission. Follow-up handoff required before relying on dedupe
-- across channels.

-- Reverse:
-- ALTER TABLE listing_photos DROP COLUMN assessment;
-- ALTER TABLE listings DROP COLUMN amenities, DROP COLUMN maintenance_details,
--     DROP COLUMN availability_text, DROP COLUMN brokerage_applicable,
--     DROP COLUMN claims, DROP COLUMN extraction_meta;
