import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import {
  CONTENT_LABELS,
  contentEntities,
  findContentClash,
  isContentEntity,
} from "@/lib/admin-content";

type Ctx = { params: Promise<{ entity: string; id: string }> };

/**
 * PATCH /api/admin/content/<entity>/<id> — edit any field of one content row
 * (admin/owner). Partial body: every key is optional.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { entity, id } = await params;
  if (!isContentEntity(entity)) return badRequest("Unknown content collection.");
  const def = contentEntities[entity];
  const label = CONTENT_LABELS[entity];

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = def.schema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data.");
  }
  const data = parsed.data;

  const existing = await def.find(id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: `${label} পাওয়া যায়নি।` }, { status: 404 });
  }

  const slug = (data as { slug?: string }).slug;
  const existingSlug = (existing as { slug?: string }).slug;
  if (slug && slug !== existingSlug) {
    const clash = await findContentClash(entity, "slug", slug);
    if (clash) return badRequest(`এই slug দিয়ে আগেই ${label} আছে, অন্যটা দিন।`);
  }

  try {
    const row = await def.update(id, data as never);
    return NextResponse.json({
      ok: true,
      row: (def.serialize as (r: unknown) => unknown)(row),
    });
  } catch (error) {
    console.error(`[api/admin/content/${entity}/${id}] PATCH failed:`, error);
    return badRequest(`${label} সেভ করা যায়নি, আবার চেষ্টা করুন।`);
  }
}

/** DELETE /api/admin/content/<entity>/<id> — remove a content row (admin/owner). */
export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { entity, id } = await params;
  if (!isContentEntity(entity)) return badRequest("Unknown content collection.");
  const def = contentEntities[entity];
  const label = CONTENT_LABELS[entity];

  const existing = await def.find(id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: `${label} পাওয়া যায়নি।` }, { status: 404 });
  }

  try {
    await def.remove(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[api/admin/content/${entity}/${id}] DELETE failed:`, error);
    return badRequest(`${label} মোছা যায়নি, আবার চেষ্টা করুন।`);
  }
}
