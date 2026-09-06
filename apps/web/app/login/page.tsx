"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") ?? "/dashboard";

  const inputStyle = {
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--fg)",
    fontSize: "1rem",
  };

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  if (sent) {
    return (
      <main>
        <h1>Check your email</h1>
        <p style={{ color: "var(--muted)" }}>
          We sent a login link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Sign in to Munshi</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        {mode === "magic"
          ? "Enter your email and we'll send you a magic link."
          : "Sign in with your email and password."}
      </p>

      <form
        onSubmit={mode === "magic" ? handleMagicLink : handlePassword}
        style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          style={inputStyle}
        />
        {mode === "password" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={inputStyle}
          />
        )}
        <button
          type="submit"
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
          {loading
            ? "Signing in…"
            : mode === "magic"
              ? "Send magic link"
              : "Sign in"}
        </button>
        {error && <p style={{ color: "#d44", margin: 0 }}>{error}</p>}
      </form>

      <button
        onClick={() => setMode(mode === "magic" ? "password" : "magic")}
        style={{
          background: "none",
          border: "none",
          color: "var(--accent)",
          cursor: "pointer",
          fontSize: "0.85rem",
          marginTop: "1rem",
          padding: 0,
        }}
      >
        {mode === "magic" ? "Use password instead" : "Use magic link instead"}
      </button>
    </main>
  );
}

// useSearchParams() opts the tree into client-side rendering, so the export has
// to sit behind a Suspense boundary or the production build fails to prerender
// /login (missing-suspense-with-csr-bailout).
export default function LoginPage() {
  return (
    <Suspense fallback={<main><h1>Sign in to Munshi</h1></main>}>
      <LoginForm />
    </Suspense>
  );
}
