import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalPhone } from "@/lib/phone";
import { DEMO_OTP, getPortalPayload } from "@/lib/portal-server";

const verifySchema = z.object({
  phone: z.string().trim().min(6).max(20),
  otp: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "OTP must be 6 digits"),
});

/**
 * Step 2 of portal login — verify the OTP and return the portal payload
 * (student profile + mock results). Demo OTP: 123456.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter the 6-digit OTP sent to your phone." },
        { status: 400 }
      );
    }

    const phone = canonicalPhone(parsed.data.phone);
    if (parsed.data.otp !== DEMO_OTP) {
      return NextResponse.json(
        { error: "ভুল OTP! Incorrect code — please check and try again." },
        { status: 401 }
      );
    }

    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json(
        {
          error:
            "এই নম্বরে কোনো active enrollment পাওয়া যায়নি। Not enrolled yet? Submit the enrollment form or call +880 1752-716238.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/portal/verify] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
