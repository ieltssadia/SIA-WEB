"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Buttery inertial scrolling (lenis) with graceful degradation:
 * - skipped entirely when the user prefers reduced motion
 * - wheel/trackpad events over dialogs, sheets, selects and the live-classroom
 *   chat panels are never hijacked (prevent predicate below) so their native
 *   overflow scrolling keeps working
 * - the router reads window.__lenis for scroll restoration & anchor jumps
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node) =>
        !!node.closest?.(
          '[data-lenis-prevent],[data-slot="sheet-content"],[data-slot="dialog-content"],[data-slot="select-content"],[cmdk-root],.live-scroll'
        ),
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
