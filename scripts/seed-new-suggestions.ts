import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const db = new PrismaClient();

function cleanTitle(filename: string): { title: string; category: string; kind: string } {
  let name = filename.replace(/\.pdf$/i, "").replace(/@\w+/g, "").trim();
  let category = "Reading";
  const kind = "pdf";

  const lower = name.toLowerCase();

  if (lower.includes("listening")) {
    category = "Listening";
  } else if (lower.includes("task 1") || lower.includes("task 2") || lower.includes("writing") || lower.includes("chart") || lower.includes("table") || lower.includes("diagram")) {
    category = "Writing";
  } else if (lower.includes("mock") || lower.includes("exam")) {
    category = "Practice";
  } else if (lower.includes("passage") || lower.includes("reading") || lower.includes("vol") || lower.includes("volume")) {
    category = "Reading";
  }

  // Format clean human-readable title
  name = name
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(\d+[\s_-]*Passage[\s_-]*\d*)/i, (m) => m.toUpperCase())
    .trim();

  return { title: name, category, kind };
}

async function main() {
  const uploadDir = path.join(process.cwd(), "upload");
  const targetDir = path.join(process.cwd(), "public", "uploads", "suggestions");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(uploadDir).filter((f) => f.toLowerCase().endsWith(".pdf"));
  console.log(`Found ${files.length} PDF files in upload directory.`);

  let maxSerialRow = await db.suggestion.findFirst({
    orderBy: { serial: "desc" },
    select: { serial: true },
  });
  let currentSerial = (maxSerialRow?.serial ?? 0) + 1;

  let addedCount = 0;

  for (const filename of files) {
    const srcPath = path.join(uploadDir, filename);
    const destFilename = filename.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "_");
    const destPath = path.join(targetDir, destFilename);

    fs.copyFileSync(srcPath, destPath);

    const fileUrl = `/uploads/suggestions/${destFilename}`;
    const stats = fs.statSync(destPath);
    const { title, category, kind } = cleanTitle(filename);

    const existing = await db.suggestion.findFirst({
      where: {
        OR: [{ fileUrl }, { title }],
      },
    });

    if (!existing) {
      await db.suggestion.create({
        data: {
          title,
          desc: `IELTS ${category} Real Exam Practice Material`,
          category,
          fileUrl,
          kind,
          serial: currentSerial++,
          published: true,
        },
      });

      // Add to MediaItem
      await db.mediaItem.create({
        data: {
          url: fileUrl,
          filename,
          size: stats.size,
          ext: "pdf",
          folder: "suggestions",
          kind: "file",
        },
      });

      console.log(`✓ Added Suggestion: "${title}" [${category}]`);
      addedCount++;
    } else {
      console.log(`- Already exists: "${title}"`);
    }
  }

  console.log(`\n🎉 Successfully processed ${addedCount} new suggestions! Total now available.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
