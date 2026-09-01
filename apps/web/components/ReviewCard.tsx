import type { Listing } from "@/lib/types";
import { RESTRICTED_ATTR_LABELS } from "@/lib/guardrails";

// Photo-led review card (PRD §5.2, §6). Shows photos, price, deposit, freshness,
// commute, why-selected, light/space assessment, uncertainties, and source.
// Restricted attrs render as informational facts only (never a filter — §10.1).

export function ReviewCard({ listing }: { listing: Listing }) {
  return (
    <article
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1rem 1.25rem",
        marginBottom: "1rem",
      }}
    >
      {/* TODO: photo carousel (photo-led), keyboard controls, pass with
          multi-select reason chips, add-to-shortlist. */}
      <h3 style={{ margin: "0 0 .25rem" }}>{listing.title ?? "Untitled listing"}</h3>
      <p style={{ margin: 0, color: "var(--muted)" }}>
        {listing.rent ? `₹${listing.rent.toLocaleString("en-IN")}/mo` : "Rent TBC"}
        {listing.deposit ? ` · deposit ₹${listing.deposit.toLocaleString("en-IN")}` : ""}
        {listing.location?.area ? ` · ${listing.location.area}` : ""}
      </p>

      {listing.restricted_attrs.length > 0 && (
        <p style={{ margin: ".5rem 0 0", fontSize: ".85rem", color: "var(--muted)" }}>
          {listing.restricted_attrs
            .map((a) => RESTRICTED_ATTR_LABELS[a] ?? a)
            .join(" · ")}
        </p>
      )}
    </article>
  );
}
