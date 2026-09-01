// Shared shortlist + party activity feed (PRD §5.3, §5.6).
// Any participant may tap "Qualify this flat" (that — not shortlisting — is what
// authorizes outreach). Mira's post-qualification update lands here; the shortlist
// record stays canonical.

export default async function ShortlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: load shortlist_items + party_activity for this party.
  return (
    <main>
      <h1>Shared shortlist</h1>
      <p style={{ color: "var(--muted)" }}>Party <code>{id}</code></p>
      {/* TODO: shortlist cards with "Qualify this flat" action → opens a
          qualification thread (purpose = 'qualify'). Notifies the whole party. */}
      <p>No shortlisted flats yet.</p>
    </main>
  );
}
