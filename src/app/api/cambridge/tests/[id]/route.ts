import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/cambridge/tests/[id]?skill=listening|reading|writing|speaking
 * Full interactive payload for ONE skill of one test — questions, answers,
 * explanations, transcripts, band-9 samples and audio paths. The player
 * scores client-side and computes the IELTS band from the raw score.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skillParam = new URL(req.url).searchParams.get("skill") ?? "listening";
    const skill = ["listening", "reading", "writing", "speaking"].includes(skillParam)
      ? skillParam
      : "listening";

    const test = await db.cambridgeTest.findUnique({
      where: { id },
      include: { book: true },
    });
    if (!test) {
      return NextResponse.json({ ok: false, error: "Test not found" }, { status: 404 });
    }

    const content = JSON.parse((test as unknown as Record<string, string>)[skill] || "{}");

    return NextResponse.json({
      ok: true,
      test: {
        id: test.id,
        number: test.number,
        book: {
          number: test.book.number,
          module: test.book.module,
          title: test.book.title,
          year: test.book.year,
        },
        skill,
        content,
      },
    });
  } catch (error) {
    console.error("GET /api/cambridge/tests/[id] failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to load test" }, { status: 500 });
  }
}