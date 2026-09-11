"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  GraduationCap,
  Gift,
  Layers,
  ListChecks,
  MonitorSmartphone,
  Phone,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import {
  courseCategories,
  courses,
  site,
  type Course,
} from "@/lib/site-data";
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

/** Course detail modal — 10MS course-page style with syllabus list. */
function CourseDetailsDialog({
  course,
  open,
  onOpenChange,
}: {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setCourse = useEnrollStore((s) => s.setCourse);
  if (!course) return null;
  const Icon = iconMap[course.icon] ?? BookOpen;
  const discount = course.price ? discountPct(course.price, course.oldPrice) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[85vh] max-w-lg overflow-y-auto border-primary/25 bg-[#141419] p-0 sm:max-w-xl"
      >
        <DialogHeader className="space-y-0 rounded-t-lg bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-6 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-[#141419]/80">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
              </span>
              <div>
                <DialogTitle className="font-display text-lg font-bold leading-snug text-foreground">
                  {course.title}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  {course.titleBn}
                </DialogDescription>
              </div>
            </div>
            <Badge className="shrink-0 border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
              {course.tag}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <Stars rating={course.rating} />
            <span>{formatStudents(course.students)} students enrolled</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden />
              {course.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
              {course.duration}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{course.desc}</p>

          {/* Key facts */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
              <CalendarClock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Next batch</p>
                <p className="truncate text-sm font-medium text-foreground">{course.nextBatch}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
              <MonitorSmartphone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Class mode</p>
                <p className="truncate text-sm font-medium text-foreground">{course.mode}</p>
              </div>
            </div>
          </div>

          {/* What you get */}
          <div>
            <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-foreground">
              <Check className="h-4 w-4 text-primary" aria-hidden />
              What you get
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {course.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Syllabus */}
          <div>
            <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-foreground">
              <ListChecks className="h-4 w-4 text-primary" aria-hidden />
              Course outline
            </h4>
            <ol className="mt-3 space-y-2">
              {course.syllabus.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <Separator className="bg-primary/10" />

          {/* Price + enroll */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {course.price === 0 ? (
                <p className="font-display text-2xl font-bold text-gold-gradient">100% Free</p>
              ) : course.price === null ? (
                <p className="font-display text-xl font-bold text-foreground">
                  {formatBDT(6000)}+{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    — call for current offer
                  </span>
                </p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-2xl font-bold text-gold-gradient">
                    {formatBDT(course.price)}
                  </p>
                  {course.oldPrice ? (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatBDT(course.oldPrice)}
                    </p>
                  ) : null}
                  {discount ? (
                    <span className="text-xs font-semibold text-emerald-400">{discount}</span>
                  ) : null}
                </div>
              )}
            </div>
            <Button
              asChild
              className="bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90"
            >
              {course.price === null ? (
                <a href={site.phoneHref} onClick={() => onOpenChange(false)}>
                  <Phone className="mr-1.5 h-4 w-4" aria-hidden />
                  Call to Enroll
                </a>
              ) : (
                <a
                  href="#enroll"
                  onClick={() => {
                    setCourse(course.slug);
                    onOpenChange(false);
                  }}
                >
                  <GraduationCap className="mr-1.5 h-4 w-4" aria-hidden />
                  Enroll Now
                </a>
              )}
            </Button>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" aria-hidden />
            Questions? Call{" "}
            <a href={site.phoneHref} className="font-medium text-primary hover:underline">
              {site.phone}
            </a>{" "}
            or message us on{" "}
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Facebook
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CourseCard({ course, index, onDetails }: { course: Course; index: number; onDetails: (c: Course) => void }) {
  const Icon = iconMap[course.icon] ?? BookOpen;
  const setCourse = useEnrollStore((s) => s.setCourse);
  const discount = course.price ? discountPct(course.price, course.oldPrice) : null;

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

          {/* Social proof — 10MS style rating + enrolled */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Stars rating={course.rating} />
            <span>{formatStudents(course.students)} students</span>
          </div>

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
            <span className="flex items-center gap-1.5">
              <MonitorSmartphone className="h-3.5 w-3.5 text-primary" aria-hidden />
              {course.mode}
            </span>
          </div>

          {/* Next batch */}
          <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            Next batch: {course.nextBatch}
          </p>

          {/* Features */}
          <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {course.features.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                {f}
              </li>
            ))}
          </ul>

          {/* Details link */}
          <button
            type="button"
            onClick={() => onDetails(course)}
            className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
          >
            <ListChecks className="h-3.5 w-3.5" aria-hidden />
            View course details & syllabus
          </button>

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
                <a href="#enroll" onClick={onEnrollClick}>
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
  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(
    () => (category === "all" ? courses : courses.filter((c) => c.category === category)),
    [category]
  );

  function openDetails(course: Course) {
    setSelected(course);
    setDialogOpen(true);
  }

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

        {/* Category tabs — 10MS style filter */}
        <Reveal className="mb-8 flex flex-wrap justify-center gap-2">
          {courseCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              aria-pressed={category === cat.value}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                category === cat.value
                  ? "border-primary/60 bg-gold-gradient text-[#16120a] shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => (
            <CourseCard key={course.slug} course={course} index={i} onDetails={openDetails} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No courses in this category yet — please check other tabs or call {site.phone}.
          </p>
        ) : null}
      </div>

      <CourseDetailsDialog course={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}
