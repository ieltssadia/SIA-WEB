import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminNotice } from "@/lib/admin-serialize";
import { noticeDateToDisplay, noticeSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/notices — portal notice board (newest first).
 * Any signed-in team member can read.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.notice.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, notices: rows.map(serializeAdminNotice) });
}

/**
 * POST /api/admin/notices — post a notice. Every team role can post (teachers
 * announce class updates); edit/delete stay admin/owner.
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = noticeSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid notice data.");
  }
  const data = parsed.data;

  const row = await db.notice.create({
    data: {
      date: noticeDateToDisplay(data.date),
      tag: data.tag,
      title: data.title,
      body: data.body,
    },
  });

  return NextResponse.json(
    { ok: true, notice: serializeAdminNotice(row) },
    { status: 201 }
  );
}
