// Operator queue — Saqlain's console (PRD §8.4, §9.3).
// Two jobs: (1) sanity-check self-submitted listings before they enter the
// pipeline; (2) review Mira's drafted outreach and approve/edit/send it.
// Mira drafts, Saqlain sends — no autonomous sending in the pilot (AGENTS.md §7.4).

export default function OperatorPage() {
  return (
    <main>
      <h1>Operator</h1>

      <section>
        <h2>Outreach draft queue</h2>
        {/* TODO: list qualification_messages where approval = 'pending'.
            Each row: target listing, Mira's draft, one-tap approve / edit / send.
            First outbound per thread MUST disclose AI (discloses_ai = true). */}
        <p style={{ color: "var(--muted)" }}>No drafts awaiting approval.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Self-submitted intake</h2>
        {/* TODO: list self_submitted listings pending sanity-check → approve
            into the pipeline. Tiny volume expected (PRD §8.4). */}
        <p style={{ color: "var(--muted)" }}>No submissions to review.</p>
      </section>
    </main>
  );
}
