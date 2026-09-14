import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const books = await db.cambridgeBook.findMany({ where: { number: { in: [14,15,16,17,18,19] }, module: "academic" }, select: { number: true, accent: true }, orderBy: { number: "desc" } });
console.log(books);
await db.$disconnect();
