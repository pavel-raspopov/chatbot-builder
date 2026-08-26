// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  streamChatReply: vi.fn(),
}));

vi.mock("@/lib/chat/streamClient", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/lib/chat/streamClient")
  >();
  return {
    ...actual,
    streamChatReply: mocks.streamChatReply,
  };
});

import { ChatThread } from "@/components/chat/ChatThread";
import { ChatStreamError } from "@/lib/chat/streamClient";

function renderThread(
  props: Partial<Parameters<typeof ChatThread>[0]> = {},
) {
  return render(
    <ChatThread
      botId="bot-1"
      botName="Helper Bot"
      welcomeMessage="Hi! Ask me anything."
      conversationId={props.conversationId ?? null}
      initialMessages={props.initialMessages ?? []}
      hasReadyDocuments={props.hasReadyDocuments ?? true}
    />,
  );
}

async function sendMessage(text: string) {
  const user = userEvent.setup();
  const textarea = screen.getByLabelText("Message");
  await user.type(textarea, text);
  await user.click(screen.getByRole("button", { name: "Send" }));
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.streamChatReply
    .mockReset()
    .mockImplementation(async ({ onDelta }) => {
      onDelta("Grounded ");
      onDelta("answer.");
      return { conversationId: "conv-1" };
    });
});

describe("ChatThread states", () => {
  it("shows the welcome message before any exchange", () => {
    renderThread();

    expect(screen.getByText("Hi! Ask me anything.")).toBeInTheDocument();
    expect(screen.getByText("Helper Bot · in-app chat")).toBeInTheDocument();
  });

  it("blocks chatting until documents are indexed", () => {
    renderThread({ hasReadyDocuments: false });

    expect(
      screen.getByText(/no indexed documents yet/i),
    ).toBeInTheDocument();
    const textarea = screen.getByLabelText("Message") as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it("renders the existing conversation history", () => {
    renderThread({
      initialMessages: [
        { id: "m1", role: "user", content: "Question?" },
        { id: "m2", role: "assistant", content: "Answer." },
      ],
    });

    expect(screen.getByText("Question?")).toBeInTheDocument();
    expect(screen.getByText("Answer.")).toBeInTheDocument();
  });
});

describe("ChatThread send flow", () => {
  it("appends both turns and streams deltas into the assistant bubble", async () => {
    renderThread();

    await sendMessage("What is in the docs?");

    expect(mocks.streamChatReply).toHaveBeenCalledWith(
      expect.objectContaining({
        botId: "bot-1",
        conversationId: null,
        message: "What is in the docs?",
      }),
    );
    expect(screen.getByText("What is in the docs?")).toBeInTheDocument();
    expect(await screen.findByText("Grounded answer.")).toBeInTheDocument();
  });

  it("rolls back the optimistic turns and shows an error on failure", async () => {
    mocks.streamChatReply.mockRejectedValueOnce(
      new ChatStreamError("Too many messages.", 429),
    );

    renderThread();
    await sendMessage("hello?");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toMatch(
      /too many messages/i,
    );
    expect(screen.getByRole("alert").textContent).toContain("View billing");
    expect(screen.queryByText("hello?")).not.toBeInTheDocument();
    expect((screen.getByLabelText("Message") as HTMLTextAreaElement).value).toBe(
      "",
    );
  });
});
