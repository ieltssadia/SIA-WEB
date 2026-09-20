/**
 * Shared serializers for the admin CMS — DB rows → typed admin rows (JSON
 * string columns like features/syllabus/highlights parsed back to arrays)
 * and DB rows → the public site-data shapes served by /api/catalog.
 */
import type {
  AdminUser,
  Book as DbBook,
  Course as DbCourse,
  DownloadResource,
  Notice,
} from "@prisma/client";
import type {
  AdminBookRow,
  AdminCourseRow,
  AdminNoticeRow,
  AdminResourceRow,
  AdminRole,
  AdminTeamMember,
} from "@/lib/admin-types";

function parseJsonArray(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin rows
// ---------------------------------------------------------------------------

export function serializeTeamMember(u: AdminUser): AdminTeamMember {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as AdminRole,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeAdminCourse(row: DbCourse): AdminCourseRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleBn: row.titleBn,
    desc: row.desc,
    lessons: row.lessons,
    duration: row.duration,
    price: row.price,
    oldPrice: row.oldPrice ?? null,
    tag: row.tag,
    icon: row.icon,
    features: parseJsonArray(row.features),
    category: row.category,
    rating: Math.round(row.rating * 10) / 10,
    students: row.students,
    nextBatch: row.nextBatch,
    mode: row.mode,
    scheduleNote: row.scheduleNote,
    seatsLeft: row.seatsLeft ?? null,
    seatsTotal: row.seatsTotal ?? null,
    accessPeriod: row.accessPeriod ?? null,
    syllabus: parseJsonArray(row.syllabus),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAdminBook(row: DbBook): AdminBookRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleBn: row.titleBn,
    author: row.author,
    desc: row.desc,
    price: row.price,
    oldPrice: row.oldPrice ?? null,
    category: row.category,
    cover: row.cover,
    tag: row.tag ?? null,
    pages: row.pages,
    highlights: parseJsonArray(row.highlights),
    listed: row.listed,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAdminResource(row: DownloadResource): AdminResourceRow {
  return {
    id: row.id,
    title: row.title,
    desc: row.desc,
    category: row.category,
    type: row.type,
    size: row.size,
    href: row.href,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAdminNotice(row: Notice): AdminNoticeRow {
  return {
    id: row.id,
    date: row.date,
    tag: row.tag,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Public (site-data-shaped) rows for /api/catalog
// ---------------------------------------------------------------------------

type PublicCourse = {
  slug: string;
  title: string;
  titleBn: string;
  desc: string;
  lessons: number;
  duration: string;
  price: number | null;
  oldPrice?: number;
  tag: string;
  icon: string;
  features: string[];
  category: "complete" | "beginner" | "exam";
  rating: number;
  students: number;
  nextBatch: string;
  mode: string;
  syllabus: string[];
  scheduleNote: string;
  seatsLeft?: number;
  seatsTotal?: number;
  accessPeriod?: string;
};

export function courseToPublic(row: DbCourse): PublicCourse {
  const course: PublicCourse = {
    slug: row.slug,
    title: row.title,
    titleBn: row.titleBn,
    desc: row.desc,
    lessons: row.lessons,
    duration: row.duration,
    price: row.price ?? null,
    tag: row.tag,
    icon: row.icon,
    features: parseJsonArray(row.features),
    category: row.category as PublicCourse["category"],
    rating: Math.round(row.rating * 10) / 10,
    students: row.students,
    nextBatch: row.nextBatch,
    mode: row.mode,
    syllabus: parseJsonArray(row.syllabus),
    scheduleNote: row.scheduleNote,
  };
  if (row.oldPrice != null) course.oldPrice = row.oldPrice;
  if (row.seatsLeft != null) course.seatsLeft = row.seatsLeft;
  if (row.seatsTotal != null) course.seatsTotal = row.seatsTotal;
  if (row.accessPeriod != null) course.accessPeriod = row.accessPeriod;
  return course;
}

type PublicBook = {
  slug: string;
  title: string;
  titleBn: string;
  author: string;
  desc: string;
  price: number;
  oldPrice?: number;
  category: string;
  cover: string;
  tag?: string;
  pages: number;
  highlights: string[];
};

export function bookToPublic(row: DbBook): PublicBook {
  const book: PublicBook = {
    slug: row.slug,
    title: row.title,
    titleBn: row.titleBn,
    author: row.author,
    desc: row.desc,
    price: row.price,
    category: row.category,
    cover: row.cover,
    pages: row.pages,
    highlights: parseJsonArray(row.highlights),
  };
  if (row.oldPrice != null) book.oldPrice = row.oldPrice;
  if (row.tag) book.tag = row.tag;
  return book;
}

export function resourceToPublic(row: DownloadResource) {
  return {
    id: row.id,
    title: row.title,
    desc: row.desc,
    category: row.category,
    type: row.type,
    size: row.size,
    href: row.href,
  };
}

export function noticeToPublic(row: Notice) {
  return { date: row.date, tag: row.tag, title: row.title, body: row.body };
}

// ---------------------------------------------------------------------------
// Task 21 no-code collections
// ---------------------------------------------------------------------------

function parseJsonStats(raw: string): { value: string; label: string }[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((v) => v && typeof v === "object")
      .map((v) => ({ value: String((v as { value: unknown }).value ?? ""), label: String((v as { label: unknown }).label ?? "") }))
      .filter((v) => v.value && v.label);
  } catch {
    return [];
  }
}

import type {
  RoutineSlot as DbRoutineSlot,
  SiteTeamMember as DbSiteTeamMember,
  Suggestion as DbSuggestion,
  Tip as DbTip,
} from "@prisma/client";
import type {
  AdminRoutineRow,
  AdminSiteTeamRow,
  AdminSuggestionRow,
  AdminTipRow,
} from "@/lib/admin-types";

export function serializeAdminTip(row: DbTip): AdminTipRow {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    icon: row.icon,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAdminSiteTeamMember(row: DbSiteTeamMember): AdminSiteTeamRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    tagline: row.tagline,
    photo: row.photo,
    chip: row.chip,
    bio: parseJsonArray(row.bio),
    specialties: parseJsonArray(row.specialties),
    credentials: parseJsonArray(row.credentials),
    stats: parseJsonStats(row.stats),
    quote: row.quote,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAdminRoutine(row: DbRoutineSlot): AdminRoutineRow {
  return {
    id: row.id,
    day: row.day,
    start: row.start,
    end: row.end,
    courseSlug: row.courseSlug,
    batch: row.batch,
    topic: row.topic,
    mode: row.mode,
    type: row.type,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAdminSuggestion(row: DbSuggestion): AdminSuggestionRow {
  return {
    id: row.id,
    title: row.title,
    desc: row.desc,
    category: row.category,
    fileUrl: row.fileUrl,
    kind: row.kind,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
  };
}

// Public catalog shapes (served by /api/catalog with static fallbacks)

export function tipToPublic(row: DbTip) {
  return { icon: row.icon, category: row.category, title: row.title, excerpt: row.excerpt };
}

export function siteTeamToPublic(row: DbSiteTeamMember) {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    tagline: row.tagline,
    photo: row.photo,
    chip: row.chip,
    bio: parseJsonArray(row.bio),
    specialties: parseJsonArray(row.specialties),
    credentials: parseJsonArray(row.credentials),
    stats: parseJsonStats(row.stats),
    quote: row.quote,
  };
}

export function routineToPublic(row: DbRoutineSlot) {
  return {
    day: row.day,
    start: row.start,
    end: row.end,
    courseSlug: row.courseSlug,
    batch: row.batch,
    topic: row.topic,
    mode: row.mode,
    type: row.type,
  };
}
