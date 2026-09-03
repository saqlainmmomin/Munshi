-- 003: add user_id to participants (links Supabase Auth users to party membership)
-- Reverse: ALTER TABLE participants DROP COLUMN user_id;

ALTER TABLE participants ADD COLUMN user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE participants ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE participants ADD CONSTRAINT participants_party_user_unique UNIQUE (party_id, user_id);
CREATE INDEX ON participants (user_id);
