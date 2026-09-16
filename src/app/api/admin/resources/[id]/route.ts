import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminResource } from "@/lib/admin-serialize";
import { resourceSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/resources/[id] — edit a downloadable resource (admin/owner).
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

  const parsed = resourceSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid resource data.");
  }
  const data = parsed.data;

  const existing = await db.downloadResource.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "রিসোর্স পাওয়া যায়নি।" }, { status: 404 });
  }

  const row = await db.downloadResource.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.desc !== undefined ? { desc: data.desc } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.href !== undefined ? { href: data.href } : {}),
      ...(data.size !== undefined ? { size: data.size } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, resource: serializeAdminResource(row) });
}

/** DELETE /api/admin/resources/[id] — remove a resource (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.downloadResource.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "রিসোর্স পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.downloadResource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
