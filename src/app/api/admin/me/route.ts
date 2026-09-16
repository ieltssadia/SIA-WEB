import { NextResponse } from "next/server";
import { getAuth, unauthorized } from "@/lib/admin-auth";

/**
 * GET /api/admin/me — resolve the session token → the signed-in team member.
 * Used by the CMS shell to validate a persisted token on load (a revoked or
 * disabled account gets a 401 and the client forces a fresh login).
 */
export async function GET(req: Request) {
  const user = await getAuth(req);
  if (!user) return unauthorized();
  return NextResponse.json({ ok: true, user });
}
