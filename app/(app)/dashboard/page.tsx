import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : "Signed in";

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
        Dashboard
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        You&apos;re signed in as{" "}
        <span className="font-medium text-text-primary">{email}</span>. Bot
        management arrives next — this page confirms auth works.
      </p>
    </div>
  );
}
