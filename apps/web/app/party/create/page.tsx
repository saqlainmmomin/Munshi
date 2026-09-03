"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FURNISHING_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "furnished", label: "Fully furnished" },
  { value: "semi", label: "Semi-furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

const COMMUTE_MODES = [
  { value: "two_wheeler", label: "Two-wheeler" },
  { value: "auto", label: "Auto" },
  { value: "car", label: "Car" },
  { value: "transit", label: "Public transit" },
  { value: "walk", label: "Walk" },
];

interface Anchor {
  label: string;
  address: string;
  mode: string;
  maxPeakMinutes: number;
}

export default function CreatePartyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [budgetTarget, setBudgetTarget] = useState("");
  const [budgetCeiling, setBudgetCeiling] = useState("");
  const [bhk, setBhk] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [furnishing, setFurnishing] = useState("any");
  const [moveInDate, setMoveInDate] = useState("");
  const [corridor, setCorridor] = useState("");
  const [softPrefs, setSoftPrefs] = useState("");
  const [anchors, setAnchors] = useState<Anchor[]>([
    { label: "", address: "", mode: "two_wheeler", maxPeakMinutes: 35 },
  ]);

  function updateAnchor(i: number, field: keyof Anchor, value: string | number) {
    setAnchors((prev) => prev.map((a, j) => (j === i ? { ...a, [field]: value } : a)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const target = parseInt(budgetTarget, 10);
    const ceiling = parseInt(budgetCeiling || budgetTarget, 10);
    if (isNaN(target)) {
      setError("Budget target is required.");
      setLoading(false);
      return;
    }

    const validAnchors = anchors.filter((a) => a.label && a.address);

    const res = await fetch("/api/party", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName || undefined,
        budgetTarget: target,
        budgetCeiling: ceiling,
        bhk: bhk ? parseInt(bhk, 10) : null,
        occupancy: occupancy ? parseInt(occupancy, 10) : null,
        furnishingPref: furnishing,
        moveInDate: moveInDate || null,
        corridor: corridor || null,
        softPrefsText: softPrefs || null,
        anchors: validAnchors,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/party/${id}/review`);
  }

  const inputStyle = {
    padding: "0.65rem 0.9rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--fg)",
    fontSize: "0.95rem",
    width: "100%",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.3rem",
    fontSize: "0.85rem",
    fontWeight: 600 as const,
  };

  return (
    <main>
      <h1>Start a search</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Set your requirements. We&apos;ll continuously find flats that match.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.2rem", maxWidth: 520 }}
      >
        {/* Display name */}
        <div>
          <label style={labelStyle}>Your name</label>
          <input
            style={inputStyle}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How your search mates will see you"
          />
        </div>

        {/* Budget */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Budget target (₹/mo) *</label>
            <input
              style={inputStyle}
              type="number"
              value={budgetTarget}
              onChange={(e) => setBudgetTarget(e.target.value)}
              placeholder="e.g. 45000"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Exceptional ceiling (₹/mo)</label>
            <input
              style={inputStyle}
              type="number"
              value={budgetCeiling}
              onChange={(e) => setBudgetCeiling(e.target.value)}
              placeholder="e.g. 55000"
            />
          </div>
        </div>

        {/* BHK + occupancy */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>BHK</label>
            <input
              style={inputStyle}
              type="number"
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
          <div>
            <label style={labelStyle}>Occupants</label>
            <input
              style={inputStyle}
              type="number"
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        {/* Furnishing + move-in */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Furnishing</label>
            <select
              style={inputStyle}
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
            >
              {FURNISHING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Move-in date</label>
            <input
              style={inputStyle}
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />
          </div>
        </div>

        {/* Corridor */}
        <div>
          <label style={labelStyle}>Area / corridor</label>
          <input
            style={inputStyle}
            value={corridor}
            onChange={(e) => setCorridor(e.target.value)}
            placeholder="e.g. Koramangala–Indiranagar–Domlur"
          />
        </div>

        {/* Soft preferences */}
        <div>
          <label style={labelStyle}>What matters to you?</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={softPrefs}
            onChange={(e) => setSoftPrefs(e.target.value)}
            placeholder="Natural light, spacious rooms, quiet street, balcony, near parks…"
          />
        </div>

        {/* Commute anchors */}
        <fieldset style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem" }}>
          <legend style={{ fontSize: "0.85rem", fontWeight: 600 }}>Commute anchors</legend>
          {anchors.map((a, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <input
                style={inputStyle}
                placeholder="Label (e.g. Office)"
                value={a.label}
                onChange={(e) => updateAnchor(i, "label", e.target.value)}
              />
              <input
                style={inputStyle}
                placeholder="Address / area"
                value={a.address}
                onChange={(e) => updateAnchor(i, "address", e.target.value)}
              />
              <select
                style={inputStyle}
                value={a.mode}
                onChange={(e) => updateAnchor(i, "mode", e.target.value)}
              >
                {COMMUTE_MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                style={inputStyle}
                type="number"
                placeholder="Max peak minutes"
                value={a.maxPeakMinutes}
                onChange={(e) => updateAnchor(i, "maxPeakMinutes", parseInt(e.target.value, 10) || 0)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAnchors((prev) => [...prev, { label: "", address: "", mode: "two_wheeler", maxPeakMinutes: 35 }])}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}
          >
            + Add another anchor
          </button>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.85rem",
            borderRadius: "var(--radius)",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating…" : "Start searching"}
        </button>

        {error && <p style={{ color: "#d44", margin: 0 }}>{error}</p>}
      </form>
    </main>
  );
}
