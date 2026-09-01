import { db } from "@/lib/db";

// Product guardrails as code (PRD §10, AGENTS.md §7). Violating these is a defect.

/**
 * §10.1 — Restricted-tenancy attributes are INFORMATIONAL ONLY.
 * This module intentionally exposes NO filter/sort helper for them. Rendering
 * them as a fact on a card is fine; feeding them to a query or ranker is not.
 * Human-readable labels for display:
 */
export const RESTRICTED_ATTR_LABELS: Record<string, string> = {
  vegetarian_only: "Requires vegetarian tenants",
  bachelors_not_allowed: "Bachelors not allowed",
  family_only: "Family only",
  gender_restricted: "Gender-restricted",
};

/**
 * §10.2 — Default-delete on search close. Deleting the party row cascades to all
 * of its data (see db/schema.sql). Pass keepData=true to retain (opt-in only).
 */
export async function closeSearch(partyId: string, keepData = false): Promise<void> {
  const client = db();
  if (keepData) {
    await client.from("search_parties").update({
      status: "closed",
      keep_after_close: true,
      closed_at: new Date().toISOString(),
    }).eq("id", partyId);
    return;
  }
  // Default: delete → CASCADE removes participants, threads, taste profiles, etc.
  await client.from("search_parties").delete().eq("id", partyId);
}
