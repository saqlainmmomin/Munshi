"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeSubmission } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  whatsapp_manual: "WhatsApp",
  facebook_manual: "Facebook",
  x: "X (Twitter)",
  self_submitted: "Direct",
  nobroker: "NoBroker",
};

export function IntakeQueue({ submissions }: { submissions: IntakeSubmission[] }) {
  const [items, setItems] = useState(submissions);
  const router = useRouter();

  async function handleReview(id: string, decision: "approved" | "rejected") {
    const res = await fetch("/api/intake/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    }
  }

  if (items.length === 0) {
    return <p style={{ color: "var(--muted)" }}>All caught up.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {items.map((sub) => (
        <article
          key={sub.id}
          style={{
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1rem",
            background: "var(--card)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.2rem 0.5rem",
                borderRadius: "6px",
                background: "rgba(47, 111, 79, 0.1)",
                color: "var(--accent)",
              }}
            >
              {SOURCE_LABELS[sub.source] ?? sub.source}
            </span>
            <time style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {new Date(sub.submitted_at).toLocaleString()}
            </time>
          </div>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "var(--font)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              margin: "0.5rem 0",
              padding: "0.75rem",
              background: "var(--bg)",
              borderRadius: "8px",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            {sub.raw_text}
          </pre>

          {/* Structured fields if any */}
          {Object.keys(sub.structured).length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                fontSize: "0.8125rem",
                color: "var(--muted)",
                marginBottom: "0.5rem",
              }}
            >
              {Object.entries(sub.structured).map(([k, v]) => (
                <span key={k}>
                  <strong>{k}:</strong> {String(v)}
                </span>
              ))}
            </div>
          )}

          {sub.poster_contact && (
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: "0.25rem 0" }}>
              Contact: {sub.poster_contact}
            </p>
          )}

          {sub.source_url && (
            <p style={{ fontSize: "0.8125rem", margin: "0.25rem 0" }}>
              <a href={sub.source_url} target="_blank" rel="noopener noreferrer">
                Original post
              </a>
            </p>
          )}

          {/* Photos */}
          {sub.intake_photos && sub.intake_photos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                margin: "0.75rem 0",
                paddingBottom: "0.25rem",
              }}
            >
              {sub.intake_photos
                .sort((a, b) => a.position - b.position)
                .map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt=""
                    style={{
                      width: "120px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                  />
                ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button
              onClick={() => handleReview(sub.id, "approved")}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "var(--radius)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => handleReview(sub.id, "rejected")}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "var(--radius)",
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--muted)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
