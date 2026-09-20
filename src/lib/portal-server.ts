import { createHash, createHmac, timingSafeEqual } from "crypto";
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
/* Session tokens — HMAC-signed, stateless ("phone.timestamp.sig")     */
/* Issued at login/register, sent as `Authorization: Bearer <token>`   */
/* for authenticated calls (e.g. course enrollment at checkout).       */
/* Demo-grade; a production build would use httpOnly cookies + JWT.    */
/* ------------------------------------------------------------------ */

const TOKEN_SECRET =
  process.env.PORTAL_SECRET ?? "sadias-ielts-portal-demo-secret";
const TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export function issueToken(phone: string): string {
  const ts = Date.now().toString(36);
  const sig = createHmac("sha256", TOKEN_SECRET)
    .update(`${phone}.${ts}`)
    .digest("hex")
    .slice(0, 32);
  return `${Buffer.from(phone).toString("base64url")}.${ts}.${sig}`;
}

export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [b64, ts, sig] = parts;
  const phone = Buffer.from(b64, "base64url").toString("utf8");
  if (!phone || !ts) return null;
  const expected = createHmac("sha256", TOKEN_SECRET)
    .update(`${phone}.${ts}`)
    .digest("hex")
    .slice(0, 32);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const issued = Number.parseInt(ts, 36);
  if (!Number.isFinite(issued) || Date.now() - issued > TOKEN_TTL_MS) {
    return null;
  }
  return phone;
}

/** Extract + verify the Bearer token of a request. Returns the phone or null. */
export function bearerPhone(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return verifyToken(header.slice(7).trim());
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

export type PortalCertificatePayload = {
  id: string; // human ID, e.g. "SIE-CERT-2455"
  name: string;
  course: string;
  batch: string;
  band: string;
  issued: string;
  fileUrl: string | null; // admin-uploaded certificate file — portal download
};

/**
 * Load the full portal payload for an account: profile + course enrollments
 * + mock results + issued certificates. Students with no enrollment still
 * log in successfully — their portal is simply empty until they join a batch.
 */
export async function getPortalPayload(phone: string): Promise<{
  user: PortalUserPayload;
  enrollments: PortalEnrollmentPayload[];
  mocks: PortalMockPayload[];
  certificates: PortalCertificatePayload[];
} | null> {
  const student = await db.student.findUnique({
    where: { phone },
    include: {
      enrollments: { orderBy: { createdAt: "asc" } },
      mockResults: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!student) return null;

  // Certificates carry an optional studentId link (no FK) — issued certs
  // appear in the portal Resources section only when they point at this
  // student's account.
  const certs = await db.certificate.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "asc" },
  });

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
    certificates: certs.map((c) => ({
      id: c.id,
      name: c.name,
      course: c.course,
      batch: c.batch,
      band: c.band,
      issued: c.issued,
      fileUrl: c.fileUrl,
    })),
  };
}
