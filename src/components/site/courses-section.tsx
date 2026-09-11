"use client";

import {
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Gift,
  Phone,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { courses, site, type Course } from "@/lib/site-data";
import { useEnrollStore } from "@/lib/enroll-store";

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  grad: GraduationCap,
  target: Target,
  book: BookOpen,
  zap: Zap,
  gift: Gift,
};

function formatBDT(n: number) {
  return `৳${n.toLocaleString("en-US")}`;
}

function discountPct(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return `-${Math.round((1 - price / oldPrice) * 100)}%`;
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon = iconMap[course.icon] ?? BookOpen;
  const setCourse = useEnrollStore((s) => s.setCourse);
  const discount = course.price ? discountPct(course.price, course.oldPrice) : null;

  const enrollHref = "#enroll";
  const onEnrollClick = () => {
    setCourse(course.price === null || course.price === 0 ? "not-sure" : course.slug);
  };

  return (
    <Reveal delay={(index % 3) * 0.08} className="h-full">
      <Card className="group flex h-full flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)]">
        {/* Decorative header */}
        <div className="relative h-24 shrink-0 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419]">
          <div
            aria-hidden
            className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-xl transition-opacity group-hover:opacity-100"
          />
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
              {course.tag}
            </Badge>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-[#141419]/80 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-7 w-7 text-primary" aria-hidden />
            </span>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-6 pt-5">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground">
            {course.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{course.titleBn}</p>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {course.desc}
          </p>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden />
              {course.lessons} Lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
              {course.duration}
            </span>
          </div>

          {/* Features */}
          <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {course.features.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                {f}
              </li>
            ))}
          </ul>

          {/* Price + CTA */}
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-5 [margin-top:auto]">
            <div className="pt-4">
              {course.price === 0 ? (
                <p className="font-display text-2xl font-bold text-gold-gradient">Free</p>
              ) : course.price === null ? (
                <>
                  <p className="font-display text-xl font-bold text-foreground">
                    {formatBDT(6000)}
                    <span className="text-sm">+</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">Call for current offer</p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-2xl font-bold text-gold-gradient">
                      {formatBDT(course.price)}
                    </p>
                    {course.oldPrice ? (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatBDT(course.oldPrice)}
                      </p>
                    ) : null}
                  </div>
                  {discount ? (
                    <p className="text-[11px] font-semibold text-emerald-400">
                      {discount} admission offer
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <Button
              asChild
              size="sm"
              className="mt-4 shrink-0 bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90"
            >
              {course.price === null ? (
                <a href={site.phoneHref} aria-label={`Call to enroll in ${course.title}`}>
                  <Phone className="mr-1 h-3.5 w-3.5" aria-hidden />
                  Call to Enroll
                </a>
              ) : (
                <a href={enrollHref} onClick={onEnrollClick}>
                  Enroll
                </a>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}

export function CoursesSection() {
  return (
    <section id="courses" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Our Courses"
          title={
            <>
              Choose the Course That <span className="text-gold-gradient">Fits You Best</span>
            </>
          }
          subtitle="Basic English থেকে Band 7+ পর্যন্ত — প্রতিটি লেভেলের জন্য সঠিক কোর্স। ৯ বছরের অভিজ্ঞতায় তৈরি কোর্স ডিজাইন।"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard key={course.slug} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
