import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createParty } from "@/lib/db";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const partyId = await createParty({
    userId: user.id,
    displayName: body.displayName || user.email?.split("@")[0] || "Creator",
    budgetTarget: body.budgetTarget,
    budgetCeiling: body.budgetCeiling,
    bhk: body.bhk || null,
    occupancy: body.occupancy || null,
    furnishingPref: body.furnishingPref || "any",
    moveInDate: body.moveInDate || null,
    corridor: body.corridor || null,
    locations: body.locations || [],
    softPrefsText: body.softPrefsText || null,
    softPrefTags: body.softPrefTags || [],
    anchors: body.anchors || [],
  });

  return NextResponse.json({ id: partyId });
}
