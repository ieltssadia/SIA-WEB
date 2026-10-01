import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth, unauthorized } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.trim();
    const query = searchParams.get("q")?.trim();

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { regNo: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { email: { contains: query, mode: "insensitive" } },
        { preferredCentre: { contains: query, mode: "insensitive" } },
      ];
    }

    const registrations = await db.ieltsRegistration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      registrations,
    });
  } catch (error) {
    console.error("[api/admin/ielts-registrations] GET failed:", error);
    return NextResponse.json(
      { ok: false, error: "রেজিস্ট্রেশন তালিকা লোড করা যায়নি।" },
      { status: 500 }
    );
  }
}
