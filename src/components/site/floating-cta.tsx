"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/site-data";

/**
 * Floating quick-contact widget (10MS/edtech style):
 * appears after the user scrolls past the hero, sticks bottom-right.
 * Mobile: icon-only circles (48px touch targets). Desktop: labeled pills.
 */
export function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-5 right-4 z-40 flex flex-col gap-2 rounded-3xl border border-border bg-card p-2 shadow-[0_10px_30px_rgba(16,22,19,0.14)] transition-all duration-300 sm:bottom-6 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* WhatsApp */}
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Sadia's IELTS on WhatsApp — opens in a new tab"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        <span className="ml-2 hidden text-sm font-semibold sm:inline">WhatsApp</span>
      </a>

      {/* Call */}
      <a
        href={site.phoneHref}
        aria-label={`Call Sadia's IELTS at ${site.phone}`}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-[0_8px_24px_rgba(16,22,19,0.18)] transition-transform hover:scale-105 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
      >
        <Phone className="h-5 w-5" aria-hidden />
        <span className="ml-2 hidden text-sm font-semibold sm:inline">Call Now</span>
      </a>
    </div>
  );
}
