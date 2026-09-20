import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/cambridge/books
 * The full Cambridge IELTS catalog — one row per book edition with its
 * test count, ordered newest book first. Powers the library grid.
 */
export async function GET() {
  try {
    const books = await db.cambridgeBook.findMany({
      orderBy: [{ number: "desc" }, { module: "asc" }],
      include: { _count: { select: { tests: true } } },
    });
    return NextResponse.json({
      ok: true,
      books: books.map((b) => ({
        id: b.id,
        number: b.number,
        module: b.module,
        title: b.title,
        year: b.year,
        accent: b.accent,
        blurb: b.blurb,
        testCount: b._count.tests,
      })),
    });
  } catch (error) {
    console.error("GET /api/cambridge/books failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to load Cambridge books" }, { status: 500 });
  }
}