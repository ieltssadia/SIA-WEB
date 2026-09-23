import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized, badRequest } from "@/lib/admin-auth";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin-types";

const patchSchema = z.object({
  status: z.enum(ADMIN_ORDER_STATUSES as [string, ...string[]], {
    message: "স্ট্যাটাস হতে হবে placed / confirmed / shipped / delivered / cancelled।",
  }),
});

/**
 * PATCH /api/admin/orders/[id] — { status } update from the orders table.
 * Statuses mirror the schema exactly: placed | confirmed | shipped |
 * delivered | cancelled.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized(req))) return unauthorized();

  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid request.");

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid status.");
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "অর্ডারটি খুঁজে পাওয়া যায়নি। (Order not found.)" },
        { status: 404 }
      );
    }

    await db.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ ok: true, id, status: parsed.data.status });
  } catch (error) {
    console.error("[api/admin/orders] Patch failed:", error);
    return NextResponse.json(
      { ok: false, error: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
