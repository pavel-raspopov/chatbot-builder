export type StreamChatParams = {
  botId: string;
  conversationId: string | null;
  message: string;
  onDelta: (text: string) => void;
};

export type StreamWidgetParams = {
  publicId: string;
  conversationId: string | null;
  message: string;
  onDelta: (text: string) => void;
};

export type StreamChatResult = {
  conversationId: string;
};

export class ChatStreamError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ChatStreamError";
    this.statusCode = statusCode;
  }
}

type SsePayload = {
  type?: unknown;
  text?: unknown;
  conversationId?: unknown;
  error?: unknown;
};

function parseSsePayload(raw: string): SsePayload | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) {
      return null;
    }
    return value as SsePayload;
  } catch {
    return null;
  }
}

async function readJsonError(response: Response): Promise<string> {
  try {
    const value: unknown = await response.json();
    if (
      typeof value === "object" &&
      value !== null &&
      "error" in value &&
      typeof value.error === "string" &&
      value.error.trim()
    ) {
      return value.error;
    }
  } catch {
    // Fall through to generic copy.
  }
  if (response.status === 429) {
    return "You've reached your monthly message limit. Upgrade your plan to send more.";
  }
  if (response.status === 401) {
    return "You need to sign in to chat.";
  }
  return "Could not send that message. Please try again.";
}

function applySseBlock(
  block: string,
  onDelta: (text: string) => void,
  state: { conversationId: string | null },
): void {
  const lines = block.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data: ")) {
      continue;
    }
    const payload = parseSsePayload(line.slice(6));
    if (!payload) {
      continue;
    }
    if (payload.type === "delta" && typeof payload.text === "string") {
      onDelta(payload.text);
    }
    if (
      payload.type === "done" &&
      typeof payload.conversationId === "string" &&
      payload.conversationId
    ) {
      state.conversationId = payload.conversationId;
    }
    if (payload.type === "error" && typeof payload.error === "string") {
      throw new ChatStreamError(payload.error, 500);
    }
  }
}

async function streamSseReply(
  url: string,
  body: Record<string, string | null>,
  onDelta: (text: string) => void,
  conversationId: string | null,
): Promise<StreamChatResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new ChatStreamError(await readJsonError(response), response.status);
  }

  if (!contentType.includes("text/event-stream") || !response.body) {
    throw new ChatStreamError(
      "Could not send that message. Please try again.",
      500,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const state = { conversationId };
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      applySseBlock(block, onDelta, state);
    }
  }

  if (buffer.trim()) {
    applySseBlock(buffer, onDelta, state);
  }

  if (!state.conversationId) {
    throw new ChatStreamError(
      "Could not send that message. Please try again.",
      500,
    );
  }

  return { conversationId: state.conversationId };
}

export async function streamChatReply(
  params: StreamChatParams,
): Promise<StreamChatResult> {
  return streamSseReply(
    "/api/chat",
    {
      botId: params.botId,
      conversationId: params.conversationId,
      message: params.message,
    },
    params.onDelta,
    params.conversationId,
  );
}

export async function streamWidgetReply(
  params: StreamWidgetParams,
): Promise<StreamChatResult> {
  return streamSseReply(
    "/api/widget/chat",
    {
      publicId: params.publicId,
      conversationId: params.conversationId,
      message: params.message,
    },
    params.onDelta,
    params.conversationId,
  );
}
