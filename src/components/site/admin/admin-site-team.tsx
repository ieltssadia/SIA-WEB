"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IdCard, Loader2, Pencil, PlusCircle, Search, Trash2, Upload } from "lucide-react";
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
import type { AdminSiteTeamRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  uploadAdminFile,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

/** Pastel chip classes the public #/team page already styles. */
const CHIP_PRESETS = [
  "bg-pastel-butter text-[#7a5a16]",
  "bg-pastel-green text-[#1f5c40]",
  "bg-pastel-sky text-[#2c4f8a]",
  "bg-pastel-amethyst text-[#4b3a7a]",
  "bg-pastel-ruby text-[#7a2a35]",
  "bg-pastel-orange text-[#7a4a16]",
];

type TeamForm = {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  photo: string; // /uploads/team/... or /images/... — filled by upload
  chip: string;
  bio: string; // one paragraph per line
  specialties: string; // one per line
  credentials: string; // one per line
  stats: string; // "value | label" per line, max 4
  quote: string;
  published: boolean;
};

function emptyForm(): TeamForm {
  return {
    slug: "",
    name: "",
    role: "",
    tagline: "",
    photo: "",
    chip: "bg-pastel-sky text-[#2c4f8a]",
    bio: "",
    specialties: "",
    credentials: "",
    stats: "",
    quote: "",
    published: true,
  };
}

function toForm(m: AdminSiteTeamRow): TeamForm {
  return {
    slug: m.slug,
    name: m.name,
    role: m.role,
    tagline: m.tagline,
    photo: m.photo,
    chip: m.chip || "bg-pastel-sky text-[#2c4f8a]",
    bio: m.bio.join("\n"),
    specialties: m.specialties.join("\n"),
    credentials: m.credentials.join("\n"),
    stats: m.stats.map((s) => `${s.value} | ${s.label}`).join("\n"),
    quote: m.quote,
    published: m.published,
  };
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "9+ | Years teaching" per line → {value,label}[] (max 4, both halves needed). */
function toStats(value: string): { value: string; label: string }[] {
  return value
    .split("\n")
    .map((line) => line.split("|"))
    .map((parts) => ({ value: (parts[0] ?? "").trim(), label: (parts[1] ?? "").trim() }))
    .filter((s) => s.value && s.label)
    .slice(0, 4);
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Admin Site Team — the PUBLIC #/team page members (instructors/coaches shown
 * on the website). This is NOT the "Team" section that manages admin login
 * accounts. Writes are owner/admin; photos upload through /api/admin/upload.
 */
export function AdminSiteTeam() {
  const token = useAdminStore((s) => s.token);
  const role = useAdminStore((s) => s.user?.role);
  const canManage = role === "owner" || role === "admin";

  const [members, setMembers] = useState<AdminSiteTeamRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSiteTeamRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSiteTeamRow | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-team", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; members?: AdminSiteTeamRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.members) setMembers(data.members);
      else setError(data?.error ?? "টিম সদস্য লোড করা যায়নি।");
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
    const list = members ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
    );
  }, [members, query]);

  const counts = useMemo(() => {
    const list = members ?? [];
    return {
      total: list.length,
      published: list.filter((m) => m.published).length,
      hidden: list.filter((m) => !m.published).length,
    };
  }, [members]);

  async function togglePublished(member: AdminSiteTeamRow, published: boolean) {
    if (!token || !canManage) return;
    setBusyId(member.id);
    // Optimistic swap — the row flips instantly, server confirms after.
    setMembers((prev) =>
      prev ? prev.map((m) => (m.id === member.id ? { ...m, published } : m)) : prev
    );
    try {
      const res = await fetch(`/api/admin/site-team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ published }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; member?: AdminSiteTeamRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.member) {
        setMembers((prev) =>
          prev ? prev.map((m) => (m.id === data.member!.id ? data.member! : m)) : prev
        );
        toast.success(
          published
            ? `${member.name} পাবলিশ হয়েছে। (Published.)`
            : `${member.name} আনপাবলিশ হয়েছে। (Hidden.)`
        );
      } else {
        setMembers((prev) =>
          prev ? prev.map((m) => (m.id === member.id ? { ...m, published: !published } : m)) : prev
        );
        toast.error(data?.error ?? "আপডেট করা যায়নি।");
      }
    } catch {
      setMembers((prev) =>
        prev ? prev.map((m) => (m.id === member.id ? { ...m, published: !published } : m)) : prev
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
      const res = await fetch(`/api/admin/site-team/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.name} মুছে ফেলা হয়েছে। (Member deleted.)`);
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
        title="Website Team — ওয়েবসাইট টিম"
        sub="ওয়েবসাইটের #/team পেজের সদস্যরা — এটি লগইন অ্যাকাউন্ট নয় (সেটি System → Team)"
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
            Add Member — সদস্য যোগ
          </Button>
        )}
      </SectionHeading>

      {!canManage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          আপনি Teacher রোলে আছেন — টিম সদস্য শুধু দেখা যাবে, বদলানো যাবে না। (Read-only view.)
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={IdCard} label="Total — মোট" value={counts.total} tone="blue" />
        <StatCard
          icon={IdCard}
          label="Published — দেখাচ্ছে"
          value={counts.published}
          tone="emerald"
        />
        <StatCard icon={IdCard} label="Hidden — লুকানো" value={counts.hidden} tone="muted" />
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
          placeholder="সদস্য খুঁজুন — নাম, পদ বা slug"
          aria-label="Search website team members"
          className="min-h-11 rounded-xl border-border bg-card pl-10"
        />
      </div>

      {loading && !members ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {members && !loading ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={IdCard}
            title={query ? "কিছু পাওয়া যায়নি" : "এখনো কোনো সদস্য নেই"}
            hint={
              query
                ? "অন্য নাম দিয়ে খুঁজে দেখুন।"
                : "Add Member বাটন থেকে প্রথম সদস্যকে যোগ করুন — ছবিসহ #/team পেজে দেখা যাবে।"
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((m) => (
              <li key={m.id}>
                <Card className="rounded-2xl border-border bg-card">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    {/* Photo thumb (fallback initials) */}
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={`Photo — ${m.name}`}
                        width={56}
                        height={56}
                        className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary"
                        aria-hidden="true"
                      >
                        {initials(m.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{m.name}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {m.slug}
                        </span>
                      </div>
                      {m.role ? (
                        <p className="truncate text-sm font-medium text-muted-foreground">
                          {m.role}
                        </p>
                      ) : null}
                      {m.tagline ? (
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {m.tagline}
                        </p>
                      ) : null}
                      {m.stats.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {m.stats.slice(0, 3).map((s) => (
                            <ToneBadge key={`${m.id}-${s.label}`} tone="sky" className="text-[10px]">
                              {s.value} {s.label}
                            </ToneBadge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Switch
                          checked={m.published}
                          disabled={!canManage || busyId === m.id}
                          onCheckedChange={(v) => void togglePublished(m, v)}
                          aria-label={`Publish ${m.name}`}
                        />
                        {m.published ? "Published" : "Hidden"}
                      </label>
                      {canManage ? (
                        <span className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-border bg-card"
                            onClick={() => {
                              setEditing(m);
                              setDialogOpen(true);
                            }}
                            aria-label={`Edit ${m.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            onClick={() => setDeleteTarget(m)}
                            aria-label={`Delete ${m.name}`}
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

      <MemberDialog
        open={dialogOpen}
        editing={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>সদস্যকে মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} — ওয়েবসাইটের #/team পেজ থেকেও সরে যাবে। এটি ফেরানো যাবে না।
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
// Add / Edit dialog — every website-profile field, photo via upload
// ---------------------------------------------------------------------------

function MemberDialog({
  open,
  editing,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: AdminSiteTeamRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const token = useAdminStore((s) => s.token);
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setForm(editing ? toForm(editing) : emptyForm());
    // Re-seed whenever the dialog opens.
  }, [open, editing]);

  function setField<K extends keyof TeamForm>(key: K, value: TeamForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    const result = await uploadAdminFile(token, file, "team");
    setUploading(false);
    if (result.ok && result.upload) {
      setForm((f) => ({ ...f, photo: result.upload!.url }));
      toast.success(
        `ছবি আপলোড হয়েছে — ${result.upload.name} (${result.upload.sizeLabel})। (Photo uploaded.)`
      );
    } else {
      toast.error(result.error ?? "ছবি আপলোড করা যায়নি।");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!/^[a-z0-9-]{2,60}$/.test(form.slug.trim())) {
      toast.error("স্লাগে ছোট হাতের a-z, 0-9 ও ড্যাশ (-) ব্যবহার করুন।");
      return;
    }
    if (form.name.trim().length < 2) {
      toast.error("নাম দিন।");
      return;
    }
    if (form.photo.trim() && !form.photo.trim().startsWith("/")) {
      toast.error("ছবির লিংক সাইটের ভেতরের পাথ হতে হবে (যেমন /uploads/team/...)।");
      return;
    }

    setSaving(true);
    try {
      const body = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        role: form.role.trim(),
        tagline: form.tagline.trim(),
        photo: form.photo.trim(),
        chip: form.chip.trim(),
        bio: toLines(form.bio).slice(0, 6),
        specialties: toLines(form.specialties).slice(0, 8),
        credentials: toLines(form.credentials).slice(0, 8),
        stats: toStats(form.stats),
        quote: form.quote.trim(),
        published: form.published,
      };
      const res = await fetch(
        editing ? `/api/admin/site-team/${editing.id}` : "/api/admin/site-team",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": token },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; member?: AdminSiteTeamRow; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          editing
            ? "সদস্য আপডেট হয়েছে। (Member updated.)"
            : "নতুন সদস্য যোগ হয়েছে। (Member added.)"
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
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit — ${editing.name}` : "Add Member — নতুন সদস্য যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            ওয়েবসাইটের #/team পেজের প্রোফাইল — ছবি, পরিচিতি, credentials সব এখান থেকেই আসে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="member-slug">Slug · লিংক *</Label>
              <Input
                id="member-slug"
                required
                maxLength={60}
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="sadia-rahman"
                className={`${inputCls} font-mono text-sm`}
              />
              <p className="text-[11px] text-muted-foreground">
                ছোট হাতের a-z, 0-9 ও ড্যাশ (-) — ইউনিক হতে হবে।
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name · নাম *</Label>
              <Input
                id="member-name"
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Sadia Rahman"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-role">Role · পদ</Label>
              <Input
                id="member-role"
                maxLength={80}
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                placeholder="Founder & Lead IELTS Instructor"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-tagline">Tagline · এক লাইনের পরিচয়</Label>
              <Input
                id="member-tagline"
                maxLength={200}
                value={form.tagline}
                onChange={(e) => setField("tagline", e.target.value)}
                placeholder="Cambridge & IDP certified — ৯ বছরে ৩,০০০+ শিক্ষার্থী"
                className={inputCls}
              />
            </div>
          </div>

          {/* Photo upload + preview */}
          <div className="space-y-1.5">
            <Label htmlFor="member-photo">Photo · ছবি</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.photo ? (
                <Image
                  src={form.photo}
                  alt="Photo preview"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
              ) : (
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  aria-hidden="true"
                >
                  <IdCard className="h-5 w-5" />
                </span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void handleUpload(file);
                }}
              />
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
                {uploading ? "Uploading…" : "Upload photo · আপলোড"}
              </Button>
              <Input
                id="member-photo"
                value={form.photo}
                onChange={(e) => setField("photo", e.target.value)}
                placeholder="/uploads/team/… বা /images/team/…"
                className={`${inputCls} min-w-0 flex-1 font-mono text-xs`}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              আপলোড করলে পাথ নিজেই বসবে — চাইলে হাতেও লিখতে পারেন। খালি রাখলে initials দেখাবে।
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="member-chip">Chip · পিল কালার (Tailwind classes)</Label>
              <Input
                id="member-chip"
                list="member-chip-presets"
                maxLength={80}
                value={form.chip}
                onChange={(e) => setField("chip", e.target.value)}
                placeholder="bg-pastel-sky text-[#2c4f8a]"
                className={`${inputCls} font-mono text-xs`}
              />
              <datalist id="member-chip-presets">
                {CHIP_PRESETS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="text-[11px] text-muted-foreground">
                specialties পিলের রঙ — প্রিসেট থেকে বাছুন।
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-quote">Quote · উক্তি</Label>
              <Input
                id="member-quote"
                maxLength={300}
                value={form.quote}
                onChange={(e) => setField("quote", e.target.value)}
                placeholder="সঠিক গাইডলাইন থাকলে Band 7+ শহর-মহল্লা দেখে না।"
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-bio">Bio — প্রতি লাইনে একটি প্যারাগ্রাফ</Label>
            <Textarea
              id="member-bio"
              rows={4}
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              placeholder={"২০১৬ সালে ছোট রুম দিয়ে শুরু…\nনিজের Band 8.5, Reading-এ 9.0…"}
              className="rounded-xl border-border bg-muted/40"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="member-specialties">Specialties — প্রতি লাইনে একটি</Label>
              <Textarea
                id="member-specialties"
                rows={3}
                value={form.specialties}
                onChange={(e) => setField("specialties", e.target.value)}
                placeholder={"Writing Task 2\nSpeaking Fluency"}
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-credentials">Credentials — প্রতি লাইনে একটি</Label>
              <Textarea
                id="member-credentials"
                rows={3}
                value={form.credentials}
                onChange={(e) => setField("credentials", e.target.value)}
                placeholder={"IELTS Band 8.5\nTKT Certified (Cambridge)"}
                className="rounded-xl border-border bg-muted/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-stats">Stats — প্রতি লাইনে একটি: value | label (সর্বোচ্চ ৪টি)</Label>
            <Textarea
              id="member-stats"
              rows={3}
              value={form.stats}
              onChange={(e) => setField("stats", e.target.value)}
              placeholder={"9+ | Years teaching\n3,000+ | Students mentored\n8.5 | Personal band"}
              className="rounded-xl border-border bg-muted/40"
            />
            <p className="text-[11px] text-muted-foreground">
              ফরম্যাট: <span className="font-mono">value | label</span> — যেমন{" "}
              <span className="font-mono">9+ | Years teaching</span>।
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setField("published", v)}
              aria-label="Published"
            />
            Published — #/team পেজে দেখা যাবে
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
