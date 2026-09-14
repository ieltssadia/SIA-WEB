import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";
import type {
  AdminEnrollmentLite,
  AdminMockLite,
  AdminStudentDetail,
} from "@/lib/admin-types";

/**
 * GET /api/admin/students/[id] — one portal account with its enrollments
 * and mock test history. `passwordHash` is never returned.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const { id } = await ctx.params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        enrollments: { orderBy: { createdAt: "desc" } },
        mockResults: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!student) {
      return NextResponse.json(
        { ok: false, error: "শিক্ষার্থী খুঁজে পাওয়া যায়নি। (Student not found.)" },
        { status: 404 }
      );
    }

    const enrollments: AdminEnrollmentLite[] = student.enrollments.map((e) => ({
      id: e.id,
      courseSlug: e.courseSlug,
      batch: e.batch,
      targetBand: e.targetBand,
      examDate: e.examDate,
      progress: e.progress,
      attendance: e.attendance,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
    }));

    const mockResults: AdminMockLite[] = student.mockResults.map((m) => ({
      id: m.id,
      label: m.label,
      date: m.date,
      listening: m.listening,
      reading: m.reading,
      writing: m.writing,
      speaking: m.speaking,
      overall: m.overall,
    }));

    const row: AdminStudentDetail = {
      id: student.id,
      name: student.name,
      phone: student.phone,
      createdAt: student.createdAt.toISOString(),
      enrollmentCount: enrollments.length,
      latestEnrollment: enrollments[0] ?? null,
      enrollments,
      mockResults,
    };

    return NextResponse.json({ ok: true, student: row });
  } catch (error) {
    console.error("[api/admin/students] Detail failed:", error);
    return NextResponse.json(
      { ok: false, error: "শিক্ষার্থী লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
