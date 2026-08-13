import { normalizePlanId } from "@/lib/plans";

const WINDOW_MS = 60_000;
const FREE_PRO_PER_MINUTE = 20;
const BUSINESS_PER_MINUTE = 60;

const buckets = new Map<string, number[]>();

export function widgetRateLimitPerMinute(
  planId: string | null | undefined,
): number {
  return normalizePlanId(planId) === "business"
    ? BUSINESS_PER_MINUTE
    : FREE_PRO_PER_MINUTE;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "127.0.0.1";
}

/**
 * Process-local sliding window. Fine for a single-process demo.
 * Keyed by IP + public id so one visitor cannot starve other bots.
 */
export function allowWidgetRequest(params: {
  ip: string;
  publicId: string;
  maxPerMinute: number;
}): boolean {
  const key = `${params.ip}:${params.publicId}`;
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const previous = buckets.get(key) ?? [];
  const recent = previous.filter((stamp) => stamp > cutoff);

  if (recent.length >= params.maxPerMinute) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);
  return true;
}
