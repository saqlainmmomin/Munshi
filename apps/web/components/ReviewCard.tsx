import type { ReviewListing } from "@/lib/types";
import { RESTRICTED_ATTR_LABELS } from "@/lib/guardrails";

// Photo-led review card (PRD §5.2, §6). Shows photos, price, deposit, freshness,
// commute, why-selected, light/space assessment, uncertainties, and source.
// Restricted attrs render as informational facts only (never a filter — §10.1).

function inr(n: number | null): string {
  return n == null ? "—" : `₹${n.toLocaleString("en-IN")}`;
}

function pct(n: number | null): string | null {
  return n == null ? null : `${Math.round(n * 100)}%`;
}

export function ReviewCard({ listing }: { listing: ReviewListing }) {
  const cover = listing.photos[0];
  const light = pct(cover?.light_score ?? null);
  const space = pct(cover?.space_score ?? null);

  return (
    <article
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        marginBottom: "1rem",
      }}
    >
      {/* Photo strip. Real image hosts get allowlisted in next.config as the
          worker produces them; for now a labelled placeholder keeps it clean. */}
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "linear-gradient(135deg, var(--border), var(--card))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: ".6rem .8rem",
          color: "var(--muted)",
          fontSize: ".8rem",
        }}
      >
        <span>{listing.photos.length} photo{listing.photos.length === 1 ? "" : "s"}</span>
        <span>
          {light && `☀ light ${light}`}
          {light && space && "  ·  "}
          {space && `▢ space ${space}`}
        </span>
      </div>

      <div style={{ padding: "0.9rem 1.1rem 1.1rem" }}>
        <h3 style={{ margin: "0 0 .3rem" }}>{listing.title ?? "Untitled listing"}</h3>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          {inr(listing.rent)}/mo
          {listing.deposit != null && ` · deposit ${inr(listing.deposit)}`}
          {listing.bhk != null && ` · ${listing.bhk}BHK`}
          {listing.location?.area && ` · ${listing.location.area}`}
        </p>

        {listing.missing_fields.length > 0 && (
          <p style={{ margin: ".5rem 0 0", fontSize: ".82rem", color: "var(--muted)" }}>
            Verifying: {listing.missing_fields.join(", ")}
          </p>
        )}

        {listing.restricted_attrs.length > 0 && (
          <p style={{ margin: ".5rem 0 0", fontSize: ".82rem", color: "var(--muted)" }}>
            {listing.restricted_attrs
              .map((a) => RESTRICTED_ATTR_LABELS[a] ?? a)
              .join(" · ")}
          </p>
        )}

        <p style={{ margin: ".6rem 0 0", fontSize: ".72rem", color: "var(--muted)", opacity: 0.7 }}>
          via {listing.source}
        </p>

        {/* TODO: pass (multi-select reason chips) + add-to-shortlist actions,
            keyboard controls, photo carousel. */}
      </div>
    </article>
  );
}
