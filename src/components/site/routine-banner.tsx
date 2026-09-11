"use client";

import { CalendarRange, Clock, MonitorSmartphone, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";
import { ModeBadge, useToday, todaysClasses } from "@/components/site/weekly-routine";

/**
 * Compact "online class routine" promo for the home page — shows today's
 * live classes (client-only) with a link to the full routine page.
 */
export function RoutineBanner() {
  const today = useToday();
  const rows = todaysClasses(today).slice(0, 4);
  const isOff = today === "Friday";

  return (
    <section className="border-y border-primary/10 bg-[#0b0b0e] py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
        {/* Copy */}
        <Reveal>
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            <span className="h-px w-8 bg-primary/60" aria-hidden />
            Online Class Routine
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
            Live Classes <span className="text-gold-gradient">Every Single Day</span>
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
            সপ্তাহে ৬ দিন — সকাল ১০টা থেকে রাত ৯টা পর্যন্ত লাইভ ক্লাস চলে। অনলাইনে (Zoom) অথবা
            ক্যাম্পাসে (Chowmuhona) — যেভাবে সুবিধা, সেভাবে ক্লাস করুন। প্রতি রবি ও বুধ রাত ৮টায়
            ফ্রি লাইভ ক্লাস সবার জন্য উন্মুক্ত।
          </p>
          <ul className="mt-5 space-y-2 text-sm text-foreground/85">
            <li className="flex items-center gap-2.5">
              <CalendarRange className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              Sat – Thu routine · Weekly Full Mock Test every Thursday
            </li>
            <li className="flex items-center gap-2.5">
              <Radio className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              Free Speaking Club every Saturday, 4:00 PM
            </li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gold-gradient font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90"
            >
              <a href="#/routine">View Full Routine</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
            >
              <a
                href="https://www.facebook.com/Sadiasielts"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Radio className="mr-2 h-4 w-4" aria-hidden />
                Join Free Live Class
              </a>
            </Button>
          </div>
        </Reveal>

        {/* Today's classes card */}
        <Reveal delay={0.1}>
          <Card className="overflow-hidden border-primary/25 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] px-6 py-4">
              <p className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                <Clock className="h-4.5 w-4.5 text-primary" aria-hidden />
                {today ? `Today · ${today}` : "This Week"}
              </p>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live Classes
              </span>
            </div>
            <CardContent className="space-y-3 p-6">
              {today && isOff ? (
                <div className="rounded-xl border border-dashed border-primary/25 px-4 py-8 text-center">
                  <p className="font-semibold text-foreground">Friday — Weekly Off</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    শুক্রবার ছুটি। কাল সকাল ১০টায় ক্লাস শুরু হবে।
                  </p>
                </div>
              ) : today && rows.length > 0 ? (
                <>
                  {rows.map((row) => (
                    <div
                      key={`${row.day}-${row.start}-${row.topic}`}
                      className="flex items-start gap-3 rounded-xl border border-border bg-[#101014] p-3.5"
                    >
                      <div className="w-24 shrink-0">
                        <p className="text-sm font-semibold text-foreground">{row.start}</p>
                        <p className="text-xs text-muted-foreground">– {row.end}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {row.batch}
                        </p>
                        <p className="truncate text-sm text-foreground/90">{row.topic}</p>
                      </div>
                      <ModeBadge mode={row.mode} />
                    </div>
                  ))}
                  <a
                    href="#/routine"
                    className="block pt-1 text-center text-xs font-semibold text-primary transition-colors hover:underline"
                  >
                    See the full weekly routine →
                  </a>
                </>
              ) : (
                <div className="rounded-xl border border-border bg-[#101014] px-4 py-8 text-center">
                  <MonitorSmartphone className="mx-auto h-6 w-6 text-primary" aria-hidden />
                  <p className="mt-2 font-semibold text-foreground">Classes run Sat – Thu</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Morning 10:00 AM to evening 9:00 PM (GMT+6)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
