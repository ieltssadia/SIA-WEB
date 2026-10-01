import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuth, unauthorized } from "@/lib/admin-auth";

const patchSchema = z.object({
  status: z.enum(["new", "reviewing", "submitted", "registered", "rejected"]).optional(),
  paymentStatus: z.enum(["unpaid", "paid", "partial"]).optional(),
  examFee: z.number().int().nonnegative().optional().nullable(),
  receivedBy: z.string().trim().max(100).optional().nullable(),
  remarks: z.string().trim().max(500).optional().nullable(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  try {
    const { id } = await params;
    const registration = await db.ieltsRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ ok: false, error: "রেজিস্ট্রেশন পাওয়া যায়নি।" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, registration });
  } catch (error) {
    console.error("[api/admin/ielts-registrations/[id]] GET failed:", error);
    return NextResponse.json({ ok: false, error: "তথ্য লোড করা যায়নি।" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid data." }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data format." },
        { status: 400 }
      );
    }

    const updated = await db.ieltsRegistration.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, registration: updated });
  } catch (error) {
    console.error("[api/admin/ielts-registrations/[id]] PATCH failed:", error);
    return NextResponse.json({ ok: false, error: "আপডেট করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  try {
    const { id } = await params;
    await db.ieltsRegistration.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "রেজিস্ট্রেশন রেকর্ড মুছে ফেলা হয়েছে।" });
  } catch (error) {
    console.error("[api/admin/ielts-registrations/[id]] DELETE failed:", error);
    return NextResponse.json({ ok: false, error: "মুছে ফেলতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
