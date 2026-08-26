// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  router: { refresh: vi.fn() },
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  upload: vi.fn(),
  requestDocumentIngest: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));

vi.mock("@/actions/documents", () => ({
  createDocument: mocks.createDocument,
  deleteDocument: mocks.deleteDocument,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({ upload: mocks.upload }),
    },
  }),
}));

vi.mock("@/lib/ingest-client", () => ({
  requestDocumentIngest: mocks.requestDocumentIngest,
}));

import { DocumentUpload } from "@/components/bots/DocumentUpload";
import { formatBytes } from "@/lib/documents";

function renderUpload(
  props: Partial<{ usedBytes: number; maxStorageBytes: number }> = {},
) {
  return render(
    <DocumentUpload
      botId="bot-1"
      usedBytes={props.usedBytes ?? 0}
      maxStorageBytes={props.maxStorageBytes ?? 5_000_000}
    />,
  );
}

function setInputFile(name: string, size: number, type = "application/pdf") {
  const inputEl = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["x"], name, { type });
  // Make the File report the requested size (File derives size from content).
  Object.defineProperty(file, "size", { value: size });
  fireEvent.change(inputEl, {
    target: { files: [file] },
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  Object.defineProperty(mocks.router, "refresh", {
    value: vi.fn(),
    configurable: true,
  });
  mocks.createDocument
    .mockReset()
    .mockResolvedValue({ success: true, documentId: "doc-1", storagePath: "p" });
  mocks.deleteDocument.mockReset().mockResolvedValue({ success: true });
  mocks.upload.mockReset().mockResolvedValue({ error: null });
  mocks.requestDocumentIngest
    .mockReset()
    .mockResolvedValue({ success: true });
});

describe("DocumentUpload rendering", () => {
  it("advertises the accepted extensions and remaining space", () => {
    renderUpload();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe(".pdf,.md,.txt");
    expect(
      screen.getByText(
        `.pdf, .md, .txt · up to ${formatBytes(5_000_000)} left on this plan`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose file")).toBeInTheDocument();
  });

  it("shows the upgrade path once storage is exhausted", () => {
    renderUpload({ usedBytes: 5_000_000, maxStorageBytes: 5_000_000 });

    expect(input().disabled).toBe(true);
    expect(screen.getByText("Upgrade")).toHaveAttribute(
      "href",
      "/settings/billing",
    );
  });
});

function input(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("DocumentUpload validation", () => {
  it.each([
    ["blocked by the plan quota", 4_900_000, 5_000_000, /not enough storage left/i],
    ["rejected as an unsupported type", 0, 5_000_000, /unsupported|not supported|only/i],
  ])("%s shows an alert", async (_name, used, max, pattern) => {
    void _name;
    renderUpload({ usedBytes: used, maxStorageBytes: max });

    if (/storage/i.test(String(pattern))) {
      setInputFile("big.pdf", Math.max(200 * 1024 * 1024, max - used + 1));
    } else {
      setInputFile("virus.exe", 10);
    }

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(pattern);
  });

  it("shows a friendly message when metadata validation fails", async () => {
    renderUpload();
    setInputFile("", 10);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

describe("DocumentUpload upload flow", () => {
  it("creates the row, uploads the object, then requests indexing", async () => {
    renderUpload();
    setInputFile("handbook.pdf", 2048);

    await vi.waitFor(() => {
      expect(mocks.requestDocumentIngest).toHaveBeenCalledWith("doc-1");
    });
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: "handbook.pdf" }),
      expect.objectContaining({ upsert: false }),
    );
    expect(mocks.router.refresh).toHaveBeenCalled();
  });

  it("rolls the row back when object storage rejects the file", async () => {
    mocks.upload.mockResolvedValueOnce({
      error: { message: "bucket error" },
    });

    renderUpload();
    setInputFile("handbook.pdf", 1024);

    await vi.waitFor(() => {
      expect(mocks.deleteDocument).toHaveBeenCalledWith("doc-1");
    });
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/upload failed/i);
    expect(mocks.requestDocumentIngest).not.toHaveBeenCalled();
  });

  it("surfaces createDocument failures and skips the upload", async () => {
    mocks.createDocument.mockResolvedValueOnce({
      success: false,
      error: "Your plan allows 5.0 MB of storage.",
    });

    renderUpload();
    setInputFile("handbook.pdf", 1024);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/your plan allows/i);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.deleteDocument).not.toHaveBeenCalled();
  });
});
