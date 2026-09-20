"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Pencil, PlusCircle, Trash2 } from "lucide-react";
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
import type { AdminRoutineRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  type Tone,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

const DAY_TONE: Record<string, Tone> = {
  Saturday: "blue",
  Sunday: "emerald",
  Monday: "amber",
  Tuesday: "sky",
  Wednesday: "blue",
  Thursday: "emerald",
  Friday: "amber",
};

const MODES = ["Online Live", "Hybrid", "Onsite"] as const;

const MODE_TONE: Record<string, Tone> = {
  "Online Live": "emerald",
  Hybrid: "amber",
  Onsite: "sky",
};

/** "10:00" (time input) → "10:00 AM" (stored display string). */
function timeInputToDisplay(value: string): string {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return value.trim();
  let h = Number(m[1]);
  if (h > 23) return value.trim();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ampm}`;
}

/** "10:00 AM" (stored display string) → "10:00" (time input value). */
function displayToTimeInput(value: string): string {
  const m = value.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!m) return "";
  let h = Number(m[1]);
  if (m[3] === "PM" && h < 12) h += 12;
  if (m[3] === "AM" && h === 12) h = 0;
  if (h > 23) return "";
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

type RoutineForm = {
  day: string;
  start: string; // time input value "10:00"
  end: string; // time input value
  courseSlug: string;
  batch: string;
  topic: string;
  mode: string;
  type: string;
  published: boolean;
};

function emptyForm(): RoutineForm {
  return {
    day: "Saturday",
    start: "",
    end: "",
    courseSlug: "",
    batch: "",
    topic: "",
    mode: "Hybrid",
    type: "Regular Class",
    published: true,
  };
}

function toForm(r: AdminRoutineRow): RoutineForm {
  return {
    day: DAYS.includes(r.day as (typeof DAYS)[number]) ? r.day : "Saturday",
    start: displayToTimeInput(r.start),
    end: displayToTimeInput(r.end),
    courseSlug: r.courseSlug,
    batch: r.batch,
    topic: r.topic,
    mode: MODES.includes(r.mode as (typeof MODES)[number]) ? r.mode : "Hybrid",
    type: r.type || "Regular Class",
    published: r.published,
  };
}

/**
 * Admin Routine — the weekly class schedule (#/routine + portal). Rows are
 * grouped by day (Saturday → Friday); writes are admin/owner, teachers get a
 * read-only view.
 */
export function AdminRoutine() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const canManage = role === "owner" || role === "admin";

  const [slots, setSlots] = useState<AdminRoutineRow[] | null>(null);
  const [courseSlugs, setCourseSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRoutineRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRoutineRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [slotRes, courseRes] = await Promise.all([
        fetch("/api/admin/routine", { headers: { "x-admin-key": token } }),
        fetch("/api/admin/courses", { headers: { "x-admin-key": token } })
          .then((r) => r.json().catch(() => null))
          .catch(() => null),
      ]);
      const data = (await slotRes.json().catch(() => null)) as
        | { ok?: boolean; slots?: AdminRoutineRow[]; error?: string }
        | null;
      if (slotRes.ok && data?.ok && data.slots) setSlots(data.slots);
      else setError(data?.error ?? "রুটিন লোড করা যায়নি।");

      const courseData = courseRes as
        | { ok?: boolean; courses?: { slug: string }[] }
        | null;
      if (courseData?.ok && courseData.courses) {
        setCourseSlugs(courseData.courses.map((c) => c.slug));
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const list = slots ?? [];
    return {
      total: list.length,
      published: list.filter((s) => s.published).length,
      days: new Set(list.map((s) => s.day)).size,
    };
  }, [slots]);

  /** Slots grouped by day in Saturday → Friday order. */
  const byDay = useMemo(() => {
    const list = slots ?? [];
    return DAYS.map((day) => ({
      day,
      rows: list.filter((s) => s.day === day),
    })).filter((group) => group.rows.length > 0);
  }, [slots]);

  async function togglePublished(slot: AdminRoutineRow, published: boolean) {
    if (!token || !canManage) return;
    setBusyId(slot.id);
    // Optimistic swap — the row flips instantly, server confirms after.
    setSlots((prev) =>
      prev ? prev.map((s) => (s.id === slot.id ? { ...s, published } : s)) : prev
    );
    try {
      const res = await fetch(`/api/admin/routine/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; slot?: AdminRoutineRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.slot) {
        setSlots((prev) =>
          prev ? prev.map((s) => (s.id === data.slot!.id ? data.slot! : s)) : prev
        );
        toast.success(
          published
            ? `${slot.day} ${slot.start} পাবলিশ হয়েছে। (Published.)`
            : `${slot.day} ${slot.start} আনপাবলিশ হয়েছে। (Hidden.)`
        );
      } else {
        setSlots((prev) =>
          prev ? prev.map((s) => (s.id === slot.id ? { ...s, published: !published } : s)) : prev
        );
        toast.error(data?.error ?? "আপডেট করা যায়নি।");
      }
    } catch {
      setSlots((prev) =>
        prev ? prev.map((s) => (s.id === slot.id ? { ...s, published: !published } : s)) : prev
      );
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/routine/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(
          `${target.day} ${target.start} মুছে ফেলা হয়েছে। (Slot deleted.)`
        );
        void load();
      } else {
        toast.error(data?.error ?? "মুছে ফেলা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Class Routine — ক্লাস রুটিন"
        sub="সাপ্তাহিক রুটিন — #/routine পেজ ও পোর্টালে শিক্ষার্থীরা দেখে"
      >
        {!canManage ? null : (
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Add Slot — স্লট যোগ
          </Button>
        )}
      </SectionHeading>

      {!canManage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন — রুটিন শুধু দেখা যাবে, বদলানো যাবে না। (Read-only view.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={CalendarDays} label="Total slots — মোট" value={counts.total} tone="sky" />
        <StatCard
          icon={CalendarDays}
          label="Published — দেখাচ্ছে"
          value={counts.published}
          tone="emerald"
        />
        <StatCard
          icon={CalendarDays}
          label="Days covered — দিন"
          value={`${counts.days}/7`}
          tone="amber"
        />
      </div>

      {loading && !slots ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {slots && !loading ? (
        byDay.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="এখনো কোনো রুটিন স্লট নেই"
            hint="Add Slot বাটন থেকে দিন, সময় আর কোর্স দিয়ে প্রথম স্লটটি যোগ করুন।"
          />
        ) : (
          <div className="space-y-5">
            {byDay.map(({ day, rows }) => (
              <section key={day} aria-label={`${day} classes`}>
                {/* Day chip with class count */}
                <div className="mb-2 flex items-center gap-2">
                  <ToneBadge tone={DAY_TONE[day] ?? "muted"} className="text-xs font-bold">
                    {day}
                  </ToneBadge>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {rows.length} class{rows.length === 1 ? "" : "es"}
                  </span>
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                </div>
                <ul className="space-y-2">
                  {rows.map((s) => (
                    <li key={s.id}>
                      <Card className="rounded-2xl border-border bg-card">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
                            aria-hidden="true"
                          >
                            <Clock className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">
                                {s.start}
                                {s.end ? ` – ${s.end}` : ""}
                              </p>
                              <ToneBadge tone={MODE_TONE[s.mode] ?? "muted"}>{s.mode}</ToneBadge>
                              {s.type ? (
                                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                  {s.type}
                                </span>
                              ) : null}
                            </div>
                            {s.topic ? (
                              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                {s.topic}
                              </p>
                            ) : null}
                            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                              {s.courseSlug || "—"}
                              {s.batch ? ` · ${s.batch}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Switch
                                checked={s.published}
                                disabled={!canManage || busyId === s.id}
                                onCheckedChange={(v) => void togglePublished(s, v)}
                                aria-label={`Publish ${s.day} ${s.start}`}
                              />
                              {s.published ? "Published" : "Hidden"}
                            </label>
                            {canManage ? (
                              <span className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-full border-border bg-card"
                                  onClick={() => {
                                    setEditing(s);
                                    setDialogOpen(true);
                                  }}
                                  aria-label={`Edit ${s.day} ${s.start}`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                  onClick={() => setDeleteTarget(s)}
                                  aria-label={`Delete ${s.day} ${s.start}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </span>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )
      ) : null}

      <SlotDialog
        open={dialogOpen}
        editing={editing}
        courseSlugs={courseSlugs}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>রুটিন স্লটটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.day}, ${deleteTarget.start}${deleteTarget.end ? ` – ${deleteTarget.end}` : ""} — ${deleteTarget.topic || deleteTarget.courseSlug}`
                : ""}
              {" "}— #/routine পেজ থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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
// Add / Edit dialog — time inputs convert to the stored "10:00 AM" strings
// ---------------------------------------------------------------------------

function SlotDialog({
  open,
  editing,
  courseSlugs,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminRoutineRow | null;
  courseSlugs: string[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<RoutineForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editing ? toForm(editing) : emptyForm());
    // Re-seed whenever the dialog opens.
  }, [open, editing]);

  function setField<K extends keyof RoutineForm>(key: K, value: RoutineForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!form.start) {
      toast.error("শুরুর সময় দিন।");
      return;
    }
    const start = timeInputToDisplay(form.start);
    const end = form.end ? timeInputToDisplay(form.end) : "";

    setSaving(true);
    try {
      const body = {
        day: form.day,
        start,
        end,
        courseSlug: form.courseSlug.trim(),
        batch: form.batch.trim(),
        topic: form.topic.trim(),
        mode: form.mode,
        type: form.type.trim() || "Regular Class",
        published: form.published,
      };
      const res = await fetch(
        editing ? `/api/admin/routine/${editing.id}` : "/api/admin/routine",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; slot?: AdminRoutineRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing ? "রুটিন আপডেট হয়েছে। (Slot updated.)" : "নতুন স্লট যোগ হয়েছে। (Slot added.)"
        );
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(data?.error ?? "সেভ করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "min-h-11 rounded-xl border-border bg-muted/40";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit slot — এডিট করুন" : "Add slot — রুটিন স্লট যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            দিন ও সময় বাছলে “10:00 AM” স্টাইলে রুটিনে বসে যাবে — #/routine পেজে দেখা যাবে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="routine-day">Day · দিন *</Label>
              <Select value={form.day} onValueChange={(v) => setField("day", v)}>
                <SelectTrigger id="routine-day" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routine-start">Start · শুরু *</Label>
              <Input
                id="routine-start"
                type="time"
                required
                value={form.start}
                onChange={(e) => setField("start", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routine-end">End · শেষ</Label>
              <Input
                id="routine-end"
                type="time"
                value={form.end}
                onChange={(e) => setField("end", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="routine-course">Course · কোর্স</Label>
            <Input
              id="routine-course"
              list="routine-course-options"
              maxLength={80}
              value={form.courseSlug}
              onChange={(e) => setField("courseSlug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="basic-to-ielts-in-batch"
              className={`${inputCls} font-mono text-sm`}
            />
            <datalist id="routine-course-options">
              {courseSlugs.map((slug) => (
                <option key={slug} value={slug} />
              ))}
            </datalist>
            <p className="text-[11px] text-muted-foreground">
              কোর্সের slug — লিস্ট থেকে বাছুন বা নতুন লিখুন।
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="routine-batch">Batch · ব্যাচ</Label>
              <Input
                id="routine-batch"
                maxLength={40}
                value={form.batch}
                onChange={(e) => setField("batch", e.target.value)}
                placeholder="Batch 317"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routine-mode">Mode · মোড *</Label>
              <Select value={form.mode} onValueChange={(v) => setField("mode", v)}>
                <SelectTrigger id="routine-mode" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="routine-topic">Topic · টপিক</Label>
              <Input
                id="routine-topic"
                maxLength={160}
                value={form.topic}
                onChange={(e) => setField("topic", e.target.value)}
                placeholder="Writing Task 1 — Graphs & Charts"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routine-type">Type · ধরন</Label>
              <Input
                id="routine-type"
                maxLength={60}
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                placeholder="Regular Class"
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setField("published", v)}
              aria-label="Published"
            />
            Published — রুটিনে দেখা যাবে
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
              {saving ? "Saving…" : editing ? "Save — সেভ" : "Add — যোগ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
