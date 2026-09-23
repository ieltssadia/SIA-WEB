"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, LockKeyhole, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoutineTable, useCatalogRoutine } from "@/components/site/weekly-routine";

/**
 * Compact "members only" teaser used on course pages & the home banner —
 * replaces the public routine with a portal CTA.
 */
export function LockedRoutineCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-card p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <LockKeyhole className="h-5.5 w-5.5 text-primary" aria-hidden />
      </span>
      <p className="mt-3 font-display text-lg font-bold text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <Button
          asChild
          className="rounded-full bg-ink font-semibold text-white hover:opacity-85"
        >
          <Link href="#/portal">
            <LogIn className="mr-1.5 h-4 w-4" aria-hidden />
            Open Student Portal
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-border bg-card text-foreground font-medium hover:border-primary/50 hover:text-primary"
        >
          <Link href="#/checkout">
            <GraduationCap className="mr-1.5 h-4 w-4" aria-hidden />
            Enroll Now
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Full "members only" section for the routine page: a blurred preview of the
 * real schedule under a login panel. The table is aria-hidden so screen
 * readers can't extract the gated schedule either.
 */
export function LockedRoutineSection() {
  const routine = useCatalogRoutine();
  const previewRows = routine.filter((r) => r.day === "Saturday");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card">
      {/* Blurred preview of the real table */}
      <div
        aria-hidden
        className="pointer-events-none select-none p-4 blur-[5px] sm:p-6"
      >
        <RoutineTable rows={previewRows} />
        <div className="mt-4 h-24 rounded-2xl bg-muted" />
      </div>

      {/* Overlay panel */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/70 via-background/85 to-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-6 text-center shadow-[0_30px_80px_rgba(30,27,20,0.18)] backdrop-blur-md sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient">
            <LockKeyhole className="h-6.5 w-6.5 text-white" aria-hidden />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">
            For Enrolled Students Only
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            সম্পূর্ণ সাপ্তাহিক রুটিন, আপনার ব্যাচের ক্লাস, Zoom লিংক, সব কিছু দেখতে Student
            Portal-এ লগ ইন করুন (ভর্তির সময় দেওয়া মোবাইল নম্বর দিয়ে)।
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="rounded-full bg-ink font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85"
            >
              <Link href="#/portal">
                <LogIn className="mr-1.5 h-4 w-4" aria-hidden />
                Open Student Portal
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border bg-card text-foreground font-medium hover:border-primary/50 hover:text-primary"
            >
              <Link href="#/checkout">
                Not enrolled? Enroll Now
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free live classes &amp; admission batches below are open to everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
