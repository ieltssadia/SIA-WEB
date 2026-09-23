import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { bearerPhone } from "@/lib/portal-server";
import { canonicalPhone } from "@/lib/phone";
import { db } from "@/lib/db";

/**
 * /api/portal/certificates — students upload THEIR OWN certificates (real
 * IELTS / result certificates — an image or PDF). Nothing is generated: the
 * student submits a file, the admin team reviews it (pending → verified /
 * rejected with a note) and the status shows back in the portal.
 *
 * GET  — list the signed-in student's uploads (newest first).
 * POST — multipart upload (image/pdf, ≤ 10 MB, max 6 files per student).
 * Auth: Bearer portal token (same HMAC scheme as the rest of the portal).
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_UPLOADS_PER_STUDENT = 6;

const ALLOWED: Record<string, "image" | "pdf"> = {
  "image/png": "image",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/webp": "image",
  "application/pdf": "pdf",
};

function serialize(row: {
  id: string;
  filename: string;
  url: string;
  kind: string;
  size: number;
  status: string;
  note: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    kind: row.kind,
    size: row.size,
    status: row.status,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(req: Request) {
  const phone = bearerPhone(req);
  if (!phone) {
    return NextResponse.json(
      { error: "Session expired, please log in again." },
      { status: 401 }
    );
  }

  const student = await db.student.findUnique({
    where: { phone: canonicalPhone(phone) },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  const rows = await db.certificateUpload.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, uploads: rows.map(serialize) });
}

export async function POST(req: Request) {
  const phone = bearerPhone(req);
  if (!phone) {
    return NextResponse.json(
      { error: "Session expired, please log in again." },
      { status: 401 }
    );
  }

  const student = await db.student.findUnique({
    where: { phone: canonicalPhone(phone) },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "আপলোড পড়া যায়নি, আবার চেষ্টা করুন।" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি।" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "ফাইলটি খালি।" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "ফাইল সাইজ ১০ MB-এর কম হতে হবে। (Max size is 10 MB.)" },
      { status: 400 }
    );
  }

  const mime = (file.type || "").toLowerCase();
  const kind = ALLOWED[mime];
  if (!kind) {
    return NextResponse.json(
      { error: "শুধু JPG, PNG, WebP ছবি বা PDF ফাইল জমা দেওয়া যাবে।" },
      { status: 400 }
    );
  }

  const count = await db.certificateUpload.count({
    where: { studentId: student.id },
  });
  if (count >= MAX_UPLOADS_PER_STUDENT) {
    return NextResponse.json(
      {
        error:
          "সর্বোচ্চ ৬টি সার্টিফিকেট জমা দেওয়া যায়, পুরনো কোনোটি মুছে ফেলে আবার চেষ্টা করুন।",
      },
      { status: 400 }
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "certificates");
  try {
    mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.error("[api/portal/certificates] mkdir failed:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }

  const safeBase =
    file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(-60) || "certificate";
  const ext = path.extname(safeBase) || (kind === "pdf" ? ".pdf" : ".png");
  const stamped = `${Date.now()}-${student.id.slice(-6)}${ext}`;

  try {
    writeFileSync(path.join(dir, stamped), Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    console.error("[api/portal/certificates] write failed:", error);
    return NextResponse.json(
      { error: "ফাইল সেভ করা যায়নি, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }

  const row = await db.certificateUpload.create({
    data: {
      studentId: student.id,
      filename: file.name.slice(0, 160) || stamped,
      url: `/uploads/certificates/${stamped}`,
      kind,
      size: file.size,
      status: "pending",
      note: "",
    },
  });

  return NextResponse.json({ ok: true, upload: serialize(row) }, { status: 201 });
}
