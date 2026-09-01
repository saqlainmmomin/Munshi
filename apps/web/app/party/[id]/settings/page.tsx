// Search-party settings (PRD §4, §5.1, §10.2).
// Creator controls hard constraints (budget, locations, move date, BHK, commute
// anchors); participants may suggest. "Close search" here triggers default-delete
// of all party data unless keep_after_close is set (PRD §10.2).

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h1>Search settings</h1>
      <p style={{ color: "var(--muted)" }}>Party <code>{id}</code></p>

      {/* TODO: edit hard constraints + soft preferences + commute anchors. */}

      <section style={{ marginTop: "2rem" }}>
        <h2>Close this search</h2>
        <p style={{ color: "var(--muted)" }}>
          Closing deletes this party&apos;s data (budget, contacts, transcripts,
          taste profiles) unless you choose to keep it. See guardrails.
        </p>
        {/* TODO: close-search action → delete party row (CASCADE), or set
            keep_after_close = true first. lib/guardrails/defaultDelete. */}
      </section>
    </main>
  );
}
