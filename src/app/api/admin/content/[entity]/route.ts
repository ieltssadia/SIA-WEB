import { NextResponse } from "next/server";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import {
  CONTENT_LABELS,
  contentEntities,
  findContentClash,
  isContentEntity,
} from "@/lib/admin-content";

/**
 * GET /api/admin/content/<entity> — list rows of one editable content
 * collection (tips | faqs | site-team | routine | gallery | suggestions).
 * Any signed-in team member can read; writes need admin/owner.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const { entity } = await params;
  if (!isContentEntity(entity)) return badRequest("Unknown content collection.");

  const def = contentEntities[entity];
  const rows = await def.list();
  return NextResponse.json({
    ok: true,
    // `row` is the Prisma row; the serializer narrows it per entity.
    rows: rows.map((row) => (def.serialize as (r: unknown) => unknown)(row)),
  });
}

/** POST /api/admin/content/<entity> — create a row (admin/owner). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { entity } = await params;
  if (!isContentEntity(entity)) return badRequest("Unknown content collection.");
  const def = contentEntities[entity];
  const label = CONTENT_LABELS[entity];

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = def.schema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data.");
  }
  const data = parsed.data;

  // Unique slug checks (site team + suggestions).
  const slug = (data as { slug?: string }).slug;
  if (slug) {
    const clash = await findContentClash(entity, "slug", slug);
    if (clash) return badRequest(`এই slug দিয়ে আগেই ${label} আছে, অন্যটা দিন।`);
  }

  try {
    const row = await def.create(data as never);
    return NextResponse.json(
      { ok: true, row: (def.serialize as (r: unknown) => unknown)(row) },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[api/admin/content/${entity}] POST failed:`, error);
    return badRequest(`${label} সেভ করা যায়নি, আবার চেষ্টা করুন।`);
  }
}
