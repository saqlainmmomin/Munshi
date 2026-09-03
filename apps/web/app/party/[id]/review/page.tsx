import { getReviewListings, getParticipant, getReviewedListingIds } from "@/lib/db";
import { requireUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { ReviewQueue } from "./ReviewQueue";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const participant = await getParticipant(id, user.id);
  if (!participant) redirect(`/party/${id}/join`);

  const listings = await getReviewListings(id);
  const reviewed = await getReviewedListingIds(participant.id);
  const unreviewedListings = listings.filter((l) => !reviewed.has(l.id));

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Today&apos;s batch</h1>
          <p style={{ color: "var(--muted)", margin: "0.3rem 0 0" }}>
            {unreviewedListings.length} {unreviewedListings.length === 1 ? "match" : "matches"} to review
          </p>
        </div>
        <a
          href={`/party/${id}/shortlist`}
          style={{ fontSize: "0.9rem", color: "var(--accent)", textDecoration: "none" }}
        >
          Shortlist &rarr;
        </a>
      </div>

      {unreviewedListings.length === 0 ? (
        <p>All caught up. We&apos;ll surface fresh matches as they arrive.</p>
      ) : (
        <ReviewQueue listings={unreviewedListings} partyId={id} />
      )}
    </main>
  );
}
