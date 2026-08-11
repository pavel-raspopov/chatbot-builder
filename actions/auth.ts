"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
  message: string | null;
};

function readCredential(
  formData: FormData,
  field: "email" | "password",
): string {
  const value = formData.get(field);
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function safeNextPath(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readCredential(formData, "email");
  const password = readCredential(formData, "password");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  redirect(next);
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readCredential(formData, "email");
  const password = readCredential(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      message: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    error: null,
    message:
      "Check your email to confirm your account before signing in. For local demo, you can turn off Confirm email in Supabase Auth settings.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
