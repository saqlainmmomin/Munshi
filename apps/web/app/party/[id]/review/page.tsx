// Daily review loop — the core interaction (PRD §5.2).
// Finite daily batch (NOT an infinite feed), photo-led cards, keyboard controls,
// pass (multi-select reason chips) or add-to-shortlist. Ordering is per-participant.

import { ReviewCard } from "@/components/ReviewCard";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: load today's DailyBatch for the current participant, ordered by
  // fit_score. Reads listings the worker wrote (AGENTS.md §3). See lib/db.ts.
  const listings: never[] = [];

  return (
    <main>
      <h1>Today&apos;s batch</h1>
      <p style={{ color: "var(--muted)" }}>
        Party <code>{id}</code> — {listings.length} new{" "}
        {listings.length === 1 ? "match" : "matches"} to review.
      </p>

      {listings.length === 0 ? (
        <p>Nothing new right now. We&apos;ll surface fresh matches as they arrive.</p>
      ) : (
        listings.map((l, i) => <ReviewCard key={i} listing={l} />)
      )}
    </main>
  );
}
