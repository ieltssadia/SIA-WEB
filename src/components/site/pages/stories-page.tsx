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
        title={
          <>
            Real Students, <span className="text-brand-gradient">Real Results</span>
          </>
        }
        subtitle="recent batch-গুলোর শিক্ষার্থীরা নিজের ভাষায় বলেছেন: কোথায় আটকেছিলেন, কীভাবে উঠেছেন।"
        crumbs={[{ label: "Success Stories" }]}
      />

      <section className="py-8 sm:py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, i) => (
              <Reveal key={story.name} delay={(i % 3) * 0.08} className="h-full">
                <Card className="flex h-full flex-col border-border bg-card transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-1 flex-col p-4 sm:p-6">
                    <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary/50" aria-hidden />
                    <p className="mt-3 sm:mt-4 flex-1 text-xs sm:text-sm leading-relaxed text-foreground/90 break-words text-pretty">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                    <div className="mt-5 sm:mt-6 flex items-center gap-2.5 sm:gap-3 border-t border-border/70 pt-4 sm:pt-5">
                      <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-brand-gradient font-display text-xs sm:text-sm font-bold text-white">
                        {initials(story.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-semibold text-foreground">
                          {story.name}
                        </p>
                        <p className="truncate text-[10px] sm:text-xs text-muted-foreground">
                          {story.course} · {story.date}
                        </p>
                      </div>
                      <Badge className="ml-auto shrink-0 border-primary/40 bg-primary/15 text-primary hover:bg-primary/15 text-xs">
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
            <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-[#15120b] via-[#16130c] to-[#15120b] p-8 text-center">
              <p className="font-display text-xl font-bold text-[#f6ecd4] md:text-2xl">
                পরের সফলতার গল্পটা হতে পারে আপনার!
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#c6b995]">
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
                  className="border-white/20 bg-transparent font-medium text-[#f6ecd4] hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <a
                    href={site.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sadia's IELTS on Facebook (opens in a new tab)"
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
