import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuth, unauthorized } from "@/lib/admin-auth";
import { canonicalPhone } from "@/lib/phone";
import { hashPassword } from "@/lib/portal-server";
import type { AdminEnrollmentLite, AdminStudentRow } from "@/lib/admin-types";

function toEnrollmentLite(e: {
  id: string;
  courseSlug: string;
  batch: string;
  targetBand: string | null;
  examDate: string | null;
  progress: number;
  attendance: number;
  status: string;
  createdAt: Date;
}): AdminEnrollmentLite {
  return {
    id: e.id,
    courseSlug: e.courseSlug,
    batch: e.batch,
    targetBand: e.targetBand,
    examDate: e.examDate,
    progress: e.progress,
    attendance: e.attendance,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  };
}

const directEnrollmentSchema = z.object({
  studentId: z.string().trim().optional(),
  name: z.string().trim().min(2, "শিক্ষার্থীর পুরো নাম লিখুন (কমপক্ষে ২ অক্ষর)"),
  phone: z.string().trim().min(6, "সঠিক মোবাইল নম্বর লিখুন"),
  email: z.string().trim().email("সঠিক ইমেইল এড্রেস লিখুন").optional().nullable().or(z.literal("")),
  password: z.string().min(4).optional().or(z.literal("")),
  courseSlug: z.string().trim().min(1, "কোর্স সিলেক্ট করুন"),
  batch: z.string().trim().min(1, "ব্যাচ নাম লিখুন").default("Offline Direct Admission"),
  targetBand: z.string().trim().max(10).optional().default("7.5"),
  examDate: z.string().trim().max(30).optional().nullable().or(z.literal("")),
  progress: z.coerce.number().int().min(0).max(100).optional().default(0),
  attendance: z.coerce.number().int().min(0).max(100).optional().default(100),
  status: z.enum(["active", "completed", "paused"]).default("active"),
});

/**
 * GET /api/admin/students — portal accounts with enrollment counts and each
 * student's most recent enrollment. `passwordHash` is never returned.
 */
export async function GET(req: Request) {
  if (!(await getAuth(req))) return unauthorized();

  try {
    const students = await db.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: { orderBy: { createdAt: "desc" } },
      },
    });

    const rows: AdminStudentRow[] = students.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      createdAt: s.createdAt.toISOString(),
      enrollmentCount: s.enrollments.length,
      latestEnrollment: s.enrollments[0] ? toEnrollmentLite(s.enrollments[0]) : null,
    }));

    return NextResponse.json({ ok: true, students: rows });
  } catch (error) {
    console.error("[api/admin/students] List failed:", error);
    return NextResponse.json(
      { ok: false, error: "শিক্ষার্থী লোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/students — Offline / Direct Enrollment:
 * Admin can create an account or grant a course to a student directly.
 */
export async function POST(req: Request) {
  if (!(await getAuth(req))) return unauthorized();

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid data received." }, { status: 400 });
    }

    const parsed = directEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।" },
        { status: 400 }
      );
    }

    const {
      studentId,
      name,
      phone: rawPhone,
      email: rawEmail,
      password,
      courseSlug,
      batch,
      targetBand,
      examDate,
      progress,
      attendance,
      status,
    } = parsed.data;

    const phone = canonicalPhone(rawPhone);
    if (phone.length < 11) {
      return NextResponse.json(
        { ok: false, error: "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)।" },
        { status: 400 }
      );
    }

    const email = rawEmail && rawEmail.trim().length > 0 ? rawEmail.trim().toLowerCase() : null;

    let student = null;

    if (studentId) {
      student = await db.student.findUnique({ where: { id: studentId } });
    }

    if (!student) {
      student = await db.student.findFirst({
        where: {
          OR: [
            { phone },
            ...(email ? [{ email }] : []),
          ],
        },
      });
    }

    // Default password is phone number or user specified
    const initialPassword = password && password.trim().length > 0 ? password.trim() : phone;
    const passwordHash = hashPassword(phone, initialPassword);

    if (!student) {
      // Create new student record with verified portal access
      student = await db.student.create({
        data: {
          name,
          phone,
          email,
          passwordHash,
          isVerified: true,
        },
      });
    } else {
      // Update student details if name / email provided
      student = await db.student.update({
        where: { id: student.id },
        data: {
          name: name || student.name,
          email: email || student.email,
          isVerified: true,
          ...(password && password.trim().length > 0 ? { passwordHash } : {}),
        },
      });
    }

    // Create the course enrollment
    const enrollment = await db.enrollment.create({
      data: {
        studentId: student.id,
        courseSlug,
        batch: batch || "Offline Direct Admission",
        targetBand: targetBand || "7.5",
        examDate: examDate && examDate.trim().length > 0 ? examDate.trim() : null,
        progress: progress ?? 0,
        attendance: attendance ?? 100,
        status: status || "active",
      },
    });

    return NextResponse.json({
      ok: true,
      message: `শিক্ষার্থী ${student.name}-কে "${courseSlug}" কোর্সে সফলভাবে এনরোল করা হয়েছে!`,
      student: {
        id: student.id,
        name: student.name,
        phone: student.phone,
        email: student.email,
      },
      enrollment: toEnrollmentLite(enrollment),
    });
  } catch (error) {
    console.error("[api/admin/students] Direct enrollment failed:", error);
    return NextResponse.json(
      { ok: false, error: "কোর্স প্রদান করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
