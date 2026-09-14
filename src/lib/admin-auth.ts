import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Admin panel auth — a single shared password that doubles as the API key.
 *
 * The password is sent once to POST /api/admin/login; the client stores the
 * returned token and echoes it back on every admin API call via the
 * `x-admin-key` header (timing-safe compared here).
 *
 * Set ADMIN_PASSWORD in the environment to change it; the fallback keeps the
 * sandbox demo usable ("Demo access: sadia-admin-2025").
 */
export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD?.trim() || "sadia-admin-2025";

/** Constant-time string compare (padded to equal length to avoid a length leak). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // Compare against a fixed-length buffer even when lengths differ so the
  // branch count stays constant; unequal length is always a reject.
  if (ab.length !== bb.length) {
    timingSafeEqual(bb, bb);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** True when `pw` matches the configured admin password. */
export function checkAdminPassword(pw: string | null | undefined): boolean {
  if (!pw || typeof pw !== "string") return false;
  return safeEqual(pw, ADMIN_PASSWORD);
}

/** True when the request carries the correct `x-admin-key` header. */
export function isAuthorized(req: Request): boolean {
  return checkAdminPassword(req.headers.get("x-admin-key"));
}

// ---------------------------------------------------------------------------
// Shared 401/400 response helpers (all admin routes return { ok, ... })
// ---------------------------------------------------------------------------

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Unauthorized — invalid or missing admin key." },
    { status: 401 }
  );
}

export function badRequest(error: string): NextResponse {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}
