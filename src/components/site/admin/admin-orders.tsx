"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapPin,
  NotebookPen,
  Package,
  Phone,
  ReceiptText,
  Search,
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
  EmptyState,
  ErrorState,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
  SectionHeading,
  ToneBadge,
  formatBDT,
  formatDateTime,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";

const ZONE_LABEL: Record<string, string> = {
  pickup: "Pickup: Sreemangal",
  "sreemangal": "Sreemangal",
  "inside-dhaka": "Inside Dhaka",
  "outside-dhaka": "Outside Dhaka",
};

/**
 * Admin Orders — status tabs + search, responsive table/cards, and a detail
 * sheet where the order status is updated via PATCH (with toast feedback).
 */
export function AdminOrders() {
  const token = useAdminStore((s) => s.token);

  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<AdminOrder | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const debounce = useRef<number | null>(null);

  const load = useCallback(
    async (status: string, q: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
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
    void load(statusFilter, query);
  }, [load, statusFilter, query]);

  function handleSearch(value: string) {
    setSearchInput(value);
    // Debounced refetch — smooths typing without flooding the API.
    if (debounce.current !== null) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => setQuery(value), 350);
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
        toast.success(`${order.orderNo} → ${status}`);
      } else {
        toast.error(data?.error ?? "স্ট্যাটাস আপডেট করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Orders: অর্ডার"
        sub="Book Shop অর্ডার ম্যানেজ করুন, স্ট্যাটাস, পেমেন্ট ও ডেলিভারি"
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-2xl bg-secondary p-1">
            <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
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
            অর্ডার নম্বর, নাম বা ফোন দিয়ে খুঁজুন
          </Label>
          <Input
            id="admin-order-search"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="অর্ডার নম্বর / নাম / ফোন: খুঁজুন"
            className="min-h-11 rounded-full bg-card pl-9"
          />
        </div>
      </div>

      {loading && !orders ? <OrdersSkeleton /> : null}

      {error && !loading ? (
        <ErrorState message={error} onRetry={() => void load(statusFilter, query)} />
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
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="rounded-tr-2xl">Placed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow
                        key={o.id}
                        onClick={() => setActive(o)}
                        className="cursor-pointer"
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
                          <ToneBadge tone={PAYMENT_STATUS_TONE[o.paymentStatus as keyof typeof PAYMENT_STATUS_TONE] ?? "muted"}>
                            {o.paymentStatus}
                          </ToneBadge>
                        </TableCell>
                        <TableCell>
                          <ToneBadge tone={ORDER_STATUS_TONE[o.status as keyof typeof ORDER_STATUS_TONE] ?? "muted"}>
                            {o.status}
                          </ToneBadge>
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
                      <ToneBadge tone={ORDER_STATUS_TONE[o.status as keyof typeof ORDER_STATUS_TONE] ?? "muted"}>
                        {o.status}
                      </ToneBadge>
                    </div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.phone}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold">{formatBDT(o.total)}</span>
                      <span className="text-xs text-muted-foreground">
                        {o.itemCount} item · {formatDateTime(o.createdAt)}
                      </span>
                    </div>
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
                    Items · পণ্য
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

                {/* Payment */}
                <section aria-label="Payment" className="rounded-2xl border border-border bg-muted/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Payment · পেমেন্ট
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-border bg-card">
                      {active.paymentMethod}
                    </Badge>
                    <ToneBadge tone={PAYMENT_STATUS_TONE[active.paymentStatus as keyof typeof PAYMENT_STATUS_TONE] ?? "muted"}>
                      {active.paymentStatus}
                    </ToneBadge>
                  </div>
                  {active.transactionId ? (
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      TrxID: {active.transactionId}
                    </p>
                  ) : null}
                </section>

                {/* Status update */}
                <section aria-label="Update status">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Update Status · স্ট্যাটাস
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
                    onClick={() => void load(statusFilter, query)}
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
