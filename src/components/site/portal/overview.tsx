"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Flame,
  FolderDown,
  Lightbulb,
  ListChecks,
  Play,
  Radio,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/site/reveal";
import { ModeBadge } from "@/components/site/weekly-routine";
import { courseIconMap } from "@/components/site/courses-section";
import {
  classRoutine,
  courses,
  portalDownloads,
  portalNotices,
  weekDays,
  type RoutineClass,
  type WeekDay,
} from "@/lib/site-data";
import type { LiveClassListItem } from "@/lib/live-types";
import type {
  PortalCertificate,
  PortalEnrollment,
  PortalMock,
  PortalUser,
} from "@/lib/portal-store";
import type { PortalSection } from "@/components/site/portal/portal-shell";
import {
  bnNum,
  classesThisWeek,
  daysUntil,
  findNextClass,
  isMine,
  mockAverage,
  toMinutes,
  useMounted,
} from "@/components/site/portal/portal-utils";

/* Jewel pastel thumbnail rotation — mirrors the courses-page accent panels */
const PANELS = [
  { panel: "bg-pastel-green", ink: "text-[#1f5c40]" },
  { panel: "bg-pastel-orange", ink: "text-[#7a4c12]" },
  { panel: "bg-pastel-sky", ink: "text-[#2c4f8a]" },
  { panel: "bg-pastel-butter", ink: "text-[#7a5a16]" },
  { panel: "bg-pastel-ruby", ink: "text-[#7a2734]" },
  { panel: "bg-pastel-amethyst", ink: "text-[#4a3372]" },
] as const;

const dhakaShort = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** Compact future countdown: "2d 3h", "4h 12m", "45m", "শীঘ্রই". */
function untilLabel(targetIso: string, now: number): string {
  const ms = new Date(targetIso).getTime() - now;
  if (ms <= 60_000) return "শীঘ্রই";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} মিনিট বাকি`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা ${mins % 60} মিনিট বাকি`;
  return `${Math.floor(hours / 24)} দিন ${hours % 24} ঘণ্টা বাকি`;
}

/** Live-class list from /api/live-classes, refreshed every 30 s. */
function useLiveClasses(): LiveClassListItem[] | null {
  const [classes, setClasses] = useState<LiveClassListItem[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live-classes", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json?.ok) setClasses(json.classes as LiveClassListItem[]);
      } catch {
        /* keep the previous snapshot; the hub page shows errors */
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);
  return classes;
}

function ExamChip({
  targetBand,
  examDate,
}: {
  targetBand: string | null;
  examDate: string | null;
}) {
  const mounted = useMounted();
  if (!examDate) {
    return targetBand ? (
      <Badge variant="outline" className="border-white/10 bg-white/10 font-medium text-[#e4d5ae]">
        <Target className="mr-1 h-3 w-3" aria-hidden />
        Target band {targetBand}
      </Badge>
    ) : null;
  }
  if (!mounted) {
    return (
      <span className="inline-block h-5.5 w-28 animate-pulse rounded-full bg-white/10" aria-hidden />
    );
  }
  const days = daysUntil(examDate);
  if (days === null) return null;
  const label =
    days > 1
      ? `IELTS Exam in ${days} days`
      : days === 1
        ? "IELTS Exam tomorrow!"
        : "Exam week, best of luck!";
  return (
    <Badge
      variant="outline"
      className={`border-amber-500/40 bg-amber-500/10 font-semibold ${
        days > 1 ? "text-amber-400" : "text-amber-300"
      }`}
    >
      <Flame className="mr-1 h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}

/** The student's next routine sessions (own batches first, any-batch fallback). */
function upcomingRows(
  now: Date,
  courseSlugs: string[],
  count: number
): { row: RoutineClass; label: string }[] {
  const mine = isMine(courseSlugs);
  const myRows: { row: RoutineClass; label: string }[] = [];
  const otherRows: { row: RoutineClass; label: string }[] = [];
  const todayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const todayIdx = Math.max(0, weekDays.indexOf(todayName as WeekDay));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 8; offset++) {
    const day = weekDays[(todayIdx + offset) % 7];
    const rows = classRoutine
      .filter((r) => r.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    for (const row of rows) {
      if (offset === 0 && toMinutes(row.start) <= nowMinutes + 10) continue;
      const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : day;
      (mine(row) ? myRows : otherRows).push({ row, label });
    }
  }
  return (myRows.length > 0 ? myRows : otherRows).slice(0, count);
}

/* ── Featured live-class hero (the reference's big video player) ───────── */

function LiveHero({
  classes,
  enrolledSlugs,
}: {
  classes: LiveClassListItem[] | null;
  enrolledSlugs: string[];
}) {
  const mounted = useMounted();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  const live = classes?.filter((c) => c.status === "live") ?? [];
  const upcoming =
    classes
      ?.filter((c) => c.status === "scheduled")
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()) ?? [];
  const routineNext = mounted ? findNextClass(new Date()) : null;

  type Hero =
    | { kind: "live"; slug: string; title: string; meta: string }
    | { kind: "soon"; slug: string; title: string; meta: string; countdown: string }
    | { kind: "routine"; title: string; meta: string };

  let hero: Hero | null = null;
  if (live.length > 0) {
    hero = {
      kind: "live",
      slug: live[0].slug,
      title: live[0].title,
      meta: `${live[0].teacher} · ${live.length > 1 ? `${live.length}টি ক্লাস লাইভ` : "এখন চলছে"}`,
    };
  } else if (mounted && now !== null && upcoming.length > 0) {
    hero = {
      kind: "soon",
      slug: upcoming[0].slug,
      title: upcoming[0].title,
      meta: `${upcoming[0].teacher} · ${dhakaShort.format(new Date(upcoming[0].startsAt))} Dhaka · ${upcoming[0].durationMin} মিনিট`,
      countdown: untilLabel(upcoming[0].startsAt, now),
    };
  } else if (routineNext) {
    hero = {
      kind: "routine",
      title: routineNext.row.topic,
      meta: `${routineNext.label} · ${routineNext.row.start}-${routineNext.row.end} · ${routineNext.row.batch}`,
    };
  }

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-forest shadow-[0_24px_60px_rgba(30,27,20,0.18)] md:min-h-[320px]">
      <Image
        src="/images/classroom.png"
        alt=""
        fill
        sizes="(max-width: 1280px) 100vw, 900px"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

      <div className="relative flex h-full min-h-[280px] flex-col justify-end p-6 md:min-h-[320px] md:p-8">
        {hero ? (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {hero.kind === "live" ? (
                <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden>
                    <span className="absolute h-full w-full animate-ping rounded-full bg-white opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  লাইভ চলছে
                </span>
              ) : hero.kind === "soon" ? (
                <span className="rounded-full bg-[#d9b75c] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
                  আসন্ন ক্লাস · {hero.countdown}
                </span>
              ) : (
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
                  রুটিন অনুযায়ী পরের ক্লাস
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
              {hero.title}
            </h2>
            <p className="mt-1.5 text-sm text-white/75">{hero.meta}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {hero.kind === "routine" ? (
                <Button
                  asChild
                  className="rounded-full bg-[#d9b75c] font-bold text-ink transition-opacity hover:opacity-90"
                >
                  <a href="#/live">
                    <CalendarClock className="mr-1.5 h-4 w-4" aria-hidden />
                    লাইভ হাব দেখুন
                  </a>
                </Button>
              ) : (
                <Button
                  asChild
                  className={`rounded-full font-bold transition-opacity hover:opacity-90 ${
                    hero.kind === "live" ? "bg-[#d9b75c] text-ink" : "bg-white text-ink"
                  }`}
                >
                  <a href={`#/live/${hero.slug}`}>
                    <Play className="mr-1.5 h-4 w-4" aria-hidden />
                    {hero.kind === "live" ? "এখনই জয়েন করুন" : "ওয়েটিং রুমে ঢুকুন"}
                  </a>
                </Button>
              )}
              <a
                href="#/live"
                className="text-sm font-semibold text-white/75 underline-offset-8 transition-colors hover:text-white hover:underline"
              >
                সব লাইভ ক্লাস
                <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </>
        ) : (
          /* Hydration/loading shell — poster + skeleton copy only */
          <div aria-busy="true" aria-label="লাইভ ক্লাস লোড হচ্ছে">
            <span className="inline-block h-6 w-28 animate-pulse rounded-full bg-white/15" aria-hidden />
            <span className="mt-4 block h-8 w-3/4 max-w-md animate-pulse rounded-lg bg-white/15" aria-hidden />
            <span className="mt-3 block h-4 w-1/2 max-w-xs animate-pulse rounded bg-white/10" aria-hidden />
            <span className="mt-6 block h-11 w-44 animate-pulse rounded-full bg-white/15" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Live / upcoming class rows (the reference's "Recent Videos") ─────── */

function LiveClassRows({
  classes,
  enrolledSlugs,
}: {
  classes: LiveClassListItem[] | null;
  enrolledSlugs: string[];
}) {
  const mounted = useMounted();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  const live = classes?.filter((c) => c.status === "live") ?? [];
  const upcoming =
    classes
      ?.filter((c) => c.status === "scheduled")
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .slice(0, Math.max(0, 4 - live.length)) ?? [];

  /* Fallback when the API has nothing scheduled — routine sessions */
  const routineFallback = mounted && live.length === 0 && upcoming.length === 0
    ? upcomingRows(new Date(), enrolledSlugs, 4)
    : [];

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <Radio className="h-4.5 w-4.5 text-primary" aria-hidden />
          লাইভ ক্লাস
        </h3>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        >
          <a href="#/live">
            সব দেখুন
            <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </a>
        </Button>
      </div>

      {!mounted || !classes ? (
        <div className="mt-4 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/70" aria-hidden />
          ))}
        </div>
      ) : live.length === 0 && upcoming.length === 0 && routineFallback.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
          এই মুহূর্তে কোনো লাইভ বা আসন্ন ক্লাস নেই, নতুন শিডিউল ঘোষণা হলে এখানে দেখা যাবে।
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border/80">
          {/* API rows — real live classes first, then the nearest upcoming */}
          {live.map((c) => (
            <li key={c.slug} className="flex items-center gap-3 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/10 ring-1 ring-red-600/25">
                <Play className="h-5 w-5 text-red-600" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{c.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {c.teacher} · এখন চলছে
                </p>
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:flex">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                লাইভ
              </span>
              <Button
                asChild
                size="sm"
                className="h-9 shrink-0 rounded-full bg-ink px-4 font-semibold text-white hover:opacity-85"
              >
                <a href={`#/live/${c.slug}`}>
                  Join<span className="sr-only">: {c.title}</span>
                </a>
              </Button>
            </li>
          ))}
          {upcoming.map((c) => (
            <li key={c.slug} className="flex items-center gap-3 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{c.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {dhakaShort.format(new Date(c.startsAt))} Dhaka · {c.durationMin} মিনিট
                  {now !== null ? ` · ${untilLabel(c.startsAt, now)}` : ""}
                </p>
              </div>
              <span className="hidden shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:block">
                আসন্ন
              </span>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-9 shrink-0 rounded-full border-border px-4 font-semibold text-foreground hover:border-primary/50 hover:text-primary"
              >
                <a href={`#/live/${c.slug}`}>
                  রুম<span className="sr-only">: {c.title}</span>
                </a>
              </Button>
            </li>
          ))}
          {/* Routine fallback rows (no API schedule) */}
          {routineFallback.map(({ row, label }) => (
            <li key={`${row.day}-${row.start}-${row.topic}`} className="flex items-center gap-3 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{row.topic}</p>
                <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted-foreground">
                  {label} · {row.start}-{row.end}
                  <ModeBadge mode={row.mode} />
                </p>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-9 shrink-0 rounded-full border-border px-4 font-semibold text-foreground hover:border-primary/50 hover:text-primary"
              >
                <a href="#/live">
                  হাব<span className="sr-only">: {row.topic}</span>
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Course progress donut (the reference's "Learning Path Progress") ─── */

function ProgressDonut({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="9" className="stroke-border" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke="#d9b75c"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold leading-none text-foreground">
          {clamped}%
        </span>
        <span className="mt-1 text-[10px] font-medium text-muted-foreground">কমপ্লিট</span>
      </div>
    </div>
  );
}

/* ── Syllabus module checklist (the reference's "Path Modules") ────────── */

function ModuleChecklist({
  enrollment,
  onNavigate,
}: {
  enrollment: PortalEnrollment;
  onNavigate: (s: PortalSection) => void;
}) {
  const course = courses.find((c) => c.slug === enrollment.courseSlug);
  const syllabus = course?.syllabus ?? [];
  const doneCount = Math.min(
    Math.floor((enrollment.progress / 100) * syllabus.length),
    syllabus.length
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-foreground">কোর্স মডিউল</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("course")}
          className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        >
          কোর্স
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
      {syllabus.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">সিলেবাস শীঘ্রই যুক্ত হবে।</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted-foreground">
            {doneCount} / {syllabus.length} লেসন শেষ
          </p>
          <ol className="mt-3 max-h-72 space-y-0.5 overflow-y-auto pr-1">
            {syllabus.map((lesson, i) => {
              const done = i < doneCount;
              const current = i === doneCount && enrollment.progress < 100;
              return (
                <li
                  key={lesson}
                  className={`flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm ${
                    current ? "bg-primary/5 font-semibold text-foreground" : "text-foreground/75"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#2e7d5b]" aria-hidden />
                  ) : (
                    <span
                      aria-hidden
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                        current
                          ? "border-[#d9b75c] bg-[#d9b75c]/15 text-[#8a6720]"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span className="min-w-0 truncate">{lesson}</span>
                  {current ? (
                    <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#8a6720]">
                      চলবে
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}

/** "Your Stats" icon rows — reference-style colored chips + right-aligned values. */
function StatsCard({
  attendance,
  mockAvg,
  weekly,
  targetBand,
}: {
  attendance: number;
  mockAvg: number | null;
  weekly: number;
  targetBand: string | null;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <h3 className="font-display text-base font-bold text-foreground">আপনার স্ট্যাটস</h3>
      <ul className="mt-3 space-y-2.5">
        {[
          {
            icon: CalendarCheck2,
            chip: "bg-pastel-green text-[#1f5c40]",
            label: "Attendance",
            value: `${attendance}%`,
          },
          {
            icon: BarChart3,
            chip: "bg-pastel-sky text-[#2c4f8a]",
            label: "Mock গড় স্কোর",
            value: mockAvg !== null ? mockAvg.toFixed(1) : "-",
          },
          {
            icon: CalendarClock,
            chip: "bg-pastel-orange text-[#7a4c12]",
            label: "সাপ্তাহিক ক্লাস",
            value: String(weekly),
          },
          {
            icon: Target,
            chip: "bg-pastel-butter text-[#7a5a16]",
            label: "টার্গেট ব্যান্ড",
            value: targetBand ?? "-",
          },
        ].map(({ icon: Icon, chip, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${chip}`} aria-hidden>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{label}</span>
            <span className="shrink-0 font-display text-base font-bold tabular-nums text-foreground">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 10MS-style course card — thumbnail + title + one progress bar + ONE CTA. */
function MyCourseCard({
  enrollment,
  onNavigate,
}: {
  enrollment: PortalEnrollment;
  onNavigate: (s: PortalSection) => void;
}) {
  const course = courses.find((c) => c.slug === enrollment.courseSlug);
  const courseIdx = Math.max(0, courses.findIndex((c) => c.slug === enrollment.courseSlug));
  const pastel = PANELS[courseIdx % PANELS.length];
  const Icon = courseIconMap[course?.icon ?? ""] ?? BookOpen;
  const syllabus = course?.syllabus ?? [];
  const doneCount = Math.min(
    Math.floor((enrollment.progress / 100) * syllabus.length),
    syllabus.length
  );
  const nextLesson = enrollment.progress < 100 ? syllabus[doneCount] : undefined;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-foreground">আমার কোর্স</h3>
        <Badge variant="outline" className="border-primary/40 bg-primary/10 font-semibold text-primary">
          {enrollment.progress}% complete
        </Badge>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span
          className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-20 sm:w-20 ${pastel.panel}`}
        >
          <span
            aria-hidden
            className="absolute -right-4 -top-5 h-14 w-14 rounded-full border-[7px] border-white/35"
          />
          <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${pastel.ink}`} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-foreground sm:text-base">
            {course?.title ?? enrollment.courseSlug}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {enrollment.batch} · {course ? `${course.lessons} lessons` : "IELTS course"}
          </p>
        </div>
      </div>
      <Progress value={enrollment.progress} className="mt-4 h-2" />
      {nextLesson ? (
        <p className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">
          পরবর্তী: {nextLesson}
        </p>
      ) : null}
      <Button
        onClick={() => onNavigate("course")}
        className="mt-auto h-11 w-full rounded-full bg-ink font-semibold text-white hover:opacity-85"
      >
        <span className="sr-only">আমার কোর্স খুলুন, </span>চালিয়ে যান
        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}

/** Latest mock result snapshot with improvement + target comparison. */
function RecentMock({
  mocks,
  targetBand,
  onNavigate,
}: {
  mocks: PortalMock[];
  targetBand: string | null;
  onNavigate: (s: PortalSection) => void;
}) {
  const latest = mocks.length > 0 ? mocks[mocks.length - 1] : null;
  const previous = mocks.length > 1 ? mocks[mocks.length - 2] : null;
  const delta = latest && previous ? Math.round((latest.overall - previous.overall) * 10) / 10 : null;
  const target = targetBand ? Number(targetBand) : null;
  const toTarget =
    latest && target !== null && !Number.isNaN(target)
      ? Math.round((target - latest.overall) * 10) / 10
      : null;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-foreground">সর্বশেষ Mock</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("scores")}
          className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        >
          সব দেখুন
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
      {latest ? (
        <div className="mt-4 flex flex-1 items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#211b10] to-[#16130c]">
            <span className="font-display text-3xl font-bold leading-none text-[#d9b75c]">
              {latest.overall.toFixed(1)}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-[#a3977b]">band</span>
          </div>
          <div className="min-w-0 space-y-2 text-sm">
            <p className="truncate font-semibold text-foreground">{latest.label}</p>
            <p className="truncate text-xs text-muted-foreground">{latest.date} · L {latest.listening} · R {latest.reading} · W {latest.writing} · S {latest.speaking}</p>
            <div className="flex flex-wrap gap-1.5">
              {delta !== null && delta > 0 ? (
                <Badge variant="outline" className="border-[#28694d]/40 bg-[#2e7d5b]/10 text-xs text-[#225941]">
                  <TrendingUp className="mr-1 h-3 w-3" aria-hidden />+{delta.toFixed(1)} vs last
                </Badge>
              ) : null}
              {toTarget !== null ? (
                toTarget <= 0 ? (
                  <Badge variant="outline" className="border-[#28694d]/40 bg-[#2e7d5b]/10 text-xs text-[#225941]">
                    <Trophy className="mr-1 h-3 w-3" aria-hidden />
                    Target achieved!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-xs text-primary">
                    <Target className="mr-1 h-3 w-3" aria-hidden />
                    {toTarget.toFixed(1)} to target {targetBand}
                  </Badge>
                )
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 flex-1 text-sm text-muted-foreground">এখনো কোনো mock result নেই।</p>
      )}
    </div>
  );
}

export function OverviewSection({
  user,
  enrollments,
  mocks,
  certificates,
  onNavigate,
}: {
  user: PortalUser;
  enrollments: PortalEnrollment[];
  mocks: PortalMock[];
  certificates: PortalCertificate[];
  onNavigate: (s: PortalSection) => void;
}) {
  const liveClasses = useLiveClasses();
  const firstName = user.name.split(" ")[0];
  // Primary = first active enrollment (fallback: first row)
  const primary = enrollments.find((e) => e.status === "active") ?? enrollments[0];
  const course = courses.find((c) => c.slug === primary.courseSlug);
  const enrolledSlugs = enrollments.map((e) => e.courseSlug);
  const avg = mockAverage(mocks.map((m) => m.overall));
  const weekly = classesThisWeek(enrolledSlugs);
  const notices = portalNotices.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome band — greeting + one meta line + target chip */}
      <Reveal y={12}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-6 md:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-radial-glow blur-2xl"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-display text-2xl font-bold text-white shadow-[0_8px_30px_rgba(169,127,42,0.3)] md:h-16 md:w-16">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold leading-tight text-[#f6ecd4] md:text-3xl">
                Assalamu Alaikum, {firstName}!
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="truncate text-xs text-[#c6b995]">
                  {primary.batch} · {course?.title ?? primary.courseSlug}
                  {enrollments.length > 1 ? ` · +${enrollments.length - 1} more` : ""}
                </span>
                <ExamChip targetBand={primary.targetBand} examDate={primary.examDate} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Dashboard: main column (live hero + class rows + course/mock) + right rail */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* ── Main column ── */}
        <div className="min-w-0 space-y-6">
          <Reveal y={12}>
            <LiveHero classes={liveClasses} enrolledSlugs={enrolledSlugs} />
          </Reveal>

          <Reveal y={12} delay={0.05}>
            <LiveClassRows classes={liveClasses} enrolledSlugs={enrolledSlugs} />
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            <Reveal y={12} delay={0.02}>
              <MyCourseCard enrollment={primary} onNavigate={onNavigate} />
            </Reveal>
            <Reveal y={12} delay={0.06}>
              <RecentMock mocks={mocks} targetBand={primary.targetBand} onNavigate={onNavigate} />
            </Reveal>
          </div>
        </div>

        {/* ── Right rail ── */}
        <div className="min-w-0 space-y-6">
          <Reveal y={12} delay={0.04}>
            <div className="rounded-3xl border border-border bg-card p-5">
              <h3 className="font-display text-base font-bold text-foreground">কোর্স প্রোগ্রেস</h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {course?.title ?? primary.courseSlug}
              </p>
              <div className="mt-4 flex flex-col items-center">
                <ProgressDonut value={primary.progress} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Attendance {primary.attendance}% · {primary.batch}
                </p>
                <Button
                  onClick={() => onNavigate("course")}
                  className="mt-4 h-10 w-full rounded-full bg-[#d9b75c] font-bold text-ink transition-opacity hover:opacity-90"
                >
                  <BookOpen className="mr-1.5 h-4 w-4" aria-hidden />
                  পড়া চালিয়ে যান
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal y={12} delay={0.08}>
            <ModuleChecklist enrollment={primary} onNavigate={onNavigate} />
          </Reveal>

          <Reveal y={12} delay={0.12}>
            <StatsCard
              attendance={primary.attendance}
              mockAvg={avg}
              weekly={weekly}
              targetBand={primary.targetBand}
            />
          </Reveal>

          <Reveal y={12} delay={0.14}>
            <div className="rounded-3xl border border-[#d9b75c]/30 bg-[#d9b75c]/[0.07] p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                <Award className="h-4 w-4 text-[#8a7a4d]" aria-hidden />
                অর্জন ও রিসোর্স
              </h3>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate("certificates")}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-[#d9b75c]/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d9b75c]/15">
                    <Award className="h-4.5 w-4.5 text-[#8a7a4d]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {certificates.length > 0
                        ? `${bnNum(certificates.length)}টি সার্টিফিকেট ইস্যু হয়েছে`
                        : "সার্টিফিকেট (কোর্স শেষে ইস্যু)"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {certificates.length > 0
                        ? "ডাউনলোড বা প্রিন্ট করুন"
                        : "১০০% সম্পন্ন হলেই খুলে যাবে"}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("downloads")}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-[#d9b75c]/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d9b75c]/15">
                    <FolderDown className="h-4.5 w-4.5 text-[#8a7a4d]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      ডাউনলোড কর্নার: {bnNum(portalDownloads.length)} ফাইল
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      নোটস, টেমপ্লেট, answer sheet, চেকলিস্ট
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("suggestions")}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-[#d9b75c]/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d9b75c]/15">
                    <Lightbulb className="h-4.5 w-4.5 text-[#8a7a4d]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      সাজেশন ও প্র্যাকটিস টেস্ট
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      কোর্সের সাজেশন আর ফুল প্র্যাকটিস টেস্ট, এক ক্লিকে
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal y={12} delay={0.16}>
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                  <ListChecks className="h-4 w-4 text-primary" aria-hidden />
                  নোটিশ
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("notices")}
                  className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                >
                  সব দেখুন
                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                {notices.map((n) => (
                  <button
                    key={n.title}
                    type="button"
                    onClick={() => onNavigate("notices")}
                    className="block w-full rounded-xl border border-border bg-muted/50 p-3.5 text-left transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                        {n.tag}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{n.date}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-sm font-medium leading-snug text-foreground">
                      {n.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
