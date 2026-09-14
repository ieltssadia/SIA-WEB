"use client";

import { ArrowRight, Quote, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { stories, site } from "@/lib/site-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Success Stories"
        title={
          <>
            Real Students, <span className="text-brand-gradient">Real Results</span>
          </>
        }
        subtitle="আমাদের recent batches-এর শিক্ষার্থীদের সফলতার গল্প — Band 7+ এখন আর স্বপ্ন নয়।"
        crumbs={[{ label: "Success Stories" }]}
      />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, i) => (
              <Reveal key={story.name} delay={(i % 3) * 0.08} className="h-full">
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
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0B2E22] via-[#0C2E23] to-[#0B2E22] p-8 text-center">
              <p className="font-display text-xl font-bold text-[#EAF4EE] md:text-2xl">
                পরের সফলতার গল্পটা হতে পারে আপনার!
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#A9C6B6]">
                See more result celebrations on our Facebook page, or start your own journey
                today.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  className="bg-brand-gradient font-semibold text-white hover:opacity-90"
                >
                  <a href="#/contact">
                    Start Your Journey
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-transparent font-medium text-[#EAF4EE] hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <a
                    href={site.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sadia's IELTS on Facebook — opens in a new tab"
                  >
                    Result Posts on Facebook
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
