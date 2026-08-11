import type { ReactNode } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/Button";

export default function SignupPage(): ReactNode {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <p className="font-display text-2xl font-semibold text-accent">DocuChat</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Start free
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Create an account to build bots from your docs. Free plan, no card
        required.
      </p>
      <SignupForm />
      <div className="mt-8">
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </main>
  );
}
