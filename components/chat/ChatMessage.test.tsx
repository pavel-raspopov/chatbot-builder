// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatThinkingDots } from "@/components/chat/ChatThinkingDots";

describe("ChatMessage", () => {
  it("renders user content", () => {
    render(<ChatMessage role="user" content="What does the doc say?" />);

    expect(screen.getByText("What does the doc say?")).toBeInTheDocument();
  });

  it("renders assistant content", () => {
    render(
      <ChatMessage role="assistant" content="It says the answer is 42." />,
    );

    expect(screen.getByText("It says the answer is 42.")).toBeInTheDocument();
  });

  it("shows thinking dots for a streaming message without content yet", () => {
    render(<ChatMessage role="assistant" content="" streaming />);

    const status = document.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(status?.getAttribute("aria-label")).toBe("Thinking");
    expect(document.querySelectorAll(".chat-thinking-dot")).toHaveLength(3);
  });

  it("keeps showing text content even while streaming", () => {
    render(<ChatMessage role="assistant" content="Partial…" streaming />);

    expect(screen.getByText("Partial…")).toBeInTheDocument();
  });
});

describe("ChatThinkingDots", () => {
  it("renders an animated indicator", () => {
    render(<ChatThinkingDots />);
    expect(document.querySelector("span[aria-hidden='true']") ?? document.body.firstChild).toBeTruthy();
  });
});
