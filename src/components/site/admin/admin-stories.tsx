"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  FileCheck,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Trophy,
  Upload,
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
import { Badge } from "@/components/ui/badge";
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
import type { AdminSuccessStoryRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  uploadAdminFile,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

type StoryForm = {
  name: string;
  band: string;
  tag: string;
  caption: string;
  details: string;
  image: string;
  course: string;
  serial: string;
  published: boolean;
};

function emptyForm(): StoryForm {
  return {
    name: "",
    band: "Band 8.0",
    tag: "Overall Band 8.0",
    caption: "Certificate of Appreciation · Sadia's IELTS",
    details: "Listening 8.5 · Reading 8.5 · Speaking 7.5 · Writing 7.0",
    image: "",
    course: "IELTS Preparation",
    serial: "0",
    published: true,
  };
}

function toForm(s: AdminSuccessStoryRow): StoryForm {
  return {
    name: s.name,
    band: s.band,
    tag: s.tag,
    caption: s.caption,
    details: s.details,
    image: s.image,
    course: s.course,
    serial: String(s.serial),
    published: s.published,
  };
}

export function AdminStories() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const readOnly = role === "teacher";

  const [stories, setStories] = useState<AdminSuccessStoryRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSuccessStoryRow | null>(null);
  const [deleting, setDeleting] = useState<AdminSuccessStoryRow | null>(null);

  const fetchStories = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stories", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; stories?: AdminSuccessStoryRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && Array.isArray(data.stories)) {
        setStories(data.stories);
      } else {
        setError(data?.error ?? "সফলতার গল্প লোড করা যায়নি।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchStories();
  }, [fetchStories]);

  async function togglePublish(story: AdminSuccessStoryRow, next: boolean) {
    if (!token || readOnly) return;
    setStories((prev) =>
      prev ? prev.map((s) => (s.id === story.id ? { ...s, published: next } : s)) : prev
    );
    try {
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "পাবলিশ করা হয়েছে।" : "হাইড করা হয়েছে।");
    } catch {
      toast.error("স্ট্যাটাস পরিবর্তন করা যায়নি।");
      setStories((prev) =>
        prev ? prev.map((s) => (s.id === story.id ? { ...s, published: !next } : s)) : prev
      );
    }
  }

  async function deleteStory() {
    if (!deleting || !token || readOnly) return;
    const target = deleting;
    try {
      const res = await fetch(`/api/admin/stories/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      if (res.ok) {
        toast.success("সফলতার কার্ড মুছে ফেলা হয়েছে।");
        setStories((prev) => (prev ? prev.filter((s) => s.id !== target.id) : prev));
        setDeleting(null);
      } else {
        toast.error("মুছে ফেলা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    }
  }

  const filtered = useMemo(() => {
    if (!stories) return [];
    const q = query.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.band.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q) ||
        s.caption.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
    );
  }, [stories, query]);

  const stats = useMemo(() => {
    const list = stories ?? [];
    return {
      total: list.length,
      published: list.filter((s) => s.published).length,
      hidden: list.filter((s) => !s.published).length,
    };
  }, [stories]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <SectionHeading
        title="Success Stories &amp; Scorecards · সাফল্য ও স্কোরকার্ড"
        subtitle="ওয়েবসাইটের হোমপেজ ও স্টোরিজ সেকশনে প্রদর্শিত ব্যান্ড স্কোরকার্ড ও শিক্ষার্থীর সাফল্যের ছবি।"
        action={
          !readOnly ? (
            <Button
              type="button"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              className="gap-2 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" />
              নতুন সাফল্য যোগ করুন
            </Button>
          ) : undefined
        }
      />

      {/* Stat chips */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Stories · মোট কার্ড" value={stats.total} icon={Trophy} />
        <StatCard label="Published · লাইভ প্রদর্শিত" value={stats.published} icon={FileCheck} />
        <StatCard label="Hidden · লুকানো" value={stats.hidden} icon={FileCheck} />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="শিক্ষার্থী, ব্যান্ড বা ক্যাপশন খুঁজুন..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-11 rounded-xl border-border bg-card pl-9 text-sm"
        />
      </div>

      {/* Grid or list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStories} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো সফলতার কার্ড পাওয়া যায়নি"
          description={
            query
              ? "খুঁজে কোনো মিল মেলেনি। অন্য শব্দ দিয়ে চেষ্টা করুন।"
              : "এখনো কোনো সফলতার ছবি বা স্কোরকার্ড যোগ করা হয়নি।"
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`group overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md ${
                item.published ? "border-border bg-card" : "border-border/60 bg-muted/30 opacity-75"
              }`}
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    ছবি নেই
                  </div>
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                />

                {/* Band badge */}
                <div className="absolute left-3 top-3">
                  <Badge className="border-primary/40 bg-brand-gradient font-bold text-white shadow-md text-xs">
                    <Trophy className="mr-1 h-3 w-3" />
                    {item.band}
                  </Badge>
                </div>

                {/* Published toggle */}
                <div className="absolute right-3 top-3">
                  <Switch
                    checked={item.published}
                    disabled={readOnly}
                    onCheckedChange={(val) => togglePublish(item, val)}
                    aria-label="Toggle publish"
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>

                {/* Bottom Overlay text */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                  <p className="font-display text-sm font-bold leading-tight">{item.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#f6ecd4] line-clamp-1">
                    {item.caption}
                  </p>
                  {item.details && (
                    <p className="mt-1 text-[11px] font-medium text-white/80 line-clamp-1">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer actions */}
              <CardContent className="flex items-center justify-between p-3 border-t border-border/70">
                <span className="text-[11px] font-medium text-muted-foreground">
                  সিরিয়াল: #{item.serial}
                </span>
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditing(item);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Add Dialog */}
      <StoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        token={token ?? ""}
        onSaved={fetchStories}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>কার্ডটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name}&quot; এর সফলতার কার্ডটি মুছে ফেলা হবে। এটি হোমপেজ ও স্টোরিজ
              থেকেও সরে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteStory}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete · মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StoryDialog({
  open,
  onOpenChange,
  editing,
  token,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminSuccessStoryRow | null;
  token: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<StoryForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setForm(toForm(editing));
    } else {
      setForm(emptyForm());
    }
  }, [editing, open]);

  function setField<K extends keyof StoryForm>(key: K, value: StoryForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      const res = await uploadAdminFile(token, file, "stories");
      if (res.ok && res.upload) {
        setField("image", res.upload.url);
        toast.success("ছবি সফলভাবে আপলোড হয়েছে!");
      } else {
        toast.error(res.error ?? "ছবি আপলোড করা যায়নি।");
      }
    } catch {
      toast.error("আপলোড ব্যর্থ হয়েছে।");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image.trim()) {
      toast.error("শিক্ষার্থীর ছবি বা সার্টিফিকেট আপলোড করুন।");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        band: form.band.trim(),
        tag: form.tag.trim(),
        caption: form.caption.trim(),
        details: form.details.trim(),
        image: form.image.trim(),
        course: form.course.trim(),
        serial: Math.max(0, Number(form.serial) || 0),
        published: form.published,
      };

      const res = await fetch(
        editing ? `/api/admin/stories/${editing.id}` : "/api/admin/stories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (res.ok && data?.ok) {
        toast.success(editing ? "কার্ড আপডেট হয়েছে।" : "নতুন কার্ড যোগ হয়েছে।");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit: ${editing.name}` : "Add Success Story · নতুন সাফল্য যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            শিক্ষার্থীর নাম, ব্যান্ড স্কোর, ছবি ও সার্টিফিকেট তথ্য দিয়ে কার্ড তৈরি করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="story-name">Student Name · শিক্ষার্থীর নাম *</Label>
              <Input
                id="story-name"
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Halima Akther Juthi"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-band">Band Score · ব্যান্ড স্কোর *</Label>
              <Input
                id="story-band"
                required
                maxLength={40}
                value={form.band}
                onChange={(e) => setField("band", e.target.value)}
                placeholder="Band 8.5"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-tag">Tag / Badge · ট্যাগ</Label>
              <Input
                id="story-tag"
                maxLength={60}
                value={form.tag}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder="Overall Band 8.5"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-caption">Caption · ক্যাপশন</Label>
              <Input
                id="story-caption"
                maxLength={160}
                value={form.caption}
                onChange={(e) => setField("caption", e.target.value)}
                placeholder="Certificate of Appreciation · Sadia's IELTS"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="story-details">Score Breakdown / Details · স্কোর ব্রেকডাউন</Label>
              <Input
                id="story-details"
                maxLength={300}
                value={form.details}
                onChange={(e) => setField("details", e.target.value)}
                placeholder="Listening 8.5 · Reading 9.0 · Speaking 8.0 · Writing 7.5"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-course">Course Name · কোর্স</Label>
              <Input
                id="story-course"
                maxLength={100}
                value={form.course}
                onChange={(e) => setField("course", e.target.value)}
                placeholder="IELTS Advanced Preparation"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-serial">Sort Order · ডিসপ্লে ক্রম</Label>
              <Input
                id="story-serial"
                type="number"
                min={0}
                value={form.serial}
                onChange={(e) => setField("serial", e.target.value)}
                placeholder="1"
                className={inputCls}
              />
            </div>
          </div>

          {/* Photo upload */}
          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="story-image">Student Photo / Certificate · ছবি *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 rounded-lg border-border text-xs"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? "আপলোড হচ্ছে..." : "নতুন ছবি আপলোড করুন"}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Input
                id="story-image"
                required
                value={form.image}
                onChange={(e) => setField("image", e.target.value)}
                placeholder="/images/students/actual-success-1.jpg বা আপলোড করুন"
                className={`${inputCls} flex-1 font-mono text-xs`}
              />

              {form.image && (
                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-xs">
                  <Image
                    src={form.image}
                    alt="Preview"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Published switch */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div>
              <Label htmlFor="story-published" className="text-sm font-semibold">
                Published · ওয়েবসাইটে প্রদর্শন করুন
              </Label>
              <p className="text-xs text-muted-foreground">বন্ধ থাকলে এটি পাবলিক সাইটে লুকানো থাকবে।</p>
            </div>
            <Switch
              id="story-published"
              checked={form.published}
              onCheckedChange={(val) => setField("published", val)}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "সংরক্ষণ হচ্ছে..." : editing ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
