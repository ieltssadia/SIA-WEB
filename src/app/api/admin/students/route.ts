import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth, unauthorized } from "@/lib/admin-auth";
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
      { ok: false, error: "শিক্ষার্থী লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
