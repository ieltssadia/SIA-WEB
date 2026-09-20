import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminRoutine } from "@/lib/admin-serialize";
import { routineSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/routine/[id] — edit a routine slot (admin/owner).
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

  const parsed = routineSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid routine data.");
  }
  const data = parsed.data;

  const existing = await db.routineSlot.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "রুটিন স্লট পাওয়া যায়নি।" }, { status: 404 });
  }

  const row = await db.routineSlot.update({
    where: { id },
    data: {
      ...(data.day !== undefined ? { day: data.day } : {}),
      ...(data.start !== undefined ? { start: data.start } : {}),
      ...(data.end !== undefined ? { end: data.end } : {}),
      ...(data.courseSlug !== undefined ? { courseSlug: data.courseSlug } : {}),
      ...(data.batch !== undefined ? { batch: data.batch } : {}),
      ...(data.topic !== undefined ? { topic: data.topic } : {}),
      ...(data.mode !== undefined ? { mode: data.mode } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, slot: serializeAdminRoutine(row) });
}

/** DELETE /api/admin/routine/[id] — remove a routine slot (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.routineSlot.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "রুটিন স্লট পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.routineSlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
