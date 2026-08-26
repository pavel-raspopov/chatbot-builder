import { afterEach, describe, expect, it } from "vitest";
import { buildEmbedSnippet, getAppOrigin } from "@/lib/app-url";

const ENV_NAME = "NEXT_PUBLIC_APP_URL";

afterEach(() => {
  delete process.env[ENV_NAME];
});

describe("getAppOrigin", () => {
  it("returns the env origin with a trailing slash trimmed", () => {
    process.env[ENV_NAME] = "https://docuchat.example.com/";
    expect(getAppOrigin()).toBe("https://docuchat.example.com");
  });

  it("keeps origins without a trailing slash untouched", () => {
    process.env[ENV_NAME] = "https://app.example.com";
    expect(getAppOrigin()).toBe("https://app.example.com");
  });

  it("falls back to localhost when unset or blank", () => {
    delete process.env[ENV_NAME];
    expect(getAppOrigin()).toBe("http://localhost:3000");
    process.env[ENV_NAME] = "   ";
    expect(getAppOrigin()).toBe("http://localhost:3000");
  });
});

describe("buildEmbedSnippet", () => {
  it("embeds origin and bot public id", () => {
    expect(buildEmbedSnippet("https://app.example.com", "bot123")).toBe(
      '<script src="https://app.example.com/widget.js" data-bot="bot123" async></script>',
    );
  });
});
