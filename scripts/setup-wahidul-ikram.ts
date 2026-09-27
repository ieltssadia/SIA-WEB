import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const db = new PrismaClient();

function hashPassword(phone: string, password: string): string {
  return createHash("sha256").update(`${phone}:${password}`).digest("hex");
}

async function main() {
  const phone = "01727359235";
  const email = "ikram.wahidul@gmail.com";
  const name = "Wahidul Ikram";
  const defaultPassword = "password123";

  console.log(`Setting up account for ${name} (${email}, ${phone})...`);

  // Delete existing if any to ensure clean setup
  await db.enrollment.deleteMany({
    where: { student: { OR: [{ email }, { phone }] } },
  });
  await db.mockResult.deleteMany({
    where: { student: { OR: [{ email }, { phone }] } },
  });
  await db.student.deleteMany({
    where: { OR: [{ email }, { phone }] },
  });

  const student = await db.student.create({
    data: {
      name,
      email,
      phone,
      passwordHash: hashPassword(phone, defaultPassword),
      isVerified: true,
      enrollments: {
        create: [
          {
            courseSlug: "ielts-premium",
            batch: "VIP Premium Batch 318",
            targetBand: "8.0",
            examDate: "2026-11-20",
            progress: 25,
            attendance: 95,
            status: "active",
          },
          {
            courseSlug: "basic-to-ielts",
            batch: "Foundation Batch 214",
            targetBand: "7.5",
            examDate: "2026-11-20",
            progress: 40,
            attendance: 100,
            status: "active",
          },
          {
            courseSlug: "ielts-crash-course",
            batch: "Crash Batch 105",
            targetBand: "8.0",
            progress: 15,
            attendance: 90,
            status: "active",
          },
        ],
      },
      mockResults: {
        create: [
          {
            label: "Mock Test 1",
            date: "20 Sep",
            listening: 7.5,
            reading: 7.5,
            writing: 7.0,
            speaking: 7.5,
            overall: 7.5,
          },
          {
            label: "Mock Test 2",
            date: "25 Sep",
            listening: 8.0,
            reading: 8.0,
            writing: 7.0,
            speaking: 7.5,
            overall: 7.5,
          },
        ],
      },
    },
  });

  console.log("Wahidul Ikram account created successfully:", student.id);
  console.log(`Login with Phone: ${phone} or Email: ${email} | Password: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
