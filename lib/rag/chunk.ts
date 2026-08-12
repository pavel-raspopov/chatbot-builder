export type TextChunk = {
  content: string;
  tokenCount: number;
};

/** Approximate tokens as characters / 4 (MVP; good enough for token_count). */
export function estimateTokenCount(text: string): number {
  if (!text) {
    return 0;
  }
  return Math.max(1, Math.ceil(text.length / 4));
}

const DEFAULT_CHUNK_CHARS = 600;
const DEFAULT_OVERLAP_CHARS = 100;

/**
 * Split text into overlapping windows (~600 chars, ~100 overlap).
 * Prefers breaks at paragraph/sentence boundaries when nearby.
 */
export function chunkText(
  text: string,
  options?: { chunkChars?: number; overlapChars?: number },
): TextChunk[] {
  const chunkChars = options?.chunkChars ?? DEFAULT_CHUNK_CHARS;
  const overlapChars = Math.min(
    options?.overlapChars ?? DEFAULT_OVERLAP_CHARS,
    chunkChars - 1,
  );

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  if (normalized.length <= chunkChars) {
    return [{ content: normalized, tokenCount: estimateTokenCount(normalized) }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkChars, normalized.length);

    if (end < normalized.length) {
      const window = normalized.slice(start, end);
      const breakAt = findSoftBreak(window);
      if (breakAt > chunkChars * 0.4) {
        end = start + breakAt;
      }
    }

    const content = normalized.slice(start, end).trim();
    if (content) {
      chunks.push({ content, tokenCount: estimateTokenCount(content) });
    }

    if (end >= normalized.length) {
      break;
    }

    const nextStart = Math.max(0, end - overlapChars);
    if (nextStart <= start) {
      start = end;
    } else {
      start = nextStart;
    }
  }

  return chunks;
}

function findSoftBreak(window: string): number {
  const paragraph = window.lastIndexOf("\n\n");
  if (paragraph >= 0) {
    return paragraph + 2;
  }
  const newline = window.lastIndexOf("\n");
  if (newline >= 0) {
    return newline + 1;
  }
  const sentence = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (sentence >= 0) {
    return sentence + 2;
  }
  const space = window.lastIndexOf(" ");
  if (space >= 0) {
    return space + 1;
  }
  return window.length;
}
