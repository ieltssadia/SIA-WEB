/**
 * Registry of the admin-managed, editable SITE CONTENT collections (the
 * WordPress-style sections): tips, faqs, site team, routine, gallery and
 * suggestions. One generic API (/api/admin/content/<entity>) serves CRUD for
 * every entry here — adding a new editable collection means adding one
 * entry to this registry plus the shared schemas/serializers.
 *
 * Writes are admin/owner-only (enforced in the route); reads are for any
 * signed-in team member. Public reads go through /api/catalog instead.
 */
import { z } from "zod";
import { db } from "@/lib/db";
import {
  faqSchema,
  gallerySchema,
  routineSchema,
  siteTeamSchema,
  suggestionSchema,
  tipSchema,
} from "@/lib/admin-schemas";
import {
  faqToPublic,
  galleryToPublic,
  routineToPublic,
  serializeAdminFaq,
  serializeAdminGallery,
  serializeAdminRoutine,
  serializeAdminSiteTeam,
  serializeAdminSuggestion,
  serializeAdminTip,
  siteTeamToPublic,
  suggestionToPublic,
  tipToPublic,
} from "@/lib/admin-serialize";

type TipInput = z.infer<typeof tipSchema>;
type FaqInput = z.infer<typeof faqSchema>;
type SiteTeamInput = z.infer<typeof siteTeamSchema>;
type RoutineInput = z.infer<typeof routineSchema>;
type GalleryInput = z.infer<typeof gallerySchema>;
type SuggestionInput = z.infer<typeof suggestionSchema>;

/** Partial<z.infer<S>> with zod defaults removed (PATCH bodies). */
type Patch<T> = { [K in keyof T]?: T[K] };

export const CONTENT_ENTITIES = [
  "tips",
  "faqs",
  "site-team",
  "routine",
  "gallery",
  "suggestions",
] as const;

export type ContentEntity = (typeof CONTENT_ENTITIES)[number];

export function isContentEntity(value: string): value is ContentEntity {
  return (CONTENT_ENTITIES as readonly string[]).includes(value);
}

type EntityDef<S extends z.ZodType> = {
  /** Full-body schema for POST (zod defaults applied). */
  schema: S;
  /** Row → admin UI row. */
  serialize: (row: never) => unknown;
  /** Row → public site-data shape (catalog payload). */
  toPublic: (row: never) => unknown;
  list: () => Promise<unknown[]>;
  find: (id: string) => Promise<unknown | null>;
  create: (data: z.infer<S>) => Promise<unknown>;
  update: (id: string, data: Patch<z.infer<S>>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
};

export const contentEntities: {
  tips: EntityDef<typeof tipSchema>;
  faqs: EntityDef<typeof faqSchema>;
  "site-team": EntityDef<typeof siteTeamSchema>;
  routine: EntityDef<typeof routineSchema>;
  gallery: EntityDef<typeof gallerySchema>;
  suggestions: EntityDef<typeof suggestionSchema>;
} = {
  tips: {
    schema: tipSchema,
    serialize: serializeAdminTip,
    toPublic: tipToPublic,
    list: () =>
      db.tip.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    find: (id) => db.tip.findUnique({ where: { id } }),
    create: (d) => db.tip.create({ data: d }),
    update: (id, d) => db.tip.update({ where: { id }, data: d }),
    remove: (id) => db.tip.delete({ where: { id } }),
  },
  faqs: {
    schema: faqSchema,
    serialize: serializeAdminFaq,
    toPublic: faqToPublic,
    list: () =>
      db.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    find: (id) => db.faqItem.findUnique({ where: { id } }),
    create: (d) => db.faqItem.create({ data: d }),
    update: (id, d) => db.faqItem.update({ where: { id }, data: d }),
    remove: (id) => db.faqItem.delete({ where: { id } }),
  },
  "site-team": {
    schema: siteTeamSchema,
    serialize: serializeAdminSiteTeam,
    toPublic: siteTeamToPublic,
    list: () =>
      db.siteTeamMember.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    find: (id) => db.siteTeamMember.findUnique({ where: { id } }),
    create: (d: SiteTeamInput) =>
      db.siteTeamMember.create({
        data: {
          slug: d.slug,
          name: d.name,
          role: d.role,
          tagline: d.tagline,
          photo: d.photo,
          chip: d.chip,
          bio: JSON.stringify(d.bio),
          specialties: JSON.stringify(d.specialties),
          credentials: JSON.stringify(d.credentials),
          stats: JSON.stringify(d.stats),
          quote: d.quote,
          sortOrder: d.sortOrder,
          published: d.published,
        },
      }),
    update: (id, d: Patch<SiteTeamInput>) =>
      db.siteTeamMember.update({
        where: { id },
        data: {
          ...(d.slug !== undefined ? { slug: d.slug } : {}),
          ...(d.name !== undefined ? { name: d.name } : {}),
          ...(d.role !== undefined ? { role: d.role } : {}),
          ...(d.tagline !== undefined ? { tagline: d.tagline } : {}),
          ...(d.photo !== undefined ? { photo: d.photo } : {}),
          ...(d.chip !== undefined ? { chip: d.chip } : {}),
          ...(d.bio !== undefined ? { bio: JSON.stringify(d.bio) } : {}),
          ...(d.specialties !== undefined
            ? { specialties: JSON.stringify(d.specialties) }
            : {}),
          ...(d.credentials !== undefined
            ? { credentials: JSON.stringify(d.credentials) }
            : {}),
          ...(d.stats !== undefined ? { stats: JSON.stringify(d.stats) } : {}),
          ...(d.quote !== undefined ? { quote: d.quote } : {}),
          ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
          ...(d.published !== undefined ? { published: d.published } : {}),
        },
      }),
    remove: (id) => db.siteTeamMember.delete({ where: { id } }),
  },
  routine: {
    schema: routineSchema,
    serialize: serializeAdminRoutine,
    toPublic: routineToPublic,
    list: () =>
      db.routineEntry.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    find: (id) => db.routineEntry.findUnique({ where: { id } }),
    create: (d) => db.routineEntry.create({ data: d }),
    update: (id, d) => db.routineEntry.update({ where: { id }, data: d }),
    remove: (id) => db.routineEntry.delete({ where: { id } }),
  },
  gallery: {
    schema: gallerySchema,
    serialize: serializeAdminGallery,
    toPublic: galleryToPublic,
    list: () =>
      db.galleryPhoto.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    find: (id) => db.galleryPhoto.findUnique({ where: { id } }),
    create: (d) => db.galleryPhoto.create({ data: d }),
    update: (id, d) => db.galleryPhoto.update({ where: { id }, data: d }),
    remove: (id) => db.galleryPhoto.delete({ where: { id } }),
  },
  suggestions: {
    schema: suggestionSchema,
    serialize: serializeAdminSuggestion,
    toPublic: suggestionToPublic,
    list: () =>
      db.suggestion.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    find: (id) => db.suggestion.findUnique({ where: { id } }),
    create: (d: SuggestionInput) =>
      db.suggestion.create({
        data: {
          slug: d.slug,
          kind: d.kind,
          title: d.title,
          desc: d.desc,
          href: d.href,
          meta: JSON.stringify(d.meta),
          addedOn: d.addedOn,
          isNew: d.isNew,
          published: d.published,
        },
      }),
    update: (id, d: Patch<SuggestionInput>) =>
      db.suggestion.update({
        where: { id },
        data: {
          ...(d.slug !== undefined ? { slug: d.slug } : {}),
          ...(d.kind !== undefined ? { kind: d.kind } : {}),
          ...(d.title !== undefined ? { title: d.title } : {}),
          ...(d.desc !== undefined ? { desc: d.desc } : {}),
          ...(d.href !== undefined ? { href: d.href } : {}),
          ...(d.meta !== undefined ? { meta: JSON.stringify(d.meta) } : {}),
          ...(d.addedOn !== undefined ? { addedOn: d.addedOn } : {}),
          ...(d.isNew !== undefined ? { isNew: d.isNew } : {}),
          ...(d.published !== undefined ? { published: d.published } : {}),
        },
      }),
    remove: (id) => db.suggestion.delete({ where: { id } }),
  },
};

/** Human label used in error messages. */
export const CONTENT_LABELS: Record<ContentEntity, string> = {
  tips: "টিপস",
  faqs: "প্রশ্নোত্তর",
  "site-team": "টিম মেম্বার",
  routine: "রুটিন এন্ট্রি",
  gallery: "গ্যালারি ছবি",
  suggestions: "সাজেশন",
};

/** Unique-field clash checks before create/update (per entity). */
export async function findContentClash(
  entity: ContentEntity,
  field: "slug",
  value: string
): Promise<boolean> {
  if (entity === "site-team") {
    return (await db.siteTeamMember.findUnique({ where: { slug: value } })) !== null;
  }
  if (entity === "suggestions") {
    return (await db.suggestion.findUnique({ where: { slug: value } })) !== null;
  }
  return false;
}
