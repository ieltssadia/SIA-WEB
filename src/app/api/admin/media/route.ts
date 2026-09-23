import { NextResponse } from "next/server";
import { getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminMedia } from "@/lib/admin-serialize";
import { db } from "@/lib/db";

/**
 * GET /api/admin/media — the Media Library list (newest first). Any signed-in
 * team member can read (teachers pick files for notices etc.).
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.mediaItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, media: rows.map(serializeAdminMedia) });
}
