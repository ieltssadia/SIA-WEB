"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Award, BookCheck, ShieldCheck } from "lucide-react";
import { stats } from "@/lib/site-data";

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [active, target, duration]);

  return value;
}

function StatItem({
  value,
  suffix,
  label,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const display = useCountUp(value, active);
  return (
    <div className="text-center">
      <p className="font-display text-4xl font-bold text-[#d9b75c] sm:text-5xl">
        {display.toLocaleString("en-US")}
        {suffix}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a3977b] sm:text-xs">
        {label}
      </p>
    </div>
  );
}

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section aria-label="Our achievements and accreditation" className="border-y border-white/10 bg-forest">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:gap-10 md:py-16 lg:px-8"
      >
        {stats.map((s) => (
          <StatItem key={s.label} {...s} active={inView} />
        ))}
      </div>

      {/* Minimalist Trust & Accreditation badges inspired by official test partners */}
      <div className="border-t border-white/10 bg-black/20 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition-colors hover:border-white/15">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/10 text-[#d9b75c]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Official Test Partner</p>
              <p className="text-[11px] text-white/60">British Council &amp; IDP IELTS Registration Support</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition-colors hover:border-white/15">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/10 text-[#d9b75c]">
              <BookCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Cambridge 1–19 Standard</p>
              <p className="text-[11px] text-white/60">Authentic Academic &amp; General Training Mock Tests</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition-colors hover:border-white/15">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/10 text-[#d9b75c]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Band 7.5+ Mentor Guidance</p>
              <p className="text-[11px] text-white/60">1-on-1 Essay Feedback &amp; Speaking Mock Sessions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
