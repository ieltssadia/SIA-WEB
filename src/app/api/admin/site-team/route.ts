import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSiteTeamMember } from "@/lib/admin-serialize";
import { siteTeamSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/site-team — the public-facing team members (#/team page).
 * Any signed-in team member can read; writes are admin/owner.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.siteTeamMember.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    ok: true,
    members: rows.map(serializeAdminSiteTeamMember),
  });
}

/**
 * POST /api/admin/site-team — add a website team member (admin/owner).
 * Photos are uploaded through /api/admin/upload (folder=team) first.
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = siteTeamSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid member data.");
  }
  const data = parsed.data;

  const dup = await db.siteTeamMember.findUnique({ where: { slug: data.slug } });
  if (dup) {
    return badRequest("এই স্লাগে একজন সদস্য আছে, অন্য স্লাগ দিন।");
  }

  const row = await db.siteTeamMember.create({
    data: {
      slug: data.slug,
      name: data.name,
      role: data.role,
      tagline: data.tagline,
      photo: data.photo,
      chip: data.chip,
      bio: JSON.stringify(data.bio),
      specialties: JSON.stringify(data.specialties),
      credentials: JSON.stringify(data.credentials),
      stats: JSON.stringify(data.stats),
      quote: data.quote,
      published: data.published,
    },
  });

  return NextResponse.json(
    { ok: true, member: serializeAdminSiteTeamMember(row) },
    { status: 201 }
  );
}
