import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ClassSlide, LiveClassDetail } from "@/lib/live-types";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;

    const row = await db.liveClass.findUnique({ where: { slug } });
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "এই লাইভ ক্লাসটি খুঁজে পাওয়া যায়নি। (Live class not found.)" },
        { status: 404 }
      );
    }

    let slides: ClassSlide[] = [];
    try {
      const parsed = JSON.parse(row.slides);
      if (Array.isArray(parsed)) {
        slides = parsed
          .filter((s) => s && typeof s.title === "string")
          .map((s) => ({
            title: String(s.title),
            bullets: Array.isArray(s.bullets) ? s.bullets.map(String) : [],
          }));
      }
    } catch {
      slides = [];
    }

    const detail: LiveClassDetail = {
      slug: row.slug,
      title: row.title,
      courseSlug: row.courseSlug,
      teacher: row.teacher,
      description: row.description,
      startsAt: row.startsAt.toISOString(),
      durationMin: row.durationMin,
      status: (["scheduled", "live", "ended"].includes(row.status) ? row.status : "scheduled") as LiveClassDetail["status"],
      slides,
    };

    return NextResponse.json({ ok: true, class: detail });
  } catch (error) {
    console.error("[api/live-classes/[slug]] Failed:", error);
    return NextResponse.json(
      { ok: false, error: "ক্লাস তথ্য লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
