"use client";

import Image from "next/image";
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

const skillPhotos: Record<string, string> = {
  headphones: "/images/skills/listening.jpg",
  book: "/images/skills/reading.jpg",
  pen: "/images/skills/writing.jpg",
  mic: "/images/skills/speaking.jpg",
};

export function SkillsSection() {
  return (
    <section id="skills" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              Master All Four <span className="text-brand-gradient">IELTS Skills</span>
            </>
          }
          subtitle="Listening, Reading, Writing ও Speaking: প্রতিটি মডিউলের জন্য আলাদা কৌশল, নিয়মিত প্র্যাকটিস ও ব্যক্তিগত ফিডব্যাক।"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, i) => {
            const Icon = iconMap[skill.icon] ?? BookOpen;
            const photo = skillPhotos[skill.icon] ?? "/images/skills/reading.jpg";

            return (
              <Reveal key={skill.title} delay={i * 0.08} className="h-full">
                <Card className="group relative h-full overflow-hidden rounded-3xl border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_24px_50px_rgba(23,20,16,0.12)]">
                  {/* Photo Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={photo}
                      alt={skill.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
                    />
                    <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/95 text-ink shadow-md backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {skill.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground [.font-bengali&]:leading-loose">
                      <span className="font-bengali">{skill.bn}</span>
                    </p>
                    <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground/80">
                      {skill.en}
                    </p>
                  </CardContent>

                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-brand-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
