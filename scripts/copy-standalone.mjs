import fs from "fs";

try {
  if (fs.existsSync(".next/standalone")) {
    if (fs.existsSync(".next/static")) {
      fs.mkdirSync(".next/standalone/.next", { recursive: true });
      fs.cpSync(".next/static", ".next/standalone/.next/static", { recursive: true, force: true });
    }
    if (fs.existsSync("public")) {
      fs.cpSync("public", ".next/standalone/public", { recursive: true, force: true });
    }
  }
} catch (e) {
  console.warn("copy-standalone skipped:", e.message);
}
