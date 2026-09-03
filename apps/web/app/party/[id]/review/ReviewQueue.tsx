"use client";

import { useState, useCallback, useEffect } from "react";
import type { ReviewListing } from "@/lib/types";
import { RESTRICTED_ATTR_LABELS } from "@/lib/guardrails";

const PASS_REASONS = [
  { id: "too_dark", label: "Too dark" },
  { id: "cramped", label: "Feels cramped" },
  { id: "dated", label: "Dated interiors" },
  { id: "over_budget", label: "Over budget" },
  { id: "bad_location", label: "Bad location" },
  { id: "no_photos", label: "Not enough photos" },
  { id: "other", label: "Other" },
];

function inr(n: number | null): string {
  return n == null ? "—" : `₹${n.toLocaleString("en-IN")}`;
}

function pct(n: number | null): string | null {
  return n == null ? null : `${Math.round(n * 100)}%`;
}

function Card({
  listing,
  onPass,
  onShortlist,
  active,
}: {
  listing: ReviewListing;
  onPass: (reasons: string[]) => void;
  onShortlist: () => void;
  active: boolean;
}) {
  const [showReasons, setShowReasons] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState(false);

  const cover = listing.photos[0];
  const light = pct(cover?.light_score ?? null);
  const space = pct(cover?.space_score ?? null);

  function toggleReason(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <article
      style={{
        background: "var(--card)",
        border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        marginBottom: "1rem",
        opacity: acting ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 9",
          background: cover?.url
            ? `url(${cover.url}) center/cover`
            : "linear-gradient(135deg, var(--border), var(--card))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: ".6rem .8rem",
          color: "#fff",
          fontSize: ".8rem",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
        }}
      >
        <span>{listing.photos.length} photo{listing.photos.length === 1 ? "" : "s"}</span>
        <span>
          {light && `☀ ${light}`}
          {light && space && " · "}
          {space && `▢ ${space}`}
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

        {listing.description && (
          <p style={{ margin: ".5rem 0 0", fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.4 }}>
            {listing.description.length > 200
              ? listing.description.slice(0, 200) + "…"
              : listing.description}
          </p>
        )}

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
          via {listing.source.replace(/_/g, " ")}
        </p>

        {/* Actions */}
        {!showReasons ? (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              onClick={() => setShowReasons(true)}
              disabled={acting}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--fg)",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Pass
            </button>
            <button
              onClick={async () => {
                setActing(true);
                onShortlist();
              }}
              disabled={acting}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "var(--radius)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Shortlist
            </button>
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0 0 .5rem" }}>
              Why are you passing? (optional)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
              {PASS_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggleReason(r.id)}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    background: selected.has(r.id) ? "var(--accent)" : "transparent",
                    color: selected.has(r.id) ? "#fff" : "var(--fg)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.15s",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowReasons(false)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActing(true);
                  onPass(Array.from(selected));
                }}
                disabled={acting}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: "var(--border)",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Confirm pass
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function ReviewQueue({
  listings: initialListings,
  partyId,
}: {
  listings: ReviewListing[];
  partyId: string;
}) {
  const [listings, setListings] = useState(initialListings);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAction = useCallback(
    async (listingId: string, action: "pass" | "shortlist", passReasons?: string[]) => {
      await fetch(`/api/party/${partyId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action, passReasons }),
      });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    },
    [partyId],
  );

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const listing = listings[currentIndex];
      if (!listing) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(i + 1, listings.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "s" || e.key === "S") {
        handleAction(listing.id, "shortlist");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listings, currentIndex, handleAction]);

  if (listings.length === 0) {
    return <p>All caught up. We&apos;ll surface fresh matches as they arrive.</p>;
  }

  return (
    <div>
      <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "1rem" }}>
        Keyboard: ↑↓ navigate · S shortlist · click Pass for reasons
      </p>
      {listings.map((l, i) => (
        <Card
          key={l.id}
          listing={l}
          active={i === currentIndex}
          onPass={(reasons) => handleAction(l.id, "pass", reasons)}
          onShortlist={() => handleAction(l.id, "shortlist")}
        />
      ))}
    </div>
  );
}
