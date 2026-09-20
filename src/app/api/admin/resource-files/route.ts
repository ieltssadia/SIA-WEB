import { NextResponse } from "next/server";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { getAuth, unauthorized } from "@/lib/admin-auth";
import type { AdminFileOption } from "@/lib/admin-types";

function sizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${bytes} B`;
}

/**
 * GET /api/admin/resource-files — list files under /public/downloads so the
 * resources manager can offer a file pick-list (with real sizes) instead of
 * asking for a raw URL.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  let files: AdminFileOption[] = [];
  try {
    const dir = path.join(process.cwd(), "public", "downloads");
    files = readdirSync(dir)
      .filter((f) => !f.startsWith("."))
      .map((f) => {
        const full = path.join(dir, f);
        const size = statSync(full).size;
        return {
          name: f,
          href: `/downloads/${f}`,
          size: sizeLabel(size),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    files = [];
  }

  return NextResponse.json({ ok: true, files });
}
