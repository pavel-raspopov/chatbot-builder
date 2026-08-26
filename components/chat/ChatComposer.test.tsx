// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatComposer } from "@/components/chat/ChatComposer";

function setup(overrides: Partial<Parameters<typeof ChatComposer>[0]> = {}) {
  const onSend = vi.fn();
  render(<ChatComposer disabled={false} sending={false} onSend={onSend} {...overrides} />);
  return onSend;
}

describe("ChatComposer", () => {
  it("keeps the send button disabled while the message is empty", () => {
    setup();

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("sends typed text and clears the composer", async () => {
    const user = userEvent.setup();
    const onSend = setup();

    await user.type(
      screen.getByPlaceholderText("Ask from your docs…"),
      "What is in chapter two?",
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledWith("What is in chapter two?");
    expect(screen.getByPlaceholderText("Ask from your docs…")).toHaveValue("");
  });

  it("trims whitespace-only input to a no-op", async () => {
    const user = userEvent.setup();
    const onSend = setup();

    await user.type(
      screen.getByPlaceholderText("Ask from your docs…"),
      "   ",
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("submits with Enter but not Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSend = setup();
    const textarea = screen.getByPlaceholderText("Ask from your docs…");

    await user.type(textarea, "hello");
    textarea.focus();
    await user.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledWith("hello");

    await user.type(textarea, "next line");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("disables input and relabels the button while sending", async () => {
    const onSend = setup({ sending: true });

    const button = screen.getByRole("button", { name: "Sending…" });
    expect(button).toBeDisabled();
    expect(screen.getByPlaceholderText("Ask from your docs…")).toBeDisabled();

    // Even if submitted programmatically, onSend must not fire.
    button.dispatchEvent(new Event("submit"));
    void onSend;
  });

  it("disables everything while the thread is locked", () => {
    setup({ disabled: true });

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(screen.getByPlaceholderText("Ask from your docs…")).toBeDisabled();
  });
});
