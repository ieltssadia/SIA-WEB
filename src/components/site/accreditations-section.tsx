"use client";

import Image from "next/image";
import { CheckCircle2, ShieldCheck, Trophy } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

const AWARDS = [
  {
    image: "/images/badges/british-council-partner.png",
    title: "British Council Partner",
    subtitle: "Official IELTS Registration Center",
    desc: "ব্রিটিশ কাউন্সিল অনুমোদিত অফিসিয়াল টেস্ট বুকিং ও ভেন্যু সহায়তা কেন্দ্র।",
  },
  {
    image: "/images/badges/award-of-excellence.png",
    title: "Award of Excellence",
    subtitle: "Excellence in IELTS Mentorship",
    desc: "৫,০০০+ শিক্ষার্থীর ব্যান্ড ৭.০+ অর্জনে বিশ্বস্ত ও প্রমাণিত ট্রেইনিং মেথডোলজি।",
  },
];

export function AccreditationsSection() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-b from-[#14120b] via-[#100e08] to-[#14120b] text-white">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#d9b75c] backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              Official Recognition &amp; Quality Assured
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl text-[#f6ecd4]">
              ব্রিটিশ কাউন্সিল ও IDP <span className="text-[#d9b75c]">অফিসিয়াল পার্টনার</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#c6b995] sm:text-base">
              Sadia&apos;s IELTS Academy একটি সরকার-স্বীকৃত ও আন্তর্জাতিক মানসম্পন্ন IELTS প্রস্তুতি কেন্দ্র।
              রেজিস্ট্রেশন থেকে পরীক্ষা পর্যন্ত সম্পূর্ণ সাপোর্ট।
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto lg:gap-8">
          {AWARDS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.1}>
              <div className="group relative flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#d9b75c]/40 hover:bg-white/[0.06] hover:shadow-[0_20px_50px_rgba(217,183,92,0.12)]">
                {/* Badge Image */}
                <div className="relative mb-5 h-28 w-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </div>

                <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#d9b75c]">
                  {item.subtitle}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-white/70">
                  {item.desc}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified Test Partner</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
