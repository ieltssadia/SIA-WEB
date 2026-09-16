import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { canonicalPhone } from "@/lib/phone";
import { DEMO_OTP } from "@/lib/portal-server";

const otpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(6, "Phone number looks too short")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits, +, -, spaces"),
});

/**
 * Step 1 of portal login — request an OTP for the enrolled mobile number.
 * Demo mode: the OTP is returned in the response and shown in the UI hint
 * (a production build would deliver it via SMS gateway instead).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const phone = canonicalPhone(parsed.data.phone);
    if (phone.length < 11) {
      return NextResponse.json(
        { error: "Please enter your full 11-digit mobile number (e.g. 01712345678)." },
        { status: 400 }
      );
    }

    const student = await db.student.findUnique({ where: { phone } });
    if (!student || student.status !== "active") {
      return NextResponse.json(
        {
          error:
            "এই নম্বরে কোনো active enrollment পাওয়া যায়নি। Not enrolled yet? Submit the enrollment form or call +880 1752-716238.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ sent: true, devOtp: DEMO_OTP });
  } catch (error) {
    console.error("[api/portal/otp] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
