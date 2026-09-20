"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Clock3,
  MapPin,
  MonitorSmartphone,
  Radio,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/site/reveal";
import { RoutineTable } from "@/components/site/weekly-routine";
import { classRoutine, weekDays, type RoutineClass, type WeekDay } from "@/lib/site-data";
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import { bnNum, findNextClass, isMine, toMinutes, useMounted, useToday } from "@/components/site/portal/portal-utils";

const dayBn: Record<WeekDay, string> = {
  Saturday: "শনিবার",
  Sunday: "রবিবার",
  Monday: "সোমবার",
  Tuesday: "মঙ্গলবার",
  Wednesday: "বুধবার",
  Thursday: "বৃহস্পতিবার",
  Friday: "শুক্রবার",
};

const modeMeta: Record<RoutineClass["mode"], { icon: typeof Video; label: string }> = {
  "Online Live": { icon: Video, label: "অনলাইন লাইভ" },
  Campus: { icon: MapPin, label: "ক্যাম্পাস" },
  Hybrid: { icon: MonitorSmartphone, label: "হাইব্রিড" },
};

/** Bengali minutes-to-start text from "10:30 AM" style times — client only. */
function countdownLabel(start: string, now: Date): string {
  const nowM = now.getHours() * 60 + now.getMinutes();
  const diff = toMinutes(start) - nowM;
  if (diff <= 0) return "এখনই শুরু হচ্ছে";
  if (diff < 60) return `${bnNum(diff)} মিনিট বাকি`;
  const h = Math.floor(diff / 60);
  return `${bnNum(h)} ঘণ্টা ${bnNum(diff % 60)} মিনিট বাকি`;
}

/**
 * Portal weekly routine — production EdTech view:
 * next-class countdown hero + week-at-a-glance strip + day tabs with
 * "My classes / Full routine" toggle and the shared branded table.
 */
export function RoutineSection({ courseSlugs }: { courseSlugs: string[] }) {
  const today = useToday();
  const mounted = useMounted();
  const [day, setDay] = useState<WeekDay | null>(null);
  const [mineOnly, setMineOnly] = useState(true);

  const activeDay: WeekDay =
    day ?? ((weekDays as readonly string[]).includes(today) ? (today as WeekDay) : "Saturday");

  const mine = isMine(courseSlugs);
  const allRows = classRoutine.filter((r) => r.day === activeDay);
  const visibleRows = mineOnly ? allRows.filter(mine) : allRows;

  // Next upcoming session (client-only — Date-dependent)
  const next = useMemo(() => (mounted ? findNextClass(new Date()) : null), [mounted]);
  const nextMode = next ? modeMeta[next.row.mode] : null;

  // Weekly footprint for the summary chips
  const myWeekly = classRoutine.filter(mine);
  const weeklyMinutes = myWeekly.reduce(
    (sum, r) => sum + Math.max(toMinutes(r.end) - toMinutes(r.start), 0),
    0
  );

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          eyebrow="Weekly Schedule"
          title="আমার সাপ্তাহিক রুটিন"
          desc="সপ্তাহের প্রতিটি ক্লাস, সময় আর মাধ্যম এক জায়গায় — শুক্রবার ছাড়া প্রতিদিনই ক্লাস চলে।"
        />
      </Reveal>

      {/* Next class countdown hero */}
      <Reveal y={12} delay={0.03}>
        {next && nextMode ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-5 md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-radial-glow blur-2xl"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient">
                  <Radio className="h-5.5 w-5.5 text-white" aria-hidden />
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#15120b] bg-red-500"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d9b75c]">
                    পরবর্তী ক্লাস · {next.label === "Today" ? "আজ" : next.label === "Tomorrow" ? "আগামীকাল" : dayBn[next.label as WeekDay]}
                  </p>
                  <h2 className="mt-1 truncate font-display text-lg font-bold text-[#f6ecd4] md:text-xl">
                    {next.row.topic}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#c6b995]">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {bnNum(next.row.start)} – {bnNum(next.row.end)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <nextMode.icon className="h-3.5 w-3.5" aria-hidden />
                      {nextMode.label}
                    </span>
                    <span>{next.row.batch}</span>
                  </p>
                </div>
              </div>
              <div className="shrink-0 rounded-2xl border border-[#d9b75c]/30 bg-[#d9b75c]/10 px-4 py-2.5 text-center">
                <p className="font-display text-lg font-bold leading-none text-[#d9b75c]">
                  {countdownLabel(next.row.start, new Date())}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#c6b995]">
                  {dayBn[next.row.day]} · বাংলাদেশ সময়
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[104px] animate-pulse rounded-3xl border border-border bg-card/60 md:h-[112px]" />
        )}
      </Reveal>

      {/* Week-at-a-glance strip */}
      <Reveal y={12} delay={0.06}>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {weekDays.map((d) => {
            const isToday = today === d;
            const isActive = activeDay === d;
            const count = mineOnly
              ? classRoutine.filter((r) => r.day === d && mine(r)).length
              : classRoutine.filter((r) => r.day === d).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                aria-pressed={isActive}
                aria-label={`${dayBn[d]} — ${bnNum(count)} টি ক্লাস`}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 transition-all sm:py-3 ${
                  isActive
                    ? "border-[#d9b75c] bg-[#d9b75c]/10 shadow-[0_6px_18px_rgba(217,183,92,0.15)]"
                    : "border-border bg-card hover:border-[#d9b75c]/50"
                }`}
              >
                <span
                  className={`text-[10px] font-bold sm:text-xs ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {dayBn[d].slice(0, 2)}
                  {isToday ? <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#2e7d5b]" /> : null}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-bold sm:h-7 sm:w-7 ${
                    count > 0
                      ? isActive
                        ? "bg-[#d9b75c] text-ink"
                        : "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground/50"
                  }`}
                >
                  {bnNum(count)}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Day view */}
      <Reveal y={12} delay={0.09}>
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <CalendarRange className="h-5 w-5 text-primary" aria-hidden />
              {dayBn[activeDay]}
              {today === activeDay ? (
                <Badge className="bg-[#2e7d5b]/15 text-[10px] font-bold text-[#225941] hover:bg-[#2e7d5b]/15">
                  আজ
                </Badge>
              ) : null}
            </h2>
            <div className="flex rounded-full border border-border bg-secondary p-1" role="tablist" aria-label="রুটিন ভিউ">
              {(["mine", "all"] as const).map((mode) => {
                const active = mineOnly === (mode === "mine");
                return (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMineOnly(mode === "mine")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {mode === "mine" ? "আমার ক্লাস" : "পুরো রুটিন"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            {activeDay === "Friday" ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-10 text-center">
                <CalendarDays className="h-7 w-7 text-primary/60" aria-hidden />
                <p className="text-sm font-medium text-foreground">শুক্রবার সাপ্তাহিক ছুটি</p>
                <p className="text-xs text-muted-foreground">
                  কাল শনিবার সকাল ১০টায় ক্লাস শুরু হবে — WhatsApp গ্রুপে রুটিন আপডেট পাবেন।
                </p>
              </div>
            ) : visibleRows.length > 0 ? (
              <RoutineTable rows={visibleRows} isMine={mine} />
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-10 text-center">
                <CalendarDays className="h-7 w-7 text-primary/60" aria-hidden />
                <p className="text-sm font-medium text-foreground">এই দিনে আপনার ব্যাচের ক্লাস নেই</p>
                <p className="text-xs text-muted-foreground">
                  {dayBn[activeDay]}-এ অন্য ব্যাচের ক্লাস আছে — &quot;পুরো রুটিন&quot; টগল করে দেখুন।
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3.5">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MonitorSmartphone className="h-3.5 w-3.5 text-primary" aria-hidden />
              সোনালি রঙিন সারি = আপনার ব্যাচ · সব সময় বাংলাদেশ সময় (GMT+6)
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              সপ্তাহে <span className="font-bold text-primary">{bnNum(myWeekly.length)}</span> টি সেশন ·{" "}
              <span className="font-bold text-primary">
                {bnNum(Math.floor(weeklyMinutes / 60))} ঘণ্টা {bnNum(weeklyMinutes % 60)} মিনিট
              </span>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
