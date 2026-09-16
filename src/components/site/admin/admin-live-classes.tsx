"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Clock,
  Link2,
  Pencil,
  PlusCircle,
  Radio,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import type { AdminLiveClass } from "@/lib/admin-types";
import {
  ADMIN_LIVE_STATUSES,
  ErrorState,
  LIVE_STATUS_LABEL,
  LIVE_STATUS_TONE,
  SectionHeading,
  ToneBadge,
  formatDateTime,
  toLocalInputValue,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";
import { courses } from "@/lib/site-data";

const SITE_URL_HINT = "শিক্ষার্থীরা পোর্টালের লাইভ সেকশন থেকে জয়েন করে — লিংক শেয়ারের দরকার নেই";

type FormState = {
  slug: string;
  title: string;
  teacher: string;
  courseSlug: string; // "none" → null
  startsAt: string; // datetime-local value
  durationMin: string;
  status: string;
  description: string;
};

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    teacher: "Sadia Ma'am",
    courseSlug: "none",
    startsAt: "",
    durationMin: "60",
    status: "scheduled",
    description: "",
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Admin Live Classes — schedule form + upcoming/live/ended lists with
 * edit & delete. Field names mirror the LiveClass schema (slug, title,
 * teacher, courseSlug, startsAt, durationMin, status, description).
 */
export function AdminLiveClasses() {
  const token = useAdminStore((s) => s.token);

  const [classes, setClasses] = useState<AdminLiveClass[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminLiveClass | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/live-classes", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; classes?: AdminLiveClass[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.classes) setClasses(data.classes);
      else setError(data?.error ?? "লাইভ ক্লাস লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const list = classes ?? [];
    return {
      live: list.filter((c) => c.status === "live"),
      upcoming: list.filter(
        (c) => c.status === "scheduled" && new Date(c.startsAt).getTime() >= Date.now()
      ),
      overdue: list.filter(
        (c) => c.status === "scheduled" && new Date(c.startsAt).getTime() < Date.now()
      ),
      ended: list.filter((c) => c.status === "ended"),
    };
  }, [classes]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTitle(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  function startEdit(c: AdminLiveClass) {
    setEditingId(c.id);
    setSlugTouched(true);
    setForm({
      slug: c.slug,
      title: c.title,
      teacher: c.teacher,
      courseSlug: c.courseSlug ?? "none",
      startsAt: toLocalInputValue(c.startsAt),
      durationMin: String(c.durationMin),
      status: c.status,
      description: c.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!form.startsAt) {
      toast.error("শুরুর সময় নির্বাচন করুন। (Pick a start time.)");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        teacher: form.teacher,
        courseSlug: form.courseSlug === "none" ? "" : form.courseSlug,
        description: form.description,
        startsAt: new Date(form.startsAt).toISOString(),
        durationMin: Number(form.durationMin) || 60,
      };
      if (editingId) {
        payload.status = form.status;
        const res = await fetch(`/api/admin/live-classes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (res.ok && data?.ok) {
          toast.success("ক্লাস আপডেট হয়েছে। (Class updated.)");
          resetForm();
          void load();
        } else {
          toast.error(data?.error ?? "আপডেট করা যায়নি।");
        }
      } else {
        payload.slug = form.slug || slugify(form.title);
        const res = await fetch("/api/admin/live-classes", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (res.ok && data?.ok) {
          toast.success("নতুন ক্লাস শিডিউল হয়েছে। (Class scheduled.)");
          resetForm();
          void load();
        } else {
          toast.error(data?.error ?? "ক্লাস তৈরি করা যায়নি।");
        }
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/live-classes/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে।`);
        if (editingId === target.id) resetForm();
        void load();
      } else {
        toast.error(data?.error ?? "মুছে ফেলা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    }
  }

  const courseTitle = (slug: string | null) =>
    slug ? courses.find((c) => c.slug === slug)?.title ?? slug : null;

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Live Classes — লাইভ ক্লাস"
        sub="ক্লাস শিডিউল করুন — এনরোল্ড শিক্ষার্থীরা পোর্টালের লাইভ সেকশন থেকে জয়েন করবে"
      />

      {/* Schedule / edit form */}
      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit class — ক্লাস এডিট" : "Schedule a class — নতুন ক্লাস"}
              </h3>
              {editingId ? (
                <Button type="button" variant="outline" size="sm" className="rounded-full border-border bg-card" onClick={resetForm}>
                  Cancel · বাতিল
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lc-title">Title · শিরোনাম *</Label>
                <Input
                  id="lc-title"
                  required
                  minLength={3}
                  maxLength={140}
                  value={form.title}
                  onChange={(e) => handleTitle(e.target.value)}
                  placeholder="Writing Task 2 Masterclass"
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-slug">Slug · লিংক</Label>
                <Input
                  id="lc-slug"
                  required
                  minLength={3}
                  maxLength={60}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setField("slug", e.target.value);
                  }}
                  placeholder="writing-task2-masterclass"
                  className="min-h-11 rounded-xl border-border bg-muted/40 font-mono text-sm"
                  disabled={!!editingId}
                />
                <p className="text-[11px] text-muted-foreground">{SITE_URL_HINT}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-teacher">Instructor · শিক্ষক</Label>
                <Input
                  id="lc-teacher"
                  maxLength={80}
                  value={form.teacher}
                  onChange={(e) => setField("teacher", e.target.value)}
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-course">Subject · কোর্স</Label>
                <Select value={form.courseSlug} onValueChange={(v) => setField("courseSlug", v)}>
                  <SelectTrigger id="lc-course" className="min-h-11 rounded-xl border-border bg-muted/40">
                    <SelectValue placeholder="কোর্স বাছুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked course · নেই</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-starts">Starts at · শুরু</Label>
                <Input
                  id="lc-starts"
                  type="datetime-local"
                  required
                  value={form.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lc-duration">Minutes · মিনিট</Label>
                  <Input
                    id="lc-duration"
                    type="number"
                    min={10}
                    max={480}
                    step={5}
                    value={form.durationMin}
                    onChange={(e) => setField("durationMin", e.target.value)}
                    className="min-h-11 rounded-xl border-border bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lc-status">Status · স্ট্যাটাস</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setField("status", v)}
                    disabled={!editingId}
                  >
                    <SelectTrigger id="lc-status" className="min-h-11 rounded-xl border-border bg-muted/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_LIVE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {LIVE_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="lc-desc">Description · বিবরণ</Label>
                <Textarea
                  id="lc-desc"
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="ক্লাসে কী থাকবে — সংক্ষেপে লিখুন"
                  className="rounded-xl border-border bg-muted/40"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
            >
              {saving ? (
                "Saving…"
              ) : editingId ? (
                <>
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Update class · আপডেট
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" aria-hidden="true" /> Schedule class · শিডিউল
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && !classes ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {classes && !loading ? (
        <div className="space-y-4">
          <ClassGroup
            icon={Radio}
            title="Live now — চলছে"
            items={grouped.live}
            onEdit={startEdit}
            onDelete={setDeleteTarget}
            courseTitle={courseTitle}
            emptyHint="এই মুহূর্তে কোনো লাইভ ক্লাস নেই।"
          />
          <ClassGroup
            icon={CalendarClock}
            title="Upcoming — আসছে"
            items={[...grouped.upcoming, ...grouped.overdue]}
            onEdit={startEdit}
            onDelete={setDeleteTarget}
            courseTitle={courseTitle}
            emptyHint="কোনো আসন্ন ক্লাস নেই — উপরের ফর্ম থেকে শিডিউল করুন।"
          />
          <ClassGroup
            icon={Clock}
            title="Ended — শেষ হয়েছে"
            items={grouped.ended}
            onEdit={startEdit}
            onDelete={setDeleteTarget}
            courseTitle={courseTitle}
            emptyHint="এখনো কোনো ক্লাস শেষ হয়নি।"
          />
          <p className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Tip: public GET /api/live-classes প্রথমবার কল হলে ৪টি ডেমো ক্লাস auto-seed করে —
            সেগুলোও এখান থেকে এডিট বা ডিলিট করা যাবে।
          </p>
        </div>
      ) : null}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ক্লাসটি মুছে ফেলবেন? (Delete this class?)</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} — এটি আর পোর্টালের লাইভ সেকশনে দেখা যাবে না। এটি ফেরানো যাবে না।
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

function ClassGroup({
  icon: Icon,
  title,
  items,
  onEdit,
  onDelete,
  courseTitle,
  emptyHint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: AdminLiveClass[];
  onEdit: (c: AdminLiveClass) => void;
  onDelete: (c: AdminLiveClass) => void;
  courseTitle: (slug: string | null) => string | null;
  emptyHint: string;
}) {
  return (
    <section aria-label={title}>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {title}
        <span className="text-muted-foreground">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {emptyHint}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{c.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(c.startsAt)} · {c.durationMin} min · {c.teacher}
                  </p>
                </div>
                <ToneBadge tone={LIVE_STATUS_TONE[c.status as keyof typeof LIVE_STATUS_TONE] ?? "muted"}>
                  {c.status === "live" ? "● live" : c.status}
                </ToneBadge>
              </div>
              {courseTitle(c.courseSlug) ? (
                <p className="mt-1 text-xs text-primary">{courseTitle(c.courseSlug)}</p>
              ) : null}
              {c.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                  /live/{c.slug}
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-border bg-card"
                    onClick={() => onEdit(c)}
                    aria-label={`Edit ${c.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => onDelete(c)}
                    aria-label={`Delete ${c.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
