import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_PASSWORD, checkAdminPassword } from "@/lib/admin-auth";

const loginSchema = z.object({
  password: z.string().min(1, "পাসওয়ার্ড লিখুন।").max(200),
});

/**
 * POST /api/admin/login — { password } → { ok, token }.
 *
 * The token IS the admin password (kept deliberately simple for this demo):
 * the client stores it and echoes it back on every admin call via the
 * `x-admin-key` header, which the other admin routes timing-safe compare.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid request." },
        { status: 400 }
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    if (!checkAdminPassword(parsed.data.password)) {
      return NextResponse.json(
        { ok: false, error: "ভুল পাসওয়ার্ড। (Incorrect password.)" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true, token: ADMIN_PASSWORD });
  } catch (error) {
    console.error("[api/admin/login] Failed:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong — please try again." },
      { status: 500 }
    );
  }
}
