"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, GraduationCap, MapPin, Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-data";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden scroll-mt-24">
      {/* Ambient gold glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-radial-glow blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-radial-glow blur-2xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            9+ Years of Excellence · {site.addressShort}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="font-display text-4xl font-bold leading-[1.12] sm:text-5xl lg:text-[3.4rem]"
          >
            Unlock Your Future <br />
            with <span className="text-gold-gradient italic">Sadia&apos;s IELTS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Transform your English skills to perfection — from basic grammar to
            Band 7+, with proven tricks, weekly mock tests and personal mentoring
            trusted by <span className="font-semibold text-foreground">5,983+ learners</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-gold-gradient text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.3)] hover:opacity-90"
            >
              <a href="#enroll">
                <GraduationCap className="mr-1.5 h-5 w-5" aria-hidden />
                Enroll Now
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 bg-transparent text-base font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
            >
              <a href="#courses">Explore Courses</a>
            </Button>
          </motion.div>

          {/* Mini trust row */}
          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34, ease }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-primary/10 pt-6"
          >
            {[
              { icon: TrendingUp, value: "316+", label: "Batches Done" },
              { icon: Award, value: "Band 7+", label: "Avg. Results" },
              { icon: Star, value: "4.9/5", label: "Student Rating" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <span>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-lg font-bold leading-none text-foreground">
                    {value}
                  </dd>
                  <dd className="mt-1 text-[11px] text-muted-foreground">{label}</dd>
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
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
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
              className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
            />
          </div>

          {/* Floating badge: band score */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-3 top-8 rounded-2xl border border-primary/25 bg-[#141419]/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-8"
          >
            <p className="font-display text-2xl font-bold text-gold-gradient">Band 8.0</p>
            <p className="text-[11px] text-muted-foreground">Latest Achievement 🎉</p>
          </motion.div>

          {/* Floating badge: batches */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute -right-2 bottom-10 flex items-center gap-3 rounded-2xl border border-primary/25 bg-[#141419]/95 px-4 py-3 shadow-xl backdrop-blur sm:-right-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient">
              <GraduationCap className="h-5 w-5 text-[#16120a]" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-none text-foreground">
                316+ Batches
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Completed Successfully
              </span>
            </span>
          </motion.div>

          {/* Location chip */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground backdrop-blur"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
            Sreemangal, Sylhet
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
