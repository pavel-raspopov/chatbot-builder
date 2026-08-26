import { describe, expect, it } from "vitest";
import { WIDGET_CORS_HEADERS, widgetCorsHeaders } from "@/lib/widget/cors";

describe("widget CORS headers", () => {
  it("exposes the shared header constants", () => {
    expect(WIDGET_CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
    expect(WIDGET_CORS_HEADERS["Access-Control-Allow-Methods"]).toBe(
      "POST, OPTIONS",
    );
    expect(WIDGET_CORS_HEADERS["Access-Control-Allow-Headers"]).toBe(
      "Content-Type",
    );
  });

  it("returns a copy so callers cannot mutate the constant", () => {
    const headers = widgetCorsHeaders();
    headers["Access-Control-Allow-Origin"] = "https://evil.example.com";
    expect(WIDGET_CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
    expect(widgetCorsHeaders()["Access-Control-Allow-Origin"]).toBe("*");
  });
});
