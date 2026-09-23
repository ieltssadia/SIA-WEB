"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookCopy,
  BookOpenCheck,
  ClipboardList,
  Headphones,
  Layers,
  LibraryBig,
  Mic,
  PenLine,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { BookCover } from "@/components/site/cambridge/book-cover";

/* ── Payload types — GET /api/cambridge/books ─────────────────────────── */

type CambridgeModule = "academic" | "general";

interface CambridgeBookSummary {
  id: string;
  number: number;
  module: CambridgeModule;
  title: string;
  year: number;
  accent: string;
  blurb: string;
  testCount: number;
}

interface BooksResponse {
  ok: boolean;
  books?: CambridgeBookSummary[];
  error?: string;
}

/* ── IELTS listening/reading band conversion ──────────────────────────── */

function bandFromScaled(scaled: number): number {
  if (scaled >= 39) return 9;
  if (scaled >= 37) return 8.5;
  if (scaled >= 35) return 8;
  if (scaled >= 33) return 7.5;
  if (scaled >= 30) return 7;
  if (scaled >= 27) return 6.5;
  if (scaled >= 23) return 6;
  if (scaled >= 19) return 5.5;
  if (scaled >= 15) return 5;
  if (scaled >= 13) return 4.5;
  if (scaled >= 10) return 4;
  if (scaled >= 8) return 3.5;
  if (scaled >= 6) return 3;
  return 2.5;
}

function parseRawScore(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(40, Math.max(0, Math.round(parsed)));
}

function moduleLabel(module: CambridgeModule): string {
  return module === "academic" ? "Academic" : "General Training";
}

/* ── Stat card ────────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_10px_30px_rgba(11,42,32,0.08)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-tight text-foreground md:text-2xl">{value}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ── Raw score → band converter ───────────────────────────────────────── */

function BandConverter() {
  const [listeningRaw, setListeningRaw] = useState("");
  const [readingRaw, setReadingRaw] = useState("");

  const listeningScaled = parseRawScore(listeningRaw);
  const readingScaled = parseRawScore(readingRaw);

  const rows: Array<{ id: string; label: string; scaled: number | null }> = [
    { id: "band-listening", label: "Listening", scaled: listeningScaled },
    { id: "band-reading", label: "Reading", scaled: readingScaled },
  ];

  return (
    <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:grid-cols-2 md:p-8">
      <div>
        <h3 className="font-display text-xl font-bold text-foreground">Raw score → Band converter</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Count your correct answers from any Cambridge test and read off the estimated band instantly, the
          same conversion our mock checking uses.
        </p>
        <div className="mt-5 space-y-4">
          {rows.map((row) => (
            <div key={row.id}>
              <label
                htmlFor={row.id}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {row.label} raw score (0-40)
              </label>
              <Input
                id={row.id}
                type="number"
                min={0}
                max={40}
                inputMode="numeric"
                placeholder="e.g. 30"
                value={row.id === "band-listening" ? listeningRaw : readingRaw}
                onChange={(event) =>
                  row.id === "band-listening" ? setListeningRaw(event.target.value) : setReadingRaw(event.target.value)
                }
                className="mt-1.5 h-11 max-w-44"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-5 rounded-2xl bg-muted/50 p-6">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-foreground">{row.label}</p>
              <p className="text-xs text-muted-foreground">
                {row.scaled === null ? "Enter a raw score" : `${row.scaled}/40 raw`}
              </p>
            </div>
            <p className="font-display text-5xl font-bold text-brand-gradient md:text-6xl">
              {row.scaled === null ? "-" : bandFromScaled(row.scaled).toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

const INSIDE_FEATURES: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  { icon: Headphones, title: "Listening", desc: "Audio player, transcript & instant scoring" },
  { icon: BookOpenCheck, title: "Reading", desc: "Answers with per-question explanations" },
  { icon: PenLine, title: "Writing", desc: "Task prompts + Band-9 model answers" },
  { icon: Mic, title: "Speaking", desc: "Cue cards, sample audio & Part 1-3 sets" },
];

export default function CambridgePage() {
  const [books, setBooks] = useState<CambridgeBookSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [moduleFilter, setModuleFilter] = useState<CambridgeModule>("academic");
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Yield to a microtask first — state resets must not run synchronously
    // inside the effect body (react-hooks/set-state-in-effect).
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("loading");
    };
    void run();
    fetch("/api/cambridge/books", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as BooksResponse | null;
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error ?? "Failed to load Cambridge books");
        }
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setBooks(json.books ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  const editions = useMemo(() => new Set(books.map((b) => b.number)).size, [books]);
  const totalTests = useMemo(() => books.reduce((sum, b) => sum + b.testCount, 0), [books]);

  const visibleBooks = useMemo(
    () => books.filter((b) => b.module === moduleFilter),
    [books, moduleFilter]
  );

  const stats: Array<{ icon: LucideIcon; value: string; label: string }> = [
    { icon: LibraryBig, value: `${editions}`, label: "Editions" },
    { icon: BookCopy, value: `${books.length}`, label: "Books on shelf" },
    { icon: ClipboardList, value: `${totalTests}`, label: "Practice Tests" },
    { icon: Layers, value: `${totalTests * 4}`, label: "Skill Papers" },
  ];

  return (
    <>
      <PageHeader
        title={
          <>
            Every Cambridge book. Now <span className="text-brand-gradient">fully interactive.</span>
          </>
        }
        subtitle="১৯টি বই · ১৪০টি টেস্ট · উত্তর, ট্রান্সক্রিপ্ট, Band-9 স্যাম্পল ও অডিও সহ। সব একসাথে, একদম ফ্রি।"
        crumbs={[{ label: "Cambridge Library" }]}
      />

      {/* Stats + module toggle + books grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {status === "ready" ? (
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
                ))}
              </div>
            </Reveal>
          ) : null}

          {status === "error" ? (
            <Card className="mx-auto max-w-md items-center gap-3 p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" aria-hidden />
              </span>
              <p className="font-display text-lg font-bold text-foreground">আমরা শেলফটি লোড করতে পারিনি</p>
              <p className="text-sm text-muted-foreground">
                Something went wrong while loading the Cambridge library. Please check your connection and try
                again.
              </p>
              <Button
                onClick={() => setRetryTick((tick) => tick + 1)}
                className="mt-2 min-h-11 rounded-full bg-ink px-6 font-bold text-white hover:opacity-85"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
                Try again
              </Button>
            </Card>
          ) : null}

          {status === "ready" ? (
            <>
              {/* Module toggle */}
              <Reveal delay={0.08}>
                <div className="mt-12 flex flex-col items-center">
                  <div
                    role="group"
                    aria-label="Filter books by module"
                    className="inline-flex rounded-full border border-border bg-card p-1 shadow-[0_10px_30px_rgba(11,42,32,0.08)]"
                  >
                    {(["academic", "general"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setModuleFilter(value)}
                        aria-pressed={moduleFilter === value}
                        className={`min-h-9 rounded-full px-5 text-xs font-semibold transition-colors ${
                          moduleFilter === value
                            ? "bg-ink text-white"
                            : "text-foreground/70 hover:text-primary"
                        }`}
                      >
                        {moduleLabel(value)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Books 1-3 were published Academic-only. General Training shelves start from Book 4.
                  </p>
                </div>
              </Reveal>

              {/* Books grid */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4">
                {visibleBooks.map((book, index) => (
                  <Reveal key={book.id} delay={(index % 4) * 0.06} className="h-full">
                    <a
                      href={`#/cambridge/book/${book.number}?module=${book.module}`}
                      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      aria-label={`Open Cambridge IELTS ${moduleLabel(book.module)} Book ${book.number}`}
                    >
                      <Card className="h-full gap-4 p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_18px_44px_rgba(11,42,32,0.16)]">
                        <BookCover
                          bookNumber={book.number}
                          module={book.module}
                          year={book.year}
                          accent={book.accent}
                        />
                        <div className="flex flex-1 flex-col">
                          <h3 className="font-display text-sm font-bold leading-snug text-foreground">
                            {book.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {book.blurb}
                          </p>
                          <div className="mt-auto pt-3">
                            <Badge
                              variant="outline"
                              className="border-primary/25 bg-primary/5 text-[11px] font-semibold text-primary"
                            >
                              {book.testCount} Tests
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </a>
                  </Reveal>
                ))}
              </div>

              {visibleBooks.length === 0 ? (
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  No {moduleLabel(moduleFilter)} editions on the shelf yet, check back soon!
                </p>
              ) : null}
            </>
          ) : null}

          {status === "loading" ? (
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="gap-4 p-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Inside every test */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            title={
              <>
                Four skills, <span className="text-brand-gradient">fully solved</span>
              </>
            }
            subtitle="প্রতিটি টেস্টের চারটি স্কিল: প্রশ্ন, উত্তর, ব্যাখ্যা, ট্রান্সক্রিপ্ট আর Band-9 স্যাম্পল সহ।"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INSIDE_FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 4) * 0.06} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-[0_10px_30px_rgba(11,42,32,0.08)] transition-colors hover:border-primary/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Band score tools */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <SectionHeading
            title={
              <>
                Know your <span className="text-brand-gradient">band</span> before test day
              </>
            }
          />
          <Reveal>
            <BandConverter />
          </Reveal>
        </div>
      </section>

      {/* Dark CTA band */}
      <section className="pb-14 pt-4 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-[#121009] p-8 md:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d9b75c]/15 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#d9b75c]/10 blur-3xl"
              />
              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="font-display text-2xl font-bold leading-snug text-[#f6ecd4] md:text-3xl">
                    সাদিয়া&apos;র গাইডেন্সে Cambridge শেখা আলাদা
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#c6b995] md:text-base">
                    Mock test checking, speaking evaluation আর band guarantee, batch-এ ভর্তি হলেই।
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="min-h-11 rounded-full bg-white font-bold text-[#121009] hover:bg-white/90"
                  >
                    <a href="#/checkout">Enroll Now</a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-11 rounded-full border-white/25 bg-transparent font-semibold text-[#f6ecd4] hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <a href="#/courses">Browse Courses</a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
          <p className="mt-8 text-center text-[11px] text-muted-foreground">
            Practice content authored in the official Cambridge style for classroom use · Audio is demo
            narration.
          </p>
        </div>
      </section>
    </>
  );
}
