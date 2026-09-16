import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminResource } from "@/lib/admin-serialize";
import { resourceSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/resources — portal downloadable resources (all rows).
 * Any signed-in team member can read; writes need admin/owner.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.downloadResource.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    ok: true,
    resources: rows.map(serializeAdminResource),
  });
}

/** POST /api/admin/resources — add a downloadable resource (admin/owner). */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = resourceSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid resource data.");
  }
  const data = parsed.data;

  const clash = await db.downloadResource.findFirst({
    where: { href: data.href, title: data.title },
  });
  if (clash) return badRequest("একই নাম ও ফাইলের রিসোর্স আগেই আছে।");

  const row = await db.downloadResource.create({
    data: {
      title: data.title,
      desc: data.desc,
      category: data.category,
      type: data.type,
      href: data.href,
      size: data.size,
      published: data.published,
    },
  });

  return NextResponse.json(
    { ok: true, resource: serializeAdminResource(row) },
    { status: 201 }
  );
}
