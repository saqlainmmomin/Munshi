import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReviewListing, IntakeSubmission } from "@/lib/types";

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

const LISTING_COLUMNS =
  "id, source, source_ref, title, rent, deposit, bhk, furnishing, location, " +
  "available_from, description, missing_fields, restricted_attrs, last_seen_at, " +
  "listing_photos ( url, position, light_score, space_score )";

/**
 * The party's review pool: listings that satisfy the party's hard constraints,
 * newest first. Ordering is personalized per participant later (lib/ranking);
 * this is the shared pool (PRD §4, §5.2). Duplicates are excluded (§8.5).
 *
 * First slice: budget-ceiling filter only, reading real rows the worker writes.
 * TODO: full hard-constraint match + per-participant fit ordering via daily_batches.
 */
export async function getReviewListings(partyId: string): Promise<ReviewListing[]> {
  const supa = db();

  const { data: party, error: partyErr } = await supa
    .from("search_parties")
    .select("budget_ceiling")
    .eq("id", partyId)
    .single();
  if (partyErr) throw partyErr;

  let query = supa
    .from("listings")
    .select(LISTING_COLUMNS)
    .is("duplicate_of", null)
    .order("last_seen_at", { ascending: false });

  const ceiling = party?.budget_ceiling as number | null | undefined;
  if (ceiling != null) query = query.lte("rent", ceiling);

  const { data, error } = await query;
  if (error) throw error;

  // Supabase nests the join under `listing_photos`; expose it as `photos`, sorted.
  return (data ?? []).map((row) => {
    const { listing_photos, ...listing } = row as unknown as Omit<
      ReviewListing,
      "photos"
    > & { listing_photos?: ReviewListing["photos"] };
    const photos = (listing_photos ?? []).slice().sort((a, b) => a.position - b.position);
    return { ...listing, photos };
  });
}

/** Pending intake submissions for the operator to review. */
export async function getPendingIntake(): Promise<IntakeSubmission[]> {
  const { data, error } = await db()
    .from("intake_submissions")
    .select("*, intake_photos ( id, storage_path, url, position )")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as IntakeSubmission[];
}

/** Approve or reject an intake submission. */
export async function reviewIntake(
  id: string,
  decision: "approved" | "rejected",
  notes?: string,
) {
  const { error } = await db()
    .from("intake_submissions")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

/** Insert a new intake submission. Returns the submission id. */
export async function createIntakeSubmission(fields: {
  source: string;
  raw_text: string;
  structured?: Record<string, unknown>;
  source_url?: string;
  poster_contact?: string;
}): Promise<string> {
  const { data, error } = await db()
    .from("intake_submissions")
    .insert({
      source: fields.source,
      raw_text: fields.raw_text,
      structured: fields.structured ?? {},
      source_url: fields.source_url ?? null,
      poster_contact: fields.poster_contact ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Attach a photo record to an intake submission. */
export async function addIntakePhoto(fields: {
  submission_id: string;
  storage_path: string;
  url: string;
  position: number;
}) {
  const { error } = await db().from("intake_photos").insert(fields);
  if (error) throw error;
}

// TODO: more helpers as pages need them —
//   getShortlist(partyId)   — reads shortlist_items → listings
//   getPendingDrafts()      — reads qualification_messages (operator)
