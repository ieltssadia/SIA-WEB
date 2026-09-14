import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";

/**
 * DELETE /api/admin/certificates/[id] — the [id] param is the human-readable
 * certificate ID (e.g. "SIE-CERT-2417"), which is the Prisma primary key.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const { id } = await ctx.params;

    const existing = await db.certificate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "সার্টিফিকেট খুঁজে পাওয়া যায়নি। (Certificate not found.)" },
        { status: 404 }
      );
    }

    await db.certificate.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[api/admin/certificates] Delete failed:", error);
    return NextResponse.json(
      { ok: false, error: "মুছে ফেলতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
