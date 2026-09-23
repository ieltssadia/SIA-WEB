/**
 * Server-side file uploads for the admin CMS — the "WordPress media library"
 * primitive. Files land under /public/uploads/<folder>/ and are served
 * statically by Next, so an uploaded suggestion test or certificate PDF is
 * immediately addressable by URL with zero extra plumbing.
 *
 * Security: extension whitelist, folder whitelist, ASCII-safe unique names,
 * hard size cap. Callers must authenticate BEFORE calling saveUploadedFile.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { isR2Configured, uploadToR2 } from "@/lib/r2";

export const UPLOAD_FOLDERS = [
  "suggestions",
  "certificates",
  "resources",
  "team",
  "general",
] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024; // 60 MB

const EXT_WHITELIST = new Set([
  "html", "htm", "pdf", "mp3", "mp4", "png", "jpg", "jpeg", "webp", "gif",
  "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "zip",
]);

export type SavedUpload = {
  url: string; // public path, e.g. /uploads/suggestions/xxx.html
  name: string; // original client filename
  bytes: number;
  sizeLabel: string;
  ext: string;
  folder: UploadFolder;
};

export class UploadError extends Error {}

function sizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${bytes} B`;
}

function slugifyBase(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const ascii = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return ascii || "file";
}

/** Validate + persist one uploaded file. Throws UploadError on any problem. */
export async function saveUploadedFile(
  file: File,
  folderRaw: string
): Promise<SavedUpload> {
  const folder = (UPLOAD_FOLDERS as readonly string[]).includes(folderRaw)
    ? (folderRaw as UploadFolder)
    : "general";

  if (!file || typeof file.arrayBuffer !== "function") {
    throw new UploadError("ফাইল পাওয়া যায়নি, আবার সিলেক্ট করুন।");
  }
  if (file.size === 0) throw new UploadError("ফাইলটি খালি।");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("ফাইল খুব বড়, সর্বোচ্চ ৬০ MB আপলোড করা যাবে।");
  }

  const rawName = (file.name || "file").slice(0, 120);
  const ext = (rawName.split(".").pop() ?? "").toLowerCase();
  if (!ext || !EXT_WHITELIST.has(ext)) {
    throw new UploadError(
      "এই ধরনের ফাইল আপলোড করা যাবে না: HTML, PDF, MP3, ছবি বা Office ফাইল দিন।"
    );
  }

  const stamp = new Date().toISOString().slice(0, 7).replace("-", ""); // 202509
  const uniq = crypto.randomBytes(4).toString("hex");
  const filename = `${stamp}-${uniq}-${slugifyBase(rawName)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let fileUrl = `/uploads/${folder}/${filename}`;
  let r2Uploaded = false;

  if (isR2Configured()) {
    try {
      const r2Key = `${folder}/${filename}`;
      const r2Res = await uploadToR2(r2Key, buffer, file.type);
      fileUrl = r2Res.url;
      r2Uploaded = true;
    } catch (r2Err) {
      console.error("Cloudflare R2 upload error:", r2Err);
    }
  }

  // Best-effort local filesystem write (for local development)
  try {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
  } catch (fsErr) {
    // If Vercel read-only filesystem throws, but R2 succeeded, that is normal.
    if (!r2Uploaded) {
      console.error("Local disk upload failed:", fsErr);
      throw new UploadError("সার্ভারে ফাইল আপলোড করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  return {
    url: fileUrl,
    name: rawName,
    bytes: file.size,
    sizeLabel: sizeLabel(file.size),
    ext,
    folder,
  };
}

/** Kind derivation for suggestion rows from the file extension. */
export function kindFromExt(ext: string): string {
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "pdf") return "pdf";
  if (ext === "mp3") return "audio";
  if (ext === "mp4") return "video";
  return "link";
}
