import { createHash, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/* Password hashing — sha256("<phone>:<password>")                     */
/* Demo-grade auth; a production build would use bcrypt/argon2.        */
/* ------------------------------------------------------------------ */

export function hashPassword(phone: string, password: string): string {
  return createHash("sha256").update(`${phone}:${password}`).digest("hex");
}

export function verifyPassword(
  phone: string,
  password: string,
  passwordHash: string
): boolean {
  const candidate = Buffer.from(hashPassword(phone, password), "hex");
  const stored = Buffer.from(passwordHash, "hex");
  return (
    candidate.length === stored.length && timingSafeEqual(candidate, stored)
  );
}

/* ------------------------------------------------------------------ */
/* Portal payload                                                      */
/* ------------------------------------------------------------------ */

export type PortalUserPayload = {
  name: string;
  phone: string;
};

export type PortalEnrollmentPayload = {
  id: string;
  courseSlug: string;
  batch: string;
  targetBand: string | null;
  examDate: string | null;
  progress: number;
  attendance: number;
  status: string;
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
 * Load the full portal payload for an account: profile + course enrollments
 * + mock results. Students with no enrollment still log in successfully —
 * their portal is simply empty until they join a batch.
 */
export async function getPortalPayload(phone: string): Promise<{
  user: PortalUserPayload;
  enrollments: PortalEnrollmentPayload[];
  mocks: PortalMockPayload[];
} | null> {
  const student = await db.student.findUnique({
    where: { phone },
    include: {
      enrollments: { orderBy: { createdAt: "asc" } },
      mockResults: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!student) return null;

  return {
    user: { name: student.name, phone: student.phone },
    enrollments: student.enrollments.map((e) => ({
      id: e.id,
      courseSlug: e.courseSlug,
      batch: e.batch,
      targetBand: e.targetBand,
      examDate: e.examDate,
      progress: e.progress,
      attendance: e.attendance,
      status: e.status,
    })),
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
