import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  try {
    const { number } = await params;
    const bookNumber = Number(number);
    if (!Number.isInteger(bookNumber) || bookNumber < 1 || bookNumber > 19) {
      return NextResponse.json({ ok: false, error: "Unknown book number" }, { status: 404 });
    }
    const moduleParam = new URL(req.url).searchParams.get("module") ?? "academic";
    const edition = moduleParam === "general" ? "general" : "academic";

    const book = await db.cambridgeBook.findUnique({
      where: { number_module: { number: bookNumber, module: edition } },
      include: { tests: { orderBy: { number: "asc" } } },
    });
    if (!book) {
      return NextResponse.json({ ok: false, error: "Book not found" }, { status: 404 });
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
    console.error("GET /api/cambridge/books/[number] failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to load book" }, { status: 500 });
  }
}