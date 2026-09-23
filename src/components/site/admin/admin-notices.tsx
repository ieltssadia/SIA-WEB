"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, Pencil, PlusCircle, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { AdminNoticeRow } from "@/lib/admin-types";
import { ADMIN_NOTICE_TAGS } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  ToneBadge,
  formatDate,
  toDateInputValue,
  type Tone,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const TAG_TONE: Record<string, Tone> = {
  Notice: "blue",
  "Class Update": "emerald",
  "Mock Test": "amber",
  "Speaking Club": "sky",
};

type NoticeForm = {
  date: string; // YYYY-MM-DD (input value)
  tag: string;
  title: string;
  body: string;
};

function emptyForm(): NoticeForm {
  return { date: "", tag: "Notice", title: "", body: "" };
}

/** Notice.date is stored as a display string ("10 Sep") — recover a date
 * input value by assuming the current year; unparseable → today. */
function displayToInput(value: string): string {
  const MONTHS: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})/);
  if (match) {
    const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
    if (month) {
      const today = new Date();
      return `${today.getFullYear()}-${String(month).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    }
  }
  return toDateInputValue(new Date().toISOString());
}

/**
 * Admin Notices — the portal notice board. All roles can post (teachers
 * included); edit/delete are admin/owner only (server 403s teachers).
 */
export function AdminNotices() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const canManage = role === "owner" || role === "admin";

  const [notices, setNotices] = useState<AdminNoticeRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminNoticeRow | null>(null);
  const [form, setForm] = useState<NoticeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminNoticeRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notices", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; notices?: AdminNoticeRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.notices) setNotices(data.notices);
      else setError(data?.error ?? "নোটিশ লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(notice: AdminNoticeRow) {
    setEditing(notice);
    setForm({
      date: displayToInput(notice.date),
      tag: notice.tag,
      title: notice.title,
      body: notice.body,
    });
    setDialogOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!form.date) {
      toast.error("তারিখ দিন (YYYY-MM-DD)।");
      return;
    }
    if (form.title.trim().length < 4) {
      toast.error("নোটিশের শিরোনাম দিন।");
      return;
    }
    if (form.body.trim().length < 4) {
      toast.error("নোটিশের বিবরণ দিন।");
      return;
    }
    setSaving(true);
    try {
      const body = {
        date: form.date,
        tag: form.tag,
        title: form.title.trim(),
        body: form.body.trim(),
      };
      const res = await fetch(
        editing ? `/api/admin/notices/${editing.id}` : "/api/admin/notices",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; notice?: AdminNoticeRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing ? "নোটিশ আপডেট হয়েছে। (Notice updated.)" : "নোটিশ পোস্ট হয়েছে। (Notice posted.)"
        );
        setDialogOpen(false);
        void load();
      } else {
        toast.error(data?.error ?? "সেভ করা যায়নি।");
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
      const res = await fetch(`/api/admin/notices/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে। (Notice deleted.)`);
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
        title="Notices: নোটিশ"
        sub="পোর্টালের নোটিশ বোর্ড, সব রোল পোস্ট করতে পারে, এডিট/ডিলিট admin/owner"
      >
        <Button
          type="button"
          onClick={openAdd}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Add Notice: নোটিশ দিন
        </Button>
      </SectionHeading>

      {loading && !notices ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {notices && !loading ? (
        notices.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="এখনো কোনো নোটিশ নেই"
            hint="Add Notice বাটন থেকে প্রথম নোটিশটি দিন, পোর্টালে সবাই দেখবে।"
          />
        ) : (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id}>
                <Card className="rounded-2xl border-border bg-card">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                    {/* Date block */}
                    <div className="flex w-fit shrink-0 flex-col items-center rounded-xl border border-border bg-muted/40 px-3 py-2 text-center">
                      <span className="text-lg font-bold leading-tight text-foreground">
                        {n.date}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ToneBadge tone={TAG_TONE[n.tag] ?? "muted"}>{n.tag}</ToneBadge>
                        <p className="truncate font-semibold text-foreground">{n.title}</p>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                    </div>
                    {canManage ? (
                      <div className="flex shrink-0 justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full border-border bg-card"
                          onClick={() => openEdit(n)}
                          aria-label={`Edit ${n.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          onClick={() => setDeleteTarget(n)}
                          aria-label={`Delete ${n.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {/* Add / Edit dialog — POST for every role, PATCH admin/owner only */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Notice: এডিট করুন" : "Add Notice: নোটিশ দিন"}
            </DialogTitle>
            <DialogDescription>
              নোটিশটি পোর্টালের Notice Board-এ সব শিক্ষার্থী দেখবে।
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="notice-date">Date · তারিখ *</Label>
                <Input
                  id="notice-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice-tag">Tag · ট্যাগ *</Label>
                <Select
                  value={form.tag}
                  onValueChange={(v) => setForm((f) => ({ ...f, tag: v }))}
                >
                  <SelectTrigger
                    id="notice-tag"
                    className="min-h-11 rounded-xl border-border bg-muted/40"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_NOTICE_TAGS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice-title">Title · শিরোনাম *</Label>
              <Input
                id="notice-title"
                required
                maxLength={160}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="গর্বনমেন্ট ছুটির নোটিশ"
                className="min-h-11 rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice-body">Body · বিবরণ *</Label>
              <Textarea
                id="notice-body"
                rows={4}
                required
                maxLength={1200}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="নোটিশের বিস্তারিত লিখুন…"
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="min-h-11 rounded-full border-border bg-card"
              >
                Cancel · বাতিল
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
              >
                {saving ? "Saving…" : editing ? "Save: সেভ" : "Post: পোস্ট করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>নোটিশটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `${deleteTarget.date}, ${deleteTarget.title}` : ""}, পোর্টাল থেকেও
              সরে যাবে। এটি ফেরানো যাবে না।
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
