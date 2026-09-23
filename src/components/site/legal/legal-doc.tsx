"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, ScrollText } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { site } from "@/lib/site-data";

/**
 * Shared document layout for legal pages (privacy, terms, refund…).
 *
 * Gives every legal page the same polished reading experience:
 * - Sticky table of contents on desktop (collapsible <details> on mobile)
 * - Numbered, scroll-synced sections
 * - "Last updated" badge and a contact card at the end
 *
 * NOTE: the site uses hash routing ("#/terms"), so in-page anchors like
 * "#intro" would hijack the router. TOC links therefore scroll via JS
 * (lenis-aware) instead of href anchors.
 */

export type LegalSectionMeta = { id: string; title: string };

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -110, duration: 0.9 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TocList({
  sections,
  activeId,
  onNavigate,
}: {
  sections: LegalSectionMeta[];
  activeId: string;
  onNavigate?: () => void;
}) {
  const list = sections ?? [];
  return (
    <ol className="space-y-1">
      {list.map((section, i) => (
        <li key={section.id}>
          <button
            type="button"
            onClick={() => {
              scrollToId(section.id);
              onNavigate?.();
            }}
            aria-current={activeId === section.id ? "true" : undefined}
            className={`flex w-full items-baseline gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] leading-snug transition-colors ${
              activeId === section.id
                ? "bg-primary/10 font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span
              className={`w-5 shrink-0 text-right text-[11px] font-semibold tabular-nums ${
                activeId === section.id ? "text-primary" : "text-muted-foreground/50"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{section.title}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function LegalDoc({
  updated,
  intro,
  sections,
  children,
}: {
  /** Bengali "last updated" line, e.g. "২৩ সেপ্টেম্বর ২০২৬" */
  updated: string;
  intro: string;
  sections: LegalSectionMeta[];
  children: React.ReactNode;
}) {
  const items = sections ?? [];
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Highlight the section currently in view (scroll-synced TOC).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );
    for (const s of items) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <section className="relative overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 h-[320px] w-[320px] rounded-full bg-radial-glow blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sidebar — sticky TOC (desktop) */}
          <aside className="hidden lg:block" aria-label="সূচিপত্র">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <ScrollText className="h-3.5 w-3.5" aria-hidden />
                  সূচিপত্র
                </p>
                <TocList sections={sections} activeId={activeId} />
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  সর্বশেষ হালনাগাদ
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">{updated}</p>
              </div>
            </div>
          </aside>

          {/* Document body */}
          <Reveal y={16}>
            <article className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-10">
              {/* Last-updated pill (visible on all sizes) */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
                  সর্বশেষ হালনাগাদ: {updated}
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  সদিয়া&apos;স আইএলটিএস
                </span>
              </div>

              <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {intro}
              </p>

              {/* Mobile TOC — collapsible */}
              <details
                open={mobileTocOpen}
                onToggle={(e) => setMobileTocOpen((e.target as HTMLDetailsElement).open)}
                className="mt-6 rounded-xl border border-border/70 bg-muted/40 lg:hidden"
              >
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  সূচিপত্র ({items.length}টি অনুচ্ছেদ)
                </summary>
                <div className="px-2 pb-3">
                  <TocList
                    sections={sections}
                    activeId={activeId}
                    onNavigate={() => setMobileTocOpen(false)}
                  />
                </div>
              </details>

              <div className="mt-8 space-y-10">{children}</div>
            </article>
          </Reveal>
        </div>

        {/* Contact card — every legal doc ends with a way to reach us */}
        <Reveal y={16} delay={0.05}>
          <div className="mt-10 grid gap-4 rounded-2xl border border-border/70 bg-forest p-6 text-[#c6b995] sm:grid-cols-3 md:p-8">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b75c]">
                <Phone className="h-3.5 w-3.5" aria-hidden /> ফোন
              </p>
              <a
                href={site.phoneHref}
                className="mt-2 block text-sm transition-colors hover:text-white"
              >
                {site.phone}
              </a>
              <a
                href={`tel:${site.phone2.replace(/[^+\d]/g, "")}`}
                className="block text-sm transition-colors hover:text-white"
              >
                {site.phone2}
              </a>
            </div>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b75c]">
                <Mail className="h-3.5 w-3.5" aria-hidden /> ইমেইল
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 block break-all text-sm transition-colors hover:text-white"
              >
                {site.email}
              </a>
              <a
                href={`mailto:${site.email2}`}
                className="block break-all text-sm transition-colors hover:text-white"
              >
                {site.email2}
              </a>
            </div>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b75c]">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> ঠিকানা
              </p>
              <p className="mt-2 text-sm leading-relaxed">{site.address}</p>
            </div>
            <p className="text-sm sm:col-span-3">
              আরও প্রশ্ন থাকলে{" "}
              <Link
                href="#/contact"
                className="font-semibold text-[#d9b75c] underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                যোগাযোগ পেজ
              </Link>
              -এ মেসেজ করুন, আমরা Sat-Thu, 9AM-9PM পর্যন্ত থাকি।
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** One numbered section of a legal document. */
export function LegalSection({
  index,
  id,
  title,
  children,
}: {
  index: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-border/60 pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="flex items-baseline gap-3 font-display text-lg font-bold text-foreground md:text-xl">
        <span
          aria-hidden
          className="text-sm font-semibold tabular-nums text-primary md:text-base"
        >
          {String(index).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-muted-foreground md:text-[15px]">
        {children}
      </div>
    </section>
  );
}

/** Gold-marked bullet list used inside legal sections. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-primary/70"
          />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Highlighted callout box for important notes. */
export function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 text-[14px] leading-relaxed text-foreground">
      {children}
    </div>
  );
}
