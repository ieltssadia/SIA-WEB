import { NextResponse } from "next/server";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminSuggestion } from "@/lib/admin-serialize";
import { db } from "@/lib/db";
import { kindFromExt, saveUploadedFile, UploadError } from "@/lib/upload-server";

/**
 * POST /api/admin/suggestion-files — one-step multipart upload that
 * "processes" a suggestion file automatically, exactly like the manual flow
 * the team did before: the file lands in the media library
 * (/public/uploads/suggestions/), a Suggestion row is created (title / kind /
 * date derived from the filename) and the item is instantly live in the
 * paid-students' portal Suggestions section. Admin/owner only.
 *
 * The admin UI's structured dialog (admin-suggestions.tsx) instead combines
 * POST /api/admin/upload + POST /api/admin/suggestions — both paths produce
 * the same row shape.
 *
 * Optional light auto-brand: when the uploaded HTML carries a third-party
 * <title>, it is rewritten to "Sadia's IELTS — <title>" (skipped when the
 * file already carries the brand).
 */

const SUGGESTION_KINDS = new Set(["html", "pdf", "audio", "video", "link"]);
const SUGGESTION_CATEGORIES = new Set([
  "Practice",
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Vocabulary",
]);

function humanizeTitle(name: string): string {
  const words = name
    .replace(/\.[a-z0-9]+$/i, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)));
  const title = words.join(" ").trim();
  return title.length >= 3 ? title.slice(0, 160) : "নতুন সাজেশন";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("আপলোড ফর্ম পড়া যায়নি। (Invalid upload form.)");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return badRequest("কোনো ফাইল পাওয়া যায়নি। (No file in the upload.)");
  }
  if (file.size === 0) return badRequest("ফাইলটি খালি। (The file is empty.)");

  const originalName = file.name || "suggestion.html";
  const ext = (originalName.split(".").pop() ?? "").toLowerCase();

  // Optional overrides from the dialog
  const titleInput = String(form.get("title") ?? "").trim();
  const kindInput = String(form.get("kind") ?? "").trim();
  const categoryInput = String(form.get("category") ?? "").trim();

  const title = titleInput || humanizeTitle(originalName);
  const kind = SUGGESTION_KINDS.has(kindInput) ? kindInput : kindFromExt(ext);
  const category = SUGGESTION_CATEGORIES.has(categoryInput) ? categoryInput : "Practice";

  let saved;
  try {
    saved = await saveUploadedFile(file, "suggestions");
  } catch (error) {
    if (error instanceof UploadError) return badRequest(error.message);
    console.error("[api/admin/suggestion-files] save failed:", error);
    return badRequest("ফাইল সেভ করা যায়নি, আবার চেষ্টা করুন।");
  }

  // Register in the Media Library so every uploaded file stays manageable.
  await db.mediaItem.create({
    data: {
      url: saved.url,
      filename: saved.name,
      size: saved.bytes,
      ext: saved.ext,
      folder: "suggestions",
    },
  });

  // Light auto-brand for third-party HTML: brand the <title> when missing.
  if (saved.ext === "html" || saved.ext === "htm") {
    try {
      const fs = await import("node:fs/promises");
      const abs = `${process.cwd()}/public${saved.url}`;
      const html = await fs.readFile(abs, "utf8");
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      if (titleMatch && !/sadia/i.test(titleMatch[1])) {
        const branded = html.replace(
          /<title[^>]*>[\s\S]*?<\/title>/i,
          `<title>Sadia's IELTS: ${escapeHtml(title)}</title>`
        );
        await fs.writeFile(abs, branded, "utf8");
      }
    } catch {
      // Non-UTF8 or already-gone file — keep the original bytes.
    }
  }

  const row = await db.suggestion.create({
    data: {
      title,
      desc: "",
      category,
      kind,
      fileUrl: saved.url,
      published: true,
    },
  });

  return NextResponse.json(
    { ok: true, suggestion: serializeAdminSuggestion(row) },
    { status: 201 }
  );
}
