import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized, badRequest } from "@/lib/admin-auth";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin-types";

const patchSchema = z.object({
  status: z
    .enum(ADMIN_ORDER_STATUSES as [string, ...string[]], {
      message: "স্ট্যাটাস হতে হবে placed / confirmed / shipped / delivered / cancelled।",
    })
    .optional(),
  paymentStatus: z
    .enum(["pending", "verified", "paid", "failed"] as [string, ...string[]], {
      message: "পেমেন্ট স্ট্যাটাস হতে হবে pending / verified / paid / failed।",
    })
    .optional(),
  transactionId: z.string().trim().max(80).optional(),
});

/**
 * PATCH /api/admin/orders/[id] — update order status, payment status, or transaction ID.
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
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid data.");
    }

    const updateData: {
      status?: string;
      paymentStatus?: string;
      transactionId?: string;
    } = {};

    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.paymentStatus) updateData.paymentStatus = parsed.data.paymentStatus;
    if (parsed.data.transactionId !== undefined) {
      updateData.transactionId = parsed.data.transactionId;
    }

    if (Object.keys(updateData).length === 0) {
      return badRequest("কোনো পরিবর্তনের তথ্য পাওয়া যায়নি।");
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "অর্ডারটি খুঁজে পাওয়া যায়নি। (Order not found.)" },
        { status: 404 }
      );
    }

    const updated = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      id,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      transactionId: updated.transactionId,
    });
  } catch (error) {
    console.error("[api/admin/orders] Patch failed:", error);
    return NextResponse.json(
      { ok: false, error: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
