// Row types mirroring db/schema.sql (the contract, AGENTS.md §3).
// TODO: replace hand-written types with generated ones:
//   supabase gen types typescript --schema public > lib/database.types.ts
// Until then, keep these in sync with db/schema.sql by hand.

export type SourceChannel = "nobroker" | "x" | "facebook_manual" | "self_submitted";
export type Furnishing = "unfurnished" | "semi" | "furnished" | "any";
export type MatchStatus = "ranked" | "passed" | "shortlisted";
export type ThreadPurpose = "qualify" | "auto_verify";

export interface Listing {
  id: string;
  source: SourceChannel;
  source_ref: string | null;
  title: string | null;
  rent: number | null;
  deposit: number | null;
  bhk: number | null;
  furnishing: Furnishing | null;
  location: { area?: string; lat?: number; lng?: number } | null;
  available_from: string | null;
  description: string | null;
  missing_fields: string[];
  /** Informational only — NEVER a filter or ranking input (PRD §10.1). */
  restricted_attrs: string[];
  last_seen_at: string;
}

export interface Participant {
  id: string;
  party_id: string;
  display_name: string;
  role: "creator" | "participant";
  taste_weights: Record<string, number>;
}

export interface MatchState {
  participant_id: string;
  listing_id: string;
  status: MatchStatus;
  fit_score: number | null;
  pass_reasons: string[];
  light_assessment: string | null;
  space_assessment: string | null;
  uncertainties: string[];
}

export interface ListingPhoto {
  url: string;
  position: number;
  light_score: number | null; // worker vision output (PRD §11)
  space_score: number | null;
}

/** A listing with its photos, as the review loop consumes it. */
export interface ReviewListing extends Listing {
  photos: ListingPhoto[];
}
