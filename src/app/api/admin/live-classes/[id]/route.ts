import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuth, unauthorized, badRequest } from "@/lib/admin-auth";
import { ADMIN_LIVE_STATUSES } from "@/lib/admin-types";
import type { AdminLiveClass } from "@/lib/admin-types";

/**
 * PATCH payload — slug is deliberately NOT editable (it is the public
 * classroom URL, and renaming would break shared links).
 */
const patchSchema = z.object({
  title: z.string().trim().min(3, "ক্লাসের শিরোনাম লিখুন।").max(140).optional(),
  teacher: z.string().trim().min(2).max(80).optional(),
  courseSlug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  startsAt: z.coerce.date({ message: "শুরুর সময় নির্বাচন করুন।" }).optional(),
  durationMin: z.coerce
    .number()
    .int()
    .min(10, "ক্লাস কমপক্ষে ১০ মিনিটের হতে হবে।")
    .max(480)
    .optional(),
  status: z.enum(ADMIN_LIVE_STATUSES as [string, ...string[]]).optional(),
});

/** PATCH /api/admin/live-classes/[id] — edit schedule fields / status. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await getAuth(req))) return unauthorized();

  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid request.");

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid class data.");
    }
    if (Object.keys(parsed.data).length === 0) {
      return badRequest("কোনো পরিবর্তন দেওয়া হয়নি। (Nothing to update.)");
    }

    const existing = await db.liveClass.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "ক্লাসটি খুঁজে পাওয়া যায়নি। (Live class not found.)" },
        { status: 404 }
      );
    }

    const updated = await db.liveClass.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.teacher !== undefined ? { teacher: parsed.data.teacher } : {}),
        ...(parsed.data.courseSlug !== undefined
          ? { courseSlug: parsed.data.courseSlug || null }
          : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description || null }
          : {}),
        ...(parsed.data.startsAt !== undefined ? { startsAt: parsed.data.startsAt } : {}),
        ...(parsed.data.durationMin !== undefined
          ? { durationMin: parsed.data.durationMin }
          : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });

    const row: AdminLiveClass = {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      courseSlug: updated.courseSlug,
      teacher: updated.teacher,
      description: updated.description,
      startsAt: updated.startsAt.toISOString(),
      durationMin: updated.durationMin,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };

    return NextResponse.json({ ok: true, class: row });
  } catch (error) {
    console.error("[api/admin/live-classes] Patch failed:", error);
    return NextResponse.json(
      { ok: false, error: "আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/live-classes/[id] — remove a scheduled/ended class. */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await getAuth(req))) return unauthorized();

  try {
    const { id } = await ctx.params;

    const existing = await db.liveClass.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "ক্লাসটি খুঁজে পাওয়া যায়নি। (Live class not found.)" },
        { status: 404 }
      );
    }

    await db.liveClass.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[api/admin/live-classes] Delete failed:", error);
    return NextResponse.json(
      { ok: false, error: "মুছে ফেলতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
