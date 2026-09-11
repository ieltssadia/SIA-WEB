/**
 * Seed demo enrolled students for the Student Portal.
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const students = [
  {
    name: "Anika Tasnim",
    phone: "01712000001",
    courseSlug: "basic-to-ielts-in-batch",
    batch: "Batch 317",
  },
  {
    name: "Fariha Islam",
    phone: "01712000002",
    courseSlug: "basic-to-ielts-private-batch",
    batch: "Batch 319",
  },
  {
    name: "Milon Mahmud",
    phone: "01712000003",
    courseSlug: "basic-to-ielts-one-to-one",
    batch: "One-to-One",
  },
  {
    name: "Emran Ahmed",
    phone: "01712000004",
    courseSlug: "ielts-crash-course",
    batch: "Batch 318-C",
  },
  {
    name: "Mahmuda Akter Eva",
    phone: "01712000005",
    courseSlug: "pre-ielts",
    batch: "Batch 320",
  },
];

async function main() {
  for (const s of students) {
    await db.student.upsert({
      where: { phone: s.phone },
      update: s,
      create: s,
    });
  }
  console.log(`Seeded ${students.length} students.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
