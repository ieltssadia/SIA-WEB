"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileCode2,
  FileText,
  Hash,
  Lightbulb,
  Link2,
  Lock,
  Music,
  Play,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import { bnNum } from "@/components/site/portal/portal-utils";
import { usePortalStore } from "@/lib/portal-store";

type SuggestionKind = "html" | "pdf" | "audio" | "video" | "link";

type SuggestionItem = {
  id: string;
  title: string;
  desc: string;
  category: string;
  fileUrl: string;
  kind: SuggestionKind;
  serial?: number | null;
  createdAt: string;
};

type LoadState =
  | { phase: "loading" }
  | { phase: "locked" }
  | { phase: "ready"; items: SuggestionItem[] };

/** Serial buckets derived from the test titles — mirrors the DB serial order. */
type SerialGroup = "all" | "full-test" | "listening" | "other";

const groupMeta: Record<
  Exclude<SerialGroup, "all">,
  { label: string; tile: string }
> = {
  "full-test": { label: "ফুল প্র্যাকটিস টেস্ট", tile: "bg-pastel-sky text-[#2c4f8a]" },
  listening: { label: "লিসেনিং টেস্ট", tile: "bg-pastel-green text-[#1f5c40]" },
  other: { label: "অন্যান্য প্র্যাকটিস", tile: "bg-pastel-butter text-[#7a5a16]" },
};

function groupOf(item: SuggestionItem): Exclude<SerialGroup, "all"> {
  if (/Listening Full Test/i.test(item.title)) return "full-test";
  if (/Listening Test/i.test(item.title)) return "listening";
  return "other";
}

const kindMeta: Record<SuggestionKind, { icon: LucideIcon; label: string; tile: string }> = {
  html: { icon: FileCode2, label: "HTML Test", tile: "bg-pastel-sky text-[#2c4f8a]" },
  pdf: { icon: FileText, label: "PDF", tile: "bg-pastel-ruby text-[#7a2734]" },
  audio: { icon: Music, label: "Audio", tile: "bg-pastel-green text-[#1f5c40]" },
  video: { icon: Video, label: "Video", tile: "bg-pastel-orange text-[#7a4c12]" },
  link: { icon: Link2, label: "Link", tile: "bg-pastel-butter text-[#7a5a16]" },
};

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/** ISO createdAt → "২৩ সেপ্টেম্বর" — client-only (data arrives post-mount), hydration-safe. */
function uploadedDateBn(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${bnNum(d.getDate())} ${BN_MONTHS[d.getMonth()] ?? ""}`;
}

const cardClass =
  "group flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#d9b75c]/60 hover:shadow-[0_10px_28px_rgba(217,183,92,0.14)]";

const actionPillClass =
  "flex h-8 items-center gap-1.5 rounded-full border border-primary/30 px-3 text-xs font-bold text-primary transition-all group-hover:border-[#d9b75c] group-hover:bg-[#d9b75c] group-hover:text-ink";

/* ------------------------------------------------------------------ */
/*  Serial badge — gold coin with the Bengali serial number            */
/* ------------------------------------------------------------------ */

function SerialBadge({ serial }: { serial: number }) {
  return (
    <span
      title={`সিরিয়াল ${bnNum(serial)}`}
      className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#eeda9d] via-[#d9b75c] to-[#b08a2e] px-1.5 font-display text-[13px] font-extrabold text-ink shadow-[0_3px_10px_rgba(176,138,46,0.35)]"
    >
      {bnNum(serial)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Full-screen in-portal viewer (self-contained branded HTML tests)    */
/* ------------------------------------------------------------------ */

function SuggestionViewer({
  item,
  onClose,
}: {
  item: SuggestionItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[60] flex flex-col bg-background"
    >
      {/* Viewer top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-9 shrink-0 rounded-full border-border/80 font-semibold"
        >
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
          ফিরে যান
        </Button>
        <p className="min-w-0 flex-1 truncate text-center text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {typeof item.serial === "number" ? `সিরিয়াল ${bnNum(item.serial)} · ` : ""}
          {item.title} · SUGGESTIONS
        </p>
        <Button asChild size="sm" className="h-9 shrink-0 rounded-full bg-[#d9b75c] font-bold text-ink hover:opacity-90">
          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-3.5 w-3.5" aria-hidden />
            নত খুলুন
          </a>
        </Button>
      </div>

      {/* Branded exam page */}
      <div className="min-h-0 flex-1">
        <iframe src={item.fileUrl} className="h-full w-full border-0" title={item.title} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggestion card                                                    */
/* ------------------------------------------------------------------ */

function SuggestionCard({
  item,
  onOpenHtml,
}: {
  item: SuggestionItem;
  onOpenHtml: (item: SuggestionItem) => void;
}) {
  const group = groupOf(item);
  const date = uploadedDateBn(item.createdAt);
  const hasSerial = typeof item.serial === "number";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {hasSerial ? (
            <SerialBadge serial={item.serial as number} />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground" aria-hidden>
              <Hash className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a7d5f]">
              {groupMeta[group].label}
            </p>
            {date ? (
              <p className="text-[10px] font-semibold text-muted-foreground/70">
                আপলোড · {date}
              </p>
            ) : null}
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-border/70 bg-muted/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          {item.kind === "html" ? "ইন্টার‍্যাক্টিভ" : kindMeta[item.kind]?.label ?? "ফাইল"}
        </Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {item.title}
      </p>
      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {item.desc}
      </p>
      {item.kind === "audio" ? (
        <audio
          controls
          preload="none"
          src={item.fileUrl}
          className="mt-3 h-9 w-full"
          aria-label={item.title}
        />
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {hasSerial ? `সিরিয়াল ${bnNum(item.serial as number)}` : "SUGGESTIONS"}
        </span>
        {item.kind === "html" ? (
          <span className={actionPillClass}>
            <Play className="h-3.5 w-3.5" aria-hidden />
            খুলুন
          </span>
        ) : item.kind === "audio" ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={actionPillClass}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            নত ট্যাবে খুলুন
          </a>
        ) : (
          <span className={actionPillClass}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            নত ট্যাবে খুলুন
          </span>
        )}
      </div>
    </>
  );

  // HTML tests open the full-screen in-portal viewer; audio plays inline plus
  // a new-tab escape hatch; everything else opens straight in a new tab.
  if (item.kind === "html") {
    return (
      <button
        type="button"
        onClick={() => onOpenHtml(item)}
        aria-haspopup="dialog"
        className={cn(cardClass, "cursor-pointer")}
      >
        {body}
      </button>
    );
  }
  if (item.kind === "audio") {
    return <article className={cardClass}>{body}</article>;
  }
  return (
    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {body}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function SuggestionsSection() {
  const user = usePortalStore((s) => s.user);
  const phone = user?.phone ?? null;
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [active, setActive] = useState<SuggestionItem | null>(null);
  const [filter, setFilter] = useState<SerialGroup>("all");
  const closeViewer = useCallback(() => setActive(null), []);
  const openViewer = useCallback((item: SuggestionItem) => setActive(item), []);

  useEffect(() => {
    if (!phone) return;
    let alive = true;
    // Same auth shape as /api/portal/data — phone query param, no header.
    fetch(`/api/portal/suggestions?phone=${encodeURIComponent(phone)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (d?.ok && d.locked === true) {
          setState({ phase: "locked" });
        } else if (d?.ok && Array.isArray(d.suggestions)) {
          setState({ phase: "ready", items: d.suggestions as SuggestionItem[] });
        } else {
          // API hiccup — degrade to the honest empty state, never a fake list.
          setState({ phase: "ready", items: [] });
        }
      })
      .catch(() => {
        if (alive) setState({ phase: "ready", items: [] });
      });
    return () => {
      alive = false;
    };
  }, [phone]);

  // Group counts for the filter chips — recomputed only when items change.
  const items = state.phase === "ready" ? state.items : [];
  const counts = useMemo(() => {
    const c: Record<SerialGroup, number> = { all: items.length, "full-test": 0, listening: 0, other: 0 };
    for (const item of items) c[groupOf(item)] += 1;
    return c;
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => groupOf(i) === filter)),
    [items, filter]
  );

  const filterChips: { key: SerialGroup; label: string }[] = [
    { key: "all", label: "সবগুলো" },
    { key: "full-test", label: groupMeta["full-test"].label },
    { key: "listening", label: groupMeta["listening"].label },
    { key: "other", label: groupMeta["other"].label },
  ];

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          title="সাজেশন ও প্র্যাকটিস"
          desc="কোর্সের সাজেশন, ফুল প্র্যাকটিস টেস্ট আর স্টাডি ফাইল, সব এক জায়গায়, সিরিয়াল অনুযায়ী সাজানো।"
          action={
            state.phase === "ready" && state.items.length > 0 ? (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <Lightbulb className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {bnNum(state.items.length)} টি আইটেম
              </Badge>
            ) : null
          }
        />
      </Reveal>

      {state.phase === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : null}

      {state.phase === "locked" ? (
        <Reveal y={12} delay={0.04}>
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-[#d9b75c]/45 bg-[#d9b75c]/[0.06] px-6 py-14 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-radial-glow blur-2xl"
            />
            <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b75c]/15">
              <Lock className="h-8 w-8 text-[#8a7a4d]" aria-hidden />
            </span>
            <h2 className="relative mx-auto mt-5 max-w-lg font-display text-xl font-bold leading-snug text-foreground md:text-2xl">
              সাজেশন ও প্র্যাকটিস টেস্ট শুধু পেইড কোর্সের শিক্ষার্থীদের জন্য
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              যেকোনো পেইড কোর্সে ভর্তি হলেই সব সাজেশন ও ফুল প্র্যাকটিস টেস্ট আনলক হবে।
            </p>
            <Button
              asChild
              size="lg"
              className="relative mt-7 rounded-full bg-ink font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85"
            >
              <a href="#/courses">
                <Lightbulb className="mr-2 h-4.5 w-4.5" aria-hidden />
                কোর্স দেখুন
              </a>
            </Button>
          </div>
        </Reveal>
      ) : null}

      {state.phase === "ready" ? (
        state.items.length > 0 ? (
          <>
            {/* Serial-group filter chips */}
            <Reveal y={12} delay={0.02}>
              <div
                role="tablist"
                aria-label="সাজেশন ফিল্টার"
                className="flex flex-wrap items-center gap-2"
              >
                {filterChips.map((chip) => {
                  const isActive = filter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setFilter(chip.key)}
                      className={cn(
                        "flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all",
                        isActive
                          ? "border-transparent bg-gradient-to-br from-[#eeda9d] via-[#d9b75c] to-[#b08a2e] text-ink shadow-[0_4px_14px_rgba(176,138,46,0.35)]"
                          : "border-border bg-card text-muted-foreground hover:border-[#d9b75c]/60 hover:text-foreground"
                      )}
                    >
                      {chip.label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none",
                          isActive ? "bg-ink/15 text-ink" : "bg-muted/70 text-muted-foreground"
                        )}
                      >
                        {bnNum(counts[chip.key])}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal y={12} delay={0.04}>
              {visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => (
                    <SuggestionCard key={item.id} item={item} onOpenHtml={openViewer} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
                  <p className="font-display text-base font-bold text-foreground">
                    এই ক্যাটাগরিতে এখনো কিছু নেই
                  </p>
                  <p className="text-sm text-muted-foreground">
                    অন্য ক্যাটাগরি দেখুন, নতুন ফাইল যোগ হতে থাকবে।
                  </p>
                </div>
              )}
            </Reveal>
          </>
        ) : (
          <Reveal y={12} delay={0.04}>
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" aria-hidden />
              </span>
              <p className="font-display text-base font-bold text-foreground">
                এখনো কোনো সাজেশন আপলোড হয়নি
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                আপডেটের জন্য অপেক্ষা করুন, নতুন সাজেশন ও প্র্যাকটিস টেস্ট এখানেই যোগ হতে থাকবে।
              </p>
            </div>
          </Reveal>
        )
      ) : null}

      {active ? <SuggestionViewer item={active} onClose={closeViewer} /> : null}
    </div>
  );
}
