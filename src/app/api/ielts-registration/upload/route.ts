import { NextResponse } from "next/server";
import { saveUploadedFile, UploadError } from "@/lib/upload-server";

export async function POST(req: Request) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { ok: false, error: "ফর্ম ডেটা পড়া সম্ভব হয়নি।" },
        { status: 400 }
      );
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "কোনো ফাইল পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    // Limit candidate document upload to 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "ফাইল সাইজ সর্বোচ্চ ১৫ MB হতে পারবে।" },
        { status: 400 }
      );
    }

    const saved = await saveUploadedFile(file, "general");

    return NextResponse.json({
      ok: true,
      url: saved.url,
      name: saved.name,
      sizeLabel: saved.sizeLabel,
    });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error("[api/ielts-registration/upload] error:", error);
    return NextResponse.json(
      { ok: false, error: "ফাইল আপলোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
