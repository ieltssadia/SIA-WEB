"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Pencil,
  PlusCircle,
  Radio,
  Trash2,
  Video,
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

type FormState = {
  title: string;
  teacher: string;
  courseSlug: string; // "none" → null
  targetBatch: string;
  platform: "zoom" | "meet" | "teams" | "other";
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  recordingUrl: string;
  startsAt: string; // datetime-local value
  durationMin: string;
  status: string;
  description: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    teacher: "Sadia Ma'am",
    courseSlug: "none",
    targetBatch: "All Students",
    platform: "meet",
    meetingUrl: "",
    meetingId: "",
    passcode: "",
    recordingUrl: "",
    startsAt: "",
    durationMin: "60",
    status: "scheduled",
    description: "",
  };
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 45);
  return `${base || "live-class"}-${Date.now().toString().slice(-4)}`;
}

const PLATFORM_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  meet: { label: "Google Meet", badge: "Google Meet", color: "bg-emerald-600 text-white" },
  zoom: { label: "Zoom Meeting", badge: "Zoom", color: "bg-blue-600 text-white" },
  teams: { label: "Microsoft Teams", badge: "MS Teams", color: "bg-indigo-600 text-white" },
  other: { label: "Custom Live Link", badge: "Custom Link", color: "bg-stone-700 text-white" },
};

/**
 * Admin Live Classes — Google Meet / Zoom meeting management.
 * Admin inputs meeting link & schedule, students get direct launch button on portal.
 */
export function AdminLiveClasses() {
  const token = useAdminStore((s) => s.token);

  const [classes, setClasses] = useState<AdminLiveClass[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
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

  function startEdit(c: AdminLiveClass) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      teacher: c.teacher,
      courseSlug: c.courseSlug ?? "none",
      targetBatch: c.targetBatch ?? "All Students",
      platform: (c.platform as FormState["platform"]) || "meet",
      meetingUrl: c.meetingUrl ?? "",
      meetingId: c.meetingId ?? "",
      passcode: c.passcode ?? "",
      recordingUrl: c.recordingUrl ?? "",
      startsAt: toLocalInputValue(c.startsAt),
      durationMin: String(c.durationMin),
      status: c.status,
      description: c.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function updateStatus(id: string, newStatus: string) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/live-classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`স্ট্যাটাস আপডেট হয়েছে: ${LIVE_STATUS_LABEL[newStatus as keyof typeof LIVE_STATUS_LABEL] ?? newStatus}`);
        void load();
      } else {
        toast.error(data?.error ?? "স্ট্যাটাস পরিবর্তন করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!form.startsAt) {
      toast.error("শুরুর সময় ও তারিখ নির্বাচন করুন।");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        teacher: form.teacher,
        courseSlug: form.courseSlug === "none" ? "" : form.courseSlug,
        targetBatch: form.targetBatch,
        platform: form.platform,
        meetingUrl: form.meetingUrl,
        meetingId: form.meetingId,
        passcode: form.passcode,
        recordingUrl: form.recordingUrl,
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
          toast.success("লাইভ ক্লাস আপডেট হয়েছে।");
          resetForm();
          void load();
        } else {
          toast.error(data?.error ?? "আপডেট করা যায়নি।");
        }
      } else {
        payload.slug = slugify(form.title);
        const res = await fetch("/api/admin/live-classes", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (res.ok && data?.ok) {
          toast.success("নতুন লাইভ ক্লাস শিডিউল হয়েছে। স্টুডেন্ট পোর্টালে যুক্ত হয়েছে!");
          resetForm();
          void load();
        } else {
          toast.error(data?.error ?? "ক্লাস তৈরি করা যায়নি।");
        }
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
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
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    }
  }

  const courseTitle = (slug: string | null) =>
    slug ? courses.find((c) => c.slug === slug)?.title ?? slug : null;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Live Classes (Google Meet / Zoom Bridge)"
        sub="গুগল মিট বা জুম ক্লাসের লিংক দিন। শিক্ষার্থীরা পোর্টাল থেকে সরাসরি ক্লাসে জয়েন করবে।"
      />

      {/* Schedule / edit form */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {editingId ? "Edit Live Class · লাইভ ক্লাস এডিট" : "Schedule New Live Class · নতুন লাইভ ক্লাস শিডিউল"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Google Meet বা Zoom লিংক দিলে ছাত্রছাত্রীরা তাদের স্টুডেন্ট পোর্টালে সরাসরি জয়েন বাটন পাবে
                </p>
              </div>
              {editingId ? (
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={resetForm}>
                  Cancel · বাতিল
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="lc-title">Class Title / Topic · ক্লাসের শিরোনাম *</Label>
                <Input
                  id="lc-title"
                  required
                  minLength={3}
                  maxLength={140}
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Speaking Cue Card Marathon: Part 2 Mastery"
                  className="min-h-11 rounded-xl border-border bg-muted/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-platform">Meeting Platform · ক্লাস মাধ্যম *</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => setField("platform", v as FormState["platform"])}
                >
                  <SelectTrigger id="lc-platform" className="min-h-11 rounded-xl border-border bg-muted/30">
                    <SelectValue placeholder="সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meet">🟢 Google Meet (গুগল মিট)</SelectItem>
                    <SelectItem value="zoom">🔵 Zoom (জুম মিটিং)</SelectItem>
                    <SelectItem value="teams">🟣 Microsoft Teams</SelectItem>
                    <SelectItem value="other">🔗 Other / Custom Live Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-url">Google Meet / Zoom URL · ক্লাসের লিংক *</Label>
                <Input
                  id="lc-url"
                  required
                  value={form.meetingUrl}
                  onChange={(e) => setField("meetingUrl", e.target.value)}
                  placeholder={
                    form.platform === "meet"
                      ? "https://meet.google.com/abc-defg-hij"
                      : "https://zoom.us/j/1234567890?pwd=..."
                  }
                  className="min-h-11 rounded-xl border-border bg-muted/30 font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-mid">Meeting ID (ঐচ্ছিক)</Label>
                <Input
                  id="lc-mid"
                  value={form.meetingId}
                  onChange={(e) => setField("meetingId", e.target.value)}
                  placeholder="e.g. 842 1928 3491"
                  className="min-h-11 rounded-xl border-border bg-muted/30 font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-pass">Passcode / Password (ঐচ্ছিক)</Label>
                <Input
                  id="lc-pass"
                  value={form.passcode}
                  onChange={(e) => setField("passcode", e.target.value)}
                  placeholder="e.g. SIA2026"
                  className="min-h-11 rounded-xl border-border bg-muted/30 font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-course">Course · কোর্স</Label>
                <Select value={form.courseSlug} onValueChange={(v) => setField("courseSlug", v)}>
                  <SelectTrigger id="lc-course" className="min-h-11 rounded-xl border-border bg-muted/30">
                    <SelectValue placeholder="কোর্স বাছুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Courses / সবার জন্য উন্মুক্ত</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-batch">Target Batch / গ্রুপ</Label>
                <Input
                  id="lc-batch"
                  value={form.targetBatch}
                  onChange={(e) => setField("targetBatch", e.target.value)}
                  placeholder="e.g. Batch 318, Spoken VIP, All Students"
                  className="min-h-11 rounded-xl border-border bg-muted/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-teacher">Instructor · শিক্ষক</Label>
                <Input
                  id="lc-teacher"
                  maxLength={80}
                  value={form.teacher}
                  onChange={(e) => setField("teacher", e.target.value)}
                  className="min-h-11 rounded-xl border-border bg-muted/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lc-starts">Starts at · শুরুর তারিখ ও সময় *</Label>
                <Input
                  id="lc-starts"
                  type="datetime-local"
                  required
                  value={form.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                  className="min-h-11 rounded-xl border-border bg-muted/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lc-duration">Duration (Minutes)</Label>
                  <Input
                    id="lc-duration"
                    type="number"
                    min={10}
                    max={480}
                    step={5}
                    value={form.durationMin}
                    onChange={(e) => setField("durationMin", e.target.value)}
                    className="min-h-11 rounded-xl border-border bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lc-status">Status · স্ট্যাটাস</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setField("status", v)}
                    disabled={!editingId}
                  >
                    <SelectTrigger id="lc-status" className="min-h-11 rounded-xl border-border bg-muted/30">
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

              <div className="space-y-1.5">
                <Label htmlFor="lc-rec">Post-Class Recording Link (Drive / YouTube)</Label>
                <Input
                  id="lc-rec"
                  value={form.recordingUrl}
                  onChange={(e) => setField("recordingUrl", e.target.value)}
                  placeholder="https://drive.google.com/file/... or YouTube"
                  className="min-h-11 rounded-xl border-border bg-muted/30 font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="lc-desc">Agenda / Instructions · ক্লাসের নির্দেশনা</Label>
                <Textarea
                  id="lc-desc"
                  rows={2}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="যেমন: আজকের ক্লাসে Writing Task 2-এর ৪টি স্ট্রাকচার এবং প্র্যাকটিস থাকবে।"
                  className="rounded-xl border-border bg-muted/30"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90 font-medium"
            >
              {saving ? (
                "Saving…"
              ) : editingId ? (
                <>
                  <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" /> Update Live Class · আপডেট করুন
                </>
              ) : (
                <>
                  <PlusCircle className="mr-1.5 h-4 w-4" aria-hidden="true" /> Schedule Live Class · শিডিউল করুন
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && !classes ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {classes && !loading ? (
        <div className="space-y-6">
          <ClassGroup
            icon={Radio}
            title="Live Now: এখন চলছে"
            items={grouped.live}
            onEdit={startEdit}
            onDelete={setDeleteTarget}
            onStatusChange={updateStatus}
            courseTitle={courseTitle}
            emptyHint="এই মুহূর্তে কোনো লাইভ ক্লাস চলছে না।"
          />
          <ClassGroup
            icon={CalendarClock}
            title="Upcoming Scheduled: আসন্ন ক্লাস"
            items={[...grouped.upcoming, ...grouped.overdue]}
            onEdit={startEdit}
            onDelete={setDeleteTarget}
            onStatusChange={updateStatus}
            courseTitle={courseTitle}
            emptyHint="কোনো আসন্ন ক্লাস নেই, উপরের ফর্ম থেকে নতুন শিডিউল তৈরি করুন।"
          />
          <ClassGroup
            icon={Clock}
            title="Completed / Ended: সম্পন্ন ক্লাস"
            items={grouped.ended}
            onEdit={startEdit}
            onDelete={setDeleteTarget}
            onStatusChange={updateStatus}
            courseTitle={courseTitle}
            emptyHint="এখনো কোনো ক্লাস সমাপ্ত তালিকায় নেই।"
          />
        </div>
      ) : null}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ক্লাসটি মুছে ফেলবেন? (Delete this class?)</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.title}&quot; মুছে ফেললে শিক্ষার্থীরা আর এই মিটিং বা রেকর্ডিং লিংক দেখতে পাবে না।
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
  onStatusChange,
  courseTitle,
  emptyHint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: AdminLiveClass[];
  onEdit: (c: AdminLiveClass) => void;
  onDelete: (c: AdminLiveClass) => void;
  onStatusChange: (id: string, status: string) => void;
  courseTitle: (slug: string | null) => string | null;
  emptyHint: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (c: AdminLiveClass) => {
    const url = c.meetingUrl || `${window.location.origin}/#/live/${c.slug}`;
    void navigator.clipboard.writeText(url);
    setCopiedId(c.id);
    toast.success("মিটিং লিংক কপি হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section aria-label={title}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </h3>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
          {emptyHint}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c) => {
            const platformInfo = PLATFORM_LABELS[c.platform] ?? PLATFORM_LABELS.meet;
            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 sm:p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${platformInfo.color}`}>
                          <Video className="h-3 w-3" />
                          {platformInfo.badge}
                        </span>
                        {c.targetBatch ? (
                          <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
                            {c.targetBatch}
                          </span>
                        ) : null}
                      </div>
                      <h4 className="mt-2 text-base font-bold text-foreground">{c.title}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(c.startsAt)} · {c.durationMin} মিনিট · {c.teacher}
                      </p>
                    </div>
                    <ToneBadge tone={LIVE_STATUS_TONE[c.status as keyof typeof LIVE_STATUS_TONE] ?? "muted"}>
                      {c.status === "live" ? "● Live Now" : c.status}
                    </ToneBadge>
                  </div>

                  {courseTitle(c.courseSlug) ? (
                    <p className="mt-2 text-xs font-semibold text-primary">{courseTitle(c.courseSlug)}</p>
                  ) : null}

                  {c.description ? (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                  ) : null}

                  {/* Credentials block */}
                  <div className="mt-3 rounded-xl border border-border/70 bg-muted/40 p-2.5 text-xs">
                    {c.meetingUrl ? (
                      <div className="flex items-center justify-between gap-2 truncate font-mono text-[11px] text-foreground">
                        <span className="truncate">🔗 {c.meetingUrl}</span>
                        <a
                          href={c.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        Portal Direct Waiting Room (/live/{c.slug})
                      </span>
                    )}
                    {(c.meetingId || c.passcode) && (
                      <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                        {c.meetingId && <span>ID: <strong className="text-foreground">{c.meetingId}</strong></span>}
                        {c.passcode && <span>Pass: <strong className="text-foreground">{c.passcode}</strong></span>}
                      </div>
                    )}
                    {c.recordingUrl && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700">
                        <span>📹 Recording Available</span>
                        <a href={c.recordingUrl} target="_blank" rel="noreferrer" className="underline">
                          Watch
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  {/* Status quick toggles */}
                  <div className="flex items-center gap-1.5">
                    {c.status !== "live" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100"
                        onClick={() => onStatusChange(c.id, "live")}
                      >
                        🔴 Go Live Now
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border-stone-300 bg-stone-100 text-xs font-semibold text-stone-800 hover:bg-stone-200"
                        onClick={() => onStatusChange(c.id, "ended")}
                      >
                        ⏹ End Class
                      </Button>
                    )}

                    {c.meetingUrl ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-full text-xs"
                        onClick={() => copyLink(c)}
                      >
                        {copiedId === c.id ? (
                          <>
                            <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3.5 w-3.5" /> Copy Link
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onEdit(c)}
                      aria-label={`Edit ${c.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      onClick={() => onDelete(c)}
                      aria-label={`Delete ${c.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
