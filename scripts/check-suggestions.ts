import { db } from "../src/lib/db";
async function main() {
  const rows = await db.suggestion.findMany({ orderBy: { createdAt: "asc" } });
  console.log("Suggestion rows:", rows.length);
  for (const r of rows) {
    console.log("-", JSON.stringify({ id: r.id, title: r.title, category: r.category, kind: r.kind, fileUrl: r.fileUrl, published: r.published }));
  }
  const students = await db.student.findMany({ include: { enrollments: true } });
  for (const s of students) console.log("student:", s.phone, s.name, "enrollments:", s.enrollments.map(e => e.courseSlug).join(","));
  await db.$disconnect();
}
main();
