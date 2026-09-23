"use client";

import Image from "next/image";
import {
  ArrowRight,
  Award,
  Briefcase,
  Globe,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { whyUs } from "@/lib/site-data";

const iconMap: Record<string, React.ElementType> = {
  globe: Globe,
  award: Award,
  briefcase: Briefcase,
  message: MessageCircle,
};

export function WhyUsSection() {
  return (
    <section id="why-us" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          title={
            <>
              পরীক্ষার হলে <span className="text-brand-gradient">নিজের উপর ভরসা</span>
            </>
          }
          subtitle="শুধু সিলেবাস শেষ করা নয়, weak point ধরে ধরে ঠিক করা, প্রতি সপ্তাহের mock-এ অভ্যাস, আর পরীক্ষার আগে শান্ত মাথা।"
        />

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Image side */}
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-[0_30px_80px_rgba(30,27,20,0.16)]">
              <Image
                src="/images/classroom.png"
                alt="Students learning together in a Sadia's IELTS classroom"
                width={1344}
                height={768}
                className="h-auto w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent"
              />
            </div>
            <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-white/10 bg-[#16130c]/95 px-5 py-4 shadow-xl backdrop-blur sm:left-10 sm:right-auto">
              <p className="font-display text-lg font-bold text-[#f6ecd4]">
                Small batches · Personal attention
              </p>
              <p className="mt-0.5 text-xs text-[#c6b995]">
                Every student gets individually tracked progress reports
              </p>
            </div>
          </Reveal>

          {/* Feature list */}
          <div className="order-1 space-y-4 lg:order-2">
            {whyUs.map((item, i) => {
              const Icon = iconMap[item.icon] ?? Globe;
              return (
                <Reveal key={item.title} delay={i * 0.08}>
                  <div className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:bg-accent/40">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <Reveal delay={0.35}>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-border bg-card text-foreground hover:border-primary/50 hover:text-primary"
              >
                <a href="#/contact">
                  Start Your Journey
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                </a>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
