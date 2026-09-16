"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Library, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
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
import type { AdminBookRow } from "@/lib/admin-types";
import { ADMIN_BOOK_CATEGORIES } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  formatBDT,
  type Tone,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const CATEGORY_TONE: Record<string, Tone> = {
  reading: "blue",
  writing: "emerald",
  speaking: "amber",
  listening: "sky",
  vocabulary: "muted",
  mock: "red",
};

const CATEGORY_LABEL: Record<string, string> = {
  reading: "Reading · রিডিং",
  writing: "Writing · রাইটিং",
  speaking: "Speaking · স্পিকিং",
  listening: "Listening · লিসেনিং",
  vocabulary: "Vocabulary · ভোকাবুলারি",
  mock: "Mock · মক",
};

type BookForm = {
  slug: string;
  title: string;
  titleBn: string;
  author: string;
  desc: string;
  price: string;
  oldPrice: string;
  category: string;
  cover: string;
  tag: string;
  pages: string;
  highlights: string; // one per line
  listed: boolean;
};

function emptyForm(): BookForm {
  return {
    slug: "",
    title: "",
    titleBn: "",
    author: "Sadia Rahman",
    desc: "",
    price: "",
    oldPrice: "",
    category: "reading",
    cover: "",
    tag: "",
    pages: "0",
    highlights: "",
    listed: true,
  };
}

function toForm(b: AdminBookRow): BookForm {
  return {
    slug: b.slug,
    title: b.title,
    titleBn: b.titleBn,
    author: b.author,
    desc: b.desc,
    price: String(b.price),
    oldPrice: b.oldPrice === null ? "" : String(b.oldPrice),
    category: b.category,
    cover: b.cover,
    tag: b.tag ?? "",
    pages: String(b.pages),
    highlights: b.highlights.join("\n"),
    listed: b.listed,
  };
}

function numOrNull(value: string): number | null {
  const t = value.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Admin Books — the Shop Books catalog. Cover thumbs, price/listed chips and
 * an instant listed-toggle; add/edit dialog picks a cover from
 * /images/books via `coverOptions`.
 */
export function AdminBooks() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const readOnly = role === "teacher";

  const [books, setBooks] = useState<AdminBookRow[] | null>(null);
  const [coverOptions, setCoverOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBookRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBookRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/books", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; books?: AdminBookRow[]; coverOptions?: string[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.books) {
        setBooks(data.books);
        setCoverOptions(data.coverOptions ?? []);
      } else {
        setError(data?.error ?? "বই লোড করা যায়নি।");
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

  const filtered = useMemo(() => {
    const list = books ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.titleBn.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q)
    );
  }, [books, query]);

  const counts = useMemo(() => {
    const list = books ?? [];
    return {
      total: list.length,
      listed: list.filter((b) => b.listed).length,
      unlisted: list.filter((b) => !b.listed).length,
    };
  }, [books]);

  async function toggleListed(book: AdminBookRow, listed: boolean) {
    if (!token || readOnly) return;
    setBusyId(book.id);
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ listed }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; book?: AdminBookRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.book) {
        setBooks((prev) =>
          prev ? prev.map((b) => (b.id === data.book!.id ? data.book! : b)) : prev
        );
        toast.success(
          listed
            ? `${book.title} লিস্ট করা হয়েছে।`
            : `${book.title} ডিলিস্ট করা হয়েছে।`
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
      const res = await fetch(`/api/admin/books/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.title} মুছে ফেলা হয়েছে। (Book deleted.)`);
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
        title="Shop Books — বই"
        sub="বুক শপের ক্যাটালগ — দাম, কভার ও লিস্টিং ম্যানেজ করুন"
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
            Add Book — নতুন বই
          </Button>
        ) : null}
      </SectionHeading>

      {readOnly ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন — বই শুধু দেখা যাবে, বদলানো যাবে না। (Read-only view.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Library} label="Total — মোট" value={counts.total} tone="blue" />
        <StatCard
          icon={Library}
          label="Listed — লিস্টেড"
          sub="shop-এ দেখা যাচ্ছে"
          value={counts.listed}
          tone="emerald"
        />
        <StatCard
          icon={Library}
          label="Unlisted — লুকানো"
          value={counts.unlisted}
          tone="amber"
        />
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
          placeholder="বই খুঁজুন — নাম, লেখক বা slug"
          aria-label="Search books"
          className="min-h-11 rounded-xl border-border bg-card pl-10"
        />
      </div>

      {loading && !books ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {books && !loading ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={Library}
            title={query ? "কিছু পাওয়া যায়নি" : "এখনো কোনো বই নেই"}
            hint={
              query
                ? "অন্য নাম বা লেখক দিয়ে খুঁজে দেখুন।"
                : "Add Book বাটন থেকে প্রথম বইটি যোগ করুন।"
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex gap-3">
                  <span className="relative shrink-0">
                    <Image
                      src={b.cover}
                      alt={`Cover — ${b.title}`}
                      width={64}
                      height={80}
                      className="h-20 w-16 rounded-lg border border-border object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold text-foreground">{b.title}</p>
                    {b.titleBn ? (
                      <p className="truncate text-xs text-muted-foreground">{b.titleBn}</p>
                    ) : null}
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.author}</p>
                    <div className="mt-1.5">
                      <ToneBadge tone={CATEGORY_TONE[b.category] ?? "muted"}>
                        {CATEGORY_LABEL[b.category] ?? b.category}
                      </ToneBadge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="font-bold text-foreground">
                    {formatBDT(b.price)}
                    {b.oldPrice !== null ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">
                        {formatBDT(b.oldPrice)}
                      </span>
                    ) : null}
                  </span>
                  {b.pages > 0 ? (
                    <span className="text-xs text-muted-foreground">{b.pages} pages</span>
                  ) : null}
                  {b.tag ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {b.tag}
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch
                      checked={b.listed}
                      disabled={readOnly || busyId === b.id}
                      onCheckedChange={(v) => void toggleListed(b, v)}
                      aria-label={`List ${b.title}`}
                    />
                    {b.listed ? "Listed · দেখাচ্ছে" : "Unlisted · লুকানো"}
                  </label>
                  {!readOnly ? (
                    <span className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full border-border bg-card"
                        onClick={() => {
                          setEditing(b);
                          setDialogOpen(true);
                        }}
                        aria-label={`Edit ${b.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        onClick={() => setDeleteTarget(b)}
                        aria-label={`Delete ${b.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <BookDialog
        open={dialogOpen}
        editing={editing}
        coverOptions={coverOptions}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>বইটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} — বুক শপ থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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

function BookDialog({
  open,
  editing,
  coverOptions,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminBookRow | null;
  coverOptions: string[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editing ? toForm(editing) : emptyForm());
  }, [open, editing]);

  function setField<K extends keyof BookForm>(key: K, value: BookForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Current cover may not exist in the pick-list — keep it selectable anyway.
  const coverChoices = useMemo(() => {
    const set = new Set(coverOptions);
    if (editing && !set.has(editing.cover)) set.add(editing.cover);
    if (form.cover && !set.has(form.cover)) set.add(form.cover);
    return Array.from(set);
  }, [coverOptions, editing, form.cover]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (form.title.trim().length < 3) {
      toast.error("বইয়ের নাম দিন।");
      return;
    }
    if (!/^[a-z0-9-]{2,80}$/.test(form.slug.trim())) {
      toast.error("স্লাগে ছোট হাতের a-z, 0-9 ও ড্যাশ (-) ব্যবহার করুন।");
      return;
    }
    const price = numOrNull(form.price);
    if (price === null || price < 0) {
      toast.error("দাম ০ বা তার বেশি হতে হবে।");
      return;
    }
    if (!/^\/images\/.+\.(png|jpg|jpeg|webp)$/i.test(form.cover.trim())) {
      toast.error("কভারটি /images/-এর একটি ছবি হতে হবে।");
      return;
    }

    setSaving(true);
    try {
      const body = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        titleBn: form.titleBn.trim(),
        author: form.author.trim() || "Sadia Rahman",
        desc: form.desc.trim(),
        price,
        oldPrice: numOrNull(form.oldPrice),
        category: form.category,
        cover: form.cover.trim(),
        tag: form.tag.trim() || null,
        pages: Math.max(0, numOrNull(form.pages) ?? 0),
        highlights: toLines(form.highlights).slice(0, 8),
        listed: form.listed,
      };
      const res = await fetch(editing ? `/api/admin/books/${editing.id}` : "/api/admin/books", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; book?: AdminBookRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing ? "বই আপডেট হয়েছে। (Book updated.)" : "নতুন বই যোগ হয়েছে। (Book added.)"
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
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit — ${editing.title}` : "Add Book — নতুন বই যোগ করুন"}</DialogTitle>
          <DialogDescription>বুক শপের কার্ড ও ডিটেইলস এখান থেকেই আসে।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="book-title">Title · নাম *</Label>
              <Input
                id="book-title"
                required
                maxLength={160}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="IELTS Writing Handbook"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-slug">Slug · লিংক *</Label>
              <Input
                id="book-slug"
                required
                maxLength={80}
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="ielts-writing-handbook"
                className={`${inputCls} font-mono text-sm`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-titlebn">Title (BN) · বাংলা নাম</Label>
              <Input
                id="book-titlebn"
                maxLength={160}
                value={form.titleBn}
                onChange={(e) => setField("titleBn", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-author">Author · লেখক</Label>
              <Input
                id="book-author"
                maxLength={80}
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="book-desc">Description · বিবরণ</Label>
              <Textarea
                id="book-desc"
                rows={3}
                maxLength={1200}
                value={form.desc}
                onChange={(e) => setField("desc", e.target.value)}
                placeholder="বইটি কাদের জন্য, কী আছে — সংক্ষেপে"
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-price">Price (৳) *</Label>
              <Input
                id="book-price"
                type="number"
                min={0}
                step={1}
                required
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="450"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-oldprice">Old price (৳)</Label>
              <Input
                id="book-oldprice"
                type="number"
                min={0}
                step={1}
                value={form.oldPrice}
                onChange={(e) => setField("oldPrice", e.target.value)}
                placeholder="খালি = নেই"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-category">Category · ক্যাটাগরি *</Label>
              <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                <SelectTrigger id="book-category" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_BOOK_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {CATEGORY_LABEL[c.value] ?? c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-cover">Cover · কভার *</Label>
              <Select value={form.cover} onValueChange={(v) => setField("cover", v)}>
                <SelectTrigger id="book-cover" className={inputCls}>
                  <SelectValue placeholder="কভার বাছুন" />
                </SelectTrigger>
                <SelectContent>
                  {coverChoices.map((path) => (
                    <SelectItem key={path} value={path} className="font-mono text-xs">
                      {path.replace("/images/books/", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-tag">Tag · ট্যাগ</Label>
              <Input
                id="book-tag"
                maxLength={40}
                value={form.tag}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder="Bestseller (খালি = নেই)"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-pages">Pages · পৃষ্ঠা</Label>
              <Input
                id="book-pages"
                type="number"
                min={0}
                max={5000}
                value={form.pages}
                onChange={(e) => setField("pages", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="book-highlights">Highlights — প্রতি লাইনে একটি</Label>
              <Textarea
                id="book-highlights"
                rows={4}
                value={form.highlights}
                onChange={(e) => setField("highlights", e.target.value)}
                placeholder={"৫০+ সলভড প্যাসেজ\nBand 7+ টিপস"}
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.listed}
              onCheckedChange={(v) => setField("listed", v)}
              aria-label="Listed"
            />
            Listed — বুক শপে দেখা যাবে
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
              {saving ? "Saving…" : editing ? "Save — সেভ" : "Add Book — যোগ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
