// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { EmbedSnippet } from "@/components/bots/EmbedSnippet";

const SNIPPET = '<script src="https://example.com/widget.js"></script>';

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

function renderSnippet() {
  return render(<EmbedSnippet snippet={SNIPPET} previewHref="/preview/bot-1" />);
}

describe("EmbedSnippet", () => {
  it("renders the snippet code and a preview link", () => {
    renderSnippet();

    expect(screen.getByText(SNIPPET)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Preview" })).toHaveAttribute(
      "href",
      "/preview/bot-1",
    );
  });

  it("copies the snippet to the clipboard and confirms", async () => {
    renderSnippet();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith(SNIPPET);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("hides the copied status again after two seconds", async () => {
    vi.useFakeTimers();
    renderSnippet();

    // Flush the clipboard promise + setCopied(true) inside act.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });
    expect(screen.getByText("Copied")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
  });

  it("stays silent when clipboard access is denied", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    renderSnippet();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    });
  });
});
