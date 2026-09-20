import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminRoutine } from "@/lib/admin-serialize";
import { routineSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/routine — weekly class routine rows (#/routine + portal).
 * Any signed-in team member can read; writes are admin/owner.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.routineSlot.findMany({
    orderBy: [{ createdAt: "asc" }],
  });
  return NextResponse.json({ ok: true, slots: rows.map(serializeAdminRoutine) });
}

/** POST /api/admin/routine — add a routine slot (admin/owner). */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = routineSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid routine data.");
  }
  const data = parsed.data;

  const row = await db.routineSlot.create({ data });
  return NextResponse.json(
    { ok: true, slot: serializeAdminRoutine(row) },
    { status: 201 }
  );
}
