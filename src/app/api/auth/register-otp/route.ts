import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalPhone } from "@/lib/phone";
import { hashPassword } from "@/lib/portal-server";
import { sendOtpEmail } from "@/lib/email";
import { db } from "@/lib/db";

const registerOtpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name (minimum 2 characters).").max(70),
  email: z.string().trim().email("Please enter a valid email address.").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number looks too short")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits, +, -, spaces"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(72),
});

/**
 * Step 1 of student registration — validate fields and dispatch a 6-digit OTP to the student's email.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }

    const parsed = registerOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check all required fields." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const phone = canonicalPhone(parsed.data.phone);

    if (phone.length < 11) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (e.g. 01712345678)।" },
        { status: 400 }
      );
    }

    // Check if phone or email is already registered in Student
    const existingPhone = await db.student.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        {
          error: "এই মোবাইল নম্বরে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে Log In করুন অথবা পাসওয়ার্ড ভুলে গেলে হেল্পলাইনে যোগাযোগ করুন।",
        },
        { status: 409 }
      );
    }

    const existingEmail = await db.student.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        {
          error: "এই ইমেইল ঠিকানায় ইতিমধ্যে একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে Log In করুন।",
        },
        { status: 409 }
      );
    }

    // Generate random secure 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const passwordHash = hashPassword(phone, parsed.data.password);

    // Delete any existing pending OTPs for this email or phone
    await db.emailOtp.deleteMany({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    // Store new OTP record
    await db.emailOtp.create({
      data: {
        email,
        phone,
        name: parsed.data.name,
        passwordHash,
        code: otp,
        expiresAt,
      },
    });

    // Send the email via Resend
    const sendResult = await sendOtpEmail(email, otp, parsed.data.name);
    if (!sendResult.ok) {
      console.warn("[register-otp] Resend dispatch returned non-ok:", sendResult.error);
    }

    return NextResponse.json({
      ok: true,
      email,
      message: `আপনার ইমেইল (${email})-এ ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে।`,
    });
  } catch (error) {
    console.error("[api/auth/register-otp] Failed:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
