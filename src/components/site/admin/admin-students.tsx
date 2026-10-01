"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminStudentDetail, AdminStudentRow } from "@/lib/admin-types";
import {
  EmptyState,
  ENROLLMENT_STATUS_TONE,
  ErrorState,
  SectionHeading,
  ToneBadge,
  formatDate,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";
import { courses } from "@/lib/site-data";

const courseTitle = (slug: string) =>
  courses.find((c) => c.slug === slug)?.title ?? slug;

/**
 * Admin Students — portal accounts with enrollment counts; offline/direct
 * enrollment creation modal and student detail sheet with course assignment.
 */
export function AdminStudents() {
  const token = useAdminStore((s) => s.token);

  const [students, setStudents] = useState<AdminStudentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Direct / Offline Enrollment Dialog State
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [prefilledStudent, setPrefilledStudent] = useState<{
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; students?: AdminStudentRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.students) setStudents(data.students);
      else setError(data?.error ?? "শিক্ষার্থী লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredStudents = (students ?? []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.latestEnrollment?.courseSlug.toLowerCase().includes(q) ?? false) ||
      (s.latestEnrollment?.batch.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Students: শিক্ষার্থী"
          sub="পোর্টাল অ্যাকাউন্ট, অফলাইন ভর্তি ও কোর্স ব্যবস্থাপনা"
        />
        <Button
          onClick={() => {
            setPrefilledStudent(null);
            setEnrollDialogOpen(true);
          }}
          className="rounded-full bg-primary font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <UserPlus className="mr-2 h-4 w-4" /> অফলাইন ভর্তি / কোর্স প্রদান
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="নাম, মোবাইল নম্বর বা কোর্স দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 rounded-xl border-border bg-card"
        />
      </div>

      {loading && !students ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {students && !loading ? (
        filteredStudents.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={searchQuery ? "কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি" : "কোনো পোর্টাল অ্যাকাউন্ট নেই"}
            hint={
              searchQuery
                ? "অনুসন্ধানের কীওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।"
                : "উপরে 'অফলাইন ভর্তি / কোর্স প্রদান' বাটনে ক্লিক করে শিক্ষার্থী যুক্ত করতে পারেন।"
            }
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredStudents.map((s) => (
              <li key={s.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveId(s.id);
                    }
                  }}
                  className="h-full cursor-pointer rounded-2xl border-border bg-card transition hover:border-primary/50 hover:shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary"
                        aria-hidden="true"
                      >
                        {s.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.phone}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                        {s.enrollmentCount} enrollment{s.enrollmentCount === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDate(s.createdAt)}
                      </span>
                    </div>
                    {s.latestEnrollment ? (
                      <p className="mt-2 truncate rounded-lg bg-muted/50 px-2 py-1.5 text-xs">
                        <span className="font-medium text-foreground">
                          {courseTitle(s.latestEnrollment.courseSlug)}
                        </span>{" "}
                        · {s.latestEnrollment.batch}
                      </p>
                    ) : (
                      <p className="mt-2 rounded-lg bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
                        কোনো ভর্তি নেই, খালি পোর্টাল
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {/* Student Details Sheet */}
      <StudentSheet
        id={activeId}
        onClose={() => setActiveId(null)}
        onAddCourse={(student) => {
          setPrefilledStudent(student);
          setEnrollDialogOpen(true);
        }}
        onDeleted={() => {
          setActiveId(null);
          void load();
        }}
      />

      {/* Offline / Direct Enrollment Dialog */}
      <DirectEnrollmentDialog
        open={enrollDialogOpen}
        prefilled={prefilledStudent}
        onClose={() => setEnrollDialogOpen(false)}
        onSuccess={() => {
          setEnrollDialogOpen(false);
          void load();
          if (activeId) {
            // trigger refresh on active detail sheet
            const curr = activeId;
            setActiveId(null);
            setTimeout(() => setActiveId(curr), 50);
          }
        }}
      />
    </div>
  );
}

/**
 * Dialog to Enroll a student offline into any course
 */
function DirectEnrollmentDialog({
  open,
  prefilled,
  onClose,
  onSuccess,
}: {
  open: boolean;
  prefilled?: { id?: string; name?: string; phone?: string; email?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [courseSlug, setCourseSlug] = useState(courses[0]?.slug ?? "spoken-english-course");
  const [batch, setBatch] = useState("Offline Direct Admission");
  const [targetBand, setTargetBand] = useState("7.5");
  const [examDate, setExamDate] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefilled) {
      setName(prefilled.name || "");
      setPhone(prefilled.phone || "");
      setEmail(prefilled.email || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
    }
    setPassword("");
    setError(null);
    setSuccessMsg(null);
  }, [prefilled, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("শিক্ষার্থীর নাম লিখুন।");
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setError("সঠিক মোবাইল নম্বর লিখুন।");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": token || "",
        },
        body: JSON.stringify({
          studentId: prefilled?.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          password: password.trim() || undefined,
          courseSlug,
          batch: batch.trim() || "Offline Direct Admission",
          targetBand: targetBand.trim() || "7.5",
          examDate: examDate.trim() || null,
          progress: 0,
          attendance: 100,
          status: "active",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "কোর্স এনরোল করতে সমস্যা হয়েছে।");
        return;
      }

      setSuccessMsg(data.message ?? "কোর্স সফলভাবে প্রদান করা হয়েছে!");
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {prefilled?.id ? "শিক্ষার্থীকে নতুন কোর্স প্রদান করুন" : "অফলাইন ভর্তি ও কোর্স প্রদান"}
          </DialogTitle>
          <DialogDescription>
            {prefilled?.id
              ? `শিক্ষার্থী ${prefilled.name}-কে নতুন কোর্সে যুক্ত করুন।`
              : "বাস্তবে/অফলাইনে ভর্তি হওয়া শিক্ষার্থীকে অ্যাকাউন্টে কোর্স অ্যাক্সেস দিন।"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Student Info */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> শিক্ষার্থীর তথ্য
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="student-name" className="text-xs font-semibold">
                  পুরো নাম <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="student-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রহিম আহমেদ"
                  disabled={!!prefilled?.id}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="student-phone" className="text-xs font-semibold">
                  মোবাইল নম্বর <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="student-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  disabled={!!prefilled?.id}
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="student-email" className="text-xs">
                  ইমেইল এড্রেস (ঐচ্ছিক)
                </Label>
                <Input
                  id="student-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  disabled={!!prefilled?.id}
                />
              </div>

              {!prefilled?.id ? (
                <div className="space-y-1">
                  <Label htmlFor="student-pass" className="text-xs">
                    পাসওয়ার্ড (ঐচ্ছিক)
                  </Label>
                  <Input
                    id="student-pass"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ডিফল্ট: মোবাইল নম্বর"
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Course Info */}
          <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> কোর্স ও ব্যাচ নির্বাচন
            </p>

            <div className="space-y-1">
              <Label htmlFor="course-select" className="text-xs font-semibold">
                কোর্স সিলেক্ট করুন <span className="text-destructive">*</span>
              </Label>
              <select
                id="course-select"
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title} {c.price ? `(৳${c.price})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="batch-name" className="text-xs font-semibold">
                  ব্যাচ নাম <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="batch-name"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="যেমন: Offline Batch 319"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="target-band" className="text-xs">
                  টার্গেট ব্যান্ড (Target Band)
                </Label>
                <Input
                  id="target-band"
                  value={targetBand}
                  onChange={(e) => setTargetBand(e.target.value)}
                  placeholder="7.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="exam-date" className="text-xs">
                সম্ভাব্য পরীক্ষার তারিখ (Exam Date - ঐচ্ছিক)
              </Label>
              <Input
                id="exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive text-center">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 text-center font-medium">
              {successMsg}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              বাতিল
            </Button>
            <Button type="submit" disabled={busy} className="bg-primary text-primary-foreground font-semibold">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> কোর্স অ্যাক্সেস দিন
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudentSheet({
  id,
  onClose,
  onAddCourse,
  onDeleted,
}: {
  id: string | null;
  onClose: () => void;
  onAddCourse: (student: { id: string; name: string; phone: string; email?: string }) => void;
  onDeleted: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [detail, setDetail] = useState<AdminStudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDetail = useCallback(() => {
    if (!id || !token) return;
    setLoading(true);
    fetch(`/api/admin/students/${id}`, { headers: { "x-admin-key": token } })
      .then(async (r) => {
        const data = (await r.json().catch(() => null)) as
          | { ok?: boolean; student?: AdminStudentDetail; error?: string }
          | null;
        if (r.ok && data?.ok && data.student) setDetail(data.student);
        else setError(data?.error ?? "লোড করা যায়নি।");
      })
      .catch(() => {
        setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, token]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  async function handleDeleteEnrollment(enrollmentId: string) {
    if (!id || !token) return;
    if (!confirm("আপনি কি নিশ্চিতভাবে এই কোর্সের এনরোলমেন্ট মুছে ফেলতে চান?")) return;
    setDeletingId(enrollmentId);
    try {
      const res = await fetch(`/api/admin/students/${id}?enrollmentId=${enrollmentId}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        fetchDetail();
      } else {
        alert(data.error ?? "মুছে ফেলতে সমস্যা হয়েছে।");
      }
    } catch {
      alert("নেটওয়ার্ক সমস্যা।");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteStudent() {
    if (!id || !token) return;
    if (
      !confirm(
        `সতর্কতা: ${detail?.name}-এর সম্পূর্ণ পোর্টাল অ্যাকাউন্ট ও সকল কোর্স ডাটা মুছে যাবে। আপনি কি নিশ্চিত?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onDeleted();
      } else {
        alert(data.error ?? "মুছে ফেলতে সমস্যা হয়েছে।");
      }
    } catch {
      alert("নেটওয়ার্ক সমস্যা।");
    }
  }

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2 pr-6">
            <div>
              <SheetTitle>{detail ? detail.name : "Student"}</SheetTitle>
              <SheetDescription>
                {detail ? `${detail.phone} · joined ${formatDate(detail.createdAt)}` : "লোড হচ্ছে…"}
              </SheetDescription>
            </div>
            {detail && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteStudent}
                className="h-8 px-2 text-xs"
                title="সম্পূর্ণ অ্যাকাউন্ট মুছে ফেলুন"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> অ্যাকাউন্ট মুছুন
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : null}

          {!loading && error ? <p className="text-sm text-red-600">{error}</p> : null}

          {detail && !loading ? (
            <>
              {/* Enrollments */}
              <section aria-label="Enrollments">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                    Enrollments: ভর্তি ({detail.enrollments.length})
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onAddCourse({
                        id: detail.id,
                        name: detail.name,
                        phone: detail.phone,
                      })
                    }
                    className="h-8 rounded-full text-xs font-semibold"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> আরেকটি কোর্স দিন
                  </Button>
                </div>

                {detail.enrollments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
                    এই অ্যাকাউন্টে কোনো ভর্তি নেই। উপরে &apos;আরেকটি কোর্স দিন&apos; বাটনে ক্লিক করে কোর্স প্রদান করতে পারেন।
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {detail.enrollments.map((e) => (
                      <li key={e.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {courseTitle(e.courseSlug)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {e.batch}
                              {e.targetBand ? ` · target ${e.targetBand}` : ""}
                              {e.examDate ? ` · exam ${formatDate(e.examDate)}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ToneBadge
                              tone={
                                ENROLLMENT_STATUS_TONE[e.status as keyof typeof ENROLLMENT_STATUS_TONE] ??
                                "muted"
                              }
                            >
                              {e.status}
                            </ToneBadge>
                            <button
                              type="button"
                              onClick={() => handleDeleteEnrollment(e.id)}
                              disabled={deletingId === e.id}
                              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              title="এনরোলমেন্ট মুছে ফেলুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Target className="h-3 w-3" aria-hidden="true" /> Progress
                            </p>
                            <Progress value={e.progress} aria-label={`Progress ${e.progress}%`} />
                            <p className="mt-1 text-[11px] text-muted-foreground">{e.progress}%</p>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] text-muted-foreground">Attendance</p>
                            <Progress
                              value={e.attendance}
                              aria-label={`Attendance ${e.attendance}%`}
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">{e.attendance}%</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Mock results */}
              <section aria-label="Mock results">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                  Mock Results: মক স্কোর ({detail.mockResults.length})
                </h3>
                {detail.mockResults.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
                    এখনো কোনো মক টেস্ট দেয়নি।
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead>Test</TableHead>
                          <TableHead>L</TableHead>
                          <TableHead>R</TableHead>
                          <TableHead>W</TableHead>
                          <TableHead>S</TableHead>
                          <TableHead className="font-bold">Overall</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.mockResults.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell>
                              <span className="block text-xs font-medium">{m.label}</span>
                              <span className="block text-[11px] text-muted-foreground">{m.date}</span>
                            </TableCell>
                            <TableCell>{m.listening}</TableCell>
                            <TableCell>{m.reading}</TableCell>
                            <TableCell>{m.writing}</TableCell>
                            <TableCell>{m.speaking}</TableCell>
                            <TableCell className="font-bold text-primary">{m.overall}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
