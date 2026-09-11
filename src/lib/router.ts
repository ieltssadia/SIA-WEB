"use client";

import { useSyncExternalStore } from "react";

function normalize(hash: string): string {
  if (!hash || hash === "#") return "/";
  // App routes look like "#/courses/<slug>"
  if (hash.startsWith("#/")) return hash.slice(1) || "/";
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
 * Hydration-safe: renders "/" on the server, re-syncs after mount.
 */
export function useHashRoute(): string {
  return useSyncExternalStore(
    subscribe,
    () => normalize(window.location.hash),
    () => "/"
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
