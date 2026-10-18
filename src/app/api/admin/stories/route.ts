import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSuccessStory } from "@/lib/admin-serialize";
import { successStorySchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/stories — student success stories and scorecards.
 * Any signed-in team member can view.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.successStory.findMany({ orderBy: [{ serial: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ ok: true, stories: rows.map(serializeAdminSuccessStory) });
}

/**
 * POST /api/admin/stories — add a new success story / scorecard.
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");

  const parsed = successStorySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid story data.");
  }
  const data = parsed.data;

  const row = await db.successStory.create({
    data: {
      name: data.name,
      band: data.band,
      tag: data.tag,
      caption: data.caption,
      details: data.details,
      image: data.image,
      course: data.course,
      serial: data.serial,
      published: data.published,
    },
  });

  return NextResponse.json({ ok: true, story: serializeAdminSuccessStory(row) }, { status: 201 });
}
