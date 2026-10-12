"use client";

import Image from "next/image";
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
 * 10MS / banglayielts-style "how the class works" explainer — the learning loop from
 * enrollment to certificate with photographic step cards.
 */

type Step = {
  icon: LucideIcon;
  title: string;
  en: string;
  image: string;
  chips: string[];
};

const steps: Step[] = [
  {
    icon: UserPlus,
    title: "ভর্তি ও পেমেন্ট",
    en: "Enroll in minutes",
    image: "/images/features/step-enroll.jpg",
    chips: ["bKash · Bank QR · Cash", "Instant portal access"],
  },
  {
    icon: MonitorPlay,
    title: "লাইভ ক্লাসে জয়েন",
    en: "Learn with your batch",
    image: "/images/features/step-live.jpg",
    chips: ["Zoom live", "Campus hybrid", "Recorded archive"],
  },
  {
    icon: ClipboardCheck,
    title: "প্র্যাকটিস ও এক্সাম",
    en: "Practice like the real exam",
    image: "/images/features/step-mock.jpg",
    chips: ["Lecture sheets", "Weekly full mock", "Band report"],
  },
  {
    icon: Award,
    title: "সার্টিফিকেট ও সাফল্য",
    en: "Get certified",
    image: "/images/features/step-success.jpg",
    chips: ["1:1 feedback", "Leaderboard", "Certificate"],
  },
];

export function HowItWorksSection() {
  const learners = stats.find((s) => s.label === "Successful Learners");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              ভর্তি থেকে <span className="text-brand-gradient">সার্টিফিকেট</span>: চারটি ধাপ
            </>
          }
          subtitle="কোনো ধাপে একা থাকতে হবে না, প্রতিটি ধাপে গাইডলাইন, সাপোর্ট আর পরিষ্কার উত্তর।"
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
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(169,127,42,0.12)]">
                  {/* Photo Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-black/20"
                    />
                    
                    {/* Floating Step Number */}
                    <span
                      aria-hidden
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 font-display text-xs font-bold text-white shadow-md backdrop-blur-md"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Floating Icon disc */}
                    <span className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-card/90 shadow-md backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-bold text-foreground">
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
                  </div>
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
              শিক্ষার্থীর প্রমাণিত রুটিন, প্রতি সপ্তাহে নতুন ব্যাচ শুরু হয়।
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
