import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { ExtractError, extractDocumentText } from "@/lib/rag/extract";

function fixture(name: string): Uint8Array {
  const url = new URL(`../../tests/fixtures/${name}`, import.meta.url);
  return new Uint8Array(readFileSync(fileURLToPath(url)));
}

async function expectExtractError(
  bytes: Uint8Array,
  mimeType: string,
  messagePart: string,
): Promise<void> {
  try {
    await extractDocumentText(bytes, mimeType);
    expect.fail(`Expected ExtractError for ${mimeType}`);
  } catch (error) {
    expect(error).toBeInstanceOf(ExtractError);
    expect((error as ExtractError).message).toContain(messagePart);
  }
}

describe("extractDocumentText", () => {
  it("extracts text from a real PDF", async () => {
    const text = await extractDocumentText(
      fixture("sample.pdf"),
      "application/pdf",
    );
    expect(text).toContain("Hello DocuChat fixture");
  });

  it("accepts PDF MIME in any casing", async () => {
    const text = await extractDocumentText(
      fixture("sample.pdf"),
      "  APPLICATION/PDF ",
    );
    expect(text).toContain("Hello DocuChat fixture");
  });

  it("decodes plain text and normalizes CRLF and NUL bytes", async () => {
    const bytes = new TextEncoder().encode("line one\r\nline two\u0000end");
    const text = await extractDocumentText(bytes, "text/plain");
    expect(text).toBe("line one\nline twoend");
  });

  it("decodes markdown like plain text", async () => {
    const text = await extractDocumentText(
      fixture("sample.md"),
      "text/markdown",
    );
    expect(text).toContain("# DocuChat fixture");
    expect(text).toContain("Markdown **body**");
  });

  it("rejects unsupported MIME types", async () => {
    await expectExtractError(
      fixture("sample.txt"),
      "image/png",
      "Only PDF, Markdown",
    );
  });

  it("rejects files with no extractable text", async () => {
    await expectExtractError(
      new Uint8Array(0),
      "text/plain",
      "No extractable text",
    );
  });

  it("wraps corrupt PDFs in a friendly ExtractError", async () => {
    // extractDocumentText logs the underlying pdf.js error before wrapping it;
    // silence it since this failure is expected.
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      await expectExtractError(
        new TextEncoder().encode("this is not a pdf"),
        "application/pdf",
        "Could not read this PDF",
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
