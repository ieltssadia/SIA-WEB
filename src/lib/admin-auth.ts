import { NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Admin CMS auth — role-based sessions on top of the AdminUser table.
 *
 * Roles: owner > admin > teacher.
 *   owner   → every section + Team management
 *   admin   → every section except Team management
 *   teacher → live classes, students (view), certificates (issue), notices
 *
 * POST /api/admin/login returns an HMAC-signed session token
 * (`<userId>.<expiryMs>.<signature>`, base64url). The client echoes it back
 * on every admin call via the `x-admin-key` header — the same header the UI
 * already used, now carrying a signed, revocable session instead of the raw
 * password.
 */

export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD?.trim() || "sadia-admin-2025";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || `sie-admin::${ADMIN_PASSWORD}`;
}

export type AdminRole = "owner" | "admin" | "teacher";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

/** Must match the seed script and the team-management API. */
export function hashAdminPassword(email: string, password: string): string {
  return createHash("sha256").update(`${email}:${password}`).digest("hex");
}

/** Constant-time password-hash check for AdminUser login. */
export function verifyAdminPassword(
  email: string,
  password: string,
  passwordHash: string
): boolean {
  return safeEqual(hashAdminPassword(email, password), passwordHash);
}

// ---------------------------------------------------------------------------
// Token issue / verify
// ---------------------------------------------------------------------------

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function issueToken(userId: string): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}.${expires}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest();
  return `${b64url(payload)}.${b64url(sig)}`;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    timingSafeEqual(bb, bb);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** Verify the signature+expiry of a session token → userId, or null. */
export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  let payload = "";
  let sig = "";
  try {
    payload = Buffer.from(token.slice(0, dot), "base64url").toString("utf8");
    sig = Buffer.from(token.slice(dot + 1), "base64url").toString("hex");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  if (!safeEqual(sig, expected)) return null;
  const parts = payload.split(".");
  if (parts.length !== 2) return null;
  const [, expires] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return null;
  return parts[0];
}

// ---------------------------------------------------------------------------
// Session resolution + role checks
// ---------------------------------------------------------------------------

function asRole(value: string): AdminRole | null {
  return value === "owner" || value === "admin" || value === "teacher"
    ? value
    : null;
}

/**
 * Resolve the request's session → active AdminUser, or null.
 * Disabled accounts never resolve, regardless of a valid signature.
 */
export async function getAuth(req: Request): Promise<AuthUser | null> {
  const userId = verifyToken(req.headers.get("x-admin-key"));
  if (!userId) return null;
  const user = await db.adminUser.findUnique({ where: { id: userId } });
  if (!user || user.status !== "active") return null;
  const role = asRole(user.role);
  if (!role) return null;
  return { id: user.id, name: user.name, email: user.email, role };
}

/** Any active signed-in team member (teacher, admin, owner). */
export async function isAuthenticated(req: Request): Promise<boolean> {
  return (await getAuth(req)) !== null;
}

/** Admin or owner — the default gate for management routes. */
export async function isAuthorized(req: Request): Promise<boolean> {
  const user = await getAuth(req);
  return user?.role === "owner" || user?.role === "admin";
}

/** Owner-only gate (Team management). */
export async function isOwner(req: Request): Promise<boolean> {
  const user = await getAuth(req);
  return user?.role === "owner";
}

// ---------------------------------------------------------------------------
// Shared 401/403/400 response helpers (all admin routes return { ok, ... })
// ---------------------------------------------------------------------------

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Unauthorized — invalid or missing admin key." },
    { status: 401 }
  );
}

export function forbidden(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "এই কাজটির অনুমতি আপনার রোলে নেই। (Not allowed for your role.)" },
    { status: 403 }
  );
}

export function badRequest(error: string): NextResponse {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}
