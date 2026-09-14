"use client";

import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CalendarClock,
  Clock,
  Flame,
  GraduationCap,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/site/reveal";
import { ModeBadge } from "@/components/site/weekly-routine";
import { courses, portalNotices } from "@/lib/site-data";
import type { PortalEnrollment, PortalMock, PortalUser } from "@/lib/portal-store";
import type { PortalSection } from "@/components/site/portal/portal-shell";
import {
  classesThisWeek,
  daysUntil,
  findNextClass,
  isMine,
  mockAverage,
  useMounted,
} from "@/components/site/portal/portal-utils";

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
      <Badge variant="outline" className="border-white/10 bg-white/10 font-medium text-[#BFE6D4]">
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  bar,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  bar?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" aria-hidden />
      </span>
      <p className="mt-3 font-display text-2xl font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {typeof bar === "number" ? <Progress value={bar} className="mt-2.5 h-1.5" /> : null}
      {sub ? <p className="mt-1.5 text-[11px] text-muted-foreground/80">{sub}</p> : null}
    </div>
  );
}

/** Continue-learning card — syllabus checklist driven by the primary course's progress. */
function ContinueLearning({
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
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-foreground">Continue Learning</h3>
        <Badge variant="outline" className="border-primary/40 bg-primary/10 font-semibold text-primary">
          {enrollment.progress}% done
        </Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{course?.title ?? enrollment.courseSlug}</p>
      <ol className="mt-4 flex-1 space-y-2.5">
        {syllabus.map((item, i) => {
          const done = i < doneCount;
          const current = i === doneCount;
          return (
            <li
              key={item}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${
                current
                  ? "border-primary/40 bg-primary/[0.07] font-medium text-foreground"
                  : done
                    ? "border-transparent text-muted-foreground"
                    : "border-transparent text-muted-foreground/50"
              }`}
            >
              {done ? (
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-brand-gradient">
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
                    <path
                      d="M1.5 5.5 4 8 8.5 2.5"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <span
                  className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full border ${
                    current ? "border-primary" : "border-border"
                  }`}
                  aria-hidden
                />
              )}
              <span className={done ? "line-through decoration-primary/40" : undefined}>{item}</span>
              {current ? (
                <Badge className="ml-auto shrink-0 bg-brand-gradient text-[10px] font-bold text-white hover:bg-brand-gradient">
                  Up next
                </Badge>
              ) : null}
            </li>
          );
        })}
      </ol>
      <Button
        onClick={() => onNavigate("course")}
        className="mt-4 w-full rounded-full bg-ink font-semibold text-white hover:opacity-85"
      >
        Open My Course
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
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-foreground">Latest Mock Result</h3>
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
          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#114430] to-[#0C2E23]">
            <span className="font-display text-3xl font-bold leading-none text-[#63D6A4]">
              {latest.overall.toFixed(1)}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-[#7FA091]">band</span>
          </div>
          <div className="min-w-0 space-y-2 text-sm">
            <p className="font-semibold text-foreground">{latest.label}</p>
            <p className="text-xs text-muted-foreground">{latest.date} · L {latest.listening} · R {latest.reading} · W {latest.writing} · S {latest.speaking}</p>
            <div className="flex flex-wrap gap-1.5">
              {delta !== null && delta > 0 ? (
                <Badge variant="outline" className="border-emerald-600/40 bg-emerald-500/10 text-xs text-emerald-700">
                  <TrendingUp className="mr-1 h-3 w-3" aria-hidden />+{delta.toFixed(1)} vs last
                </Badge>
              ) : null}
              {toTarget !== null ? (
                toTarget <= 0 ? (
                  <Badge variant="outline" className="border-emerald-600/40 bg-emerald-500/10 text-xs text-emerald-700">
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
        <p className="mt-4 flex-1 text-sm text-muted-foreground">
          এখনো কোনো mock result নেই — প্রতি বৃহস্পতিবারের mock test-এ অংশ নিন।
        </p>
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
  const best = mocks.length > 0 ? Math.max(...mocks.map((m) => m.overall)) : null;
  const weekly = classesThisWeek(enrolledSlugs);
  const next = mounted ? findNextClass(new Date()) : null;
  const nextIsMine = next ? isMine(enrolledSlugs)(next.row) : false;
  const notices = portalNotices.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome band */}
      <Reveal y={12}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#114430] via-[#0B2E22] to-[#0C2E23] p-6 md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-radial-glow blur-2xl"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-display text-2xl font-bold text-white shadow-[0_8px_30px_rgba(16,138,96,0.3)]">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-[#63D6A4]">Student Dashboard</p>
              <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-[#EAF4EE] md:text-3xl">
                Assalamu Alaikum, {firstName}!
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-white/10 bg-white/10 font-medium text-[#BFE6D4]">
                  <GraduationCap className="mr-1 h-3 w-3" aria-hidden />
                  {primary.batch}
                </Badge>
                <span className="text-xs text-[#A9C6B6]">
                  {course?.title ?? primary.courseSlug}
                </span>
                {enrollments.length > 1 ? (
                  <Badge variant="outline" className="border-white/10 bg-white/10 text-[#BFE6D4]">
                    +{enrollments.length - 1} more course{enrollments.length > 2 ? "s" : ""}
                  </Badge>
                ) : null}
                <ExamChip targetBand={primary.targetBand} examDate={primary.examDate} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Reveal y={10} delay={0.02}>
          <StatCard
            icon={TrendingUp}
            label={enrollments.length > 1 ? "Primary Course Progress" : "Course Progress"}
            value={`${primary.progress}%`}
            bar={primary.progress}
            sub={course ? `${course.lessons} lessons total` : undefined}
          />
        </Reveal>
        <Reveal y={10} delay={0.06}>
          <StatCard
            icon={CalendarCheck2}
            label="Attendance"
            value={`${primary.attendance}%`}
            bar={primary.attendance}
            sub={primary.attendance >= 90 ? "Excellent!" : "Keep it up!"}
          />
        </Reveal>
        <Reveal y={10} delay={0.1}>
          <StatCard
            icon={BarChart3}
            label="Mock Average"
            value={avg !== null ? avg.toFixed(1) : "—"}
            sub={best !== null ? `Best band ${best.toFixed(1)}` : "No mocks yet"}
          />
        </Reveal>
        <Reveal y={10} delay={0.14}>
          <StatCard
            icon={CalendarClock}
            label="Classes This Week"
            value={String(weekly)}
            sub={
              enrollments.length > 1
                ? `across ${enrollments.length} courses`
                : "incl. shared sessions"
            }
          />
        </Reveal>
      </div>

      {/* Next class + continue learning */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Reveal y={12}>
          <div className="flex h-full flex-col justify-center rounded-3xl border border-primary/25 bg-card p-6">
            {next ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-bold text-white">
                    <CalendarClock className="h-3 w-3" aria-hidden />
                    Next class · {next.label}
                  </span>
                  {nextIsMine ? (
                    <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
                      Your schedule
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      Other batch
                    </Badge>
                  )}
                </div>
                <p className="mt-3 font-display text-xl font-bold text-foreground md:text-2xl">
                  {next.row.topic}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" aria-hidden />
                    {next.label === "Today" || next.label === "Tomorrow"
                      ? `${next.label}, ${next.row.start} – ${next.row.end}`
                      : `${next.row.day}, ${next.row.start} – ${next.row.end}`}
                  </span>
                  <span>{next.row.batch}</span>
                  <ModeBadge mode={next.row.mode} />
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Zoom/Facebook লিংক ক্লাসের ১০ মিনিট আগে আপনার WhatsApp গ্রুপে পোস্ট করা হয়।
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming classes found.</p>
            )}
          </div>
        </Reveal>
        <Reveal y={12} delay={0.06}>
          <ContinueLearning enrollment={primary} onNavigate={onNavigate} />
        </Reveal>
      </div>

      {/* Recent mock + notices preview */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Reveal y={12} delay={0.02}>
          <RecentMock mocks={mocks} targetBand={primary.targetBand} onNavigate={onNavigate} />
        </Reveal>
        <Reveal y={12} delay={0.06}>
          <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
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
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-foreground">
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
