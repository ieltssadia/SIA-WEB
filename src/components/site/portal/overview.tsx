"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CalendarClock,
  Flame,
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
  portalNotices,
  weekDays,
  type RoutineClass,
  type WeekDay,
} from "@/lib/site-data";
import type { PortalEnrollment, PortalMock, PortalUser } from "@/lib/portal-store";
import type { PortalSection } from "@/components/site/portal/portal-shell";
import {
  classesThisWeek,
  daysUntil,
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
        ? "IELTS Exam — tomorrow!"
        : "Exam week — best of luck!";
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

/** 10MS-style compact stat tile — icon + big number + tiny label. */
function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 sm:p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none text-foreground sm:text-2xl">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
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
        <h3 className="font-display text-lg font-bold text-foreground">My Course</h3>
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
          Up next: {nextLesson}
        </p>
      ) : null}
      <Button
        onClick={() => onNavigate("course")}
        className="mt-auto h-11 w-full rounded-full bg-ink font-semibold text-white hover:opacity-85"
      >
        <span className="sr-only">Open My Course — </span>Continue
        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}

/** Upcoming live classes — simple rows: time · topic · Join. */
function UpcomingClasses({
  enrolledSlugs,
  onNavigate,
}: {
  enrolledSlugs: string[];
  onNavigate: (s: PortalSection) => void;
}) {
  const mounted = useMounted();
  const rows = mounted ? upcomingRows(new Date(), enrolledSlugs, 3) : [];

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-foreground">Upcoming Classes</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("routine")}
          className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        >
          Full routine
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 flex-1 text-sm text-muted-foreground">No upcoming classes found.</p>
      ) : (
        <ul className="mt-1 flex-1 divide-y divide-border">
          {rows.map(({ row, label }) => (
            <li key={`${row.day}-${row.start}-${row.topic}`} className="flex items-center gap-3 py-3">
              <div className="w-16 shrink-0 text-center sm:w-[4.5rem]">
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  {label}
                </p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                  {row.start}
                </p>
                <p className="text-[10px] tabular-nums text-muted-foreground">{row.end}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{row.topic}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{row.batch}</span>
                  <ModeBadge mode={row.mode} />
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="h-9 shrink-0 rounded-full bg-ink px-4 font-semibold text-white hover:opacity-85"
              >
                <a href="#/live">
                  Join<span className="sr-only"> — {row.topic}</span>
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
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
        <h3 className="font-display text-lg font-bold text-foreground">Latest Mock</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("scores")}
          className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        >
          View all
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
  onNavigate,
}: {
  user: PortalUser;
  enrollments: PortalEnrollment[];
  mocks: PortalMock[];
  onNavigate: (s: PortalSection) => void;
}) {
  const mounted = useMounted();
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

      {/* Compact stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Reveal y={10} delay={0.02}>
          <StatTile
            icon={TrendingUp}
            label="Course Progress"
            value={`${primary.progress}%`}
          />
        </Reveal>
        <Reveal y={10} delay={0.06}>
          <StatTile
            icon={CalendarCheck2}
            label="Attendance"
            value={`${primary.attendance}%`}
          />
        </Reveal>
        <Reveal y={10} delay={0.1}>
          <StatTile
            icon={BarChart3}
            label="Mock Average"
            value={avg !== null ? avg.toFixed(1) : "—"}
          />
        </Reveal>
        <Reveal y={10} delay={0.14}>
          <StatTile
            icon={CalendarClock}
            label="Classes / Week"
            value={String(weekly)}
          />
        </Reveal>
      </div>

      {/* My course + upcoming classes */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Reveal y={12}>
          <MyCourseCard enrollment={primary} onNavigate={onNavigate} />
        </Reveal>
        <Reveal y={12} delay={0.06}>
          <UpcomingClasses enrolledSlugs={enrolledSlugs} onNavigate={onNavigate} />
        </Reveal>
      </div>

      {/* Latest mock + notices preview */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Reveal y={12} delay={0.02}>
          <RecentMock mocks={mocks} targetBand={primary.targetBand} onNavigate={onNavigate} />
        </Reveal>
        <Reveal y={12} delay={0.06}>
          <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-foreground">Batch Notices</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("notices")}
                className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
              >
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
            <div className="mt-4 flex-1 space-y-3">
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
  );
}
