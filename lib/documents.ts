/** Max object size allowed by the `documents` Storage bucket. */
export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = [".pdf", ".md", ".txt"] as const;

export type AcceptedExtension = (typeof ACCEPTED_EXTENSIONS)[number];

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

const EXTENSION_MIME: Record<AcceptedExtension, readonly string[]> = {
  ".pdf": ["application/pdf"],
  ".md": ["text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"],
  ".txt": ["text/plain", "application/octet-stream"],
};

const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(",");

export function getDocumentAcceptAttribute(): string {
  return ACCEPT_ATTRIBUTE;
}

export function getFileExtension(filename: string): string {
  const trimmed = filename.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0 || dot === trimmed.length - 1) {
    return "";
  }
  return trimmed.slice(dot).toLowerCase();
}

export function isAcceptedExtension(
  extension: string,
): extension is AcceptedExtension {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(extension);
}

/**
 * Resolve a storage-safe MIME for an accepted file.
 * Browsers often send empty or generic types for .md/.txt.
 */
export function resolveDocumentMimeType(
  filename: string,
  mimeType: string,
): string | null {
  const extension = getFileExtension(filename);
  if (!isAcceptedExtension(extension)) {
    return null;
  }

  const allowed = EXTENSION_MIME[extension];
  const normalized = mimeType.trim().toLowerCase();

  if (normalized && allowed.includes(normalized)) {
    if (extension === ".pdf") {
      return "application/pdf";
    }
    if (extension === ".md") {
      return normalized === "text/plain" || normalized === "application/octet-stream"
        ? "text/markdown"
        : normalized;
    }
    return "text/plain";
  }

  // Empty or unknown browser MIME — infer from extension.
  if (!normalized || normalized === "application/octet-stream") {
    if (extension === ".pdf") {
      return "application/pdf";
    }
    if (extension === ".md") {
      return "text/markdown";
    }
    return "text/plain";
  }

  return null;
}

export function sanitizeFilename(filename: string): string {
  const base = filename.trim().replace(/[/\\]/g, "_");
  const cleaned = base
    .replace(/[^\w.\- ()[\]]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^\.+/, "");
  const truncated = cleaned.slice(0, 180);
  return truncated.length > 0 ? truncated : "document";
}

export function buildDocumentStoragePath(
  userId: string,
  botId: string,
  documentId: string,
  filename: string,
): string {
  return `${userId}/${botId}/${documentId}-${sanitizeFilename(filename)}`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  if (mb < 1024) {
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  }
  const gb = mb / 1024;
  return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)} GB`;
}

export function formatDocumentStatus(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "ready":
      return "Ready";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

export function validateDocumentMeta(input: {
  filename: string;
  mimeType: string;
  byteSize: number;
}): { ok: true; mimeType: string; filename: string } | { ok: false; error: string } {
  const filename = input.filename.trim();
  if (!filename) {
    return { ok: false, error: "Filename is required." };
  }

  if (!Number.isFinite(input.byteSize) || input.byteSize <= 0) {
    return { ok: false, error: "File is empty or invalid." };
  }

  if (input.byteSize > MAX_DOCUMENT_BYTES) {
    return {
      ok: false,
      error: `Each file must be ${formatBytes(MAX_DOCUMENT_BYTES)} or smaller.`,
    };
  }

  const mimeType = resolveDocumentMimeType(filename, input.mimeType);
  if (!mimeType) {
    return {
      ok: false,
      error: "Only PDF, Markdown (.md), and plain text (.txt) files are supported.",
    };
  }

  return { ok: true, mimeType, filename: sanitizeFilename(filename) };
}
