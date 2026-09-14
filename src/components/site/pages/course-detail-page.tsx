"use client";

import {
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  CalendarClock,
  Check,
  ClipboardCheck,
  Clock,
  FileText,
  Gift,
  GraduationCap,
  Infinity as InfinityIcon,
  Mic,
  MonitorSmartphone,
  MessageCircle,
  Phone,
  Star,
  Timer,
  Users,
  Video,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { CourseCard, courseIconMap } from "@/components/site/courses-section";
import { CourseRoutineTable } from "@/components/site/weekly-routine";
import { LockedRoutineCard } from "@/components/site/locked-routine";
import { courses, faqs, stories, upcomingBatches, site, type Course } from "@/lib/site-data";
import { compactCountdown, useOfferCountdown } from "@/lib/offer";
import { usePortalStore } from "@/lib/portal-store";

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

/** 10MS course-page FAQ — payment question first, then the global FAQs. */
const paymentFaq = {
  q: "ভর্তি ও পেমেন্ট কীভাবে করব?",
  a: "এই পেজের Enroll Now বাটনে ক্লিক করে account খুলে bKash/Nagad/Rocket/Cash — যেকোনো মাধ্যমে পেমেন্ট করা যায়। অথবা সরাসরি কল করুন +880 1752-716238।",
};

const courseFaqs = [paymentFaq, ...faqs];

/** 10MS "এই কোর্সে যা যা থাকছে" stat-grid items derived from course data. */
function courseIncludes(course: Course): {
  icon: React.ElementType;
  label: string;
  sub: string;
}[] {
  const isFree = course.price === 0;
  return [
    {
      icon: Video,
      label: isFree ? `${course.lessons} Video Lessons` : `${course.lessons} Live Classes`,
      sub: isFree ? "Self-paced" : "Zoom + campus hybrid",
    },
    { icon: FileText, label: `${course.lessons} Lecture Sheets`, sub: "PDF — বাংলা ব্যাখ্যাসহ" },
    { icon: ClipboardCheck, label: "Weekly Full Mock", sub: "Band report সহ" },
    { icon: BookOpen, label: "Study Materials", sub: "Templates & practice packs" },
    course.category === "complete"
      ? { icon: Gift, label: "Free Hardcopy Book", sub: "Premium course bonus" }
      : { icon: Mic, label: "Speaking Club", sub: "Every Saturday" },
    { icon: Award, label: "Completion Certificate", sub: "Verifiable on our site" },
  ];
}

/** Hydration-safe evergreen offer countdown (10MS signature). */
function OfferCountdownRow() {
  const countdown = useOfferCountdown();
  if (!countdown.ready) return null;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-semibold text-[#63D6A4]">
      <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>অফার শেষ হতে বাকি: {compactCountdown(countdown)}</span>
      <span className="font-normal text-[#7FA091]">· offer ends {countdown.endsOn}</span>
    </p>
  );
}

/** 5-star row used on course-page reviews. */
function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/40"
          }`}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** Routine table for students enrolled in THIS course; a locked teaser otherwise. */
function CourseRoutineGate({ courseSlug }: { courseSlug: string }) {
  const user = usePortalStore((s) => s.user);
  const enrollments = usePortalStore((s) => s.enrollments);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);

  const enrolledHere = hasHydrated && !!user && enrollments.some((e) => e.courseSlug === courseSlug);

  if (enrolledHere) {
    return (
      <div>
        <CourseRoutineTable courseSlug={courseSlug} />
        <p className="mt-4 text-xs text-muted-foreground">
          Zoom লিংক ও নোটিশ পেতে আপনার{" "}
          <a href="#/portal" className="font-semibold text-primary hover:underline">
            Student Portal
          </a>{" "}
          ভিজিট করুন বা batch WhatsApp গ্রুপে থাকুন।
        </p>
      </div>
    );
  }

  return (
    <LockedRoutineCard
      title={
        hasHydrated && user
          ? "You are not enrolled in this course"
          : "Routine is for enrolled students"
      }
      desc={
        hasHydrated && user
          ? "আপনার account-এ এই কোর্সের enrollment নেই — ভর্তি হলেই এখানে পুরো দিন-ভিত্তিক রুটিন (টপিক, সময় ও Zoom লিংক) দেখা যাবে।"
          : "এই কোর্সের দিন-ভিত্তিক পুরো রুটিন (প্রতিটি ক্লাসের টপিক, সময় ও Zoom লিংক) Student Portal-এ দেখা যায় — ভর্তির সময় দেওয়া মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগ ইন করুন।"
      }
    />
  );
}

function CourseNotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Oops"
        title={
          <>
            Course <span className="text-brand-gradient">Not Found</span>
          </>
        }
        subtitle="The course you are looking for doesn't exist or has been renamed."
        crumbs={[{ label: "Courses", href: "/courses" }]}
      />
      <section className="py-20 text-center">
        <Button asChild className="rounded-full bg-ink font-semibold text-white hover:opacity-85">
          <a href="#/courses">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Browse All Courses
          </a>
        </Button>
      </section>
    </>
  );
}

export function CourseDetailPage({ slug }: { slug: string }) {
  const course = courses.find((c) => c.slug === slug);

  if (!course) return <CourseNotFound />;

  const Icon = courseIconMap[course.icon] ?? BookOpen;
  const discount = course.price ? discountPct(course.price, course.oldPrice) : null;

  const batchLabel =
    upcomingBatches.find((b) => b.courseSlug === course.slug)?.batch ?? "This batch";
  const includes = courseIncludes(course);

  // 10MS course-page reviews: this course's stories first, padded from other
  // courses when there are fewer than 2.
  const ownStories = stories.filter((s) => s.course === course.title);
  const reviews = (
    ownStories.length >= 2
      ? ownStories
      : [...ownStories, ...stories.filter((s) => s.course !== course.title)]
  ).slice(0, 3);

  const sameCategory = courses.filter(
    (c) => c.slug !== course.slug && c.category === course.category
  );
  const related: Course[] = (sameCategory.length
    ? sameCategory
    : courses.filter((c) => c.slug !== course.slug)
  ).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={course.tag}
        title={course.title}
        subtitle={course.desc}
        crumbs={[{ label: "Courses", href: "/courses" }, { label: course.title }]}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Main content */}
            <div className="min-w-0">
              {/* Meta strip */}
              <Reveal y={12}>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                    <span className="font-semibold text-foreground">
                      {course.rating.toFixed(1)}
                    </span>
                    rating
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" aria-hidden />
                    {formatStudents(course.students)} students enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                    {course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" aria-hidden />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MonitorSmartphone className="h-4 w-4 text-primary" aria-hidden />
                    {course.mode}
                  </span>
                </div>
              </Reveal>

              {/* About */}
              <Reveal delay={0.05}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  About This Course
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{course.desc}</p>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {course.titleBn} — ৯ বছরের অভিজ্ঞতায় তৈরি structured curriculum, নিয়মিত
                  mock test আর personal feedback-এর সাথে আপনার টার্গেট ব্যান্ড স্কোর এখন হাতের
                  নাগালে।
                </p>
              </Reveal>

              {/* এই কোর্সে যা যা থাকছে — 10MS what's-inside stat grid */}
              <Reveal delay={0.06}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  এই কোর্সে যা যা থাকছে
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {includes.map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* What you get */}
              <Reveal delay={0.08}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  What You Get
                </h2>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {course.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground/85"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Syllabus */}
              <Reveal delay={0.1}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  Course Outline
                </h2>
                <ol className="mt-4 space-y-3">
                  {course.syllabus.map((s, i) => (
                    <li
                      key={s}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/85">{s}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>

              {/* Weekly class routine — members only */}
              <Reveal delay={0.11}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  Weekly Class Routine
                </h2>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {course.scheduleNote} · সব সময় বাংলাদেশ সময় (GMT+6)
                </p>
                <div className="mt-4">
                  <CourseRoutineGate courseSlug={course.slug} />
                </div>
              </Reveal>

              {/* Student reviews — 10MS social proof */}
              <Reveal delay={0.115}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  What Our Students Say
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  রিয়েল স্টুডেন্টস, রিয়েল রেজাল্ট — সরাসরি আমাদের রেজাল্ট পোস্ট থেকে।
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {reviews.map((r) => (
                    <figure
                      key={r.name}
                      className="flex flex-col rounded-xl border border-border bg-card p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <ReviewStars rating={4.9} />
                        <span className="shrink-0 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                          {r.band}
                        </span>
                      </div>
                      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">
                        “{r.quote}”
                      </blockquote>
                      <figcaption className="mt-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{r.name}</span> · {r.date}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </Reveal>

              {/* Instructor mini */}
              <Reveal delay={0.12}>
                <Card className="mt-10 border-white/10 bg-gradient-to-br from-[#0B2E22] via-[#0C2E23] to-[#0C2E23]">
                  <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient">
                      <GraduationCap className="h-7 w-7 text-white" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold text-[#EAF4EE]">
                        Taught by Sadia Rahman
                      </p>
                      <p className="text-sm text-[#A9C6B6]">
                        Certified IELTS trainer · 9+ years · 5,983+ students mentored
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="shrink-0 border-white/20 bg-transparent text-[#EAF4EE] hover:border-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <a href="#/about">
                        About Sadia
                        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>

              {/* FAQs — 10MS course-page FAQ */}
              <Reveal delay={0.13}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="mt-4 space-y-3">
                  {courseFaqs.map((faq, i) => (
                    <AccordionItem
                      key={faq.q}
                      value={`course-faq-${i}`}
                      className="rounded-2xl border border-border bg-card px-5 transition-colors data-[state=open]:border-primary/40"
                    >
                      <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:text-primary hover:no-underline [&[data-state=open]>svg]:text-primary">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            </div>

            {/* Sticky enroll card */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal delay={0.1}>
                <Card className="overflow-hidden border-primary/25 shadow-[0_20px_60px_rgba(16,22,19,0.18)]">
                  {/* Gradient header */}
                  <div className="relative bg-gradient-to-br from-[#114430] via-[#0B2E22] to-[#0C2E23] p-6">
                    {/* 10MS live enrollment status */}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-[#BFE6D4]">
                      <span
                        className="h-2 w-2 animate-pulse rounded-full bg-[#63D6A4]"
                        aria-hidden
                      />
                      ভর্তি চলমান
                    </span>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                        <Icon className="h-7 w-7 text-[#63D6A4]" aria-hidden />
                      </span>
                      <Badge className="border-white/10 bg-white/10 text-[#BFE6D4] hover:bg-white/10">
                        {course.tag}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      {course.price === 0 ? (
                        <p className="font-display text-3xl font-bold text-[#63D6A4]">
                          100% Free
                        </p>
                      ) : course.price === null ? (
                        <>
                          <p className="font-display text-2xl font-bold text-[#EAF4EE]">
                            {formatBDT(6000)}+
                          </p>
                          <p className="mt-1 text-xs text-[#A9C6B6]">
                            Call for the current admission offer
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <p className="font-display text-3xl font-bold text-[#63D6A4]">
                              {formatBDT(course.price)}
                            </p>
                            {course.oldPrice ? (
                              <p className="text-sm text-[#7FA091] line-through">
                                {formatBDT(course.oldPrice)}
                              </p>
                            ) : null}
                          </div>
                          {discount ? (
                            <p className="mt-1 text-xs font-semibold text-[#63D6A4]">
                              {discount} admission offer — limited seats
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                    {course.price && course.oldPrice ? <OfferCountdownRow /> : null}
                  </div>

                  <CardContent className="space-y-4 p-6">
                    {/* 10MS batch seats urgency */}
                    {course.seatsLeft && course.seatsTotal ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
                          <span className="font-medium text-foreground">
                            {batchLabel} — {course.seatsLeft}/{course.seatsTotal} seats left
                          </span>
                          {course.seatsLeft <= 5 ? (
                            <span className="font-semibold text-destructive">
                              মাত্র {course.seatsLeft} সিট বাকি!
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/15">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.round(
                                ((course.seatsTotal - course.seatsLeft) / course.seatsTotal) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* Facts */}
                    <div className="space-y-2.5 text-sm">
                      <p className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                          Next batch
                        </span>
                        <span className="font-medium text-foreground">{course.nextBatch}</span>
                      </p>
                      <Separator className="bg-primary/10" />
                      <p className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <MonitorSmartphone className="h-4 w-4 text-primary" aria-hidden />
                          Class mode
                        </span>
                        <span className="font-medium text-foreground">{course.mode}</span>
                      </p>
                      <Separator className="bg-primary/10" />
                      <p className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" aria-hidden />
                          Duration
                        </span>
                        <span className="font-medium text-foreground">{course.duration}</span>
                      </p>
                      {course.accessPeriod ? (
                        <>
                          <Separator className="bg-primary/10" />
                          <p className="flex items-start justify-between gap-3">
                            <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                              <InfinityIcon className="h-4 w-4 text-primary" aria-hidden />
                              Course access
                            </span>
                            <span className="text-right font-medium text-foreground">
                              {course.accessPeriod}
                            </span>
                          </p>
                        </>
                      ) : null}
                    </div>

                    {/* CTAs */}
                    {course.price === null ? (
                      <Button
                        asChild
                        className="w-full rounded-full bg-ink py-6 text-base font-semibold text-white shadow-[0_8px_30px_rgba(16,22,19,0.18)] hover:opacity-85"
                      >
                        <a href={site.phoneHref}>
                          <Phone className="mr-2 h-5 w-5" aria-hidden />
                          Call to Enroll
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full rounded-full bg-ink py-6 text-base font-semibold text-white shadow-[0_8px_30px_rgba(16,22,19,0.18)] hover:opacity-85"
                      >
                        <a href={`#/checkout?course=${course.slug}`}>
                          <GraduationCap className="mr-2 h-5 w-5" aria-hidden />
                          Enroll Now
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                    >
                      <a
                        href={site.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ask about this course on WhatsApp — opens in a new tab"
                      >
                        <MessageCircle className="mr-2 h-4.5 w-4.5" aria-hidden />
                        Ask on WhatsApp
                      </a>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Questions? Call{" "}
                      <a
                        href={site.phoneHref}
                        className="font-medium text-primary hover:underline"
                      >
                        {site.phone}
                      </a>
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Related courses */}
      <section className="border-t border-primary/10 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Keep Exploring"
            title={
              <>
                Related <span className="text-brand-gradient">Courses</span>
              </>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c, i) => (
              <CourseCard key={c.slug} course={c} index={i} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button
              asChild
              variant="outline"
              className="border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
            >
              <a href="#/courses">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Back to All Courses
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
