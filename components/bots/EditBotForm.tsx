"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { updateBot, type UpdateBotActionState } from "@/actions/bots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const initialState: UpdateBotActionState = { error: null, message: null };

type EditBotFormProps = {
  botId: string;
  name: string;
  welcomeMessage: string;
  systemPrompt: string;
};

export function EditBotForm({
  botId,
  name,
  welcomeMessage,
  systemPrompt,
}: EditBotFormProps): ReactNode {
  const [state, formAction, pending] = useActionState(updateBot, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="bot_id" value={botId} />
      <Input
        label="Name"
        name="name"
        type="text"
        required
        maxLength={100}
        defaultValue={name}
        autoComplete="off"
      />
      <Textarea
        label="Welcome message"
        name="welcome_message"
        rows={3}
        defaultValue={welcomeMessage}
      />
      <Textarea
        label="System prompt"
        name="system_prompt"
        rows={6}
        defaultValue={systemPrompt}
      />
      {state.error ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-text-secondary" role="status">
          {state.message}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
