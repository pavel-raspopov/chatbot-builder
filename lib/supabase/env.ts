function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

/** Publishable key preferred; legacy anon JWT accepted as fallback. */
export function getSupabasePublicKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function getSupabaseUrl(): string {
  return requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}
