import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminNotice } from "@/lib/admin-serialize";
import { noticeDateToDisplay, noticeSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/notices/[id] — edit a notice (admin/owner).
 * `date` arrives as ISO YYYY-MM-DD and is stored in the display format.
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

  const parsed = noticeSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid notice data.");
  }
  const data = parsed.data;

  const existing = await db.notice.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "নোটিশ পাওয়া যায়নি।" }, { status: 404 });
  }

  const row = await db.notice.update({
    where: { id },
    data: {
      ...(data.date !== undefined ? { date: noticeDateToDisplay(data.date) } : {}),
      ...(data.tag !== undefined ? { tag: data.tag } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.body !== undefined ? { body: data.body } : {}),
    },
  });

  return NextResponse.json({ ok: true, notice: serializeAdminNotice(row) });
}

/** DELETE /api/admin/notices/[id] — remove a notice (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.notice.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "নোটিশ পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.notice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
