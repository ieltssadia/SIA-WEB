import { NextResponse } from "next/server";
import { badRequest, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminMedia } from "@/lib/admin-serialize";
import { db } from "@/lib/db";
import { kindFromExt, saveUploadedFile, UploadError } from "@/lib/upload-server";

/**
 * POST /api/admin/upload — the WordPress-style media upload primitive used by
 * every admin upload dialog (suggestions, certificates, resources, team
 * photos, notices…). The file is validated + persisted under
 * /public/uploads/<folder>/ and registered in the Media Library (MediaItem).
 *
 * The response carries BOTH shapes the admin UI consumes:
 *   - `upload`: { url, name, bytes, sizeLabel, ext, folder, kind } for the
 *     structured upload dialogs (uploadAdminFile helper)
 *   - `media`:  the full Media Library row for the media picker / library grid
 *
 * Any signed-in team member may upload (teachers attach certificate files and
 * notice images); deleting media is admin/owner only.
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

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
  const folder = String(form.get("folder") ?? "general");

  let saved;
  try {
    saved = await saveUploadedFile(file, folder);
  } catch (error) {
    if (error instanceof UploadError) return badRequest(error.message);
    console.error("[api/admin/upload] save failed:", error);
    return badRequest("ফাইল সেভ করা যায়নি, আবার চেষ্টা করুন।");
  }

  const row = await db.mediaItem.create({
    data: {
      url: saved.url,
      filename: saved.name,
      size: saved.bytes,
      ext: saved.ext,
      folder: saved.folder,
    },
  });

  // Light auto-brand for HTML going to the portal Suggestions library: when
  // the file carries a third-party <title>, rewrite it to "Sadia's IELTS —
  // <title>" (mirrors POST /api/admin/suggestion-files).
  if (saved.folder === "suggestions" && (saved.ext === "html" || saved.ext === "htm")) {
    try {
      const fs = await import("node:fs/promises");
      const abs = `${process.cwd()}/public${saved.url}`;
      const html = await fs.readFile(abs, "utf8");
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      if (titleMatch && !/sadia/i.test(titleMatch[1])) {
        const branded = html.replace(
          /<title[^>]*>[\s\S]*?<\/title>/i,
          `<title>Sadia's IELTS: ${saved.name.replace(/\.[^.]+$/, "").replace(/[<>"]/g, "")}</title>`
        );
        await fs.writeFile(abs, branded, "utf8");
      }
    } catch {
      // Non-UTF8 or already-gone file — keep the original bytes.
    }
  }

  return NextResponse.json(
    {
      ok: true,
      upload: {
        url: saved.url,
        name: saved.name,
        bytes: saved.bytes,
        sizeLabel: saved.sizeLabel,
        ext: saved.ext,
        folder: saved.folder,
        kind: kindFromExt(saved.ext),
      },
      media: serializeAdminMedia(row),
    },
    { status: 201 }
  );
}
