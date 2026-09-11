import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalPhone } from "@/lib/phone";
import { getPortalPayload } from "@/lib/portal-server";

const dataSchema = z.object({
  phone: z.string().trim().min(6).max(20),
});

/**
 * Refresh the portal payload for the logged-in student (called with the
 * phone stored in the client session). Demo-grade: a production build would
 * resolve the student from an httpOnly session cookie instead.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = dataSchema.safeParse({ phone: searchParams.get("phone") ?? "" });
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing phone parameter." }, { status: 400 });
    }

    const phone = canonicalPhone(parsed.data.phone);
    const payload = await getPortalPayload(phone);
    if (!payload) {
      return NextResponse.json({ error: "Session expired — please log in again." }, { status: 401 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/portal/data] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
