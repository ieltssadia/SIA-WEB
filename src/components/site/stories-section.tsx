"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Quote, Star, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { stories, type Story } from "@/lib/site-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const CATEGORIES = [
  { id: "all", label: "সব রিভিউ" },
  { id: "band8", label: "Band 7.5 - 8.0" },
  { id: "speaking", label: "Speaking Club" },
  { id: "writing", label: "Writing Feedback" },
  { id: "crash", label: "Crash & Fast Track" },
] as const;

export function StoriesSection() {
  const [filter, setFilter] = useState<string>("all");

  const filteredStories = useMemo(() => {
    if (filter === "band8") return stories.filter((s) => s.score >= 7.5);
    if (filter === "speaking") return stories.filter((s) => s.tag?.toLowerCase().includes("speaking"));
    if (filter === "writing") return stories.filter((s) => s.tag?.toLowerCase().includes("writing"));
    if (filter === "crash") return stories.filter((s) => s.course.toLowerCase().includes("crash") || s.tag?.includes("Fast"));
    return stories;
  }, [filter]);

  return (
    <section id="stories" className="scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              Real Students. <span className="text-brand-gradient">Real Facebook Reviews.</span>
            </>
          }
          subtitle="আমাদের ফেসবুক পেজের অফিসিয়াল রিভিউ ও রেকমেন্ডেশন — শিক্ষার্থীদের সরাসরি অভিজ্ঞতা।"
        />

        {/* Official Facebook Rating Banner */}
        <Reveal y={10}>
          <div className="mx-auto mb-10 max-w-3xl rounded-3xl border border-[#1877F2]/25 bg-gradient-to-r from-[#1877F2]/10 via-background to-[#1877F2]/10 p-5 text-center shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] font-display text-base font-bold text-white shadow">
                  f
                </span>
                <span className="text-left font-display font-bold text-foreground">
                  Facebook Reviews & Recommendations
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-sm font-bold text-foreground">4.9 / 5.0</span>
                <span className="text-xs text-muted-foreground">(200+ Reviews)</span>
              </div>

              <a
                href="https://www.facebook.com/Sadiasielts/reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-[#1877F2] px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-[#1877F2]/90"
              >
                ফেসবুক পেজে সব রিভিউ দেখুন
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              size="sm"
              variant={filter === cat.id ? "default" : "outline"}
              className={`rounded-full text-xs font-semibold transition ${
                filter === cat.id
                  ? "bg-ink text-white"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Reviews Carousel */}
        <Reveal>
          <Carousel
            opts={{ align: "start", loop: true }}
            className="mx-auto w-full max-w-6xl"
            aria-label="Facebook student success reviews"
          >
            <CarouselContent className="-ml-4 pb-4">
              {filteredStories.map((story) => (
                <CarouselItem key={story.name} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="flex h-full flex-col justify-between rounded-3xl border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                    <CardContent className="flex flex-1 flex-col p-6">
                      {/* Top bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1877F2]">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-bold text-white">
                            f
                          </span>
                          Recommends
                        </span>
                      </div>

                      {/* Review text */}
                      <div className="relative mt-4 flex-1">
                        <Quote className="absolute -left-1 -top-1 h-5 w-5 text-primary/20" aria-hidden />
                        <p className="relative pl-5 text-sm leading-relaxed text-foreground/90">
                          &ldquo;{story.quote}&rdquo;
                        </p>
                      </div>

                      {/* Tag pill */}
                      {story.tag && (
                        <div className="mt-4">
                          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                            {story.tag}
                          </span>
                        </div>
                      )}

                      {/* User Info footer */}
                      <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-brand-gradient font-display text-sm font-bold text-white shadow-sm">
                          {initials(story.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                            {story.name}
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#1877F2]" />
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {story.course} · {story.date}
                          </p>
                        </div>
                        <Badge className="shrink-0 border-primary/40 bg-primary/15 text-primary hover:bg-primary/15 font-bold">
                          <Trophy className="mr-1 h-3 w-3" aria-hidden />
                          {story.band}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-primary/25 text-foreground hover:border-primary/60 hover:text-primary" />
            <CarouselNext className="border-primary/25 text-foreground hover:border-primary/60 hover:text-primary" />
          </Carousel>
        </Reveal>

        {/* Footer Link */}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <p className="text-xs text-muted-foreground">
              এরা সবাই আমাদের অফলাইন ও অনলাইন ব্যাচের বাস্তব শিক্ষার্থী।
            </p>
            <a
              href="https://www.facebook.com/Sadiasielts/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] underline-offset-4 hover:underline"
            >
              Official Facebook Reviews Link
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

