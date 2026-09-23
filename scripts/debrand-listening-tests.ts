/**
 * One-off de-brand pass for the bulk-imported listening tests: strips the
 * third-party "CRACK IELTS / Telegram" promotion (top banner + header link)
 * and the dead i.postimg.cc watermark so the pages carry only neutral exam
 * UI under the Sadia's IELTS portal. Interactive JS (timer, answers, audio)
 * is untouched. listening-test-27.html already went through the full Task 20
 * redesign and is excluded.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "suggestions");

function listFiles(): string[] {
  if (process.argv.slice(2).length) return process.argv.slice(2);
  return readdirSync(DIR)
    .filter((f: string) => f.startsWith("listening-") && f.endsWith(".html"))
    .filter((f: string) => f !== "listening-test-27.html");
}

function clean(html: string): { html: string; notes: string[] } {
  const notes: string[] = [];

  // 1. Remove the whole "📢 Join Telegram / CRACK IELTS" top banner div.
  if (/<div class="top-banner">[\s\S]*?<\/div>/.test(html)) {
    html = html.replace(/<div class="top-banner">[\s\S]*?<\/div>/g, "");
    notes.push("top-banner removed");
  }

  // 2. Remove header telegram anchors (CRACK IELTS / CRACK IELTS BD …).
  const tgRe = /<a\s+href="https?:\/\/t\.me\/[^"]*"[^>]*>[\s\S]*?<\/a>/g;
  if (tgRe.test(html)) {
    html = html.replace(tgRe, "");
    notes.push("telegram link removed");
  }

  // 3. Neutralize dead postimg.cc background watermarks.
  const piRe = /background-image:\s*url\('https?:\/\/i\.postimg\.cc\/[^']*'\);?/g;
  if (piRe.test(html)) {
    html = html.replace(piRe, "");
    notes.push("postimg watermark removed");
  }

  // 4. Any leftover third-party brand text.
  if (/CRACK IELTS/i.test(html)) {
    html = html.replace(/CRACK IELTS(BD)?/gi, "Sadia's IELTS");
    notes.push("brand text swapped");
  }
  if (/IELTS CDI/i.test(html)) {
    html = html.replace(/IELTS CDI/gi, "Sadia's IELTS");
    notes.push("CDI text swapped");
  }

  return { html, notes };
}

function main() {
  const files = listFiles();
  let touched = 0;
  for (const f of files) {
    const abs = path.join(DIR, f);
    const before = readFileSync(abs, "utf8");
    const { html, notes } = clean(before);
    if (notes.length) {
      writeFileSync(abs, html, "utf8");
      touched += 1;
      console.log(`  ${f}: ${notes.join(", ")}`);
    }
    // Post-check: interactive leftovers must be zero.
    const leftover = before === html ? before : html;
    const bad = leftover.match(/t\.me\/|CRACK IELTS|postimg\.cc/gi);
    if (bad) console.warn(`  !! ${f} still has ${bad.length} third-party refs`);
  }
  console.log(`Done. ${touched}/${files.length} files cleaned.`);
}

main();
