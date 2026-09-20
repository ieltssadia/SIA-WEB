"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Lightbulb, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminTipRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  formatDate,
  type Tone,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

/** Known icon keys of the public tips section (unknown → Lightbulb fallback). */
const TIP_ICONS = ["lightbulb", "target", "zap", "book"] as const;

/** Datalist seeds — the common IELTS tip buckets, plus whatever exists. */
const DEFAULT_CATEGORIES = [
  "IELTS Reading",
  "IELTS Writing",
  "IELTS Speaking",
  "IELTS Listening",
  "Vocabulary",
  "Grammar",
];

const CATEGORY_TONES: Tone[] = ["blue", "emerald", "amber", "sky", "muted"];

/** Stable tone for any free-string category (known ones pinned first). */
function categoryTone(category: string): Tone {
  const pinned: Record<string, Tone> = {
    "IELTS Reading": "blue",
    "IELTS Writing": "emerald",
    "IELTS Speaking": "amber",
    "IELTS Listening": "sky",
    Vocabulary: "muted",
    Grammar: "blue",
  };
  if (pinned[category]) return pinned[category];
  let hash = 0;
  for (const ch of category) hash = (hash + ch.charCodeAt(0)) % 997;
  return CATEGORY_TONES[hash % CATEGORY_TONES.length];
}

type TipForm = {
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  published: boolean;
};

function emptyForm(): TipForm {
  return {
    title: "",
    excerpt: "",
    category: "IELTS Reading",
    icon: "lightbulb",
    published: true,
  };
}

function toForm(t: AdminTipRow): TipForm {
  return {
    title: t.title,
    excerpt: t.excerpt,
    category: t.category,
    icon: t.icon,
    published: t.published,
  };
}

/**
 * Admin Tips — the free tips cards on the public site (#/tips + homepage).
 * Every role can add a tip; edit/delete/publish stay admin/owner only.
 */
export function AdminTips() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const canManage = role === "owner" || role === "admin";

  const [tips, setTips] = useState<AdminTipRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTipRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTipRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tips", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; tips?: AdminTipRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.tips) setTips(data.tips);
      else setError(data?.error ?? "টিপস লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const list = tips ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.excerpt.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tips, query]);

  const counts = useMemo(() => {
    const list = tips ?? [];
    return {
      total: list.length,
      published: list.filter((t) => t.published).length,
      hidden: list.filter((t) => !t.published).length,
    };
  }, [tips]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    for (const t of tips ?? []) if (t.category.trim()) set.add(t.category.trim());
    return Array.from(set);
  }, [tips]);

  async function togglePublished(tip: AdminTipRow, published: boolean) {
    if (!token || !canManage) return;
    setBusyId(tip.id);
    // Optimistic swap — the row flips instantly, server confirms after.
    setTips((prev) =>
      prev ? prev.map((t) => (t.id === tip.id ? { ...t, published } : t)) : prev
    );
    try {
      const res = await fetch(`/api/admin/tips/${tip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; tip?: AdminTipRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.tip) {
        setTips((prev) =>
          prev ? prev.map((t) => (t.id === data.tip!.id ? data.tip! : t)) : prev
        );
        toast.success(
          published
            ? `${tip.title} পাবলিশ হয়েছে। (Published.)`
            : `${tip.title} আনপাবলিশ হয়েছে। (Hidden.)`
        );
      } else {
        setTips((prev) =>
          prev ? prev.map((t) => (t.id === tip.id ? { ...t, published: !published } : t)) : prev
        );
        toast.error(data?.error ?? "আপডেট করা যায়নি।");
      }
    } catch {
      setTips((prev) =>
        prev ? prev.map((t) => (t.id === tip.id ? { ...t, published: !published } : t)) : prev
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
      const res = await fetch(`/api/admin/tips/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে। (Tip deleted.)`);
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
        title="Free Tips — টিপস"
        sub="হোমপেজ ও #/tips পেজের টিপস কার্ড — সব রোল যোগ করতে পারে, এডিট/ডিলিট admin/owner"
      >
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Add Tip — টিপস দিন
        </Button>
      </SectionHeading>

      {!canManage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন — নতুন টিপস যোগ করা যাবে, তবে এডিট/ডিলিট/পাবলিশ
          admin/owner-এর জন্য। (Existing tips are read-only for you.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Lightbulb} label="Total — মোট" value={counts.total} tone="amber" />
        <StatCard
          icon={Lightbulb}
          label="Published — দেখাচ্ছে"
          value={counts.published}
          tone="emerald"
        />
        <StatCard icon={Lightbulb} label="Hidden — লুকানো" value={counts.hidden} tone="muted" />
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
          placeholder="টিপস খুঁজুন — শিরোনাম, বিবরণ বা ক্যাটাগরি"
          aria-label="Search tips"
          className="min-h-11 rounded-xl border-border bg-card pl-10"
        />
      </div>

      {loading && !tips ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {tips && !loading ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title={query ? "কিছু পাওয়া যায়নি" : "এখনো কোনো টিপস নেই"}
            hint={
              query
                ? "অন্য শব্দ দিয়ে খুঁজে দেখুন।"
                : "Add Tip বাটন থেকে প্রথম টিপসটি দিন — হোমপেজে সবাই দেখবে।"
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((t) => (
              <li key={t.id}>
                <Card className="rounded-2xl border-border bg-card">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"
                      aria-hidden="true"
                    >
                      <Lightbulb className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{t.title}</p>
                        <ToneBadge tone={categoryTone(t.category)}>{t.category}</ToneBadge>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {t.excerpt}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        icon: {t.icon} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Switch
                          checked={t.published}
                          disabled={!canManage || busyId === t.id}
                          onCheckedChange={(v) => void togglePublished(t, v)}
                          aria-label={`Publish ${t.title}`}
                        />
                        {t.published ? "Published" : "Hidden"}
                      </label>
                      {canManage ? (
                        <span className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-border bg-card"
                            onClick={() => {
                              setEditing(t);
                              setDialogOpen(true);
                            }}
                            aria-label={`Edit ${t.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            onClick={() => setDeleteTarget(t)}
                            aria-label={`Delete ${t.title}`}
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

      <TipDialog
        open={dialogOpen}
        editing={editing}
        canManage={canManage}
        categoryOptions={categoryOptions}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>টিপসটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} — হোমপেজ ও #/tips পেজ থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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
// Add / Edit dialog
// ---------------------------------------------------------------------------

function TipDialog({
  open,
  editing,
  canManage,
  categoryOptions,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminTipRow | null;
  canManage: boolean;
  categoryOptions: string[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<TipForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editing ? toForm(editing) : emptyForm());
    // Re-seed whenever the dialog opens.
  }, [open, editing]);

  function setField<K extends keyof TipForm>(key: K, value: TipForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (form.title.trim().length < 4) {
      toast.error("টিপসের শিরোনাম দিন।");
      return;
    }
    if (form.excerpt.trim().length < 4) {
      toast.error("টিপসের বিবরণ দিন।");
      return;
    }
    if (form.category.trim().length < 2) {
      toast.error("ক্যাটাগরি দিন।");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        category: form.category.trim(),
        icon: form.icon.trim() || "lightbulb",
        published: form.published,
      };
      const res = await fetch(editing ? `/api/admin/tips/${editing.id}` : "/api/admin/tips", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; tip?: AdminTipRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing ? "টিপস আপডেট হয়েছে। (Tip updated.)" : "নতুন টিপস যোগ হয়েছে। (Tip added.)"
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
          <DialogTitle>{editing ? `Edit — ${editing.title}` : "Add Tip — টিপস দিন"}</DialogTitle>
          <DialogDescription>
            টিপসটি হোমপেজের Tips সেকশন ও #/tips পেজে শিক্ষার্থীরা দেখবে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tip-title">Title · শিরোনাম *</Label>
            <Input
              id="tip-title"
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Reading-এ সময় কম? প্রথমে Skim করুন"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tip-excerpt">Excerpt · বিবরণ *</Label>
            <Textarea
              id="tip-excerpt"
              rows={3}
              maxLength={800}
              required
              value={form.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
              placeholder="২-৩ লাইনে টিপসটি লিখুন — কী করতে হবে, কেন কাজ করে।"
              className="rounded-xl border-border bg-muted/40"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tip-category">Category · ক্যাটাগরি *</Label>
              <Input
                id="tip-category"
                required
                list="tip-category-options"
                maxLength={40}
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="IELTS Reading"
                className={inputCls}
              />
              <datalist id="tip-category-options">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="text-[11px] text-muted-foreground">
                প্রচলিত ক্যাটাগরি থেকে বাছুন বা নতুন লিখুন।
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tip-icon">Icon · আইকন</Label>
              <Input
                id="tip-icon"
                list="tip-icon-options"
                maxLength={24}
                value={form.icon}
                onChange={(e) => setField("icon", e.target.value)}
                placeholder="lightbulb"
                className={`${inputCls} font-mono text-sm`}
              />
              <datalist id="tip-icon-options">
                {TIP_ICONS.map((i) => (
                  <option key={i} value={i} />
                ))}
              </datalist>
              <p className="text-[11px] text-muted-foreground">
                lightbulb / target / zap / book — না মিললে lightbulb দেখাবে।
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setField("published", v)}
              aria-label="Published"
            />
            Published — সাইটে দেখা যাবে
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
