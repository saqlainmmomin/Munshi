import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Shared Postgres via Supabase — the app's read side of the contract
// (AGENTS.md §3). The worker writes listings; the app reads them here.

let _admin: SupabaseClient | null = null;

/** Server-side client (service role). Never import into client components. */
export function db(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env not set — copy apps/web/.env.example to .env.local");
  }
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

// TODO: typed query helpers as pages need them, e.g.
//   getDailyBatch(participantId, date) — reads daily_batch_items → listings
//   getShortlist(partyId)             — reads shortlist_items → listings
//   getPendingDrafts()               — reads qualification_messages (operator)
