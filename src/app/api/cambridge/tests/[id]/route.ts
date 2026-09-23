import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCambridgeTestSkillData } from "@/lib/cambridge-catalog";

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

    let test = null;
    try {
      test = await db.cambridgeTest.findUnique({
        where: { id },
        include: { book: true },
      });
    } catch {
      // Ignore database connection failures in dev or fallback mode
    }

    if (!test) {
      // Fallback test object so practice is always immediately accessible
      const fallbackContent = getCambridgeTestSkillData(skill, 19, 1);
      return NextResponse.json({
        ok: true,
        test: {
          id,
          number: 1,
          book: {
            number: 19,
            module: "academic",
            title: "Cambridge IELTS 19 Academic",
            year: 2024,
          },
          skill,
          content: fallbackContent,
        },
      });
    }

    let content: any = {};
    try {
      content = JSON.parse((test as unknown as Record<string, string>)[skill] || "{}");
    } catch {
      content = {};
    }

    // If DB content has no questions or is incomplete, use the rich authentic Cambridge catalog
    const isListeningSparse = skill === "listening" && (!content?.parts || content.parts.length === 0 || !content.parts[0]?.questions?.length);
    const isReadingSparse = skill === "reading" && (!content?.passages || content.passages.length === 0 || !content.passages[0]?.questions?.length);
    const isWritingSparse = skill === "writing" && (!content?.task1 || !content?.task2);
    const isSpeakingSparse = skill === "speaking" && (!content?.part1 || !content?.part2);

    if (isListeningSparse || isReadingSparse || isWritingSparse || isSpeakingSparse) {
      content = getCambridgeTestSkillData(skill, test.book.number, test.number) || content;
    }

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