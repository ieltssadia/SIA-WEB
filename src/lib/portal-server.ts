import { db } from "@/lib/db";

export type PortalStudentPayload = {
  name: string;
  phone: string;
  courseSlug: string;
  batch: string;
  targetBand: string | null;
  examDate: string | null;
  progress: number;
  attendance: number;
};

export type PortalMockPayload = {
  id: string;
  label: string;
  date: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
};

/**
 * Load the full portal payload for a phone number.
 * Demo-grade auth (no password/OTP-gated data access) — consistent with the
 * sandbox nature of this project; a production build would gate this behind
 * the OTP session cookie.
 */
export async function getPortalPayload(phone: string): Promise<{
  student: PortalStudentPayload;
  mocks: PortalMockPayload[];
} | null> {
  const student = await db.student.findUnique({
    where: { phone },
    include: {
      mockResults: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!student || student.status !== "active") return null;

  return {
    student: {
      name: student.name,
      phone: student.phone,
      courseSlug: student.courseSlug,
      batch: student.batch,
      targetBand: student.targetBand,
      examDate: student.examDate,
      progress: student.progress,
      attendance: student.attendance,
    },
    mocks: student.mockResults.map((m) => ({
      id: m.id,
      label: m.label,
      date: m.date,
      listening: m.listening,
      reading: m.reading,
      writing: m.writing,
      speaking: m.speaking,
      overall: m.overall,
    })),
  };
}

/** Fixed demo OTP — a production build would send this by SMS. */
export const DEMO_OTP = "123456";
