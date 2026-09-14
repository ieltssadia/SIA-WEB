"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Check, Copy, Trash2 } from "lucide-react";
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
import type { AdminCertificate } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  dateInputToDisplay,
  formatDate,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";
import { courses } from "@/lib/site-data";

type IssueForm = {
  customId: string;
  name: string;
  course: string;
  batch: string;
  band: string;
  issued: string; // date input value (YYYY-MM-DD)
};

const emptyIssue: IssueForm = {
  customId: "",
  name: "",
  course: "",
  batch: "",
  band: "",
  issued: "",
};

/**
 * Admin Certificates — issue (auto "SIE-CERT-XXXX" ID when absent), list with
 * copy-ID and delete. Holders verify publicly at #/verify.
 */
export function AdminCertificates() {
  const token = useAdminStore((s) => s.token);

  const [certs, setCerts] = useState<AdminCertificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<IssueForm>(emptyIssue);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCertificate | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/certificates", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; certificates?: AdminCertificate[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.certificates) setCerts(data.certificates);
      else setError(data?.error ?? "সার্টিফিকেট লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function setField<K extends keyof IssueForm>(key: K, value: IssueForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function issue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!form.issued) {
      toast.error("ইস্যুর তারিখ দিন। (Pick the issue date.)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({
          id: form.customId.trim(),
          name: form.name,
          course: form.course,
          batch: form.batch,
          band: form.band,
          issued: dateInputToDisplay(form.issued),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; certificate?: AdminCertificate; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(`Issued ${data.certificate?.id ?? "certificate"}`);
        setForm(emptyIssue);
        void load();
      } else {
        toast.error(data?.error ?? "ইস্যু করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  function copyId(cert: AdminCertificate) {
    if (!navigator.clipboard?.writeText) {
      toast.error("কপি করা যায়নি — ম্যানুয়ালি করুন।");
      return;
    }
    navigator.clipboard
      .writeText(cert.id)
      .then(() => {
        setCopiedId(cert.id);
        toast.success(`${cert.id} copied`);
        window.setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => toast.error("কপি করা যায়নি।"));
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/certificates/${encodeURIComponent(target.id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        toast.success(`${target.id} deleted`);
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
        title="Certificates — সার্টিফিকেট"
        sub="কোর্স সম্পন্নকারীদের ভেরিফায়েবল সার্টিফিকেট ইস্যু করুন — যাচাই হয় #/verify পেজে"
      />

      {/* Issue form */}
      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={issue} className="space-y-4">
            <h3 className="font-semibold text-foreground">Issue a certificate — নতুন সার্টিফিকেট</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cert-name">Student name · নাম *</Label>
                <Input
                  id="cert-name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="আফসানা মিমি"
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-course">Course · কোর্স *</Label>
                <Select value={form.course} onValueChange={(v) => setField("course", v)}>
                  <SelectTrigger id="cert-course" className="min-h-11 rounded-xl border-border bg-muted/40">
                    <SelectValue placeholder="কোর্স বাছুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.slug} value={c.title}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-batch">Batch · ব্যাচ *</Label>
                <Input
                  id="cert-batch"
                  required
                  maxLength={60}
                  value={form.batch}
                  onChange={(e) => setField("batch", e.target.value)}
                  placeholder="Batch 317"
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-band">Overall band · ব্যান্ড *</Label>
                <Input
                  id="cert-band"
                  required
                  inputMode="decimal"
                  pattern="\d(\.\d)?"
                  title="যেমন 7.5 বা 8"
                  maxLength={4}
                  value={form.band}
                  onChange={(e) => setField("band", e.target.value)}
                  placeholder="7.5"
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-issued">Issued · ইস্যুর তারিখ *</Label>
                <Input
                  id="cert-issued"
                  type="date"
                  required
                  value={form.issued}
                  onChange={(e) => setField("issued", e.target.value)}
                  className="min-h-11 rounded-xl border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-id">Custom ID (optional) · আইডি</Label>
                <Input
                  id="cert-id"
                  maxLength={40}
                  value={form.customId}
                  onChange={(e) => setField("customId", e.target.value)}
                  placeholder="SIE-CERT-2417 (খালি রাখলে auto)"
                  className="min-h-11 rounded-xl border-border bg-muted/40 font-mono text-sm"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
            >
              <Award className="h-4 w-4" aria-hidden="true" />
              {saving ? "Issuing…" : "Issue certificate · ইস্যু করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && !certs ? (
        <div className="grid gap-3 md:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {certs && !loading ? (
        certs.length === 0 ? (
          <EmptyState
            icon={Award}
            title="এখনো কোনো সার্টিফিকেট ইস্যু হয়নি"
            hint="উপরের ফর্ম থেকে প্রথমটি ইস্যু করুন — ID খালি রাখলে auto হবে।"
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-primary">{c.id}</p>
                  <p className="truncate font-semibold text-foreground">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.course} · {c.batch} · Band {c.band} · {c.issued}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-border bg-card"
                    onClick={() => copyId(c)}
                    aria-label={`Copy ID ${c.id}`}
                  >
                    {copiedId === c.id ? (
                      <Check className="h-4 w-4 text-[#28694d]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => setDeleteTarget(c)}
                    aria-label={`Delete certificate ${c.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>সার্টিফিকেট মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `${deleteTarget.id} — ${deleteTarget.name}` : ""} — মুছলে এটি আর
              verify করা যাবে না। এটি ফেরানো যাবে না।
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
