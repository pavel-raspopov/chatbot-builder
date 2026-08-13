import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabase = SupabaseClient<Database>;

export type BotWidgetConfig = {
  public_id: string;
  name: string;
  welcome_message: string;
  remove_branding: boolean;
};

function readConfigRow(value: unknown): BotWidgetConfig | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (typeof row !== "object" || row === null) {
    return null;
  }
  if (
    !("public_id" in row) ||
    !("name" in row) ||
    !("welcome_message" in row) ||
    !("remove_branding" in row) ||
    typeof row.public_id !== "string" ||
    typeof row.name !== "string" ||
    typeof row.welcome_message !== "string" ||
    typeof row.remove_branding !== "boolean"
  ) {
    return null;
  }
  return {
    public_id: row.public_id,
    name: row.name,
    welcome_message: row.welcome_message,
    remove_branding: row.remove_branding,
  };
}

/** Public widget fields for a bot. Uses SECURITY DEFINER RPC (anon-safe). */
export async function getBotWidgetConfig(
  supabase: AppSupabase,
  publicId: string,
): Promise<BotWidgetConfig | null> {
  const trimmed = publicId.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_bot_widget_config", {
    p_public_id: trimmed,
  });

  if (error) {
    console.error("[widget/config]", error);
    return null;
  }

  return readConfigRow(data);
}
