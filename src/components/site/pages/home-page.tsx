"use client";

import { GraduationCap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { StatsStrip } from "@/components/site/stats-strip";
import { CoursesSection } from "@/components/site/courses-section";
import { FreeResourcesSection } from "@/components/site/free-resources-section";
import { RoutineBanner } from "@/components/site/routine-banner";
import { SkillsSection } from "@/components/site/skills-section";
import { StoriesSection } from "@/components/site/stories-section";
import { FaqSection } from "@/components/site/faq-section";
import { Reveal } from "@/components/site/reveal";
import { site } from "@/lib/site-data";

function HomeCta() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-[#1d1808] via-[#141419] to-[#1d1808] p-8 text-center md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 top-0 h-[300px] w-[300px] rounded-full bg-radial-glow blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 bottom-0 h-[300px] w-[300px] rounded-full bg-radial-glow blur-2xl"
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Ready to Unlock <span className="text-gold-gradient">Your Future?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Join 5,983+ successful learners — free assessment, flexible batches, proven
                results. আপনার IELTS journey আজই শুরু করুন।
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-gold-gradient text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.3)] hover:opacity-90"
                >
                  <a href="#/contact">
                    <GraduationCap className="mr-1.5 h-5 w-5" aria-hidden />
                    Enroll Now
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-base font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
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

export function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <CoursesSection featured />
      <FreeResourcesSection />
      <RoutineBanner />
      <SkillsSection />
      <StoriesSection />
      <FaqSection />
      <HomeCta />
    </>
  );
}
