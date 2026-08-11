"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  signIn,
  type AuthActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: AuthActionState = { error: null, message: null };

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps): ReactNode {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@company.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        minLength={8}
      />
      {state.error ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Log in"}
      </Button>
      <p className="text-sm text-text-secondary">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
        >
          Start free
        </Link>
      </p>
    </form>
  );
}
