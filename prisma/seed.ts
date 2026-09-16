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
import { books, courses, portalDownloads, portalNotices } from "../src/lib/site-data";

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
        courseSlug: "pre-ielts",
        batch: "Batch 311",
        targetBand: "7.5",
        examDate: "2025-03-18",
        progress: 100,
        attendance: 96,
        status: "completed",
      },
      {
        courseSlug: "basic-to-ielts-in-batch",
        batch: "Batch 317",
        targetBand: "8.0",
        examDate: daysFromNow(38),
        progress: 68,
        attendance: 92,
        status: "active",
      },
      {
        courseSlug: "ielts-crash-course",
        batch: "Batch 318-C",
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
      course: "Pre-IELTS Foundation",
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
        courseSlug: "basic-to-ielts-private-batch",
        batch: "Batch 319",
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
        courseSlug: "basic-to-ielts-one-to-one",
        batch: "One-to-One",
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
        batch: "Batch 318-C",
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
        courseSlug: "pre-ielts",
        batch: "Batch 320",
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
  console.log(
    `Seeded ${students_} students, ${enrollments_} enrollments, ${mocks_} mock results; ` +
      `team ${team_} (owner/admin/teacher), courses ${courses_}, books ${books_}, ` +
      `resources ${resources_}, notices ${notices_}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
