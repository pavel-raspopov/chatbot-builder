import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag/ingest";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

type IngestBody = {
  documentId?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: IngestBody;
    try {
      body = (await request.json()) as IngestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const documentId =
      typeof body.documentId === "string" ? body.documentId.trim() : "";

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

    const result = await ingestDocument(supabase, documentId, user.id);

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
