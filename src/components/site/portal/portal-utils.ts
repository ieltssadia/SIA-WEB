"use client";

import { useSyncExternalStore } from "react";
import { classRoutine, weekDays, type RoutineClass, type WeekDay } from "@/lib/site-data";

const emptySubscribe = () => () => {};

/** Client-only mount flag (false during SSR) — gates time-dependent UI. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/** Current weekday name (e.g. "Monday"), "" during SSR — hydration-safe. */
export function useToday(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()),
    () => ""
  );
}

/** "10:30 AM" → minutes since midnight. */
export function toMinutes(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

/** Shared sessions (speaking club, mock tests, free classes) belong to everyone. */
export const isShared = (row: RoutineClass) => /all|everyone/i.test(row.batch);

/** A row belongs to the student's course, or is a shared session. */
export const isMine = (courseSlug: string) => (row: RoutineClass) =>
  row.courseSlug === courseSlug || isShared(row);

/** The student's / everyone's next upcoming class from the weekly routine. */
export function findNextClass(now: Date): { row: RoutineClass; label: string } | null {
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
      return { row, label };
    }
  }
  return null;
}

/** Number of the student's sessions in the running weekly routine. */
export function classesThisWeek(courseSlug: string): number {
  return classRoutine.filter(isMine(courseSlug)).length;
}

/** Whole days until the given ISO date (null-safe). */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Average of the mock overall band scores, to 1 decimal. */
export function mockAverage(overalls: number[]): number | null {
  if (overalls.length === 0) return null;
  const avg = overalls.reduce((sum, v) => sum + v, 0) / overalls.length;
  return Math.round(avg * 10) / 10;
}
