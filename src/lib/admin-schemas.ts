/**
 * Zod schemas shared by the admin CMS API routes — kept in one place so the
 * collection routes and their [id] sub-routes stay in sync.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "স্লাগ কমপক্ষে ২ অক্ষরের।")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "স্লাগে ছোট হাতের a-z, 0-9 ও ড্যাশ (-) ব্যবহার করুন।"),
  title: z.string().trim().min(3, "কোর্সের নাম দিন।").max(120),
  titleBn: z.string().trim().max(160).default(""),
  desc: z.string().trim().max(1200).default(""),
  lessons: z.number().int().min(1).max(200),
  duration: z.string().trim().max(60).default(""),
  price: z
    .number()
    .int("দাম পূর্ণসংখ্যা হতে হবে (৳)।")
    .min(0)
    .max(500000)
    .nullable(),
  oldPrice: z.number().int().min(0).max(500000).nullable(),
  tag: z.string().trim().max(40).default(""),
  icon: z.string().trim().max(30).default("book"),
  features: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  category: z.enum(["complete", "beginner", "exam"]),
  rating: z.number().min(0).max(5),
  students: z.number().int().min(0).max(1000000),
  nextBatch: z.string().trim().max(60).default(""),
  mode: z.string().trim().max(60).default(""),
  scheduleNote: z.string().trim().max(200).default(""),
  seatsLeft: z.number().int().min(0).max(999).nullable(),
  seatsTotal: z.number().int().min(0).max(999).nullable(),
  accessPeriod: z.string().trim().max(80).nullable(),
  syllabus: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  published: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Shop books
// ---------------------------------------------------------------------------

export const bookSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "স্লাগ কমপক্ষে ২ অক্ষরের।")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "স্লাগে ছোট হাতের a-z, 0-9 ও ড্যাশ (-) ব্যবহার করুন।"),
  title: z.string().trim().min(3, "বইয়ের নাম দিন।").max(160),
  titleBn: z.string().trim().max(160).default(""),
  author: z.string().trim().max(80).default("Sadia Rahman"),
  desc: z.string().trim().max(1200).default(""),
  price: z
    .number()
    .int("দাম পূর্ণসংখ্যা হতে হবে (৳)।")
    .min(0, "দাম ০ বা তার বেশি হতে হবে।")
    .max(100000),
  oldPrice: z.number().int().min(0).max(100000).nullable(),
  category: z.enum([
    "reading",
    "writing",
    "speaking",
    "listening",
    "vocabulary",
    "mock",
  ]),
  cover: z
    .string()
    .trim()
    .max(300)
    .regex(/^\/images\/.+\.(png|jpg|jpeg|webp)$/i, "কভারটি /images/-এর একটি ছবি হতে হবে।"),
  tag: z.string().trim().max(40).nullable(),
  pages: z.number().int().min(0).max(5000).default(0),
  highlights: z.array(z.string().trim().min(1).max(140)).max(8).default([]),
  listed: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Portal downloadable resources
// ---------------------------------------------------------------------------

export const resourceSchema = z.object({
  title: z.string().trim().min(3, "রিসোর্সের নাম দিন।").max(140),
  desc: z.string().trim().max(400).default(""),
  category: z.enum(["writing", "speaking", "vocabulary", "mock-tools"]),
  type: z.enum(["PDF", "ZIP", "DOCX", "IMG"]).default("PDF"),
  href: z
    .string()
    .trim()
    .min(2, "ফাইলের লিংক দিন।")
    .max(300)
    .regex(/^\//, "লিংকটি সাইটের ভেতরের পাথ হতে হবে (যেমন /downloads/file.pdf)।"),
  size: z.string().trim().max(20).default(""),
  published: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Portal notices
// ---------------------------------------------------------------------------

export const noticeSchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "তারিখ দিন (YYYY-MM-DD)।"),
  tag: z.enum(["Notice", "Class Update", "Mock Test", "Speaking Club"]),
  title: z.string().trim().min(4, "নোটিশের শিরোনাম দিন।").max(160),
  body: z.string().trim().min(4, "নোটিশের বিবরণ দিন।").max(1200),
});

/** ISO "2025-09-10" → "10 Sep" (the Notice.date display format). */
export function noticeDateToDisplay(value: string): string {
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getUTCDate()} ${d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`;
}
