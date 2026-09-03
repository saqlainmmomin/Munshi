-- 002: intake_submissions + intake_photos tables
-- Manual intake is now the primary sourcing path for the pilot (2026-09-02).

CREATE TYPE intake_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE intake_submissions (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source           source_channel NOT NULL,
    raw_text         text NOT NULL,
    structured       jsonb NOT NULL DEFAULT '{}',
    source_url       text,
    poster_contact   text,
    status           intake_status NOT NULL DEFAULT 'pending',
    submitted_at     timestamptz NOT NULL DEFAULT now(),
    reviewed_at      timestamptz,
    reviewer_notes   text
);
CREATE INDEX ON intake_submissions (status, submitted_at);

CREATE TABLE intake_photos (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   uuid NOT NULL REFERENCES intake_submissions(id) ON DELETE CASCADE,
    storage_path    text NOT NULL,
    url             text NOT NULL,
    position        smallint NOT NULL DEFAULT 0
);
CREATE INDEX ON intake_photos (submission_id);
