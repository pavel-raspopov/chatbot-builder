import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabase = SupabaseClient<Database>;

export type ConsumeQuotaResult =
  | { ok: true; used: number; limit: number }
  | { ok: false; error: string; statusCode: 429 | 500 };

type QuotaRow = {
  allowed: boolean;
  used: number;
  month_limit: number;
};

function readQuotaRow(value: unknown): QuotaRow | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (typeof row !== "object" || row === null) {
    return null;
  }
  if (
    !("allowed" in row) ||
    !("used" in row) ||
    !("month_limit" in row) ||
    typeof row.allowed !== "boolean" ||
    typeof row.used !== "number" ||
    typeof row.month_limit !== "number"
  ) {
    return null;
  }
  return {
    allowed: row.allowed,
    used: row.used,
    month_limit: row.month_limit,
  };
}

function isMissingRpc(error: { message?: string; code?: string }): boolean {
  const message = error.message ?? "";
  return (
    error.code === "PGRST202" ||
    /consume_message_quota|consume_owner_message_quota/i.test(message) ||
    /could not find the function/i.test(message)
  );
}

/**
 * Reset the monthly counter if the window expired, then increment by one
 * when under the plan cap. Uses SECURITY DEFINER RPC on the user session
 * (profiles quota columns are not client-updatable).
 */
export async function consumeMessageQuota(
  supabase: AppSupabase,
  userId: string,
): Promise<ConsumeQuotaResult> {
  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (loadError || !profile) {
    console.error("[lib/usage] load", loadError);
    return {
      ok: false,
      error: "Could not check your message quota. Please try again.",
      statusCode: 500,
    };
  }

  const limit = getPlanLimits(normalizePlanId(profile.plan)).maxMessagesPerMonth;
  const { data, error } = await supabase.rpc("consume_message_quota", {
    p_max: limit,
  });

  if (error) {
    console.error("[lib/usage] consume_message_quota", error);
    if (isMissingRpc(error)) {
      return {
        ok: false,
        error:
          "Message quota is not configured on the database. Apply the latest migration and try again.",
        statusCode: 500,
      };
    }
    return {
      ok: false,
      error: "Could not check your message quota. Please try again.",
      statusCode: 500,
    };
  }

  const row = readQuotaRow(data);
  if (!row) {
    console.error("[lib/usage] unexpected rpc payload", data);
    return {
      ok: false,
      error: "Could not check your message quota. Please try again.",
      statusCode: 500,
    };
  }

  if (!row.allowed) {
    return {
      ok: false,
      error:
        "You've reached your monthly message limit. Upgrade your plan to send more.",
      statusCode: 429,
    };
  }

  return { ok: true, used: row.used, limit: row.month_limit };
}

/**
 * Same monthly counter as consumeMessageQuota, targeting a bot owner.
 * Widget visitors have no JWT — call this with the service-role client only.
 */
export async function consumeOwnerMessageQuota(
  supabase: AppSupabase,
  ownerUserId: string,
): Promise<ConsumeQuotaResult> {
  const { data: profile, error: loadError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", ownerUserId)
    .maybeSingle();

  if (loadError || !profile) {
    console.error("[lib/usage] owner load", loadError);
    return {
      ok: false,
      error: "Could not check this bot’s message quota. Please try again.",
      statusCode: 500,
    };
  }

  const limit = getPlanLimits(normalizePlanId(profile.plan)).maxMessagesPerMonth;
  const { data, error } = await supabase.rpc("consume_owner_message_quota", {
    p_user_id: ownerUserId,
    p_max: limit,
  });

  if (error) {
    console.error("[lib/usage] consume_owner_message_quota", error);
    if (isMissingRpc(error)) {
      return {
        ok: false,
        error:
          "Message quota is not configured on the database. Apply the latest migration and try again.",
        statusCode: 500,
      };
    }
    return {
      ok: false,
      error: "Could not check this bot’s message quota. Please try again.",
      statusCode: 500,
    };
  }

  const row = readQuotaRow(data);
  if (!row) {
    console.error("[lib/usage] unexpected owner rpc payload", data);
    return {
      ok: false,
      error: "Could not check this bot’s message quota. Please try again.",
      statusCode: 500,
    };
  }

  if (!row.allowed) {
    return {
      ok: false,
      error: "This bot has reached its monthly message limit.",
      statusCode: 429,
    };
  }

  return { ok: true, used: row.used, limit: row.month_limit };
}
