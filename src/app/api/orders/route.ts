import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { books } from "@/lib/site-data";
import { canonicalPhone } from "@/lib/phone";
import { DELIVERY_ZONES, deliveryFeeFor, zoneLabel } from "@/lib/delivery";
import { sendOrderConfirmationEmail } from "@/lib/email";

const zoneValues = DELIVERY_ZONES.map((z) => z.value) as [string, ...string[]];

const orderSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(80),
  phone: z
    .string()
    .trim()
    .min(10, "সঠিক মোবাইল নম্বর দিন, যেমন 01712345678।")
    .max(20, "সঠিক মোবাইল নম্বর দিন, যেমন 01712345678।")
    .transform(canonicalPhone)
    .refine((p) => /^01[3-9]\d{8}$/.test(p), "সঠিক মোবাইল নম্বর দিন, যেমন 01712345678।"),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  zone: z.enum(zoneValues),
  address: z.string().trim().max(400).optional().or(z.literal("")),
  note: z.string().trim().max(400).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(80),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, "Cart is empty.")
    .max(12),
  paymentMethod: z.enum(["bKash", "Nagad", "Cash on Delivery"]),
  transactionId: z.string().trim().max(60).optional().or(z.literal("")),
});

function makeOrderNo(): string {
  const d = new Date();
  const ymd = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SIE-${ymd}-${rand}`;
}

function serializeOrder(order: {
  orderNo: string;
  name: string;
  phone: string;
  email: string | null;
  zone: string;
  address: string | null;
  note: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  transactionId: string | null;
  paymentStatus: string;
  status: string;
  createdAt: Date;
  items: { slug: string; title: string; price: number; quantity: number; lineTotal: number }[];
}) {
  return {
    orderNo: order.orderNo,
    name: order.name,
    phone: order.phone,
    email: order.email,
    zone: order.zone,
    zoneLabel: zoneLabel(order.zone),
    address: order.address,
    note: order.note,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    transactionId: order.transactionId,
    paymentStatus: order.paymentStatus,
    status: order.status,
    placedAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      slug: i.slug,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
  };
}

/**
 * Place a Book Shop order. The client only sends {slug, quantity} — prices,
 * discounts, delivery fee and totals are recomputed server-side from the
 * catalog so the payload can never be tampered with. Payment is recorded as
 * "pending": manual send-money / COD today, an online gateway (bKash PGW /
 * SSLCommerz) can later confirm via webhook by orderNo.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please check the order form.";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const data = parsed.data;
    const zone = DELIVERY_ZONES.find((z) => z.value === data.zone)!;

    if (zone.courier && (!data.address || data.address.length < 8)) {
      return NextResponse.json(
        { error: "Courier delivery-এর জন্য সম্পূর্ণ ঠিকানা লিখুন (house/road/area)." },
        { status: 400 }
      );
    }

    // Server-side pricing — the single source of truth is the catalog. Books
    // managed in the admin CMS (DB) win; static site-data is the fallback.
    // Delisted books can no longer be ordered.
    const dbBooks = await db.book.findMany();
    const findBook = (slug: string) => {
      const managed = dbBooks.find((b) => b.slug === slug);
      if (managed) {
        return managed.listed
          ? { slug: managed.slug, title: managed.title, price: managed.price }
          : null;
      }
      const fallback = books.find((b) => b.slug === slug);
      return fallback ? { slug: fallback.slug, title: fallback.title, price: fallback.price } : null;
    };
    const lines: {
      kind: "book";
      slug: string;
      title: string;
      price: number;
      quantity: number;
      lineTotal: number;
    }[] = [];
    for (const item of data.items) {
      const book = findBook(item.slug);
      if (!book) {
        return NextResponse.json(
          { error: `"${item.slug}" is no longer available, please refresh your cart.` },
          { status: 400 }
        );
      }
      lines.push({
        kind: "book",
        slug: book.slug,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
        lineTotal: book.price * item.quantity,
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const deliveryFee = deliveryFeeFor(zone.value, subtotal);
    const total = subtotal + deliveryFee;

    // Generate a collision-safe order number (unique index retry).
    let order: Awaited<ReturnType<typeof createOrder>> | null = null;
    for (let attempt = 0; attempt < 4 && !order; attempt++) {
      try {
        order = await createOrder(data, lines, subtotal, deliveryFee, total);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("Unique constraint")) continue; // orderNo collision → retry
        throw error;
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Could not generate an order number, please try again." },
        { status: 500 }
      );
    }

    // Best-effort transactional email via Resend
    sendOrderConfirmationEmail({
      orderNo: order.orderNo,
      name: order.name,
      phone: order.phone,
      email: order.email || undefined,
      total: order.total,
      items: order.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
    }).catch((err) => console.error("Resend order confirmation failed:", err));

    return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    console.error("[api/orders] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong placing the order, please try again in a moment." },
      { status: 500 }
    );
  }
}

function createOrder(
  data: {
    name: string;
    phone: string;
    email?: string;
    zone: string;
    address?: string;
    note?: string;
    paymentMethod: string;
    transactionId?: string;
  },
  lines: { kind: string; slug: string; title: string; price: number; quantity: number; lineTotal: number }[],
  subtotal: number,
  deliveryFee: number,
  total: number
) {
  return db.order.create({
    data: {
      orderNo: makeOrderNo(),
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      zone: data.zone,
      address: data.address || null,
      note: data.note || null,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId || null,
      paymentStatus: "pending",
      status: "placed",
      items: {
        create: lines.map((l) => ({
          kind: l.kind,
          slug: l.slug,
          title: l.title,
          price: l.price,
          quantity: l.quantity,
          lineTotal: l.lineTotal,
        })),
      },
    },
    include: { items: true },
  });
}

/**
 * Order tracking: GET /api/orders?orderNo=SIE-250604-8412&phone=01XXXXXXXXX
 * Phone must match the order (privacy). Used by the receipt refresh and —
 * once the online gateway is live — by its return/callback page.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderNo = (url.searchParams.get("orderNo") ?? "").trim().toUpperCase();
    const phone = canonicalPhone(url.searchParams.get("phone") ?? "");

    if (!/^SIE-\d{6}-\d{4}$/.test(orderNo) || !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "Order number and the phone used at checkout are required." },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { orderNo },
      include: { items: true },
    });
    if (!order || order.phone !== phone) {
      return NextResponse.json(
        { error: "No order found for this number & phone combination." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error("[api/orders] Lookup failed:", error);
    return NextResponse.json({ error: "Lookup failed, please try again." }, { status: 500 });
  }
}
