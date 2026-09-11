"use client";

import { PageHeader } from "@/components/site/page-header";
import { TipsSection } from "@/components/site/tips-section";

export function TipsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free Resources"
        title={
          <>
            Free IELTS <span className="text-gold-gradient">Tips &amp; Tricks</span>
          </>
        }
        subtitle="প্রতিটি প্রশ্ন টাইপের জন্য প্রমাণিত শর্টকাট টেকনিক — Reading, Listening, Writing ও Speaking। প্রতি সপ্তাহে নতুন টিপস, সম্পূর্ণ ফ্রি।"
        crumbs={[{ label: "Free Tips" }]}
      />
      <TipsSection />
    </>
  );
}
