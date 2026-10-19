"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

/* Aero-style cinematic hero: full-bleed photograph carousel, architectural hairline
   grid, one huge centered display heading, and the two-piece gold pill CTA
   (label + arrow disc) whose arrow slides through on hover. */

const HERO_SLIDES = [
  {
    src: "/images/classroom.png",
    alt: "Sadia's IELTS Academy classroom environment",
  },
  {
    src: "/images/students/actual-success-3.jpg",
    alt: "Successful IELTS candidates with trophies",
  },
  {
    src: "/images/features/step-live.jpg",
    alt: "Interactive IELTS preparation class",
  },
  {
    src: "/images/students/actual-success-4.jpg",
    alt: "IELTS certificate recipients at Sadia's IELTS",
  },
  {
    src: "/images/students/actual-success-1.jpg",
    alt: "Official IELTS test certificate presentation",
  },
];

const heroStats = [
  { value: "৩১৬+", label: "ব্যাচ সফলভাবে শেষ" },
  { value: "৭.০+", label: "গড় band score" },
  { value: "৪.৯/৫", label: "শিক্ষার্থীদের রেটিং" },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatically cycle through background images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      aria-label="Sadia's IELTS introduction"
      className="relative flex min-h-[calc(100svh-7rem)] scroll-mt-24 items-center justify-center overflow-hidden bg-forest md:min-h-[calc(100svh-9.5rem)]"
    >
      {/* Full-bleed cinematic backdrop carousel */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <motion.div
              key={slide.src}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1.05 : 1.0,
              }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 6, ease: "easeOut" },
              }}
              className="absolute inset-0"
              style={{ zIndex: isActive ? 1 : 0 }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </motion.div>
          );
        })}

        {/* Legibility scrim — darker at the base where the trust bar sits */}
        <div className="absolute inset-0 z-[2] bg-black/50" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-forest/50 via-forest/20 to-forest/95" />
      </div>

      {/* Architectural hairline grid — Aero-style 1/3/4/3/1 columns */}
      <div aria-hidden className="absolute inset-0 z-10 hidden md:block">
        <div className="grid h-full w-full grid-cols-12 divide-x divide-white/10">
          <div className="col-span-1 h-full" />
          <div className="col-span-3 h-full" />
          <div className="col-span-4 h-full" />
          <div className="col-span-3 h-full" />
          <div className="col-span-1 h-full" />
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-20 mx-auto w-full max-w-5xl px-6 pb-32 pt-20 text-center md:pb-36">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease }}
          className="font-display text-[2.9rem] font-medium leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.4rem]"
        >
          Target Band 7+?
          <br />
          আমরা পৌঁছে দেব।
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base font-light leading-relaxed text-white/85 md:text-lg lg:text-xl"
        >
          Basic grammar থেকে শুরু করে পরীক্ষার আগের শেষ mock পর্যন্ত প্রতিটি ধাপে থাকছে
          একজন mentor, একটি পরিকল্পনা, আর নিজের খাতায় দেখা অগ্রগতি।
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease }}
          className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-white/80"
        >
          <span className="text-white/60">Study Abroad Destinations:</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-white/90">
            🇬🇧 UK
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-white/90">
            🇨🇦 Canada
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-white/90">
            🇦🇺 Australia
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-white/90">
            🇺🇸 USA
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-white/90">
            🇸🇪 Sweden
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-white/90">
            🇩🇪 Germany
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease }}
          className="mt-10 flex flex-col items-center gap-5"
        >
          {/* Two-piece pill CTA — label disc + arrow disc, arrow slides through on hover */}
          <a
            href="#/checkout"
            className="group inline-flex items-center"
            aria-label="ভর্তি হোন"
          >
            <span className="rounded-full bg-[#d9b75c] px-7 py-3.5 text-sm font-bold text-ink transition-colors duration-500 ease-in-out group-hover:bg-[#171410] group-hover:text-[#d9b75c] md:text-base">
              ভর্তি হোন
            </span>
            <span
              aria-hidden
              className="relative ml-2 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full bg-[#d9b75c] text-ink transition-colors duration-500 ease-in-out group-hover:bg-[#171410] group-hover:text-[#d9b75c]"
            >
              <ArrowUpRight className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
              <ArrowUpRight className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-[calc(50%+2.5rem)] -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
            </span>
          </a>

          <a
            href="#/courses"
            className="text-sm font-medium text-white/70 underline-offset-8 transition-colors hover:text-white hover:underline"
          >
            আগে কোর্স ও ফি দেখে নিন
          </a>
        </motion.div>
      </div>

      {/* Slide indicators / pagination dots */}
      <div
        aria-label="Carousel navigation"
        className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-24"
      >
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              idx === currentSlide
                ? "w-8 bg-[#d9b75c] shadow-[0_0_10px_rgba(217,183,92,0.6)]"
                : "w-2 bg-white/35 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      {/* Bottom trust bar — sits on the hairline grid, quiet numbers only */}
      <motion.dl
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.45, ease }}
        className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/25 backdrop-blur-[2px]"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-white/10">
          {heroStats.map(({ value, label }) => (
            <div key={label} className="px-2 py-4 text-center md:py-5">
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-lg font-bold leading-none text-white md:text-2xl">
                {value}
              </dd>
              <dd className="mt-1.5 text-[10px] font-medium text-white/60 md:text-xs">
                {label}
              </dd>
            </div>
          ))}
        </div>
      </motion.dl>
    </section>
  );
}
