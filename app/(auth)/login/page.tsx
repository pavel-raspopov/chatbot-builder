import type { ReactNode } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/Button";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function safeNextPath(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<ReactNode> {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <p className="font-display text-2xl font-semibold text-accent">DocuChat</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Log in
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Sign in with the email and password for your DocuChat account.
      </p>
      <LoginForm nextPath={nextPath} />
      <div className="mt-8">
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </main>
  );
}
