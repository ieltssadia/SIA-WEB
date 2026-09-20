import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSuggestion } from "@/lib/admin-serialize";
import { suggestionSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/suggestions/[id] — edit title/desc/category/publish state
 * (admin/owner). Changing fileUrl re-points the row at another uploaded file.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");

  const parsed = suggestionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid suggestion data.");
  }
  const data = parsed.data;

  const existing = await db.suggestion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "সাজেশন পাওয়া যায়নি।" }, { status: 404 });
  }

  const row = await db.suggestion.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.desc !== undefined ? { desc: data.desc } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
      ...(data.kind !== undefined ? { kind: data.kind } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, suggestion: serializeAdminSuggestion(row) });
}

/** DELETE /api/admin/suggestions/[id] — unpublish/remove (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.suggestion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "সাজেশন পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.suggestion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
