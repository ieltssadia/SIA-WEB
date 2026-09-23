import { NextResponse } from "next/server";
import { unlinkSync } from "node:fs";
import path from "node:path";
import { bearerPhone } from "@/lib/portal-server";
import { canonicalPhone } from "@/lib/phone";
import { db } from "@/lib/db";

/**
 * DELETE /api/portal/certificates/[id] — a student removes their OWN upload.
 * Verified certificates can't be deleted (the team has accepted them);
 * pending and rejected ones can be removed to re-upload a better file.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const phone = bearerPhone(req);
  if (!phone) {
    return NextResponse.json(
      { error: "Session expired, please log in again." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const student = await db.student.findUnique({
    where: { phone: canonicalPhone(phone) },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  const row = await db.certificateUpload.findUnique({ where: { id } });
  if (!row || row.studentId !== student.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (row.status === "verified") {
    return NextResponse.json(
      { error: "ভেরিফায়েড সার্টিফিকেট মুছে ফেলা যাবে না।" },
      { status: 400 }
    );
  }

  // Best-effort file cleanup
  try {
    if (row.url.startsWith("/uploads/certificates/")) {
      unlinkSync(
        path.join(process.cwd(), "public", row.url.replace(/^\//, ""))
      );
    }
  } catch {
    // File already gone — the row removal is what matters.
  }

  await db.certificateUpload.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
