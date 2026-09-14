"use client";

import {
  Award,
  ClipboardCheck,
  GraduationCap,
  MonitorPlay,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { stats } from "@/lib/site-data";

/**
 * 10MS-style "how the class works" explainer — the learning loop from
 * enrollment to certificate. 10MS sells this loop on every surface (live
 * Zoom classes, archived recordings, lecture sheets, weekly exams,
 * leaderboards, certificates); here it becomes one scannable section.
 */

type Step = {
  icon: LucideIcon;
  title: string;
  en: string;
  chips: string[];
};

const steps: Step[] = [
  {
    icon: UserPlus,
    title: "ভর্তি ও পেমেন্ট",
    en: "Enroll in minutes",
    chips: ["bKash · Nagad · Cash", "Instant portal access"],
  },
  {
    icon: MonitorPlay,
    title: "লাইভ ক্লাসে জয়েন",
    en: "Learn with your batch",
    chips: ["Zoom live", "Campus hybrid", "Recorded archive"],
  },
  {
    icon: ClipboardCheck,
    title: "প্র্যাকটিস ও এক্সাম",
    en: "Practice like the real exam",
    chips: ["Lecture sheets", "Weekly full mock", "Band report"],
  },
  {
    icon: Award,
    title: "সার্টিফিকেট ও সাফল্য",
    en: "Get certified",
    chips: ["1:1 feedback", "Leaderboard", "Certificate"],
  },
];

export function HowItWorksSection() {
  const learners = stats.find((s) => s.label === "Successful Learners");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              কীভাবে ক্লাস হয় — <span className="text-brand-gradient">Enrollment to Certificate</span>
            </>
          }
          subtitle="ভর্তি থেকে সার্টিফিকেট — proven লার্নিং লুপে সাজানো।"
        />

        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop) — sits behind the number badges */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent lg:block"
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.08}>
                <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(169,127,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="font-display text-4xl font-black text-primary/15 transition-colors group-hover:text-primary/30"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    {step.en}
                  </p>

                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {step.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Proof strip */}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#15120b] via-[#16130c] to-[#15120b] px-6 py-5 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-[#c6b995]">
              <span className="font-display text-lg font-bold text-[#f6ecd4]">
                {learners ? `${learners.value.toLocaleString("en-US")}${learners.suffix}` : "5,983+"}
              </span>{" "}
              শিক্ষার্থীর প্রমাণিত রুটিন — প্রতি সপ্তাহে নতুন ব্যাচ শুরু হয়।
            </p>
            <Button
              asChild
              className="shrink-0 rounded-full bg-brand-gradient font-semibold text-white shadow-[0_4px_20px_rgba(169,127,42,0.25)] hover:opacity-90"
            >
              <a href="#/courses">
                <GraduationCap className="mr-1.5 h-4 w-4" aria-hidden />
                Choose Your Course
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
