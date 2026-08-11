"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  signUp,
  type AuthActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: AuthActionState = { error: null, message: null };

export function SignupForm(): ReactNode {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
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
        autoComplete="new-password"
        required
        minLength={8}
      />
      {state.error ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-md border border-border bg-accent-muted px-3 py-2 text-sm text-text-secondary">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
