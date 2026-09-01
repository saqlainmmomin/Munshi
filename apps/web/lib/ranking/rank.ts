import type { Listing, Participant } from "@/lib/types";

// Per-participant ranking (PRD §4, §5.2, §11).
// Everyone in a party sees the SAME hard-constraint-matching pool; only the
// ORDER is personalized. Soft preferences (light, space, commute) rank; they
// never exclude. Restricted-tenancy attributes (PRD §10.1) are NEVER inputs.

export interface RankedListing {
  listing: Listing;
  fitScore: number;
}

/**
 * Order a party's pool for one participant by predicted fit.
 * Inputs it MAY use: soft-pref tags, taste_weights, photo light/space scores,
 * commute-to-anchor minutes, freshness. Inputs it MUST NOT use: restricted_attrs.
 */
export function rankForParticipant(
  pool: Listing[],
  _participant: Participant,
): RankedListing[] {
  // TODO: real scoring. Placeholder keeps order stable and excludes nothing.
  return pool.map((listing) => ({ listing, fitScore: 0 }));
}
