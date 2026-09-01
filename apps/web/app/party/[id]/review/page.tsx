// Daily review loop — the core interaction (PRD §5.2).
// Finite daily batch (NOT an infinite feed), photo-led cards, keyboard controls,
// pass (multi-select reason chips) or add-to-shortlist. Ordering is per-participant.

import { getReviewListings } from "@/lib/db";
import { ReviewCard } from "@/components/ReviewCard";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Reads real listings the worker wrote, via the shared DB (AGENTS.md §3).
  const listings = await getReviewListings(id);

  return (
    <main>
      <h1>Today&apos;s batch</h1>
      <p style={{ color: "var(--muted)" }}>
        {listings.length} {listings.length === 1 ? "match" : "matches"} that fit your search.
      </p>

      {listings.length === 0 ? (
        <p>Nothing new right now. We&apos;ll surface fresh matches as they arrive.</p>
      ) : (
        listings.map((l) => <ReviewCard key={l.id} listing={l} />)
      )}
    </main>
  );
}
