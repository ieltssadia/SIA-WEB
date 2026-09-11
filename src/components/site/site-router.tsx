"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { routeSegments, useHashRoute } from "@/lib/router";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FloatingCta } from "@/components/site/floating-cta";
import { HomePage } from "@/components/site/pages/home-page";
import { CoursesPage } from "@/components/site/pages/courses-page";
import { CourseDetailPage } from "@/components/site/pages/course-detail-page";
import { RoutinePage } from "@/components/site/pages/routine-page";
import { AboutPage } from "@/components/site/pages/about-page";
import { TipsPage } from "@/components/site/pages/tips-page";
import { StoriesPage } from "@/components/site/pages/stories-page";
import { ContactPage } from "@/components/site/pages/contact-page";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

/** Raw hash (incl. legacy "#faq" anchors) — drives scroll restoration. */
function useRawHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => ""
  );
}

/**
 * Client-side multipage router.
 *
 * The sandbox preview only exposes the "/" route, so pages live under hash
 * routes ("#/courses", "#/about", ...) which behave like real pages:
 * browser back/forward works and links are shareable. Legacy section anchors
 * ("#faq") stay supported by scrolling on the home page.
 */
export function SiteRouter() {
  const route = useHashRoute();
  const rawHash = useRawHash();
  const segments = routeSegments(route);

  // Scroll management: legacy anchors scroll to their section, pages go to top
  useEffect(() => {
    if (rawHash && !rawHash.startsWith("#/")) {
      const id = rawHash.slice(1);
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tries++ < 30) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [rawHash]);

  let page: React.ReactNode;
  if (segments[0] === "courses" && segments[1]) {
    page = <CourseDetailPage slug={segments[1]} />;
  } else if (segments[0] === "courses") {
    page = <CoursesPage />;
  } else if (segments[0] === "routine") {
    page = <RoutinePage />;
  } else if (segments[0] === "about") {
    page = <AboutPage />;
  } else if (segments[0] === "tips") {
    page = <TipsPage />;
  } else if (segments[0] === "stories") {
    page = <StoriesPage />;
  } else if (segments[0] === "contact") {
    page = <ContactPage />;
  } else {
    page = <HomePage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{page}</main>
      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
