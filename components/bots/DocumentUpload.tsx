"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { createDocument, deleteDocument } from "@/actions/documents";
import { Button } from "@/components/ui/Button";
import {
  formatBytes,
  getDocumentAcceptAttribute,
  validateDocumentMeta,
} from "@/lib/documents";
import { requestDocumentIngest } from "@/lib/ingest-client";
import { createClient } from "@/lib/supabase/client";

export type DocumentUploadProps = {
  botId: string;
  usedBytes: number;
  maxStorageBytes: number;
};

export function DocumentUpload({
  botId,
  usedBytes,
  maxStorageBytes,
}: DocumentUploadProps): ReactNode {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "uploading" | "indexing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const remaining = Math.max(0, maxStorageBytes - usedBytes);
  const atQuota = remaining <= 0;
  const busy = isPending || phase !== "idle";

  function processFile(file: File): void {
    setError(null);

    if (atQuota) {
      setError(
        `Your plan allows ${formatBytes(maxStorageBytes)} of storage. Upgrade to upload more.`,
      );
      return;
    }

    if (file.size > remaining) {
      setError(
        `Not enough storage left (${formatBytes(remaining)} remaining on your plan).`,
      );
      return;
    }

    const validated = validateDocumentMeta({
      filename: file.name,
      mimeType: file.type,
      byteSize: file.size,
    });

    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    startTransition(async () => {
      setPhase("uploading");
      const created = await createDocument(botId, {
        filename: file.name,
        mimeType: file.type,
        byteSize: file.size,
      });

      if (!created.success) {
        setPhase("idle");
        setError(created.error);
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(created.storagePath, file, {
          contentType: validated.mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error("[DocumentUpload] storage", uploadError);
        await deleteDocument(created.documentId);
        setPhase("idle");
        setError("Upload failed. Please try again.");
        return;
      }

      setPhase("indexing");
      const ingest = await requestDocumentIngest(created.documentId);
      setPhase("idle");

      if (!ingest.success) {
        setError(ingest.error);
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      processFile(file);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    if (busy || atQuota) {
      return;
    }
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Documents
        </h2>
        <p className="text-sm text-text-secondary">
          {formatBytes(usedBytes)} / {formatBytes(maxStorageBytes)} used
        </p>
      </div>

      {atQuota ? (
        <p className="mt-3 text-sm text-text-secondary">
          You&apos;ve reached your storage limit.{" "}
          <Link
            href="/settings/billing"
            className="font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
          >
            Upgrade
          </Link>{" "}
          to upload more.
        </p>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">
          PDF, Markdown, or plain text. Files are indexed automatically after
          upload.
        </p>
      )}

      <div
        role="button"
        tabIndex={atQuota || busy ? -1 : 0}
        aria-disabled={atQuota || busy}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onKeyDown={(event) => {
          if (atQuota || busy) {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!atQuota && !busy) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        onClick={() => {
          if (!atQuota && !busy) {
            inputRef.current?.click();
          }
        }}
        className={`mt-4 rounded-md border border-dashed px-4 py-8 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-muted"
            : "border-border bg-surface-secondary"
        } ${atQuota || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <p className="text-sm font-medium text-text-primary">
          {phase === "indexing"
            ? "Indexing…"
            : phase === "uploading" || isPending
              ? "Uploading…"
              : "Drop a file here, or choose one"}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          .pdf, .md, .txt · up to {formatBytes(remaining)} left on this plan
        </p>
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={atQuota || busy}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Choose file
          </Button>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={getDocumentAcceptAttribute()}
          disabled={atQuota || busy}
          onChange={onInputChange}
        />
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-3 text-sm text-error" role="alert">
          {error}
          {error.includes("Upgrade") ? (
            <>
              {" "}
              <Link
                href="/settings/billing"
                className="font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
              >
                Go to billing
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
