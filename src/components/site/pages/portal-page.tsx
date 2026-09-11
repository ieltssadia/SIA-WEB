"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Facebook,
  Headphones,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { ModeBadge, RoutineTable, todaysClasses } from "@/components/site/weekly-routine";
import { classRoutine, courses, freeLiveClasses, site, weekDays, type RoutineClass, type WeekDay } from "@/lib/site-data";
import { usePortalStore, type PortalStudent } from "@/lib/portal-store";

const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useToday(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()),
    () => ""
  );
}

function toMinutes(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

/** The student's / everyone's next upcoming class from the weekly routine. */
function findNextClass(now: Date): { row: RoutineClass; label: string } | null {
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

const isShared = (row: RoutineClass) => /all|everyone/i.test(row.batch);

/* ------------------------------------------------------------------ */
/* Login                                                                */
/* ------------------------------------------------------------------ */

const demoNumbers = [
  { phone: "01712000001", label: "Anika — In Batch 317" },
  { phone: "01712000002", label: "Fariha — Private Batch" },
  { phone: "01712000003", label: "Milon — One-to-One" },
  { phone: "01712000004", label: "Emran — Crash Course" },
  { phone: "01712000005", label: "Eva — Pre-IELTS" },
];

function LoginCard() {
  const setStudent = usePortalStore((s) => s.setStudent);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter the mobile number you enrolled with.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json().catch(() => null)) as
        | { student?: PortalStudent; error?: string }
        | null;
      if (!res.ok || !data?.student) {
        setError(data?.error ?? "Login failed — please try again.");
        return;
      }
      setStudent(data.student);
    } catch {
      setError("Could not reach the server — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto grid max-w-4xl items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Benefits side */}
          <Reveal>
            <div className="flex h-full flex-col justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient">
                <LockKeyhole className="h-5.5 w-5.5 text-[#16120a]" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                ভর্তিকৃত শিক্ষার্থীদের জন্য <span className="text-gold-gradient">প্রাইভেট পোর্টাল</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Log in with the mobile number you enrolled with — no password needed.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
                {[
                  "আপনার ব্যাচের সম্পূর্ণ weekly routine",
                  "Next class reminder ও Zoom লিংক গাইড",
                  "Free live class ও mock test সময়সূচি",
                  "Batch update — সরাসরি mentor-এর কাছ থেকে",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Login form */}
          <Reveal delay={0.08}>
            <Card className="h-full border-primary/25 bg-card shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-display text-xl font-bold text-foreground">Portal Login</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ভর্তির সময় দেওয়া মোবাইল নম্বরটি লিখুন।
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="portal-phone">Mobile Number (used at enrollment)</Label>
                    <Input
                      id="portal-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="01XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError(null);
                      }}
                      maxLength={20}
                      autoComplete="tel"
                      aria-invalid={!!error}
                    />
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gold-gradient py-6 text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                        Checking enrollment...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4.5 w-4.5" aria-hidden />
                        Log in to Portal
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo numbers */}
                <Separator className="my-5 bg-primary/10" />
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Demo — tap a number to log in
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {demoNumbers.map((d) => (
                    <button
                      key={d.phone}
                      type="button"
                      onClick={() => {
                        setPhone(d.phone);
                        setError(null);
                      }}
                      className="rounded-full border border-border bg-[#101014] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {d.phone} · {d.label}
                    </button>
                  ))}
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Not enrolled yet?{" "}
                  <a href="#/contact" className="font-semibold text-primary hover:underline">
                    Enroll now
                  </a>{" "}
                  — your portal opens as soon as you join a batch.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

function NextClassCard({ courseSlug }: { courseSlug: string }) {
  const mounted = useMounted();
  const today = useToday();
  const rows = mounted && today ? todaysClasses(today) : [];

  return (
    <Reveal y={12}>
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-6 md:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-radial-glow blur-2xl"
        />
        <div className="relative">
          {mounted ? (
            (() => {
              const next = findNextClass(new Date());
              if (!next) {
                return <p className="text-sm text-muted-foreground">No upcoming classes found.</p>;
              }
              const mine = next.row.courseSlug === courseSlug || isShared(next.row);
              return (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3 py-1 text-[11px] font-bold text-[#16120a]">
                      <CalendarClock className="h-3 w-3" aria-hidden />
                      Next class · {next.label}
                    </span>
                    {mine ? (
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
              );
            })()
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Next class
              </p>
              <p className="mt-2 font-display text-xl font-bold text-foreground">
                {today && rows.length > 0 ? "Loading your schedule..." : "This week's schedule"}
              </p>
            </>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function PortalRoutine({ courseSlug }: { courseSlug: string }) {
  const today = useToday();
  const [day, setDay] = useState<WeekDay | null>(null);
  const [mineOnly, setMineOnly] = useState(true);

  const activeDay: WeekDay =
    day ?? ((weekDays as readonly string[]).includes(today) ? (today as WeekDay) : "Saturday");

  const isMine = (row: RoutineClass) => row.courseSlug === courseSlug || isShared(row);
  const allRows = classRoutine.filter((r) => r.day === activeDay);
  const visibleRows = mineOnly ? allRows.filter(isMine) : allRows;

  return (
    <Reveal delay={0.05}>
      <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">My Weekly Routine</h2>
          <div className="flex rounded-full border border-border bg-[#101014] p-1">
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
                      ? "bg-gold-gradient text-[#16120a]"
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
            const count = classRoutine.filter((r) => r.day === d).length;
            const isActive = activeDay === d;
            const isToday = today === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-primary/60 bg-gold-gradient text-[#16120a] shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
                    : "border-border bg-[#101014] text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {d.slice(0, 3)}
                {isToday ? (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#16120a]" : "bg-emerald-400"}`}
                    title="Today"
                  />
                ) : null}
                <span
                  className={`text-[11px] ${isActive ? "text-[#16120a]/70" : "text-muted-foreground/70"}`}
                >
                  {mineOnly
                    ? classRoutine.filter((r) => r.day === d && isMine(r)).length
                    : count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {activeDay === "Friday" ? (
            <p className="rounded-2xl border border-dashed border-primary/25 bg-[#101014] px-4 py-8 text-center text-sm text-muted-foreground">
              শুক্রবার সাপ্তাহিক ছুটি — কাল সকাল ১০টায় ক্লাস শুরু হবে।
            </p>
          ) : visibleRows.length > 0 ? (
            <RoutineTable rows={visibleRows} isMine={isMine} />
          ) : (
            <p className="rounded-2xl border border-dashed border-primary/25 bg-[#101014] px-4 py-8 text-center text-sm text-muted-foreground">
              এই দিনে আপনার ব্যাচের কোনো ক্লাস নেই — {activeDay} এ অন্য ব্যাচের ক্লাস আছে।
              &quot;Full Routine&quot; দেখুন অথবা WhatsApp গ্রুপে নোটিশ ফলো করুন।
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          সোনালি রঙিন সারি = আপনার ব্যাচ। সব সময় বাংলাদেশ সময় (GMT+6)।
        </p>
      </div>
    </Reveal>
  );
}

function CourseCard({ student }: { student: PortalStudent }) {
  const course = courses.find((c) => c.slug === student.courseSlug);
  return (
    <Reveal delay={0.08}>
      <Card className="border-primary/25">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                My Course
              </p>
              <p className="truncate font-display text-base font-bold text-foreground">
                {course?.title ?? student.courseSlug}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Batch</span>
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 font-medium text-primary"
              >
                {student.batch}
              </Badge>
            </p>
            <Separator className="bg-primary/10" />
            <p className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MonitorSmartphone className="h-3.5 w-3.5 text-primary" aria-hidden />
                Mode
              </span>
              <span className="font-medium text-foreground">{course?.mode ?? "—"}</span>
            </p>
            <Separator className="bg-primary/10" />
            <p className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                Duration
              </span>
              <span className="font-medium text-foreground">{course?.duration ?? "—"}</span>
            </p>
          </div>
          {course ? (
            <p className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-2.5 text-xs font-medium text-primary">
              <CalendarDays className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              {course.scheduleNote}
            </p>
          ) : null}
          <Button
            asChild
            variant="outline"
            className="mt-4 w-full border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
          >
            <a href={`#/courses/${student.courseSlug}`}>
              View course details
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </a>
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function SupportCard() {
  const items = [
    {
      icon: MessageCircle,
      label: "Batch WhatsApp Group",
      desc: "Class links & notices",
      href: site.whatsapp,
      external: true,
    },
    {
      icon: Phone,
      label: "Call Support",
      desc: site.phone,
      href: site.phoneHref,
      external: false,
    },
    {
      icon: Facebook,
      label: "Facebook Page",
      desc: "Free live classes",
      href: site.facebook,
      external: true,
    },
    {
      icon: Headphones,
      label: "Free Tips & Tricks",
      desc: "Practice material",
      href: "#/tips",
      external: false,
    },
  ];

  return (
    <Reveal delay={0.12}>
      <Card>
        <CardContent className="p-6">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Quick Links
          </p>
          <div className="mt-3 space-y-2.5">
            {items.map(({ icon: Icon, label, desc, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 rounded-xl border border-border bg-[#101014] p-3 transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{desc}</span>
                </span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function FreeClassesCard() {
  return (
    <Reveal delay={0.16}>
      <Card className="border-emerald-500/20">
        <CardContent className="p-6">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            This Week&apos;s Free Live Classes
          </p>
          <div className="mt-3 space-y-3">
            {freeLiveClasses.map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-[#101014] p-3">
                <p className="text-sm font-medium leading-snug text-foreground">{s.title}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                  {s.when} · {s.platform}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function Dashboard({ student }: { student: PortalStudent }) {
  const logout = usePortalStore((s) => s.logout);
  const course = courses.find((c) => c.slug === student.courseSlug);
  const firstName = student.name.split(" ")[0];

  return (
    <>
      {/* Greeting band */}
      <section className="relative overflow-hidden border-b border-primary/10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-[320px] w-[320px] rounded-full bg-radial-glow blur-2xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-14 lg:px-8">
          <Reveal y={12}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient font-display text-xl font-bold text-[#16120a]">
                  {student.name.charAt(0)}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">
                    Student Portal
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                    Assalamu Alaikum, {firstName}!
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-primary/10 font-medium text-primary"
                    >
                      {student.batch}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {course?.title ?? student.courseSlug}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="border-primary/30 font-medium hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-1.5 h-4 w-4" aria-hidden />
                Log out
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-8">
              <NextClassCard courseSlug={student.courseSlug} />
              <PortalRoutine courseSlug={student.courseSlug} />
            </div>
            <div className="space-y-6">
              <CourseCard student={student} />
              <SupportCard />
              <FreeClassesCard />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */

export function PortalPage() {
  const student = usePortalStore((s) => s.student);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);

  // Wait for the persisted session before deciding login vs dashboard
  if (!hasHydrated) {
    return (
      <>
        <PageHeader
          eyebrow="Student Portal"
          title={
            <>
              Student <span className="text-gold-gradient">Portal</span>
            </>
          }
        />
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto h-64 max-w-md animate-pulse rounded-3xl border border-border bg-card/50" />
          </div>
        </section>
      </>
    );
  }

  return student ? (
    <Dashboard student={student} />
  ) : (
    <>
      <PageHeader
        eyebrow="Student Portal"
        title={
          <>
            Student <span className="text-gold-gradient">Portal</span>
          </>
        }
        subtitle="ভর্তিকৃত শিক্ষার্থীদের জন্য প্রাইভেট পোর্টাল — আপনার ব্যাচের রুটিন, ক্লাস লিংক ও আপডেট এক জায়গায়।"
      />
      <LoginCard />
    </>
  );
}
