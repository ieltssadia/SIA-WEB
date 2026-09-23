"use client";

import { useSyncExternalStore } from "react";
import {
  books,
  classRoutine,
  courses,
  faqs,
  routineNote,
  site,
  teamMembers,
  tips,
  type Book,
  type Course,
  type RoutineClass,
  type TeamMember,
} from "@/lib/site-data";

/**
 * Live site content from the admin CMS — ONE /api/catalog fetch shared by
 * every public component (module-level cache).
 *
 * Hydration-safe by construction: the first snapshot on BOTH server and
 * client is the static site-data object; after the fetch resolves the state
 * object is swapped and subscribers re-render. Nothing changes between the
 * server render and the hydration render.
 *
 * Fallback semantics (same as the API): if the fetch fails, the static
 * defaults keep the site fully rendered.
 */

export type CatalogTip = { icon: string; category: string; title: string; excerpt: string };
export type CatalogFaq = { q: string; a: string };
export type CatalogGallery = { id: string; title: string; caption: string; image: string };
export type CatalogSettings = typeof site & { routineNote: typeof routineNote };

export type CatalogState = {
  /** True once /api/catalog resolved (DB values are in). */
  loaded: boolean;
  tips: CatalogTip[];
  faqs: CatalogFaq[];
  team: TeamMember[];
  routine: RoutineClass[];
  gallery: CatalogGallery[];
  courses: Course[];
  books: Book[];
  settings: CatalogSettings;
};

function initialState(): CatalogState {
  return {
    loaded: false,
    tips,
    faqs,
    team: teamMembers,
    routine: classRoutine,
    gallery: [],
    courses,
    books,
    settings: { ...site, routineNote },
  };
}

let state: CatalogState = initialState();
const listeners = new Set<() => void>();
let fetchStarted = false;

function setState(next: CatalogState) {
  state = next;
  for (const listener of listeners) listener();
}

function ensureFetch() {
  if (fetchStarted || typeof window === "undefined") return;
  fetchStarted = true;
  fetch("/api/catalog", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      if (!data?.ok) return;
      setState({
        loaded: true,
        tips: Array.isArray(data.tips) && data.tips.length ? data.tips : tips,
        faqs: Array.isArray(data.faqs) && data.faqs.length ? data.faqs : faqs,
        team: Array.isArray(data.team) && data.team.length ? data.team : teamMembers,
        routine: Array.isArray(data.routine) && data.routine.length ? data.routine : classRoutine,
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
        courses: Array.isArray(data.courses) && data.courses.length ? data.courses : courses,
        books: Array.isArray(data.books) && data.books.length ? data.books : books,
        settings: data.settings ?? { ...site, routineNote },
      });
    })
    .catch(() => {
      // Network/DB hiccup — static defaults stay rendered.
    });
}

function subscribe(callback: () => void): () => void {
  ensureFetch();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** `tel:` href derived from a display phone like "+880 1752-716238". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

/** Live CMS content for public components — static defaults until loaded. */
export function useCatalog(): CatalogState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  );
}
