"use client";

import { useState } from "react";
import { CalendarDays, MonitorSmartphone } from "lucide-react";
import { RoutineTable } from "@/components/site/weekly-routine";
import { Reveal } from "@/components/site/reveal";
import { classRoutine, weekDays, type RoutineClass, type WeekDay } from "@/lib/site-data";
import {
  isMine,
  useToday,
} from "@/components/site/portal/portal-utils";

/**
 * Portal weekly routine — day tabs with "My Classes / Full Routine" toggle.
* Highlighted rows = the student's enrolled batches; shared sessions (speaking club,
 * mock, free classes) always count as mine.
 */
export function RoutineSection({ courseSlugs }: { courseSlugs: string[] }) {
  const today = useToday();
  const [day, setDay] = useState<WeekDay | null>(null);
  const [mineOnly, setMineOnly] = useState(true);

  const activeDay: WeekDay =
    day ?? ((weekDays as readonly string[]).includes(today) ? (today as WeekDay) : "Saturday");

  const mine = isMine(courseSlugs);
  const allRows = classRoutine.filter((r) => r.day === activeDay);
  const visibleRows = mineOnly ? allRows.filter(mine) : allRows;

  return (
    <Reveal>
      <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
            My Weekly Routine
          </h2>
          <div className="flex rounded-full border border-border bg-secondary p-1">
            {(["mine", "all"] as const).map((mode) => {
              const active = mineOnly === (mode === "mine");
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMineOnly(mode === "mine")}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {mode === "mine" ? "My Classes" : "Full Routine"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {weekDays.map((d) => {
            const isActive = activeDay === d;
            const isToday = today === d;
            const count = mineOnly
              ? classRoutine.filter((r) => r.day === d && mine(r)).length
              : classRoutine.filter((r) => r.day === d).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {d.slice(0, 3)}
                {isToday ? (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary" : "bg-[#2e7d5b]"}`}
                    title="Today"
                  />
                ) : null}
                <span
                  className={`text-[11px] ${isActive ? "text-primary/80" : "text-muted-foreground/70"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {activeDay === "Friday" ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
              শুক্রবার সাপ্তাহিক ছুটি — কাল সকাল ১০টায় ক্লাস শুরু হবে।
            </p>
          ) : visibleRows.length > 0 ? (
            <RoutineTable rows={visibleRows} isMine={mine} />
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
              এই দিনে আপনার ব্যাচের কোনো ক্লাস নেই — {activeDay} এ অন্য ব্যাচের ক্লাস আছে।
              &quot;Full Routine&quot; দেখুন অথবা WhatsApp গ্রুপে নোটিশ ফলো করুন।
            </p>
          )}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <MonitorSmartphone className="h-3.5 w-3.5 text-primary" aria-hidden />
          সোনালি রঙিন সারি = আপনার ব্যাচ। সব সময় বাংলাদেশ সময় (GMT+6)।
        </p>
      </div>
    </Reveal>
  );
}
