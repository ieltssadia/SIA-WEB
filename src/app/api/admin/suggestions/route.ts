import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSuggestion } from "@/lib/admin-serialize";
import { suggestionSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/suggestions — uploaded practice material shown to paid
 * students in the portal Suggestions section. Any signed-in role can read.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.suggestion.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    ok: true,
    suggestions: rows.map(serializeAdminSuggestion),
  });
}

/**
 * POST /api/admin/suggestions — publish an uploaded file (admin/owner).
 * The upload itself goes through POST /api/admin/upload (folder=suggestions);
 * this attaches the returned URL to a titled row. Uploading + publishing is
 * therefore a single save — the file is live for students immediately.
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = suggestionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid suggestion data.");
  }
  const data = parsed.data;

  const row = await db.suggestion.create({ data });
  return NextResponse.json(
    { ok: true, suggestion: serializeAdminSuggestion(row) },
    { status: 201 }
  );
}
