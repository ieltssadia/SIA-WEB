"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, PlusCircle, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRole, AdminTeamMember } from "@/lib/admin-types";
import { ADMIN_ROLES, ROLE_LABEL } from "@/lib/admin-types";
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

const ROLE_TONE: Record<AdminRole, Tone> = {
  owner: "amber",
  admin: "blue",
  teacher: "emerald",
};

type MemberForm = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

const emptyForm: MemberForm = { name: "", email: "", password: "", role: "teacher" };

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
 * Admin Team — owner-only member management (server 403s everyone else).
 * Add/edit members, toggle active/disabled, delete — with the server's
 * guard rails (no self role/status change, last active owner protected)
 * surfaced as verbatim Bengali toasts.
 */
export function AdminTeam() {
  const token = useAdminStore((s) => s.token);
  const me = useAdminStore((s) => s.user);

  const [members, setMembers] = useState<AdminTeamMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTeamMember | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTeamMember | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; members?: AdminTeamMember[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.members) setMembers(data.members);
      else setError(data?.error ?? "টিম লোড করা যায়নি।");
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
    const list = members ?? [];
    return {
      total: list.length,
      owners: list.filter((m) => m.role === "owner").length,
      admins: list.filter((m) => m.role === "admin").length,
      teachers: list.filter((m) => m.role === "teacher").length,
    };
  }, [members]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(member: AdminTeamMember) {
    setEditing(member);
    setForm({ name: member.name, email: member.email, password: "", role: member.role });
    setDialogOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (form.name.trim().length < 2) {
      toast.error("নাম লিখুন।");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("সঠিক ইমেইল দিন।");
      return;
    }
    if (!editing && form.password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (editing && form.password && form.password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    setSaving(true);
    try {
      const isNew = !editing;
      const res = await fetch(isNew ? "/api/admin/team" : `/api/admin/team/${editing?.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify(
          isNew
            ? {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
              }
            : {
                name: form.name.trim(),
                email: form.email.trim(),
                // Never echo an unchanged role — the server blocks ANY role
                // change on your own row, even a no-op self-patch.
                ...(form.role === editing.role ? {} : { role: form.role }),
                ...(form.password ? { password: form.password } : {}),
              }
        ),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; member?: AdminTeamMember; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          isNew
            ? `${data.member?.name ?? "সদস্য"} যোগ হয়েছে। (Member added.)`
            : `${data.member?.name ?? "সদস্য"} আপডেট হয়েছে। (Member updated.)`
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

  async function toggleStatus(member: AdminTeamMember) {
    if (!token) return;
    const next = member.status === "active" ? "disabled" : "active";
    setBusyId(member.id);
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; member?: AdminTeamMember; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(
          next === "active"
            ? `${member.name} সক্রিয় করা হয়েছে। (Enabled.)`
            : `${member.name} নিষ্ক্রিয় করা হয়েছে। (Disabled.)`
        );
        void load();
      } else {
        toast.error(data?.error ?? "স্ট্যাটাস বদলানো যায়নি।");
      }
    } catch {
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
      const res = await fetch(`/api/admin/team/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.name} ডিলিট হয়েছে। (Member deleted.)`);
        void load();
      } else {
        toast.error(data?.error ?? "ডিলিট করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    }
  }

  const isSelf = (member: AdminTeamMember) => !!me && member.id === me.id;

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Team: টিম"
        sub="অ্যাডমিন প্যানেলের সদস্য ও রোল ম্যানেজ করুন, শুধু Owner-এর জন্য"
      >
        <Button
          type="button"
          onClick={openAdd}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Add Member: নতুন সদস্য
        </Button>
      </SectionHeading>

      {/* Role stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Total: মোট" value={counts.total} tone="blue" />
        <StatCard icon={ShieldCheck} label="Owners: মালিক" value={counts.owners} tone="amber" />
        <StatCard icon={UserRound} label="Admins: অ্যাডমিন" value={counts.admins} tone="emerald" />
        <StatCard icon={UserRound} label="Teachers: শিক্ষক" value={counts.teachers} tone="sky" />
      </div>

      {loading && !members ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {members && !loading ? (
        members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="কোনো সদস্য নেই"
            hint="Add Member বাটন থেকে প্রথম সদস্য যোগ করুন।"
          />
        ) : (
          <>
            {/* Desktop table */}
            <Card className="hidden overflow-hidden rounded-2xl border-border bg-card md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Member: সদস্য</TableHead>
                      <TableHead>Role: রোল</TableHead>
                      <TableHead>Status: স্ট্যাটাস</TableHead>
                      <TableHead>Joined: যোগদান</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                              aria-hidden="true"
                            >
                              {initials(m.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {m.name}
                                {isSelf(m) ? (
                                  <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    (আপনি)
                                  </span>
                                ) : null}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ToneBadge tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role]}</ToneBadge>
                        </TableCell>
                        <TableCell>
                          {m.status === "active" ? (
                            <ToneBadge tone="emerald">Active · সক্রিয়</ToneBadge>
                          ) : (
                            <ToneBadge tone="red">Disabled · নিষ্ক্রিয়</ToneBadge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(m.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-border bg-card"
                              onClick={() => openEdit(m)}
                              aria-label={`Edit ${m.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {isSelf(m) ? null : (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={busyId === m.id}
                                  className="min-h-9 rounded-full border-border bg-card px-3 text-xs"
                                  onClick={() => void toggleStatus(m)}
                                >
                                  {m.status === "active" ? "Disable" : "Enable"}
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
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {members.map((m) => (
                <li key={m.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                      aria-hidden="true"
                    >
                      {initials(m.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {m.name}
                        {isSelf(m) ? (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            (আপনি)
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <ToneBadge tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role]}</ToneBadge>
                        {m.status === "active" ? (
                          <ToneBadge tone="emerald">Active · সক্রিয়</ToneBadge>
                        ) : (
                          <ToneBadge tone="red">Disabled · নিষ্ক্রিয়</ToneBadge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-border bg-card"
                      onClick={() => openEdit(m)}
                      aria-label={`Edit ${m.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {isSelf(m) ? null : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyId === m.id}
                          className="min-h-10 rounded-full border-border bg-card px-3 text-xs"
                          onClick={() => void toggleStatus(m)}
                        >
                          {m.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          onClick={() => setDeleteTarget(m)}
                          aria-label={`Delete ${m.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )
      ) : null}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.name}: এডিট` : "Add Member: নতুন সদস্য"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "তথ্য হালনাগাদ করুন, পাসওয়ার্ড না দিলে পুরোনোটাই থাকবে।"
                : "নতুন সদস্য লগ ইন করে প্যানেলে ঢুকবে, রোল অনুযায়ী সেকশন দেখা যাবে।"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Name · নাম *</Label>
              <Input
                id="team-name"
                required
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="সদস্যের নাম"
                className="min-h-11 rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-email">Email · ইমেইল *</Label>
              <Input
                id="team-email"
                type="email"
                required
                maxLength={120}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="member@team.com"
                autoComplete="off"
                className="min-h-11 rounded-xl border-border bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-role">Role · রোল *</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as AdminRole }))}
                disabled={!!editing && isSelf(editing)}
              >
                <SelectTrigger id="team-role" className="min-h-11 rounded-xl border-border bg-muted/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editing && isSelf(editing) ? (
                <p className="text-[11px] text-muted-foreground">
                  নিজের রোল বদলানো যাবে না, অন্য একজন Owner দিয়ে করান।
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-password">
                {editing ? "New password · নতুন পাসওয়ার্ড (optional)" : "Password · পাসওয়ার্ড *"}
              </Label>
              <Input
                id="team-password"
                type="text"
                required={!editing}
                minLength={editing ? undefined : 6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editing ? "খালি রাখলে অপরিবর্তিত" : "কমপক্ষে ৬ অক্ষর"}
                autoComplete="new-password"
                className="min-h-11 rounded-xl border-border bg-muted/40 font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                {editing ? "লিখলে সেট হবে, কমপক্ষে ৬ অক্ষর।" : "সদস্য এই পাসওয়ার্ড দিয়ে লগ ইন করবে।"}
              </p>
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
                {saving ? "Saving…" : editing ? "Save: সেভ" : "Add: যোগ করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>সদস্য ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `${deleteTarget.name} (${deleteTarget.email})` : ""}, ডিলিট হলে এই
              অ্যাকাউন্ট দিয়ে আর লগ ইন করা যাবে না। এটি ফেরানো যাবে না।
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
