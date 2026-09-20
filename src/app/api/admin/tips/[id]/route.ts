import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminTip } from "@/lib/admin-serialize";
import { tipSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/tips/[id] — edit a tip (admin/owner).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");

  const parsed = tipSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid tip data.");
  }
  const data = parsed.data;

  const existing = await db.tip.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "টিপসটি পাওয়া যায়নি।" }, { status: 404 });
  }

  const row = await db.tip.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, tip: serializeAdminTip(row) });
}

/** DELETE /api/admin/tips/[id] — remove a tip (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.tip.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "টিপসটি পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.tip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
