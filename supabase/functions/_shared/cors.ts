/**
 * Controlled CORS configuration shared by SocratIQ Edge Functions.
 *
 * Instead of reflecting `*`, only explicitly allow-listed origins receive
 * the `Access-Control-Allow-Origin` header. Unknown origins still get a
 * response but the browser blocks it, which is the intended behavior for a
 * function that requires an authenticated user.
 *
 * The allow-list is read from the `ALLOWED_ORIGINS` environment variable
 * (comma-separated) and defaults to the local Vite dev/preview origins.
 */

const DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:4173";

function allowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build CORS headers for a request. The origin is only echoed back when it
 * is on the allow-list; otherwise no `Access-Control-Allow-Origin` is set.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = allowedOrigins();

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
