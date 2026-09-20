import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminCourse } from "@/lib/admin-serialize";
import { courseSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/courses — the managed course catalog. Any signed-in team
 * member can read (teachers see it for reference); writes need admin/owner.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.course.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ ok: true, courses: rows.map(serializeAdminCourse) });
}

/** POST /api/admin/courses — add a course (admin/owner). */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid course data.");
  }

  const data = parsed.data;
  const clash = await db.course.findUnique({ where: { slug: data.slug } });
  if (clash) return badRequest("এই slug দিয়ে আগেই কোর্স আছে — অন্যটা দিন।");

  const row = await db.course.create({
    data: {
      slug: data.slug,
      title: data.title,
      titleBn: data.titleBn,
      desc: data.desc,
      lessons: data.lessons,
      duration: data.duration,
      price: data.price,
      oldPrice: data.oldPrice,
      tag: data.tag,
      icon: data.icon,
      features: JSON.stringify(data.features),
      category: data.category,
      rating: data.rating,
      students: data.students,
      nextBatch: data.nextBatch,
      mode: data.mode,
      scheduleNote: data.scheduleNote,
      seatsLeft: data.seatsLeft,
      seatsTotal: data.seatsTotal,
      accessPeriod: data.accessPeriod,
      syllabus: JSON.stringify(data.syllabus),
      published: data.published,
    },
  });

  return NextResponse.json({ ok: true, course: serializeAdminCourse(row) }, { status: 201 });
}
