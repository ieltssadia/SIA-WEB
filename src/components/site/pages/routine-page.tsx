"use client";

import { useSyncExternalStore } from "react";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Clock,
  GraduationCap,
  Info,
  LogIn,
  MonitorSmartphone,
  Phone,
  Radio,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { ModeBadge, WeeklyRoutine, useToday, todaysClasses } from "@/components/site/weekly-routine";
import { LockedRoutineSection } from "@/components/site/locked-routine";
import {
  freeLiveClasses,
  routineNote,
  site,
  upcomingBatches,
} from "@/lib/site-data";
import { usePortalStore } from "@/lib/portal-store";

const emptySubscribe = () => () => {};

/** Long local date (e.g. "December 5, 2025"), "" during SSR — hydration-safe. */
function useTodayDate(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    () => ""
  );
}

/** Emerald "Today's Classes" hero card under the page header. */
function TodayBanner() {
  const today = useToday();
  const dateLabel = useTodayDate();
  const rows = todaysClasses(today);
  const isOff = today === "Friday";

  return (
    <Reveal y={12}>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#114430] via-[#0B2E22] to-[#0C2E23] p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-radial-glow blur-2xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-bold text-white">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {today ? `Today · ${today}` : "This Week"}
            </span>
            {dateLabel ? (
              <span className="text-xs text-[#7FA091]">{dateLabel} · Bangladesh time (GMT+6)</span>
            ) : null}
          </div>

          {today && isOff ? (
            <p className="mt-4 font-display text-xl font-bold text-[#EAF4EE] md:text-2xl">
              আজ শুক্রবার — সাপ্তাহিক ছুটি। কাল সকাল ১০টায় ক্লাস! 
            </p>
          ) : today && rows.length > 0 ? (
            <>
              <p className="mt-4 font-display text-xl font-bold text-[#EAF4EE] md:text-2xl">
                আজ {rows.length} টি ক্লাস আছে — সময়মতো জয়েন করুন!
              </p>
              <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
                {rows.map((row) => (
                  <li
                    key={`${row.day}-${row.start}-${row.topic}`}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3.5"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Clock className="h-4 w-4 text-[#63D6A4]" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#EAF4EE]">
                        {row.start} – {row.end}
                        <span className="ml-2 font-normal text-[#A9C6B6]">{row.batch}</span>
                      </p>
                      <p className="truncate text-sm text-[#A9C6B6]">{row.topic}</p>
                    </div>
                    <ModeBadge mode={row.mode} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 font-display text-xl font-bold text-[#EAF4EE] md:text-2xl">
              সপ্তাহে ৬ দিন — সকাল ১০টা থেকে রাত ৯টা পর্যন্ত লাইভ ক্লাস
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 text-xs text-[#A9C6B6]">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#63D6A4]" aria-hidden />
            Class links (Zoom / Facebook Live) are posted in your batch WhatsApp group before every class.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/** 10MS-style free live classes — the top-of-funnel open sessions. */
function FreeLiveClasses() {
  return (
    <section className="border-t border-primary/10 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="100% Free · No Enrollment Needed"
          title={
            <>
              Free <span className="text-brand-gradient">Live Classes</span> Every Week
            </>
          }
          subtitle="ভর্তি না হয়েও শেখা শুরু করুন! প্রতি সপ্তাহে ফ্রি লাইভ ক্লাস — সবার জন্য উন্মুক্ত।"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {freeLiveClasses.map((session, i) => (
            <Reveal key={session.title} delay={i * 0.08} className="h-full">
              <Card className="flex h-full flex-col border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Radio className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <Badge
                      variant="outline"
                      className="border-emerald-600/30 bg-emerald-500/10 font-medium text-emerald-700"
                    >
                      Free
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold leading-snug text-foreground">
                    {session.title}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {session.when}
                    </p>
                    <p className="flex items-center gap-2">
                      <MonitorSmartphone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {session.platform}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      Host: {session.host}
                    </p>
                  </div>
                  <div className="mt-auto pt-5">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                    >
                      <a
                        href={session.href}
                        {...(session.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {session.ctaLabel}
                        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 10MS "choose your batch" admission board. */
function UpcomingBatchesBoard() {
  return (
    <section className="border-t border-primary/10 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Admission Open"
          title={
            <>
              Upcoming <span className="text-brand-gradient">Batches</span>
            </>
          }
          subtitle="পছন্দের ব্যাচটি বেছে নিন — সিট সীমিত, আগে এলে আগে পাবেন।"
        />

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5 font-semibold">Course</th>
                    <th className="px-5 py-3.5 font-semibold">Batch</th>
                    <th className="px-5 py-3.5 font-semibold">Starts</th>
                    <th className="px-5 py-3.5 font-semibold">Class Time</th>
                    <th className="px-5 py-3.5 font-semibold">Seats</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Enroll</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBatches.map((b) => {
                    const lowSeats = /^([1-5])\s/.test(b.seats);
                    return (
                      <tr
                        key={b.batch}
                        className="border-b border-border/60 last:border-0 transition-colors hover:bg-primary/[0.04]"
                      >
                        <td className="px-5 py-4">
                          <a
                            href={`#/courses/${b.courseSlug}`}
                            className="font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            {b.course}
                          </a>
                          <p className="mt-0.5 text-xs text-muted-foreground">{b.mode}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant="outline"
                            className="border-primary/40 bg-primary/10 font-medium text-primary"
                          >
                            {b.batch}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-foreground/85">{b.starts}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-foreground/85">{b.time}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-semibold ${
                              lowSeats ? "text-amber-600" : "text-emerald-700"
                            }`}
                          >
                            {b.seats}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            asChild
                            size="sm"
                            className="rounded-full bg-ink font-semibold text-white hover:opacity-85"
                          >
                            <a
                              href={`#/checkout?course=${b.courseSlug}`}
                              aria-label={`Enroll in ${b.course}, ${b.batch}`}
                            >
                              <GraduationCap className="mr-1 h-3.5 w-3.5" aria-hidden />
                              Enroll
                            </a>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* Routine change notice */}
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-card p-5 sm:flex-row sm:items-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Info className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-foreground">{routineNote.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {routineNote.message}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RoutineCta() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0B2E22] via-[#0C2E23] to-[#0B2E22] p-8 text-center md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 top-0 h-[300px] w-[300px] rounded-full bg-radial-glow blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 bottom-0 h-[300px] w-[300px] rounded-full bg-radial-glow blur-2xl"
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold leading-tight text-[#EAF4EE] md:text-4xl">
                Enrolled? Your Batch <span className="text-[#63D6A4]">Is Waiting</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#A9C6B6]">
                যেকোনো ব্যাচে ভর্তি হলেই পাবেন পুরো সপ্তাহের লাইভ ক্লাস, mock test আর speaking club —
                অনলাইনে অথবা ক্যাম্পাসে।
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-gradient text-base font-semibold text-white shadow-[0_8px_30px_rgba(16,138,96,0.3)] hover:opacity-90"
                >
                  <a href="#/checkout">
                    <GraduationCap className="mr-1.5 h-5 w-5" aria-hidden />
                    Enroll Now
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-base font-medium text-[#EAF4EE] hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <a href={site.phoneHref}>
                    <Phone className="mr-2 h-4.5 w-4.5" aria-hidden />
                    {site.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Emerald strip shown to logged-in students above the full routine. */
function WelcomeStrip({ name, batch }: { name: string; batch: string }) {
  return (
    <Reveal y={12}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0B2E22] to-[#0C2E23] px-5 py-4">
        <p className="flex items-center gap-2.5 text-sm text-[#EAF4EE]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
            {name.charAt(0)}
          </span>
          <span>
            Welcome back, <span className="font-semibold">{name}</span>!
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-[#BFE6D4]">
              {batch}
            </span>
          </span>
        </p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-white/20 bg-transparent font-medium text-[#EAF4EE] hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          <a href="#/portal">
            <LogIn className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Open Full Portal
          </a>
        </Button>
      </div>
    </Reveal>
  );
}

export function RoutinePage() {
  const user = usePortalStore((s) => s.user);
  const enrollments = usePortalStore((s) => s.enrollments);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);
  // Full schedule = logged in AND enrolled (course কিনলে দেখা যাবে)
  const isEnrolled = hasHydrated && !!user && enrollments.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Online Class Routine"
        title={
          <>
            Weekly <span className="text-brand-gradient">Class Routine</span>
          </>
        }
        subtitle="সাপ্তাহিক ক্লাস রুটিন শুধু ভর্তিকৃত শিক্ষার্থীদের জন্য। Student Portal-এ লগ ইন করে আপনার ব্যাচের পুরো রুটিন, Zoom লিংক ও আপডেট দেখুন।"
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {isEnrolled && user ? (
            <>
              <WelcomeStrip
                name={user.name}
                batch={enrollments[0]?.batch ?? "Enrolled"}
              />
              <div className="mt-8">
                <TodayBanner />
              </div>
              <div className="mt-14">
                <SectionHeading
                  eyebrow="Sat – Thu"
                  title={
                    <>
                      This Week&apos;s <span className="text-brand-gradient">Schedule</span>
                    </>
                  }
                  subtitle="দিন সিলেক্ট করে দেখুন সেদিনের পুরো রুটিন। সব সময় বাংলাদেশ সময় অনুযায়ী।"
                />
                <WeeklyRoutine />
              </div>

              {/* Legend */}
              <Reveal delay={0.1}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-border bg-card px-6 py-4 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-foreground/70">
                    Class modes:
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />{" "}
                    Online Live — Zoom ক্লাস
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden /> Campus —{" "}
                    ক্যাম্পাসে (Chowmuhona)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" aria-hidden />{" "}
                    Hybrid — দুটোই সুবিধামতো
                  </span>
                </div>
              </Reveal>
            </>
          ) : (
            <LockedRoutineSection />
          )}
        </div>
      </section>

      <FreeLiveClasses />
      <UpcomingBatchesBoard />
      <RoutineCta />
    </>
  );
}
