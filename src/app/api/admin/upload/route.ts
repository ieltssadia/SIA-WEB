import { NextResponse } from "next/server";
import { getAuth, unauthorized, badRequest } from "@/lib/admin-auth";
import {
  UploadError,
  kindFromExt,
  saveUploadedFile,
} from "@/lib/upload-server";

/**
 * POST /api/admin/upload — multipart file upload for the admin CMS.
 * Any active team role can upload (teachers attach certificate files).
 *
 * multipart/form-data fields:
 *   file   — the binary file
 *   folder — suggestions | certificates | resources | team | general
 *
 * Returns the public URL plus metadata; the caller attaches that URL to the
 * relevant collection row (suggestion, certificate, resource, team photo).
 */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("আপলোড পড়া যায়নি — multipart form-data পাঠান।");
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "general");
  if (!(file instanceof File)) return badRequest("কোনো ফাইল পাওয়া যায়নি।");

  try {
    const saved = await saveUploadedFile(file, folder);
    return NextResponse.json({
      ok: true,
      upload: { ...saved, kind: kindFromExt(saved.ext) },
    });
  } catch (error) {
    if (error instanceof UploadError) return badRequest(error.message);
    console.error("[api/admin/upload] failed:", error);
    return badRequest("ফাইল সেভ করা যায়নি — আবার চেষ্টা করুন।");
  }
}
