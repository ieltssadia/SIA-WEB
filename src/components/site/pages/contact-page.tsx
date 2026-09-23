"use client";

import { PageHeader } from "@/components/site/page-header";
import { EnrollSection } from "@/components/site/enroll-section";

export function ContactPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Let&apos;s Get You <span className="text-brand-gradient">Enrolled</span>
          </>
        }
        subtitle="ফর্ম পূরণ করুন অথবা সরাসরি কল করুন, আমাদের টিম ২৪ ঘণ্টার মধ্যে ব্যাচের সময়সূচি ও ভর্তি প্রক্রিয়া জানিয়ে দেবে।"
        crumbs={[{ label: "Contact" }]}
      />
      <EnrollSection />
    </>
  );
}
