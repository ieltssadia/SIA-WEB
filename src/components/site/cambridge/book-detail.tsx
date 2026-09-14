"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  Headphones,
  Layers,
  PenLine,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/site/reveal";

/* ── Payload types — GET /api/cambridge/books/{number}?module=… ───────── */

type CambridgeModule = "academic" | "general";
type SkillKey = "listening" | "reading" | "writing" | "speaking";

interface BookTestMeta {
  id: string;
  number: number;
  listening: { durationMin: number; parts: Array<{ title: string; qCount: number }> };
  reading: { durationMin: number; kind: string; passages: Array<{ title: string; qCount: number }> };
  writing: { task1Kind: string; task1Prompt: string; task2Prompt: string };
  speaking: { part1Topic: string; part2Prompt: string };
}

interface BookDetailPayload {
  id: string;
  number: number;
  module: CambridgeModule;
  title: string;
  year: number;
  accent: string;
  blurb: string;
  tests: BookTestMeta[];
}

interface BookResponse {
  ok: boolean;
  book?: BookDetailPayload;
  error?: string;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function moduleLabel(module: CambridgeModule): string {
  return module === "academic" ? "Academic" : "General Training";
}

/* Same CSS-generated cover art as the library grid, scaled up. */
function BookCoverArt({
  bookNumber,
  module: bookModule,
  year,
  accent,
}: {
  bookNumber: number;
  module: CambridgeModule;
  year: number;
  accent: string;
}) {
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-[0_14px_40px_rgba(11,42,32,0.22)]"
      style={{ backgroundColor: accent }}
    >
      <div aria-hidden className="absolute inset-2.5 rounded-lg border border-white/20" />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/45 via-black/10 to-transparent"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-white/10" />
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/85">Cambridge IELTS</p>
        <p className="text-center font-display text-8xl font-bold leading-none text-white drop-shadow-md">
          {bookNumber}
        </p>
        <div className="flex items-end justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
          <span>{moduleLabel(bookModule)}</span>
          <span>{year}</span>
        </div>
      </div>
    </div>
  );
}

function skillTiles(test: BookTestMeta): Array<{ key: SkillKey; icon: LucideIcon; name: string; meta: string }> {
  const listeningQ = test.listening.parts.reduce((sum, part) => sum + part.qCount, 0);
  const readingQ = test.reading.passages.reduce((sum, passage) => sum + passage.qCount, 0);
  return [
    {
      key: "listening",
      icon: Headphones,
      name: "Listening",
      meta: `${test.listening.durationMin} min · ${test.listening.parts.length} parts · ${listeningQ} questions`,
    },
    {
      key: "reading",
      icon: BookOpenCheck,
      name: "Reading",
      meta: `${test.reading.durationMin} min · ${test.reading.passages.length} passages · ${readingQ} questions`,
    },
    {
      key: "writing",
      icon: PenLine,
      name: "Writing",
      meta: `Task 1 ${test.writing.task1Kind === "letter" ? "letter" : "report"} + Task 2 essay`,
    },
    {
      key: "speaking",
      icon: Layers,
      name: "Speaking",
      meta: "Part 1–3 · cue card · sample audio",
    },
  ];
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function BookDetail({
  bookNumber,
  module,
}: {
  bookNumber: number;
  module: "academic" | "general";
}) {
  const [book, setBook] = useState<BookDetailPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [notFound, setNotFound] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Yield to a microtask first — state resets must not run synchronously
    // inside the effect body (react-hooks/set-state-in-effect).
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("loading");
      setNotFound(false);
    };
    void run();
    fetch(`/api/cambridge/books/${encodeURIComponent(String(bookNumber))}?module=${module}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as BookResponse | null;
        if (!res.ok || !json?.ok || !json.book) {
          throw Object.assign(new Error(json?.error ?? "Failed to load book"), { status: res.status });
        }
        return json.book;
      })
      .then((payload) => {
        if (cancelled) return;
        setBook(payload);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setNotFound((error as { status?: number })?.status === 404);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [bookNumber, module, retryTick]);

  /* Book-level reading question total for the hero mini stat row. */
  const readingTotal = useMemo(
    () =>
      book
        ? book.tests.reduce(
            (sum, test) => sum + test.reading.passages.reduce((s, passage) => s + passage.qCount, 0),
            0
          )
        : 0,
    [book]
  );

  const generalAvailable = bookNumber >= 4;

  function switchModule(next: CambridgeModule) {
    if (next === module) return;
    window.location.hash = `#/cambridge/book/${bookNumber}?module=${next}`;
  }

  const heroStats: Array<{ icon: LucideIcon; label: string }> = [
    { icon: Layers, label: `${book?.tests.length ?? 4} tests` },
    { icon: Headphones, label: "Listening 40 q" },
    { icon: BookOpenCheck, label: `Reading ${readingTotal} q` },
    { icon: PenLine, label: "Writing 2 tasks" },
  ];

  return (
    <div className="py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Breadcrumb row: back link + module switcher chips */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="#/cambridge"
            className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Cambridge Library
          </a>
          <div role="group" aria-label="Switch module edition" className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchModule("academic")}
              aria-pressed={module === "academic"}
              className={`min-h-9 rounded-full border px-4 text-xs font-semibold transition-colors ${
                module === "academic"
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary"
              }`}
            >
              Academic
            </button>
            <button
              type="button"
              onClick={() => switchModule("general")}
              disabled={!generalAvailable}
              title={generalAvailable ? undefined : "Academic only"}
              aria-pressed={module === "general"}
              aria-disabled={!generalAvailable}
              className={`min-h-9 rounded-full border px-4 text-xs font-semibold transition-colors ${
                module === "general"
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary"
              } ${generalAvailable ? "" : "cursor-not-allowed opacity-50"}`}
            >
              General Training
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {status === "loading" ? (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <Skeleton className="aspect-[3/4] w-40 shrink-0 rounded-xl sm:w-48" />
              <div className="flex-1 space-y-3 pt-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            </div>
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="gap-4 p-4 md:p-6">
                <Skeleton className="h-8 w-40 rounded-full" />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((__, tile) => (
                    <Skeleton key={tile} className="h-36 rounded-xl" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Error / not-found */}
        {status === "error" ? (
          <Card className="mx-auto mt-10 max-w-lg items-center gap-3 p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </span>
            <p className="font-display text-lg font-bold text-foreground">
              {notFound ? "এই বইটি শেলফে নেই" : "বইটি লোড করা যায়নি"}
            </p>
            <p className="text-sm text-muted-foreground">
              {notFound
                ? `Cambridge IELTS ${moduleLabel(module)} Book ${bookNumber} isn't on the shelf. Books 1–3 are Academic-only; General Training shelves start from Book 4.`
                : "Something went wrong while loading this book. Please try again."}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setRetryTick((tick) => tick + 1)}
                className="min-h-11 rounded-full bg-ink px-6 font-bold text-white hover:opacity-85"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
                Try again
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-full border-primary/30 font-semibold hover:border-primary/60 hover:text-primary"
              >
                <a href="#/cambridge">Back to Library</a>
              </Button>
            </div>
          </Card>
        ) : null}

        {/* Book content */}
        {status === "ready" && book ? (
          <>
            {/* Hero */}
            <Reveal>
              <div className="mt-8 flex flex-col gap-6 md:flex-row">
                <div className="w-40 shrink-0 sm:w-48">
                  <BookCoverArt
                    bookNumber={book.number}
                    module={book.module}
                    year={book.year}
                    accent={book.accent}
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                    {book.title}
                  </h1>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-border text-foreground/80">
                      {book.year}
                    </Badge>
                    <Badge className="border-transparent bg-primary/10 text-primary">
                      {moduleLabel(book.module)}
                    </Badge>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {book.blurb}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroStats.map((stat) => (
                      <span
                        key={stat.label}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground/80"
                      >
                        <stat.icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                        {stat.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Tests */}
            <div className="mt-10 space-y-6">
              {book.tests.map((test, index) => {
                const tiles = skillTiles(test);
                const totalQuestions =
                  test.listening.parts.reduce((sum, part) => sum + part.qCount, 0) +
                  test.reading.passages.reduce((sum, passage) => sum + passage.qCount, 0);
                return (
                  <Reveal key={test.id} delay={Math.min(index, 3) * 0.05}>
                    <Card className="gap-5 p-4 md:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex min-h-9 items-center rounded-full bg-ink px-4 text-xs font-bold text-white">
                            Test {test.number}
                          </span>
                          <h2 className="font-display text-base font-bold text-foreground md:text-lg">
                            Cambridge IELTS {book.number} — Test {test.number}
                          </h2>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-primary/25 bg-primary/5 font-semibold text-primary"
                        >
                          {totalQuestions} questions · 4 skills
                        </Badge>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {tiles.map((tile) => (
                          <div
                            key={tile.key}
                            className="flex h-full flex-col rounded-xl border border-border bg-background/60 p-4"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                                <tile.icon className="h-4 w-4 text-primary" aria-hidden />
                              </span>
                              <p className="text-sm font-bold text-foreground">{tile.name}</p>
                            </div>
                            <p className="mt-2.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                              {tile.meta}
                            </p>
                            <Button
                              asChild
                              size="sm"
                              className="mt-3.5 min-h-9 w-fit rounded-full bg-ink px-4 text-xs font-bold text-white hover:opacity-85"
                            >
                              <a href={`#/cambridge/test/${test.id}/${tile.key}`}>
                                Start {tile.name}
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>

            {/* Back link + enroll CTA strip */}
            <div className="mt-10 space-y-6">
              <a
                href="#/cambridge"
                className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to Cambridge Library
              </a>
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#121009] p-6 text-center md:flex-row md:justify-between md:p-7 md:text-left">
                <div>
                  <p className="font-display text-base font-bold text-[#f6ecd4] md:text-lg">
                    শুধু প্র্যাকটিস নয় — চেকিং আর গাইডেন্সও দরকার?
                  </p>
                  <p className="mt-1 text-xs text-[#c6b995] md:text-sm">
                    Mock test checking, speaking evaluation আর band guarantee — batch-এ ভর্তি হলেই।
                  </p>
                </div>
                <Button
                  asChild
                  className="shrink-0 rounded-full bg-white font-bold text-[#121009] hover:bg-white/90"
                >
                  <a href="#/checkout">Enroll Now</a>
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
