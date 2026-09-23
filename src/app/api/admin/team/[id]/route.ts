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

const updateSchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন।").max(80).optional(),
  email: z
    .string()
    .trim()
    .email("সঠিক ইমেইল দিন।")
    .max(120)
    .transform((v) => v.toLowerCase())
    .optional(),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।").max(100).optional(),
  role: z.enum(["owner", "admin", "teacher"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

async function activeOwnerCount(excludeId?: string): Promise<number> {
  return db.adminUser.count({
    where: {
      role: "owner",
      status: "active",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

/**
 * PATCH /api/admin/team/[id] — edit a team member (owner only).
 * Guards: you can't change your own role/status, and the last active owner
 * can't be demoted, disabled or given a new email that breaks their login.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role !== "owner") return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  const data = parsed.data;

  const target = await db.adminUser.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ ok: false, error: "সদস্য পাওয়া যায়নি।" }, { status: 404 });
  }

  // Self-protection: an owner can rename themselves / change password, but
  // not silently demote or lock out their own session.
  if (target.id === auth.id && (data.role || data.status)) {
    return badRequest("নিজের রোল বা স্ট্যাটাস বদলানো যাবে না, অন্য একজন Owner দিয়ে করান।");
  }

  // Last-owner protection.
  if (target.role === "owner" && target.status === "active") {
    const others = await activeOwnerCount(id);
    const losesOwner =
      (data.role && data.role !== "owner") ||
      (data.status && data.status !== "active");
    if (others === 0 && losesOwner) {
      return badRequest("শেষ Owner-কে ডিমোট/নিষ্ক্রিয় করা যাবে না, আগে আরেকজন Owner বানান।");
    }
  }

  const update: Record<string, string> = {};
  if (data.name) update.name = data.name;
  if (data.email) update.email = data.email;
  if (data.role) update.role = data.role;
  if (data.status) update.status = data.status;
  if (data.password) update.passwordHash = hashAdminPassword(data.email ?? target.email, data.password);

  const duplicate = data.email
    ? await db.adminUser.findFirst({ where: { email: data.email, id: { not: id } } })
    : null;
  if (duplicate) return badRequest("এই ইমেইল দিয়ে আরেকজন সদস্য আগেই আছে।");

  const member = await db.adminUser.update({ where: { id }, data: update });
  return NextResponse.json({ ok: true, member: serializeTeamMember(member) });
}

/**
 * DELETE /api/admin/team/[id] — remove a team member (owner only).
 * Guards: can't delete yourself, can't delete the last active owner.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role !== "owner") return forbidden();

  const { id } = await params;
  if (id === auth.id) {
    return badRequest("নিজের অ্যাকাউন্ট ডিলিট করা যাবে না।");
  }

  const target = await db.adminUser.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ ok: false, error: "সদস্য পাওয়া যায়নি।" }, { status: 404 });
  }

  if (target.role === "owner" && target.status === "active") {
    const others = await activeOwnerCount(id);
    if (others === 0) {
      return badRequest("শেষ Owner ডিলিট করা যাবে না, আগে আরেকজন Owner বানান।");
    }
  }

  await db.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
