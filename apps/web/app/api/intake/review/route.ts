import { NextRequest, NextResponse } from "next/server";
import { reviewIntake } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, decision, notes } = body;

    if (!id || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await reviewIntake(id, decision, notes);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Intake review failed:", err);
    return NextResponse.json({ error: "Review failed" }, { status: 500 });
  }
}
