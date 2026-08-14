"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
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
  removeBranding: boolean;
  canRemoveBranding: boolean;
};

export function EditBotForm({
  botId,
  name,
  welcomeMessage,
  systemPrompt,
  removeBranding,
  canRemoveBranding,
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
      <label className="flex items-start gap-2 text-sm font-medium text-text-primary">
        <input
          type="checkbox"
          name="remove_branding"
          value="on"
          defaultChecked={removeBranding && canRemoveBranding}
          disabled={!canRemoveBranding}
          className="mt-0.5 h-4 w-4 rounded-sm border-border text-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
        />
        <span className="font-normal leading-relaxed">
          Remove DocuChat badge on the widget
          {!canRemoveBranding ? (
            <>
              {" "}
              <Link
                href="/settings/billing"
                className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                Upgrade to hide it
              </Link>
            </>
          ) : null}
        </span>
      </label>
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
