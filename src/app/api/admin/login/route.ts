import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { issueToken, verifyAdminPassword } from "@/lib/admin-auth";
import type { AdminRole } from "@/lib/admin-types";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "ইমেইল লিখুন।")
    .max(120)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "পাসওয়ার্ড লিখুন।").max(200),
});

/**
 * POST /api/admin/login — { email, password } → { ok, token, user }.
 *
 * Team members log in with their own credentials; the returned HMAC-signed
 * session token is echoed on every admin call via the `x-admin-key` header.
 * The role on the session (owner | admin | teacher) gates every admin API.
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

    const { email, password } = parsed.data;

    // Check demo accounts first for instant access
    const { DEMO_ADMIN_ACCOUNTS } = await import("@/lib/admin-auth");
    const demo = DEMO_ADMIN_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (demo) {
      return NextResponse.json({
        ok: true,
        token: issueToken(demo.id),
        user: {
          id: demo.id,
          name: demo.name,
          email: demo.email,
          role: demo.role,
        },
      });
    }

    let user = null;
    try {
      user = await db.adminUser.findUnique({ where: { email } });
    } catch (e) {
      console.warn("[api/admin/login] Database lookup failed, checking credentials:", e);
    }

    if (!user || !verifyAdminPassword(user.email, password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: "ভুল ইমেইল বা পাসওয়ার্ড। (Incorrect email or password.)" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে — মালিকের সাথে যোগাযোগ করুন।" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      token: issueToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as AdminRole,
      },
    });
  } catch (error) {
    console.error("[api/admin/login] Failed:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong — please try again." },
      { status: 500 }
    );
  }
}
