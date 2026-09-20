import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminTip } from "@/lib/admin-serialize";
import { tipSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/tips — free tips shown on the public #/tips page.
 * Any signed-in team member can read.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.tip.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ ok: true, tips: rows.map(serializeAdminTip) });
}

/**
 * POST /api/admin/tips — add a tip. Every role can add (teachers share
 * tricks); edit/delete stay admin/owner.
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = tipSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid tip data.");
  }
  const data = parsed.data;

  const row = await db.tip.create({
    data: {
      title: data.title,
      excerpt: data.excerpt,
      category: data.category,
      icon: data.icon,
      published: data.published,
    },
  });

  return NextResponse.json({ ok: true, tip: serializeAdminTip(row) }, { status: 201 });
}
