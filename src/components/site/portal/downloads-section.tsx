"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpenCheck,
  Download,
  FileText,
  FolderDown,
  Layers,
  Mic,
  PenLine,
  Search,
  SearchX,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import { bnNum } from "@/components/site/portal/portal-utils";
import {
  portalDownloadCategories,
  portalDownloads,
  type PortalDownload,
} from "@/lib/site-data";

const categoryIcon: Record<PortalDownload["category"], LucideIcon> = {
  writing: PenLine,
  speaking: Mic,
  vocabulary: BookOpenCheck,
  "mock-tools": FileText,
};

const categoryLabel: Record<PortalDownload["category"], string> = {
  writing: "Writing",
  speaking: "Speaking",
  vocabulary: "Vocabulary",
  "mock-tools": "Mock Tools",
};

const categoryTint: Record<PortalDownload["category"], string> = {
  writing: "bg-pastel-sky text-[#2c4f8a]",
  speaking: "bg-pastel-ruby text-[#7a2734]",
  vocabulary: "bg-pastel-green text-[#1f5c40]",
  "mock-tools": "bg-pastel-butter text-[#7a5a16]",
};

/** One download card — clear type/size meta + one obvious action. */
function DownloadCard({ item }: { item: PortalDownload }) {
  const Icon = categoryIcon[item.category];
  return (
    <a
      href={item.href}
      download
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[#d9b75c]/60 hover:shadow-[0_10px_28px_rgba(217,183,92,0.14)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            categoryTint[item.category]
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <Badge
          variant="outline"
          className="shrink-0 border-border/70 bg-muted/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          {item.type} · {item.size}
        </Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {item.title}
      </p>
      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {item.desc}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {categoryLabel[item.category]}
        </span>
        <span className="flex h-8 items-center gap-1.5 rounded-full border border-primary/30 px-3 text-xs font-bold text-primary transition-all group-hover:border-[#d9b75c] group-hover:bg-[#d9b75c] group-hover:text-ink">
          <Download className="h-3.5 w-3.5" aria-hidden />
          ডাউনলোড
        </span>
      </div>
    </a>
  );
}

export function DownloadsSection() {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  // CMS-managed resources (admin panel) — static site-data is the fallback.
  const [resources, setResources] = useState<PortalDownload[]>(portalDownloads);

  useEffect(() => {
    let alive = true;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok && Array.isArray(d.resources)) {
          setResources(d.resources as PortalDownload[]);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of resources) {
      map.set(d.category, (map.get(d.category) ?? 0) + 1);
    }
    return map;
  }, [resources]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((d) => {
      const inCategory = category === "all" || d.category === category;
      const inQuery =
        q.length === 0 ||
        d.title.toLowerCase().includes(q) ||
        d.desc.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [category, query, resources]);

  const totalSizeKb = resources.reduce(
    (sum, d) => sum + (parseFloat(d.size) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          title="ডাউনলোড কর্নার"
          desc="ক্লাসে বলা সব ম্যাটেরিয়ালস এখান থেকে সরাসরি ডাউনলোড করুন, কোনো রিকোয়েস্ট লাগবে না, যখন দরকার তখনই নামিয়ে নিন।"
          action={
            <Badge variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <FolderDown className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {bnNum(resources.length)} টি ফাইল
            </Badge>
          }
        />
      </Reveal>

      {/* Library stats */}
      <Reveal y={12} delay={0.03}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileText, value: String(resources.length), label: "ফাইল" },
            { icon: Layers, value: String(portalDownloadCategories.length - 1), label: "ক্যাটাগরি" },
            { icon: Download, value: `${Math.round(totalSizeKb)} KB`, label: "সাইজ" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 sm:p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
                <Icon className="h-4.5 w-4.5 text-primary" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold leading-tight text-foreground sm:text-lg">
                  {value}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">{label}</span>
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Search + category filters */}
      <Reveal y={12} delay={0.06}>
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ফাইল খুঁজুন, যেমন: Task 2, cue card, answer sheet…"
                aria-label="ডাউনলোড ফাইল সার্চ"
                className="h-11 rounded-full border-border bg-secondary pl-10 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="ক্যাটাগরি ফিল্টার">
              {portalDownloadCategories.map((c) => {
                const active = category === c.id;
                const count = c.id === "all" ? resources.length : (counts.get(c.id) ?? 0);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "border-[#d9b75c] bg-[#d9b75c] text-ink"
                        : "border-border bg-secondary text-secondary-foreground hover:border-[#d9b75c]/50 hover:text-primary"
                    )}
                  >
                    {c.label}
                    <span className={cn("ml-1.5 tabular-nums", active ? "text-ink/70" : "text-muted-foreground/60")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Files grid */}
      <Reveal y={12} delay={0.09}>
        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <SearchX className="h-6 w-6 text-primary" aria-hidden />
            </span>
            <p className="font-display text-base font-bold text-foreground">কোনো ফাইল মেলেনি</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              অন্য শব্দে খুঁজে দেখুন বা ফিল্টার রিসেট করুন, সব ম্যাটেরিয়ালস এই পেজেই সাজানো আছে।
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-1 rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
            >
              ফিল্টার রিসেট করুন
            </Button>
          </div>
        )}
      </Reveal>

      {/* Cambridge cross-sell */}
      <Reveal y={12} delay={0.12}>
        <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-[#d9b75c]/30 bg-[#d9b75c]/[0.07] p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/15">
              <BadgeCheck className="h-5 w-5 text-[#8a7a4d]" aria-hidden />
            </span>
            <p className="text-sm leading-snug text-foreground">
              <span className="font-semibold">আরও প্র্যাকটিস লাগবে?</span> Cambridge
              লাইব্রেরিতে ১৯ বইয়ের ফুল প্র্যাকটিস টেস্ট আপনার জন্য খোলা।
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="h-9 shrink-0 rounded-full bg-[#d9b75c] font-bold text-ink hover:opacity-90"
          >
            <a href="#/cambridge">
              <BadgeCheck className="mr-1.5 h-4 w-4" aria-hidden />
              Cambridge Library
            </a>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
