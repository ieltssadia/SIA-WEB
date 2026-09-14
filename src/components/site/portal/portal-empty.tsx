"use client";

import {
  ArrowRight,
  BookX,
  CalendarClock,
  GraduationCap,
  LogOut,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { courses, site } from "@/lib/site-data";
import { usePortalStore, type PortalUser } from "@/lib/portal-store";

const formatBDT = (n: number) => (n === 0 ? "Free" : `৳${n.toLocaleString("en-US")}`);

/**
 * Logged-in account with NO course enrollment — the portal is intentionally
 * empty until the student joins a batch. Shows account status, an empty
 * state, quick course suggestions and support.
 */
export function EmptyPortal({ user }: { user: PortalUser }) {
  const logout = usePortalStore((s) => s.logout);
  const firstName = user.name.split(" ")[0];
  const popular = [...courses].sort((a, b) => b.students - a.students).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      {/* Account band */}
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
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.25em] text-[#63D6A4]">Student Portal</p>
              <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-[#EAF4EE] md:text-3xl">
                Assalamu Alaikum, {firstName}!
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-400"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                  Account active · {user.phone}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-white/20 bg-transparent font-medium text-[#EAF4EE] hover:border-red-500/50 hover:bg-red-500/10 hover:text-[#f08c8c]"
            >
              <LogOut className="mr-1.5 h-4 w-4" aria-hidden />
              Log out
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Empty state */}
      <Reveal y={12} delay={0.06}>
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/50 px-6 py-14 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookX className="h-8 w-8 text-primary" aria-hidden />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
            You haven&apos;t enrolled in any course yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            আপনার account তৈরি আছে, কিন্তু কোনো কোর্সে ভর্তি হয়নি। কোর্সে ভর্তি হলেই এখানে
            পাবেন — আপনার ব্যাচের রুটিন, লাইভ ক্লাস, study materials, mock scores আর batch
            notices।
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-ink font-semibold text-white shadow-[0_8px_30px_rgba(16,22,19,0.18)] hover:opacity-85"
            >
              <a href="#/checkout">
                <GraduationCap className="mr-2 h-4.5 w-4.5" aria-hidden />
                Enroll in a Course
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
            >
              <a href={site.phoneHref}>
                <Phone className="mr-2 h-4 w-4" aria-hidden />
                Call {site.phone}
              </a>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Suggested courses */}
      <Reveal y={12} delay={0.1}>
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold text-foreground">
            Start with a <span className="text-brand-gradient">popular course</span>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <a
                key={c.slug}
                href={`#/checkout?course=${c.slug}`}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-semibold text-primary">
                    {c.tag}
                  </Badge>
                  <span className="font-display text-sm font-bold text-brand-gradient">
                    {formatBDT(c.price ?? 0)}
                  </span>
                </div>
                <p className="mt-3 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary">
                  {c.title}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {c.nextBatch} · {c.lessons} lessons
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  View details
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Support */}
      <Reveal y={12} delay={0.12}>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/[0.05] p-5 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            ভর্তি বা payment নিয়ে প্রশ্ন আছে? আমরা আছি — Sat–Thu, 9 AM – 9 PM।
          </p>
          <div className="flex shrink-0 gap-2.5">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-primary/30 font-medium hover:border-primary/60 hover:text-primary"
            >
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-ink font-semibold text-white hover:opacity-85">
              <a href={site.phoneHref}>
                <Phone className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
