import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized, badRequest } from "@/lib/admin-auth";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin-types";
import type { AdminOrder, AdminOrderItem } from "@/lib/admin-types";

const listQuerySchema = z.object({
  status: z.enum(ADMIN_ORDER_STATUSES as [string, ...string[]]).optional(),
  q: z.string().trim().max(80).optional(),
});

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

function serializeOrder(
  o: OrderWithItems & { student?: { id: string; name: string; phone: string } | null }
): AdminOrder {
  const items: AdminOrderItem[] = o.items.map((i) => ({
    id: i.id,
    slug: i.slug,
    title: i.title,
    price: i.price,
    quantity: i.quantity,
    lineTotal: i.lineTotal,
  }));
  return {
    id: o.id,
    orderNo: o.orderNo,
    name: o.name,
    phone: o.phone,
    email: o.email,
    zone: o.zone,
    address: o.address,
    note: o.note,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    paymentMethod: o.paymentMethod,
    transactionId: o.transactionId,
    paymentStatus: o.paymentStatus,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items,
    itemCount: items.length,
    // Order has no studentId column — the portal account is matched by phone.
    student: o.student ?? null,
  };
}

/**
 * GET /api/admin/orders?status=&q= — all orders (newest first) with line
 * items + the portal student matched by phone. `q` searches order number,
 * customer name or phone; `status` filters by the schema status enum.
 */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) return unauthorized();

  try {
    const url = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
    });
    if (!parsed.success) return badRequest("Invalid status or search query.");

    const orders = await db.order.findMany({
      where: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.q
          ? {
              OR: [
                { orderNo: { contains: parsed.data.q } },
                { name: { contains: parsed.data.q } },
                { phone: { contains: parsed.data.q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    // Resolve portal student accounts for the phones on these orders.
    const phones = Array.from(new Set(orders.map((o) => o.phone)));
    const students = phones.length
      ? await db.student.findMany({
          where: { phone: { in: phones } },
          select: { id: true, name: true, phone: true },
        })
      : [];
    const byPhone = new Map(students.map((s) => [s.phone, s]));

    const rows: AdminOrder[] = orders.map((o) =>
      serializeOrder({ ...o, student: byPhone.get(o.phone) ?? null })
    );

    return NextResponse.json({ ok: true, orders: rows });
  } catch (error) {
    console.error("[api/admin/orders] List failed:", error);
    return NextResponse.json(
      { ok: false, error: "অর্ডার লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
