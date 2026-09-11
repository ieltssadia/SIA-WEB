"use client";

import Image from "next/image";
import { BadgeCheck, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";

const credentials = [
  { icon: BadgeCheck, label: "Cambridge & IDP Certified Trainer" },
  { icon: GraduationCap, label: "TKT & TTT Certified" },
  { icon: Sparkles, label: "Personal Band 8.5 · 9.0 in Reading & Listening" },
];

export function InstructorSection() {
  return (
    <section
      id="instructor"
      className="scroll-mt-24 border-y border-primary/10 bg-[#0d0d10] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Portrait */}
          <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2rem] bg-gold-gradient opacity-20 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-3xl border border-primary/25 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <Image
                src="/images/instructor-sadia.png"
                alt="Sadia Rahman — founder and lead IELTS instructor at Sadia's IELTS"
                width={864}
                height={1152}
                className="h-auto w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-primary/25 bg-black/60 px-4 py-3 backdrop-blur">
                <p className="font-display text-lg font-bold text-foreground">Sadia Rahman</p>
                <p className="text-xs text-primary">Founder & Lead IELTS Instructor</p>
              </div>
            </div>
          </Reveal>

          {/* Bio */}
          <div>
            <Reveal>
              <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                <span className="h-px w-8 bg-primary/60" aria-hidden />
                Meet Your Mentor
              </span>
              <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
                Learn from the <span className="text-gold-gradient italic">Best in Sylhet</span>
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                <span className="text-foreground">Sadia Rahman</span> — Cambridge, IDP &amp; TKT
                Certified IELTS Trainer — achieved an impressive{" "}
                <span className="text-foreground">Band 8.5 herself, with a perfect 9.0 in Reading
                and Listening</span>. Over <span className="text-foreground">9+ years</span> and{" "}
                <span className="text-foreground">316 completed batches</span> she has built a
                teaching system that blends proven exam strategies with genuine personal care
                for every student.
              </p>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Her mission is simple: world-class IELTS preparation should be accessible
                right here in Moulvibazar — no need to travel to Dhaka.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {credentials.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-xs font-medium text-foreground/90"
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90"
                >
                  <a href="#/contact">
                    <Sparkles className="mr-1.5 h-4.5 w-4.5" aria-hidden />
                    Enroll with Sadia
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary/30 bg-transparent hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                >
                  <a href="#/courses">View Courses</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
