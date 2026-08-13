/** Public origin for embed snippet `src`. Trim trailing slash. */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function buildEmbedSnippet(origin: string, publicId: string): string {
  return `<script src="${origin}/widget.js" data-bot="${publicId}" async></script>`;
}
