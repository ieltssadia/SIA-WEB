import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const NOT_FOUND_ERROR =
  "কোনো সার্টিফিকেট পাওয়া যায়নি — ID যাচাই করুন। (No certificate found for this ID.)";
const MISSING_ID_ERROR =
  "সার্টিফিকেট ID লিখুন — যেমন SIE-CERT-2417। (Please enter a certificate ID, e.g. SIE-CERT-2417.)";

// Public shape of a verified certificate — internal linkage (studentId,
// createdAt) never leaves the server.
type CertificateRecord = {
  id: string;
  name: string;
  course: string;
  batch: string;
  band: string;
  issued: string;
};

/**
 * Tolerant ID normalizer: "  sie cert 2417 ", "sie-cert--2417" and
 * "SIE-CERT-2417" all collapse to the canonical "SIE-CERT-2417".
 */
function normalizeId(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .split(/[\s-]+/)
    .filter(Boolean)
    .join("-");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = normalizeId(searchParams.get("id") ?? "");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: MISSING_ID_ERROR },
        { status: 400 }
      );
    }

    // Exact ID first; if the visitor typed only the number ("2417") retry
    // with the standard "SIE-CERT-" prefix before giving up.
    const candidates = [id];
    if (!id.startsWith("SIE-")) candidates.push(`SIE-CERT-${id}`);

    let cert: CertificateRecord | null = null;
    for (const candidate of candidates) {
      const found = await db.certificate.findUnique({
        where: { id: candidate },
      });
      if (found) {
        cert = {
          id: found.id,
          name: found.name,
          course: found.course,
          batch: found.batch,
          band: found.band,
          issued: found.issued,
        };
        break;
      }
    }

    if (!cert) {
      return NextResponse.json(
        { ok: false, error: NOT_FOUND_ERROR },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, cert });
  } catch (error) {
    console.error("[api/certificates/verify] Lookup failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "যাচাই করতে সমস্যা হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন। (Something went wrong while verifying, please try again.)",
      },
      { status: 500 }
    );
  }
}
