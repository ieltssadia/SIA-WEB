"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, GraduationCap, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Hero } from "@/components/site/hero";
import { StatsStrip } from "@/components/site/stats-strip";
import { CoursesSection } from "@/components/site/courses-section";
import { CambridgeTeaser } from "@/components/site/cambridge-teaser";
import { HowItWorksSection } from "@/components/site/how-it-works-section";
import { FreeResourcesSection } from "@/components/site/free-resources-section";
import { RoutineBanner } from "@/components/site/routine-banner";
import { SkillsSection } from "@/components/site/skills-section";
import { StoriesSection } from "@/components/site/stories-section";
import { TeamMarquee } from "@/components/site/team-marquee";
import { FaqSection } from "@/components/site/faq-section";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { books, site } from "@/lib/site-data";

function BookShopTeaser() {
  const featured = books.slice(0, 4);
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              ক্লাসরুমে পরীক্ষিত <span className="text-brand-gradient">বই ও নোটস</span>
            </>
          }
          subtitle="বছরের পর বছর ক্লাসে ব্যবহৃত ম্যাটেরিয়ালস, বাংলা ব্যাখ্যাসহ। WhatsApp-এ অর্ডার করুন, সারা বাংলাদেশে ডেলিভারি।"
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {featured.map((book, i) => (
            <Reveal key={book.slug} delay={i * 0.07}>
              <a href="#/shop" className="group block" aria-label={`Shop page: ${book.title}`}>
                <Card className="overflow-hidden border-border bg-card transition-colors group-hover:border-primary/40">
                  <CardContent className="p-3">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-primary/20 bg-forest">
                      <Image
                        src={book.cover}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover opacity-90"
                      />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      {book.tag ? (
                        <Badge className="absolute right-1.5 top-1.5 border-transparent bg-brand-gradient text-[9px] font-bold text-white">
                          {book.tag}
                        </Badge>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="font-display text-xs font-bold leading-snug text-white line-clamp-2">
                          {book.title}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-[#d9b75c]">৳{book.price.toLocaleString("en-US")}</p>
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
              className="rounded-full border-border bg-card text-foreground font-semibold hover:border-primary/50 hover:text-primary"
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
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#15120b] via-[#16130c] to-[#15120b] p-8 text-center md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 top-0 h-[300px] w-[300px] rounded-full bg-radial-glow blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 bottom-0 h-[300px] w-[300px] rounded-full bg-radial-glow blur-2xl"
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold leading-tight text-[#f6ecd4] md:text-4xl">
                পরের সাফল্যের গল্পটা <span className="text-[#d9b75c]">আপনার হোক</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-[#c6b995]">
                আসন শেষ হওয়ার আগেই ভর্তি নিশ্চিত করুন। ভর্তির আগে ফ্রি assessment,
                রুটিন বান্ধব ব্যাচ, আর শুরু থেকে শেষ পর্যন্ত একজন mentor-এর সাপোর্ট।
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-brand-gradient text-base font-semibold text-white shadow-[0_8px_30px_rgba(169,127,42,0.3)] hover:opacity-90"
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
                  className="rounded-full border-white/20 bg-white/[0.05] text-base font-medium text-[#f6ecd4] hover:border-white/40 hover:bg-white/10"
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

function TeamStrip() {
  return (
    <section id="team" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              যাঁরা আপনাকে পড়াবেন, <span className="text-brand-gradient">পরিচিত হোন</span>
            </>
          }
          subtitle="প্রতিটি খাতা, প্রতিটি mock test, প্রতিটি প্রশ্নের উত্তর, এঁদের হাতে। ছবিতে ক্লিক করলেই প্রোফাইল।"
        />
      </div>
      <TeamMarquee />
      <div className="mx-auto mt-6 max-w-7xl px-4 text-center lg:px-8">
        <a
          href="#/team"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
        >
          পুরো টিম আর সব প্রোফাইল দেখুন
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
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
      <CambridgeTeaser />
      <HowItWorksSection />
      <FreeResourcesSection />
      <RoutineBanner />
      <SkillsSection />
      <StoriesSection />
      <TeamStrip />
      <BookShopTeaser />
      <FaqSection />
      <HomeCta />
    </>
  );
}
