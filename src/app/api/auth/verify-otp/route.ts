import { NextResponse } from "next/server";
import { z } from "zod";
import { getPortalPayload, issueToken } from "@/lib/portal-server";
import { db } from "@/lib/db";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  otp: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "৬ ডিজিটের ভেরিফিকেশন কোড দিন।"),
});

/**
 * Step 2 of student registration — verify the 6-digit OTP from email, activate account, and return login session.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }

    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid verification code." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const { otp } = parsed.data;

    // Find the latest pending OTP record for this email
    const record = await db.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "কোনো ওটিপি কোড অনুরোধ পাওয়া যায়নি। অনুগ্রহ করে আবার Sign Up করুন।" },
        { status: 404 }
      );
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: "এই ওটিপি কোডটির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে 'Resend Code' বাটনে ক্লিক করুন।" },
        { status: 410 }
      );
    }

    // Verify code match
    if (record.code !== otp) {
      return NextResponse.json(
        { error: "ভুল ওটিপি কোড! অনুগ্রহ করে ইমেইলে পাওয়া সঠিক ৬ ডিজিটের কোডটি দিন।" },
        { status: 401 }
      );
    }

    // Double-check if student exists in the meantime
    const existingStudent = await db.student.findFirst({
      where: {
        OR: [{ email }, { phone: record.phone }],
      },
    });

    let student = existingStudent;

    if (!student) {
      student = await db.student.create({
        data: {
          name: record.name,
          phone: record.phone,
          email: record.email,
          passwordHash: record.passwordHash,
          isVerified: true,
        },
      });
    } else {
      // If student was already created, update email and isVerified
      student = await db.student.update({
        where: { id: existingStudent.id },
        data: {
          email: record.email,
          name: record.name,
          passwordHash: record.passwordHash,
          isVerified: true,
        },
      });
    }

    // Clean up consumed OTPs for this email & phone
    await db.emailOtp.deleteMany({
      where: {
        OR: [{ email }, { phone: record.phone }],
      },
    });

    // Load full portal payload
    const payload = await getPortalPayload(student.phone);
    if (!payload) {
      return NextResponse.json(
        { error: "অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু পোর্টাল লোড করা সম্ভব হয়নি। সরাসরি লগ ইন করুন।" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...payload,
      token: issueToken(student.phone),
      message: "অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই ও তৈরি হয়েছে।",
    });
  } catch (error) {
    console.error("[api/auth/verify-otp] Failed:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
