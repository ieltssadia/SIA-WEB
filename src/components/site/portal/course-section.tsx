"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Headphones,
  Layers,
  Mic,
  PenLine,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/site/reveal";
import { courses, portalMaterials, site } from "@/lib/site-data";
import type { PortalEnrollment } from "@/lib/portal-store";

const materialIcons: Record<string, LucideIcon> = {
  "file-text": FileText,
  headphones: Headphones,
  "book-open": BookOpen,
  pen: PenLine,
  mic: Mic,
  "clipboard-check": ClipboardCheck,
};

/** One enrolled course card — hero, progress, outline and materials. */
function EnrolledCourseCard({ enrollment }: { enrollment: PortalEnrollment }) {
  const course = courses.find((c) => c.slug === enrollment.courseSlug);
  const syllabus = course?.syllabus ?? [];
  const doneCount = Math.min(
    Math.floor((enrollment.progress / 100) * syllabus.length),
    syllabus.length
  );
  const lessonsDone = course ? Math.round((enrollment.progress / 100) * course.lessons) : 0;

  return (
    <div className="space-y-6" id={`course-${enrollment.id}`}>
      {/* Course hero */}
      <Reveal y={12}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#114430] via-[#0B2E22] to-[#0C2E23] p-6 md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-radial-glow blur-2xl"
          />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient">
                  <GraduationCap className="h-6 w-6 text-white" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#63D6A4]">My Course</p>
                  <h1 className="mt-1 font-display text-xl font-bold leading-tight text-[#EAF4EE] md:text-2xl">
                    {course?.title ?? enrollment.courseSlug}
                  </h1>
                  <p className="mt-1 text-sm text-[#A9C6B6]">
                    {course?.titleBn ?? "আপনার ভর্তি হওয়া কোর্স"}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-transparent font-medium text-[#EAF4EE] hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <a href={`#/courses/${enrollment.courseSlug}`}>
                  Course details
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/10 font-medium text-[#BFE6D4]">
                {enrollment.batch}
              </Badge>
              {course ? (
                <>
                  <Badge variant="outline" className="border-white/10 bg-white/10 text-[#BFE6D4]">
                    <Layers className="mr-1 h-3 w-3" aria-hidden />
                    {course.lessons} lessons
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/10 text-[#BFE6D4]">
                    <Clock className="mr-1 h-3 w-3" aria-hidden />
                    {course.duration}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/10 text-[#BFE6D4]">
                    {course.mode}
                  </Badge>
                </>
              ) : null}
            </div>

            {course ? (
              <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs font-medium text-[#BFE6D4]">
                <CalendarDays className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                {course.scheduleNote}
              </p>
            ) : null}

            {/* Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#EAF4EE]">Course progress</span>
                <span className="font-display font-bold text-[#63D6A4]">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="mt-2 h-2.5 bg-white/10 [&>div]:bg-[#63D6A4]" />
              <p className="mt-2 text-xs text-[#A9C6B6]">
                {lessonsDone} of {course?.lessons ?? "—"} lessons completed · keep going!
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Syllabus checklist */}
        <Reveal y={12} delay={0.04}>
          <div className="h-full rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Course Outline</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Progress bar-এর সাথে সিলেবাস অটো-আপডেট হয়।
            </p>
            <ol className="mt-4 space-y-2.5">
              {syllabus.map((item, i) => {
                const done = i < doneCount;
                const current = i === doneCount;
                return (
                  <li
                    key={item}
                    className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm ${
                      current
                        ? "border-primary/40 bg-primary/[0.07] font-medium text-foreground"
                        : done
                          ? "border-border/60 bg-muted/50 text-muted-foreground"
                          : "border-border/40 bg-transparent text-muted-foreground/50"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-brand-gradient text-white"
                          : current
                            ? "border border-primary text-primary"
                            : "border border-border text-muted-foreground"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={done ? "line-through decoration-primary/40" : undefined}>{item}</span>
                    {current ? (
                      <Badge className="ml-auto shrink-0 bg-brand-gradient text-[10px] font-bold text-white hover:bg-brand-gradient">
                        Up next
                      </Badge>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>

        {/* Materials library */}
        <Reveal y={12} delay={0.08}>
          <div className="h-full rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Study Materials</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              ক্লিক করলে WhatsApp গ্রুপে রিকোয়েস্ট যাবে — ফাইল সেখানে শেয়ার করা হয়।
            </p>
            <div className="mt-4 space-y-2.5">
              {portalMaterials.map(({ icon, label, meta }) => {
                const Icon = materialIcons[icon] ?? FileText;
                const waText = encodeURIComponent(
                  `Assalamu Alaikum! I need the "${label}" material (${enrollment.batch}).`
                );
                return (
                  <a
                    key={label}
                    href={`${site.whatsapp.split("?")[0]}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{label}</span>
                      <span className="block text-xs text-muted-foreground">{meta}</span>
                    </span>
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/** All of the student's enrolled courses — content only for what they paid for. */
export function CourseSection({ enrollments }: { enrollments: PortalEnrollment[] }) {
  return (
    <div className="space-y-6">
      {/* Quick jump between enrolled courses (multi-enrollment accounts) */}
      {enrollments.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            My Courses ({enrollments.length})
          </p>
          {enrollments.map((e) => {
            const c = courses.find((x) => x.slug === e.courseSlug);
            return (
              <a
                key={e.id}
                href={`#course-${e.id}`}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {c?.title ?? e.courseSlug} · {e.batch}
              </a>
            );
          })}
        </div>
      ) : null}

      {enrollments.map((e) => (
        <EnrolledCourseCard key={e.id} enrollment={e} />
      ))}

      {/* Enroll in another course — 10MS "add course" card */}
      <a
        href="#/checkout"
        className="flex items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-muted/50 p-6 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 text-primary">
          <Plus className="h-4 w-4" aria-hidden />
        </span>
        Enroll in another course — নতুন কোর্স যোগ করুন
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
