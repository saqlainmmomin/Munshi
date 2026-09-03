import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReviewListing, IntakeSubmission, SearchParty, Participant } from "@/lib/types";

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

/**
 * Approve or reject an intake submission. Approving creates the `Listing`
 * the submission feeds into the shared pipeline (PRD §8.4): "public form →
 * submissions queue → Saqlain approves → Listing in pipeline."
 */
export async function reviewIntake(
  id: string,
  decision: "approved" | "rejected",
  notes?: string,
) {
  const supa = db();

  if (decision === "approved") {
    const { data: submission, error: fetchErr } = await supa
      .from("intake_submissions")
      .select("*, intake_photos ( url, position )")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    await createListingFromIntake(
      submission as unknown as IntakeSubmission,
    );
  }

  const { error } = await supa
    .from("intake_submissions")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

/** Turn an approved intake submission into a `listings` row + its photos. */
async function createListingFromIntake(submission: IntakeSubmission) {
  const supa = db();
  const structured = submission.structured ?? {};
  const rent = typeof structured.rent === "number" ? structured.rent : null;
  const bhk = typeof structured.bhk === "number" ? structured.bhk : null;
  const area = typeof structured.area === "string" ? structured.area : null;
  const title =
    (typeof structured.title === "string" && structured.title) ||
    submission.raw_text.split("\n")[0].slice(0, 140);

  const missingFields: string[] = [];
  if (!title) missingFields.push("title");
  if (rent == null) missingFields.push("rent");
  if (bhk == null) missingFields.push("bhk");
  if (!area) missingFields.push("location");

  const { data: listing, error: listingErr } = await supa
    .from("listings")
    .insert({
      source: submission.source,
      source_ref: submission.id, // ties the listing back to its submission (idempotent, unique)
      title,
      rent,
      bhk,
      location: area ? { area } : null,
      description: submission.raw_text,
      raw: { structured, source_url: submission.source_url, poster_contact: submission.poster_contact },
      missing_fields: missingFields,
      poster_contact: submission.poster_contact ? { raw: submission.poster_contact } : null,
    })
    .select("id")
    .single();
  if (listingErr) throw listingErr;

  const photos = submission.intake_photos ?? [];
  if (photos.length > 0) {
    const { error: photosErr } = await supa.from("listing_photos").insert(
      photos.map((p) => ({
        listing_id: listing.id,
        url: p.url,
        position: p.position,
      })),
    );
    if (photosErr) throw photosErr;
  }

  return listing.id as string;
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

/** Create a search party + creator participant + commute anchors. Returns party id. */
export async function createParty(fields: {
  userId: string;
  displayName: string;
  budgetTarget: number;
  budgetCeiling: number;
  bhk?: number | null;
  occupancy?: number | null;
  furnishingPref?: string;
  moveInDate?: string | null;
  corridor?: string | null;
  locations?: unknown[];
  softPrefsText?: string | null;
  softPrefTags?: string[];
  anchors?: { label: string; address: string; mode: string; maxPeakMinutes: number }[];
}): Promise<string> {
  const supa = db();

  const { data: party, error: partyErr } = await supa
    .from("search_parties")
    .insert({
      budget_target: fields.budgetTarget,
      budget_ceiling: fields.budgetCeiling,
      bhk: fields.bhk ?? null,
      occupancy: fields.occupancy ?? null,
      furnishing_pref: fields.furnishingPref ?? "any",
      move_in_date: fields.moveInDate ?? null,
      corridor: fields.corridor ?? null,
      locations: fields.locations ?? [],
      soft_prefs_text: fields.softPrefsText ?? null,
      soft_pref_tags: fields.softPrefTags ?? [],
    })
    .select("id")
    .single();
  if (partyErr) throw partyErr;

  const { error: partErr } = await supa.from("participants").insert({
    party_id: party.id,
    user_id: fields.userId,
    display_name: fields.displayName,
    role: "creator",
  });
  if (partErr) throw partErr;

  if (fields.anchors?.length) {
    const { error: anchErr } = await supa.from("commute_anchors").insert(
      fields.anchors.map((a) => ({
        party_id: party.id,
        label: a.label,
        location: { address: a.address },
        mode: a.mode,
        max_peak_minutes: a.maxPeakMinutes,
      })),
    );
    if (anchErr) throw anchErr;
  }

  return party.id;
}

/** Join an existing party as a participant. */
export async function joinParty(partyId: string, userId: string, displayName: string): Promise<void> {
  const supa = db();
  const { error } = await supa.from("participants").insert({
    party_id: partyId,
    user_id: userId,
    display_name: displayName,
    role: "participant",
  });
  if (error) throw error;
}

/** Get a party by id. */
export async function getParty(partyId: string): Promise<SearchParty | null> {
  const { data, error } = await db()
    .from("search_parties")
    .select("*")
    .eq("id", partyId)
    .single();
  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as unknown as SearchParty;
}

/** Get participant for a user in a party. */
export async function getParticipant(partyId: string, userId: string): Promise<Participant | null> {
  const { data, error } = await db()
    .from("participants")
    .select("*")
    .eq("party_id", partyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Participant | null;
}

/** Get all parties a user belongs to. */
export async function getUserParties(userId: string): Promise<(SearchParty & { role: string })[]> {
  const { data, error } = await db()
    .from("participants")
    .select("role, search_parties ( * )")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row.search_parties as SearchParty),
    role: row.role as string,
  }));
}

/** Record a pass or shortlist action for a participant on a listing. */
export async function recordMatchAction(
  participantId: string,
  listingId: string,
  action: "passed" | "shortlisted",
  passReasons?: string[],
) {
  const supa = db();

  const { error: matchErr } = await supa.from("match_states").upsert(
    {
      participant_id: participantId,
      listing_id: listingId,
      status: action,
      pass_reasons: passReasons ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "participant_id,listing_id" },
  );
  if (matchErr) throw matchErr;
}

/** Add a listing to the shared shortlist. */
export async function addToShortlist(partyId: string, listingId: string, participantId: string) {
  const supa = db();

  const { error } = await supa.from("shortlist_items").upsert(
    { party_id: partyId, listing_id: listingId, added_by: participantId },
    { onConflict: "party_id,listing_id" },
  );
  if (error) throw error;

  await supa.from("party_activity").insert({
    party_id: partyId,
    actor: participantId,
    kind: "shortlisted",
    listing_id: listingId,
  });
}

/** Get shortlisted listings for a party. */
export async function getShortlist(partyId: string): Promise<(ReviewListing & { added_at: string })[]> {
  const supa = db();
  const { data, error } = await supa
    .from("shortlist_items")
    .select(`added_at, listings ( ${LISTING_COLUMNS} )`)
    .eq("party_id", partyId)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const raw = row.listings as Record<string, unknown>;
    const { listing_photos, ...listing } = raw as unknown as Omit<ReviewListing, "photos"> & {
      listing_photos?: ReviewListing["photos"];
    };
    const photos = (listing_photos ?? []).slice().sort((a, b) => a.position - b.position);
    return { ...listing, photos, added_at: row.added_at as string };
  });
}

/** Get reviewed listing ids for a participant (to filter out from the review queue). */
export async function getReviewedListingIds(participantId: string): Promise<Set<string>> {
  const { data, error } = await db()
    .from("match_states")
    .select("listing_id")
    .eq("participant_id", participantId)
    .in("status", ["passed", "shortlisted"]);
  if (error) throw error;
  return new Set((data ?? []).map((r: { listing_id: string }) => r.listing_id));
}
