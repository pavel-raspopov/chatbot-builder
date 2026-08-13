"use client";

import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type ChatComposerProps = {
  disabled: boolean;
  sending: boolean;
  onSend: (text: string) => void;
};

export function ChatComposer({
  disabled,
  sending,
  onSend,
}: ChatComposerProps): ReactNode {
  const [value, setValue] = useState("");
  const cannotSend = disabled || sending || value.trim().length === 0;

  function submit(): void {
    const text = value.trim();
    if (disabled || sending || text.length === 0) {
      return;
    }
    onSend(text);
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-md border border-border bg-surface px-3 py-2.5"
    >
      <label className="sr-only" htmlFor="chat-composer">
        Message
      </label>
      <textarea
        id="chat-composer"
        name="message"
        rows={2}
        value={value}
        disabled={disabled || sending}
        placeholder="Ask from your docs…"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        className="max-h-32 min-h-10 flex-1 resize-none bg-transparent text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
      />
      <Button
        type="submit"
        disabled={cannotSend}
        className="shrink-0 px-3 py-1.5 text-xs disabled:opacity-60"
      >
        {sending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
