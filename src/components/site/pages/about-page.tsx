"use client";

import { PageHeader } from "@/components/site/page-header";
import { StatsStrip } from "@/components/site/stats-strip";
import { WhyUsSection } from "@/components/site/why-us-section";
import { InstructorSection } from "@/components/site/instructor-section";

export function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title={
          <>
            Meet <span className="text-gold-gradient">Sadia Rahman</span> &amp; Her Mission
          </>
        }
        subtitle="৯ বছরের অভিজ্ঞতা, ৩১৬+ ব্যাচ আর ৫,৯৮৩+ সফল শিক্ষার্থী — Sreemangal-এর সবচেয়ে বিশ্বস্ত IELTS কোচিং সেন্টারের গল্প।"
        crumbs={[{ label: "About" }]}
      />
      <InstructorSection />
      <WhyUsSection />
      <StatsStrip />
    </>
  );
}
