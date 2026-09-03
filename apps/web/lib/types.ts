// Row types mirroring db/schema.sql (the contract, AGENTS.md §3).
// TODO: replace hand-written types with generated ones:
//   supabase gen types typescript --schema public > lib/database.types.ts
// Until then, keep these in sync with db/schema.sql by hand.

export type SourceChannel = "nobroker" | "x" | "facebook_manual" | "whatsapp_manual" | "self_submitted";
export type IntakeStatus = "pending" | "approved" | "rejected";
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
  user_id: string;
  display_name: string;
  role: "creator" | "participant";
  taste_weights: Record<string, number>;
}

export interface SearchParty {
  id: string;
  status: "active" | "closed";
  budget_target: number;
  budget_ceiling: number;
  bhk: number | null;
  occupancy: number | null;
  furnishing_pref: Furnishing;
  move_in_date: string | null;
  corridor: string | null;
  locations: unknown[];
  soft_prefs_text: string | null;
  soft_pref_tags: string[];
  created_at: string;
}

export interface CommuteAnchor {
  id: string;
  party_id: string;
  label: string;
  location: { lat?: number; lng?: number; address?: string };
  mode: "two_wheeler" | "auto" | "car" | "transit" | "walk";
  max_peak_minutes: number;
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

export interface IntakeSubmission {
  id: string;
  source: SourceChannel;
  raw_text: string;
  structured: Record<string, unknown>;
  source_url: string | null;
  poster_contact: string | null;
  status: IntakeStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  intake_photos?: IntakePhoto[];
}

export interface IntakePhoto {
  id: string;
  storage_path: string;
  url: string;
  position: number;
}
