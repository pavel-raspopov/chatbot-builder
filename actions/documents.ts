"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import {
  buildDocumentStoragePath,
  formatBytes,
  validateDocumentMeta,
} from "@/lib/documents";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type CreateDocumentInput = {
  filename: string;
  mimeType: string;
  byteSize: number;
};

export type CreateDocumentResult =
  | { success: true; documentId: string; storagePath: string }
  | { success: false; error: string };

export type DeleteDocumentResult =
  | { success: true }
  | { success: false; error: string };

export async function createDocument(
  botId: string,
  input: CreateDocumentInput,
): Promise<CreateDocumentResult> {
  try {
    if (!botId) {
      return { success: false, error: "Missing bot id." };
    }

    const validated = validateDocumentMeta(input);
    if (!validated.ok) {
      return { success: false, error: validated.error };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You need to sign in to upload documents." };
    }

    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("id")
      .eq("id", botId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError) {
      console.error("[actions/documents] createDocument bot", botError);
      return { success: false, error: "Could not verify this bot. Please try again." };
    }

    if (!bot) {
      return { success: false, error: "Bot not found." };
    }

    const [profileResult, usageResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("documents").select("byte_size").eq("user_id", user.id),
    ]);

    if (profileResult.error || !profileResult.data) {
      return { success: false, error: "Could not load your plan. Please try again." };
    }

    if (usageResult.error) {
      console.error("[actions/documents] createDocument usage", usageResult.error);
      return {
        success: false,
        error: "Could not check your storage quota. Please try again.",
      };
    }

    const usedBytes = (usageResult.data ?? []).reduce(
      (sum, row) => sum + (row.byte_size ?? 0),
      0,
    );
    const limits = getPlanLimits(normalizePlanId(profileResult.data.plan));
    const projected = usedBytes + input.byteSize;

    if (projected > limits.maxStorageBytes) {
      return {
        success: false,
        error: `Your plan allows ${formatBytes(limits.maxStorageBytes)} of storage (${formatBytes(usedBytes)} used). Upgrade to upload more.`,
      };
    }

    const documentId = randomUUID();
    const storagePath = buildDocumentStoragePath(
      user.id,
      botId,
      documentId,
      validated.filename,
    );

    const { error: insertError } = await supabase.from("documents").insert({
      id: documentId,
      bot_id: botId,
      user_id: user.id,
      filename: validated.filename,
      storage_path: storagePath,
      mime_type: validated.mimeType,
      byte_size: input.byteSize,
      status: "pending",
    });

    if (insertError) {
      console.error("[actions/documents] createDocument insert", insertError);
      return { success: false, error: "Failed to create document. Please try again." };
    }

    revalidatePath(`/bots/${botId}`);
    return { success: true, documentId, storagePath };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/documents] createDocument", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteDocument(
  documentId: string,
): Promise<DeleteDocumentResult> {
  try {
    if (!documentId) {
      return { success: false, error: "Missing document id." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You need to sign in to delete documents.",
      };
    }

    const { data: document, error: loadError } = await supabase
      .from("documents")
      .select("id, bot_id, storage_path")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (loadError) {
      console.error("[actions/documents] deleteDocument load", loadError);
      return { success: false, error: "Could not load document. Please try again." };
    }

    if (!document) {
      return { success: false, error: "Document not found." };
    }

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([document.storage_path]);

    if (storageError) {
      // Object may already be missing after a failed upload — continue to delete the row.
      console.error("[actions/documents] deleteDocument storage", storageError);
    }

    const { error: deleteError, count } = await supabase
      .from("documents")
      .delete({ count: "exact" })
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[actions/documents] deleteDocument delete", deleteError);
      return { success: false, error: "Failed to delete document. Please try again." };
    }

    if (!count) {
      return { success: false, error: "Document not found." };
    }

    revalidatePath(`/bots/${document.bot_id}`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/documents] deleteDocument", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
