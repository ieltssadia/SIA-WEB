import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminCourse } from "@/lib/admin-serialize";
import { courseSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/courses/[id] — edit any course field (admin/owner).
 * Partial body: every key is optional; null-ables accept null (e.g. price
 * null → "call for price").
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

  const parsed = courseSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid course data.");
  }
  const data = parsed.data;

  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "কোর্স পাওয়া যায়নি।" }, { status: 404 });
  }

  if (data.slug && data.slug !== existing.slug) {
    const clash = await db.course.findUnique({ where: { slug: data.slug } });
    if (clash) return badRequest("এই slug দিয়ে আগেই কোর্স আছে, অন্যটা দিন।");
  }

  const row = await db.course.update({
    where: { id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.titleBn !== undefined ? { titleBn: data.titleBn } : {}),
      ...(data.desc !== undefined ? { desc: data.desc } : {}),
      ...(data.lessons !== undefined ? { lessons: data.lessons } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.oldPrice !== undefined ? { oldPrice: data.oldPrice } : {}),
      ...(data.tag !== undefined ? { tag: data.tag } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.features !== undefined ? { features: JSON.stringify(data.features) } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.rating !== undefined ? { rating: data.rating } : {}),
      ...(data.students !== undefined ? { students: data.students } : {}),
      ...(data.nextBatch !== undefined ? { nextBatch: data.nextBatch } : {}),
      ...(data.mode !== undefined ? { mode: data.mode } : {}),
      ...(data.scheduleNote !== undefined ? { scheduleNote: data.scheduleNote } : {}),
      ...(data.seatsLeft !== undefined ? { seatsLeft: data.seatsLeft } : {}),
      ...(data.seatsTotal !== undefined ? { seatsTotal: data.seatsTotal } : {}),
      ...(data.accessPeriod !== undefined ? { accessPeriod: data.accessPeriod } : {}),
      ...(data.syllabus !== undefined ? { syllabus: JSON.stringify(data.syllabus) } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, course: serializeAdminCourse(row) });
}

/** DELETE /api/admin/courses/[id] — remove a course (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "কোর্স পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
