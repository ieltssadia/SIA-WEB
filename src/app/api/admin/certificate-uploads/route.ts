import { NextResponse } from "next/server";
import { getAuth, unauthorized } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import type { AdminCertificateUpload } from "@/lib/admin-types";

/**
 * GET /api/admin/certificate-uploads — certificates uploaded by students from
 * the portal, newest first, with the student's name/phone. Any signed-in team
 * member can read; verify/reject/delete live on /[id].
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.certificateUpload.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true, phone: true } },
    },
  });

  const uploads: AdminCertificateUpload[] = rows.map((row) => ({
    id: row.id,
    studentId: row.student.id,
    studentName: row.student.name,
    studentPhone: row.student.phone,
    filename: row.filename,
    url: row.url,
    kind: row.kind,
    size: row.size,
    status: row.status as AdminCertificateUpload["status"],
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  }));

  return NextResponse.json({ ok: true, uploads });
}
