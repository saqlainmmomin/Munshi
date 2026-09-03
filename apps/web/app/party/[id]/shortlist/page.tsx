import { getShortlist, getParticipant } from "@/lib/db";
import { requireUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { RESTRICTED_ATTR_LABELS } from "@/lib/guardrails";

function inr(n: number | null): string {
  return n == null ? "—" : `₹${n.toLocaleString("en-IN")}`;
}

export default async function ShortlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const participant = await getParticipant(id, user.id);
  if (!participant) redirect(`/party/${id}/join`);

  const items = await getShortlist(id);

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Shared shortlist</h1>
          <p style={{ color: "var(--muted)", margin: "0.3rem 0 0" }}>
            {items.length} {items.length === 1 ? "flat" : "flats"} shortlisted
          </p>
        </div>
        <a
          href={`/party/${id}/review`}
          style={{ fontSize: "0.9rem", color: "var(--accent)", textDecoration: "none" }}
        >
          &larr; Review
        </a>
      </div>

      {items.length === 0 ? (
        <p>No shortlisted flats yet. Shortlist from the review page to see them here.</p>
      ) : (
        items.map((item) => (
          <article
            key={item.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                aspectRatio: "16 / 9",
                background: item.photos[0]?.url
                  ? `url(${item.photos[0].url}) center/cover`
                  : "linear-gradient(135deg, var(--border), var(--card))",
                display: "flex",
                alignItems: "flex-end",
                padding: ".6rem .8rem",
                color: "#fff",
                fontSize: ".8rem",
                textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              <span>{item.photos.length} photo{item.photos.length === 1 ? "" : "s"}</span>
            </div>
            <div style={{ padding: "0.9rem 1.1rem 1.1rem" }}>
              <h3 style={{ margin: "0 0 .3rem" }}>{item.title ?? "Untitled listing"}</h3>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {inr(item.rent)}/mo
                {item.deposit != null && ` · deposit ${inr(item.deposit)}`}
                {item.bhk != null && ` · ${item.bhk}BHK`}
                {item.location?.area && ` · ${item.location.area}`}
              </p>

              {item.restricted_attrs.length > 0 && (
                <p style={{ margin: ".5rem 0 0", fontSize: ".82rem", color: "var(--muted)" }}>
                  {item.restricted_attrs.map((a) => RESTRICTED_ATTR_LABELS[a] ?? a).join(" · ")}
                </p>
              )}

              <p style={{ margin: ".6rem 0 0", fontSize: ".72rem", color: "var(--muted)", opacity: 0.7 }}>
                via {item.source.replace(/_/g, " ")} · shortlisted {new Date(item.added_at).toLocaleDateString()}
              </p>
            </div>
          </article>
        ))
      )}
    </main>
  );
}
