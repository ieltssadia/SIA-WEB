"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { faqs } from "@/lib/site-data";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="FAQs"
          title={
            <>
              Frequently Asked <span className="text-brand-gradient">Questions</span>
            </>
          }
          subtitle="আপনার মনে যে প্রশ্নগুলো ঘুরছে — উত্তর এখানেই আছে।"
        />

        <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${i}`}
                className="rounded-2xl border border-border bg-card px-5 transition-colors data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:text-primary hover:no-underline [&[data-state=open]>svg]:text-primary">
                  <span className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="font-bengali">{faq.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-7 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-bengali">{faq.a}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
