import { NextResponse } from "next/server";
import { getFromR2, getMimeType } from "@/lib/r2";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return NextResponse.json({ ok: false, error: "Path not specified" }, { status: 400 });
    }

    const key = slug.join("/");
    const res = await getFromR2(key);

    if (!res.Body) {
      return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
    }

    const ext = key.split(".").pop() || "";
    const contentType = res.ContentType || getMimeType(ext);

    // Stream the body back
    const byteArray = await res.Body.transformToByteArray();

    return new NextResponse(byteArray, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(res.ContentLength || byteArray.length),
      },
    });
  } catch (error: any) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
    }
    console.error("GET /api/media error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch file" }, { status: 500 });
  }
}
