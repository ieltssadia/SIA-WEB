"use client";

import { useEffect, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { AdminMediaRow } from "@/lib/admin-types";
import { apiGet } from "@/components/site/admin/admin-content-hooks";
import { useAdminStore } from "@/lib/admin-store";

/**
 * MediaPicker — upload a file (POST /api/admin/upload) or pick an existing
 * item from the Media Library (GET /api/admin/media). Returns the media URL
 * (site-internal path like /uploads/…). Used by team photos, gallery, etc.
 */
export function MediaPicker({
  value,
  onChange,
  label = "ছবি",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const token = useAdminStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<AdminMediaRow[] | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    void apiGet<{ media: AdminMediaRow[] }>("/api/admin/media", token).then((res) => {
      if (res.ok && res.data) setMedia(res.data.media);
    });
  }, [open, token]);

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
        onChange(data.media.url);
        setMedia((prev) => (prev ? [data.media!, ...prev] : prev));
      } else {
        toast.error(data?.error ?? "আপলোড করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/… বা /images/…"
            aria-label={`${label} URL`}
            className="min-h-11 rounded-xl border-border bg-muted/40"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                  e.target.value = "";
                }}
              />
              <span
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/90"
                role="button"
                aria-label="নতুন ছবি আপলোড করুন"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <UploadCloud className="h-4 w-4" aria-hidden />
                )}
                Upload: আপলোড
              </span>
            </label>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 rounded-full border-border bg-card"
                >
                  Library: লাইব্রেরি
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Media Library: মিডিয়া লাইব্রেরি</DialogTitle>
                  <DialogDescription>
                    আপলোড করা ছবিগুলো থেকে একটি বেছে নিন।
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[55vh] pr-2">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {(media ?? []).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(item.url);
                          setOpen(false);
                        }}
                        className={`group relative aspect-square overflow-hidden rounded-xl border transition ${
                          value === item.url
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:border-primary/50"
                        }`}
                        aria-label={`বেছে নিন: ${item.filename}`}
                      >
                        {item.kind === "image" ? (
                                        <img
                            src={item.url}
                            alt={item.filename}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center p-2 text-[10px] text-muted-foreground">
                            {item.filename}
                          </span>
                        )}
                      </button>
                    ))}
                    {media && media.length === 0 ? (
                      <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                        লাইব্রেরি খালি, আগে আপলোড করুন।
                      </p>
                    ) : null}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            {value ? (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 rounded-full text-muted-foreground"
                onClick={() => onChange("")}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
