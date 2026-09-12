"use client";

import { PageHeader } from "@/components/site/page-header";
import { LiveSchedule } from "@/components/site/live-schedule";
import { MousePointerClick, MessageSquare, Vote } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "১. ক্লাস বেছে নিন",
    body: "লাইভ চলছে কি না দেখুন, আসন্ন ক্লাসের সময় নোট করুন — রেজিস্ট্রেশনের ঝামেলা নেই।",
  },
  {
    icon: MessageSquare,
    title: "২. নাম দিয়ে ঢুকুন",
    body: "শুধু নাম লিখেই ক্লাসরুমে প্রবেশ — কোনো অ্যাপ ইনস্টল বা পাসওয়ার্ড লাগবে না।",
  },
  {
    icon: Vote,
    title: "৩. অংশ নিন",
    body: "লাইভ চ্যাটে প্রশ্ন করুন, পোলে ভোট দিন, হাত তুলে সরাসরি Sadia Ma'am-এর feedback নিন।",
  },
];

export function LivePage() {
  return (
    <>
      <PageHeader
        eyebrow="Live Learning Hub"
        title={
          <>
            লাইভ <span className="text-gold-gradient">ক্লাস</span> — সরাসরি ক্লাসরুমে
          </>
        }
        subtitle="সময়মতো ঢুকে পড়ুন, চ্যাটে প্রশ্ন করুন, পোলে ভোট দিন — স্লাইড আর ক্লাস সবার স্ক্রিনে একসাথে সিঙ্ক হয়। প্রতিটি কোর্সের স্টুডেন্টরা নিয়মিত লাইভ ক্লাস পান।"
        crumbs={[{ label: "Live Classes" }]}
      />
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <LiveSchedule />
      </section>
      <section aria-label="কীভাবে লাইভ ক্লাসে জয়েন করবেন" className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
        <div className="grid gap-4 rounded-2xl border border-primary/10 bg-card/50 p-6 sm:grid-cols-3 sm:p-8">
          {STEPS.map((step) => (
            <div key={step.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/25">
                <step.icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
