"use client";

import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  GraduationCap,
  MonitorSmartphone,
  MessageCircle,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { CourseCard, courseIconMap } from "@/components/site/courses-section";
import { CourseRoutineTable } from "@/components/site/weekly-routine";
import { courses, site, type Course } from "@/lib/site-data";
import { useEnrollStore } from "@/lib/enroll-store";

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

function CourseNotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Oops"
        title={
          <>
            Course <span className="text-gold-gradient">Not Found</span>
          </>
        }
        subtitle="The course you are looking for doesn't exist or has been renamed."
        crumbs={[{ label: "Courses", href: "/courses" }]}
      />
      <section className="py-20 text-center">
        <Button asChild className="bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90">
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
  const setCourse = useEnrollStore((s) => s.setCourse);
  const course = courses.find((c) => c.slug === slug);

  if (!course) return <CourseNotFound />;

  const Icon = courseIconMap[course.icon] ?? BookOpen;
  const discount = course.price ? discountPct(course.price, course.oldPrice) : null;

  const sameCategory = courses.filter(
    (c) => c.slug !== course.slug && c.category === course.category
  );
  const related: Course[] = (sameCategory.length
    ? sameCategory
    : courses.filter((c) => c.slug !== course.slug)
  ).slice(0, 3);

  const onEnrollClick = () => {
    setCourse(course.price === null || course.price === 0 ? "not-sure" : course.slug);
  };

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

              {/* Weekly class routine */}
              <Reveal delay={0.11}>
                <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
                  Weekly Class Routine
                </h2>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {course.scheduleNote} · সব সময় বাংলাদেশ সময় (GMT+6)
                </p>
                <div className="mt-4">
                  <CourseRoutineTable courseSlug={course.slug} />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Full weekly schedule (all batches &amp; free live classes):{" "}
                  <a
                    href="#/routine"
                    className="font-semibold text-primary transition-colors hover:underline"
                  >
                    View the complete class routine →
                  </a>
                </p>
              </Reveal>

              {/* Instructor mini */}
              <Reveal delay={0.12}>
                <Card className="mt-10 border-primary/20 bg-gradient-to-br from-[#1d1808] via-[#141419] to-[#141419]">
                  <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient">
                      <GraduationCap className="h-7 w-7 text-[#16120a]" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold text-foreground">
                        Taught by Sadia Rahman
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Certified IELTS trainer · 9+ years · 5,983+ students mentored
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="shrink-0 border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                    >
                      <a href="#/about">
                        About Sadia
                        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* Sticky enroll card */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal delay={0.1}>
                <Card className="overflow-hidden border-primary/25 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                  {/* Gradient header */}
                  <div className="relative bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-[#141419]/80">
                        <Icon className="h-7 w-7 text-primary" aria-hidden />
                      </span>
                      <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
                        {course.tag}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      {course.price === 0 ? (
                        <p className="font-display text-3xl font-bold text-gold-gradient">
                          100% Free
                        </p>
                      ) : course.price === null ? (
                        <>
                          <p className="font-display text-2xl font-bold text-foreground">
                            {formatBDT(6000)}+
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Call for the current admission offer
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <p className="font-display text-3xl font-bold text-gold-gradient">
                              {formatBDT(course.price)}
                            </p>
                            {course.oldPrice ? (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatBDT(course.oldPrice)}
                              </p>
                            ) : null}
                          </div>
                          {discount ? (
                            <p className="mt-1 text-xs font-semibold text-emerald-400">
                              {discount} admission offer — limited seats
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>

                  <CardContent className="space-y-4 p-6">
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
                    </div>

                    {/* CTAs */}
                    {course.price === null ? (
                      <Button
                        asChild
                        className="w-full bg-gold-gradient py-6 text-base font-semibold text-[#16120a] hover:opacity-90"
                      >
                        <a href={site.phoneHref}>
                          <Phone className="mr-2 h-5 w-5" aria-hidden />
                          Call to Enroll
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-gold-gradient py-6 text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90"
                      >
                        <a href="#/contact" onClick={onEnrollClick}>
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
                Related <span className="text-gold-gradient">Courses</span>
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
