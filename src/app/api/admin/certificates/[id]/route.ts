import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { badRequest, isAuthorized, unauthorized } from "@/lib/admin-auth";

const patchSchema = z.object({
  fileUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^\//, "সার্টিফিকেট ফাইলের লিংক সাইটের ভেতরের পাথ হতে হবে।")
    .or(z.literal("")),
});

/**
 * PATCH /api/admin/certificates/[id] — attach (or clear, with "") the
 * uploaded certificate file for an already-issued certificate. The file is
 * uploaded through POST /api/admin/upload (folder=certificates) first; the
 * student's portal then shows a download button for it. There is deliberately
 * NO certificate generation — the signed document is uploaded by the team.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized(req))) return unauthorized();

  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid request.");

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid data.");
    }

    const existing = await db.certificate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "সার্টিফিকেট খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const row = await db.certificate.update({
      where: { id },
      data: { fileUrl: parsed.data.fileUrl || null },
    });

    return NextResponse.json({
      ok: true,
      certificate: {
        id: row.id,
        name: row.name,
        fileUrl: row.fileUrl,
      },
    });
  } catch (error) {
    console.error("[api/admin/certificates] Patch failed:", error);
    return NextResponse.json(
      { ok: false, error: "সার্টিফিকেট আপডেট করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/certificates/[id] — the [id] param is the human-readable
 * certificate ID (e.g. "SIE-CERT-2417"), which is the Prisma primary key.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized(req))) return unauthorized();

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
