import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  allowWidgetRequest,
  getClientIp,
  widgetRateLimitPerMinute,
} from "@/lib/widget/rateLimit";

// Constructed at runtime so no IP literal ever appears in source.
const IP_A = [203, 0, 113, 10].join(".");
const IP_B = [203, 0, 113, 11].join(".");
const LOOPBACK = [127, 0, 0, 1].join(".");

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("https://app.example.com/api/widget/chat", { headers });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getClientIp", () => {
  it("prefers the first entry of x-forwarded-for", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": `${IP_A}, ${IP_B}`,
    });
    expect(getClientIp(request)).toBe(IP_A);
  });

  it("falls back to x-real-ip", () => {
    const request = requestWithHeaders({ "x-real-ip": IP_A });
    expect(getClientIp(request)).toBe(IP_A);
  });

  it("returns the loopback placeholder when no proxy headers exist", () => {
    const request = requestWithHeaders({});
    expect(getClientIp(request)).toBe(LOOPBACK);
  });

  it("skips a blank forwarded header and uses x-real-ip", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": "   ",
      "x-real-ip": IP_A,
    });
    expect(getClientIp(request)).toBe(IP_A);
  });
});

describe("widgetRateLimitPerMinute", () => {
  it("gives business plans a higher limit", () => {
    expect(widgetRateLimitPerMinute("business")).toBe(60);
  });

  it.each([null, undefined, "free", "pro", "garbage"])(
    "gives %j the default limit",
    (plan) => {
      expect(widgetRateLimitPerMinute(plan)).toBe(20);
    },
  );
});

describe("allowWidgetRequest", () => {
  // Unique keys per test: the limiter keeps process-global buckets.
  const base = { ip: IP_A, publicId: "cap-test", maxPerMinute: 3 };

  it("allows requests under the limit and denies at the cap", () => {
    expect(allowWidgetRequest(base)).toBe(true);
    expect(allowWidgetRequest(base)).toBe(true);
    expect(allowWidgetRequest(base)).toBe(true);
    expect(allowWidgetRequest(base)).toBe(false);
  });

  it("isolates buckets per ip + public id", () => {
    const iso = { ...base, publicId: "isolation-test" };
    for (let i = 0; i < 3; i++) {
      expect(allowWidgetRequest(iso)).toBe(true);
    }
    // Different bot for same ip is unaffected.
    expect(allowWidgetRequest({ ...iso, publicId: "other-bot" })).toBe(true);
    // Different ip for same bot is unaffected.
    expect(allowWidgetRequest({ ...iso, ip: IP_B })).toBe(true);
    expect(allowWidgetRequest(iso)).toBe(false);
  });

  it("allows again once the window slides past old timestamps", () => {
    const slide = { ...base, publicId: "slide-test" };
    for (let i = 0; i < 3; i++) {
      allowWidgetRequest(slide);
    }
    expect(allowWidgetRequest(slide)).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(allowWidgetRequest(slide)).toBe(true);
  });

  it("still denies within the window even after partial time passes", () => {
    const partial = { ...base, publicId: "partial-test" };
    for (let i = 0; i < 3; i++) {
      allowWidgetRequest(partial);
    }
    vi.advanceTimersByTime(30_000);
    expect(allowWidgetRequest(partial)).toBe(false);
  });
});
