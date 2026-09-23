"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  Facebook,
  Headphones,
  Info,
  MessageCircle,
  Phone,
  Pin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import { bnNum } from "@/components/site/portal/portal-utils";
import { portalNotices, routineNote, site } from "@/lib/site-data";

/** Notice shape served by /api/catalog (matches the static portalNotices rows). */
type CatalogNotice = { date: string; tag: string; title: string; body: string };

const tagStyles: Record<string, string> = {
  "Class Update": "border-primary/40 bg-primary/10 text-primary",
  "Mock Test": "border-amber-600/40 bg-amber-500/10 text-amber-700",
  "Speaking Club": "border-[#28694d]/40 bg-[#2e7d5b]/10 text-[#225941]",
  Notice: "border-border bg-accent text-muted-foreground",
};

const filterTags = ["সব", "Class Update", "Mock Test", "Speaking Club", "Notice"] as const;

const monthBn: Record<string, string> = {
  Jan: "জানুয়ারি",
  Feb: "ফেব্রুয়ারি",
  Mar: "মার্চ",
  Apr: "এপ্রিল",
  May: "মে",
  Jun: "জুন",
  Jul: "জুলাই",
  Aug: "আগস্ট",
  Sep: "সেপ্টেম্বর",
  Oct: "অক্টোবর",
  Nov: "নভেম্বর",
  Dec: "ডিসেম্বর",
};

/** "10 Sep" → "১০ সেপ্টেম্বর" — static data, deterministic, hydration-safe. */
function noticeDateBn(raw: string): string {
  const [d, m] = raw.split(" ");
  return `${bnNum(d)} ${monthBn[m] ?? m}`;
}

const supportItems = [
  {
    icon: MessageCircle,
    label: "ব্যাচ WhatsApp গ্রুপ",
    desc: "ক্লাস লিংক ও নোটিশ",
    href: site.whatsapp,
    external: true,
  },
  {
    icon: Phone,
    label: "কল সাপোর্ট",
    desc: site.phone,
    href: site.phoneHref,
    external: false,
  },
  {
    icon: Facebook,
    label: "Facebook পেজ",
    desc: "ফ্রি লাইভ ক্লাস",
    href: site.facebook,
    external: true,
  },
  {
    icon: Headphones,
    label: "ফ্রি টিপস ও ট্রিকস",
    desc: "প্র্যাকটিস ম্যাটেরিয়াল",
    href: "#/tips",
    external: false,
  },
];

export function NoticesSection() {
  const [filter, setFilter] = useState<(typeof filterTags)[number]>("সব");
  const [catalog, setCatalog] = useState<{ notices: CatalogNotice[] }>({
    notices: portalNotices,
  });

  /* CMS-managed notices — static import paints first, then /api/catalog swaps in. */
  useEffect(() => {
    let alive = true;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok) setCatalog({ notices: d.notices as CatalogNotice[] });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const allNotices = catalog.notices;

  const notices = useMemo(
    () => (filter === "সব" ? allNotices : allNotices.filter((n) => n.tag === filter)),
    [allNotices, filter]
  );

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          title="নোটিশ বোর্ড"
          desc="রুটিন পরিবর্তন, mock test আর ব্যাচের সব আপডেট, সব নোটিশ এক জায়গায়, সময়ের ক্রমে সাজানো।"
          action={
            <Badge variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Bell className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {bnNum(allNotices.length)} টি নোটিশ
            </Badge>
          }
        />
      </Reveal>

      {/* Category filter chips */}
      <Reveal y={12} delay={0.03}>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="নোটিশ ক্যাটাগরি">
          {filterTags.map((tag) => {
            const active = filter === tag;
            const count = tag === "সব" ? allNotices.length : allNotices.filter((n) => n.tag === tag).length;
            return (
              <button
                key={tag}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tag)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "border-[#d9b75c] bg-[#d9b75c] text-ink"
                    : "border-border bg-secondary text-secondary-foreground hover:border-[#d9b75c]/50 hover:text-primary"
                )}
              >
                {tag}
                <span className={cn("ml-1.5 tabular-nums", active ? "text-ink/70" : "text-muted-foreground/60")}>
                  {bnNum(count)}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Timeline */}
      <Reveal y={12} delay={0.06}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="space-y-4">
            {notices.map((n, i) => (
              <article
                key={n.title}
                className={cn(
                  "relative flex gap-4 rounded-2xl border p-4",
                  i === 0
                    ? "border-[#d9b75c]/40 bg-[#d9b75c]/[0.05]"
                    : "border-border bg-muted/50"
                )}
              >
                {/* Timeline dot + connector */}
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold",
                      i === 0 ? "bg-[#d9b75c] text-ink" : "bg-primary/10 text-primary"
                    )}
                  >
                    {bnNum(n.date.split(" ")[0])}
                  </span>
                  {i < notices.length - 1 ? (
                    <span className="mt-2 w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-semibold", tagStyles[n.tag] ?? tagStyles.Notice)}
                    >
                      {n.tag}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{noticeDateBn(n.date)}</span>
                    {i === 0 ? (
                      <Badge className="bg-gold-gradient text-[9px] font-bold uppercase tracking-wider text-ink hover:bg-gold-gradient">
                        <Pin className="mr-0.5 h-2.5 w-2.5" aria-hidden />
                        সর্বশেষ
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">{n.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Routine change note */}
      <Reveal y={12} delay={0.08}>
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Info className="h-4 w-4" aria-hidden />
            {routineNote.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{routineNote.message}</p>
        </div>
      </Reveal>

      {/* Support */}
      <Reveal y={12} delay={0.1}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">সাপোর্ট দরকার?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            যেকোনো সমস্যায় সরাসরি কথা বলুন, আমরা সকাল ৯টা থেকে রাত ৯টা পর্যন্ত পাশে আছি।
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {supportItems.map(({ icon: Icon, label, desc, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{desc}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-primary" aria-hidden />
            সাপোর্ট আওয়ার: শনিবার-বৃহস্পতিবার, সকাল ৯টা-রাত ৯টা (GMT+6)
          </p>
        </div>
      </Reveal>
    </div>
  );
}
