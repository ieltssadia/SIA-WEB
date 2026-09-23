"use client";

import { useMemo, useState } from "react";
import { CircleHelp, Eye, EyeOff, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
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
import type { AdminFaqRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
} from "@/components/site/admin/admin-shared";
import { apiSend, useContentRows } from "@/components/site/admin/admin-content-hooks";

/** FAQ — home page accordion + course detail pages (CMS-managed). */
export function AdminFaq() {
  const { token, rows, setRows, loading, error, reload } = useContentRows<AdminFaqRow>("faqs");

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFaqRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFaqRow | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    question: "",
    answer: "",
    sortOrder: "0",
    published: true,
  });

  const filtered = useMemo(() => {
    const list = rows ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [rows, query]);

  function openCreate() {
    setEditing(null);
    setForm({
      question: "",
      answer: "",
      sortOrder: String((rows ?? []).length),
      published: true,
    });
    setDialogOpen(true);
  }

  function openEdit(faq: AdminFaqRow) {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: String(faq.sortOrder),
      published: faq.published,
    });
    setDialogOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (form.question.trim().length < 4) {
      toast.error("প্রশ্নটি লিখুন (কমপক্ষে ৪ অক্ষর)।");
      return;
    }
    if (form.answer.trim().length < 4) {
      toast.error("উত্তরটি লিখুন (কমপক্ষে ৪ অক্ষর)।");
      return;
    }
    setBusy(true);
    const body = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      published: form.published,
    };
    const res = editing
      ? await apiSend<{ row: AdminFaqRow }>(
          `/api/admin/content/faqs/${editing.id}`,
          token,
          "PATCH",
          body
        )
      : await apiSend<{ row: AdminFaqRow }>("/api/admin/content/faqs", token, "POST", body);
    setBusy(false);
    if (res.ok && res.data?.row) {
      const row = res.data.row;
      setRows((prev) =>
        prev
          ? editing
            ? prev.map((f) => (f.id === row.id ? row : f))
            : [row, ...prev]
          : prev
      );
      toast.success(editing ? "প্রশ্নোত্তর আপডেট হয়েছে।" : "নতুন প্রশ্নোত্তর যোগ হয়েছে।");
      setDialogOpen(false);
    } else {
      toast.error(res.error ?? "সেভ করা যায়নি।");
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const res = await apiSend(`/api/admin/content/faqs/${target.id}`, token, "DELETE");
    if (res.ok) {
      toast.success("প্রশ্নোত্তরটি মুছে ফেলা হয়েছে।");
      void reload();
    } else {
      toast.error(res.error ?? "মুছে ফেলা যায়নি।");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="FAQ: প্রশ্নোত্তর"
        sub="হোম পেজের FAQ অ্যাকর্ডিয়ন ও কোর্স পেজ"
      >
        <Button
          type="button"
          onClick={openCreate}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Add FAQ: নতুন প্রশ্ন
        </Button>
      </SectionHeading>

      <StatCard
        icon={CircleHelp}
        label="Total: মোট প্রশ্ন"
        value={(rows ?? []).length}
        tone="blue"
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="প্রশ্ন খুঁজুন…"
          aria-label="Search FAQs"
          className="min-h-11 rounded-xl border-border bg-card pl-10"
        />
      </div>

      {loading && !rows ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CircleHelp}
          title="কোনো প্রশ্নোত্তর নেই"
          hint="Add FAQ বাটনে ক্লিক করে প্রথম প্রশ্নটি যোগ করুন।"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <span className="text-[10px] font-bold text-muted-foreground">#{faq.sortOrder}</span>
                  {faq.question}
                  {!faq.published ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      লুকানো
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl border-border bg-card"
                onClick={() => openEdit(faq)}
                aria-label="সম্পাদনা করুন"
              >
                {faq.published ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setDeleteTarget(faq)}
                aria-label="মুছে ফেলুন"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "প্রশ্নোত্তর সম্পাদনা" : "নতুন প্রশ্নোত্তর"}</DialogTitle>
            <DialogDescription>
              <Eye className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              প্রশ্ন ও উত্তর বাংলায় লিখুন, সাইটে সঙ্গে সঙ্গে দেখা যাবে।
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="faq-q">প্রশ্ন · Question</Label>
              <Input
                id="faq-q"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                required
                className="min-h-11 rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-a">উত্তর · Answer</Label>
              <Textarea
                id="faq-a"
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                rows={4}
                required
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="w-32 space-y-1.5">
                <Label htmlFor="faq-order">সিরিয়াল</Label>
                <Input
                  id="faq-order"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm font-medium text-foreground">
                {form.published ? (
                  <Eye className="h-4 w-4 text-primary" aria-hidden />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden />
                )}
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                  aria-label="প্রকাশিত"
                />
                {form.published ? "প্রকাশিত" : "লুকানো"}
              </label>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="min-h-11 rounded-full border-border bg-card"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="min-h-11 rounded-full bg-ink text-white hover:bg-ink/90"
              >
                {busy ? "সেভ হচ্ছে…" : "Save: সেভ করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>প্রশ্নোত্তরটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.question}” সাইট থেকেও সরে যাবে। এটি ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 rounded-full border-border bg-card">
              থাকুক
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="min-h-11 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
