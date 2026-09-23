"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  FileCode2,
  FileText,
  FileUp,
  Link2,
  Loader2,
  Music,
  Pencil,
  PlusCircle,
  Trash2,
  Upload,
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
import type { AdminSuggestionRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  uploadAdminFile,
  type Tone,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const CATEGORIES = [
  "Practice",
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Vocabulary",
] as const;

const CATEGORY_TONE: Record<string, Tone> = {
  Practice: "blue",
  Listening: "emerald",
  Reading: "amber",
  Writing: "sky",
  Speaking: "emerald",
  Vocabulary: "muted",
};

const KINDS = ["html", "pdf", "audio", "video", "link"] as const;

const KIND_LABEL: Record<string, string> = {
  html: "HTML Test",
  pdf: "PDF",
  audio: "Audio · অডিও",
  video: "Video · ভিডিও",
  link: "Link · লিংক",
};

const KIND_TONE: Record<string, Tone> = {
  html: "emerald",
  pdf: "red",
  audio: "amber",
  video: "blue",
  link: "muted",
};

/** Interactive kinds open inline in the portal — show the preview link. */
function isPreviewable(kind: string): boolean {
  return kind === "html" || kind === "pdf";
}

type SuggestionForm = {
  title: string;
  desc: string;
  category: string;
  manualUrl: string; // typed path — wins over an upload when filled
  kind: string; // editable for manual links
  published: boolean;
};

type UploadedFile = { url: string; name: string; sizeLabel: string; kind: string };

function emptyForm(): SuggestionForm {
  return {
    title: "",
    desc: "",
    category: "Practice",
    manualUrl: "",
    kind: "link",
    published: true,
  };
}

/** "Listening Test 27.html" → "Listening Test 27" — title auto-fill seed. */
function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .slice(0, 160);
}

/**
 * Admin Suggestions — THE no-code publishing flow: upload a practice file
 * (HTML test / PDF / audio / video), it auto-publishes and paid students see
 * it in the portal. Writes are admin/owner; teachers get a read-only view.
 */
export function AdminSuggestions() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const canManage = role === "owner" || role === "admin";

  const [suggestions, setSuggestions] = useState<AdminSuggestionRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSuggestionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSuggestionRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/suggestions", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; suggestions?: AdminSuggestionRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.suggestions) setSuggestions(data.suggestions);
      else setError(data?.error ?? "সাজেশন লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const list = suggestions ?? [];
    return {
      total: list.length,
      published: list.filter((s) => s.published).length,
      files: list.filter((s) => s.kind !== "link").length,
    };
  }, [suggestions]);

  async function togglePublished(row: AdminSuggestionRow, published: boolean) {
    if (!token || !canManage) return;
    setBusyId(row.id);
    // Optimistic swap — the row flips instantly, server confirms after.
    setSuggestions((prev) =>
      prev ? prev.map((s) => (s.id === row.id ? { ...s, published } : s)) : prev
    );
    try {
      const res = await fetch(`/api/admin/suggestions/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; suggestion?: AdminSuggestionRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.suggestion) {
        setSuggestions((prev) =>
          prev
            ? prev.map((s) => (s.id === data.suggestion!.id ? data.suggestion! : s))
            : prev
        );
        toast.success(
          published
            ? `${row.title} পাবলিশ হয়েছে। (Published.)`
            : `${row.title} আনপাবলিশ হয়েছে। (Hidden.)`
        );
      } else {
        setSuggestions((prev) =>
          prev ? prev.map((s) => (s.id === row.id ? { ...s, published: !published } : s)) : prev
        );
        toast.error(data?.error ?? "আপডেট করা যায়নি।");
      }
    } catch {
      setSuggestions((prev) =>
        prev ? prev.map((s) => (s.id === row.id ? { ...s, published: !published } : s)) : prev
      );
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
      const res = await fetch(`/api/admin/suggestions/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে। (Suggestion deleted.)`);
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
        title="Suggestions: প্র্যাকটিস ফাইল"
        sub="ফাইল আপলোড করলেই paid শিক্ষার্থীর পোর্টালে চলে যাবে: HTML test, PDF, audio, video"
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
            Upload: ফাইল দিন
          </Button>
        )}
      </SectionHeading>

      {!canManage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন, সাজেশন শুধু দেখা যাবে, বদলানো যাবে না। (Read-only view.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={FileUp} label="Total: মোট" value={counts.total} tone="sky" />
        <StatCard
          icon={FileUp}
          label="Published: দেখাচ্ছে"
          value={counts.published}
          tone="emerald"
        />
        <StatCard
          icon={FileUp}
          label="Files: ফাইল"
          sub="link বাদে"
          value={counts.files}
          tone="amber"
        />
      </div>

      {loading && !suggestions ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {suggestions && !loading ? (
        suggestions.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="এখনো কোনো সাজেশন নেই"
            hint="Upload বাটন থেকে প্রথম প্র্যাকটিস ফাইলটি দিন, paid শিক্ষার্থীরা সাথে সাথে পোর্টালে পাবে।"
          />
        ) : (
          <ul className="space-y-3">
            {suggestions.map((s) => {
              const Icon =
                s.kind === "pdf"
                  ? FileText
                  : s.kind === "html"
                    ? FileCode2
                    : s.kind === "audio"
                      ? Music
                      : s.kind === "video"
                        ? Video
                        : Link2;
              return (
                <li key={s.id}>
                  <Card className="rounded-2xl border-border bg-card">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-foreground">{s.title}</p>
                          <ToneBadge tone={CATEGORY_TONE[s.category] ?? "muted"}>
                            {s.category}
                          </ToneBadge>
                          <ToneBadge tone={KIND_TONE[s.kind] ?? "muted"}>
                            {KIND_LABEL[s.kind] ?? s.kind}
                          </ToneBadge>
                        </div>
                        {s.desc ? (
                          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                            {s.desc}
                          </p>
                        ) : null}
                        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                          {s.fileUrl}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                        {isPreviewable(s.kind) ? (
                          <a
                            href={s.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-primary transition hover:bg-primary/5"
                            aria-label={`পোর্টালে খুলুন: ${s.title}`}
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            পোর্টালে খুলুন
                          </a>
                        ) : null}
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Switch
                            checked={s.published}
                            disabled={!canManage || busyId === s.id}
                            onCheckedChange={(v) => void togglePublished(s, v)}
                            aria-label={`Publish ${s.title}`}
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
                              aria-label={`Edit ${s.title}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              onClick={() => setDeleteTarget(s)}
                              aria-label={`Delete ${s.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </span>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      <SuggestionDialog
        open={dialogOpen}
        editing={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>সাজেশনটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title}, paid শিক্ষার্থীর পোর্টাল থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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
// Add / Edit dialog — upload auto-fills title + kind, or paste an internal link
// ---------------------------------------------------------------------------

function SuggestionDialog({
  open,
  editing,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminSuggestionRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<SuggestionForm>(emptyForm);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            title: editing.title,
            desc: editing.desc,
            category: CATEGORIES.includes(editing.category as (typeof CATEGORIES)[number])
              ? editing.category
              : "Practice",
            // Existing file path seeds the link field — re-upload replaces it.
            manualUrl: editing.fileUrl,
            kind: KINDS.includes(editing.kind as (typeof KINDS)[number])
              ? editing.kind
              : "link",
            published: editing.published,
          }
        : emptyForm()
    );
    setUploaded(null);
    // Re-seed whenever the dialog opens.
  }, [open, editing]);

  function setField<K extends keyof SuggestionForm>(key: K, value: SuggestionForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    const result = await uploadAdminFile(token, file, "suggestions");
    setUploading(false);
    if (result.ok && result.upload) {
      const up = result.upload;
      setUploaded({ url: up.url, name: up.name, sizeLabel: up.sizeLabel, kind: up.kind });
      setForm((f) => ({
        ...f,
        manualUrl: "", // the fresh upload wins
        kind: (KINDS as readonly string[]).includes(up.kind) ? up.kind : f.kind,
        title: f.title.trim() ? f.title : titleFromFilename(up.name),
      }));
      toast.success(
        `ফাইল আপলোড হয়েছে, ${up.name} (${up.sizeLabel})। সেভ করলেই পোর্টালে চলে যাবে।`
      );
    } else {
      toast.error(result.error ?? "ফাইল আপলোড করা যায়নি।");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (form.title.trim().length < 3) {
      toast.error("শিরোনাম দিন।");
      return;
    }
    const manual = form.manualUrl.trim();
    const fileUrl = manual || uploaded?.url || "";
    if (!fileUrl || !fileUrl.startsWith("/")) {
      toast.error("ফাইল আপলোড করুন অথবা সাইটের ভেতরের লিংক দিন (যেমন /uploads/suggestions/…)।");
      return;
    }
    const kind = manual ? form.kind : (uploaded?.kind ?? form.kind);
    if (!(KINDS as readonly string[]).includes(kind)) {
      toast.error("ধরন (kind) ঠিক করুন: html, pdf, audio, video বা link।");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        desc: form.desc.trim(),
        category: form.category,
        fileUrl,
        kind,
        published: form.published,
      };
      const res = await fetch(
        editing ? `/api/admin/suggestions/${editing.id}` : "/api/admin/suggestions",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; suggestion?: AdminSuggestionRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing
            ? "সাজেশন আপডেট হয়েছে। (Suggestion updated.)"
            : "সাজেশন পাবলিশ হয়েছে, পোর্টালে দেখা যাবে। (Published to the portal.)"
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
  const manual = form.manualUrl.trim();
  const effectiveUrl = manual || uploaded?.url || "";
  const effectiveKind = manual ? form.kind : (uploaded?.kind ?? form.kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit: ${editing.title}` : "Upload suggestion: প্র্যাকটিস ফাইল দিন"}
          </DialogTitle>
          <DialogDescription>
            ফাইল আপলোড করে Save করলেই paid শিক্ষার্থীর পোর্টালের Suggestions-এ চলে যাবে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sug-title">Title · শিরোনাম *</Label>
            <Input
              id="sug-title"
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Listening Test 27"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground">
              আপলোড করলে ফাইলের নাম থেকে অটো-ফিল হবে।
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-desc">Description · বিবরণ</Label>
            <Textarea
              id="sug-desc"
              rows={2}
              maxLength={400}
              value={form.desc}
              onChange={(e) => setField("desc", e.target.value)}
              placeholder="৪০টি প্রশ্নের ফুল লিসেনিং টেস্ট, উত্তর যাচাই সহ"
              className="rounded-xl border-border bg-muted/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-category">Category · ক্যাটাগরি *</Label>
            <Select value={form.category} onValueChange={(v) => setField("category", v)}>
              <SelectTrigger id="sug-category" className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File upload — the headline no-code flow */}
          <div className="space-y-1.5 rounded-xl border border-dashed border-border bg-muted/30 p-3">
            <Label>File · ফাইল আপলোড (HTML / PDF / MP3 / MP4)</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".html,.htm,.pdf,.mp3,.mp4"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handleUpload(file);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="min-h-11 rounded-full border-border bg-card"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden="true" />
                )}
                {uploading ? "Uploading…" : "Choose file · ফাইল বাছুন"}
              </Button>
              {uploaded ? (
                <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <ToneBadge tone={KIND_TONE[uploaded.kind] ?? "muted"}>
                    {KIND_LABEL[uploaded.kind] ?? uploaded.kind}
                  </ToneBadge>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {uploaded.sizeLabel}
                  </span>
                  <span className="max-w-52 truncate text-xs text-muted-foreground">
                    {uploaded.name}
                  </span>
                </span>
              ) : null}
            </div>
            {uploaded ? (
              <p className="truncate font-mono text-[11px] text-muted-foreground">{uploaded.url}</p>
            ) : null}
          </div>

          {/* OR manual internal link — kind becomes editable */}
          <div className="space-y-1.5">
            <Label htmlFor="sug-manual">অথবা লিংক (path), যেমন /suggestions/quiz.html</Label>
            <Input
              id="sug-manual"
              value={form.manualUrl}
              onChange={(e) => setField("manualUrl", e.target.value)}
              placeholder="/uploads/suggestions/listening-test-27.html"
              className={`${inputCls} font-mono text-sm`}
            />
            <p className="text-[11px] text-muted-foreground">
              সাইটের ভেতরের পাথ হতে হবে (/ দিয়ে শুরু), লিখলে উপরের আপলোডের বদলে এটাই যাবে।
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-kind">Kind · ধরন</Label>
            <Select
              value={effectiveKind}
              onValueChange={(v) => setField("kind", v)}
              disabled={!manual}
            >
              <SelectTrigger id="sug-kind" className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {KIND_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {manual
                ? "লিংক দেওয়া আছে, ধরন বাছতে পারেন।"
                : "আপলোড থেকে অটো-ডিটেক্ট হয়, ম্যানুয়াল লিংক দিলে এডিট করা যাবে।"}
            </p>
          </div>

          {effectiveUrl ? (
            <p className="truncate rounded-xl bg-muted/50 px-3 py-2 font-mono text-[11px] text-muted-foreground">
              {effectiveUrl}
            </p>
          ) : null}

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setField("published", v)}
              aria-label="Published"
            />
            Published: পোর্টালে দেখা যাবে
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
              {saving ? "Saving…" : editing ? "Save: সেভ" : "Publish: পোর্টালে দিন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
