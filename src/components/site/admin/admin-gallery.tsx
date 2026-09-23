"use client";

import { useState } from "react";
import { Eye, EyeOff, Images, Pencil, PlusCircle, Trash2 } from "lucide-react";
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
import type { AdminGalleryRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
} from "@/components/site/admin/admin-shared";
import { apiSend, useContentRows } from "@/components/site/admin/admin-content-hooks";
import { MediaPicker } from "@/components/site/admin/admin-media-picker";

/** Photo Gallery — the About page gallery strip (CMS-managed uploads). */
export function AdminGallery() {
  const { token, rows, setRows, loading, error, reload } =
    useContentRows<AdminGalleryRow>("gallery");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    caption: "",
    image: "",
    sortOrder: "0",
    published: true,
  });

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      caption: "",
      image: "",
      sortOrder: String((rows ?? []).length),
      published: true,
    });
    setDialogOpen(true);
  }

  function openEdit(photo: AdminGalleryRow) {
    setEditing(photo);
    setForm({
      title: photo.title,
      caption: photo.caption,
      image: photo.image,
      sortOrder: String(photo.sortOrder),
      published: photo.published,
    });
    setDialogOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!form.image.trim()) {
      toast.error("ছবি আপলোড করুন বা লাইব্রেরি থেকে বেছে নিন।");
      return;
    }
    if (form.title.trim().length < 2) {
      toast.error("ছবির শিরোনাম দিন।");
      return;
    }
    setBusy(true);
    const body = {
      title: form.title.trim(),
      caption: form.caption.trim(),
      image: form.image.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      published: form.published,
    };
    const res = editing
      ? await apiSend<{ row: AdminGalleryRow }>(
          `/api/admin/content/gallery/${editing.id}`,
          token,
          "PATCH",
          body
        )
      : await apiSend<{ row: AdminGalleryRow }>(
          "/api/admin/content/gallery",
          token,
          "POST",
          body
        );
    setBusy(false);
    if (res.ok && res.data?.row) {
      const row = res.data.row;
      setRows((prev) =>
        prev
          ? editing
            ? prev.map((p) => (p.id === row.id ? row : p))
            : [row, ...prev]
          : prev
      );
      toast.success(editing ? "ছবি আপডেট হয়েছে।" : "নতুন ছবি যোগ হয়েছে।");
      setDialogOpen(false);
    } else {
      toast.error(res.error ?? "সেভ করা যায়নি।");
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const res = await apiSend(`/api/admin/content/gallery/${target.id}`, token, "DELETE");
    if (res.ok) {
      toast.success("ছবিটি গ্যালারি থেকে মুছে ফেলা হয়েছে।");
      void reload();
    } else {
      toast.error(res.error ?? "মুছে ফেলা যায়নি।");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Photo Gallery: ফটো গ্যালারি"
        sub="About পেজের গ্যালারি, ক্যাম্পাস ও ক্লাসের ছবি"
      >
        <Button
          type="button"
          onClick={openCreate}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Add Photo: নতুন ছবি
        </Button>
      </SectionHeading>

      <StatCard icon={Images} label="Photos: মোট ছবি" value={(rows ?? []).length} tone="blue" />

      {loading && !rows ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : (rows ?? []).length === 0 ? (
        <EmptyState
          icon={Images}
          title="গ্যালারি খালি"
          hint="Add Photo বাটনে ক্লিক করে প্রথম ছবিটি যোগ করুন।"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(rows ?? []).map((photo) => (
            <div
              key={photo.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                {photo.image ? (
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {!photo.published ? (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <EyeOff className="h-3 w-3" aria-hidden /> লুকানো
                  </span>
                ) : null}
              </div>
              <div className="flex items-start gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{photo.title}</p>
                  {photo.caption ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{photo.caption}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl border-border bg-card"
                  onClick={() => openEdit(photo)}
                  aria-label={`${photo.title} সম্পাদনা করুন`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(photo)}
                  aria-label={`${photo.title} মুছে ফেলুন`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "ছবি সম্পাদনা" : "নতুন ছবি"}</DialogTitle>
            <DialogDescription>
              <Eye className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              ছবি আপলোড করুন বা লাইব্রেরি থেকে বেছে নিন, About পেজে দেখা যাবে।
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <MediaPicker
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              label="ছবি · Image"
            />
            <div className="space-y-1.5">
              <Label htmlFor="g-title">শিরোনাম · Title</Label>
              <Input
                id="g-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="min-h-11 rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-caption">ক্যাপশন (ঐচ্ছিক)</Label>
              <Textarea
                id="g-caption"
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                rows={2}
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="w-32 space-y-1.5">
                <Label htmlFor="g-order">সিরিয়াল</Label>
                <Input
                  id="g-order"
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
            <AlertDialogTitle>ছবিটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” গ্যালারি থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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
