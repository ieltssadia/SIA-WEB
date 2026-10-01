import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bookToPublic,
  courseToPublic,
  noticeToPublic,
  resourceToPublic,
  routineToPublic,
  siteTeamToPublic,
  tipToPublic,
} from "@/lib/admin-serialize";
import {
  books,
  courses,
  portalDownloads,
  portalNotices,
  teamMembers,
  tips,
  classRoutine,
} from "@/lib/site-data";

type CachedCatalog = {
  data: any;
  expires: number;
};

let cachedCatalog: CachedCatalog | null = null;
const CATALOG_CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * GET /api/catalog — the public, CMS-managed catalog in ONE payload.
 *
 * Every collection is DB-first: whatever the team manages in the admin CMS
 * (course prices, publish toggles, delisted books, added resources/notices,
 * tips, website team, class routine) is served here. A collection that has
 * no DB rows yet falls back to the matching static site-data default, so the
 * public site never renders empty.
 */
export async function GET() {
  const now = Date.now();
  if (cachedCatalog && cachedCatalog.expires > now) {
    return NextResponse.json(cachedCatalog.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  }

  try {
    const [dbCourses, dbBooks, dbResources, dbNotices, dbTips, dbTeam, dbRoutine] =
      await Promise.all([
        db.course.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
        db.book.findMany({ where: { listed: true }, orderBy: { createdAt: "asc" } }),
        db.downloadResource.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
        db.notice.findMany({ orderBy: { createdAt: "desc" } }),
        db.tip.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
        db.siteTeamMember.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
        db.routineSlot.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
      ]);

    const payload = {
      ok: true,
      courses: dbCourses.length ? dbCourses.map(courseToPublic) : courses,
      books: dbBooks.length ? dbBooks.map(bookToPublic) : books,
      resources: dbResources.length ? dbResources.map(resourceToPublic) : portalDownloads,
      notices: dbNotices.length ? dbNotices.map(noticeToPublic) : portalNotices,
      tips: dbTips.length ? dbTips.map(tipToPublic) : tips,
      team: dbTeam.length ? dbTeam.map(siteTeamToPublic) : teamMembers,
      routine: dbRoutine.length ? dbRoutine.map(routineToPublic) : classRoutine,
    };

    cachedCatalog = { data: payload, expires: Date.now() + CATALOG_CACHE_TTL_MS };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    // DB hiccup → static defaults keep the public site alive.
    console.error("[api/catalog] Falling back to static catalog:", error);
    const fallback = {
      ok: true,
      courses,
      books,
      resources: portalDownloads,
      notices: portalNotices,
      tips,
      team: teamMembers,
      routine: classRoutine,
    };
    return NextResponse.json(fallback);
  }
}
