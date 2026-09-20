"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, FolderDown, Loader2, Pencil, PlusCircle, Trash2, Upload } from "lucide-react";
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
import type { AdminFileOption, AdminResourceRow } from "@/lib/admin-types";
import { ADMIN_RESOURCE_CATEGORIES } from "@/lib/admin-types";
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

const CATEGORY_TONE: Record<string, Tone> = {
  writing: "blue",
  speaking: "emerald",
  vocabulary: "amber",
  "mock-tools": "sky",
};

const CATEGORY_LABEL: Record<string, string> = {
  writing: "Writing · রাইটিং",
  speaking: "Speaking · স্পিকিং",
  vocabulary: "Vocabulary · ভোকাবুলারি",
  "mock-tools": "Mock Tools · মক টুলস",
};

const RESOURCE_TYPES = ["PDF", "ZIP", "DOCX", "IMG"] as const;

const NONE_FILE = "__none__";

type ResourceForm = {
  title: string;
  desc: string;
  category: string;
  type: string;
  pickedHref: string; // value from the /downloads pick-list (or NONE_FILE)
  customHref: string; // overrides pickedHref when filled
  size: string;
  published: boolean;
};

function emptyForm(): ResourceForm {
  return {
    title: "",
    desc: "",
    category: "writing",
    type: "PDF",
    pickedHref: NONE_FILE,
    customHref: "",
    size: "",
    published: true,
  };
}

function toForm(r: AdminResourceRow, files: AdminFileOption[]): ResourceForm {
  const match = files.find((f) => f.href === r.href);
  return {
    title: r.title,
    desc: r.desc,
    category: r.category,
    type: RESOURCE_TYPES.includes(r.type as (typeof RESOURCE_TYPES)[number]) ? r.type : "PDF",
    pickedHref: match ? match.href : NONE_FILE,
    customHref: match ? "" : r.href,
    size: r.size,
    published: r.published,
  };
}

/** Upload ext → resource type chip (pdf→PDF, docx→DOCX, png→IMG, …). */
function typeFromExt(ext: string, fallback: string): string {
  const e = ext.toLowerCase();
  if (e === "pdf") return "PDF";
  if (e === "zip") return "ZIP";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv"].includes(e)) return "DOCX";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(e)) return "IMG";
  return fallback;
}

/**
 * Admin Resources — portal downloadable materials. Publish toggle patches
 * instantly; the dialog picks a file from /public/downloads, uploads a new
 * one through /api/admin/upload, or falls back to a custom internal link.
 */
export function AdminResources() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const readOnly = role === "teacher";

  const [resources, setResources] = useState<AdminResourceRow[] | null>(null);
  const [files, setFiles] = useState<AdminFileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminResourceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminResourceRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [resRes, filesRes] = await Promise.all([
        fetch("/api/admin/resources", { headers: { "x-admin-key": token } }),
        fetch("/api/admin/resource-files", { headers: { "x-admin-key": token } })
          .then((r) => r.json().catch(() => null))
          .catch(() => null),
      ]);
      const data = (await resRes.json().catch(() => null)) as
        | { ok?: boolean; resources?: AdminResourceRow[]; error?: string }
        | null;
      if (resRes.ok && data?.ok && data.resources) {
        setResources(data.resources);
      } else {
        setError(data?.error ?? "রিসোর্স লোড করা যায়নি।");
      }
      const filesData = filesRes as
        | { ok?: boolean; files?: AdminFileOption[] }
        | null;
      if (filesData?.ok && filesData.files) setFiles(filesData.files);
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
    const list = resources ?? [];
    return {
      total: list.length,
      published: list.filter((r) => r.published).length,
      hidden: list.filter((r) => !r.published).length,
    };
  }, [resources]);

  async function togglePublished(resource: AdminResourceRow, published: boolean) {
    if (!token || readOnly) return;
    setBusyId(resource.id);
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; resource?: AdminResourceRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.resource) {
        setResources((prev) =>
          prev ? prev.map((r) => (r.id === data.resource!.id ? data.resource! : r)) : prev
        );
        toast.success(
          published
            ? `${resource.title} পাবলিশ হয়েছে। (Published.)`
            : `${resource.title} আনপাবলিশ হয়েছে। (Hidden.)`
        );
      } else {
        toast.error(data?.error ?? "আপডেট করা যায়নি।");
      }
    } catch {
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
      const res = await fetch(`/api/admin/resources/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে। (Resource deleted.)`);
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
        title="Resources — রিসোর্স"
        sub="পোর্টালের ডাউনলোড কর্নারের ফাইল — PDF, ZIP, DOCX ম্যানেজ করুন"
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
            Add Resource — নতুন ফাইল
          </Button>
        ) : null}
      </SectionHeading>

      {readOnly ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন — রিসোর্স শুধু দেখা যাবে, বদলানো যাবে না। (Read-only view.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={FolderDown} label="Total — মোট" value={counts.total} tone="sky" />
        <StatCard
          icon={FileText}
          label="Published — দেখাচ্ছে"
          value={counts.published}
          tone="emerald"
        />
        <StatCard icon={FileText} label="Hidden — লুকানো" value={counts.hidden} tone="amber" />
      </div>

      {loading && !resources ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {resources && !loading ? (
        resources.length === 0 ? (
          <EmptyState
            icon={FolderDown}
            title="এখনো কোনো রিসোর্স নেই"
            hint="Add Resource বাটন থেকে প্রথম ফাইলটি যোগ করুন — /downloads ফোল্ডারের ফাইল পিক করা যায়।"
          />
        ) : (
          <ul className="space-y-3">
            {resources.map((r) => (
              <li key={r.id}>
                <Card className="rounded-2xl border-border bg-card">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
                      aria-hidden="true"
                    >
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{r.title}</p>
                        <ToneBadge tone={CATEGORY_TONE[r.category] ?? "muted"}>
                          {CATEGORY_LABEL[r.category] ?? r.category}
                        </ToneBadge>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {r.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{r.size}</span>
                      </div>
                      {r.desc ? (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{r.desc}</p>
                      ) : null}
                      <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                        {r.href}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Switch
                          checked={r.published}
                          disabled={readOnly || busyId === r.id}
                          onCheckedChange={(v) => void togglePublished(r, v)}
                          aria-label={`Publish ${r.title}`}
                        />
                        {r.published ? "Published" : "Hidden"}
                      </label>
                      {!readOnly ? (
                        <span className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-border bg-card"
                            onClick={() => {
                              setEditing(r);
                              setDialogOpen(true);
                            }}
                            aria-label={`Edit ${r.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            onClick={() => setDeleteTarget(r)}
                            aria-label={`Delete ${r.title}`}
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
        )
      ) : null}

      <ResourceDialog
        open={dialogOpen}
        editing={editing}
        files={files}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>রিসোর্সটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} — পোর্টালের ডাউনলোড কর্নার থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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
// Add / Edit dialog — file pick-list + custom link override
// ---------------------------------------------------------------------------

function ResourceDialog({
  open,
  editing,
  files,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminResourceRow | null;
  files: AdminFileOption[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ url: string; name: string; sizeLabel: string } | null>(
    null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(editing ? toForm(editing, files) : emptyForm());
      setUploaded(null);
    }
    // Re-seed whenever the dialog opens (files list may have refreshed).
  }, [open, editing, files]);

  function setField<K extends keyof ResourceForm>(key: K, value: ResourceForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function pickFile(href: string) {
    if (href === NONE_FILE) {
      setForm((f) => ({ ...f, pickedHref: NONE_FILE }));
      return;
    }
    const file = files.find((f) => f.href === href);
    setForm((f) => ({
      ...f,
      pickedHref: href,
      size: file?.size ?? f.size,
      customHref: "", // the explicit pick wins over a stale custom link
    }));
    setUploaded(null);
  }

  /** Upload a fresh file — the returned URL fills href (custom wins), plus
   * auto-fills the size label and the type chip from the extension. */
  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    const result = await uploadAdminFile(token, file, "resources");
    setUploading(false);
    if (result.ok && result.upload) {
      const up = result.upload;
      setUploaded({ url: up.url, name: up.name, sizeLabel: up.sizeLabel });
      setForm((f) => ({
        ...f,
        customHref: up.url, // custom wins over the pick-list
        pickedHref: NONE_FILE,
        size: up.sizeLabel,
        type: typeFromExt(up.ext, f.type),
      }));
      toast.success(
        `ফাইল আপলোড হয়েছে — ${up.name} (${up.sizeLabel})। সেভ করলে পোর্টালে যুক্ত হবে。`
      );
    } else {
      toast.error(result.error ?? "ফাইল আপলোড করা যায়নি।");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (form.title.trim().length < 3) {
      toast.error("রিসোর্সের নাম দিন।");
      return;
    }
    const href = form.customHref.trim() || (form.pickedHref !== NONE_FILE ? form.pickedHref : "");
    if (!href) {
      toast.error("ফাইল পিক করুন বা কাস্টম লিংক দিন।");
      return;
    }
    if (!href.startsWith("/")) {
      toast.error("লিংকটি সাইটের ভেতরের পাথ হতে হবে (যেমন /downloads/file.pdf)।");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        desc: form.desc.trim(),
        category: form.category,
        type: form.type,
        href,
        size: form.size.trim(),
        published: form.published,
      };
      const res = await fetch(
        editing ? `/api/admin/resources/${editing.id}` : "/api/admin/resources",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; resource?: AdminResourceRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing
            ? "রিসোর্স আপডেট হয়েছে। (Resource updated.)"
            : "নতুন রিসোর্স যোগ হয়েছে। (Resource added.)"
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
            {editing ? `Edit — ${editing.title}` : "Add Resource — নতুন ফাইল যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            ফাইলটি পোর্টালের ডাউনলোড কর্নারে শিক্ষার্থীরা ডাউনলোড করতে পাবে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">Title · নাম *</Label>
            <Input
              id="res-title"
              required
              maxLength={140}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Speaking Cue Card Bank"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-desc">Description · বিবরণ</Label>
            <Textarea
              id="res-desc"
              rows={2}
              maxLength={400}
              value={form.desc}
              onChange={(e) => setField("desc", e.target.value)}
              placeholder="২৪টি টপিকের কিউ কার্ড — প্রিন্ট করে প্র্যাকটিস করুন"
              className="rounded-xl border-border bg-muted/40"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="res-category">Category · ক্যাটাগরি *</Label>
              <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                <SelectTrigger id="res-category" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_RESOURCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {CATEGORY_LABEL[c.value] ?? c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-type">Type · ধরন *</Label>
              <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                <SelectTrigger id="res-type" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="res-file">File · ফাইল (public/downloads)</Label>
            <Select value={form.pickedHref} onValueChange={pickFile}>
              <SelectTrigger id="res-file" className={inputCls}>
                <SelectValue placeholder="ফাইল বাছুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_FILE}>— কোনো ফাইল না —</SelectItem>
                {files.map((f) => (
                  <SelectItem key={f.href} value={f.href} className="font-mono text-xs">
                    {`${f.name} (${f.size})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fresh upload — fills href + size + type automatically */}
          <div className="space-y-1.5 rounded-xl border border-dashed border-border bg-muted/30 p-3">
            <Label>অথবা নতুন ফাইল আপলোড করুন</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,image/png,image/jpeg,image/webp,image/gif"
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
                {uploading ? "Uploading…" : "Upload file · আপলোড"}
              </Button>
              {uploaded ? (
                <span className="flex min-w-0 flex-wrap items-center gap-1.5">
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
            ) : (
              <p className="text-[11px] text-muted-foreground">
                আপলোড করলে লিংক, size আর type নিজে থেকেই বসে যাবে।
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="res-custom">অথবা কাস্টম লিংক</Label>
              <Input
                id="res-custom"
                value={form.customHref}
                onChange={(e) => setField("customHref", e.target.value)}
                placeholder="/downloads/custom-file.pdf"
                className={`${inputCls} font-mono text-sm`}
              />
              <p className="text-[11px] text-muted-foreground">
                লিখলে উপরের পিক-লিস্টের বদলে এটাই ব্যবহার হবে।
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-size">Size · সাইজ</Label>
              <Input
                id="res-size"
                maxLength={20}
                value={form.size}
                onChange={(e) => setField("size", e.target.value)}
                placeholder="10 KB"
                className={inputCls}
              />
              <p className="text-[11px] text-muted-foreground">ফাইল পিক করলে অটো-ফিল হয়।</p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setField("published", v)}
              aria-label="Published"
            />
            Published — পোর্টালে দেখা যাবে
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
