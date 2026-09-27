import { PrismaClient } from "@prisma/client";
import { teamMembers } from "../src/lib/site-data";

const db = new PrismaClient();

async function main() {
  console.log("Syncing team members in database...");
  await db.siteTeamMember.deleteMany({});

  for (const m of teamMembers) {
    const data = {
      slug: m.slug,
      name: m.name,
      role: m.role,
      tagline: m.tagline,
      photo: m.photo,
      chip: m.chip,
      bio: JSON.stringify(m.bio),
      specialties: JSON.stringify(m.specialties),
      credentials: JSON.stringify(m.credentials),
      stats: JSON.stringify(m.stats),
      quote: m.quote,
      published: true,
    };
    await db.siteTeamMember.create({ data });
    console.log(`Synced: ${m.name} (${m.role})`);
  }
  console.log("Team synced successfully!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
