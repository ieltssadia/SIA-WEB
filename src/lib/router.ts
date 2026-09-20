"use client";

import { useSyncExternalStore } from "react";

function normalize(hash: string): string {
  if (!hash || hash === "#") return "/";
  // App routes look like "#/courses/<slug>" or "#/checkout?course=<slug>"
  if (hash.startsWith("#/")) return hash.slice(1).split("?")[0] || "/";
  // Legacy section anchors (e.g. "#faq") stay on home and scroll
  return "/";
}

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

/**
 * Current route path derived from the URL hash, e.g.
 * "/", "/courses", "/courses/basic-to-ielts-in-batch", "/about".
 * Query strings ("#/checkout?course=x") are stripped — use useHashQuery().
 * Hydration-safe: renders "/" on the server, re-syncs after mount.
 */
export function useHashRoute(): string {
  return useSyncExternalStore(
    subscribe,
    () => normalize(window.location.hash),
    () => "/"
  );
}

/**
 * Query params of the current hash route, e.g. "#/checkout?course=x"
 * -> get("course") === "x". Hydration-safe: empty on the server.
 * (Snapshot is cached per query string — useSyncExternalStore requires
 * a stable value between renders.)
 */
let cachedQueryStr: string | null = null;
let cachedQuery = new URLSearchParams("");
const EMPTY_QUERY = new URLSearchParams("");

export function useHashQuery(): URLSearchParams {
  return useSyncExternalStore(
    subscribe,
    () => {
      const qs = window.location.hash.split("?")[1] ?? "";
      if (qs !== cachedQueryStr) {
        cachedQueryStr = qs;
        cachedQuery = new URLSearchParams(qs);
      }
      return cachedQuery;
    },
    () => EMPTY_QUERY
  );
}

/** Programmatic navigation, e.g. navigate("/courses"). */
export function navigate(route: string) {
  if (typeof window === "undefined") return;
  window.location.hash = route === "/" ? "#/" : `#${route}`;
}

/** Split a route into segments: "/courses/x" -> ["courses", "x"] */
export function routeSegments(route: string): string[] {
  return route.split("/").filter(Boolean);
}
