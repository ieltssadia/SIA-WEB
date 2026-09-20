import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { canonicalPhone } from "@/lib/phone";
import { issueToken, verifyToken } from "@/lib/portal-server";
import { courses as staticCourses } from "@/lib/site-data";

const phoneSchema = z.object({
  phone: z.string().trim().min(6).max(20),
});

/**
 * GET /api/portal/suggestions?phone=… — the suggestion/practice library for
 * the logged-in student (Bearer token or demo phone query, same as /data).
 *
 * Gating: the student must be enrolled in at least one PAID course
 * (DB price > 0, or null = "call for price" which still counts as paid).
 * Students in free courses only get an upsell payload — no library content.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = phoneSchema.safeParse({ phone: searchParams.get("phone") ?? "" });
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing phone parameter." }, { status: 400 });
    }
    const phone = canonicalPhone(parsed.data.phone);

    const student = await db.student.findUnique({
      where: { phone },
      include: { enrollments: { select: { courseSlug: true } } },
    });
    if (!student) {
      return NextResponse.json({ error: "Session expired — please log in again." }, { status: 401 });
    }

    // Token check when present (issued at login / data refresh).
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
    if (token && verifyToken(token) !== phone) {
      return NextResponse.json({ error: "Session expired — please log in again." }, { status: 401 });
    }

    const enrolledSlugs = [...new Set(student.enrollments.map((e) => e.courseSlug))];
    let paid = false;
    if (enrolledSlugs.length) {
      const dbCourses = await db.course.findMany({
        where: { slug: { in: enrolledSlugs } },
        select: { slug: true, price: true },
      });
      const priceBySlug = new Map(dbCourses.map((c) => [c.slug, c.price]));
      paid = enrolledSlugs.some((slug) => {
        const dbPrice = priceBySlug.get(slug);
        if (dbPrice !== undefined) return dbPrice === null || dbPrice > 0;
        const fallback = staticCourses.find((c) => c.slug === slug);
        return fallback ? fallback.price === null || fallback.price > 0 : false;
      });
    }

    if (!paid) {
      return NextResponse.json({
        ok: true,
        locked: true,
        token: issueToken(phone),
        suggestions: [],
      });
    }

    const rows = await db.suggestion.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      locked: false,
      token: issueToken(phone),
      suggestions: rows.map((s) => ({
        id: s.id,
        title: s.title,
        desc: s.desc,
        category: s.category,
        fileUrl: s.fileUrl,
        kind: s.kind,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[api/portal/suggestions] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
