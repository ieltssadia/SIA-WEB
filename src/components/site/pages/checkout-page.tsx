"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Landmark,
  Loader2,
  Lock,
  LogIn,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { site, courses, upcomingBatches, type Course } from "@/lib/site-data";
import { usePortalStore } from "@/lib/portal-store";
import { useCartStore } from "@/lib/cart-store";
import { CartCheckout } from "@/components/site/cart-checkout";

/* ------------------------------------------------------------------ */
/* Payment methods — 10MS-style branded options                        */
/* ------------------------------------------------------------------ */

type PayMethod = {
  id: "bKash" | "Nagad" | "Rocket" | "Bank Transfer" | "Cash";
  label: string;
  note: string;
  icon: LucideIcon;
  color: string;
  needsTxId: boolean;
};

const payMethods: PayMethod[] = [
  {
    id: "bKash",
    label: "bKash",
    note: "Send Money · 01752-716238 (Merchant)",
    icon: Smartphone,
    color: "#e2136e",
    needsTxId: true,
  },
  {
    id: "Nagad",
    label: "Nagad",
    note: "Send Money · 01752-716238 (Merchant)",
    icon: Wallet,
    color: "#f26522",
    needsTxId: true,
  },
  {
    id: "Rocket",
    label: "Rocket",
    note: "Send Money · 017520716238 (Merchant)",
    icon: Smartphone,
    color: "#8c3494",
    needsTxId: true,
  },
  {
    id: "Bank Transfer",
    label: "Bank Transfer",
    note: "A/C: 1023 4567 8901 · Sonali Bank, Sreemangal",
    icon: Landmark,
    color: "#2e7d32",
    needsTxId: true,
  },
  {
    id: "Cash",
    label: "Cash at Office",
    note: "Pay at Sreemangal campus — receipt same day",
    icon: Banknote,
    color: "#0f766e",
    needsTxId: false,
  },
];

const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`;

function nextBatchOptions(courseSlug: string) {
  const advertised = upcomingBatches
    .filter((b) => b.courseSlug === courseSlug)
    .map((b) => ({
      batch: b.batch,
      meta: `${b.starts} · ${b.time} · ${b.seats}`,
    }));
  return advertised.length > 0
    ? advertised
    : [{ batch: "Batch 322", meta: "Starting soon · rolling admission" }];
}

/* ------------------------------------------------------------------ */
/* Step indicator                                                      */
/* ------------------------------------------------------------------ */

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Account", "Payment", "Done"];
  return (
    <ol className="flex items-center gap-2" aria-label="Checkout steps">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-gold-gradient text-[#16120a]"
                  : active
                    ? "border-2 border-primary bg-primary/10 text-primary"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={`text-xs font-semibold sm:text-sm ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Account step — create account / log in                              */
/* ------------------------------------------------------------------ */

function AccountStep({ onAuthed }: { onAuthed: () => void }) {
  const setSession = usePortalStore((s) => s.setSession);

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && password !== confirm) {
      setError("Passwords don't match — আবার লিখুন।");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        mode === "signup" ? "/api/auth/register" : "/api/portal/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "signup" ? { name, phone, password } : { phone, password }
          ),
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { user?: { name: string; phone: string }; token?: string; error?: string }
        | null;
      if (!res.ok || !data?.user) {
        setError(data?.error ?? "Something went wrong — please try again.");
        return;
      }
      setSession(data.user, [], [], data.token ?? null);
      onAuthed();
    } catch {
      setError("Could not reach the server — check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-foreground">
        {mode === "signup" ? "Create your student account" : "Log in to continue"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        কোর্স কিনলে একই account-এ ভর্তি হবে — পোর্টালে সাথে সাথে দেখতে পাবেন।
      </p>

      <Tabs value={mode} onValueChange={(v) => { setMode(v as "signup" | "login"); setError(null); }} className="mt-4">
        <TabsList className="grid w-full grid-cols-2 bg-[#101014]">
          <TabsTrigger value="signup" className="gap-1.5 data-[state=active]:bg-gold-gradient data-[state=active]:text-[#16120a]">
            <UserPlus className="h-4 w-4" aria-hidden /> Create account
          </TabsTrigger>
          <TabsTrigger value="login" className="gap-1.5 data-[state=active]:bg-gold-gradient data-[state=active]:text-[#16120a]">
            <LogIn className="h-4 w-4" aria-hidden /> Log in
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signup">
          <form onSubmit={submit} className="mt-4 space-y-3.5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="co-name">Full name</Label>
              <Input
                id="co-name"
                placeholder="e.g. Rahim Ahmed"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                autoComplete="name"
              />
            </div>
            <PhoneField phone={phone} setPhone={setPhone} setError={setError} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="co-pass">Password (min 6)</Label>
                <Input
                  id="co-pass"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-pass2">Confirm password</Label>
                <Input
                  id="co-pass2"
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                  autoComplete="new-password"
                />
              </div>
            </div>
            {error ? <ErrorNote text={error} /> : null}
            <Button type="submit" disabled={busy} className="w-full bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90 disabled:opacity-60">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              Continue to payment
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="login">
          <form onSubmit={submit} className="mt-4 space-y-3.5" noValidate>
            <PhoneField phone={phone} setPhone={setPhone} setError={setError} />
            <div className="space-y-1.5">
              <Label htmlFor="co-login-pass">Password</Label>
              <Input
                id="co-login-pass"
                type="password"
                placeholder="Your portal password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
              />
            </div>
            {error ? <ErrorNote text={error} /> : null}
            <Button type="submit" disabled={busy} className="w-full bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90 disabled:opacity-60">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              Log in & continue
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PhoneField({
  phone,
  setPhone,
  setError,
}: {
  phone: string;
  setPhone: (v: string) => void;
  setError: (v: string | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="co-phone">Mobile number</Label>
      <div className="flex overflow-hidden rounded-xl border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring/50">
        <span className="flex items-center gap-1.5 border-r border-input bg-[#101014] px-3.5 text-sm font-semibold text-primary">
          <Smartphone className="h-3.5 w-3.5" aria-hidden />
          +880
        </span>
        <Input
          id="co-phone"
          type="tel"
          inputMode="tel"
          placeholder="01XXX-XXXXXX"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(null); }}
          maxLength={20}
          autoComplete="tel"
          className="rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
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
/* Payment step                                                        */
/* ------------------------------------------------------------------ */

function PaymentStep({
  course,
  onEnrolled,
  onBack,
}: {
  course: Course;
  /** Called with the confirmed batch label once enrollment succeeds. */
  onEnrolled: (batch: string) => void;
  onBack: () => void;
}) {
  const token = usePortalStore((s) => s.token);
  const setSession = usePortalStore((s) => s.setSession);
  const logout = usePortalStore((s) => s.logout);
  const batchOptions = useMemo(() => nextBatchOptions(course.slug), [course.slug]);

  const [batch, setBatch] = useState(batchOptions[0].batch);
  const [method, setMethod] = useState<PayMethod["id"]>("bKash");
  const [txId, setTxId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = payMethods.find((m) => m.id === method)!;

  // Reset batch if options change (course switched)
  const [prevCourse, setPrevCourse] = useState(course.slug);
  if (prevCourse !== course.slug) {
    setPrevCourse(course.slug);
    setBatch(batchOptions[0].batch);
  }

  async function confirm() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/portal/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          courseSlug: course.slug,
          batch,
          paymentMethod: method,
          transactionId: txId,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | {
            user?: { name: string; phone: string };
            enrollments?: never[];
            mocks?: never[];
            token?: string;
            error?: string;
          }
        | null;
      if (res.status === 401) {
        logout();
        setError("Session expired — please log in again.");
        onBack();
        return;
      }
      if (!res.ok || !data?.user) {
        setError(data?.error ?? "Enrollment failed — please try again.");
        return;
      }
      setSession(data.user, data.enrollments ?? [], data.mocks ?? [], data.token ?? null);
      onEnrolled(batch);
    } catch {
      setError("Could not reach the server — check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Choose your batch</h2>
        <RadioGroup value={batch} onValueChange={setBatch} className="mt-3 space-y-2">
          {batchOptions.map((b) => (
            <Label
              key={b.batch}
              htmlFor={`batch-${b.batch}`}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                batch === b.batch ? "border-primary/60 bg-primary/[0.07]" : "border-border bg-[#101014] hover:border-primary/30"
              }`}
            >
              <RadioGroupItem id={`batch-${b.batch}`} value={b.batch} />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">{b.batch}</span>
                <span className="block text-xs text-muted-foreground">{b.meta}</span>
              </span>
              <CalendarDays className="ml-auto h-4 w-4 shrink-0 text-primary" aria-hidden />
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Separator className="bg-primary/10" />

      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Payment method</h2>
        <RadioGroup value={method} onValueChange={(v) => setMethod(v as PayMethod["id"])} className="mt-3 space-y-2">
          {payMethods.map((m) => {
            const Icon = m.icon;
            return (
              <Label
                key={m.id}
                htmlFor={`pay-${m.id}`}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                  method === m.id ? "border-primary/60 bg-primary/[0.07]" : "border-border bg-[#101014] hover:border-primary/30"
                }`}
              >
                <RadioGroupItem id={`pay-${m.id}`} value={m.id} />
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: m.color }}
                  aria-hidden
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{m.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{m.note}</span>
                </span>
              </Label>
            );
          })}
        </RadioGroup>

        {selected.needsTxId ? (
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="co-txid">Transaction ID (optional here)</Label>
            <Input
              id="co-txid"
              placeholder="Demo checkout — any text works"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              ডেমো মোড — আসল পেমেন্ট হয় না। প্রোডাকশনে TrxID ভেরিফিকেশন যুক্ত হবে।
            </p>
          </div>
        ) : null}
      </div>

      {error ? <ErrorNote text={error} /> : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button
          onClick={confirm}
          disabled={busy}
          className="flex-1 bg-gold-gradient py-6 text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" aria-hidden />
              Confirm Enrollment · {course.price === 0 ? "Free" : course.price ? taka(course.price) : "Custom"}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={busy} className="border-primary/25 hover:text-primary">
          Back
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden />
        Secure demo checkout · bKash / Nagad / Rocket / Bank / Cash accepted
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success step                                                        */
/* ------------------------------------------------------------------ */

function SuccessStep({ course, batch, name }: { course: Course; batch: string; name: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-8 text-center md:p-12">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-radial-glow blur-2xl" />
      <div className="relative">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient shadow-[0_8px_40px_rgba(212,175,55,0.45)]">
          <CheckCircle2 className="h-8 w-8 text-[#16120a]" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-foreground md:text-3xl">
          Enrollment <span className="text-gold-gradient">confirmed!</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          অভিনন্দন {name.split(" ")[0]}! ভর্তি সম্পন্ন হয়েছে — কোর্সটি এখন আপনার পোর্টালে।
        </p>
        <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            {course.title}
          </Badge>
          <Badge variant="outline" className="border-border px-3 py-1.5 text-sm font-semibold text-foreground">
            {batch}
          </Badge>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Class routine, materials, notices — সব এখন{" "}
          <span className="font-semibold text-primary">Student Portal</span>-এ দেখুন।
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="bg-gold-gradient px-6 py-6 font-semibold text-[#16120a] hover:opacity-90">
            <a href="#/portal">
              <GraduationCap className="mr-2 h-5 w-5" aria-hidden />
              Go to My Portal
            </a>
          </Button>
          <Button asChild variant="outline" className="border-primary/25 px-6 py-6 font-semibold hover:text-primary">
            <a href="#/courses">Browse more courses</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Course picker (when no course is selected)                          */
/* ------------------------------------------------------------------ */

function CoursePicker() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {courses.map((c, i) => (
        <Reveal key={c.slug} delay={i * 0.04} y={10}>
          <Card className="h-full border-border bg-card transition-colors hover:border-primary/40">
            <CardContent className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-bold leading-snug text-foreground">{c.title}</h3>
                <Badge variant="outline" className="shrink-0 border-primary/40 text-[11px] text-primary">
                  {c.tag}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" aria-hidden />{c.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden />{c.duration}</span>
                <span>{c.mode}</span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="font-display text-lg font-bold text-gold-gradient">
                  {c.price === 0 ? "Free" : c.price ? taka(c.price) : "Custom"}
                  {c.oldPrice ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground line-through">{taka(c.oldPrice)}</span>
                  ) : null}
                </span>
                <Button asChild size="sm" className="bg-gold-gradient font-semibold text-[#16120a] hover:opacity-90">
                  <a href={`#/checkout?course=${c.slug}`}>
                    Enroll
                    <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkout page                                                       */
/* ------------------------------------------------------------------ */

export function CheckoutPage({ initialCourse }: { initialCourse: string | null }) {
  const user = usePortalStore((s) => s.user);
  const enrollments = usePortalStore((s) => s.enrollments);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);
  const cartItems = useCartStore((s) => s.items);
  const cartLastOrder = useCartStore((s) => s.lastOrder);
  const cartHydrated = useCartStore((s) => s.hasHydrated);

  const [courseSlug, setCourseSlug] = useState(initialCourse);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [enrolledBatch, setEnrolledBatch] = useState<string | null>(null);

  // Logged-in visitors skip account creation (render-time state adjustment).
  // prevAuthed starts false so a visitor who arrives while ALREADY logged in
  // still advances from step 1 → 2 on the first post-hydration render.
  const authed = hasHydrated && !!user;
  const [prevAuthed, setPrevAuthed] = useState(false);
  if (authed !== prevAuthed) {
    setPrevAuthed(authed);
    if (authed) setStep((s) => (s === 1 ? 2 : s));
    else setStep(1);
  }

  // The course comes from the hash query — sync prop → state when the
  // visitor switches courses (render-time adjustment; useState ignores
  // new prop values on re-render)
  const [prevInitial, setPrevInitial] = useState(initialCourse);
  if (initialCourse !== prevInitial) {
    setPrevInitial(initialCourse);
    setCourseSlug(initialCourse);
    setEnrolledBatch(null);
    setStep(authed ? 2 : 1);
  }

  const course = courses.find((c) => c.slug === courseSlug) ?? null;
  const alreadyEnrolled = !!(course && user && enrollments.some((e) => e.courseSlug === course.slug));

  /* --- No course chosen → cart checkout (+ course picker when cart is empty) --- */
  if (!course) {
    const cartHasItems = cartHydrated && cartItems.length > 0;
    const showReceipt = cartHydrated && !cartHasItems && !!cartLastOrder;
    return (
      <>
        <PageHeader
          eyebrow={cartHasItems || showReceipt ? "Book Shop · Checkout" : "Admission · Checkout"}
          title={
            cartHasItems ? (
              <>
                Review &amp; <span className="text-gold-gradient">place your order</span>
              </>
            ) : showReceipt ? (
              <>
                Your recent <span className="text-gold-gradient">order</span>
              </>
            ) : (
              <>
                Choose a <span className="text-gold-gradient">course</span>
              </>
            )
          }
          subtitle={
            cartHasItems
              ? "ডেলিভারি ডিটেইলস দিন, পেমেন্ট বেছে নিন — অর্ডার কনফার্ম করতে ২৪ ঘণ্টার মধ্যে আমরা কল দেব।"
              : showReceipt
                ? "আপনার সর্বশেষ অর্ডারের রসিদ — পেমেন্ট ও ডেলিভারি তথ্য একসাথে।"
                : "যে কোর্সে ভর্তি হতে চান বেছে নিন — payment-এর পরই কোর্সটি আপনার Student Portal-এ চলে আসবে।"
          }
        />
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <CartCheckout />

            {/* Course picker stays reachable when the cart is empty */}
            {cartHydrated && !cartHasItems && !cartLastOrder ? (
              <div className="mt-14">
                <div className="mb-6 text-center">
                  <p className="font-display text-xl font-bold text-foreground md:text-2xl">
                    অথবা কোর্সে <span className="text-gold-gradient">ভর্তি হতে চান?</span>
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Live classes, materials ও mock tests — ভর্তির পর সব Student Portal-এ।
                  </p>
                </div>
                {hasHydrated && user && enrollments.length > 0 ? (
                  <p className="mx-auto mb-6 flex max-w-xl items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                    <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
                    আপনার পোর্টালে {enrollments.length}টি কোর্স আছে — নতুন কোর্স যোগ করতে পারেন।
                  </p>
                ) : null}
                <CoursePicker />
              </div>
            ) : null}
          </div>
        </section>
      </>
    );
  }

  /* --- Already enrolled → portal CTA (but not during the success step) --- */
  if (alreadyEnrolled && step !== 3) {
    return (
      <>
        <PageHeader
          eyebrow="Admission · Checkout"
          title={
            <>
              Already <span className="text-gold-gradient">enrolled</span>
            </>
          }
        />
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-2xl px-4 lg:px-8">
            <div className="rounded-3xl border border-primary/25 bg-card p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient">
                <BadgeCheck className="h-7 w-7 text-[#16120a]" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                আপনি ইতিমধ্যে এই কোর্সে ভর্তি
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {course.title} — আপনার পোর্টালে routine, materials ও scores দেখুন।
              </p>
              <Button asChild className="mt-5 bg-gold-gradient px-6 py-6 font-semibold text-[#16120a] hover:opacity-90">
                <a href="#/portal">
                  <GraduationCap className="mr-2 h-5 w-5" aria-hidden />
                  Go to My Portal
                </a>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* --- Main checkout --- */
  return (
    <>
      <PageHeader
        eyebrow="Admission · Checkout"
        title={
          <>
            Enroll in <span className="text-gold-gradient">{course.title}</span>
          </>
        }
        subtitle="২ ধাপে ভর্তি সম্পন্ন করুন — account, তারপর payment। কোর্স সাথে সাথেই পোর্টালে যুক্ত হবে।"
      />

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {step === 3 && course && enrolledBatch && user ? (
            <div className="mx-auto max-w-3xl">
              <SuccessStep course={course} batch={enrolledBatch} name={user.name} />
            </div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
              {/* Left: steps */}
              <Reveal y={12}>
                <Card className="border-primary/20 bg-card">
                  <CardContent className="space-y-6 p-6 md:p-8">
                    <Steps current={step} />

                    {step === 1 ? (
                      <AccountStep onAuthed={() => setStep(2)} />
                    ) : null}

                    {step === 2 && user ? (
                      <PaymentStep
                        course={course}
                        onEnrolled={(batch) => {
                          setEnrolledBatch(batch);
                          setStep(3);
                        }}
                        onBack={() => setStep(1)}
                      />
                    ) : null}

                    {step === 2 && !user ? (
                      <p className="text-sm text-destructive">
                        Session lost — আবার account step-এ ফিরে যান।
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Reveal>

              {/* Right: order summary */}
              <Reveal y={12} delay={0.08}>
                <Card className="border-primary/20 bg-card lg:sticky lg:top-24">
                  <CardContent className="p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Order summary
                    </p>
                    <h2 className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
                      {course.title}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">{course.titleBn}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <Badge variant="outline" className="border-border font-normal">{course.lessons} lessons</Badge>
                      <Badge variant="outline" className="border-border font-normal">{course.duration}</Badge>
                      <Badge variant="outline" className="border-border font-normal">{course.mode}</Badge>
                    </div>

                    <Separator className="my-4 bg-primary/10" />

                    <dl className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Course fee</dt>
                        <dd className="text-foreground">
                          {course.oldPrice ? <span className="mr-2 text-muted-foreground line-through">{taka(course.oldPrice)}</span> : null}
                          {course.price ? taka(course.price) : course.price === 0 ? "Free" : "—"}
                        </dd>
                      </div>
                      {course.oldPrice && course.price ? (
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground">Admission discount</dt>
                          <dd className="font-medium text-emerald-400">−{taka(course.oldPrice - course.price)}</dd>
                        </div>
                      ) : null}
                    </dl>

                    <Separator className="my-4 bg-primary/10" />

                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-bold text-foreground">Total</span>
                      <span className="font-display text-2xl font-bold text-gold-gradient">
                        {course.price ? taka(course.price) : course.price === 0 ? "৳0" : "Custom"}
                      </span>
                    </div>
                    {course.price ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {Math.round(((course.oldPrice ?? course.price) - course.price) / (course.oldPrice ?? course.price) * 100)}% admission offer applied
                      </p>
                    ) : null}

                    <Separator className="my-4 bg-primary/10" />

                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {course.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed text-primary">
                      ভর্তির পর portal account-এ লগ ইন করে routine, materials, mock scores — সব দেখতে পাবেন।
                      প্রশ্ন থাকলে কল করুন {site.phone}।
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          )}

          {/* Course switcher */}
          {step !== 3 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              ভুল কোর্স?{" "}
              <a href="#/checkout" onClick={() => setCourseSlug(null)} className="font-semibold text-primary hover:underline">
                অন্য কোর্স বেছে নিন
              </a>
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
