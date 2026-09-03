-- ============================================================================
-- Munshi — canonical database schema  ·  THE CONTRACT
-- ----------------------------------------------------------------------------
-- The single integration point between the two services:
--   • services/worker (Python, Codex)  WRITES listings + enrichment
--   • apps/web        (Next.js, Claude) READS them, owns everything user-facing
-- Neither service imports the other. This schema is how they agree on shape.
--
-- Owned by:  Claude (apps/web + db). Codex proposes changes via a handoff.
-- Product truth: docs/PRD.md §7 (data model); section refs inline below.
-- Target: Postgres 15+ (Supabase).
-- Retention (PRD §10.2): closing a search party deletes the row, and every
-- CASCADE below removes all of that party's data. Global `listings` persist.
-- ============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ----- enums ----------------------------------------------------------------
create type party_status      as enum ('active', 'closed');
create type party_role        as enum ('creator', 'participant');
create type commute_mode      as enum ('two_wheeler', 'auto', 'car', 'transit', 'walk');
create type furnishing        as enum ('unfurnished', 'semi', 'furnished', 'any');
create type source_channel    as enum ('nobroker', 'x', 'facebook_manual', 'whatsapp_manual', 'self_submitted');
create type match_status      as enum ('ranked', 'passed', 'shortlisted');
create type thread_purpose    as enum ('qualify', 'auto_verify');           -- PRD §5.3 / §5.4
create type thread_status     as enum ('drafting', 'awaiting_approval', 'sent', 'replied', 'closed');
create type message_direction as enum ('outbound', 'inbound');
create type approval_status   as enum ('pending', 'approved', 'edited', 'rejected', 'sent');

-- ============================================================================
-- SEARCH PARTIES  (PRD §4, §7) — app-owned
-- ============================================================================
create table search_parties (
    id               uuid primary key default gen_random_uuid(),
    status           party_status not null default 'active',
    -- hard constraints (creator-controlled; used to build the matching pool)
    budget_target    integer not null,                 -- INR / month
    budget_ceiling   integer not null,                 -- exceptional-options ceiling
    bhk              smallint,                          -- e.g. 2 = 2BHK; null = any
    occupancy        smallint,                          -- people who will live there
    furnishing_pref  furnishing not null default 'any',
    move_in_date     date,
    corridor         text,                              -- human label, e.g. 'Koramangala–Indiranagar'
    locations        jsonb not null default '[]',       -- normalized areas / polygons
    -- soft preferences: rank only, NEVER exclude (PRD §5.1, §10.1)
    soft_prefs_text  text,
    soft_pref_tags   jsonb not null default '[]',
    -- retention (PRD §10.2): default is delete-on-close
    keep_after_close boolean not null default false,
    created_at       timestamptz not null default now(),
    closed_at        timestamptz
);

-- office / commute anchors — one row per destination (PRD §5.1)
create table commute_anchors (
    id               uuid primary key default gen_random_uuid(),
    party_id         uuid not null references search_parties(id) on delete cascade,
    label            text not null,                     -- 'Koramangala office'
    location         jsonb not null,                    -- {lat, lng} or address
    mode             commute_mode not null default 'two_wheeler',
    max_peak_minutes smallint not null                  -- e.g. 35
);
create index on commute_anchors (party_id);

-- participants + individual taste profile & review state (PRD §4, §8, §11)
create table participants (
    id            uuid primary key default gen_random_uuid(),
    party_id      uuid not null references search_parties(id) on delete cascade,
    user_id       uuid not null,                           -- Supabase Auth uid
    display_name  text not null,
    role          party_role not null default 'participant',
    -- learned soft-preference weights; editable & reversible (PRD §3, §11)
    taste_weights jsonb not null default '{}',
    created_at    timestamptz not null default now(),
    unique (party_id, user_id)
);
create index on participants (party_id);
create index on participants (user_id);

-- ============================================================================
-- INTAKE SUBMISSIONS  (PRD §8.3–8.4) — app-owned
-- Manual submissions from all sources (FB, X, WhatsApp, brokers, self-submit).
-- Saqlain approves in the operator console; the worker reads approved rows.
-- ============================================================================
create type intake_status as enum ('pending', 'approved', 'rejected');

create table intake_submissions (
    id               uuid primary key default gen_random_uuid(),
    source           source_channel not null,
    raw_text         text not null,                        -- pasted message / listing text
    structured       jsonb not null default '{}',          -- optional: {rent, bhk, area, ...}
    source_url       text,                                 -- original post URL if available
    poster_contact   text,                                 -- phone / name if known
    status           intake_status not null default 'pending',
    submitted_at     timestamptz not null default now(),
    reviewed_at      timestamptz,
    reviewer_notes   text
);
create index on intake_submissions (status, submitted_at);

-- photos attached to a submission (before they become listing_photos)
create table intake_photos (
    id              uuid primary key default gen_random_uuid(),
    submission_id   uuid not null references intake_submissions(id) on delete cascade,
    storage_path    text not null,                          -- Supabase Storage path
    url             text not null,                          -- public URL
    position        smallint not null default 0
);
create index on intake_photos (submission_id);

-- ============================================================================
-- LISTINGS  (PRD §7, §8) — WRITTEN BY THE WORKER
-- Global, not party-scoped: sourced once, shown to every party they fit.
-- ============================================================================
create table listings (
    id               uuid primary key default gen_random_uuid(),
    source           source_channel not null,
    source_ref       text,                              -- url / post id / submission id
    -- normalized facts
    title            text,
    rent             integer,                           -- INR / month
    deposit          integer,
    bhk              smallint,
    furnishing       furnishing,
    location         jsonb,                             -- {area, lat, lng}
    available_from   date,
    description      text,
    -- provenance & freshness
    raw              jsonb not null default '{}',        -- untouched captured payload
    first_seen_at    timestamptz not null default now(),
    last_seen_at     timestamptz not null default now(),
    -- completeness: which required facts are missing → auto-verify path (PRD §5.4)
    missing_fields   jsonb not null default '[]',
    -- restricted-tenancy attributes: INFORMATIONAL ONLY, never a filter (PRD §10.1)
    restricted_attrs jsonb not null default '[]',        -- e.g. ["vegetarian_only"]
    poster_contact   jsonb,                             -- nullable until known
    -- dedupe: rows judged to be the same physical flat point at a canonical row
    duplicate_of     uuid references listings(id) on delete set null,
    created_at       timestamptz not null default now()
);
create unique index on listings (source, source_ref);
create index on listings (last_seen_at);

create table listing_photos (
    id          uuid primary key default gen_random_uuid(),
    listing_id  uuid not null references listings(id) on delete cascade,
    url         text not null,                          -- Supabase Storage or source
    position    smallint not null default 0,
    -- worker vision output (PRD §7, §11): ranks/explains, never auto-discards
    light_score real,
    space_score real
);
create index on listing_photos (listing_id);

-- precomputed commute per (listing, anchor) — WRITTEN BY THE WORKER (commute.py)
create table listing_commutes (
    listing_id   uuid not null references listings(id) on delete cascade,
    anchor_id    uuid not null references commute_anchors(id) on delete cascade,
    peak_minutes smallint,
    primary key (listing_id, anchor_id)
);

-- ============================================================================
-- PER-PARTICIPANT MATCH STATE  (PRD §7, §8, §11) — app-owned
-- ============================================================================
create table match_states (
    participant_id   uuid not null references participants(id) on delete cascade,
    listing_id       uuid not null references listings(id) on delete cascade,
    status           match_status not null default 'ranked',
    fit_score        real,                              -- personalized ordering
    pass_reasons     jsonb not null default '[]',        -- multi-select chips (PRD §11)
    light_assessment text,                              -- explanation shown on card
    space_assessment text,
    uncertainties    jsonb not null default '[]',
    updated_at       timestamptz not null default now(),
    primary key (participant_id, listing_id)
);
create index on match_states (listing_id);

-- ============================================================================
-- SHARED SHORTLIST + PARTY ACTIVITY  (PRD §5.3, §5.6) — app-owned
-- ============================================================================
create table shortlist_items (
    id         uuid primary key default gen_random_uuid(),
    party_id   uuid not null references search_parties(id) on delete cascade,
    listing_id uuid not null references listings(id) on delete cascade,
    added_by   uuid references participants(id) on delete set null,
    added_at   timestamptz not null default now(),
    unique (party_id, listing_id)
);
create index on shortlist_items (party_id);

-- activity feed + reactions; actor = null means Mira / system
create table party_activity (
    id         uuid primary key default gen_random_uuid(),
    party_id   uuid not null references search_parties(id) on delete cascade,
    actor      uuid references participants(id) on delete set null,
    kind       text not null,   -- 'shortlisted'|'qualify_requested'|'visit_requested'|'mira_update'|'reaction'
    listing_id uuid references listings(id) on delete cascade,
    payload    jsonb not null default '{}',
    created_at timestamptz not null default now()
);
create index on party_activity (party_id, created_at);

-- ============================================================================
-- QUALIFICATION / OUTREACH  (PRD §5.3, §5.4, §9) — app-owned
-- Mira drafts; Saqlain approves & sends (ordinary WhatsApp). Threads capture it.
-- ============================================================================
create table qualification_threads (
    id             uuid primary key default gen_random_uuid(),
    party_id       uuid references search_parties(id) on delete cascade,   -- null for pre-shortlist auto-verify
    listing_id     uuid not null references listings(id) on delete cascade,
    purpose        thread_purpose not null,
    status         thread_status not null default 'drafting',
    requested_by   uuid references participants(id) on delete set null,
    verified_facts jsonb not null default '{}',          -- facts learned in the conversation
    result_summary text,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);
create index on qualification_threads (party_id);
create index on qualification_threads (listing_id);

create table qualification_messages (
    id           uuid primary key default gen_random_uuid(),
    thread_id    uuid not null references qualification_threads(id) on delete cascade,
    direction    message_direction not null,
    -- outbound flow: Mira drafts → operator approves/edits → sent (PRD §9.3)
    body_draft   text,
    body_sent    text,
    approval     approval_status not null default 'pending',
    discloses_ai boolean not null default false,         -- first outbound MUST be true (PRD §9.4)
    created_at   timestamptz not null default now(),
    sent_at      timestamptz
);
create index on qualification_messages (thread_id, created_at);

-- ============================================================================
-- DAILY REVIEW BATCHES  (PRD §5.2) — app-owned
-- ============================================================================
create table daily_batches (
    id             uuid primary key default gen_random_uuid(),
    participant_id uuid not null references participants(id) on delete cascade,
    batch_date     date not null,
    created_at     timestamptz not null default now(),
    unique (participant_id, batch_date)
);
create table daily_batch_items (
    batch_id   uuid not null references daily_batches(id) on delete cascade,
    listing_id uuid not null references listings(id) on delete cascade,
    position   integer not null,                         -- ordered by predicted fit
    primary key (batch_id, listing_id)
);

-- ============================================================================
-- RETENTION (PRD §10.2)
-- Closing a search = delete its search_parties row. CASCADE then removes
-- participants, commute_anchors, match_states, shortlist_items, party_activity,
-- qualification_threads (+ messages), daily_batches (+ items). Global `listings`
-- are source data, not party data, and persist. Set keep_after_close = true
-- before closing to override the default-delete.
-- ============================================================================
