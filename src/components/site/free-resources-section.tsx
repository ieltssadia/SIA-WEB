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

/* 10MS-style one-liners — site-data descs are the long-form fallback */
const shortDesc: Record<string, string> = {
  "Free Video Lessons": "মডিউল-ভিত্তিক ফ্রি ভিডিও ক্লাস — আজই দেখা শুরু করুন।",
  "Free Mock Test": "ফুল-লেন্থ মক টেস্ট ফ্রি — বর্তমান ব্যান্ড জানুন।",
  "Free Tips & Tricks": "প্রতিটি প্রশ্ন টাইপের প্রমাণিত শর্টকাট পড়ুন।",
};

export function FreeResourcesSection() {
  const setCourse = useEnrollStore((s) => s.setCourse);

  function handleFreeCta(href: string) {
    // Preselect the free course when heading to the enroll form
    if (href === "#/contact") setCourse("free-course");
  }

  return (
    <section id="free-resources" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Start Free Today"
          title={
            <>
              Free Classes &amp; <span className="text-brand-gradient">Resources</span>
            </>
          }
          subtitle="ফ্রি ভিডিও লেসন, ফ্রি মক টেস্ট আর প্রমাণিত টিপস — সবই একদম বিনামূল্যে।"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {freeResources.map((res, i) => {
            const Icon = iconMap[res.icon] ?? Gift;
            const inner = (
              <>
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">{res.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {shortDesc[res.title] ?? res.desc}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-fit rounded-full border-border bg-card font-semibold text-foreground hover:border-primary/50 hover:text-primary"
                >
                  {res.cta}
                </Button>
              </>
            );

            return (
              <Reveal key={res.title} delay={i * 0.08} className="h-full">
                <Card className="group h-full border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(169,127,42,0.08)]">
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
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#15120b] via-[#16130c] to-[#15120b] p-6 text-center md:flex-row md:text-left">
            <p className="max-w-xl text-sm leading-relaxed text-[#c6b995]">
              <span className="font-display text-base font-bold text-[#f6ecd4]">
                প্রথমে ফ্রি-তে বিশ্বাস করুন, তারপর ভর্তি হন।
              </span>{" "}
              হাজারো শিক্ষার্থীর প্রমাণিত পথ।
            </p>
            <div className="flex shrink-0 flex-wrap justify-center gap-3">
              <Button
                asChild
                className="rounded-full bg-brand-gradient font-semibold text-white hover:opacity-90"
              >
                <a href="#/courses">See All Courses</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 bg-white/[0.05] font-medium text-[#f6ecd4] hover:border-white/40 hover:bg-white/10"
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
