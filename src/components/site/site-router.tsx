"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { routeSegments, useHashRoute, useHashQuery } from "@/lib/router";
import { useCartStore } from "@/lib/cart-store";
import { usePortalStore } from "@/lib/portal-store";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PartnerStrip } from "@/components/site/partner-strip";
import { FloatingCta } from "@/components/site/floating-cta";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { HomePage } from "@/components/site/pages/home-page";
import { CoursesPage } from "@/components/site/pages/courses-page";
import { CourseDetailPage } from "@/components/site/pages/course-detail-page";
import { RoutinePage } from "@/components/site/pages/routine-page";
import { AboutPage } from "@/components/site/pages/about-page";
import { TipsPage } from "@/components/site/pages/tips-page";
import { StoriesPage } from "@/components/site/pages/stories-page";
import { LivePage } from "@/components/site/pages/live-page";
import { LiveClassroomPage } from "@/components/site/pages/live-classroom-page";
import { ShopPage } from "@/components/site/pages/shop-page";
import { ContactPage } from "@/components/site/pages/contact-page";
import { PortalPage } from "@/components/site/pages/portal-page";
import { CheckoutPage } from "@/components/site/pages/checkout-page";
import { VerifyPage } from "@/components/site/pages/verify-page";
import { AdminPage } from "@/components/site/pages/admin-page";

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
 *
 * The whole public site sits inside a floating white rounded shell on the
 * warm-gray canvas (LabAcademy-style), pages cross-fade on navigation, and
 * scrolling is smoothed by lenis (see SmoothScroll).
 */
export function SiteRouter() {
  const route = useHashRoute();
  const rawHash = useRawHash();
  const segments = routeSegments(route);
  const query = useHashQuery();

  // Restore persisted stores AFTER mount (skipHydration) — restoring during
  // the first client render races React hydration and causes mismatches.
  useEffect(() => {
    usePortalStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  // Scroll management: legacy anchors scroll to their section, pages go to top.
  // Uses the lenis instance when present so smooth scrolling stays in sync.
  useEffect(() => {
    const lenis = window.__lenis;
    if (rawHash && !rawHash.startsWith("#/")) {
      const id = rawHash.slice(1);
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.1 });
          else el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tries++ < 30) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    } else {
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [rawHash]);

  // Admin panel renders FULL-SCREEN — no public header/footer/CTA.
  // (Early return: every hook above has already run, so this is safe.)
  if (segments[0] === "admin") {
    return <AdminPage />;
  }

  const routeKey = segments.join("/") || "home";

  let page: React.ReactNode;
  if (segments[0] === "courses" && segments[1]) {
    page = <CourseDetailPage slug={segments[1]} />;
  } else if (segments[0] === "courses") {
    page = <CoursesPage />;
  } else if (segments[0] === "live" && segments[1]) {
    page = <LiveClassroomPage slug={segments[1]} />;
  } else if (segments[0] === "live") {
    page = <LivePage />;
  } else if (segments[0] === "routine") {
    page = <RoutinePage />;
  } else if (segments[0] === "about") {
    page = <AboutPage />;
  } else if (segments[0] === "tips") {
    page = <TipsPage />;
  } else if (segments[0] === "stories") {
    page = <StoriesPage />;
  } else if (segments[0] === "shop") {
    page = <ShopPage />;
  } else if (segments[0] === "contact") {
    page = <ContactPage />;
  } else if (segments[0] === "portal") {
    page = <PortalPage />;
  } else if (segments[0] === "checkout") {
    page = <CheckoutPage initialCourse={query.get("course")} />;
  } else if (segments[0] === "verify") {
    page = <VerifyPage />;
  } else {
    page = <HomePage />;
  }

  return (
    <div className="flex min-h-screen flex-col px-2 pb-3 pt-2 sm:px-4 sm:pb-5 sm:pt-3">
      {/* Floating white shell — the entire public site lives inside it */}
      <div className="flex w-full flex-1 flex-col rounded-[1.5rem] bg-card shadow-[0_24px_80px_rgba(16,22,19,0.09)] ring-1 ring-border/70 sm:rounded-[2rem]">
        <SiteHeader />
        <main className="flex-1">
          {/* Page transition — keyed cross-fade + rise on every navigation */}
          <motion.div
            key={routeKey}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {page}
          </motion.div>
        </main>
        {/* Partner trust band is a homepage-only section, pinned above the footer */}
        <div className="mt-auto">
          {segments.length === 0 && <PartnerStrip />}
          <SiteFooter />
        </div>
      </div>
      <FloatingCta />
      <SmoothScroll />
    </div>
  );
}
