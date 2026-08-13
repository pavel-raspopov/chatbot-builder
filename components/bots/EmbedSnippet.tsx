"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type EmbedSnippetProps = {
  snippet: string;
  previewHref: string;
};

export function EmbedSnippet({
  snippet,
  previewHref,
}: EmbedSnippetProps): ReactNode {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
        Embed on your site
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Paste this script before the closing body tag. Preview opens a sample
        page with the same snippet.
      </p>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary">
        <code>{snippet}</code>
      </pre>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => void handleCopy()}>
          Copy
        </Button>
        <Button href={previewHref} variant="secondary" target="_blank" rel="noreferrer">
          Preview
        </Button>
      </div>
      {copied ? (
        <p className="mt-3 text-sm text-text-secondary" role="status">
          Copied
        </p>
      ) : null}
    </section>
  );
}
