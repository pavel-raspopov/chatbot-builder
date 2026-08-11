import type { ReactNode } from "react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : "Signed in";

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <p className="font-display text-2xl font-semibold text-accent">DocuChat</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Dashboard
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        You&apos;re signed in as{" "}
        <span className="font-medium text-text-primary">{email}</span>. Bot
        management arrives next — this page confirms auth works.
      </p>
      <form action={signOut} className="mt-8 flex flex-wrap gap-3">
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
        <Button href="/" variant="secondary">
          Home
        </Button>
      </form>
    </main>
  );
}
