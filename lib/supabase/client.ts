import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublicKey());
}
