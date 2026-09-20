import { NextResponse } from "next/server";
import { z } from "zod";
import { bearerPhone, getPortalPayload, issueToken } from "@/lib/portal-server";
import { db } from "@/lib/db";
import { courses, upcomingBatches } from "@/lib/site-data";

const enrollSchema = z.object({
  courseSlug: z.string().trim().min(1).max(80),
  batch: z.string().trim().min(1).max(60),
  paymentMethod: z.enum(["bKash", "Nagad", "Rocket", "Bank Transfer", "Cash"]),
  transactionId: z.string().trim().max(60).optional().or(z.literal("")),
});

/**
 * Enroll the authenticated student in a course (checkout confirmation).
 * Requires the session token issued at login/register. Creates the
 * Enrollment row — the purchased course immediately appears in the portal.
 */
export async function POST(req: Request) {
  try {
    const phone = bearerPhone(req);
    if (!phone) {
      return NextResponse.json(
        { error: "Your session expired — please log in again." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const parsed = enrollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please choose a course, batch and payment method." },
        { status: 400 }
      );
    }

    const course = courses.find((c) => c.slug === parsed.data.courseSlug);
    if (!course) {
      return NextResponse.json(
        { error: "Unknown course — please pick a course from the catalog." },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({ where: { phone } });
    if (!student) {
      return NextResponse.json(
        { error: "Account not found — please log in again." },
        { status: 401 }
      );
    }

    const duplicate = await db.enrollment.findUnique({
      where: {
        studentId_courseSlug: { studentId: student.id, courseSlug: course.slug },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          error: `আপনি ইতিমধ্যে "${course.title}" কোর্সে ভর্তি আছেন — পোর্টালে দেখুন।`,
        },
        { status: 409 }
      );
    }

    // The batch label is chosen at checkout (an advertised upcoming batch or
    // the next rolling batch). Server re-validates it is non-empty; the
    // upcomingBatches list is display data, so accept the chosen label.
    await db.enrollment.create({
      data: {
        studentId: student.id,
        courseSlug: course.slug,
        batch: parsed.data.batch,
        status: "active",
      },
    });

    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json(
        { error: "Enrolled but could not load the portal — please refresh." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...payload,
      token: issueToken(phone),
      enrolled: { courseSlug: course.slug, batch: parsed.data.batch },
      advertisedBatches: upcomingBatches.filter(
        (b) => b.courseSlug === course.slug
      ).length,
    });
  } catch (error) {
    console.error("[api/portal/enroll] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
