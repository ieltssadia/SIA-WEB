"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Award,
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
  Trash2,
  X,
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
  uploadAdminFile,
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
 *
 * Certificate FILES are never generated — the team uploads the real signed
 * document (PDF/image) via /api/admin/upload (folder=certificates) and it is
 * attached to the issued certificate for the portal download button.
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

  // Issue-form certificate file upload (the signed document itself)
  const [issueFile, setIssueFile] = useState<{ url: string; name: string; sizeLabel: string } | null>(
    null
  );
  const [issueUploading, setIssueUploading] = useState(false);
  const issueFileRef = useRef<HTMLInputElement>(null);

  // Per-row attach/clear (PATCH fileUrl)
  const [attachTarget, setAttachTarget] = useState<AdminCertificate | null>(null);
  const [attachBusyId, setAttachBusyId] = useState<string | null>(null);
  const attachRef = useRef<HTMLInputElement>(null);

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
          ...(issueFile?.url ? { fileUrl: issueFile.url } : {}),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; certificate?: AdminCertificate; error?: string }
        | null;
      if (res.ok && data?.ok) {
        toast.success(`Issued ${data.certificate?.id ?? "certificate"}`);
        setForm(emptyIssue);
        setIssueFile(null);
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

  /** Upload the signed document and attach it to an issued certificate. */
  async function handleAttach(file: File) {
    if (!token || !attachTarget) return;
    const cert = attachTarget;
    setAttachBusyId(cert.id);
    const result = await uploadAdminFile(token, file, "certificates");
    if (!result.ok || !result.upload) {
      setAttachBusyId(null);
      toast.error(result.error ?? "ফাইল আপলোড করা যায়নি।");
      return;
    }
    try {
      const res = await fetch(`/api/admin/certificates/${encodeURIComponent(cert.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ fileUrl: result.upload.url }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && data?.ok) {
        setCerts((prev) =>
          prev
            ? prev.map((c) =>
                c.id === cert.id ? { ...c, fileUrl: result.upload!.url } : c
              )
            : prev
        );
        toast.success(
          `${cert.id} — সার্টিফিকেট ফাইল যুক্ত হয়েছে (${result.upload.sizeLabel})। (File attached.)`
        );
      } else {
        toast.error(data?.error ?? "ফাইল যুক্ত করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setAttachBusyId(null);
    }
  }

  /** Detach the certificate file (PATCH fileUrl: "") — re-attachable anytime. */
  async function clearFile(cert: AdminCertificate) {
    if (!token) return;
    setAttachBusyId(cert.id);
    try {
      const res = await fetch(`/api/admin/certificates/${encodeURIComponent(cert.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ fileUrl: "" }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && data?.ok) {
        setCerts((prev) =>
          prev ? prev.map((c) => (c.id === cert.id ? { ...c, fileUrl: null } : c)) : prev
        );
        toast.success(`${cert.id} — ফাইল সরানো হয়েছে। (File detached.)`);
      } else {
        toast.error(data?.error ?? "সরানো যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setAttachBusyId(null);
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

            {/* Signed certificate file — uploaded, NEVER generated */}
            <div className="space-y-1.5 rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <Label>সার্টিফিকেট ফাইল (optional)</Label>
              <input
                ref={issueFileRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file || !token) return;
                  setIssueUploading(true);
                  uploadAdminFile(token, file, "certificates").then((result) => {
                    setIssueUploading(false);
                    if (result.ok && result.upload) {
                      setIssueFile({
                        url: result.upload.url,
                        name: result.upload.name,
                        sizeLabel: result.upload.sizeLabel,
                      });
                      toast.success(
                        `ফাইল আপলোড হয়েছে — ${result.upload.name} (${result.upload.sizeLabel})।`
                      );
                    } else {
                      toast.error(result.error ?? "ফাইল আপলোড করা যায়নি।");
                    }
                  });
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={issueUploading}
                  onClick={() => issueFileRef.current?.click()}
                  className="min-h-11 rounded-full border-border bg-card"
                >
                  {issueUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                  )}
                  {issueUploading ? "Uploading…" : "Upload file · ফাইল বাছুন"}
                </Button>
                {issueFile ? (
                  <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {issueFile.sizeLabel}
                    </span>
                    <span className="max-w-56 truncate text-xs text-muted-foreground">
                      {issueFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-border bg-card"
                      onClick={() => setIssueFile(null)}
                      aria-label="আপলোড করা ফাইল বাদ দিন"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground">
                স্বাক্ষরিত সার্টিফিকেট ফাইল আপলোড করুন (PDF/ছবি) — সিস্টেম নিজে সার্টিফিকেট তৈরি
                করে না। পোর্টালে শিক্ষার্থী ডাউনলোড বাটন পাবে।
              </p>
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
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {/* Attach / replace the signed certificate file */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={attachBusyId === c.id}
                    className="h-10 w-10 rounded-full border-border bg-card"
                    onClick={() => {
                      setAttachTarget(c);
                      attachRef.current?.click();
                    }}
                    aria-label={c.fileUrl ? `Replace file ${c.id}` : `Attach file ${c.id}`}
                  >
                    {attachBusyId === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>
                  {c.fileUrl ? (
                    <>
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
                        aria-label={`Download file ${c.id}`}
                      >
                        {c.fileUrl.toLowerCase().endsWith(".pdf") ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={attachBusyId === c.id}
                        className="h-10 w-10 rounded-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        onClick={() => void clearFile(c)}
                        aria-label={`Detach file ${c.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : null}
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

      {/* Shared hidden input — attach a signed file to the selected row */}
      <input
        ref={attachRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleAttach(file);
          setAttachTarget(null);
        }}
      />

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
