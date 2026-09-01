// Landing + waitlist (PRD §11).
// Copy rule (AGENTS.md §7.3): describe CAPABILITY, never the sourcing mechanism.
// Never name NoBroker; never say "scraping".

export default function LandingPage() {
  return (
    <main>
      <h1>Munshi</h1>
      <p style={{ fontSize: "1.25rem", color: "var(--muted)" }}>
        Give us your requirements once. We continuously find and qualify flats
        until you have three worth visiting.
      </p>

      {/* TODO: waitlist signup → POST /api/waitlist. Capacity cap is NOT
          pre-committed (PRD §11.2) — decide based on real signup response. */}
      <form action="/api/waitlist" method="post" style={{ marginTop: "2rem" }}>
        <input name="email" type="email" placeholder="you@email.com" required />
        <button type="submit">Join the waitlist</button>
      </form>
    </main>
  );
}
