"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminMediaRow } from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
} from "@/components/site/admin/admin-shared";
import { apiGet, apiSend } from "@/components/site/admin/admin-content-hooks";
import { useAdminStore } from "@/lib/admin-store";

function sizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${bytes} B`;
}

/** Media Library — upload images/documents, copy URLs, delete. */
export function AdminMedia() {
  const token = useAdminStore((s) => s.token);
  const [media, setMedia] = useState<AdminMediaRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminMediaRow | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await apiGet<{ media: AdminMediaRow[] }>("/api/admin/media", token);
    if (res.ok && res.data) setMedia(res.data.media);
    else setError(res.error ?? "লোড করা যায়নি।");
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // Run once per section mount.
  }, [token]);

  async function upload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-key": token },
        body: form,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; media?: AdminMediaRow; error?: string }
        | null;
      if (res.ok && data?.ok && data.media) {
        toast.success("আপলোড হয়েছে।");
        setMedia((prev) => [data.media!, ...(prev ?? [])]);
      } else {
        toast.error(data?.error ?? "আপলোড করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      toast.success("লিংক কপি হয়েছে।");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("কপি করা যায়নি।");
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const res = await apiSend(`/api/admin/media/${target.id}`, token, "DELETE");
    if (res.ok) {
      toast.success(`${target.filename} মুছে ফেলা হয়েছে।`);
      setMedia((prev) => (prev ? prev.filter((m) => m.id !== target.id) : prev));
    } else {
      toast.error(res.error ?? "মুছে ফেলা যায়নি।");
    }
  }

  const images = (media ?? []).filter((m) => m.kind === "image");
  const files = (media ?? []).filter((m) => m.kind !== "image");

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Media Library: মিডিয়া"
        sub="ছবি ও ফাইল আপলোড করুন, লিংক কপি করে যেকোনো জায়গায় ব্যবহার করুন"
      >
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
          )}
          Upload: আপলোড
        </Button>
      </SectionHeading>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={UploadCloud} label="Images: ছবি" value={images.length} tone="blue" />
        <StatCard icon={FileText} label="Files: ফাইল" value={files.length} tone="emerald" />
      </div>

      {loading && !media ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (media ?? []).length === 0 ? (
        <EmptyState
          icon={UploadCloud}
          title="লাইব্রেরি খালি"
          hint="Upload বাটনে ক্লিক করে প্রথম ফাইলটি আপলোড করুন (সর্বোচ্চ ১০ MB)।"
        />
      ) : (
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pb-1 sm:grid-cols-3 lg:grid-cols-4">
          {(media ?? []).map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-square bg-muted">
                {item.kind === "image" ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground" aria-hidden />
                    <span className="line-clamp-2 text-[11px] text-muted-foreground">
                      {item.filename}
                    </span>
                  </span>
                )}
              </div>
              <div className="space-y-1.5 p-2.5">
                <p className="truncate text-xs font-medium text-foreground" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-[10px] text-muted-foreground">{sizeLabel(item.size)}</p>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-border bg-card"
                    onClick={() => void copyUrl(item.url)}
                    aria-label="লিংক কপি করুন"
                  >
                    {copied === item.url ? (
                      <Check className="h-3.5 w-3.5 text-[#225941]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="মুছে ফেলুন"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ফাইলটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.filename}” সার্ভার থেকেও মুছে যাবে, যেসব জায়গায় এটি ব্যবহৃত সেখানে
              ভাঙা লিংক হতে পারে।
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
