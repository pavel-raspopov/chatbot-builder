import { extractText, getDocumentProxy } from "unpdf";
import { ensurePdfJsMathPolyfills } from "@/lib/rag/pdfjs-polyfill";

/** PDF.js VerbosityLevel.ERRORS — suppress font / sumPrecise warning spam. */
const PDFJS_VERBOSITY_ERRORS = 0;

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

function normalizeExtractedText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  ensurePdfJsMathPolyfills();
  try {
    const pdf = await getDocumentProxy(bytes, {
      verbosity: PDFJS_VERBOSITY_ERRORS,
    });
    const { text } = await extractText(pdf, { mergePages: true });
    const merged = Array.isArray(text) ? text.join("\n\n") : text;
    return normalizeExtractedText(merged ?? "");
  } catch (error) {
    console.error("[lib/rag/extract] pdf", error);
    throw new ExtractError(
      "Could not read this PDF. The file may be corrupt or image-only.",
    );
  }
}

function extractPlainText(bytes: Uint8Array): string {
  try {
    return normalizeExtractedText(new TextDecoder("utf-8", { fatal: false }).decode(bytes));
  } catch (error) {
    console.error("[lib/rag/extract] text", error);
    throw new ExtractError("Could not decode this text file as UTF-8.");
  }
}

/**
 * Extract plain text from an uploaded document buffer.
 * Supports application/pdf, text/markdown, text/plain.
 */
export async function extractDocumentText(
  bytes: Uint8Array,
  mimeType: string,
): Promise<string> {
  const normalized = mimeType.trim().toLowerCase();
  let text: string;

  if (normalized === "application/pdf") {
    text = await extractPdfText(bytes);
  } else if (
    normalized === "text/markdown" ||
    normalized === "text/x-markdown" ||
    normalized === "text/plain"
  ) {
    text = extractPlainText(bytes);
  } else {
    throw new ExtractError(
      "Only PDF, Markdown (.md), and plain text (.txt) files are supported.",
    );
  }

  if (!text) {
    throw new ExtractError("No extractable text in this file.");
  }

  return text;
}
