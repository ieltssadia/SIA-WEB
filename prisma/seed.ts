/**
 * Seed demo enrolled students + mock test results for the Student Portal.
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const students = [
  {
    name: "Anika Tasnim",
    phone: "01712000001",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
    targetBand: "8.0",
    examDate: daysFromNow(38),
    progress: 68,
    attendance: 92,
    mocks: [
      { label: "Mock Test 1", date: "22 Aug", listening: 7.5, reading: 7.0, writing: 6.0, speaking: 7.0, overall: 7.0 },
      { label: "Mock Test 2", date: "29 Aug", listening: 8.0, reading: 7.5, writing: 6.5, speaking: 7.5, overall: 7.5 },
      { label: "Mock Test 3", date: "05 Sep", listening: 8.5, reading: 8.0, writing: 7.0, speaking: 8.0, overall: 8.0 },
    ],
  },
  {
    name: "Fariha Islam",
    phone: "01712000002",
    courseSlug: "basic-to-ielts-private-batch",
    batch: "Batch 319",
    targetBand: "7.5",
    examDate: daysFromNow(52),
    progress: 55,
    attendance: 88,
    mocks: [
      { label: "Mock Test 1", date: "22 Aug", listening: 7.0, reading: 6.5, writing: 5.5, speaking: 6.5, overall: 6.5 },
      { label: "Mock Test 2", date: "30 Aug", listening: 7.0, reading: 7.0, writing: 6.0, speaking: 7.0, overall: 7.0 },
      { label: "Mock Test 3", date: "06 Sep", listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.5, overall: 7.0 },
    ],
  },
  {
    name: "Milon Mahmud",
    phone: "01712000003",
    courseSlug: "basic-to-ielts-one-to-one",
    batch: "One-to-One",
    targetBand: "7.5",
    examDate: daysFromNow(26),
    progress: 80,
    attendance: 100,
    mocks: [
      { label: "Mock Test 1", date: "26 Aug", listening: 8.0, reading: 7.0, writing: 6.5, speaking: 7.5, overall: 7.5 },
      { label: "Mock Test 2", date: "05 Sep", listening: 8.0, reading: 7.5, writing: 7.0, speaking: 8.0, overall: 7.5 },
    ],
  },
  {
    name: "Emran Ahmed",
    phone: "01712000004",
    courseSlug: "ielts-crash-course",
    batch: "Batch 318-C",
    targetBand: "7.0",
    examDate: daysFromNow(12),
    progress: 75,
    attendance: 95,
    mocks: [
      { label: "Mock Test 1", date: "25 Aug", listening: 6.5, reading: 6.0, writing: 5.5, speaking: 6.0, overall: 6.0 },
      { label: "Mock Test 2", date: "01 Sep", listening: 6.5, reading: 6.5, writing: 6.0, speaking: 6.5, overall: 6.5 },
      { label: "Mock Test 3", date: "07 Sep", listening: 7.0, reading: 7.0, writing: 6.0, speaking: 7.0, overall: 7.0 },
    ],
  },
  {
    name: "Mahmuda Akter Eva",
    phone: "01712000005",
    courseSlug: "pre-ielts",
    batch: "Batch 320",
    targetBand: "6.5",
    examDate: daysFromNow(90),
    progress: 30,
    attendance: 85,
    mocks: [
      { label: "Assessment Test", date: "01 Sep", listening: 5.0, reading: 4.5, writing: 4.5, speaking: 5.0, overall: 5.0 },
      { label: "Progress Test", date: "08 Sep", listening: 5.5, reading: 5.0, writing: 5.0, speaking: 5.5, overall: 5.5 },
    ],
  },
];

async function main() {
  for (const s of students) {
    const { mocks, ...studentData } = s;
    const student = await db.student.upsert({
      where: { phone: s.phone },
      update: studentData,
      create: studentData,
    });
    // Re-seed mock results idempotently
    await db.mockResult.deleteMany({ where: { studentId: student.id } });
    await db.mockResult.createMany({
      data: mocks.map((m) => ({ ...m, studentId: student.id })),
    });
  }
  const total = await db.mockResult.count();
  console.log(`Seeded ${students.length} students and ${total} mock results.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
