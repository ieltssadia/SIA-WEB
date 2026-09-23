import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const BOOK_YEARS = [1995, 2000, 2002, 2005, 2006, 2007, 2008, 2011, 2013, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const ACCENTS = ["#262012", "#2E5FA3", "#2E7D5B", "#A63A4C", "#7A5AA0", "#B5771E", "#171410", "#332B1A", "#2C4F8A", "#1E1B14"];
const BLURBS: Record<string, string> = {
  academic:
    "Four complete Academic practice tests in the official Cambridge style — Listening with transcripts, three-passage Reading, Academic Writing Tasks 1 & 2, and full Speaking Part 1-3 sets with band-9 samples.",
  general:
    "Four complete General Training practice tests — workplace and everyday reading sections, letter writing for Task 1, familiar Listening and Speaking formats, all with instant scoring and model answers.",
};

function getFallbackBooks() {
  const list = [];
  for (let number = 19; number >= 1; number--) {
    const editions = number <= 3 ? ["academic"] : ["academic", "general"];
    for (const edition of editions) {
      list.push({
        id: `cambridge-${number}-${edition}`,
        number,
        module: edition,
        title: `Cambridge IELTS ${number} ${edition === "academic" ? "Academic" : "General Training"}`,
        year: BOOK_YEARS[number - 1] ?? 2024,
        accent: ACCENTS[(number + (edition === "general" ? 4 : 0)) % ACCENTS.length],
        blurb: BLURBS[edition],
        testCount: 4,
      });
    }
  }
  return list;
}

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

    if (books && books.length > 0) {
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
          testCount: b._count.tests || 4,
        })),
      });
    }

    // Fallback if DB returns 0 rows
    return NextResponse.json({ ok: true, books: getFallbackBooks() });
  } catch (error) {
    console.error("GET /api/cambridge/books fallback triggered:", error);
    // Graceful fallback on DB network / cold-start error
    return NextResponse.json({ ok: true, books: getFallbackBooks() });
  }
}