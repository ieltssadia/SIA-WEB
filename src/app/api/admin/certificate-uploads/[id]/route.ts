import { NextResponse } from "next/server";
import { unlinkSync } from "node:fs";
import path from "node:path";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import type { AdminCertificateUpload } from "@/lib/admin-types";

/**
 * PATCH  /api/admin/certificate-uploads/[id] — review a student upload:
 *   { status: "verified" | "rejected" | "pending", note?: string }
 * Teachers, admins and the owner can review (certificates are the team's
 * domain); the note is shown to the student in the portal.
 *
 * DELETE — remove the upload entirely (admin/owner only). The file is
 * unlinked from /public/uploads/certificates/.
 */

const STATUSES = new Set(["pending", "verified", "rejected"]);

function serialize(row: {
  id: string;
  studentId: string;
  filename: string;
  url: string;
  kind: string;
  size: number;
  status: string;
  note: string;
  createdAt: Date;
  student: { id: string; name: string; phone: string };
}): AdminCertificateUpload {
  return {
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
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");

  const status = String(body.status ?? "");
  if (!STATUSES.has(status)) {
    return badRequest("স্ট্যাটাস pending, verified বা rejected হতে হবে।");
  }
  const note = String(body.note ?? "").slice(0, 300);

  const { id } = await params;
  const existing = await db.certificateUpload.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const row = await db.certificateUpload.update({
    where: { id },
    data: { status, note },
    include: {
      student: { select: { id: true, name: true, phone: true } },
    },
  });

  return NextResponse.json({ ok: true, upload: serialize(row) });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.certificateUpload.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    if (existing.url.startsWith("/uploads/certificates/")) {
      unlinkSync(
        path.join(process.cwd(), "public", existing.url.replace(/^\//, ""))
      );
    }
  } catch {
    // File already gone — still remove the row.
  }

  await db.certificateUpload.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
