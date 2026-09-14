import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized, badRequest } from "@/lib/admin-auth";
import { ADMIN_LEAD_STATUSES } from "@/lib/admin-types";

const patchSchema = z.object({
  status: z.enum(ADMIN_LEAD_STATUSES as [string, ...string[]], {
    message: "স্ট্যাটাস হতে হবে new / contacted / enrolled / closed।",
  }),
});

/**
 * PATCH /api/admin/leads/[id] — { status } update from the leads list.
 * Statuses mirror the schema exactly: new | contacted | enrolled | closed.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid request.");

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid status.");
    }

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "লিডটি খুঁজে পাওয়া যায়নি। (Lead not found.)" },
        { status: 404 }
      );
    }

    await db.lead.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ ok: true, id, status: parsed.data.status });
  } catch (error) {
    console.error("[api/admin/leads] Patch failed:", error);
    return NextResponse.json(
      { ok: false, error: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
