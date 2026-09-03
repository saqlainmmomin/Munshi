import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { joinParty, getParticipant } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getParticipant(id, user.id);
  if (existing) {
    return NextResponse.json({ alreadyMember: true, participantId: existing.id });
  }

  const body = await request.json();
  await joinParty(id, user.id, body.displayName || user.email?.split("@")[0] || "Member");

  return NextResponse.json({ joined: true });
}
