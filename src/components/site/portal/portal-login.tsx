"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/site/reveal";
import { site, stats } from "@/lib/site-data";
import { usePortalStore } from "@/lib/portal-store";

const benefits = [
  "ভর্তি করা কোর্সের সম্পূর্ণ weekly routine ও class links",
  "Course progress, attendance ও mock test band report",
  "Batch notice, সরাসরি mentor-এর কাছ থেকে",
  "Study materials ও speaking club সব এক জায়গায়",
];

type AuthResponse = {
  user?: { name: string; phone: string; email?: string | null };
  enrollments?: any[];
  mocks?: any[];
  token?: string;
  certificates?: any[];
  error?: string;
  message?: string;
};

/**
 * Student Portal auth — real account system:
 *  · Create Account (sign-up) — with mandatory Email + Phone verification via Email OTP
 *  · Log In — enrolled students with Phone/Email + Password
 */
export function PortalLogin() {
  const setSession = usePortalStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function authenticate(
    endpoint: string,
    body: Record<string, string>
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as AuthResponse | null;
    if (!res.ok || !data?.user) {
      return { ok: false, error: data?.error ?? "Something went wrong, please try again." };
    }
    setSession(
      data.user,
      data.enrollments ?? [],
      data.mocks ?? [],
      data.token ?? null,
      data.certificates ?? []
    );
    return { ok: true };
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto grid max-w-4xl items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Benefits panel */}
          <Reveal>
            <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient">
                <LockKeyhole className="h-5.5 w-5.5 text-white" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-[#f6ecd4]">
                শুধু শিক্ষার্থীদের জন্য{" "}
                <span className="text-[#d9b75c]">প্রাইভেট পোর্টাল</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#c6b995]">
                Account খুলে কোর্স কিনুন, অথবা ভর্তির সময় পাওয়া credential দিয়ে লগ ইন করুন।
                পোর্টালের সব কনটেন্ট শুধু আপনার জন্য।
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-[#f6ecd4]/90">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#d9b75c]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Separator className="my-5 bg-white/10" />
              <div className="grid grid-cols-3 gap-3 text-center">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.05] px-2 py-3">
                    <p className="font-display text-lg font-bold text-[#d9b75c]">
                      {s.value}
                      {s.suffix}+
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-[#a3977b]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Auth card — tabs: Log in / Create account */}
          <Reveal delay={0.08}>
            <Card className="h-full border-primary/25 bg-card shadow-[0_30px_80px_rgba(30,27,20,0.18)]">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
                    <KeyRound className="h-5 w-5 text-white" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Student Account</h3>
                    <p className="text-xs text-muted-foreground">
                      লগ ইন করুন অথবা ভেরিফাইড account তৈরি করুন
                    </p>
                  </div>
                </div>

                <Tabs
                  value={mode}
                  onValueChange={(v) => setMode(v as "login" | "signup")}
                  className="mt-6"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-secondary">
                    <TabsTrigger
                      value="login"
                      className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <LogIn className="h-4 w-4" aria-hidden /> Log in
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <UserPlus className="h-4 w-4" aria-hidden /> Create account
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <LoginForm authenticate={authenticate} />
                  </TabsContent>
                  <TabsContent value="signup">
                    <SignupOtpFlow onCompleteAuthenticate={authenticate} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Log in form (Supports Mobile Number OR Email Address)              */
/* ------------------------------------------------------------------ */

function LoginForm({
  authenticate,
}: {
  authenticate: (endpoint: string, body: Record<string, string>) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("মোবাইল নম্বর অথবা ইমেইল এবং পাসওয়ার্ড লিখুন।");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await authenticate("/api/portal/login", { identifier, password });
      if (!result.ok) setError(result.error);
    } catch {
      setError("সার্ভারে যোগাযোগ করা যাচ্ছে না। আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={handleLogin} className="mt-5 space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="portal-identifier">Mobile Number or Email</Label>
          <div className="relative">
            <Input
              id="portal-identifier"
              name="identifier"
              type="text"
              placeholder="01XXXXXXXXX or student@gmail.com"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(null);
              }}
              autoComplete="username"
              aria-invalid={!!error}
              className="pl-3.5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="portal-password">Password</Label>
          <div className="relative">
            <Input
              id="portal-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              aria-invalid={!!error}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-ink py-6 text-base font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Logging in...
            </>
          ) : (
            <>
              Log in to Portal
              <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        কোর্স কিনে নিজের account খুলতে চান?{" "}
        <a href="#/checkout" className="font-semibold text-primary hover:underline">
          Course checkout
        </a>{" "}
        , অথবা কল করুন{" "}
        <a href={site.phoneHref} className="font-semibold text-primary hover:underline">
          {site.phone}
        </a>
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sign-up form with 2-step Email OTP Verification                    */
/* ------------------------------------------------------------------ */

function SignupOtpFlow({
  onCompleteAuthenticate,
}: {
  onCompleteAuthenticate: (endpoint: string, body: Record<string, string>) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const setSession = usePortalStore((s) => s.setSession);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  async function handleSendOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("আপনার পুরো নাম লিখুন (Full name is required).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("সঠিক ইমেইল এড্রেস লিখুন (Valid email is required).");
      return;
    }
    if (!phone.trim()) {
      setError("১১ ডিজিটের মোবাইল নম্বর লিখুন (Mobile number is required).");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password minimum 6 characters).");
      return;
    }
    if (password !== confirm) {
      setError("পাসওয়ার্ড দুটি মেলেনি, আবার লিখুন (Passwords do not match).");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "ওটিপি পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }

      setStep("otp");
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg(data.message ?? `আপনার ইমেইল (${email})-এ ৬ ডিজিটের ওটিপি পাঠানো হয়েছে।`);
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendOtp() {
    if (!canResend || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে।");
      } else {
        setCountdown(60);
        setCanResend(false);
        setSuccessMsg(`নতুন ওটিপি আপনার ইমেইল (${email})-এ পাঠানো হয়েছে।`);
      }
    } catch {
      setError("ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("ইমেইলে পাওয়া ৬ ডিজিটের ওটিপি কোডটি লিখুন।");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = (await res.json().catch(() => null)) as AuthResponse | null;
      if (!res.ok || !data?.user) {
        setError(data?.error ?? "ভেরিফিকেশন ব্যর্থ হয়েছে। সঠিক কোড দিন।");
        return;
      }

      // Successfully verified & registered — establish session
      setSession(
        data.user,
        data.enrollments ?? [],
        data.mocks ?? [],
        data.token ?? null,
        data.certificates ?? []
      );
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="mt-5 space-y-4">
        {/* Step 2: OTP Verification Screen */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="mt-2 font-display text-base font-bold text-foreground">
            ইমেইল ওটিপি ভেরিফিকেশন
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            আমরা একটি ৬ ডিজিটের কোড পাঠিয়েছি:
          </p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 font-mono text-xs font-semibold text-primary shadow-xs border border-primary/20">
            <Mail className="h-3.5 w-3.5" />
            {email}
          </div>
        </div>

        {successMsg && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-700 dark:text-emerald-300 text-center font-medium">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="portal-otp" className="text-center block text-sm font-semibold">
              ৬ ডিজিটের ভেরিফিকেশন কোড লিখুন
            </Label>
            <Input
              id="portal-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setOtp(val);
                setError(null);
              }}
              autoFocus
              className="text-center font-mono text-2xl font-bold tracking-[8px] h-14 border-primary/30 focus-visible:ring-primary"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive text-center"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={busy || otp.length !== 6}
            className="w-full rounded-full bg-ink py-6 text-base font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                Verifying code...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4.5 w-4.5 text-[#e5c068]" />
                Verify & Create Account
              </>
            )}
          </Button>
        </form>

        {/* Resend and Back controls */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setError(null);
            }}
            className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Edit details
          </button>

          <button
            type="button"
            disabled={!canResend || busy}
            onClick={handleResendOtp}
            className="flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
            {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Initial Information Form
  return (
    <form onSubmit={handleSendOtp} className="mt-5 space-y-3.5" noValidate>
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="portal-name" className="text-xs font-semibold">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="portal-name"
            placeholder="e.g. Rahim Ahmed"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            autoComplete="name"
            aria-invalid={!!error}
            className="pl-3.5 text-sm"
          />
        </div>
      </div>

      {/* Email Address (Mandatory) */}
      <div className="space-y-1.5">
        <Label htmlFor="portal-email" className="text-xs font-semibold">
          Email Address <span className="text-destructive">*</span>
          <span className="ml-1 text-[11px] font-normal text-muted-foreground">(OTP পাঠানো হবে)</span>
        </Label>
        <div className="flex overflow-hidden rounded-xl border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring/50">
          <span className="flex items-center gap-1.5 border-r border-input bg-secondary px-3 text-xs font-medium text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" aria-hidden />
          </span>
          <Input
            id="portal-email"
            type="email"
            placeholder="rahim@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            autoComplete="email"
            aria-invalid={!!error}
            className="rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>
      </div>

      {/* Mobile Number (Mandatory) */}
      <div className="space-y-1.5">
        <Label htmlFor="portal-new-phone" className="text-xs font-semibold">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <div className="flex overflow-hidden rounded-xl border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring/50">
          <span className="flex items-center gap-1.5 border-r border-input bg-secondary px-3 text-xs font-semibold text-primary">
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            +880
          </span>
          <Input
            id="portal-new-phone"
            type="tel"
            inputMode="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            maxLength={20}
            autoComplete="tel"
            aria-invalid={!!error}
            className="rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>
      </div>

      {/* Passwords */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="portal-new-pass" className="text-xs font-semibold">
            Password (min 6) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="portal-new-pass"
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="new-password"
              aria-invalid={!!error}
              className="text-sm pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="portal-confirm-pass" className="text-xs font-semibold">
            Confirm Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="portal-confirm-pass"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError(null);
            }}
            autoComplete="new-password"
            aria-invalid={!!error}
            className="text-sm"
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink py-6 text-base font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
            Sending OTP code...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4.5 w-4.5 text-[#e5c068]" />
            Send Email Verification Code
          </>
        )}
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        নিরাপদ ওটিপি কোড আপনার ইমেইলে পাঠানো হবে। একাউন্ট তৈরির পর{" "}
        <a href="#/checkout" className="font-semibold text-primary hover:underline">
          কোর্স ক্রয় করুন
        </a>
      </p>
    </form>
  );
}
