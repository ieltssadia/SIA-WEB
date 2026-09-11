"use client";

import { BookOpen, Headphones, Mic, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { skills } from "@/lib/site-data";

const iconMap: Record<string, React.ElementType> = {
  headphones: Headphones,
  book: BookOpen,
  pen: PenLine,
  mic: Mic,
};

export function SkillsSection() {
  return (
    <section id="skills" className="scroll-mt-24 border-y border-primary/10 bg-[#0d0d10] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Four Modules"
          title={
            <>
              Master All Four <span className="text-gold-gradient">IELTS Skills</span>
            </>
          }
          subtitle="Listening, Reading, Writing ও Speaking — প্রতিটি মডিউলের জন্য আলাদা কৌশল, নিয়মিত প্র্যাকটিস ও ব্যক্তিগত ফিডব্যাক।"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, i) => {
            const Icon = iconMap[skill.icon] ?? BookOpen;
            return (
              <Reveal key={skill.title} delay={i * 0.08} className="h-full">
                <Card className="group relative h-full overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <CardContent className="p-6">
                    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                    </span>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {skill.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground [.font-bengali&]:leading-loose">
                      <span className="font-bengali">{skill.bn}</span>
                    </p>
                    <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground/80">
                      {skill.en}
                    </p>
                  </CardContent>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gold-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
