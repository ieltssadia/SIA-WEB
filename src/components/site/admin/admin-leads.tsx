"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Mail, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminLead } from "@/lib/admin-types";
import {
  ADMIN_LEAD_STATUSES,
  EmptyState,
  ErrorState,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_TONE,
  SectionHeading,
  ToneBadge,
  formatDate,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

/**
 * Admin Leads — enrollment / inquiry leads with inline status updates
 * (schema statuses: new | contacted | enrolled | closed).
 */
export function AdminLeads() {
  const token = useAdminStore((s) => s.token);

  const [leads, setLeads] = useState<AdminLead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; leads?: AdminLead[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.leads) setLeads(data.leads);
      else setError(data?.error ?? "লিড লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(lead: AdminLead, status: string) {
    if (!token || status === lead.status) return;
    setSavingId(lead.id);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && data?.ok) {
        setLeads((rows) =>
          (rows ?? []).map((r) => (r.id === lead.id ? { ...r, status } : r))
        );
        toast.success(`${lead.name} → ${status}`);
      } else {
        toast.error(data?.error ?? "স্ট্যাটাস আপডেট করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Leads: লিড"
        sub="ওয়েবসাইটের enroll/contact ফর্ম থেকে আসা আগ্রহী শিক্ষার্থীরা"
      />

      {loading && !leads ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {leads && !loading ? (
        leads.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="এখনো কোনো লিড নেই"
            hint="Enroll form বা contact form জমা হলেই এখানে দেখা যাবে।"
          />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {leads.map((l) => (
              <li key={l.id}>
                <Card className="h-full rounded-2xl border-border bg-card">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{l.name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" aria-hidden="true" /> {l.phone}
                          </span>
                          {l.email ? (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" aria-hidden="true" /> {l.email}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <ToneBadge tone={LEAD_STATUS_TONE[l.status as keyof typeof LEAD_STATUS_TONE] ?? "muted"}>
                        {l.status}
                      </ToneBadge>
                    </div>
                    {l.course ? (
                      <p className="flex items-center gap-1.5 text-sm text-primary">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {l.course}
                      </p>
                    ) : null}
                    {l.message ? (
                      <p className="rounded-lg bg-muted/50 p-2 text-sm text-muted-foreground">
                        {l.message}
                      </p>
                    ) : null}
                    <div className="flex items-end justify-between gap-3 pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(l.createdAt)}
                      </span>
                      <div className="w-44">
                        <Label htmlFor={`lead-status-${l.id}`} className="sr-only">
                          Lead status
                        </Label>
                        <Select
                          value={l.status}
                          onValueChange={(v) => void updateStatus(l, v)}
                          disabled={savingId === l.id}
                        >
                          <SelectTrigger
                            id={`lead-status-${l.id}`}
                            className="min-h-11 rounded-full border-border bg-card text-xs"
                            aria-label={`Update status for ${l.name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ADMIN_LEAD_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {LEAD_STATUS_LABEL[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
