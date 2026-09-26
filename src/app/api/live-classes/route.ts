import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { LiveClassListItem } from "@/lib/live-types";

/**
 * Demo schedule seed — inserted on first GET so the #/live page is
 * demonstrable immediately. One class is already LIVE, one is finished,
 * two are upcoming (times are seeded relative to seed time).
 */
const SEED_CLASSES: Array<{
  slug: string;
  title: string;
  courseSlug: string | null;
  teacher: string;
  description: string;
  offsetMinutes: number; // relative to seed time
  durationMin: number;
  status: "scheduled" | "live" | "ended";
  slides: Array<{ title: string; bullets: string[] }>;
}> = [
  {
    slug: "speaking-cue-card-marathon",
    title: "Speaking Cue Card Marathon: Part 2 Mastery",
    courseSlug: "basic-to-ielts",
    teacher: "Sadia Ma'am",
    description:
      "Part 2 cue card নিয়ে ভয়? আজকের ম্যারাথনে live practice + instant feedback, Band 7+ fluency strategy সহ।",
    offsetMinutes: -15,
    durationMin: 60,
    status: "live",
    slides: [
      {
        title: "Cue Card: Describe a person who inspired you",
        bullets: [
          "Who this person is",
          "How you know them",
          "What qualities make them special",
          "Explain how they influenced your life",
        ],
      },
      {
        title: "Fluency-এর ৩টি নিয়ম",
        bullets: [
          "থামবেন না, fillers ব্যবহার করুন: well, actually, you know",
          "ছোট বাক্যে শুরু করুন, ধীরে জটিল structure-এ যান",
          "প্রতিদিন ২ মিনিট নিজের সাথে speaking practice",
        ],
      },
      {
        title: "Band 7+ Vocabulary Bank",
        bullets: [
          "role model = someone you look up to",
          "deeply influenced = shaped my mindset",
          "heritage = cultural background",
        ],
      },
      {
        title: "Live Practice Round 🎙️",
        bullets: [
          "প্রত্যেকে ২ মিনিট cue card প্র্যাকটিস করুন",
          "Chat-এ আপনার ব্যবহার করা vocabulary লিখুন",
          "Sadia Ma'am live feedback দেবেন",
        ],
      },
    ],
  },
  {
    slug: "writing-task2-masterclass",
    title: "Writing Task 2 Masterclass: Band 7 Essays",
    courseSlug: "basic-to-ielts",
    teacher: "Sadia Ma'am",
    description:
      "Opinion essay এর proven structure, Band 7+ linking words আর examiner যা দেখে, সব এক ক্লাসে।",
    offsetMinutes: 60 * 26, // tomorrow evening
    durationMin: 75,
    status: "scheduled",
    slides: [
      {
        title: "Task 2: The 4-Paragraph Formula",
        bullets: [
          "Introduction: paraphrase + clear thesis",
          "Body 1: topic sentence + example",
          "Body 2: second idea + evidence",
          "Conclusion: no new ideas, restate position",
        ],
      },
      {
        title: "Band 7 Linking Words",
        bullets: [
          "Concession: admittedly, nevertheless",
          "Cause-effect: consequently, as a result",
          "Emphasis: crucially, most importantly",
        ],
      },
      {
        title: "Examiner যা দেখে",
        bullets: ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"],
      },
    ],
  },
  {
    slug: "listening-strategy-session",
    title: "Listening Strategy Session: Section 3 & 4 Hacks",
    courseSlug: "ielts-crash-course",
    teacher: "Sadia Ma'am",
    description:
      "Section 3-4 এ মনোযোগ হারান? Prediction technique, paraphrase trapping আর spelling traps নিয়ে ফুল সেশন।",
    offsetMinutes: 60 * 24 * 3, // in 3 days
    durationMin: 60,
    status: "scheduled",
    slides: [
      {
        title: "Section 4: Prediction Technique",
        bullets: [
          "Question word দেখে answer type অনুমান করুন",
          "Number? Name? Noun?, আগেই ঠিক করুন",
          "Answer আসার আগেই কান ধারালো করুন",
        ],
      },
      {
        title: "Paraphrase Traps",
        bullets: [
          "Audio কখনো সরাসরি question এর শব্দ বলে না",
          "Synonym শুনলেই সতর্ক হোন",
          "Speaker মাঝপথে মত বদলায়, শেষ কথাটাই answer",
        ],
      },
    ],
  },
  {
    slug: "free-demo-ielts-roadmap",
    title: "Free Demo Class: IELTS-এ 7+ স্কোরের রুটম্যাপ",
    courseSlug: "free-course",
    teacher: "Sadia Ma'am",
    description: "নতুনদের জন্য ফ্রি ডেমো ক্লাস, ৩০ দিনের study plan, exam pattern আর common mistakes।",
    offsetMinutes: -60 * 24, // yesterday
    durationMin: 45,
    status: "ended",
    slides: [
      {
        title: "IELTS-এ 7+ এর রুটম্যাপ",
        bullets: [
          "প্রথমে current level মাপুন (free mock)",
          "৪ দক্ষতা আলাদা plan এ উন্নত করুন",
          "প্রতি সপ্তাহে full mock + review",
        ],
      },
    ],
  },
];

async function ensureSeeded() {
  const count = await db.liveClass.count();
  if (count > 0) return;
  const now = Date.now();
  await db.liveClass.createMany({
    data: SEED_CLASSES.map((c) => ({
      slug: c.slug,
      title: c.title,
      courseSlug: c.courseSlug,
      teacher: c.teacher,
      description: c.description,
      startsAt: new Date(now + c.offsetMinutes * 60_000),
      durationMin: c.durationMin,
      status: c.status,
      slides: JSON.stringify(c.slides),
    })),
  });
}

export async function GET() {
  try {
    await ensureSeeded();

    const rows = await db.liveClass.findMany({
      orderBy: { startsAt: "asc" },
      select: {
        slug: true,
        title: true,
        courseSlug: true,
        teacher: true,
        description: true,
        startsAt: true,
        durationMin: true,
        status: true,
      },
    });

    const classes: LiveClassListItem[] = rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      courseSlug: r.courseSlug,
      teacher: r.teacher,
      description: r.description,
      startsAt: r.startsAt.toISOString(),
      durationMin: r.durationMin,
      status: (["scheduled", "live", "ended"].includes(r.status) ? r.status : "scheduled") as LiveClassListItem["status"],
    }));

    return NextResponse.json({ ok: true, classes });
  } catch (error) {
    console.error("[api/live-classes] List failed:", error);
    return NextResponse.json(
      { ok: false, error: "লাইভ ক্লাস লিস্ট লোড করতে সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
