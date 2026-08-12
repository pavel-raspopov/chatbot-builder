"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type CreateBotActionState = {
  error: string | null;
};

export type DeleteBotResult =
  | { success: true }
  | { success: false; error: string };

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
