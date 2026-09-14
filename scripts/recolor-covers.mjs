import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const ACCENTS = ["#262012", "#2E5FA3", "#2E7D5B", "#A63A4C", "#7A5AA0", "#B5771E", "#171410", "#332B1A", "#2C4F8A", "#1E1B14"];
const books = await db.cambridgeBook.findMany({ select: { id: true, number: true, module: true } });
for (const b of books) {
  const edition = b.module === "general" ? "general" : "academic";
  const accent = ACCENTS[(b.number + (edition === "general" ? 4 : 0)) % ACCENTS.length];
  await db.cambridgeBook.update({ where: { id: b.id }, data: { accent } });
}
console.log("updated", books.length, "books");
await db.$disconnect();
