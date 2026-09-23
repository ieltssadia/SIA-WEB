import { NextResponse } from "next/server";
import { unlinkSync } from "node:fs";
import path from "node:path";
import { forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { db } from "@/lib/db";

/**
 * DELETE /api/admin/media/[id] — remove a Media Library item: deletes the
 * row and best-effort unlinks the file under /public/uploads (admin/owner).
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.mediaItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "মিডিয়া আইটেম পাওয়া যায়নি।" }, { status: 404 });
  }

  if (existing.url.startsWith("/uploads/")) {
    try {
      unlinkSync(path.join(process.cwd(), "public", existing.url));
    } catch {
      // File already gone or outside /uploads — the row removal still counts.
    }
  }

  await db.mediaItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
