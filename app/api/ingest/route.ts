import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag/ingest";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

function readIngestBody(value: unknown): {
  documentId: string;
  force: boolean;
} {
  if (typeof value !== "object" || value === null) {
    return { documentId: "", force: false };
  }

  const documentIdValue = "documentId" in value ? value.documentId : undefined;
  const forceValue = "force" in value ? value.force : undefined;
  const documentId =
    typeof documentIdValue === "string" ? documentIdValue.trim() : "";
  const force = forceValue === true;

  return { documentId, force };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const { documentId, force } = readIngestBody(raw);

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Missing document id." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "You need to sign in to index documents." },
        { status: 401 },
      );
    }

    const result = await ingestDocument(supabase, documentId, user.id, {
      force,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.statusCode },
      );
    }

    return NextResponse.json({
      success: true,
      chunkCount: result.chunkCount,
    });
  } catch (error) {
    console.error("[api/ingest] POST", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while indexing. Please try again.",
      },
      { status: 500 },
    );
  }
}
