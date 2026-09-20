import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorized, unauthorized } from "@/lib/admin-auth";
import type { AdminLead } from "@/lib/admin-types";

/**
 * GET /api/admin/leads — all enrollment / inquiry leads, newest first.
 * Statuses (schema): new | contacted | enrolled | closed.
 */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) return unauthorized();

  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const rows: AdminLead[] = leads.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      email: l.email,
      course: l.course,
      message: l.message,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, leads: rows });
  } catch (error) {
    console.error("[api/admin/leads] List failed:", error);
    return NextResponse.json(
      { ok: false, error: "লিড লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
