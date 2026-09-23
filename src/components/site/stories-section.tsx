"use client";

import { Quote, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { stories } from "@/lib/site-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StoriesSection() {
  return (
    <section id="stories" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              Real Students. <span className="text-brand-gradient">Real Bands.</span>
            </>
          }
          subtitle="সাজানো কথা নয়, recent batch-এর শিক্ষার্থীরা নিজের ভাষায় নিজেদের গল্পটা বলেছেন।"
        />

        <Reveal>
          <Carousel
            opts={{ align: "start", loop: true }}
            className="mx-auto w-full max-w-4xl"
            aria-label="Student success stories"
          >
            <CarouselContent className="-ml-4 pb-2">
              {stories.map((story) => (
                <CarouselItem key={story.name} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="flex h-full flex-col border-border bg-card transition-colors hover:border-primary/40">
                    <CardContent className="flex flex-1 flex-col p-6">
                      <Quote className="h-6 w-6 text-primary/50" aria-hidden />
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                      <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-brand-gradient font-display text-sm font-bold text-white">
                          {initials(story.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {story.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {story.course} · {story.date}
                          </p>
                        </div>
                        <Badge className="ml-auto shrink-0 border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
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

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            এরা সবাই recent batch-এর শিক্ষার্থী, ফলাফলের ছবি আর আরও গল্প আছে আমাদের{" "}
            <a
              href="https://www.facebook.com/Sadiasielts"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Facebook page
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
