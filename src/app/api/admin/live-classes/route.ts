import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized, badRequest } from "@/lib/admin-auth";
import { ADMIN_LIVE_STATUSES } from "@/lib/admin-types";
import type { AdminLiveClass } from "@/lib/admin-types";

/** List/create payload for a live class — field names mirror the schema. */
export const liveClassSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug কমপক্ষে ৩ অক্ষরের হতে হবে।")
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug-এ শুধু ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।"
    ),
  title: z.string().trim().min(3, "ক্লাসের শিরোনাম লিখুন।").max(140),
  teacher: z.string().trim().min(2).max(80).default("Sadia Ma'am"),
  courseSlug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  startsAt: z.coerce.date({ message: "শুরুর সময় নির্বাচন করুন।" }),
  durationMin: z.coerce
    .number()
    .int()
    .min(10, "ক্লাস কমপক্ষে ১০ মিনিটের হতে হবে।")
    .max(480)
    .default(60),
  status: z
    .enum(ADMIN_LIVE_STATUSES as [string, ...string[]])
    .default("scheduled"),
});

/** GET /api/admin/live-classes — full schedule (with ids), ascending by startsAt. */
export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const rows = await db.liveClass.findMany({
      orderBy: { startsAt: "asc" },
    });

    const classes: AdminLiveClass[] = rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      courseSlug: c.courseSlug,
      teacher: c.teacher,
      description: c.description,
      startsAt: c.startsAt.toISOString(),
      durationMin: c.durationMin,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, classes });
  } catch (error) {
    console.error("[api/admin/live-classes] List failed:", error);
    return NextResponse.json(
      { ok: false, error: "লাইভ ক্লাস লিস্ট লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/** POST /api/admin/live-classes — schedule a new live class. */
export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid request.");

    const parsed = liveClassSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid class data.");
    }

    const data = parsed.data;
    const created = await db.liveClass.create({
      data: {
        slug: data.slug,
        title: data.title,
        teacher: data.teacher,
        courseSlug: data.courseSlug || null,
        description: data.description || null,
        startsAt: data.startsAt,
        durationMin: data.durationMin,
        status: data.status,
        slides: "[]", // slides are managed in the classroom editor
      },
    });

    const row: AdminLiveClass = {
      id: created.id,
      slug: created.slug,
      title: created.title,
      courseSlug: created.courseSlug,
      teacher: created.teacher,
      description: created.description,
      startsAt: created.startsAt.toISOString(),
      durationMin: created.durationMin,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };

    return NextResponse.json({ ok: true, class: row }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { ok: false, error: "এই slug দিয়ে আগেই ক্লাস আছে — অন্য slug দিন।" },
        { status: 409 }
      );
    }
    console.error("[api/admin/live-classes] Create failed:", error);
    return NextResponse.json(
      { ok: false, error: "ক্লাস তৈরি করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
