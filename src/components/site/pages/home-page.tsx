"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, GraduationCap, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Hero } from "@/components/site/hero";
import { StatsStrip } from "@/components/site/stats-strip";
import { CoursesSection } from "@/components/site/courses-section";
import { FreeResourcesSection } from "@/components/site/free-resources-section";
import { RoutineBanner } from "@/components/site/routine-banner";
import { SkillsSection } from "@/components/site/skills-section";
import { StoriesSection } from "@/components/site/stories-section";
import { FaqSection } from "@/components/site/faq-section";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { books, site } from "@/lib/site-data";

function BookShopTeaser() {
  const featured = books.slice(0, 4);
  return (
    <section className="border-y border-primary/10 bg-[#0d0d10] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Book Shop"
          title={
            <>
              IELTS Books by <span className="text-gold-gradient">Sadia Rahman</span>
            </>
          }
          subtitle="Classroom-tested study materials — বাংলা ব্যাখ্যাসহ। Order via WhatsApp, delivery all over Bangladesh."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {featured.map((book, i) => (
            <Reveal key={book.slug} delay={i * 0.07}>
              <a href="#/shop" className="group block" aria-label={`Shop page — ${book.title}`}>
                <Card className="overflow-hidden border-border bg-card transition-colors group-hover:border-primary/40">
                  <CardContent className="p-3">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-primary/20 bg-[#0b0b0e]">
                      <Image
                        src={book.cover}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover opacity-90"
                      />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      {book.tag ? (
                        <Badge className="absolute right-1.5 top-1.5 border-transparent bg-gold-gradient text-[9px] font-bold text-[#16120a]">
                          {book.tag}
                        </Badge>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="font-display text-xs font-bold leading-snug text-foreground line-clamp-2">
                          {book.title}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-primary">৳{book.price.toLocaleString("en-US")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="border-primary/30 font-semibold hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
            >
              <a href="#/shop">
                <BookOpen className="mr-1.5 h-4 w-4" aria-hidden />
                Visit the Book Shop
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

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
                  <a href="#/checkout">
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
      <BookShopTeaser />
      <FaqSection />
      <HomeCta />
    </>
  );
}
