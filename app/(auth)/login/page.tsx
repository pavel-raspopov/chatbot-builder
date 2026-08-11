import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export default function LoginPage(): ReactNode {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <p className="font-display text-2xl font-semibold text-accent">DocuChat</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Log in
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Auth arrives next. Supabase email/password sign-in will replace this
        placeholder.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/" variant="secondary">
          Back to home
        </Button>
        <Link
          href="/signup"
          className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
        >
          Start free instead
        </Link>
      </div>
    </main>
  );
}
