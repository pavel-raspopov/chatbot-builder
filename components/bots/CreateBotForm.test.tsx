// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  createBot: vi.fn(),
}));

vi.mock("@/actions/bots", () => ({
  createBot: mocks.createBot,
}));

import { CreateBotForm } from "@/components/bots/CreateBotForm";

beforeEach(() => {
  mocks.createBot.mockReset().mockResolvedValue({ error: null });
});

describe("CreateBotForm", () => {
  it("renders the name field, textareas, and cancel link", () => {
    render(<CreateBotForm />);

    expect(screen.getByLabelText("Name")).toHaveAttribute("maxLength", "100");
    expect(screen.getByLabelText("Welcome message")).toBeInTheDocument();
    expect(screen.getByLabelText("System prompt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/bots",
    );
  });

  it("submits bot details through the server action", async () => {
    const user = userEvent.setup();
    render(<CreateBotForm />);

    await user.type(screen.getByLabelText("Name"), "Support assistant");
    await user.type(
      screen.getByLabelText("Welcome message"),
      "Hi! How can I help?",
    );
    await user.type(screen.getByLabelText("System prompt"), "Be concise.");
    await user.click(screen.getByRole("button", { name: "Create bot" }));

    await vi.waitFor(() => expect(mocks.createBot).toHaveBeenCalledTimes(1));
    const [, formData] = mocks.createBot.mock.calls[0] as [unknown, FormData];
    expect(formData.get("name")).toBe("Support assistant");
    expect(formData.get("welcome_message")).toBe("Hi! How can I help?");
    expect(formData.get("system_prompt")).toBe("Be concise.");
  });

  it("shows the action's error when creation fails", async () => {
    mocks.createBot
      .mockResolvedValueOnce({ error: "You've reached your bot limit." });
    const user = userEvent.setup();
    render(<CreateBotForm />);

    await user.type(screen.getByLabelText("Name"), "Too many bots");
    await user.click(screen.getByRole("button", { name: "Create bot" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You've reached your bot limit.",
    );
  });
});
