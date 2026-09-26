import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalPhone } from "@/lib/phone";
import { getPortalPayload, hashPassword, issueToken } from "@/lib/portal-server";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  email: z.string().trim().email().optional(),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number looks too short")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits, +, -, spaces"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72),
});

/**
 * Create a student account (portal sign-up).
 * Returns the same session payload as login — the new account starts with
 * zero enrollments, so its portal is empty until a course is purchased.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check the form." },
        { status: 400 }
      );
    }

    const phone = canonicalPhone(parsed.data.phone);
    if (phone.length < 11) {
      return NextResponse.json(
        {
          error:
            "Please enter your full 11-digit mobile number (e.g. 01712345678).",
        },
        { status: 400 }
      );
    }

    const existing = await db.student.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        {
          error:
            "এই নম্বরে ইতিমধ্যে একটি account আছে। সরাসরি Log in করুন, পাসওয়ার্ড ভুলে গেলে কল করুন +880 1752-716238।",
        },
        { status: 409 }
      );
    }

    await db.student.create({
      data: {
        name: parsed.data.name,
        phone,
        email: parsed.data.email ? parsed.data.email.toLowerCase() : undefined,
        passwordHash: hashPassword(phone, parsed.data.password),
        isVerified: true,
      },
    });

    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json(
        { error: "Account created but could not be loaded, please log in." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...payload, token: issueToken(phone) });
  } catch (error) {
    console.error("[api/auth/register] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
