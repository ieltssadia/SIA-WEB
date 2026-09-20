"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Coffee,
  MonitorSmartphone,
  Video,
  Building2,
  Shuffle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reveal } from "@/components/site/reveal";
import { courses, classRoutine, weekDays, type RoutineClass, type WeekDay } from "@/lib/site-data";

const emptySubscribe = () => () => {};

/** Current weekday name (e.g. "Monday"), "" during SSR — hydration-safe. */
export function useToday(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()),
    () => ""
  );
}

/**
 * CMS-managed weekly routine — the static seed paints first, then /api/catalog
 * swaps in the DB rows. Shared by every public routine surface (routine page
 * table, today banners, course-detail tables, locked preview).
 */
export function useCatalogRoutine(): RoutineClass[] {
  const [routine, setRoutine] = useState<RoutineClass[]>(classRoutine);

  useEffect(() => {
    let alive = true;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok) setRoutine(d.routine as RoutineClass[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return routine;
}

const modeMeta: Record<RoutineClass["mode"], { icon: React.ElementType; className: string }> = {
  "Online Live": {
    icon: Video,
    className: "border-[#2e7d5b]/30 bg-[#2e7d5b]/10 text-[#225941]",
  },
  Campus: {
    icon: Building2,
    className: "border-primary/40 bg-primary/15 text-primary",
  },
  Hybrid: {
    icon: Shuffle,
    className: "border-border bg-accent text-foreground/75",
  },
};

/** Colored badge for the class delivery mode. */
export function ModeBadge({ mode }: { mode: RoutineClass["mode"] }) {
  const meta = modeMeta[mode];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`gap-1 whitespace-nowrap font-medium ${meta.className}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {mode}
    </Badge>
  );
}

function TypeBadge({ type }: { type: RoutineClass["type"] }) {
  const highlight =
    type === "Free Live Class"
      ? "border-[#2e7d5b]/30 bg-[#2e7d5b]/10 text-[#225941]"
      : type === "Mock Test"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
        : type === "Speaking Club"
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-transparent text-muted-foreground";
  return (
    <Badge variant="outline" className={`whitespace-nowrap text-[11px] font-medium ${highlight}`}>
      {type}
    </Badge>
  );
}

function courseTitle(slug: string): string {
  return courses.find((c) => c.slug === slug)?.title ?? "Sadia's IELTS";
}

function RoutineRows({
  rows,
  isMine,
}: {
  rows: RoutineClass[];
  isMine?: (row: RoutineClass) => boolean;
}) {
  return (
    <TableBody>
      {rows.map((row) => {
        const isFree = row.type === "Free Live Class" || row.type === "Speaking Club";
        const mine = isMine?.(row) ?? false;
        return (
          <TableRow
            key={`${row.day}-${row.start}-${row.topic}`}
            className={
              mine
                ? "border-l-2 border-l-primary bg-primary/[0.06]"
                : isFree
                  ? "border-primary/10 bg-[#2e7d5b]/[0.04]"
                  : undefined
            }
          >
            <TableCell className="whitespace-nowrap align-top">
              <p className="font-semibold text-foreground">{row.start}</p>
              <p className="text-xs text-muted-foreground">– {row.end}</p>
            </TableCell>
            <TableCell className="min-w-44 align-top">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                {row.batch}
                {mine ? (
                  <span className="rounded-full bg-brand-gradient px-1.5 py-px text-[9px] font-bold normal-case tracking-normal text-white">
                    My batch
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{courseTitle(row.courseSlug)}</p>
            </TableCell>
            <TableCell className="align-top font-medium text-foreground/90">{row.topic}</TableCell>
            <TableCell className="align-top">
              <ModeBadge mode={row.mode} />
            </TableCell>
            <TableCell className="align-top">
              <TypeBadge type={row.type} />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}

export function RoutineTable({
  rows,
  isMine,
}: {
  rows: RoutineClass[];
  isMine?: (row: RoutineClass) => boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/80 bg-secondary hover:bg-secondary">
            <TableHead className="w-28 text-xs uppercase tracking-wider text-muted-foreground">
              Time
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
              Batch / Course
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
              Class Topic
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
              Mode
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
              Type
            </TableHead>
          </TableRow>
        </TableHeader>
        <RoutineRows rows={rows} isMine={isMine} />
      </Table>
    </div>
  );
}

function FridayOff() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/25 bg-card/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Coffee className="h-7 w-7 text-primary" aria-hidden />
      </span>
      <p className="font-display text-lg font-bold text-foreground">Friday — Weekly Off</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        শুক্রবার সাপ্তাহিক ছুটি। Jummah Mubarak! কাল সকাল ১০টায় আবার ক্লাস শুরু হবে।
      </p>
    </div>
  );
}

/**
 * Interactive weekly routine — 10MS-style day tabs + schedule table.
 * Defaults to the visitor's current day (client-only, hydration-safe).
 */
export function WeeklyRoutine() {
  const today = useToday();
  const routine = useCatalogRoutine();
  const [selected, setSelected] = useState<WeekDay | null>(null);

  const activeDay: WeekDay =
    selected ??
    ((weekDays as readonly string[]).includes(today) ? (today as WeekDay) : "Saturday");

  const rows = routine.filter((r) => r.day === activeDay);

  return (
    <div>
      {/* Day tabs */}
      <Reveal className="mb-6 flex flex-wrap justify-center gap-2">
        {weekDays.map((day) => {
          const count = routine.filter((r) => r.day === day).length;
          const isToday = today === day;
          const isActive = activeDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(day)}
              aria-pressed={isActive}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "border-ink/10 bg-ink text-white shadow-[0_4px_16px_rgba(30,27,20,0.18)]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {day.slice(0, 3)}
              {isToday ? (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-[#2e7d5b]"}`}
                  title="Today"
                />
              ) : null}
              <span className={`text-[11px] ${isActive ? "text-white/70" : "text-muted-foreground/70"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </Reveal>

      <Reveal delay={0.05}>
        {activeDay === "Friday" ? (
          <FridayOff />
        ) : (
          <RoutineTable rows={rows} />
        )}
      </Reveal>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <MonitorSmartphone className="h-3.5 w-3.5 text-primary" aria-hidden />
        All times are Bangladesh time (GMT+6) · Zoom/Facebook links are shared in your batch
        WhatsApp group
      </p>
    </div>
  );
}

/**
 * Compact per-course routine table for course detail pages — only that
 * course's rows, grouped across the week. Returns null when the course has
 * no fixed weekly classes (flexible / self-paced courses).
 */
export function CourseRoutineTable({ courseSlug }: { courseSlug: string }) {
  const routine = useCatalogRoutine();
  const rows = routine
    .filter((r) => r.courseSlug === courseSlug)
    .sort(
      (a, b) =>
        weekDays.indexOf(a.day) - weekDays.indexOf(b.day) ||
        a.start.localeCompare(b.start)
    );

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/80 bg-secondary hover:bg-secondary">
            <TableHead className="w-28 text-xs uppercase tracking-wider text-muted-foreground">
              Day
            </TableHead>
            <TableHead className="w-32 text-xs uppercase tracking-wider text-muted-foreground">
              Time
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
              Class Topic
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
              Mode
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.day}-${row.start}-${row.topic}`}>
              <TableCell className="whitespace-nowrap align-top font-semibold text-foreground">
                {row.day}
              </TableCell>
              <TableCell className="whitespace-nowrap align-top text-muted-foreground">
                {row.start} – {row.end}
              </TableCell>
              <TableCell className="align-top font-medium text-foreground/90">
                {row.topic}
                <span className="ml-2 align-middle">
                  <TypeBadge type={row.type} />
                </span>
              </TableCell>
              <TableCell className="align-top">
                <ModeBadge mode={row.mode} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Today's schedule rows — used by the home banner and routine page hero card. */
export function todaysClasses(
  today: string,
  routine: RoutineClass[] = classRoutine
): RoutineClass[] {
  return routine.filter((r) => r.day === today);
}
