import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { siteSettingsSchema } from "@/lib/admin-schemas";

/**
 * GET /api/admin/settings — the editable site-wide settings blob (key "site").
 * Returns the stored values; the admin Settings form edits them. Any signed-in
 * team member can read; writes need admin/owner.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const row = await db.siteSetting.findUnique({ where: { key: "site" } });
  if (!row) return NextResponse.json({ ok: true, settings: null });
  try {
    return NextResponse.json({ ok: true, settings: JSON.parse(row.value) });
  } catch {
    return NextResponse.json({ ok: true, settings: null });
  }
}

/** PUT /api/admin/settings — replace the settings blob (admin/owner). */
export async function PUT(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = z.object({ settings: siteSettingsSchema }).safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid settings data.");
  }

  const value = JSON.stringify(parsed.data.settings);
  await db.siteSetting.upsert({
    where: { key: "site" },
    update: { value },
    create: { key: "site", value },
  });

  return NextResponse.json({ ok: true, settings: parsed.data.settings });
}
