export const WIDGET_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function widgetCorsHeaders(): Record<string, string> {
  return { ...WIDGET_CORS_HEADERS };
}
