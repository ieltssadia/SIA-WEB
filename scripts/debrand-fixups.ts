import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const DIR = path.join(process.cwd(), "public", "suggestions");

const FIXES: { file: string; from: RegExp; to: string }[] = [
  { // test-33: dead map figure
    file: "listening-test-33.html",
    from: /<img src="https:\/\/i\.postimg\.cc\/yxPWh6rz\/[^"]*" alt="">/,
    to: "",
  },
  { // test-34: dead brand logo div in header
    file: "listening-test-34.html",
    from: /\s*<div class="brand" style="display:flex;align-items:center;gap:5px"><img alt="Sadia's IELTS" src="https:\/\/i\.postimg\.cc\/T2mNmzx2\/[^"]*"[^/]*\/><\/div>/,
    to: "",
  },
  { // test-30: dead community centre plan
    file: "listening-test-30.html",
    from: /<img src="https:\/\/i\.postimg\.cc\/wvkF8gs8\/[^"]*"\s*\n\s*alt="Community centre plan"[^>]*>/,
    to: "",
  },
  { // full-test-9: dead Karrara plan
    file: "listening-full-test-9.html",
    from: /<img src="https:\/\/i\.postimg\.cc\/pVQfg4HC\/karrarar\.jpg"[^>]*>/,
    to: "",
  },
];

for (const fix of FIXES) {
  const abs = path.join(DIR, fix.file);
  const html = readFileSync(abs, "utf8");
  if (!fix.from.test(html)) {
    console.warn(`!! ${fix.file}: pattern not found`);
    continue;
  }
  writeFileSync(abs, html.replace(fix.from, fix.to), "utf8");
  console.log(`cleaned ${fix.file}`);
}
