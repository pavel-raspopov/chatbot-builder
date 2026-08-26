import { describe, expect, it } from "vitest";
import {
  MAX_DOCUMENT_BYTES,
  buildDocumentStoragePath,
  formatBytes,
  formatDocumentStatus,
  getDocumentAcceptAttribute,
  getFileExtension,
  sanitizeFilename,
  validateDocumentMeta,
} from "@/lib/documents";
import { resolveDocumentMimeType } from "@/lib/documents";

describe("getFileExtension", () => {
  it.each([
    ["report.pdf", ".pdf"],
    ["notes.MD", ".md"],
    ["a.b.txt", ".txt"],
  ])("extracts %j → %j lowercased", (input, expected) => {
    expect(getFileExtension(input)).toBe(expected);
  });

  it.each([
    ["noext"],
    [".dotfile"],
    ["trailing."],
    ["  spaced.pdf  "],
  ])("handles %j", (input) => {
    const ext = getFileExtension(input);
    expect(ext === "" || ext === ".pdf").toBe(true);
  });

  it("returns '' for dotless and edge names", () => {
    expect(getFileExtension("noext")).toBe("");
    expect(getFileExtension(".dotfile")).toBe("");
    expect(getFileExtension("trailing.")).toBe("");
  });
});

describe("resolveDocumentMimeType", () => {
  it("accepts pdf with correct browser MIME", () => {
    expect(resolveDocumentMimeType("a.pdf", "application/pdf")).toBe(
      "application/pdf",
    );
  });

  it.each([
    ["notes.md", "text/markdown"],
    ["notes.md", "text/x-markdown"],
    ["notes.md", ""],
    ["notes.md", "application/octet-stream"],
    ["notes.md", "text/plain"],
  ])("resolves .md (%s, %s) to a markdown MIME", (filename, mime) => {
    const resolved = resolveDocumentMimeType(filename, mime);
    // text/x-markdown passes through; every other variant maps to text/markdown.
    expect(["text/markdown", "text/x-markdown"]).toContain(resolved);
  });

  it.each([
    ["file.txt", "text/plain"],
    ["file.txt", ""],
    ["file.txt", "application/octet-stream"],
  ])("normalizes .txt to text/plain", (filename, mime) => {
    expect(resolveDocumentMimeType(filename, mime)).toBe("text/plain");
  });

  it("rejects unsupported extensions and mismatched MIME", () => {
    expect(resolveDocumentMimeType("virus.exe", "")).toBeNull();
    expect(resolveDocumentMimeType("image.png", "image/png")).toBeNull();
    expect(resolveDocumentMimeType("doc.pdf", "text/html")).toBeNull();
  });
});

describe("sanitizeFilename", () => {
  it("replaces path separators to prevent traversal", () => {
    const result = sanitizeFilename("../../etc/passwd");
    expect(result).not.toContain("/");
    expect(result).not.toContain("\\");
  });

  it("strips leading dots from dotfiles", () => {
    expect(sanitizeFilename("..hidden.txt").startsWith(".")).toBe(false);
  });

  it("collapses repeated replacement characters", () => {
    expect(sanitizeFilename("a!!!b###c.pdf")).toBe("a_b_c.pdf");
  });

  it("keeps safe names intact including spaces, parens, brackets", () => {
    expect(sanitizeFilename("My Report (v2) [final].pdf")).toBe(
      "My Report (v2) [final].pdf",
    );
  });

  it("falls back to 'document' when nothing survives", () => {
    expect(sanitizeFilename("...")).toBe("document");
    expect(sanitizeFilename("///")).toBe("_");
  });

  it("truncates very long names to 180 chars", () => {
    const long = `${"a".repeat(300)}.pdf`;
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(180);
  });
});

describe("buildDocumentStoragePath", () => {
  it("joins user/bot/id-filename segments", () => {
    expect(
      buildDocumentStoragePath("u1", "b1", "d1", "file.pdf"),
    ).toBe("u1/b1/d1-file.pdf");
  });
});

describe("formatBytes", () => {
  it("formats each tier", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10 * 1024)).toBe("10 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
  });
});

describe("formatDocumentStatus", () => {
  it("capitalizes known statuses and passes unknown through", () => {
    expect(formatDocumentStatus("pending")).toBe("Pending");
    expect(formatDocumentStatus("processing")).toBe("Processing");
    expect(formatDocumentStatus("ready")).toBe("Ready");
    expect(formatDocumentStatus("failed")).toBe("Failed");
    expect(formatDocumentStatus("weird")).toBe("weird");
  });
});

describe("getDocumentAcceptAttribute", () => {
  it("lists accepted extensions for the file input", () => {
    expect(getDocumentAcceptAttribute()).toBe(".pdf,.md,.txt");
  });
});

describe("validateDocumentMeta", () => {
  const base = { filename: "guide.pdf", mimeType: "application/pdf", byteSize: 1024 };

  it("accepts valid input and returns sanitized values", () => {
    const result = validateDocumentMeta(base);
    expect(result).toEqual({
      ok: true,
      mimeType: "application/pdf",
      filename: "guide.pdf",
    });
  });

  it("rejects blank filenames", () => {
    expect(validateDocumentMeta({ ...base, filename: "   " })).toEqual({
      ok: false,
      error: "Filename is required.",
    });
  });

  it("rejects empty or invalid sizes", () => {
    expect(validateDocumentMeta({ ...base, byteSize: 0 }).ok).toBe(false);
    expect(validateDocumentMeta({ ...base, byteSize: -1 }).ok).toBe(false);
  });

  it("rejects files over the max size with a human message", () => {
    const result = validateDocumentMeta({
      ...base,
      byteSize: MAX_DOCUMENT_BYTES + 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("50 MB");
    }
  });

  it("rejects unsupported file types", () => {
    const result = validateDocumentMeta({
      ...base,
      filename: "photo.jpg",
      mimeType: "image/jpeg",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("PDF, Markdown");
    }
  });

  it("infers octet-stream MIME from extension", () => {
    const result = validateDocumentMeta({
      ...base,
      filename: "notes.md",
      mimeType: "application/octet-stream",
    });
    expect(result).toMatchObject({ ok: true, mimeType: "text/markdown" });
  });
});
