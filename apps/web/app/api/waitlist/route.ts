import { NextRequest, NextResponse } from "next/server";

// Waitlist signup (PRD §11.2). Capacity cap is not pre-committed — signups are
// collected, then converted to active search parties manually (Saqlain-gated).
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  // TODO: persist the signup (a `waitlist` table or Supabase). Skeleton no-ops.
  console.log("[waitlist] signup:", email);

  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
