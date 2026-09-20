import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSiteTeamMember } from "@/lib/admin-serialize";
import { siteTeamSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/site-team/[id] — edit a website team member (admin/owner).
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

  const parsed = siteTeamSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid member data.");
  }
  const data = parsed.data;

  const existing = await db.siteTeamMember.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "সদস্য পাওয়া যায়নি।" }, { status: 404 });
  }

  if (data.slug && data.slug !== existing.slug) {
    const dup = await db.siteTeamMember.findUnique({ where: { slug: data.slug } });
    if (dup) return badRequest("এই স্লাগে আরেকজন সদস্য আছে — অন্য স্লাগ দিন।");
  }

  const row = await db.siteTeamMember.update({
    where: { id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
      ...(data.photo !== undefined ? { photo: data.photo } : {}),
      ...(data.chip !== undefined ? { chip: data.chip } : {}),
      ...(data.bio !== undefined ? { bio: JSON.stringify(data.bio) } : {}),
      ...(data.specialties !== undefined
        ? { specialties: JSON.stringify(data.specialties) }
        : {}),
      ...(data.credentials !== undefined
        ? { credentials: JSON.stringify(data.credentials) }
        : {}),
      ...(data.stats !== undefined ? { stats: JSON.stringify(data.stats) } : {}),
      ...(data.quote !== undefined ? { quote: data.quote } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json({ ok: true, member: serializeAdminSiteTeamMember(row) });
}

/** DELETE /api/admin/site-team/[id] — remove a website team member. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.siteTeamMember.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "সদস্য পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.siteTeamMember.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
