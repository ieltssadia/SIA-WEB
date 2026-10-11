"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  MapPin,
  NotebookPen,
  Package,
  Phone,
  ReceiptText,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminOrder } from "@/lib/admin-types";
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES,
} from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  SectionHeading,
  ToneBadge,
  formatBDT,
  formatDateTime,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const ZONE_LABEL: Record<string, string> = {
  pickup: "Pickup: Sreemangal",
  sreemangal: "Sreemangal",
  "inside-dhaka": "Inside Dhaka",
  "outside-dhaka": "Outside Dhaka",
  online: "Online Course (অনলাইন)",
};

/**
 * Admin Orders — status tabs + payment filter + search, responsive table/cards,
 * manual payment verification (TrxID matching, verify button, payment status update),
 * and an order detail sheet.
 */
export function AdminOrders() {
  const token = useAdminStore((s) => s.token);

  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<AdminOrder | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const debounce = useRef<number | null>(null);

  const load = useCallback(
    async (status: string, payStatus: string, q: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
        if (payStatus !== "all") params.set("paymentStatus", payStatus);
        if (q.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          headers: { "x-admin-key": token },
        });
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; orders?: AdminOrder[]; error?: string }
          | null;
        if (res.ok && data?.ok && data.orders) {
          setOrders(data.orders);
        } else {
          setError(data?.error ?? "অর্ডার লোড করা যায়নি।");
        }
      } catch {
        setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void load(statusFilter, paymentFilter, query);
  }, [load, statusFilter, paymentFilter, query]);

  function handleSearch(value: string) {
    setSearchInput(value);
    if (debounce.current !== null) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => setQuery(value), 350);
  }

  function copyTxId(tx: string) {
    navigator.clipboard?.writeText(tx).catch(() => {});
    setCopiedTxId(tx);
    toast.success(`TrxID "${tx}" কপি করা হয়েছে!`);
    setTimeout(() => setCopiedTxId(null), 2000);
  }

  async function updateStatus(order: AdminOrder, status: string) {
    if (!token || status === order.status) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && data?.ok) {
        const updated = { ...order, status };
        setActive((a) => (a && a.id === order.id ? updated : a));
        setOrders((rows) =>
          (rows ?? []).map((r) => (r.id === order.id ? { ...r, status } : r))
        );
        toast.success(`${order.orderNo} স্ট্যাটাস → ${status}`);
      } else {
        toast.error(data?.error ?? "স্ট্যাটাস আপডেট করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setSavingStatus(false);
    }
  }

  async function updatePaymentStatus(order: AdminOrder, paymentStatus: string) {
    if (!token || paymentStatus === order.paymentStatus) return;
    setSavingPayment(true);
    try {
      const willConfirm = paymentStatus === "verified" && order.status === "placed";
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({
          paymentStatus,
          ...(willConfirm ? { status: "confirmed" } : {}),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; status?: string; paymentStatus?: string }
        | null;
      if (res.ok && data?.ok) {
        const newStatus = data.status ?? (willConfirm ? "confirmed" : order.status);
        const updated = { ...order, paymentStatus, status: newStatus };
        setActive((a) => (a && a.id === order.id ? updated : a));
        setOrders((rows) =>
          (rows ?? []).map((r) => (r.id === order.id ? updated : r))
        );
        toast.success(
          paymentStatus === "verified"
            ? `পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে! (${order.orderNo})`
            : `${order.orderNo} পেমেন্ট স্ট্যাটাস → ${paymentStatus}`
        );
      } else {
        toast.error(data?.error ?? "পেমেন্ট আপডেট করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setSavingPayment(false);
    }
  }

  // Count pending payments for badge counter
  const pendingCount = (orders ?? []).filter((o) => o.paymentStatus === "pending").length;

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Orders & Payment Verification: অর্ডার ও পেমেন্ট যাচাই"
        sub="Book Shop ও কোর্স ভর্তি অর্ডার ম্যানেজ করুন, TrxID মিলিয়ে ম্যানুয়ালি পেমেন্ট ভেরিফাই করুন"
      />

      {/* Primary Status & Search Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-2xl bg-secondary p-1">
            <TabsTrigger value="all" className="rounded-xl">All Orders</TabsTrigger>
            {ADMIN_ORDER_STATUSES.map((s) => (
              <TabsTrigger key={s} value={s} className="rounded-xl">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Label htmlFor="admin-order-search" className="sr-only">
            অর্ডার নম্বর, নাম, ফোন বা TrxID দিয়ে খুঁজুন
          </Label>
          <Input
            id="admin-order-search"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="অর্ডার / নাম / ফোন / TrxID"
            className="min-h-11 rounded-full bg-card pl-9"
          />
        </div>
      </div>

      {/* Payment Status Filter Strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-2 text-xs">
        <span className="px-2 font-semibold text-muted-foreground">পেমেন্ট ফিল্টার:</span>
        <button
          type="button"
          onClick={() => setPaymentFilter("all")}
          className={`rounded-xl px-3 py-1.5 font-medium transition ${
            paymentFilter === "all"
              ? "bg-primary text-primary-foreground font-semibold"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          All Payments
        </button>
        <button
          type="button"
          onClick={() => setPaymentFilter("pending")}
          className={`relative rounded-xl px-3 py-1.5 font-medium transition ${
            paymentFilter === "pending"
              ? "bg-amber-500 text-white font-semibold"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
          }`}
        >
          Pending Verification
          {pendingCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">
              {pendingCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setPaymentFilter("verified")}
          className={`rounded-xl px-3 py-1.5 font-medium transition ${
            paymentFilter === "verified"
              ? "bg-sky-500 text-white font-semibold"
              : "bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20"
          }`}
        >
          Verified
        </button>
        <button
          type="button"
          onClick={() => setPaymentFilter("paid")}
          className={`rounded-xl px-3 py-1.5 font-medium transition ${
            paymentFilter === "paid"
              ? "bg-emerald-600 text-white font-semibold"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          Paid
        </button>
        <button
          type="button"
          onClick={() => setPaymentFilter("failed")}
          className={`rounded-xl px-3 py-1.5 font-medium transition ${
            paymentFilter === "failed"
              ? "bg-red-500 text-white font-semibold"
              : "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20"
          }`}
        >
          Failed
        </button>
      </div>

      {loading && !orders ? <OrdersSkeleton /> : null}

      {error && !loading ? (
        <ErrorState
          message={error}
          onRetry={() => void load(statusFilter, paymentFilter, query)}
        />
      ) : null}

      {orders && !loading ? (
        orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="কোনো অর্ডার পাওয়া যায়নি"
            hint="এই ফিল্টারে কোনো অর্ডার নেই, ফিল্টার বদলে দেখুন বা নতুন অর্ডারের অপেক্ষা করুন।"
          />
        ) : (
          <>
            {/* Desktop table */}
            <Card className="hidden rounded-2xl border-border bg-card lg:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="rounded-tl-2xl">Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment & TrxID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead className="rounded-tr-2xl">Placed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow
                        key={o.id}
                        onClick={() => setActive(o)}
                        className="cursor-pointer hover:bg-muted/40"
                      >
                        <TableCell className="font-mono text-xs font-semibold">
                          {o.orderNo}
                        </TableCell>
                        <TableCell>
                          <span className="block font-medium">{o.name}</span>
                          <span className="block text-xs text-muted-foreground">{o.phone}</span>
                        </TableCell>
                        <TableCell>{o.itemCount}</TableCell>
                        <TableCell className="font-semibold">{formatBDT(o.total)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[11px] font-medium">
                                {o.paymentMethod}
                              </Badge>
                              <ToneBadge
                                tone={
                                  PAYMENT_STATUS_TONE[
                                    o.paymentStatus as keyof typeof PAYMENT_STATUS_TONE
                                  ] ?? "muted"
                                }
                              >
                                {o.paymentStatus}
                              </ToneBadge>
                            </div>
                            {o.transactionId ? (
                              <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                                <span>TrxID: {o.transactionId}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTxId(o.transactionId!);
                                  }}
                                  className="rounded p-0.5 hover:bg-muted hover:text-foreground"
                                  title="Copy TrxID"
                                >
                                  {copiedTxId === o.transactionId ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ToneBadge
                            tone={
                              ORDER_STATUS_TONE[o.status as keyof typeof ORDER_STATUS_TONE] ??
                              "muted"
                            }
                          >
                            {o.status}
                          </ToneBadge>
                        </TableCell>
                        <TableCell>
                          {o.paymentStatus === "pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-lg border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                void updatePaymentStatus(o, "verified");
                              }}
                              disabled={savingPayment}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Verify
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">✓ Verified</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(o.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mobile cards */}
            <div className="space-y-3 lg:hidden">
              {orders.map((o) => (
                <Card
                  key={o.id}
                  className="cursor-pointer rounded-2xl border-border bg-card transition hover:border-primary/40"
                  onClick={() => setActive(o)}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold">{o.orderNo}</span>
                      <div className="flex items-center gap-1.5">
                        <ToneBadge
                          tone={
                            PAYMENT_STATUS_TONE[
                              o.paymentStatus as keyof typeof PAYMENT_STATUS_TONE
                            ] ?? "muted"
                          }
                        >
                          {o.paymentStatus}
                        </ToneBadge>
                        <ToneBadge
                          tone={
                            ORDER_STATUS_TONE[o.status as keyof typeof ORDER_STATUS_TONE] ??
                            "muted"
                          }
                        >
                          {o.status}
                        </ToneBadge>
                      </div>
                    </div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.phone}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-xs">
                      <span className="font-semibold text-foreground">
                        {formatBDT(o.total)} · {o.paymentMethod}
                      </span>
                      {o.paymentStatus === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg border-emerald-500/40 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            void updatePaymentStatus(o, "verified");
                          }}
                          disabled={savingPayment}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Verify Payment
                        </Button>
                      ) : null}
                    </div>
                    {o.transactionId ? (
                      <p className="font-mono text-xs text-muted-foreground">
                        TrxID: {o.transactionId}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )
      ) : null}

      {/* Detail sheet */}
      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {active ? (
            <>
              <SheetHeader className="pb-0">
                <SheetTitle className="font-mono text-lg">{active.orderNo}</SheetTitle>
                <SheetDescription>
                  {formatDateTime(active.createdAt)} · {active.itemCount} item
                  {active.itemCount === 1 ? "" : "s"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-8">
                {/* Manual Payment Verification Card */}
                <section
                  aria-label="Payment Verification"
                  className="rounded-2xl border-2 border-primary/25 bg-primary/[0.04] p-4.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      Payment Verification · পেমেন্ট যাচাই
                    </h3>
                    <ToneBadge
                      tone={
                        PAYMENT_STATUS_TONE[
                          active.paymentStatus as keyof typeof PAYMENT_STATUS_TONE
                        ] ?? "muted"
                      }
                    >
                      {active.paymentStatus}
                    </ToneBadge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">পদ্ধতি:</span>
                      <Badge variant="outline" className="font-semibold">
                        {active.paymentMethod}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">মোট প্রদেয়:</span>
                      <span className="text-base font-bold text-foreground">
                        {formatBDT(active.total)}
                      </span>
                    </div>

                    {/* Transaction ID box with 1-click copy */}
                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Transaction ID (TrxID)
                        </Label>
                        {active.transactionId ? (
                          <button
                            type="button"
                            onClick={() => copyTxId(active.transactionId!)}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            {copiedTxId === active.transactionId ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span>কপি হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy TrxID</span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1 font-mono text-sm font-bold tracking-wider text-foreground">
                        {active.transactionId || (
                          <span className="text-xs font-normal text-muted-foreground italic">
                            কোনো TrxID পাওয়া যায়নি (Cash on Delivery বা অফলাইন)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Quick 1-click verify button */}
                    {active.paymentStatus === "pending" ? (
                      <Button
                        type="button"
                        onClick={() => void updatePaymentStatus(active, "verified")}
                        disabled={savingPayment}
                        className="mt-2 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {savingPayment ? "Verifying..." : "Verify Payment · পেমেন্ট নিশ্চিত করুন"}
                      </Button>
                    ) : null}

                    {/* Change Payment Status dropdown */}
                    <div className="pt-2">
                      <Label className="text-xs text-muted-foreground">পেমেন্ট স্ট্যাটাস পরিবর্তন করুন:</Label>
                      <Select
                        value={active.paymentStatus}
                        onValueChange={(v) => void updatePaymentStatus(active, v)}
                        disabled={savingPayment}
                      >
                        <SelectTrigger className="mt-1 min-h-10 w-full rounded-xl border-border bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADMIN_PAYMENT_STATUSES.map((ps) => (
                            <SelectItem key={ps} value={ps}>
                              {PAYMENT_STATUS_LABEL[ps]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Customer */}
                <section aria-label="Customer" className="rounded-2xl border border-border bg-muted/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Customer · কাস্টমার
                  </h3>
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <User className="h-4 w-4 text-primary" aria-hidden="true" /> {active.name}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary" aria-hidden="true" /> {active.phone}
                  </p>
                  {active.email ? (
                    <p className="mt-1 text-sm text-muted-foreground">{active.email}</p>
                  ) : null}
                  <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {ZONE_LABEL[active.zone] ?? active.zone}
                      {active.address ? `, ${active.address}` : ""}
                    </span>
                  </p>
                  {active.note ? (
                    <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                      <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {active.note}
                    </p>
                  ) : null}
                  {active.student ? (
                    <Badge variant="outline" className="mt-3 rounded-full border-primary/30 bg-primary/5 text-primary">
                      Portal: {active.student.name} ({active.student.phone})
                    </Badge>
                  ) : null}
                </section>

                {/* Items */}
                <section aria-label="Items">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Items · পণ্য ও কোর্স
                  </h3>
                  <ul className="space-y-2">
                    {active.items.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{it.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBDT(it.price)} × {it.quantity}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold">
                          {formatBDT(it.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-3" />
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Subtotal</dt>
                      <dd>{formatBDT(active.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Delivery</dt>
                      <dd>{formatBDT(active.deliveryFee)}</dd>
                    </div>
                    <div className="flex justify-between text-base font-bold text-foreground">
                      <dt>Total</dt>
                      <dd>{formatBDT(active.total)}</dd>
                    </div>
                  </dl>
                </section>

                {/* Status update */}
                <section aria-label="Update status">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Order Status · অর্ডার স্ট্যাটাস
                  </h3>
                  <Select
                    value={active.status}
                    onValueChange={(v) => void updateStatus(active, v)}
                    disabled={savingStatus}
                  >
                    <SelectTrigger className="min-h-11 w-full rounded-xl border-border bg-card" aria-label="Order status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {ORDER_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full rounded-full border-border bg-card"
                    onClick={() => void load(statusFilter, paymentFilter, query)}
                  >
                    <ReceiptText className="h-4 w-4" aria-hidden="true" />
                    Refresh list · রিফ্রেশ
                  </Button>
                </section>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}
