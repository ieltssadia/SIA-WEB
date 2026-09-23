"use client";

import type { LucideIcon } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminUploadInfo } from "@/lib/admin-types";
import {
  ADMIN_LEAD_STATUSES,
  ADMIN_LIVE_STATUSES,
  ADMIN_ORDER_STATUSES,
} from "@/lib/admin-types";
import type {
  AdminLeadStatus,
  AdminLiveClassStatus,
  AdminOrderStatus,
  AdminEnrollmentStatus,
  AdminPaymentStatus,
} from "@/lib/admin-types";

// ---------------------------------------------------------------------------
// File upload — POST /api/admin/upload (multipart) shared by upload dialogs
// ---------------------------------------------------------------------------

/** Folders the server whitelist accepts (mirrors src/lib/upload-server.ts). */
export type AdminUploadFolder = "suggestions" | "certificates" | "resources" | "team" | "general";

/**
 * Upload one file through POST /api/admin/upload — returns the public URL
 * plus metadata (sizeLabel, ext, kind) WITHOUT creating any DB row; the
 * caller attaches `upload.url` to the relevant collection on save.
 */
export async function uploadAdminFile(
  token: string,
  file: File,
  folder: AdminUploadFolder
): Promise<{ ok: boolean; upload?: AdminUploadInfo; error?: string }> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-key": token },
      body,
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; upload?: AdminUploadInfo; error?: string }
      | null;
    if (res.ok && data?.ok && data.upload) return { ok: true, upload: data.upload };
    return { ok: false, error: data?.error ?? "ফাইল আপলোড করা যায়নি।" };
  } catch {
    return { ok: false, error: "নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।" };
  }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Bangladeshi Taka, e.g. formatBDT(1250) → "৳1,250". */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}

const DHAKA_TZ = "Asia/Dhaka";

/** "15 Aug 2025" (Asia/Dhaka). */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DHAKA_TZ,
  }).format(d);
}

/** "15 Aug 2025, 6:30 pm" (Asia/Dhaka) — used for schedules & receipts. */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "-";
  const date = formatDate(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: DHAKA_TZ,
  }).format(d);
  return `${date}, ${time}`;
}

/** ISO → value usable in <input type="datetime-local"> (machine-local). */
export function toLocalInputValue(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** ISO → value usable in <input type="date"> (machine-local). */
export function toDateInputValue(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2025-08-15" → "15 Aug 2025" (stored display format in Certificate.issued). */
export function dateInputToDisplay(value: string): string {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

// ---------------------------------------------------------------------------
// Tone badges (tint chips) + status maps
// ---------------------------------------------------------------------------

export type Tone = "emerald" | "amber" | "red" | "blue" | "sky" | "muted";

const toneClasses: Record<Tone, string> = {
  emerald: "border-[#b5d4c4] bg-[#e8f0ea] text-[#225941]",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  muted: "border-border bg-muted text-muted-foreground",
};

export function ToneBadge({
  tone,
  className,
  children,
}: {
  tone: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", toneClasses[tone], className)}
    >
      {children}
    </Badge>
  );
}

export const ORDER_STATUS_TONE: Record<AdminOrderStatus, Tone> = {
  placed: "sky",
  confirmed: "blue",
  shipped: "amber",
  delivered: "emerald",
  cancelled: "red",
};

export const ORDER_STATUS_LABEL: Record<AdminOrderStatus, string> = {
  placed: "Placed · প্লেসড",
  confirmed: "Confirmed · নিশ্চিত",
  shipped: "Shipped · শিপড",
  delivered: "Delivered · ডেলিভার্ড",
  cancelled: "Cancelled · বাতিল",
};

export const PAYMENT_STATUS_TONE: Record<AdminPaymentStatus, Tone> = {
  pending: "amber",
  verified: "sky",
  paid: "emerald",
  failed: "red",
};

export const LEAD_STATUS_TONE: Record<AdminLeadStatus, Tone> = {
  new: "sky",
  contacted: "blue",
  enrolled: "emerald",
  closed: "muted",
};

export const LEAD_STATUS_LABEL: Record<AdminLeadStatus, string> = {
  new: "New · নতুন",
  contacted: "Contacted · যোগাযোগ",
  enrolled: "Enrolled · ভর্তি",
  closed: "Closed · বন্ধ",
};

export const LIVE_STATUS_TONE: Record<AdminLiveClassStatus, Tone> = {
  scheduled: "sky",
  live: "emerald",
  ended: "muted",
};

export const LIVE_STATUS_LABEL: Record<AdminLiveClassStatus, string> = {
  scheduled: "Upcoming · আসছে",
  live: "Live · চলছে",
  ended: "Ended · শেষ",
};

export const ENROLLMENT_STATUS_TONE: Record<AdminEnrollmentStatus, Tone> = {
  active: "emerald",
  paused: "amber",
  completed: "sky",
};

/** Badge for any of the schema status strings (falls back to muted). */
export function StatusChip({ status, toneMap }: { status: string; toneMap: Record<string, Tone> }) {
  return <ToneBadge tone={toneMap[status] ?? "muted"}>{status}</ToneBadge>;
}

export { ADMIN_ORDER_STATUSES, ADMIN_LEAD_STATUSES, ADMIN_LIVE_STATUSES };

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

export function StatCard({
  icon: Icon,
  label,
  sub,
  value,
  tone = "emerald",
}: {
  icon: LucideIcon;
  label: string;
  sub?: string;
  value: React.ReactNode;
  tone?: Tone;
}) {
  const iconBg: Record<Tone, string> = {
    emerald: "bg-[#e8f0ea] text-[#28694d]",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    sky: "bg-sky-50 text-sky-600",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconBg[tone]
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-bold tracking-tight text-foreground">{value}</p>
          {sub ? <p className="truncate text-[11px] text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// EmptyState + ErrorState + section heading
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="font-semibold text-foreground">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-6 py-12 text-center">
      <p className="max-w-md text-sm font-medium text-red-700">{message}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="min-h-11 rounded-full border-border bg-card"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Retry · আবার
      </Button>
    </div>
  );
}

export function SectionHeading({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}
