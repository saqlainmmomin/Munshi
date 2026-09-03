"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/party/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: displayName || undefined }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not join.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    if (data.alreadyMember) {
      router.push(`/party/${id}/review`);
      return;
    }

    router.push(`/party/${id}/review`);
  }

  return (
    <main>
      <h1>Join a search party</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        You&apos;ve been invited to search for a flat together.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name (how the group will see you)"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--fg)",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={handleJoin}
          disabled={loading}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius)",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: "1rem",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Joining…" : "Join search"}
        </button>
        {error && <p style={{ color: "#d44", margin: 0 }}>{error}</p>}
      </div>
    </main>
  );
}
