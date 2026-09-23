import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuth, unauthorized, badRequest } from "@/lib/admin-auth";
import type { AdminCertificate } from "@/lib/admin-types";

const issueSchema = z.object({
  id: z
    .string()
    .trim()
    .max(40)
    .regex(/^SIE-CERT-[A-Za-z0-9]{3,12}$/, "ID ফরম্যাট: SIE-CERT-XXXX")
    .optional()
    .or(z.literal("")),
  name: z.string().trim().min(2, "শিক্ষার্থীর নাম লিখুন।").max(100),
  course: z.string().trim().min(2, "কোর্সের নাম লিখুন।").max(120),
  batch: z.string().trim().min(1, "ব্যাচ লিখুন (যেমন Batch 317)।").max(60),
  band: z
    .string()
    .trim()
    .regex(/^\d(?:\.\d)?$/, "Overall band যেমন 7.5 বা 8"),
  issued: z.string().trim().min(3, "ইস্যুর তারিখ দিন।").max(40),
  studentId: z.string().trim().max(40).optional().or(z.literal("")),
  fileUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^\//, "সার্টিফিকেট ফাইলের লিংক সাইটের ভেতরের পাথ হতে হবে।")
    .optional()
    .or(z.literal("")),
});

function makeCertId(): string {
  return `SIE-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** GET /api/admin/certificates — all issued certificates, newest first. */
export async function GET(req: Request) {
  if (!(await getAuth(req))) return unauthorized();

  try {
    const rows = await db.certificate.findMany({
      orderBy: { createdAt: "desc" },
    });

    const certificates: AdminCertificate[] = rows.map((c) => ({
      id: c.id,
      name: c.name,
      course: c.course,
      batch: c.batch,
      band: c.band,
      issued: c.issued,
      studentId: c.studentId,
      fileUrl: c.fileUrl,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, certificates });
  } catch (error) {
    console.error("[api/admin/certificates] List failed:", error);
    return NextResponse.json(
      { ok: false, error: "সার্টিফিকেট লোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/certificates — issue a certificate. If no human ID is
 * supplied, one is generated as "SIE-CERT-XXXX" (4 random digits, retried on
 * a rare unique-key collision).
 */
export async function POST(req: Request) {
  if (!(await getAuth(req))) return unauthorized();

  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid request.");

    const parsed = issueSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid certificate data.");
    }

    const data = parsed.data;

    let cert: Awaited<ReturnType<typeof db.certificate.create>> | null = null;
    for (let attempt = 0; attempt < 5 && !cert; attempt++) {
      try {
        cert = await db.certificate.create({
          data: {
            id: data.id || makeCertId(),
            name: data.name,
            course: data.course,
            batch: data.batch,
            band: data.band,
            issued: data.issued,
            studentId: data.studentId || null,
            fileUrl: data.fileUrl || null,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (data.id) throw error; // explicit ID collisions should surface
        if (message.includes("Unique constraint")) continue; // auto-ID retry
        throw error;
      }
    }

    if (!cert) {
      return NextResponse.json(
        { ok: false, error: "ID তৈরি করা যায়নি, আবার চেষ্টা করুন।" },
        { status: 500 }
      );
    }

    const row: AdminCertificate = {
      id: cert.id,
      name: cert.name,
      course: cert.course,
      batch: cert.batch,
      band: cert.band,
      issued: cert.issued,
      studentId: cert.studentId,
      fileUrl: cert.fileUrl,
      createdAt: cert.createdAt.toISOString(),
    };

    return NextResponse.json({ ok: true, certificate: row }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { ok: false, error: "এই ID দিয়ে আগেই সার্টিফিকেট ইস্যু হয়েছে।" },
        { status: 409 }
      );
    }
    console.error("[api/admin/certificates] Issue failed:", error);
    return NextResponse.json(
      { ok: false, error: "সার্টিফিকেট ইস্যু করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
