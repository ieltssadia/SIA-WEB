import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSuccessStory } from "@/lib/admin-serialize";
import { successStorySchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/stories/[id] — edit success story / scorecard.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");

  const parsed = successStorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid story data.");
  }
  const data = parsed.data;

  const existing = await db.successStory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "সফলতার গল্প পাওয়া যায়নি।" }, { status: 404 });
  }

  const row = await db.successStory.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.band !== undefined ? { band: data.band } : {}),
      ...(data.tag !== undefined ? { tag: data.tag } : {}),
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.details !== undefined ? { details: data.details } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.course !== undefined ? { course: data.course } : {}),
      ...(data.serial !== undefined ? { serial: data.serial } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, story: serializeAdminSuccessStory(row) });
}

/**
 * DELETE /api/admin/stories/[id] — delete success story / scorecard.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const existing = await db.successStory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "সফলতার গল্প পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.successStory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
