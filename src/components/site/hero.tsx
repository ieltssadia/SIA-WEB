"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, GraduationCap, MapPin, Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-data";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

/* Playful lime squiggle — LabAcademy-style decorative accent */
function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 160"
      fill="none"
      className={className}
    >
      <path
        d="M12 148C48 118 20 74 58 44c30-24 70-8 88 16 16 22 2 52 24 70 26 21 38-16 38-16"
        stroke="#d9b75c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="204" cy="24" r="5" fill="#d9b75c" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden scroll-mt-24">
      {/* Ambient sage glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-radial-glow blur-2xl"
      />
      {/* Decorative squiggle */}
      <Squiggle className="pointer-events-none absolute -top-4 right-4 hidden h-40 w-56 opacity-90 lg:block" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground/80 shadow-[0_2px_10px_rgba(30,27,20,0.05)]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pastel-green" aria-hidden>
              <Sparkles className="h-3 w-3 text-[#1f5c40]" />
            </span>
            9+ Years of Excellence · {site.addressShort}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.1rem]"
          >
            Unlock Your Future <br />
            with <span className="text-brand-gradient">Sadia&apos;s IELTS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground"
          >
            From basic grammar to Band 7+ — proven tricks, weekly mock tests and
            personal mentoring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-ink text-base font-semibold text-white shadow-[0_10px_30px_rgba(30,27,20,0.22)] transition-all hover:opacity-85"
            >
              <a href="#/checkout">
                <GraduationCap className="mr-1.5 h-5 w-5" aria-hidden />
                Enroll Now
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-border bg-card text-base font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <a href="#/courses">Explore Courses</a>
            </Button>
          </motion.div>

          {/* Mini trust row — pastel chips, LabAcademy rhythm */}
          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34, ease }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-border/80 pt-7"
          >
            {[
              { icon: TrendingUp, value: "316+", label: "Batches Done", chip: "bg-pastel-green text-[#1f5c40]" },
              { icon: Award, value: "7+", label: "Avg. Band Score", chip: "bg-pastel-orange text-[#7a4c12]" },
              { icon: Star, value: "4.9/5", label: "Student Rating", chip: "bg-pastel-sky text-[#2c4f8a]" },
            ].map(({ icon: Icon, value, label, chip }) => (
              <div
                key={label}
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card px-3 py-2.5 shadow-[0_2px_10px_rgba(30,27,20,0.04)] sm:flex-row sm:items-center sm:gap-2.5"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${chip}`} aria-hidden>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="w-full min-w-0">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-base font-bold leading-none text-foreground">
                    {value}
                  </dd>
                  <dd className="mt-1 truncate text-[11px] text-muted-foreground">{label}</dd>
                </span>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-border shadow-[0_30px_80px_rgba(30,27,20,0.18)]">
            <Image
              src="/images/hero-student.png"
              alt="Successful IELTS student celebrating her achievement"
              width={864}
              height={1152}
              className="h-auto w-full object-cover"
              priority
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent"
            />
          </div>

          {/* Floating badge: band score — white glass card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-3 top-8 rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-[0_16px_40px_rgba(30,27,20,0.14)] backdrop-blur sm:-left-8"
          >
            <p className="font-display text-2xl font-bold text-brand-gradient">Band 8.0</p>
            <p className="text-[11px] text-muted-foreground">Latest Result 🎉</p>
          </motion.div>

          {/* Floating badge: batches */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute -right-2 bottom-10 flex items-center gap-3 rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-[0_16px_40px_rgba(30,27,20,0.14)] backdrop-blur sm:-right-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel-green">
              <GraduationCap className="h-5 w-5 text-[#1f5c40]" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-none text-foreground">
                316+ Batches
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Completed
              </span>
            </span>
          </motion.div>

          {/* Location chip */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur"
          >
            <MapPin className="h-3.5 w-3.5 text-[#d9b75c]" aria-hidden />
            Sreemangal, Sylhet
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
