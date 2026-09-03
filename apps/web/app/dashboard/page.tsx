import { getUserParties } from "@/lib/db";
import { requireUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const parties = await getUserParties(user.id);

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Your searches</h1>
        <a
          href="/party/create"
          style={{
            padding: "0.55rem 1rem",
            borderRadius: "var(--radius)",
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          New search
        </a>
      </div>

      {parties.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            No active searches yet. Start one to find your next flat.
          </p>
          <a
            href="/party/create"
            style={{ color: "var(--accent)", fontSize: "1rem" }}
          >
            Start a search &rarr;
          </a>
        </div>
      ) : (
        parties.map((p) => (
          <a
            key={p.id}
            href={`/party/${p.id}/review`}
            style={{
              display: "block",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1rem 1.2rem",
              marginBottom: "0.75rem",
              textDecoration: "none",
              color: "var(--fg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{p.corridor || "Search"}</strong>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                  {p.bhk ? `${p.bhk}BHK` : ""} · ₹{p.budget_target.toLocaleString("en-IN")}/mo
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "20px",
                  background: p.status === "active" ? "var(--accent)" : "var(--border)",
                  color: p.status === "active" ? "#fff" : "var(--muted)",
                }}
              >
                {p.status}
              </span>
            </div>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
              {p.role === "creator" ? "Creator" : "Member"} · created{" "}
              {new Date(p.created_at).toLocaleDateString()}
            </p>
          </a>
        ))
      )}
    </main>
  );
}
