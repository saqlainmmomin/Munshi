-- 001: add 'whatsapp_manual' to source_channel enum
-- WhatsApp groups (e.g. Bangalore Roomies) are an explicit manual source for the pilot.
-- Reverse: ALTER TYPE source_channel RENAME VALUE 'whatsapp_manual' is not supported;
--          would need to recreate the enum.

ALTER TYPE source_channel ADD VALUE IF NOT EXISTS 'whatsapp_manual' AFTER 'facebook_manual';
