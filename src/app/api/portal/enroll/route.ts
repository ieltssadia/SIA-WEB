import { NextResponse } from "next/server";
import { z } from "zod";
import { bearerPhone, getPortalPayload, issueToken } from "@/lib/portal-server";
import { db } from "@/lib/db";
import { courses, upcomingBatches } from "@/lib/site-data";

const enrollSchema = z.object({
  courseSlug: z.string().trim().min(1).max(80),
  batch: z.string().trim().min(1).max(60),
  paymentMethod: z.string().trim().min(2, "পেমেন্ট পদ্ধতি নির্বাচন করুন।").max(80),
  transactionId: z.string().trim().max(80).optional().or(z.literal("")),
});

function makeOrderNo(): string {
  const d = new Date();
  const ymd = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SIE-${ymd}-${rand}`;
}

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
        { error: "Your session expired, please log in again." },
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
        { error: "Unknown course, please pick a course from the catalog." },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({ where: { phone } });
    if (!student) {
      return NextResponse.json(
        { error: "Account not found, please log in again." },
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
          error: `আপনি ইতিমধ্যে "${course.title}" কোর্সে ভর্তি আছেন, পোর্টালে দেখুন।`,
        },
        { status: 409 }
      );
    }

    // Require Transaction ID for manual payment methods (Prime Bank, Pubali Bank QR, bKash, Nagad)
    const isCash =
      parsed.data.paymentMethod === "Cash" ||
      parsed.data.paymentMethod === "Cash at Office";
    if (!isCash && (!parsed.data.transactionId || parsed.data.transactionId.trim().length < 3)) {
      return NextResponse.json(
        {
          error:
            "পেমেন্ট নিশ্চিত করতে Transaction ID (TrxID) দেওয়া আবশ্যক। অ্যাডমিন প্যানেল থেকে TrxID যাচাই করার পর ভর্তি কনফার্ম হবে।",
        },
        { status: 400 }
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

    // Mirror to Order table so Admin can manually verify the payment in Admin Orders
    const coursePrice = course.price ?? 0;
    try {
      await db.order.create({
        data: {
          orderNo: makeOrderNo(),
          name: student.name,
          phone: student.phone,
          email: student.email || null,
          zone: "online",
          address: "Online Course Enrollment",
          note: `Course: ${course.title} · Batch: ${parsed.data.batch}`,
          subtotal: coursePrice,
          deliveryFee: 0,
          total: coursePrice,
          paymentMethod: parsed.data.paymentMethod,
          transactionId: parsed.data.transactionId?.trim() || null,
          paymentStatus: "pending",
          status: "placed",
          items: {
            create: [
              {
                kind: "course",
                slug: course.slug,
                title: `${course.title} (${parsed.data.batch})`,
                price: coursePrice,
                quantity: 1,
                lineTotal: coursePrice,
              },
            ],
          },
        },
      });
    } catch (orderErr) {
      console.warn("[api/portal/enroll] Warning: could not mirror to Order table:", orderErr);
    }

    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json(
        { error: "Enrolled but could not load the portal, please refresh." },
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
