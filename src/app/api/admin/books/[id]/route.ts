import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, forbidden, getAuth, unauthorized } from "@/lib/admin-auth";
import { serializeAdminBook } from "@/lib/admin-serialize";
import { bookSchema } from "@/lib/admin-schemas";

/**
 * PATCH /api/admin/books/[id] — edit a shop book (admin/owner). Partial body;
 * the common quick actions are price edits and the `listed` (delist) toggle.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request.");

  const parsed = bookSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid book data.");
  }
  const data = parsed.data;

  const existing = await db.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "বই পাওয়া যায়নি।" }, { status: 404 });
  }

  if (data.slug && data.slug !== existing.slug) {
    const clash = await db.book.findUnique({ where: { slug: data.slug } });
    if (clash) return badRequest("এই slug দিয়ে আগেই বই আছে, অন্যটা দিন।");
  }

  const row = await db.book.update({
    where: { id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.titleBn !== undefined ? { titleBn: data.titleBn } : {}),
      ...(data.author !== undefined ? { author: data.author } : {}),
      ...(data.desc !== undefined ? { desc: data.desc } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.oldPrice !== undefined ? { oldPrice: data.oldPrice } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.cover !== undefined ? { cover: data.cover } : {}),
      ...(data.tag !== undefined ? { tag: data.tag } : {}),
      ...(data.pages !== undefined ? { pages: data.pages } : {}),
      ...(data.highlights !== undefined
        ? { highlights: JSON.stringify(data.highlights) }
        : {}),
      ...(data.listed !== undefined ? { listed: data.listed } : {}),
    },
  });

  return NextResponse.json({ ok: true, book: serializeAdminBook(row) });
}

/** DELETE /api/admin/books/[id] — remove a book from the catalog (admin/owner). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  if (auth.role === "teacher") return forbidden();

  const { id } = await params;
  const existing = await db.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "বই পাওয়া যায়নি।" }, { status: 404 });
  }

  await db.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
