"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  createBot,
  type CreateBotActionState,
} from "@/actions/bots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const initialState: CreateBotActionState = { error: null };

export function CreateBotForm(): ReactNode {
  const [state, formAction, pending] = useActionState(createBot, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <Input
        label="Name"
        name="name"
        type="text"
        required
        maxLength={100}
        placeholder="Support assistant"
        autoComplete="off"
      />
      <Textarea
        label="Welcome message"
        name="welcome_message"
        rows={3}
        placeholder="Hi! How can I help you today?"
      />
      <Textarea
        label="System prompt"
        name="system_prompt"
        rows={6}
        placeholder="You answer questions using the company's uploaded docs. Be concise and accurate."
      />
      {state.error ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create bot"}
        </Button>
        <Button href="/bots" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
