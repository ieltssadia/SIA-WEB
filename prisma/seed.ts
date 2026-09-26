/**
 * Seed demo data: student accounts + enrollments + mock results, admin team
 * members (owner/admin/teacher) and the managed CMS catalog (courses, shop
 * books, portal resources, notices). Run: bun prisma/seed.ts
 *
 * Accounts are created at enrollment time (phone + password). Rakib Hasan has
 * an account but NO enrollment — his portal is intentionally empty.
 */
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import {
  books,
  classRoutine,
  courses,
  portalDownloads,
  portalNotices,
  teamMembers,
  tips,
} from "../src/lib/site-data";

const db = new PrismaClient();

/** Must match hashPassword() in src/lib/portal-server.ts */
function hashPassword(phone: string, password: string): string {
  return createHash("sha256").update(`${phone}:${password}`).digest("hex");
}

/** Must match hashAdminPassword() in src/lib/admin-auth.ts */
function hashAdminPassword(email: string, password: string): string {
  return createHash("sha256").update(`${email}:${password}`).digest("hex");
}

const DEMO_PASSWORD = "sadia123";

// Admin CMS team — roles: owner (everything), admin (no team mgmt),
// teacher (classes/students/certs/notices). Upserts keep edited logins.
const team = [
  { name: "Sadia Rahman", email: "sadia@team.com", password: "owner123", role: "owner" },
  { name: "Rezaul Karim", email: "admin@team.com", password: "admin123", role: "admin" },
  { name: "Tanvir Ahmed", email: "teacher@team.com", password: "teacher123", role: "teacher" },
];

type SeedStudent = {
  name: string;
  phone: string;
  enrollments: {
    courseSlug: string;
    batch: string;
    targetBand: string | null;
    examDate: string | null;
    progress: number;
    attendance: number;
    status: string;
  }[];
  mocks: {
    label: string;
    date: string;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    overall: number;
  }[];
  /** Optional completion certificate issued to this account. */
  certificate?: {
    id: string;
    course: string;
    batch: string;
    band: string;
    issued: string;
  };
};

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const students: SeedStudent[] = [
  {
    name: "Anika Tasnim",
    phone: "01712000001",
    // Completed foundation course (earns her portal certificate) + two
    // active enrollments — multi-course portal demo
    enrollments: [
      {
        courseSlug: "spoken-english-course",
        batch: "Batch 311",
        targetBand: "7.5",
        examDate: "2025-03-18",
        progress: 100,
        attendance: 96,
        status: "completed",
      },
      {
        courseSlug: "basic-to-ielts",
        batch: "Batch 318",
        targetBand: "8.0",
        examDate: daysFromNow(38),
        progress: 68,
        attendance: 92,
        status: "active",
      },
      {
        courseSlug: "ielts-crash-course",
        batch: "Batch 320-C",
        targetBand: "8.0",
        examDate: daysFromNow(38),
        progress: 45,
        attendance: 90,
        status: "active",
      },
    ],
    mocks: [
      { label: "Mock Test 1", date: "22 Aug", listening: 7.5, reading: 7.0, writing: 6.0, speaking: 7.0, overall: 7.0 },
      { label: "Mock Test 2", date: "29 Aug", listening: 8.0, reading: 7.5, writing: 6.5, speaking: 7.5, overall: 7.5 },
      { label: "Mock Test 3", date: "05 Sep", listening: 8.5, reading: 8.0, writing: 7.0, speaking: 8.0, overall: 8.0 },
    ],
    certificate: {
      id: "SIE-CERT-2455",
      course: "Spoken English Fluency",
      batch: "Batch 311",
      band: "7.5",
      issued: "18 Mar 2025",
    },
  },
  {
    name: "Fariha Islam",
    phone: "01712000002",
    enrollments: [
      {
        courseSlug: "ielts-premium",
        batch: "Batch 319-VIP",
        targetBand: "7.5",
        examDate: daysFromNow(52),
        progress: 55,
        attendance: 88,
        status: "active",
      },
    ],
    mocks: [
      { label: "Mock Test 1", date: "22 Aug", listening: 7.0, reading: 6.5, writing: 5.5, speaking: 6.5, overall: 6.5 },
      { label: "Mock Test 2", date: "30 Aug", listening: 7.0, reading: 7.0, writing: 6.0, speaking: 7.0, overall: 7.0 },
      { label: "Mock Test 3", date: "06 Sep", listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.5, overall: 7.0 },
    ],
  },
  {
    name: "Milon Mahmud",
    phone: "01712000003",
    enrollments: [
      {
        courseSlug: "basic-to-ielts",
        batch: "Batch 318",
        targetBand: "7.5",
        examDate: daysFromNow(26),
        progress: 80,
        attendance: 100,
        status: "active",
      },
    ],
    mocks: [
      { label: "Mock Test 1", date: "26 Aug", listening: 8.0, reading: 7.0, writing: 6.5, speaking: 7.5, overall: 7.5 },
      { label: "Mock Test 2", date: "05 Sep", listening: 8.0, reading: 7.5, writing: 7.0, speaking: 8.0, overall: 7.5 },
    ],
  },
  {
    name: "Emran Ahmed",
    phone: "01712000004",
    enrollments: [
      {
        courseSlug: "ielts-crash-course",
        batch: "Batch 320-C",
        targetBand: "7.0",
        examDate: daysFromNow(12),
        progress: 75,
        attendance: 95,
        status: "active",
      },
    ],
    mocks: [
      { label: "Mock Test 1", date: "25 Aug", listening: 6.5, reading: 6.0, writing: 5.5, speaking: 6.0, overall: 6.0 },
      { label: "Mock Test 2", date: "01 Sep", listening: 6.5, reading: 6.5, writing: 6.0, speaking: 6.5, overall: 6.5 },
      { label: "Mock Test 3", date: "07 Sep", listening: 7.0, reading: 7.0, writing: 6.0, speaking: 7.0, overall: 7.0 },
    ],
  },
  {
    name: "Mahmuda Akter Eva",
    phone: "01712000005",
    enrollments: [
      {
        courseSlug: "kid-english-course",
        batch: "Batch 322-Kids",
        targetBand: "6.5",
        examDate: daysFromNow(90),
        progress: 30,
        attendance: 85,
        status: "active",
      },
    ],
    mocks: [
      { label: "Assessment Test", date: "01 Sep", listening: 5.0, reading: 4.5, writing: 4.5, speaking: 5.0, overall: 5.0 },
      { label: "Progress Test", date: "08 Sep", listening: 5.5, reading: 5.0, writing: 5.0, speaking: 5.5, overall: 5.5 },
    ],
  },
  {
    // Account exists (registered) but never enrolled — portal must be EMPTY
    name: "Rakib Hasan",
    phone: "01712000006",
    enrollments: [],
    mocks: [],
  },
];

async function main() {
  // Full reseed — demo data only
  await db.mockResult.deleteMany({});
  await db.enrollment.deleteMany({});
  await db.student.deleteMany({});
  // Demo certificates link to seeded studentIds (cuids change every run) —
  // drop our own demo cert rows so they can be recreated with fresh links.
  await db.certificate.deleteMany({
    where: {
      id: {
        in: students
          .filter((s) => s.certificate)
          .map((s) => s.certificate!.id),
      },
    },
  });

  for (const s of students) {
    const { certificate } = s;
    const student = await db.student.create({
      data: {
        name: s.name,
        phone: s.phone,
        passwordHash: hashPassword(s.phone, DEMO_PASSWORD),
        enrollments: { create: s.enrollments },
        mockResults: { create: s.mocks },
      },
    });
    if (certificate) {
      await db.certificate.create({
        data: {
          id: certificate.id,
          name: s.name,
          course: certificate.course,
          batch: certificate.batch,
          band: certificate.band,
          issued: certificate.issued,
          studentId: student.id,
        },
      });
    }
  }

  // ── Admin CMS team ────────────────────────────────────────────────────
  for (const m of team) {
    await db.adminUser.upsert({
      where: { email: m.email },
      update: { name: m.name, role: m.role, status: "active" },
      create: {
        name: m.name,
        email: m.email,
        passwordHash: hashAdminPassword(m.email, m.password),
        role: m.role,
        status: "active",
      },
    });
  }

  // ── Managed catalog: courses / books / resources / notices ────────────
  // Upserts — admin edits survive reseeds; only missing defaults return.
  let i = 0;
  for (const c of courses) {
    const data = {
      slug: c.slug,
      title: c.title,
      titleBn: c.titleBn,
      desc: c.desc,
      lessons: c.lessons,
      duration: c.duration,
      price: c.price,
      oldPrice: c.oldPrice ?? null,
      tag: c.tag,
      icon: c.icon,
      features: JSON.stringify(c.features),
      category: c.category,
      rating: c.rating,
      students: c.students,
      nextBatch: c.nextBatch,
      mode: c.mode,
      scheduleNote: c.scheduleNote,
      seatsLeft: c.seatsLeft ?? null,
      seatsTotal: c.seatsTotal ?? null,
      accessPeriod: c.accessPeriod ?? null,
      syllabus: JSON.stringify(c.syllabus),
      published: true,
      createdAt: new Date(Date.now() - (courses.length - i) * 86_400_000),
    };
    await db.course.upsert({ where: { slug: c.slug }, update: data, create: data });
    i++;
  }

  i = 0;
  for (const b of books) {
    const data = {
      slug: b.slug,
      title: b.title,
      titleBn: b.titleBn,
      author: b.author,
      desc: b.desc,
      price: b.price,
      oldPrice: b.oldPrice ?? null,
      category: b.category,
      cover: b.cover,
      tag: b.tag ?? null,
      pages: b.pages,
      highlights: JSON.stringify(b.highlights),
      listed: true,
      createdAt: new Date(Date.now() - (books.length - i) * 86_400_000),
    };
    await db.book.upsert({ where: { slug: b.slug }, update: data, create: data });
    i++;
  }

  for (const d of portalDownloads) {
    const data = {
      id: d.id,
      title: d.title,
      desc: d.desc,
      category: d.category,
      type: d.type,
      size: d.size,
      href: d.href,
      published: true,
    };
    await db.downloadResource.upsert({ where: { id: d.id }, update: data, create: data });
  }

  // Notices: explicit ids + staggered createdAt so "newest first" matches
  // the static portalNotices order (10 Sep → 01 Sep).
  const noticeSeeds = portalNotices.map((n, idx) => ({
    id: `seed-notice-${idx + 1}`,
    date: n.date,
    tag: n.tag,
    title: n.title,
    body: n.body,
    createdAt: new Date(Date.now() - idx * 86_400_000),
  }));
  for (const n of noticeSeeds) {
    await db.notice.upsert({ where: { id: n.id }, update: n, create: n });
  }

  // ── Task 21 no-code collections: tips / website team / routine ─────────
  for (const t of tips) {
    const data = {
      title: t.title,
      excerpt: t.excerpt,
      category: t.category,
      icon: t.icon,
      published: true,
    };
    const existing = await db.tip.findFirst({ where: { title: t.title } });
    if (existing) await db.tip.update({ where: { id: existing.id }, data });
    else await db.tip.create({ data });
  }

  for (const m of teamMembers) {
    const data = {
      slug: m.slug,
      name: m.name,
      role: m.role,
      tagline: m.tagline,
      photo: m.photo,
      chip: m.chip,
      bio: JSON.stringify(m.bio),
      specialties: JSON.stringify(m.specialties),
      credentials: JSON.stringify(m.credentials),
      stats: JSON.stringify(m.stats),
      quote: m.quote,
      published: true,
    };
    await db.siteTeamMember.upsert({ where: { slug: m.slug }, update: data, create: data });
  }

  // Routine rows: staggered createdAt keeps the admin list stable by day.
  const routineCount = await db.routineSlot.count();
  if (routineCount === 0) {
    let ri = 0;
    for (const r of classRoutine) {
      await db.routineSlot.create({
        data: {
          day: r.day,
          start: r.start,
          end: r.end,
          courseSlug: r.courseSlug,
          batch: r.batch,
          topic: r.topic,
          mode: r.mode,
          type: r.type,
          published: true,
          createdAt: new Date(Date.now() - ri * 60_000),
        },
      });
      ri++;
    }
  }

  // All 33 Suggestion & Practice Tests
  const suggestionList = [
    { file: "listening-full-test-1.html", num: 1, title: "Listening Full Test 01", isFull: true },
    { file: "listening-full-test-2.html", num: 2, title: "Listening Full Test 02", isFull: true },
    { file: "listening-full-test-3.html", num: 3, title: "Listening Full Test 03", isFull: true },
    { file: "listening-full-test-4.html", num: 4, title: "Listening Full Test 04", isFull: true },
    { file: "listening-full-test-5.html", num: 5, title: "Listening Full Test 05", isFull: true },
    { file: "listening-full-test-6.html", num: 6, title: "Listening Full Test 06", isFull: true },
    { file: "listening-full-test-7.html", num: 7, title: "Listening Full Test 07", isFull: true },
    { file: "listening-full-test-9.html", num: 9, title: "Listening Full Test 09", isFull: true },
    { file: "listening-full-test-10.html", num: 10, title: "Listening Full Test 10", isFull: true },
    { file: "listening-full-test-11.html", num: 11, title: "Listening Full Test 11", isFull: true },
    { file: "listening-full-test-12.html", num: 12, title: "Listening Full Test 12", isFull: true },
    { file: "listening-full-test-13.html", num: 13, title: "Listening Full Test 13", isFull: true },
    { file: "listening-full-test-15.html", num: 15, title: "Listening Full Test 15", isFull: true },
    { file: "listening-full-test-16.html", num: 16, title: "Listening Full Test 16", isFull: true },
    { file: "listening-full-test-17.html", num: 17, title: "Listening Full Test 17", isFull: true },
    { file: "listening-full-test-18.html", num: 18, title: "Listening Full Test 18", isFull: true },
    { file: "listening-full-test-19.html", num: 19, title: "Listening Full Test 19", isFull: true },
    { file: "listening-full-test-20.html", num: 20, title: "Listening Full Test 20", isFull: true },
    { file: "listening-full-test-21.html", num: 21, title: "Listening Full Test 21", isFull: true },
    { file: "listening-full-test-22.html", num: 22, title: "Listening Full Test 22", isFull: true },
    { file: "listening-test-23.html", num: 23, title: "Listening Test 23", isFull: false },
    { file: "listening-full-test-24.html", num: 24, title: "Listening Full Test 24", isFull: true },
    { file: "listening-test-25.html", num: 25, title: "Listening Test 25", isFull: false },
    { file: "listening-full-test-26.html", num: 26, title: "Listening Full Test 26", isFull: true },
    { file: "listening-test-27.html", num: 27, title: "Listening Test 27 — Full Practice", isFull: false },
    { file: "listening-test-28.html", num: 28, title: "Listening Test 28", isFull: false },
    { file: "listening-test-29.html", num: 29, title: "Listening Test 29", isFull: false },
    { file: "listening-test-30.html", num: 30, title: "Listening Test 30", isFull: false },
    { file: "listening-test-31.html", num: 31, title: "Listening Test 31", isFull: false },
    { file: "listening-test-32.html", num: 32, title: "Listening Test 32", isFull: false },
    { file: "listening-test-33.html", num: 33, title: "Listening Test 33", isFull: false },
    { file: "listening-test-34.html", num: 34, title: "Listening Test 34", isFull: false },
    { file: "listening-test-35.html", num: 35, title: "Listening Test 35", isFull: false },
  ];

  await db.suggestion.deleteMany({ where: { id: "seed-suggestion-listening-27" } });

  for (const item of suggestionList) {
    const id = `suggestion-listening-${item.num}`;
    const fileUrl = `/suggestions/${item.file}`;
    const desc = item.isFull
      ? `৪০টি প্রশ্নের ফুল লিসেনিং টেস্ট — অডিও, ইনস্ট্যান্ট ব্যান্ড স্কোর ও ট্রান্সক্রিপ্ট অ্যানালাইসিস সহ।`
      : `IELTS Listening Practice Test ${item.num} — অডিও প্লেয়ার, ইনস্ট্যান্ট রেজাল্ট ও এক্সপ্ল্যানেশন।`;

    await db.suggestion.upsert({
      where: { id },
      update: {
        title: item.title,
        desc,
        category: "Listening",
        fileUrl,
        kind: "html",
        serial: item.num,
        published: true,
      },
      create: {
        id,
        title: item.title,
        desc,
        category: "Listening",
        fileUrl,
        kind: "html",
        serial: item.num,
        published: true,
      },
    });
  }

  const [students_, enrollments_, mocks_] = await Promise.all([
    db.student.count(),
    db.enrollment.count(),
    db.mockResult.count(),
  ]);
  const [team_, courses_, books_, resources_, notices_] = await Promise.all([
    db.adminUser.count(),
    db.course.count(),
    db.book.count(),
    db.downloadResource.count(),
    db.notice.count(),
  ]);
  const [tips_, siteTeam_, routine_, suggestions_] = await Promise.all([
    db.tip.count(),
    db.siteTeamMember.count(),
    db.routineSlot.count(),
    db.suggestion.count(),
  ]);
  console.log(
    `Seeded ${students_} students, ${enrollments_} enrollments, ${mocks_} mock results; ` +
      `team ${team_} (owner/admin/teacher), courses ${courses_}, books ${books_}, ` +
      `resources ${resources_}, notices ${notices_}; ` +
      `tips ${tips_}, site team ${siteTeam_}, routine ${routine_}, suggestions ${suggestions_}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
