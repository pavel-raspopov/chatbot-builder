"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { deleteDocument } from "@/actions/documents";
import { Button } from "@/components/ui/Button";
import { formatBytes, formatDocumentStatus } from "@/lib/documents";
import { requestDocumentIngest } from "@/lib/ingest-client";

export type DocumentListItem = {
  id: string;
  filename: string;
  byte_size: number;
  status: string;
  error: string | null;
  created_at: string;
};

export type DocumentsListProps = {
  documents: DocumentListItem[];
};

function formatUploadedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DocumentsList({ documents }: DocumentsListProps): ReactNode {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [action, setAction] = useState<"delete" | "retry" | null>(null);
  const isEmpty = documents.length === 0;

  function handleDelete(documentId: string): void {
    setError(null);
    setActiveId(documentId);
    setAction("delete");
    startTransition(async () => {
      const result = await deleteDocument(documentId);
      setActiveId(null);
      setAction(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRetry(documentId: string): void {
    setError(null);
    setActiveId(documentId);
    setAction("retry");
    startTransition(async () => {
      const result = await requestDocumentIngest(documentId);
      setActiveId(null);
      setAction(null);
      if (!result.success) {
        setError(result.error);
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  if (isEmpty) {
    return (
      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
          No documents yet
        </h3>
        <p className="mt-2 max-w-md text-base leading-relaxed text-text-secondary">
          Upload a PDF, Markdown, or text file so this bot can learn from your
          knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {error ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="divide-y divide-border border-y border-border">
        {documents.map((doc) => {
          const uploaded = formatUploadedAt(doc.created_at);
          const rowBusy = activeId === doc.id && isPending;
          const deleting = rowBusy && action === "delete";
          const retrying = rowBusy && action === "retry";
          const canRetry =
            doc.status === "failed" || doc.status === "processing";
          const showError = doc.status === "failed" && doc.error;

          return (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">
                  {doc.filename}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {formatDocumentStatus(doc.status)}
                  {" · "}
                  {formatBytes(doc.byte_size)}
                  {uploaded ? ` · ${uploaded}` : ""}
                </p>
                {showError ? (
                  <p className="mt-1 text-sm text-error">{doc.error}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canRetry ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isPending}
                    onClick={() => handleRetry(doc.id)}
                  >
                    {retrying ? "Retrying…" : "Retry"}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => handleDelete(doc.id)}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
