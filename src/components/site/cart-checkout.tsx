"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Steps } from "@/components/site/checkout-steps";
import { Reveal } from "@/components/site/reveal";
import { cartSubtotal, useCartStore, type PlacedOrder } from "@/lib/cart-store";
import {
  DELIVERY_ZONES,
  FREE_COURIER_THRESHOLD,
  PAYMENT_RECEIVER,
  PRIME_BANK_PAYMENT,
  PUBALI_BANK_QR_PAYMENT,
  deliveryFeeFor,
  getZone,
} from "@/lib/delivery";
import { canonicalPhone } from "@/lib/phone";
import { usePortalStore } from "@/lib/portal-store";
import { site } from "@/lib/site-data";

const taka = (n: number) => `৳${n.toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ */
/* Payment methods — book shop order checkout                          */
/* ------------------------------------------------------------------ */

type OrderPayMethod = {
  id: "Pubali Bank (Bangla QR)" | "Prime Bank" | "bKash" | "Nagad" | "Cash on Delivery";
  label: string;
  note: string;
  icon: LucideIcon;
  logo?: string;
  color: string;
  kind: "manual" | "cod";
};

const orderPayMethods: OrderPayMethod[] = [
  {
    id: "Pubali Bank (Bangla QR)",
    label: "Pubali Bank Bangla QR (Scan & Pay)",
    note: "যেকোনো Bank বা বিকাশ/নগদ/রকেট অ্যাপ দিয়ে QR স্ক্যান",
    icon: QrCode,
    logo: "/images/payments/bangla-qr-icon.png",
    color: "#006837",
    kind: "manual",
  },
  {
    id: "Prime Bank",
    label: "Prime Bank PLC (Bank Transfer)",
    note: "A/C: 2116134025450 · Sadia's IELTS Academy",
    icon: Landmark,
    logo: "/images/payments/prime-bank-icon.png",
    color: "#0054a6",
    kind: "manual",
  },
  {
    id: "bKash",
    label: "bKash (Send Money)",
    note: `Send Money · ${PAYMENT_RECEIVER.bkash}`,
    icon: Smartphone,
    logo: "/images/payments/bkash-icon.png",
    color: "#e2136e",
    kind: "manual",
  },
  {
    id: "Nagad",
    label: "Nagad (Send Money)",
    note: `Send Money · ${PAYMENT_RECEIVER.nagad}`,
    icon: Wallet,
    logo: "/images/payments/nagad-icon.png",
    color: "#f26522",
    kind: "manual",
  },
  {
    id: "Cash on Delivery",
    label: "Cash on Delivery",
    note: "বই হাতে পেয়ে টাকা পরিশোধ করুন, সারাদেশে",
    icon: Banknote,
    color: "#0f766e",
    kind: "cod",
  },
];

function CartCopyRow({ label, value, displayValue }: { label: string; value: string; displayValue?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} কপি করা হয়েছে`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-card p-2.5 border border-border">
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] text-muted-foreground">{label}</span>
        <span className="block truncate font-mono text-sm font-semibold text-foreground">
          {displayValue || value}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleCopy}
        className="h-8 shrink-0 gap-1.5 px-2.5 text-xs font-medium"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">কপি হয়েছে</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            <span>কপি</span>
          </>
        )}
      </Button>
    </div>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
      {text}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Order summary sidebar                                               */
/* ------------------------------------------------------------------ */

function CartSummary({ zone, onEdit }: { zone: string; onEdit?: () => void }) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const subtotal = cartSubtotal(items);
  const fee = deliveryFeeFor(zone, subtotal);
  const total = subtotal + fee;
  const zoneInfo = getZone(zone);
  const toFree = FREE_COURIER_THRESHOLD - subtotal;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Order summary
        </p>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Edit cart
          </button>
        ) : null}
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="flex gap-3">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-primary/15">
              <Image src={item.cover} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                {item.title}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center rounded-md border border-border">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.title}`}
                    onClick={() => setQuantity(item.slug, item.quantity - 1)}
                    className="flex h-6 w-6 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Minus className="h-3 w-3" aria-hidden />
                  </button>
                  <span className="w-6 text-center text-[11px] font-bold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.title}`}
                    onClick={() => setQuantity(item.slug, item.quantity + 1)}
                    className="flex h-6 w-6 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                  </button>
                </div>
                <span className="text-xs font-bold text-foreground">
                  {taka(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Separator className="my-4 bg-primary/10" />

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{taka(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className={fee === 0 ? "font-medium text-[#225941]" : "text-foreground"}>
            {fee === 0 ? "Free" : taka(fee)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-primary/10 pt-2.5">
          <dt className="font-display text-base font-bold text-foreground">Total</dt>
          <dd className="font-display text-2xl font-bold text-brand-gradient">{taka(total)}</dd>
        </div>
      </dl>

      {zoneInfo?.courier && toFree > 0 ? (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-primary">
          <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          আর {taka(toFree)} যোগ করলেই কুরিয়ার ফ্রি ({taka(FREE_COURIER_THRESHOLD)}+ অর্ডারে)
        </p>
      ) : null}
      {zoneInfo?.courier && toFree <= 0 ? (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#225941]">
          <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
          কুরিয়ার ডেলিভারি ফ্রি হয়ে গেছে!
        </p>
      ) : null}
      {zoneInfo && !zoneInfo.courier ? (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {zoneInfo.note}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — delivery details                                           */
/* ------------------------------------------------------------------ */

function DetailsStep({
  form,
  setField,
  onNext,
}: {
  form: DetailsForm;
  setField: (k: keyof DetailsForm, v: string) => void;
  onNext: () => void;
}) {
  const zoneInfo = getZone(form.zone);
  const courier = !!zoneInfo?.courier;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Delivery details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          বই পাঠানোর ঠিকানা দিন, আমরা কল দিয়ে কনফার্ম করে পার্সেল পাঠাব।
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cart-name">Full name *</Label>
          <Input
            id="cart-name"
            placeholder="e.g. Rahim Ahmed"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cart-phone">Mobile number *</Label>
          <div className="flex overflow-hidden rounded-xl border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring/50">
            <span className="flex items-center gap-1.5 border-r border-input bg-secondary px-3.5 text-sm font-semibold text-primary">
              <Smartphone className="h-3.5 w-3.5" aria-hidden />
              +880
            </span>
            <Input
              id="cart-phone"
              type="tel"
              inputMode="tel"
              placeholder="01XXX-XXXXXX"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              maxLength={20}
              autoComplete="tel"
              className="rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cart-email">Email (optional)</Label>
          <Input
            id="cart-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cart-zone">Delivery area *</Label>
          <Select value={form.zone} onValueChange={(v) => setField("zone", v)}>
            <SelectTrigger id="cart-zone" className="w-full">
              <SelectValue placeholder="Select delivery area" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              {DELIVERY_ZONES.map((z) => (
                <SelectItem key={z.value} value={z.value}>
                  {z.label} {z.fee === 0 ? "· Free" : `· ${taka(z.fee)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {courier ? (
        <div className="space-y-1.5">
          <Label htmlFor="cart-address">Full address *</Label>
          <Textarea
            id="cart-address"
            placeholder="House / Road / Area, Thana, District"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            কুরিয়ার পার্সেল পৌঁছাতে সম্পূর্ণ ঠিকানা দরকার, house, road, area সহ।
          </p>
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-2.5 text-xs leading-relaxed text-primary">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {zoneInfo?.note}, ঠিকানা লাগবে না, আমরা কল দিয়ে সময় নিশ্চিত করব।
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="cart-note">Order note (optional)</Label>
        <Textarea
          id="cart-note"
          placeholder="Special instructions: delivery time, gift wrap, etc."
          value={form.note}
          onChange={(e) => setField("note", e.target.value)}
          rows={2}
        />
      </div>

      <Button
        type="submit"
        className="w-full rounded-full bg-ink py-5 text-base font-semibold text-white hover:opacity-85"
      >
        Continue to payment
        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — payment                                                    */
/* ------------------------------------------------------------------ */

function PaymentStep({
  form,
  setField,
  method,
  setMethod,
  total,
  onBack,
  onPlace,
  busy,
  error,
}: {
  form: DetailsForm;
  setField: (k: keyof DetailsForm, v: string) => void;
  method: OrderPayMethod["id"];
  setMethod: (m: OrderPayMethod["id"]) => void;
  total: number;
  onBack: () => void;
  onPlace: () => void;
  busy: boolean;
  error: string | null;
}) {
  const selected = orderPayMethods.find((m) => m.id === method)!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Payment method</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          পেমেন্ট পদ্ধতি বেছে নিন, অর্ডার কনফার্ম হওয়ার পর আমরা কল দিয়ে নিশ্চিত করব।
        </p>
      </div>

      <RadioGroup value={method} onValueChange={(v) => setMethod(v as OrderPayMethod["id"])} className="space-y-2">
        {orderPayMethods.map((m) => {
          const Icon = m.icon;
          return (
            <Label
              key={m.id}
              htmlFor={`opay-${m.id}`}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                method === m.id ? "border-primary/60 bg-primary/[0.07]" : "border-border bg-muted/50 hover:border-primary/30"
              }`}
            >
              <RadioGroupItem id={`opay-${m.id}`} value={m.id} />
              <span
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white p-1.5 shadow-xs overflow-hidden"
                aria-hidden
              >
                {m.logo ? (
                  <Image
                    src={m.logo}
                    alt={m.label}
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Icon className="h-5 w-5 text-emerald-700" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">{m.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{m.note}</span>
              </span>
            </Label>
          );
        })}
        {/* Reserved slot — the online payment gateway plugs in here later */}
        <div
          aria-disabled
          className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border/60 bg-muted/50 p-3.5 opacity-60"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground" aria-hidden>
            <CreditCard className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-foreground">Card / Online Payment</span>
            <span className="block text-xs text-muted-foreground">bKash PGW · SSLCommerz · Nagad PGW</span>
          </span>
          <Badge variant="outline" className="shrink-0 border-primary/40 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Clock className="mr-1 h-3 w-3" aria-hidden />
            Coming Soon
          </Badge>
        </div>
      </RadioGroup>

      {selected.kind === "manual" ? (
        <div className="space-y-4">
          {selected.id === "Pubali Bank (Bangla QR)" ? (
            <div className="overflow-hidden rounded-2xl border-2 border-[#006837]/30 bg-[#006837]/[0.03] p-4 sm:p-5 space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#006837]/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-zinc-200">
                    <Image
                      src="/images/payments/pubali-bank-icon.png"
                      alt="Pubali Bank PLC"
                      width={32}
                      height={32}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      পূবালী ব্যাংক বাংলা কিউআর
                      <Badge variant="outline" className="border-[#006837]/40 text-[#006837] dark:text-[#52c286] text-[10px] py-0 px-1.5 font-bold">
                        BANGLA QR
                      </Badge>
                    </h4>
                    <p className="text-[11px] text-muted-foreground">Pubali Bank PLC · Interoperable QR</p>
                  </div>
                </div>
                <div className="relative h-7 w-12 shrink-0 overflow-hidden">
                  <Image
                    src="/images/payments/bangla-qr-icon.png"
                    alt="Bangla QR"
                    width={48}
                    height={28}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Center Pure QR Section */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-white dark:bg-zinc-950 p-4 border border-[#006837]/25 shadow-xs">
                <div className="relative h-56 w-56 sm:h-64 sm:w-64 overflow-hidden rounded-lg bg-white p-2 border border-zinc-200 shadow-xs">
                  <Image
                    src={PUBALI_BANK_QR_PAYMENT.qrImage}
                    alt="Pubali Bank Bangla QR Code"
                    width={256}
                    height={256}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
                <p className="mt-3 text-center text-xs font-semibold text-foreground">
                  যেকোনো ব্যাংক বা বিকাশ / নগদ / রকেট / উপায় অ্যাপ থেকে QR স্ক্যান করে পেমেন্ট করুন
                </p>
                <p className="mt-0.5 text-center text-xs text-muted-foreground">
                  মোট প্রদেয়: <strong className="font-bold text-primary">{taka(total)}</strong>
                </p>
              </div>

              {/* Key Details with 1-click Copy */}
              <div className="space-y-2">
                <CartCopyRow label="Bangla QR ID (PBLQR)" value={PUBALI_BANK_QR_PAYMENT.pblQrId} />
                <CartCopyRow label="মার্চেন্ট মোবাইল নম্বর" value={PUBALI_BANK_QR_PAYMENT.mobile} />
                <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border text-xs">
                  <span className="text-muted-foreground">মার্চেন্ট একাউন্ট নাম:</span>
                  <strong className="text-foreground font-semibold">{PUBALI_BANK_QR_PAYMENT.merchantName}</strong>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                💡 QR স্ক্যান করে পেমেন্ট সম্পন্ন করার পর এসএমএস বা অ্যাপ থেকে প্রাপ্ত <strong className="text-foreground">TrxID</strong> নিচের বক্সে লিখে অর্ডার সম্পন্ন করুন।
              </p>
            </div>
          ) : selected.id === "Prime Bank" ? (
            <div className="overflow-hidden rounded-2xl border-2 border-[#0054a6]/30 bg-[#0054a6]/[0.03] p-4 sm:p-5 space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#0054a6]/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-zinc-200">
                    <Image
                      src="/images/payments/prime-bank-icon.png"
                      alt="Prime Bank PLC"
                      width={32}
                      height={32}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Prime Bank PLC</h4>
                    <p className="text-[11px] text-muted-foreground">Bank Transfer / BEFTN / NPSB / Deposit</p>
                  </div>
                </div>
                <Badge className="bg-[#0054a6] text-white hover:bg-[#0054a6] text-[10px]">
                  Official Bank A/C
                </Badge>
              </div>

              {/* Bank Account Details with 1-click Copy */}
              <div className="space-y-2">
                <CartCopyRow label="অ্যাকাউন্ট নম্বর (A/C No)" value={PRIME_BANK_PAYMENT.accountNumber} />
                <CartCopyRow label="অ্যাকাউন্ট নাম (A/C Name)" value={PRIME_BANK_PAYMENT.accountName} />
                <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border text-xs">
                  <span className="text-muted-foreground">ব্যাংক ও শাখা:</span>
                  <strong className="text-foreground font-medium">{PRIME_BANK_PAYMENT.bankName} · {PRIME_BANK_PAYMENT.branch}</strong>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                যেকোনো ব্যাংক অ্যাপ, ইন্টারনেট ব্যাংকিং (BEFTN/NPSB/RTGS) অথবা ব্রাঞ্চ থেকে মোট{" "}
                <strong className="text-foreground">{taka(total)}</strong> ট্রান্সফার করুন এবং রেফারেন্স বা TrxID নিচে দিন।
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-zinc-200">
                    <Image
                      src={selected.id === "bKash" ? "/images/payments/bkash-icon.png" : "/images/payments/nagad-icon.png"}
                      alt={selected.label}
                      width={32}
                      height={32}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{selected.id} Send Money</h4>
                    <p className="text-[11px] text-muted-foreground">Personal / Merchant Receiver</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {taka(total)}
                </Badge>
              </div>

              <CartCopyRow label="রিসিভার নম্বর (Send Money)" value={PAYMENT_RECEIVER.full} displayValue={PAYMENT_RECEIVER.bkash} />

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selected.id} অ্যাপ থেকে <strong className="text-foreground">{PAYMENT_RECEIVER.full}</strong> নম্বরে{" "}
                <strong className="text-foreground">{taka(total)}</strong> Send Money করুন। টাকা পাঠানোর পর প্রাপ্ত TrxID নিচে লিখুন।
              </p>
            </div>
          )}

          {/* Mandatory Transaction ID Input */}
          <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cart-txid" className="text-sm font-bold text-foreground">
                Transaction ID (TrxID) <span className="text-destructive">* (বাধ্যতামূলক)</span>
              </Label>
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                অ্যাডমিন ম্যানুয়াল ভেরিফিকেশন
              </span>
            </div>
            <Input
              id="cart-txid"
              placeholder="e.g. 9GX7A2B1CD অথবা Bank Ref No"
              value={form.transactionId}
              onChange={(e) => setField("transactionId", e.target.value)}
              maxLength={80}
              required
              className="min-h-11 font-mono tracking-wider bg-card"
            />
            <p className="text-[11px] text-muted-foreground">
              পেমেন্ট সম্পন্ন করার পর আপনার প্রাপ্ত Transaction ID / TrxID এখানে লিখুন। অ্যাডমিন প্যানেল থেকে ম্যানুয়ালি যাচাই করার পর অর্ডার কনফার্ম হবে।
            </p>
          </div>
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-xl border border-[#28694d]/20 bg-[#2e7d5b]/10 px-3.5 py-2.5 text-xs leading-relaxed text-[#225941]">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          বই বুঝিয়ে দেওয়ার সময় {taka(total)} ক্যাশ পরিশোধ করবেন। ডেলিভারির আগে আমরা কল দিয়ে
          অর্ডার কনফার্ম করব।
        </p>
      )}

      {error ? <ErrorNote text={error} /> : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button
          onClick={onPlace}
          disabled={busy}
          className="flex-1 rounded-full bg-ink py-6 text-base font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Placing order...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" aria-hidden />
              Place Order · {taka(total)}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={busy} className="border-primary/25 hover:text-primary">
          Back
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden />
        Secure checkout · bKash / Nagad / Cash on Delivery accepted
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — order receipt                                              */
/* ------------------------------------------------------------------ */

function OrderReceipt({ order, onNewOrder }: { order: PlacedOrder; onNewOrder: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyOrderNo() {
    navigator.clipboard?.writeText(order.orderNo).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const firstName = order.name.trim().split(/\s+/)[0];
  const zone = getZone(order.zone);
  const manual = order.paymentMethod !== "Cash on Delivery";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-6 md:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-radial-glow blur-2xl" />
      <div className="relative">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient shadow-[0_8px_40px_rgba(169,127,42,0.45)]">
          <CheckCircle2 className="h-8 w-8 text-white" aria-hidden />
        </span>
        <h2 className="mt-5 text-center font-display text-2xl font-bold text-[#f6ecd4] md:text-3xl">
          Order <span className="text-[#d9b75c]">placed!</span>
        </h2>
        <p className="mt-2 text-center text-sm text-[#c6b995] md:text-base">
          ধন্যবাদ {firstName}! আপনার অর্ডার আমরা পেয়েছি, ২৪ ঘণ্টার মধ্যে{" "}
          <span className="font-semibold text-[#f6ecd4]">{order.phone}</span> নম্বরে কল দিয়ে
          কনফার্ম করা হবে।
        </p>

        {/* Order number */}
        <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.05] px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a3977b]">
              Order number
            </p>
            <p className="font-display text-lg font-bold tracking-wider text-[#d9b75c]">{order.orderNo}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyOrderNo}
            className="shrink-0 border-white/20 bg-transparent text-xs font-semibold text-[#f6ecd4] hover:bg-white/10 hover:text-white"
          >
            {copied ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden /> : <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* Payment instruction */}
        <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          {manual ? (
            <>
              <p className="text-sm font-bold text-[#f6ecd4]">
                পেমেন্ট পদ্ধতি: {order.paymentMethod} · {taka(order.total)}
              </p>
              {order.paymentMethod === "Pubali Bank (Bangla QR)" ? (
                <p className="mt-1.5 text-xs leading-relaxed text-[#c6b995]">
                  পূবালী ব্যাংক বাংলা কিউআর (PBLQR: {PUBALI_BANK_QR_PAYMENT.pblQrId}) মাধ্যমে পেমেন্ট সম্পন্ন হয়েছে।
                  {order.transactionId ? (
                    <> · TrxID: <span className="font-bold text-[#f6ecd4]">{order.transactionId}</span></>
                  ) : null}
                  । অ্যাডমিন প্যানেল থেকে ম্যানুয়ালি যাচাই করার পর আপনার বই কুরিয়ারে পাঠানো হবে।
                </p>
              ) : order.paymentMethod === "Prime Bank" ? (
                <p className="mt-1.5 text-xs leading-relaxed text-[#c6b995]">
                  প্রাইম ব্যাংক (A/C: {PRIME_BANK_PAYMENT.accountNumber}, {PRIME_BANK_PAYMENT.accountName}) মাধ্যমে ট্রান্সফার রিকোয়েস্ট জমা হয়েছে।
                  {order.transactionId ? (
                    <> · TrxID / Ref: <span className="font-bold text-[#f6ecd4]">{order.transactionId}</span></>
                  ) : null}
                  । অ্যাডমিন প্যানেল থেকে ব্যাংক স্টেটমেন্টে TrxID যাচাই করার পর অর্ডারটি কনফার্ম করা হবে।
                </p>
              ) : (
                <p className="mt-1.5 text-xs leading-relaxed text-[#c6b995]">
                  {order.paymentMethod} মাধ্যমে পেমেন্ট রিকোয়েস্ট প্রাপ্ত হয়েছে।
                  {order.transactionId ? (
                    <> · TrxID: <span className="font-bold text-[#f6ecd4]">{order.transactionId}</span></>
                  ) : null}
                  । অ্যাডমিন প্যানেল থেকে TrxID যাচাই সম্পন্ন হলে বই কুরিয়ারে পাঠানো হবে।
                </p>
              )}
            </>
          ) : order.zone === "pickup" ? (
            <p className="text-xs leading-relaxed text-[#c6b995]">
              ক্যাম্পাস (Chowmuhona, Sreemangal) থেকে বই বুঝে নেওয়ার সময়{" "}
              <span className="font-bold text-[#f6ecd4]">{taka(order.total)}</span> পরিশোধ করুন।
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-[#c6b995]">
              বই বুঝিয়ে দেওয়ার সময়{" "}
              <span className="font-bold text-[#f6ecd4]">{taka(order.total)}</span> ক্যাশ পরিশোধ
              করবেন।
            </p>
          )}
        </div>

        {/* Items recap */}
        <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <ul className="space-y-2">
            {order.items.map((i) => (
              <li key={i.slug} className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-[#f6ecd4]/90">
                  {i.title} <span className="text-[#c6b995]">× {i.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold text-[#f6ecd4]">{taka(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-3 bg-white/10" />
          <div className="flex items-center justify-between text-xs text-[#c6b995]">
            <span>Subtotal {order.deliveryFee > 0 ? `+ delivery ${taka(order.deliveryFee)}` : "· free delivery"}</span>
            <span className="font-display text-base font-bold text-[#d9b75c]">{taka(order.total)}</span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#c6b995]">
            <MapPin className="h-3 w-3 shrink-0 text-[#d9b75c]" aria-hidden />
            {zone?.label}
            {order.address ? <>, {order.address}</> : null}
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="bg-brand-gradient px-6 py-6 font-semibold text-white hover:opacity-90">
            <a href="#/shop">
              <ShoppingBag className="mr-2 h-5 w-5" aria-hidden />
              Continue Shopping
            </a>
          </Button>
          <Button asChild variant="outline" className="border-white/20 bg-transparent px-6 py-6 font-semibold text-[#f6ecd4] hover:border-white/40 hover:bg-white/10 hover:text-white">
            <a href={site.phoneHref}>
              <Phone className="mr-2 h-5 w-5" aria-hidden />
              Questions? {site.phone}
            </a>
          </Button>
        </div>

        <p className="mt-5 text-center text-xs text-[#c6b995]">
          অন্য অর্ডার করতে চান?{" "}
          <button type="button" onClick={onNewOrder} className="font-semibold text-[#d9b75c] hover:underline">
            Start a new order
          </button>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cart checkout page body                                             */
/* ------------------------------------------------------------------ */

type DetailsForm = {
  name: string;
  phone: string;
  email: string;
  zone: string;
  address: string;
  note: string;
  transactionId: string;
};

const EMPTY_FORM: DetailsForm = {
  name: "",
  phone: "",
  email: "",
  zone: "sreemangal",
  address: "",
  note: "",
  transactionId: "",
};

export function CartCheckout() {
  const items = useCartStore((s) => s.items);
  const lastOrder = useCartStore((s) => s.lastOrder);
  const setLastOrder = useCartStore((s) => s.setLastOrder);
  const clear = useCartStore((s) => s.clear);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const portalUser = usePortalStore((s) => s.user);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<DetailsForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [method, setMethod] = useState<OrderPayMethod["id"]>("bKash");
  const [busy, setBusy] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(true);

  const subtotal = cartSubtotal(items);
  const fee = deliveryFeeFor(form.zone, subtotal);
  const total = subtotal + fee;

  // Portal users get name/phone prefilled once the session restores.
  if (hasHydrated && portalUser && form.name === "" && form.phone === "") {
    setForm((f) => ({ ...f, name: portalUser.name, phone: portalUser.phone }));
  }

  function setField(k: keyof DetailsForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setFormError(null);
  }

  function validateDetails(): string | null {
    if (form.name.trim().length < 2) return "আপনার পুরো নাম লিখুন।";
    const phone = canonicalPhone(form.phone);
    if (!/^01[3-9]\d{8}$/.test(phone)) return "সঠিক মোবাইল নম্বর দিন, যেমন 01712-345678।";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Email টি সঠিক নয়।";
    const zone = getZone(form.zone);
    if (zone?.courier && form.address.trim().length < 8) {
      return "কুরিয়ার ডেলিভারির জন্য সম্পূর্ণ ঠিকানা লিখুন (house/road/area)।";
    }
    return null;
  }

  function goNextFromDetails() {
    const err = validateDetails();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setStep(2);
  }

  async function placeOrder() {
    setFormError(null);

    if (method !== "Cash on Delivery") {
      if (!form.transactionId.trim() || form.transactionId.trim().length < 3) {
        setFormError(
          "পেমেন্ট নিশ্চিত করতে Transaction ID (TrxID) দেওয়া আবশ্যক। অ্যাডমিন প্যানেল থেকে TrxID যাচাই করার পর অর্ডার কনফার্ম হবে।"
        );
        return;
      }
    }

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: canonicalPhone(form.phone),
          email: form.email.trim() || undefined,
          zone: form.zone,
          address: form.address.trim() || undefined,
          note: form.note.trim() || undefined,
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          paymentMethod: method,
          transactionId: form.transactionId.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { order?: PlacedOrder; error?: string }
        | null;
      if (!res.ok || !data?.order) {
        setFormError(data?.error ?? "Order placement failed, please try again.");
        return;
      }
      clear();
      setLastOrder(data.order);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("Could not reach the server, check your connection.");
    } finally {
      setBusy(false);
    }
  }

  /* --- Receipt view (just placed / restored from last session) --- */
  if (hasHydrated && items.length === 0 && lastOrder) {
    return (
      <Reveal y={12}>
        <div className="mx-auto max-w-3xl">
          <OrderReceipt order={lastOrder} onNewOrder={() => setLastOrder(null)} />
        </div>
      </Reveal>
    );
  }

  /* --- Empty cart --- */
  if (!hasHydrated) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" aria-label="Loading cart" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
            <ShoppingBag className="h-7 w-7 text-primary/70" aria-hidden />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">আপনার কার্ট খালি</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Book Shop থেকে বই কার্টে যোগ করুন, অথবা নিচের কোর্সে ভর্তি হোন।
          </p>
          <Button asChild className="mt-5 rounded-full bg-ink px-6 py-6 font-semibold text-white hover:opacity-85">
            <a href="#/shop">
              <BookOpen className="mr-2 h-5 w-5" aria-hidden />
              Browse Books
            </a>
          </Button>
        </div>
      </div>
    );
  }

  /* --- Steps 1–2 flow --- */
  return (
    <div>
      {/* Mobile Cart Summary (Visible on mobile/tablet so cart details & total are right at the top) */}
      <div className="mb-6 block lg:hidden">
        <Card className="overflow-hidden border-primary/25 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
                Cart Summary
              </Badge>
              <span className="text-xs font-semibold text-foreground">অর্ডার সারসংক্ষেপ</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileSummaryOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>{mobileSummaryOpen ? "সংক্ষিপ্ত করুন" : "বিস্তারিত দেখুন"}</span>
              {mobileSummaryOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <CardContent className="p-4 sm:p-5">
            {mobileSummaryOpen ? (
              <CartSummary zone={form.zone} onEdit={() => setStep(1)} />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{items.length}টি বই নির্বাচিত</p>
                  <p className="text-xs text-muted-foreground">ট্যাপ করে বইয়ের তালিকা ও ফি দেখুন</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-[11px] text-muted-foreground">সর্বমোট</span>
                  <span className="font-display text-xl font-extrabold text-brand-gradient">{taka(total)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: steps */}
        <Reveal y={12}>
          <Card className="border-primary/20 bg-card">
            <CardContent className="space-y-6 p-6 md:p-8">
              <Steps current={step} labels={["Details", "Payment", "Done"]} />

              {step === 1 ? (
                <DetailsStep form={form} setField={setField} onNext={goNextFromDetails} />
              ) : null}

              {step === 2 ? (
                <PaymentStep
                  form={form}
                  setField={setField}
                  method={method}
                  setMethod={setMethod}
                  total={total}
                  onBack={() => setStep(1)}
                  onPlace={placeOrder}
                  busy={busy}
                  error={formError}
                />
              ) : null}

              {formError && step === 1 ? <ErrorNote text={formError} /> : null}
            </CardContent>
          </Card>
        </Reveal>

        {/* Right: cart summary (Desktop sticky sidebar) */}
        <div className="hidden lg:block">
          <Reveal y={12} delay={0.08}>
            <Card className="border-primary/20 bg-card lg:sticky lg:top-24">
              <CardContent className="p-6">
                <CartSummary zone={form.zone} onEdit={() => setStep(1)} />
                <Separator className="my-4 bg-primary/10" />
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    100% original, Sadia Rahman-এর লেখা বই
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    {taka(FREE_COURIER_THRESHOLD)}+ অর্ডারে সারাদেশে ফ্রি কুরিয়ার
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    Cash on delivery available, ঝুঁকিমুক্ত কেনাকাটা
                  </li>
                </ul>
                <p className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed text-primary">
                  প্রশ্ন থাকলে কল করুন {site.phone}, অথবা অর্ডার করার পর আমরাই আপনাকে কল দেব।
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
