import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient(): SupabaseClient {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublicKey());
}
