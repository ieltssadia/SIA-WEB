"use client";

import { PageHeader } from "@/components/site/page-header";
import { StatsStrip } from "@/components/site/stats-strip";
import { WhyUsSection } from "@/components/site/why-us-section";
import { InstructorSection } from "@/components/site/instructor-section";

export function AboutPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Meet <span className="text-brand-gradient">Sadia Rahman</span> &amp; Her Mission
          </>
        }
        subtitle="৯ বছর, ৩১৬+ ব্যাচ, ৫,০০০+ শিক্ষার্থী। ছোট শহর Sreemangal থেকে কীভাবে একটি বিশ্বস্ত নাম তৈরি হলো, সেই গল্প।"
        crumbs={[{ label: "About" }]}
      />
      <InstructorSection />
      <WhyUsSection />
      <StatsStrip />
    </>
  );
}
