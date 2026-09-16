import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  badRequest,
  forbidden,
  getAuth,
  hashAdminPassword,
  unauthorized,
} from "@/lib/admin-auth";
import { serializeTeamMember } from "@/lib/admin-serialize";

const createSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন।").max(80),
  email: z
    .string()
    .trim()
    .email("সঠিক ইমেইল দিন।")
    .max(120)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।").max(100),
  role: z.enum(["owner", "admin", "teacher"]),
});

/**
 * GET /api/admin/team — list team members (owner only).
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role !== "owner") return forbidden();

  const rows = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ ok: true, members: rows.map(serializeTeamMember) });
}

/**
 * POST /api/admin/team — add a team member (owner only).
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role !== "owner") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return badRequest("এই ইমেইল দিয়ে একজন সদস্য আগেই আছে।");
  }

  const member = await db.adminUser.create({
    data: {
      name,
      email,
      passwordHash: hashAdminPassword(email, password),
      role,
      status: "active",
    },
  });

  return NextResponse.json(
    { ok: true, member: serializeTeamMember(member) },
    { status: 201 }
  );
}
