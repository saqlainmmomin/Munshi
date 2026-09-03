import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getParticipant, recordMatchAction, addToShortlist } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: partyId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const participant = await getParticipant(partyId, user.id);
  if (!participant) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const body = await request.json();
  const { listingId, action, passReasons } = body;

  if (action === "pass") {
    await recordMatchAction(participant.id, listingId, "passed", passReasons);
  } else if (action === "shortlist") {
    await recordMatchAction(participant.id, listingId, "shortlisted");
    await addToShortlist(partyId, listingId, participant.id);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
