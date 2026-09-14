"use client";

import { ArrowUpRight, Facebook, Lightbulb, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { site, tips } from "@/lib/site-data";

const iconMap: Record<string, React.ElementType> = {
  lightbulb: Lightbulb,
  target: Target,
  zap: Zap,
};

export function TipsSection() {
  return (
    <section
      id="tips"
      className="scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Free Resources"
          title={
            <>
              Free IELTS <span className="text-brand-gradient">Tips & Tricks</span>
            </>
          }
          subtitle="প্রতি সপ্তাহে নতুন শর্টকাট টেকনিক — আমাদের ব্লগ ও ফেসবুক পেজে ফ্রি।"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {tips.map((tip, i) => {
            const Icon = iconMap[tip.icon] ?? Lightbulb;
            return (
              <Reveal key={tip.title} delay={i * 0.08} className="h-full">
                <Card className="group flex h-full flex-col border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                      </span>
                      <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                        {tip.category}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg font-bold leading-snug text-foreground">
                      {tip.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-bengali">{tip.excerpt}</span>
                    </p>
                    <a
                      href={site.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-accent-foreground"
                    >
                      Read full tricks
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-border bg-card text-foreground hover:border-primary/50 hover:text-primary"
          >
            <a href={site.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className="mr-2 h-4 w-4" aria-hidden />
              Follow us on Facebook for weekly free tips
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
