import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalPhone } from "@/lib/phone";
import {
  getPortalPayload,
  issueToken,
  verifyPassword,
} from "@/lib/portal-server";
import { db } from "@/lib/db";

const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(6, "Phone number looks too short")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits, +, -, spaces"),
  password: z.string().min(1, "Password is required").max(72),
});

/**
 * Student Portal login — phone + password (issued at enrollment time).
 * Any registered account can log in; students without an active enrollment
 * get an empty portal (no course content until they join a batch).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number and password." },
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
    if (!student) {
      return NextResponse.json(
        {
          error:
            "এই নম্বরে কোনো portal account নেই। Enrollment-এর সময় দেওয়া নম্বর দিয়ে লগ ইন করুন — ভর্তি না থাকলে কল করুন +880 1752-716238।",
        },
        { status: 404 }
      );
    }

    if (!verifyPassword(phone, parsed.data.password, student.passwordHash)) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড! Incorrect password — আবার চেষ্টা করুন।" },
        { status: 401 }
      );
    }

    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json(
        { error: "Could not load your portal — please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...payload, token: issueToken(phone) });
  } catch (error) {
    console.error("[api/portal/login] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
