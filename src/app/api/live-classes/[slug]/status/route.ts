import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Teacher status control for a live class — called by the classroom UI when
 * the teacher presses "Go Live" / "End Class". Must match the HOST_KEY in
 * mini-services/live-class-service/index.ts (the socket room state and the
 * DB schedule are updated together).
 */
const HOST_KEY = "SADIA-LIVE-2024";

const bodySchema = z.object({
  hostKey: z.string().min(1).max(100),
  status: z.enum(["live", "ended", "scheduled"]),
});

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (parsed.data.hostKey !== HOST_KEY) {
      return NextResponse.json(
        { ok: false, error: "ভুল host key — অনুমতি নেই। (Invalid host key.)" },
        { status: 403 }
      );
    }

    const existing = await db.liveClass.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "এই লাইভ ক্লাসটি খুঁজে পাওয়া যায়নি। (Live class not found.)" },
        { status: 404 }
      );
    }

    const updated = await db.liveClass.update({
      where: { slug },
      data: { status: parsed.data.status },
      select: { slug: true, status: true },
    });

    return NextResponse.json({ ok: true, class: updated });
  } catch (error) {
    console.error("[api/live-classes/[slug]/status] Failed:", error);
    return NextResponse.json(
      { ok: false, error: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
