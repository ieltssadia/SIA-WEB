"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  Layers,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCourseRow } from "@/lib/admin-types";
import { ADMIN_COURSE_CATEGORIES } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  formatBDT,
  type Tone,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const CATEGORY_TONE: Record<string, Tone> = {
  complete: "blue",
  beginner: "emerald",
  exam: "amber",
};

const CATEGORY_LABEL: Record<string, string> = {
  complete: "Complete · কমপ্লিট",
  beginner: "Beginner · বিগিনার",
  exam: "Exam · এক্সাম",
};

/** Dialog form — numeric fields are strings; empty → null on the payload. */
type CourseForm = {
  slug: string;
  title: string;
  titleBn: string;
  desc: string;
  category: string;
  callForPrice: boolean;
  price: string;
  oldPrice: string;
  lessons: string;
  duration: string;
  tag: string;
  icon: string;
  mode: string;
  nextBatch: string;
  scheduleNote: string;
  seatsLeft: string;
  seatsTotal: string;
  accessPeriod: string;
  rating: string;
  students: string;
  features: string; // one per line
  syllabus: string; // one per line
  published: boolean;
};

function emptyForm(): CourseForm {
  return {
    slug: "",
    title: "",
    titleBn: "",
    desc: "",
    category: "complete",
    callForPrice: false,
    price: "",
    oldPrice: "",
    lessons: "24",
    duration: "",
    tag: "",
    icon: "book",
    mode: "",
    nextBatch: "",
    scheduleNote: "",
    seatsLeft: "",
    seatsTotal: "",
    accessPeriod: "",
    rating: "4.8",
    students: "0",
    features: "",
    syllabus: "",
    published: true,
  };
}

function toForm(c: AdminCourseRow): CourseForm {
  return {
    slug: c.slug,
    title: c.title,
    titleBn: c.titleBn,
    desc: c.desc,
    category: c.category,
    callForPrice: c.price === null,
    price: c.price === null ? "" : String(c.price),
    oldPrice: c.oldPrice === null ? "" : String(c.oldPrice),
    lessons: String(c.lessons),
    duration: c.duration,
    tag: c.tag,
    icon: c.icon,
    mode: c.mode,
    nextBatch: c.nextBatch,
    scheduleNote: c.scheduleNote,
    seatsLeft: c.seatsLeft === null ? "" : String(c.seatsLeft),
    seatsTotal: c.seatsTotal === null ? "" : String(c.seatsTotal),
    accessPeriod: c.accessPeriod ?? "",
    rating: String(c.rating),
    students: String(c.students),
    features: c.features.join("\n"),
    syllabus: c.syllabus.join("\n"),
    published: c.published,
  };
}

function numOrNull(value: string): number | null {
  const t = value.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function numOr(value: string, fallback: number): number {
  const n = numOrNull(value);
  return n === null ? fallback : n;
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function coursePayload(form: CourseForm) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    titleBn: form.titleBn.trim(),
    desc: form.desc.trim(),
    lessons: Math.max(1, numOr(form.lessons, 1)),
    duration: form.duration.trim(),
    price: form.callForPrice ? null : numOrNull(form.price),
    oldPrice: numOrNull(form.oldPrice),
    tag: form.tag.trim(),
    icon: form.icon.trim() || "book",
    features: toLines(form.features).slice(0, 10),
    category: form.category,
    rating: Math.min(5, Math.max(0, Number(form.rating) || 0)),
    students: Math.max(0, numOr(form.students, 0)),
    nextBatch: form.nextBatch.trim(),
    mode: form.mode.trim(),
    scheduleNote: form.scheduleNote.trim(),
    seatsLeft: numOrNull(form.seatsLeft),
    seatsTotal: numOrNull(form.seatsTotal),
    accessPeriod: form.accessPeriod.trim() || null,
    syllabus: toLines(form.syllabus).slice(0, 20),
    published: form.published,
  };
}

/**
 * Admin Courses — the managed catalog (GET any role; writes admin/owner,
 * teachers see a read-only note). Publish toggle PATCHes instantly; the
 * full add/edit dialog covers every course field.
 */
export function AdminCourses() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const readOnly = role === "teacher";

  const [courses, setCourses] = useState<AdminCourseRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCourseRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCourseRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; courses?: AdminCourseRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.courses) setCourses(data.courses);
      else setError(data?.error ?? "কোর্স লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const list = courses ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.titleBn.toLowerCase().includes(q)
    );
  }, [courses, query]);

  const counts = useMemo(() => {
    const list = courses ?? [];
    return {
      total: list.length,
      published: list.filter((c) => c.published).length,
      callForPrice: list.filter((c) => c.price === null).length,
    };
  }, [courses]);

  async function togglePublished(course: AdminCourseRow, published: boolean) {
    if (!token || readOnly) return;
    setBusyId(course.id);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; course?: AdminCourseRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.course) {
        setCourses((prev) =>
          prev ? prev.map((c) => (c.id === data.course!.id ? data.course! : c)) : prev
        );
        toast.success(
          published
            ? `${course.title} পাবলিশ হয়েছে। (Published.)`
            : `${course.title} আনপাবলিশ হয়েছে। (Unpublished.)`
        );
      } else {
        toast.error(data?.error ?? "আপডেট করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/courses/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে। (Course deleted.)`);
        void load();
      } else {
        toast.error(data?.error ?? "মুছে ফেলা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Courses: কোর্স"
        sub="পাবলিক সাইটের কোর্স ক্যাটালগ, দাম, সিট ও পাবলিশ স্টেট ম্যানেজ করুন"
      >
        {!readOnly ? (
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Add Course: নতুন কোর্স
          </Button>
        ) : null}
      </SectionHeading>

      {readOnly ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন, কোর্স শুধু দেখা যাবে, বদলানো যাবে না। (Read-only view.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={BookOpen} label="Total: মোট" value={counts.total} tone="blue" />
        <StatCard
          icon={Layers}
          label="Published: পাবলিশড"
          sub={`${counts.total - counts.published} hidden`}
          value={counts.published}
          tone="emerald"
        />
        <StatCard
          icon={Users}
          label="Call for price: কল করুন"
          value={counts.callForPrice}
          tone="amber"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="কোর্স খুঁজুন: নাম বা slug"
          aria-label="Search courses"
          className="min-h-11 rounded-xl border-border bg-card pl-10"
        />
      </div>

      {loading && !courses ? (
        <div className="grid gap-3 md:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {courses && !loading ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={query ? "কিছু পাওয়া যায়নি" : "এখনো কোনো কোর্স নেই"}
            hint={
              query
                ? "অন্য নাম বা slug দিয়ে খুঁজে দেখুন।"
                : "Add Course বাটন থেকে প্রথম কোর্সটি যোগ করুন।"
            }
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{c.title}</p>
                    {c.titleBn ? (
                      <p className="truncate text-xs text-muted-foreground">{c.titleBn}</p>
                    ) : null}
                  </div>
                  <ToneBadge tone={CATEGORY_TONE[c.category] ?? "muted"}>
                    {CATEGORY_LABEL[c.category] ?? c.category}
                  </ToneBadge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-bold text-foreground">
                    {c.price === null ? (
                      <span className="text-primary">কল করুন</span>
                    ) : (
                      formatBDT(c.price)
                    )}
                    {c.oldPrice !== null ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">
                        {formatBDT(c.oldPrice)}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.lessons} lessons · {c.duration || "-"}
                  </span>
                  {c.seatsTotal !== null ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {c.seatsLeft ?? 0}/{c.seatsTotal} seats
                    </span>
                  ) : null}
                </div>

                {c.nextBatch ? (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Next batch: {c.nextBatch}
                    {c.mode ? ` · ${c.mode}` : ""}
                  </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch
                      checked={c.published}
                      disabled={readOnly || busyId === c.id}
                      onCheckedChange={(v) => void togglePublished(c, v)}
                      aria-label={`Publish ${c.title}`}
                    />
                    {c.published ? "Published · চলছে" : "Hidden · লুকানো"}
                  </label>
                  {!readOnly ? (
                    <span className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full border-border bg-card"
                        onClick={() => {
                          setEditing(c);
                          setDialogOpen(true);
                        }}
                        aria-label={`Edit ${c.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        onClick={() => setDeleteTarget(c)}
                        aria-label={`Delete ${c.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <CourseDialog
        open={dialogOpen}
        editing={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>কোর্সটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title}, পাবলিক সাইট থেকেও সরে যাবে। এটি ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel · বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              Delete · মুছুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / Edit dialog — every course field, grouped
// ---------------------------------------------------------------------------

function CourseDialog({
  open,
  editing,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminCourseRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Re-seed the form each time the dialog opens (add vs edit).
  useEffect(() => {
    if (open) setForm(editing ? toForm(editing) : emptyForm());
  }, [open, editing]);

  function setField<K extends keyof CourseForm>(key: K, value: CourseForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    // Cheap client-side validation before hitting the API.
    if (form.title.trim().length < 3) {
      toast.error("কোর্সের নাম দিন।");
      return;
    }
    if (!/^[a-z0-9-]{2,80}$/.test(form.slug.trim())) {
      toast.error("স্লাগে ছোট হাতের a-z, 0-9 ও ড্যাশ (-) ব্যবহার করুন।");
      return;
    }
    if (!form.callForPrice) {
      const price = numOrNull(form.price);
      if (price === null) {
        toast.error("দাম দিন বা \"Call for price\" চালু করুন।");
        return;
      }
      if (price < 0) {
        toast.error("দাম ০ বা তার বেশি হতে হবে।");
        return;
      }
    }
    const oldPrice = numOrNull(form.oldPrice);
    if (oldPrice !== null && oldPrice < 0) {
      toast.error("পুরোনো দাম ০ বা তার বেশি হতে হবে।");
      return;
    }
    const seatsLeft = numOrNull(form.seatsLeft);
    const seatsTotal = numOrNull(form.seatsTotal);
    if ((seatsLeft !== null && seatsLeft < 0) || (seatsTotal !== null && seatsTotal < 0)) {
      toast.error("সিট সংখ্যা ০ বা তার বেশি হতে হবে।");
      return;
    }
    if (numOr(form.lessons, 1) < 1) {
      toast.error("লেসন সংখ্যা কমপক্ষে ১ হতে হবে।");
      return;
    }

    setSaving(true);
    try {
      const body = coursePayload(form);
      const res = await fetch(
        editing ? `/api/admin/courses/${editing.id}` : "/api/admin/courses",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; course?: AdminCourseRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing ? "কোর্স আপডেট হয়েছে। (Course updated.)" : "নতুন কোর্স যোগ হয়েছে। (Course added.)"
        );
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(data?.error ?? "সেভ করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "min-h-11 rounded-xl border-border bg-muted/40";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit: ${editing.title}` : "Add Course: নতুন কোর্স যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            পাবলিক সাইটের কোর্স কার্ড ও ডিটেইলস এখান থেকেই আসে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="course-title">Title · নাম *</Label>
              <Input
                id="course-title"
                required
                maxLength={120}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="IELTS Complete Course"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-slug">Slug · লিংক *</Label>
              <Input
                id="course-slug"
                required
                maxLength={80}
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="ielts-complete-course"
                className={`${inputCls} font-mono text-sm`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-titlebn">Title (BN) · বাংলা নাম</Label>
              <Input
                id="course-titlebn"
                maxLength={160}
                value={form.titleBn}
                onChange={(e) => setField("titleBn", e.target.value)}
                placeholder="আইইএলটিএস কমপ্লিট কোর্স"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-category">Category · ক্যাটাগরি *</Label>
              <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                <SelectTrigger id="course-category" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_COURSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {CATEGORY_LABEL[c.value] ?? c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="course-desc">Description · বিবরণ</Label>
              <Textarea
                id="course-desc"
                rows={3}
                maxLength={1200}
                value={form.desc}
                onChange={(e) => setField("desc", e.target.value)}
                placeholder="কোর্সে কী থাকছে, সংক্ষেপে"
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <Label className="mb-2 flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.callForPrice}
                onCheckedChange={(v) => setField("callForPrice", v === true)}
                aria-label="Call for price"
              />
              Call for price: দামের বদলে &quot;কল করুন&quot;
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="course-price">Price (৳) *</Label>
                <Input
                  id="course-price"
                  type="number"
                  min={0}
                  step={1}
                  disabled={form.callForPrice}
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="12500"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-oldprice">Old price (৳)</Label>
                <Input
                  id="course-oldprice"
                  type="number"
                  min={0}
                  step={1}
                  value={form.oldPrice}
                  onChange={(e) => setField("oldPrice", e.target.value)}
                  placeholder="খালি = নেই"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="course-lessons">Lessons · লেসন *</Label>
              <Input
                id="course-lessons"
                type="number"
                min={1}
                max={200}
                required
                value={form.lessons}
                onChange={(e) => setField("lessons", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-duration">Duration · সময়</Label>
              <Input
                id="course-duration"
                maxLength={60}
                value={form.duration}
                onChange={(e) => setField("duration", e.target.value)}
                placeholder="৩ মাস · ৪৮ ঘণ্টা"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-tag">Tag · ট্যাগ</Label>
              <Input
                id="course-tag"
                maxLength={40}
                value={form.tag}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder="Bestseller"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-icon">Icon · আইকন</Label>
              <Input
                id="course-icon"
                maxLength={30}
                value={form.icon}
                onChange={(e) => setField("icon", e.target.value)}
                placeholder="book"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-mode">Mode · মোড</Label>
              <Input
                id="course-mode"
                maxLength={60}
                value={form.mode}
                onChange={(e) => setField("mode", e.target.value)}
                placeholder="Online Live + Recorded"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-nextbatch">Next batch · পরের ব্যাচ</Label>
              <Input
                id="course-nextbatch"
                maxLength={60}
                value={form.nextBatch}
                onChange={(e) => setField("nextBatch", e.target.value)}
                placeholder="Batch 318, 1 Oct"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="course-schedule">Schedule note · রুটিন নোট</Label>
              <Input
                id="course-schedule"
                maxLength={200}
                value={form.scheduleNote}
                onChange={(e) => setField("scheduleNote", e.target.value)}
                placeholder="সাপ্তাহে ৩ দিন, রাত ৯টা"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="course-seatsleft">Seats left</Label>
                <Input
                  id="course-seatsleft"
                  type="number"
                  min={0}
                  max={999}
                  value={form.seatsLeft}
                  onChange={(e) => setField("seatsLeft", e.target.value)}
                  placeholder="খালি = নেই"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-seatstotal">Seats total</Label>
                <Input
                  id="course-seatstotal"
                  type="number"
                  min={0}
                  max={999}
                  value={form.seatsTotal}
                  onChange={(e) => setField("seatsTotal", e.target.value)}
                  placeholder="খালি = নেই"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-access">Access period · অ্যাক্সেস</Label>
              <Input
                id="course-access"
                maxLength={80}
                value={form.accessPeriod}
                onChange={(e) => setField("accessPeriod", e.target.value)}
                placeholder="৬ মাস"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="course-rating">Rating (0-5)</Label>
                <Input
                  id="course-rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => setField("rating", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-students">Students</Label>
                <Input
                  id="course-students"
                  type="number"
                  min={0}
                  value={form.students}
                  onChange={(e) => setField("students", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="course-features">Features: প্রতি লাইনে একটি</Label>
              <Textarea
                id="course-features"
                rows={4}
                value={form.features}
                onChange={(e) => setField("features", e.target.value)}
                placeholder={"Mock test সহ\nRecording এক বছর"}
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-syllabus">Syllabus: প্রতি লাইনে একটি</Label>
              <Textarea
                id="course-syllabus"
                rows={4}
                value={form.syllabus}
                onChange={(e) => setField("syllabus", e.target.value)}
                placeholder={"Listening মডিউল\nReading মডিউল"}
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setField("published", v)}
              aria-label="Published"
            />
            Published: সাইটে দেখা যাবে
          </label>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-full border-border bg-card"
            >
              Cancel · বাতিল
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
            >
              {saving ? "Saving…" : editing ? "Save: সেভ" : "Add Course: যোগ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
