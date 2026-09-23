/**
 * One-off bulk import: the team zipped 35 interactive listening tests
 * (upload/siasuggetionmat.zip). This script copies each test into
 * /public/suggestions with a clean slug, applies the same light auto-brand
 * the admin upload pipeline uses (rewrite a third-party <title> to
 * "Sadia's IELTS — …") and creates the Suggestion rows so the tests are
 * instantly live in the paid-students' portal library.
 *
 * Skipped on purpose:
 *   - "Listening Test 27.html"        → already live (branded Task 20 redesign)
 *   - "Listening Full Test 19 (1).html" → byte-identical duplicate of 19
 *   - "Listening Full Test 26.html"   → audio element has no source (silent
 *     test); the working "- 26" variant is imported instead
 *
 * Idempotent: rows whose fileUrl already exists in the DB are not re-created.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";

const SRC_DIR = "/tmp/siamat";
const OUT_DIR = path.join(process.cwd(), "public", "suggestions");

const DESC =
  "ফুল লিসেনিং প্র্যাকটিস টেস্ট — ৪টি পার্ট, ৪০টি প্রশ্ন, টাইমার ও অডিওসহ। শেষে উত্তর মিলিয়ে ব্যান্ড স্কোর দেখুন।";

/** zip filename → public slug (order = seed order; portal lists newest first). */
const IMPORTS: { file: string; slug: string; title: string }[] = [];

// Listening Full Test series (1..26 minus the gaps that were never in the zip)
for (const n of [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 24]) {
  IMPORTS.push({
    file: `Listening Full Test ${n}.html`,
    slug: `listening-full-test-${n}`,
    title: `Listening Full Test ${n}`,
  });
}
// The working variant of Full Test 26 (4-part audio intact)
IMPORTS.push({
  file: "Listening Full Test - 26.html",
  slug: "listening-full-test-26",
  title: "Listening Full Test 26",
});
// Listening Test series
for (const n of [23, 25, 28, 29, 30, 31, 32, 33, 34, 35]) {
  IMPORTS.push({
    file: `Listening Test ${n}.html`,
    slug: `listening-test-${n}`,
    title: `Listening Test ${n}`,
  });
}

function brandTitle(html: string, title: string): string {
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) return html;
  return html.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    `<title>Sadia's IELTS — ${title}</title>`
  );
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const existing = new Set(
    (await db.suggestion.findMany({ select: { fileUrl: true } })).map((r) => r.fileUrl)
  );

  const base = Date.now();
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < IMPORTS.length; i += 1) {
    const { file, slug, title } = IMPORTS[i];
    const fileUrl = `/suggestions/${slug}.html`;

    if (existing.has(fileUrl)) {
      skipped += 1;
      continue;
    }

    const src = path.join(SRC_DIR, file);
    if (!existsSync(src)) {
      console.warn(`  !! source missing: ${file}`);
      continue;
    }

    const branded = brandTitle(readFileSync(src, "utf8"), title);
    writeFileSync(path.join(OUT_DIR, `${slug}.html`), branded, "utf8");

    // Stagger createdAt 1 min apart in seed order → deterministic newest-first
    // ordering in the portal (seed order = oldest → newest).
    await db.suggestion.create({
      data: {
        title,
        desc: DESC,
        category: "Listening",
        kind: "html",
        fileUrl,
        published: true,
        createdAt: new Date(base - (IMPORTS.length - i) * 60_000),
      },
    });
    created += 1;
    console.log(`  + ${title} → ${fileUrl}`);
  }

  console.log(`Done. created=${created} skipped=${skipped}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
