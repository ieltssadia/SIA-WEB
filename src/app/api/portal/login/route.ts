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
  identifier: z.string().trim().min(3, "Phone number or email is required").max(100).optional(),
  phone: z.string().trim().min(3).max(100).optional(),
  password: z.string().min(1, "Password is required").max(72),
});

/**
 * Student Portal login — phone/email + password.
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
        { error: "Please enter a valid mobile number/email and password." },
        { status: 400 }
      );
    }

    const rawId = (parsed.data.identifier || parsed.data.phone || "").trim();
    if (!rawId) {
      return NextResponse.json(
        { error: "Please enter your mobile number or email address." },
        { status: 400 }
      );
    }

    const isEmail = rawId.includes("@");
    let student = null;

    if (isEmail) {
      student = await db.student.findUnique({
        where: { email: rawId.toLowerCase() },
      });
    } else {
      const phone = canonicalPhone(rawId);
      if (phone.length < 11) {
        return NextResponse.json(
          { error: "Please enter your full 11-digit mobile number (e.g. 01712345678) or email." },
          { status: 400 }
        );
      }
      student = await db.student.findUnique({ where: { phone } });
    }

    if (!student) {
      return NextResponse.json(
        {
          error: isEmail
            ? "এই ইমেইলে কোনো portal account নেই। সঠিক ইমেইল দিন অথবা Sign up করুন।"
            : "এই নম্বরে কোনো portal account নেই। Enrollment-এর সময় দেওয়া নম্বর দিয়ে লগ ইন করুন, ভর্তি না থাকলে কল করুন +880 1752-716238।",
        },
        { status: 404 }
      );
    }

    if (!verifyPassword(phone, parsed.data.password, student.passwordHash)) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড! Incorrect password, আবার চেষ্টা করুন।" },
        { status: 401 }
      );
    }

    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json(
        { error: "Could not load your portal, please try again." },
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
