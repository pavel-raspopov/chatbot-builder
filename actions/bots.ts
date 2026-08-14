"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { canRemoveBranding, getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type CreateBotActionState = {
  error: string | null;
};

export type UpdateBotActionState = {
  error: string | null;
  message: string | null;
};

export type DeleteBotResult =
  | { success: true }
  | { success: false; error: string };

const STORAGE_REMOVE_BATCH = 1000;

const DEFAULT_WELCOME = "Hi! How can I help you today?";

function readString(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export async function createBot(
  _prev: CreateBotActionState,
  formData: FormData,
): Promise<CreateBotActionState> {
  try {
    const name = readString(formData, "name");
    const welcomeMessage = readString(formData, "welcome_message");
    const systemPrompt = readString(formData, "system_prompt");

    if (!name) {
      return { error: "Bot name is required." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You need to sign in to create a bot." };
    }

    const [profileResult, botsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("bots")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    if (profileResult.error || !profileResult.data) {
      return { error: "Could not load your plan. Please try again." };
    }

    if (botsResult.error) {
      return { error: "Could not check your bot limit. Please try again." };
    }

    const limits = getPlanLimits(normalizePlanId(profileResult.data.plan));
    const botCount = botsResult.count ?? 0;

    if (botCount >= limits.maxBots) {
      return {
        error: `Your plan allows ${limits.maxBots} bot${limits.maxBots === 1 ? "" : "s"}. Upgrade to create more.`,
      };
    }

    const { data, error } = await supabase
      .from("bots")
      .insert({
        user_id: user.id,
        name,
        welcome_message: welcomeMessage || DEFAULT_WELCOME,
        system_prompt: systemPrompt,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[actions/bots] createBot", error);
      return { error: "Failed to create bot. Please try again." };
    }

    revalidatePath("/bots");
    revalidatePath("/dashboard");
    redirect(`/bots/${data.id}`);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/bots] createBot", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateBot(
  _prev: UpdateBotActionState,
  formData: FormData,
): Promise<UpdateBotActionState> {
  try {
    const botId = readString(formData, "bot_id");
    const name = readString(formData, "name");
    const welcomeMessage = readString(formData, "welcome_message");
    const systemPrompt = readString(formData, "system_prompt");
    const wantsBrandingRemoved = formData.get("remove_branding") === "on";

    if (!botId) {
      return { error: "Missing bot id.", message: null };
    }

    if (!name) {
      return { error: "Bot name is required.", message: null };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You need to sign in to update this bot.", message: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { error: "Could not load your plan. Please try again.", message: null };
    }

    const removeBranding =
      canRemoveBranding(profile.plan) && wantsBrandingRemoved;

    const { data, error } = await supabase
      .from("bots")
      .update({
        name,
        welcome_message: welcomeMessage || DEFAULT_WELCOME,
        system_prompt: systemPrompt,
        remove_branding: removeBranding,
      })
      .eq("id", botId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[actions/bots] updateBot", error);
      return { error: "Failed to save bot. Please try again.", message: null };
    }

    if (!data) {
      return { error: "Bot not found.", message: null };
    }

    revalidatePath("/bots");
    revalidatePath("/dashboard");
    revalidatePath(`/bots/${botId}`);
    return { error: null, message: "Bot settings saved." };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/bots] updateBot", error);
    return { error: "Something went wrong. Please try again.", message: null };
  }
}

export async function deleteBot(botId: string): Promise<DeleteBotResult> {
  try {
    if (!botId) {
      return { success: false, error: "Missing bot id." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You need to sign in to delete a bot." };
    }

    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("id")
      .eq("id", botId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError) {
      console.error("[actions/bots] deleteBot load", botError);
      return { success: false, error: "Could not load this bot. Please try again." };
    }

    if (!bot) {
      return { success: false, error: "Bot not found." };
    }

    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("bot_id", botId)
      .eq("user_id", user.id);

    if (docsError) {
      console.error("[actions/bots] deleteBot documents", docsError);
      return {
        success: false,
        error: "Could not load this bot's files. Please try again.",
      };
    }

    const paths = (documents ?? [])
      .map((row) => row.storage_path)
      .filter((path) => path.length > 0);

    for (let i = 0; i < paths.length; i += STORAGE_REMOVE_BATCH) {
      const batch = paths.slice(i, i + STORAGE_REMOVE_BATCH);
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove(batch);

      if (storageError) {
        // Official Storage API delete; continue so the bot row can still be removed.
        console.error("[actions/bots] deleteBot storage", storageError);
      }
    }

    const { error, count } = await supabase
      .from("bots")
      .delete({ count: "exact" })
      .eq("id", botId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[actions/bots] deleteBot", error);
      return { success: false, error: "Failed to delete bot. Please try again." };
    }

    if (!count) {
      return { success: false, error: "Bot not found." };
    }

    revalidatePath("/bots");
    revalidatePath("/dashboard");
    revalidatePath(`/bots/${botId}`);
    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/bots] deleteBot", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
