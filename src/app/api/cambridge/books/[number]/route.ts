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

function getFallbackSingleBook(bookNumber: number, edition: "academic" | "general") {
  return {
    id: `cambridge-${bookNumber}-${edition}`,
    number: bookNumber,
    module: edition,
    title: `Cambridge IELTS ${bookNumber} ${edition === "academic" ? "Academic" : "General Training"}`,
    year: BOOK_YEARS[bookNumber - 1] ?? 2024,
    accent: ACCENTS[(bookNumber + (edition === "general" ? 4 : 0)) % ACCENTS.length],
    blurb: BLURBS[edition],
    tests: [1, 2, 3, 4].map((tNum) => ({
      id: `test-${bookNumber}-${edition}-${tNum}`,
      number: tNum,
      listening: {
        durationMin: 40,
        parts: [
          { title: "Part 1 — Everyday Social Conversation", qCount: 10 },
          { title: "Part 2 — Local Community Monologue", qCount: 10 },
          { title: "Part 3 — Academic Discussion", qCount: 10 },
          { title: "Part 4 — University Lecture", qCount: 10 },
        ],
      },
      reading: {
        durationMin: 60,
        kind: edition,
        passages: [
          { title: "Passage 1 — Science & History", qCount: 13 },
          { title: "Passage 2 — Technology & Nature", qCount: 13 },
          { title: "Passage 3 — Society & Innovation", qCount: 14 },
        ],
      },
      writing: {
        task1Kind: edition === "general" ? "letter" : "chart",
        task1Prompt: edition === "general" ? "Write a letter to a friend or manager regarding..." : "Summarise the information presented in the graph...",
        task2Prompt: "Some people believe that modern technology has made communication easier, while others disagree. Discuss both views and give your opinion.",
      },
      speaking: {
        part1Topic: "Hometown & Daily Life",
        part2Prompt: "Describe a memorable experience you had recently.",
      },
    })),
  };
}

/**
 * GET /api/cambridge/books/[number]?module=academic|general
 * One book edition + its four tests in "shelf metadata" form: skill
 * durations, part/passage titles and question counts — everything the
 * book page needs WITHOUT shipping the answers/explanations.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  let bookNumber = 1;
  let edition: "academic" | "general" = "academic";
  try {
    const { number } = await params;
    bookNumber = Number(number);
    if (!Number.isInteger(bookNumber) || bookNumber < 1 || bookNumber > 19) {
      return NextResponse.json({ ok: false, error: "Unknown book number" }, { status: 404 });
    }
    const moduleParam = new URL(req.url).searchParams.get("module") ?? "academic";
    edition = moduleParam === "general" ? "general" : "academic";

    const book = await db.cambridgeBook.findUnique({
      where: { number_module: { number: bookNumber, module: edition } },
      include: { tests: { orderBy: { number: "asc" } } },
    });
    if (!book || !book.tests || book.tests.length === 0) {
      return NextResponse.json({ ok: true, book: getFallbackSingleBook(bookNumber, edition) });
    }

    return NextResponse.json({
      ok: true,
      book: {
        id: book.id,
        number: book.number,
        module: book.module,
        title: book.title,
        year: book.year,
        accent: book.accent,
        blurb: book.blurb,
        tests: book.tests.map((t) => {
          const listening = JSON.parse(t.listening || "{}") as {
            durationMin?: number;
            parts?: Array<{ title: string; questions: unknown[] }>;
          };
          const reading = JSON.parse(t.reading || "{}") as {
            durationMin?: number;
            kind?: string;
            passages?: Array<{ title: string; questions: unknown[] }>;
          };
          const writing = JSON.parse(t.writing || "{}") as {
            task1?: { kind?: string; prompt?: string };
            task2?: { prompt?: string };
          };
          const speaking = JSON.parse(t.speaking || "{}") as {
            part1?: { topic?: string };
            part2?: { prompt?: string };
          };
          return {
            id: t.id,
            number: t.number,
            listening: {
              durationMin: listening.durationMin ?? 40,
              parts: (listening.parts ?? []).map((p) => ({
                title: p.title,
                qCount: Array.isArray(p.questions) ? p.questions.length : 0,
              })),
            },
            reading: {
              durationMin: reading.durationMin ?? 60,
              kind: reading.kind ?? edition,
              passages: (reading.passages ?? []).map((p) => ({
                title: p.title,
                qCount: Array.isArray(p.questions) ? p.questions.length : 0,
              })),
            },
            writing: {
              task1Kind: writing.task1?.kind ?? "report",
              task1Prompt: writing.task1?.prompt ?? "",
              task2Prompt: writing.task2?.prompt ?? "",
            },
            speaking: {
              part1Topic: speaking.part1?.topic ?? "",
              part2Prompt: speaking.part2?.prompt ?? "",
            },
          };
        }),
      },
    });
  } catch (error) {
    console.error("GET /api/cambridge/books/[number] fallback triggered:", error);
    return NextResponse.json({ ok: true, book: getFallbackSingleBook(bookNumber, edition) });
  }
}