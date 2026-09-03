import { getPendingIntake } from "@/lib/db";
import { IntakeQueue } from "./IntakeQueue";

export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const pending = await getPendingIntake();

  return (
    <main>
      <h1>Operator</h1>

      <section>
        <h2>Outreach draft queue</h2>
        <p style={{ color: "var(--muted)" }}>No drafts awaiting approval.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Intake submissions ({pending.length})</h2>
        {pending.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No submissions to review.</p>
        ) : (
          <IntakeQueue submissions={pending} />
        )}
      </section>
    </main>
  );
}
