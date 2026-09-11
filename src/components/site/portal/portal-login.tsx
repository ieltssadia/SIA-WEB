"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Reveal } from "@/components/site/reveal";
import { site, stats } from "@/lib/site-data";
import { usePortalStore, type PortalMock, type PortalStudent } from "@/lib/portal-store";

const demoNumbers = [
  { phone: "01712000001", label: "Anika — In Batch 317" },
  { phone: "01712000002", label: "Fariha — Private Batch" },
  { phone: "01712000003", label: "Milon — One-to-One" },
  { phone: "01712000004", label: "Emran — Crash Course" },
  { phone: "01712000005", label: "Eva — Pre-IELTS" },
];

const benefits = [
  "আপনার ব্যাচের সম্পূর্ণ weekly routine ও class links",
  "Course progress, attendance ও mock test band report",
  "Batch notice — সরাসরি mentor-এর কাছ থেকে",
  "Study materials ও speaking club সব এক জায়গায়",
];

/**
 * 10MS-style 2-step login: phone number → 6-digit OTP.
 * Demo mode: the OTP is shown in a hint chip instead of being sent by SMS.
 */
export function PortalLogin() {
  const setSession = usePortalStore((s) => s.setSession);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Cosmetic resend countdown once the OTP screen is visible
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  async function requestOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter the mobile number you enrolled with.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json().catch(() => null)) as
        | { sent?: boolean; devOtp?: string; error?: string }
        | null;
      if (!res.ok || !data?.sent) {
        setError(data?.error ?? "Could not send the OTP — please try again.");
        return;
      }
      setDevOtp(data.devOtp ?? null);
      setOtp("");
      setStep("otp");
      setResendIn(30);
    } catch {
      setError("Could not reach the server — please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(code: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: code }),
      });
      const data = (await res.json().catch(() => null)) as
        | { student?: PortalStudent; mocks?: PortalMock[]; error?: string }
        | null;
      if (!res.ok || !data?.student) {
        setError(data?.error ?? "Verification failed — please try again.");
        setOtp("");
        return;
      }
      setSession(data.student, data.mocks ?? []);
    } catch {
      setError("Could not reach the server — please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleOtpChange(value: string) {
    setError(null);
    setOtp(value);
    if (value.length === 6) void verifyOtp(value);
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto grid max-w-4xl items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Benefits panel */}
          <Reveal>
            <div className="flex h-full flex-col justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient">
                <ShieldCheck className="h-5.5 w-5.5 text-[#16120a]" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                ভর্তিকৃত শিক্ষার্থীদের জন্য{" "}
                <span className="text-gold-gradient">প্রাইভেট লার্নিং পোর্টাল</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Log in with the mobile number you enrolled with — we&apos;ll send a 6-digit OTP.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Separator className="my-5 bg-primary/15" />
              <div className="grid grid-cols-3 gap-3 text-center">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label} className="rounded-2xl border border-primary/15 bg-[#141419]/60 px-2 py-3">
                    <p className="font-display text-lg font-bold text-gold-gradient">
                      {s.value}
                      {s.suffix}+
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Login card */}
          <Reveal delay={0.08}>
            <Card className="h-full border-primary/25 bg-card shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6 md:p-8">
                {/* Step indicator */}
                <div className="flex items-center gap-2" aria-hidden>
                  {(["phone", "otp"] as const).map((s, i) => (
                    <div key={s} className="flex flex-1 items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          step === s || (s === "otp" && step === "otp")
                            ? "bg-gold-gradient text-[#16120a]"
                            : "border border-border bg-[#101014] text-muted-foreground"
                        } ${s === "phone" && step === "otp" ? "bg-gold-gradient text-[#16120a]" : ""}`}
                      >
                        {i + 1}
                      </span>
                      {i === 0 ? <span className="h-px flex-1 bg-border" /> : null}
                    </div>
                  ))}
                </div>

                {step === "phone" ? (
                  <>
                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">Portal Login</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ভর্তির সময় দেওয়া মোবাইল নম্বরটি লিখুন — OTP পাঠানো হবে।
                    </p>
                    <form onSubmit={requestOtp} className="mt-6 space-y-4" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="portal-phone">Mobile Number (used at enrollment)</Label>
                        <div className="flex overflow-hidden rounded-xl border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring/50">
                          <span className="flex items-center gap-1.5 border-r border-input bg-[#101014] px-3.5 text-sm font-semibold text-primary">
                            <Smartphone className="h-3.5 w-3.5" aria-hidden />
                            +880
                          </span>
                          <Input
                            id="portal-phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            placeholder="01XXX-XXXXXX"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setError(null);
                            }}
                            maxLength={20}
                            autoComplete="tel"
                            aria-invalid={!!error}
                            className="rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
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
                        className="w-full bg-gold-gradient py-6 text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90 disabled:opacity-60"
                      >
                        {busy ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            Send OTP
                            <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden />
                          </>
                        )}
                      </Button>
                    </form>

                    <Separator className="my-5 bg-primary/10" />
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                      Demo — tap a number to log in
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {demoNumbers.map((d) => (
                        <button
                          key={d.phone}
                          type="button"
                          onClick={() => {
                            setPhone(d.phone);
                            setError(null);
                          }}
                          className="rounded-full border border-border bg-[#101014] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          {d.phone} · {d.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setError(null);
                        setOtp("");
                      }}
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                      Change number
                    </button>
                    <h3 className="mt-3 font-display text-xl font-bold text-foreground">Verify OTP</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">+880{phone.replace(/\D/g, "").replace(/^0/, "")}</span>{" "}
                      নম্বরে পাঠানো ৬-ডিজিটের কোডটি লিখুন।
                    </p>

                    <div className="mt-6 flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={busy}
                        aria-label="6-digit OTP code"
                      >
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="h-12 w-10 rounded-xl border-primary/25 bg-[#101014] text-base font-bold text-foreground shadow-none md:w-11"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error ? (
                      <p
                        role="alert"
                        className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-center text-sm text-destructive"
                      >
                        {error}
                      </p>
                    ) : null}

                    {/* Demo OTP hint */}
                    {devOtp ? (
                      <button
                        type="button"
                        onClick={() => handleOtpChange(devOtp)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        <MessageSquareText className="h-3.5 w-3.5 text-primary" aria-hidden />
                        Demo mode — your OTP is{" "}
                        <span className="font-bold tracking-[0.3em] text-primary">{devOtp}</span> (tap to
                        autofill)
                      </button>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Didn&apos;t get the code?</span>
                      <button
                        type="button"
                        disabled={resendIn > 0 || busy}
                        onClick={() => setResendIn(30)}
                        className="font-semibold text-primary transition-opacity hover:underline disabled:opacity-50 disabled:hover:no-underline"
                      >
                        {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                      </button>
                    </div>
                  </>
                )}

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Not enrolled yet?{" "}
                  <a href="#/contact" className="font-semibold text-primary hover:underline">
                    Enroll now
                  </a>{" "}
                  — your portal opens as soon as you join a batch.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
