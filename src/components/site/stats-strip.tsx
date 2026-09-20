"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
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
    <section aria-label="Our achievements" className="border-y border-white/10 bg-forest">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:gap-10 md:py-16 lg:px-8"
      >
        {stats.map((s) => (
          <StatItem key={s.label} {...s} active={inView} />
        ))}
      </div>
    </section>
  );
}
