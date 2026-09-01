-- ============================================================================
-- Munshi — local dev seed  (the handshake, AGENTS.md §4)
-- Realistic rows so each service can be developed without the other running.
-- Apply AFTER schema.sql, against a throwaway/dev database only.
--   psql "$DATABASE_URL" -f db/schema.sql -f db/seed.sql
-- Uses the real reference search from PRD §5 (2BHK, Koramangala corridor).
-- ============================================================================

-- ----- one search party + its members and anchors ---------------------------
with party as (
  insert into search_parties
    (id, budget_target, budget_ceiling, bhk, occupancy, furnishing_pref,
     move_in_date, corridor, soft_prefs_text, soft_pref_tags)
  values
    ('11111111-1111-1111-1111-111111111111',
     60000, 65000, 2, 2, 'furnished',
     '2026-10-01', 'Koramangala–Indiranagar–Domlur',
     'Abundant natural light, large windows, spacious / non-cramped feel.',
     '["natural_light","spacious"]')
  returning id
)
-- INSERT … SELECT types bare literals as text, so json/enum columns need
-- explicit casts (a plain VALUES insert would coerce them automatically).
insert into commute_anchors (party_id, label, location, mode, max_peak_minutes)
select id, 'Koramangala office', '{"area":"Koramangala","lat":12.9352,"lng":77.6245}'::jsonb, 'two_wheeler'::commute_mode, 35 from party
union all
select id, 'Domlur office',      '{"area":"Domlur","lat":12.9609,"lng":77.6387}'::jsonb,      'two_wheeler'::commute_mode, 35 from party;

insert into participants (id, party_id, display_name, role) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Saqlain',  'creator'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Roommate', 'participant');

-- ----- listings the WORKER would have written -------------------------------
-- A complete one, and an incomplete one (missing deposit → auto-verify path).
insert into listings
  (id, source, source_ref, title, rent, deposit, bhk, furnishing, location,
   available_from, description, missing_fields, restricted_attrs)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'x', 'x:post:1001', 'Bright 2BHK near Indiranagar 100ft Rd',
   62000, 300000, 2, 'furnished',
   '{"area":"Indiranagar","lat":12.9719,"lng":77.6412}',
   '2026-10-01', 'Large west-facing windows, full sun after noon. Fully furnished.',
   '[]', '[]'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'self_submitted', 'intake:2002', 'Outgoing tenant — 2BHK Koramangala 5th block',
   58000, null, 2, 'semi',
   '{"area":"Koramangala","lat":12.9352,"lng":77.6245}',
   '2026-10-01', 'Taking over my flat, moving out. Great light. Ping for details.',
   '["deposit"]',                       -- missing → eligible for auto-verify (PRD §5.4)
   '["vegetarian_only"]');              -- informational only, never a filter (PRD §10.1)

-- ----- worker enrichment: photos, commute -----------------------------------
insert into listing_photos (listing_id, url, position, light_score, space_score) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://example.invalid/a1.jpg', 0, 0.88, 0.72),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://example.invalid/b1.jpg', 0, 0.79, 0.65);

insert into listing_commutes (listing_id, anchor_id, peak_minutes)
select l.id, a.id,
       case when a.label like 'Koramangala%' then 18 else 28 end
from listings l
join commute_anchors a on a.party_id = '11111111-1111-1111-1111-111111111111'
where l.id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
               'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
