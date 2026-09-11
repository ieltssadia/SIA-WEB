"use client";

import { BookOpenCheck, ClipboardCheck, Gift, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { freeResources, site } from "@/lib/site-data";
import { useEnrollStore } from "@/lib/enroll-store";

const iconMap: Record<string, React.ElementType> = {
  video: PlayCircle,
  clipboard: ClipboardCheck,
  lightbulb: BookOpenCheck,
};

export function FreeResourcesSection() {
  const setCourse = useEnrollStore((s) => s.setCourse);

  function handleFreeCta(href: string) {
    // Preselect the free course when heading to the enroll form
    if (href === "#enroll") setCourse("free-course");
  }

  return (
    <section id="free-resources" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Start Free Today"
          title={
            <>
              Free Classes &amp; <span className="text-gold-gradient">Resources</span>
            </>
          }
          subtitle="কোর্সে ভর্তি হওয়ার আগে ফ্রি-তে শিখে নিন! ফ্রি ভিডিও লেসন, ফ্রি মক টেস্ট আর প্রমাণিত টিপস — সবই একদম বিনামূল্যে।"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {freeResources.map((res, i) => {
            const Icon = iconMap[res.icon] ?? Gift;
            const inner = (
              <>
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-7 w-7 text-primary" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">{res.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {res.desc}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-5 w-fit border-primary/30 font-semibold text-primary hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                >
                  {res.cta}
                </Button>
              </>
            );

            return (
              <Reveal key={res.title} delay={i * 0.08} className="h-full">
                <Card className="group h-full border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)]">
                  <CardContent className="flex h-full flex-col p-6">
                    {res.external ? (
                      <a
                        href={res.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${res.cta} — opens in a new tab`}
                        className="flex h-full flex-col"
                      >
                        {inner}
                      </a>
                    ) : (
                      <a href={res.href} onClick={() => handleFreeCta(res.href)} className="flex h-full flex-col">
                        {inner}
                      </a>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>

        {/* Free-to-paid funnel strip — 10MS style */}
        <Reveal delay={0.15} className="mt-10">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-[#1d1808] via-[#141419] to-[#1d1808] p-6 text-center md:flex-row md:text-left">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              <span className="font-display text-base font-bold text-foreground">
                প্রথমে ফ্রি-তে বিশ্বাস করুন, তারপর ভর্তি হন।
              </span>{" "}
              হাজারো শিক্ষার্থী আমাদের ফ্রি রিসোর্স দিয়ে শুরু করে এখন Band 7+ অর্জন করেছে —
              আপনিও পারেন।
            </p>
            <div className="flex shrink-0 flex-wrap justify-center gap-3">
              <Button
                asChild
                className="bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90"
              >
                <a href="#courses">See All Courses</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
              >
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp — opens in a new tab"
                >
                  Ask on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
