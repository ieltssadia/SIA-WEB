"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Clock,
  GraduationCap,
  Gift,
  MessageCircle,
  Phone,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { courseCategories, courses, site, type Course } from "@/lib/site-data";

export const courseIconMap: Record<string, React.ElementType> = {
  users: Users,
  grad: GraduationCap,
  target: Target,
  book: BookOpen,
  zap: Zap,
  gift: Gift,
};

/* Gilded Court pastel rotation — jewel panels, max 2–3 hues visible at once */
const PASTEL_PANELS = [
  { panel: "bg-pastel-green", ink: "text-[#1f5c40]", soft: "bg-white/55" },
  { panel: "bg-pastel-orange", ink: "text-[#7a4c12]", soft: "bg-white/55" },
  { panel: "bg-pastel-sky", ink: "text-[#2c4f8a]", soft: "bg-white/55" },
  { panel: "bg-pastel-butter", ink: "text-[#7a5a16]", soft: "bg-white/55" },
  { panel: "bg-pastel-ruby", ink: "text-[#7a2734]", soft: "bg-white/55" },
  { panel: "bg-pastel-amethyst", ink: "text-[#4a3372]", soft: "bg-white/55" },
] as const;

const GOLD = "text-[#d9b75c]";

function formatBDT(n: number) {
  return `৳${n.toLocaleString("en-US")}`;
}

function discountPct(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return `-${Math.round((1 - price / oldPrice) * 100)}%`;
}

function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k+` : `${n}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <Star className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden />
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

/* Batch urgency — kept as a whisper, not a block (10MS density) */
function SeatsChip({ course }: { course: Course }) {
  if (!course.seatsLeft || !course.seatsTotal) return null;
  const low = course.seatsLeft <= 5;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold ${
        low ? "text-red-600" : "text-muted-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${low ? "animate-pulse bg-red-600" : "bg-[#529b78]"}`}
        aria-hidden
      />
      {low ? `মাত্র ${course.seatsLeft} সিট বাকি!` : `${course.seatsLeft} seats left`}
    </span>
  );
}

/* 10MS price row — bold price + strike-through original + discount pill */
function PriceRow({ course, large = false }: { course: Course; large?: boolean }) {
  const discount = course.price ? discountPct(course.price, course.oldPrice) : null;
  const size = large ? "text-3xl" : "text-2xl";

  if (course.price === 0) {
    return (
      <div className="flex items-center gap-2">
        <p className={`font-display font-bold ${size} text-[#1f5c40]`}>ফ্রি</p>
        <span className="rounded-full bg-pastel-green px-2 py-0.5 text-[11px] font-bold text-[#1f5c40]">
          100% Free
        </span>
      </div>
    );
  }

  if (course.price === null) {
    return (
      <div>
        <p className={`font-display font-bold ${size} text-ink`}>
          {formatBDT(6000)}
          <span className="text-base font-semibold">+</span>
        </p>
        <p className="text-[11px] text-muted-foreground">Call for current offer</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <p className={`font-display font-bold ${size} text-ink`}>{formatBDT(course.price)}</p>
      {course.oldPrice ? (
        <p className="text-sm text-muted-foreground line-through">
          {formatBDT(course.oldPrice)}
        </p>
      ) : null}
      {discount ? (
        <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
          {discount}
        </span>
      ) : null}
    </div>
  );
}

/* Single clear CTA per card */
function EnrollCta({ course, large = false }: { course: Course; large?: boolean }) {
  const size = large ? "h-10 px-6 text-sm" : "h-8 px-4 text-xs";

  if (course.price === 0) {
    return (
      <Button
        asChild
        size="sm"
        className={`shrink-0 rounded-full bg-gold-gradient font-bold text-ink shadow-[0_8px_24px_rgba(169,127,42,0.28)] transition-opacity hover:opacity-90 ${size}`}
      >
        <a href={`#/checkout?course=${course.slug}`} aria-label={`Start ${course.title} for free`}>
          Start Free
        </a>
      </Button>
    );
  }

  if (course.price === null) {
    return (
      <Button
        asChild
        size="sm"
        className={`shrink-0 rounded-full bg-ink font-semibold text-white transition-opacity hover:opacity-85 ${size}`}
      >
        <a href={site.phoneHref} aria-label={`Call to enroll in ${course.title}`}>
          <Phone className="mr-1 h-3.5 w-3.5" aria-hidden />
          Call to Enroll
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="sm"
      className={`shrink-0 rounded-full bg-ink font-semibold text-white transition-opacity hover:opacity-85 ${size}`}
    >
      <a href={`#/checkout?course=${course.slug}`} aria-label={`Enroll in ${course.title}`}>
        Enroll
      </a>
    </Button>
  );
}

/**
 * 10MS-style course card: jewel pastel visual anchor on top, one-line title,
 * one hook line, 1–2 stats, price row + a single CTA. Body copy, feature
 * lists and batch blocks live on the course-detail page, not here.
 *
 * `variant="featured"` renders the large horizontal bento card (col-span-2).
 */
export function CourseCard({
  course,
  index,
  variant = "compact",
}: {
  course: Course;
  index: number;
  variant?: "compact" | "featured";
}) {
  const Icon = courseIconMap[course.icon] ?? BookOpen;
  const pastel = PASTEL_PANELS[index % PASTEL_PANELS.length];
  const isFeatured = variant === "featured";

  return (
    <Reveal
      delay={(index % 3) * 0.08}
      className={isFeatured ? "h-full sm:col-span-2" : "h-full"}
    >
      <Card
        className={`group h-full gap-0 overflow-hidden rounded-3xl border-border bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(30,27,20,0.10)] ${
          isFeatured ? "sm:flex-row" : ""
        }`}
      >
        {/* Jewel pastel panel — the visual anchor */}
        <div
          className={`relative shrink-0 ${pastel.panel} ${
            isFeatured
              ? "flex h-40 items-center justify-center sm:h-auto sm:min-h-[240px] sm:w-[42%]"
              : "h-24"
          }`}
        >
          {/* Decorative rings */}
          <div
            aria-hidden
            className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[10px] border-white/35"
          />
          <div
            aria-hidden
            className="absolute right-16 top-6 h-3 w-3 rounded-full bg-white/50"
          />

          <span
            className={`absolute left-4 top-4 rounded-full border border-ink/10 ${pastel.soft} px-3 py-1 text-[11px] font-bold ${pastel.ink}`}
          >
            {course.tag}
          </span>

          <span
            className={`flex items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(30,27,20,0.14)] transition-transform duration-300 group-hover:scale-110 ${pastel.ink} ${
              isFeatured ? "h-20 w-20" : "h-14 w-14"
            }`}
          >
            <Icon className={isFeatured ? "h-10 w-10" : "h-7 w-7"} aria-hidden />
          </span>

          {isFeatured ? (
            <span
              className={`absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full ${pastel.soft} px-3 py-1 text-[11px] font-semibold ${pastel.ink}`}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600"
                aria-hidden
              />
              ভর্তি চলমান
              {course.seatsLeft ? ` — মাত্র ${course.seatsLeft} সিট বাকি!` : ""}
            </span>
          ) : null}
        </div>

        <CardContent
          className={`flex flex-1 flex-col ${isFeatured ? "p-6" : "p-5"}`}
        >
          {/* Refined title — one line + one hook line */}
          <h3
            className={`font-display font-bold leading-snug text-foreground ${
              isFeatured ? "text-xl" : "truncate text-base"
            }`}
          >
            <a
              href={`#/courses/${course.slug}`}
              className="transition-colors hover:text-primary"
            >
              {course.title}
            </a>
          </h3>
          <p
            className={`mt-0.5 text-xs text-muted-foreground ${
              isFeatured ? "" : "truncate"
            }`}
          >
            {course.titleBn}
          </p>

          {/* 1–2 stats only */}
          {isFeatured ? (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <Stars rating={course.rating} />
                <span>{formatStudents(course.students)} students</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {course.lessons} lectures
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Next batch: {course.nextBatch}
              </p>
            </>
          ) : (
            <div className="mb-4 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                {course.duration}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden />
                {course.lessons} lectures
              </span>
              <SeatsChip course={course} />
            </div>
          )}

          {/* Price + single CTA, pinned to the card foot */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-border/70 pt-4">
            <div className="pt-2">
              <PriceRow course={course} large={isFeatured} />
            </div>
            <EnrollCta course={course} large={isFeatured} />
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}

/* Bento filler — free counseling tile so every grid row stays full */
function CounselingTile({ span2 }: { span2: boolean }) {
  return (
    <Reveal
      delay={0.1}
      className={`h-full sm:col-span-2 ${span2 ? "lg:col-span-2" : "lg:col-span-1"}`}
    >
      <div className="flex h-full flex-col rounded-3xl bg-ink p-6 text-white shadow-[0_24px_60px_rgba(30,27,20,0.18)]">
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.22em] ${GOLD}`}
        >
          Free Counseling
        </span>
        <h3 className="mt-3 font-display text-xl font-bold leading-snug">
          কোন কোর্সটি <span className={GOLD}>আপনার জন্য?</span>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          ৯ বছরের অভিজ্ঞতা — একটি ফ্রি কলে আপনার level ও target অনুযায়ী সঠিক কোর্সটি
          বেছে নিন।
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-gold-gradient px-4 font-bold text-ink transition-opacity hover:opacity-90"
          >
            <a href={site.phoneHref} aria-label="Call for free course counseling">
              <Phone className="mr-1 h-3.5 w-3.5" aria-hidden />
              Call Now
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-white/25 bg-transparent px-4 font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp for free course counseling"
            >
              <MessageCircle className="mr-1 h-3.5 w-3.5" aria-hidden />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * Course grid. `featured` renders the home-page variant: first 3 courses as a
 * compact row, no tabs, with a "View All Courses" button. The catalog page
 * gets the 10MS bento: 1–2 large horizontal cards + compact cards + a
 * counseling tile so no grid cell is left empty.
 */
export function CoursesSection({ featured = false }: { featured?: boolean }) {
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (featured) return courses.slice(0, 3);
    return category === "all" ? courses : courses.filter((c) => c.category === category);
  }, [category, featured]);

  /* Which positions become large horizontal bento cards (span 2 cols). */
  const featuredPositions = useMemo(() => {
    const set = new Set<number>();
    if (featured) return set;
    if (filtered.length === 3) return set; // one clean row of compact cards
    set.add(0);
    if (filtered.length >= 5) set.add(3);
    return set;
  }, [featured, filtered]);

  const totalCells = filtered.reduce(
    (cells, _, i) => cells + (featuredPositions.has(i) ? 2 : 1),
    0,
  );
  const remainder = totalCells % 3;

  return (
    <section id="courses" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {featured ? (
          <SectionHeading
            eyebrow="Our Courses"
            title={
              <>
                Our Popular <span className="text-brand-gradient">Courses</span>
              </>
            }
            subtitle="Basic English থেকে Band 7+ পর্যন্ত — প্রতিটি লেভেলের জন্য সঠিক কোর্স। ৯ বছরের অভিজ্ঞতায় তৈরি কোর্স ডিজাইন।"
          />
        ) : (
          <h2 className="sr-only">All Courses</h2>
        )}

        {/* Category tabs — 10MS style filter (full catalog only) */}
        {!featured ? (
          <Reveal className="mb-8 flex flex-wrap justify-center gap-2">
            {courseCategories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                aria-pressed={category === cat.value}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  category === cat.value
                    ? "border-ink/10 bg-ink text-white shadow-[0_4px_16px_rgba(30,27,20,0.18)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </Reveal>
        ) : null}

        <div className="grid grid-flow-row-dense gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filtered.map((course, i) => (
            <CourseCard
              key={course.slug}
              course={course}
              index={i}
              variant={featuredPositions.has(i) ? "featured" : "compact"}
            />
          ))}

          {!featured && remainder !== 0 ? (
            <CounselingTile span2={remainder === 1} />
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No courses in this category yet — please check other tabs or call {site.phone}.
          </p>
        ) : null}

        {featured ? (
          <Reveal delay={0.15} className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 text-base font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
            >
              <a href="#/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </a>
            </Button>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
