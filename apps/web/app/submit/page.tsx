"use client";

import { useState, type FormEvent } from "react";

const SOURCE_OPTIONS = [
  { value: "whatsapp_manual", label: "WhatsApp group" },
  { value: "facebook_manual", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "self_submitted", label: "Direct / broker" },
] as const;

export default function SubmitPage() {
  const [source, setSource] = useState<string>("whatsapp_manual");
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [posterContact, setPosterContact] = useState("");
  const [rent, setRent] = useState("");
  const [bhk, setBhk] = useState("");
  const [area, setArea] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const form = new FormData();
    form.set("source", source);
    form.set("raw_text", rawText);
    if (sourceUrl) form.set("source_url", sourceUrl);
    if (posterContact) form.set("poster_contact", posterContact);

    const structured: Record<string, unknown> = {};
    if (rent) structured.rent = Number(rent);
    if (bhk) structured.bhk = Number(bhk);
    if (area) structured.area = area;
    if (Object.keys(structured).length > 0) {
      form.set("structured", JSON.stringify(structured));
    }

    for (const photo of photos) {
      form.append("photos", photo);
    }

    try {
      const res = await fetch("/api/intake", { method: "POST", body: form });
      if (res.ok) {
        setResult({ ok: true, message: "Submitted! It will appear in the operator queue for review." });
        setRawText("");
        setSourceUrl("");
        setPosterContact("");
        setRent("");
        setBhk("");
        setArea("");
        setPhotos([]);
      } else {
        const data = await res.json();
        setResult({ ok: false, message: data.error || "Something went wrong." });
      }
    } catch {
      setResult({ ok: false, message: "Network error. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Submit a listing</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Paste a flat listing from any source. Photos help a lot.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Source */}
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Source</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {SOURCE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius)",
                  border: `1.5px solid ${source === opt.value ? "var(--accent)" : "var(--border)"}`,
                  background: source === opt.value ? "var(--accent)" : "var(--card)",
                  color: source === opt.value ? "#fff" : "var(--fg)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="source"
                  value={opt.value}
                  checked={source === opt.value}
                  onChange={(e) => setSource(e.target.value)}
                  style={{ display: "none" }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Listing text */}
        <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <span style={{ fontWeight: 600 }}>Listing text *</span>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            required
            rows={6}
            placeholder="Paste the full message / listing description here..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius)",
              border: "1.5px solid var(--border)",
              background: "var(--card)",
              color: "var(--fg)",
              fontFamily: "var(--font)",
              fontSize: "0.9375rem",
              resize: "vertical",
            }}
          />
        </label>

        {/* Photos */}
        <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <span style={{ fontWeight: 600 }}>Photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius)",
              border: "1.5px solid var(--border)",
              background: "var(--card)",
              color: "var(--fg)",
            }}
          />
          {photos.length > 0 && (
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
            </span>
          )}
        </label>

        {/* Optional structured fields */}
        <details style={{ marginTop: "0.25rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--muted)" }}>
            Optional details
          </summary>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Rent (INR/month)</span>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="e.g. 35000"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>BHK</span>
              <input
                type="number"
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                placeholder="e.g. 2"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Area</span>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Koramangala"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Source URL</span>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Link to original post"
                style={inputStyle}
              />
            </label>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                gridColumn: "1 / -1",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Poster contact</span>
              <input
                type="text"
                value={posterContact}
                onChange={(e) => setPosterContact(e.target.value)}
                placeholder="Phone number or name"
                style={inputStyle}
              />
            </label>
          </div>
        </details>

        <button
          type="submit"
          disabled={submitting || !rawText.trim()}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius)",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {submitting ? "Submitting..." : "Submit for review"}
        </button>

        {result && (
          <p
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              background: result.ok ? "rgba(47, 111, 79, 0.1)" : "rgba(200, 50, 50, 0.1)",
              color: result.ok ? "var(--accent)" : "#c83232",
              fontWeight: 500,
            }}
          >
            {result.message}
          </p>
        )}
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: "var(--radius)",
  border: "1.5px solid var(--border)",
  background: "var(--card)",
  color: "var(--fg)",
  fontFamily: "var(--font)",
  fontSize: "0.875rem",
};
