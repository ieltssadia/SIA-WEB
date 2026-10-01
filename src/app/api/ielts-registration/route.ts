import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { canonicalPhone } from "@/lib/phone";
import { sendIeltsRegistrationEmail } from "@/lib/email";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "প্রার্থীর পুরো নাম লিখুন।").max(120),
  fatherName: z.string().trim().max(120).optional().nullable(),
  motherName: z.string().trim().max(120).optional().nullable(),
  dob: z.string().trim().min(4, "জন্ম তারিখ নির্বাচন করুন।").max(30),
  gender: z.enum(["Male", "Female", "Other"]),
  nationality: z.string().trim().max(60).default("Bangladeshi"),
  identityNumber: z.string().trim().min(3, "NID / Birth Registration / Passport নম্বর দিন।").max(60),
  phone: z.string().trim().min(6, "সঠিক মোবাইল নম্বর দিন।").max(20),
  whatsapp: z.string().trim().max(20).optional().nullable(),
  email: z.string().trim().email("সঠিক ইমেইল এড্রেস দিন।").max(120),
  presentAddress: z.string().trim().min(3, "বর্তমান ঠিকানা লিখুন।").max(300),
  permanentAddress: z.string().trim().max(300).optional().nullable(),
  examType: z.enum(["IELTS Academic", "IELTS General Training"]),
  testFormat: z.enum(["Computer-Delivered", "Paper-Based"]),
  modules: z.string().default("Listening, Reading, Writing, Speaking"),
  preferredDate: z.string().trim().min(3, "পরীক্ষার পছন্দের তারিখ দিন।").max(40),
  preferredCentre: z.string().trim().min(2, "পরীক্ষা কেন্দ্র সিলেক্ট করুন।").max(80),
  previousExam: z.boolean().default(false),
  previousScore: z.string().trim().max(30).optional().nullable(),
  targetScore: z.string().trim().max(30).optional().nullable(),
  highestEducation: z.string().trim().max(100).optional().nullable(),
  institutionName: z.string().trim().max(150).optional().nullable(),
  occupation: z.string().trim().max(100).optional().nullable(),
  passportCopyUrl: z.string().trim().max(500).optional().nullable(),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  otherDocsUrl: z.string().trim().max(500).optional().nullable(),
});

function generateRegNo(): string {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SIA-REG-${year}${month}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
    }

    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "সবগুলো তথ্য সঠিকভাবে পূরণ করুন।" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const phone = canonicalPhone(data.phone);
    if (phone.length < 11) {
      return NextResponse.json(
        { ok: false, error: "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।" },
        { status: 400 }
      );
    }

    // Generate unique Registration Number
    let regNo = generateRegNo();
    let collision = await db.ieltsRegistration.findUnique({ where: { regNo } });
    while (collision) {
      regNo = generateRegNo();
      collision = await db.ieltsRegistration.findUnique({ where: { regNo } });
    }

    const registration = await db.ieltsRegistration.create({
      data: {
        regNo,
        fullName: data.fullName,
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        dob: data.dob,
        gender: data.gender,
        nationality: data.nationality || "Bangladeshi",
        identityNumber: data.identityNumber,
        phone,
        whatsapp: data.whatsapp ? canonicalPhone(data.whatsapp) : null,
        email: data.email.toLowerCase(),
        presentAddress: data.presentAddress,
        permanentAddress: data.permanentAddress || data.presentAddress,
        examType: data.examType,
        testFormat: data.testFormat,
        modules: data.modules,
        preferredDate: data.preferredDate,
        preferredCentre: data.preferredCentre,
        previousExam: data.previousExam,
        previousScore: data.previousScore || null,
        targetScore: data.targetScore || null,
        highestEducation: data.highestEducation || null,
        institutionName: data.institutionName || null,
        occupation: data.occupation || null,
        passportCopyUrl: data.passportCopyUrl || null,
        photoUrl: data.photoUrl || null,
        otherDocsUrl: data.otherDocsUrl || null,
        status: "new",
        paymentStatus: "unpaid",
      },
    });

    // Send confirmation email asynchronously
    void sendIeltsRegistrationEmail({
      regNo: registration.regNo,
      fullName: registration.fullName,
      phone: registration.phone,
      email: registration.email,
      examType: registration.examType,
      testFormat: registration.testFormat,
      preferredDate: registration.preferredDate,
      preferredCentre: registration.preferredCentre,
      identityNumber: registration.identityNumber,
      targetScore: registration.targetScore,
    });

    return NextResponse.json({
      ok: true,
      message: "আপনার IELTS পরীক্ষার রেজিস্ট্রেশন সফলভাবে জমা হয়েছে!",
      regNo: registration.regNo,
      registration: {
        id: registration.id,
        regNo: registration.regNo,
        fullName: registration.fullName,
        email: registration.email,
        phone: registration.phone,
        examType: registration.examType,
        testFormat: registration.testFormat,
        preferredDate: registration.preferredDate,
        preferredCentre: registration.preferredCentre,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    console.error("[api/ielts-registration] Submission failed:", error);
    return NextResponse.json(
      { ok: false, error: "রেজিস্ট্রেশন জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json({ ok: false, error: "Registration ID বা মোবাইল নম্বর দিন।" }, { status: 400 });
    }

    const reg = await db.ieltsRegistration.findFirst({
      where: {
        OR: [
          { regNo: { equals: q, mode: "insensitive" } },
          { phone: canonicalPhone(q) },
          { email: { equals: q.toLowerCase(), mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        regNo: true,
        fullName: true,
        examType: true,
        testFormat: true,
        preferredDate: true,
        preferredCentre: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    if (!reg) {
      return NextResponse.json({ ok: false, error: "কোনো রেজিস্ট্রেশন রেকর্ড পাওয়া যায়নি।" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, registration: reg });
  } catch (error) {
    console.error("[api/ielts-registration] Lookup failed:", error);
    return NextResponse.json({ ok: false, error: "তথ্য লোড করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
