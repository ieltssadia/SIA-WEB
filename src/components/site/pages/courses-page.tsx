"use client";

import { PageHeader } from "@/components/site/page-header";
import { CoursesSection } from "@/components/site/courses-section";

export function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Courses"
        title={
          <>
            IELTS Courses for <span className="text-brand-gradient">Every Level</span>
          </>
        }
        subtitle="একদম শূন্য থেকে Band 7+ — আপনার current level ও টার্গেট অনুযায়ী সঠিক কোর্সটি বেছে নিন। প্রতিটি কোর্সে রয়েছে live classes, mock test আর personal feedback।"
        crumbs={[{ label: "Courses" }]}
      />
      <CoursesSection />
    </>
  );
}
