"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  GraduationCap,
  Radio,
  ReceiptText,
  ShoppingBag,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminStats } from "@/lib/admin-types";
import { useAdminStore } from "@/lib/admin-store";
import {
  EmptyState,
  ErrorState,
  ORDER_STATUS_TONE,
  StatCard,
  StatusChip,
  formatBDT,
  formatDate,
  SectionHeading,
} from "@/components/site/admin/admin-shared";

export type AdminSectionKey =
  | "dashboard"
  | "orders"
  | "live-classes"
  | "leads"
  | "students"
  | "certificates";

/**
 * Admin Dashboard — totals row, 7-day revenue bars (pure CSS), latest 5
 * orders and quick links. Bubbles the live-class count to the shell via
 * `onStats` so the top bar can show the pulse chip.
 */
export function AdminDashboard({
  onStats,
  onNavigate,
}: {
  onStats?: (stats: AdminStats) => void;
  onNavigate?: (section: AdminSectionKey) => void;
}) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = useAdminStore.getState().token;
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; stats?: AdminStats; error?: string }
        | null;
      if (res.ok && data?.ok && data.stats) {
        setStats(data.stats);
        onStats?.(data.stats);
      } else {
        setError(data?.error ?? "Stats লোড করা যায়নি।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
    // onStats/onNavigate identities change per render — fetch once per mount.
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxRevenue = stats
    ? Math.max(...stats.revenueByDay.map((d) => d.total), 1)
    : 1;

  return (
    <div className="space-y-6">
      {loading && !stats ? <DashboardSkeleton /> : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {stats && !loading ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={Wallet}
              label="Revenue — আয়"
              sub="paid + verified"
              value={formatBDT(stats.revenue)}
              tone="emerald"
            />
            <StatCard
              icon={ShoppingBag}
              label="Orders — অর্ডার"
              sub={`${stats.orders.byStatus.placed} placed`}
              value={stats.orders.total}
              tone="sky"
            />
            <StatCard
              icon={GraduationCap}
              label="Students — শিক্ষার্থী"
              value={stats.students}
              tone="blue"
            />
            <StatCard
              icon={UserPlus}
              label="New Leads — নতুন লিড"
              sub={`${stats.leads.contacted} contacted`}
              value={stats.leads.new}
              tone="amber"
            />
            <StatCard
              icon={Radio}
              label="Live Now — চলছে"
              sub={`${stats.liveClasses.scheduled} upcoming`}
              value={stats.liveClasses.live}
              tone={stats.liveClasses.live > 0 ? "red" : "muted"}
            />
            <StatCard
              icon={Award}
              label="Certificates — সার্টিফিকেট"
              value={stats.certificates}
              tone="muted"
            />
          </div>

          {/* Revenue chart + recent orders */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="rounded-2xl border-border bg-card lg:col-span-3">
              <CardContent className="p-4 sm:p-6">
                <SectionHeading
                  title="Revenue — শেষ ৭ দিন"
                  sub="paid + verified orders, Asia/Dhaka"
                />
                <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label="Last 7 days revenue bar chart">
                  {stats.revenueByDay.map((d) => {
                    const pct = Math.round((d.total / maxRevenue) * 100);
                    return (
                      <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                          {d.total > 0 ? formatBDT(d.total) : ""}
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-primary/85 transition-all hover:bg-primary"
                          style={{ height: `${Math.max(pct, d.total > 0 ? 6 : 2)}%` }}
                          title={`${d.label}: ${formatBDT(d.total)}`}
                        />
                        <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-card lg:col-span-2">
              <CardContent className="p-4 sm:p-6">
                <SectionHeading title="Recent Orders — সাম্প্রতিক" />
                {stats.recentOrders.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState
                      icon={ReceiptText}
                      title="এখনো কোনো অর্ডার নেই"
                      hint="Book Shop checkout থেকে প্রথম অর্ডারটি এখানে দেখা যাবে।"
                    />
                  </div>
                ) : (
                  <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
                    {stats.recentOrders.map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-foreground">
                            {o.orderNo}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {o.name} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"} ·{" "}
                            {formatDate(o.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm font-bold text-foreground">
                            {formatBDT(o.total)}
                          </span>
                          <StatusChip status={o.status} toneMap={ORDER_STATUS_TONE} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick links */}
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <SectionHeading title="Quick Actions — দ্রুত কাজ" />
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <QuickLink
                  icon={ShoppingBag}
                  title="Manage Orders"
                  sub="স্ট্যাটাস আপডেট করুন"
                  onClick={() => onNavigate?.("orders")}
                />
                <QuickLink
                  icon={Radio}
                  title="Schedule Class"
                  sub="লাইভ ক্লাস যোগ করুন"
                  onClick={() => onNavigate?.("live-classes")}
                />
                <QuickLink
                  icon={UserPlus}
                  title="Review Leads"
                  sub="লিড ফলো-আপ"
                  onClick={() => onNavigate?.("leads")}
                />
                <QuickLink
                  icon={Award}
                  title="Issue Certificate"
                  sub="সার্টিফিকেট ইস্যু"
                  onClick={() => onNavigate?.("certificates")}
                />
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function QuickLink({
  icon: Icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-11 items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 text-left transition hover:border-primary/50 hover:bg-primary/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-72 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}
