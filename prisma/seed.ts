/**
 * Seed demo student accounts + enrollments + mock test results for the
 * Student Portal. Run: bun prisma/seed.ts
 *
 * Accounts are created at enrollment time (phone + password). Rakib Hasan has
 * an account but NO enrollment — his portal is intentionally empty.
 */
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const db = new PrismaClient();

/** Must match hashPassword() in src/lib/portal-server.ts */
function hashPassword(phone: string, password: string): string {
  return createHash("sha256").update(`${phone}:${password}`).digest("hex");
}

const DEMO_PASSWORD = "sadia123";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const students = [
  {
    name: "Anika Tasnim",
    phone: "01712000001",
    // Two active enrollments — multi-course portal demo
    enrollments: [
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

  for (const s of students) {
    await db.student.create({
      data: {
        name: s.name,
        phone: s.phone,
        passwordHash: hashPassword(s.phone, DEMO_PASSWORD),
        enrollments: { create: s.enrollments },
        mockResults: { create: s.mocks },
      },
    });
  }

  const [students_, enrollments_, mocks_] = await Promise.all([
    db.student.count(),
    db.enrollment.count(),
    db.mockResult.count(),
  ]);
  console.log(
    `Seeded ${students_} students, ${enrollments_} enrollments, ${mocks_} mock results.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
