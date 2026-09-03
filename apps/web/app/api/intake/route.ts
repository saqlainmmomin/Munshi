import { NextRequest, NextResponse } from "next/server";
import { db, createIntakeSubmission, addIntakePhoto } from "@/lib/db";

const VALID_SOURCES = [
  "facebook_manual",
  "whatsapp_manual",
  "x",
  "self_submitted",
] as const;

const MAX_PHOTOS = 10;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const source = formData.get("source") as string;
    const rawText = formData.get("raw_text") as string;
    const sourceUrl = formData.get("source_url") as string | null;
    const posterContact = formData.get("poster_contact") as string | null;
    const structuredJson = formData.get("structured") as string | null;

    if (!source || !VALID_SOURCES.includes(source as (typeof VALID_SOURCES)[number])) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }
    if (!rawText?.trim()) {
      return NextResponse.json({ error: "Listing text is required" }, { status: 400 });
    }

    let structured: Record<string, unknown> = {};
    if (structuredJson) {
      try {
        structured = JSON.parse(structuredJson);
      } catch {
        return NextResponse.json({ error: "Invalid structured data" }, { status: 400 });
      }
    }

    const submissionId = await createIntakeSubmission({
      source,
      raw_text: rawText.trim(),
      structured,
      source_url: sourceUrl?.trim() || undefined,
      poster_contact: posterContact?.trim() || undefined,
    });

    // Upload photos to Supabase Storage
    const photos = formData.getAll("photos") as File[];
    const validPhotos = photos.filter(
      (f) => f instanceof File && f.size > 0 && f.size <= MAX_PHOTO_SIZE,
    );

    for (let i = 0; i < Math.min(validPhotos.length, MAX_PHOTOS); i++) {
      const file = validPhotos[i];
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `intake/${submissionId}/${i}.${ext}`;

      const { error: uploadErr } = await db()
        .storage.from("listing-photos")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        console.error("Photo upload failed:", uploadErr);
        continue;
      }

      const { data: urlData } = db()
        .storage.from("listing-photos")
        .getPublicUrl(storagePath);

      await addIntakePhoto({
        submission_id: submissionId,
        storage_path: storagePath,
        url: urlData.publicUrl,
        position: i,
      });
    }

    return NextResponse.json({ id: submissionId }, { status: 201 });
  } catch (err) {
    console.error("Intake submission failed:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
