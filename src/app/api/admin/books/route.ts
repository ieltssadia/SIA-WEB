import { NextResponse } from "next/server";
import { readdirSync } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminBook } from "@/lib/admin-serialize";
import { bookSchema } from "@/lib/admin-schemas";

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];

/** Cover art available under /public/images/books — offered as a pick-list. */
function coverOptions(): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "images", "books");
    return readdirSync(dir)
      .filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()))
      .map((f) => `/images/books/${f}`)
      .sort();
  } catch {
    return [];
  }
}

/**
 * GET /api/admin/books — the shop catalog (all rows, listed + delisted).
 * Any signed-in team member can read; writes need admin/owner.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();

  const rows = await db.book.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    ok: true,
    books: rows.map(serializeAdminBook),
    coverOptions: coverOptions(),
  });
}

/** POST /api/admin/books — add a book to the shop (admin/owner). */
export async function POST(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid book data.");
  }
  const data = parsed.data;

  const clash = await db.book.findUnique({ where: { slug: data.slug } });
  if (clash) return badRequest("এই slug দিয়ে আগেই বই আছে, অন্যটা দিন।");

  const row = await db.book.create({
    data: {
      slug: data.slug,
      title: data.title,
      titleBn: data.titleBn,
      author: data.author,
      desc: data.desc,
      price: data.price,
      oldPrice: data.oldPrice,
      category: data.category,
      cover: data.cover,
      tag: data.tag,
      pages: data.pages,
      highlights: JSON.stringify(data.highlights),
      listed: data.listed,
    },
  });

  return NextResponse.json({ ok: true, book: serializeAdminBook(row) }, { status: 201 });
}
