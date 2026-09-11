"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/site/reveal";
import { site, stats } from "@/lib/site-data";
import { usePortalStore } from "@/lib/portal-store";

const demoAccounts = [
  { phone: "01712000001", label: "Anika — 2 courses" },
  { phone: "01712000002", label: "Fariha — Private Batch" },
  { phone: "01712000004", label: "Emran — Crash Course" },
  { phone: "01712000006", label: "Rakib — no enrollment (empty)" },
];

const benefits = [
  "ভর্তি করা কোর্সের সম্পূর্ণ weekly routine ও class links",
  "Course progress, attendance ও mock test band report",
  "Batch notice — সরাসরি mentor-এর কাছ থেকে",
  "Study materials ও speaking club সব এক জায়গায়",
];

/**
 * Private Student Portal login — phone + password (issued at enrollment).
 * Only enrolled students have credentials; the portal is never public.
 */
export function PortalLogin() {
  const setSession = usePortalStore((s) => s.setSession);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!phone.trim() || !password) {
      setError("Enter the mobile number and password you received at enrollment.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await res.json().catch(() => null)) as
        | {
            user?: { name: string; phone: string };
            enrollments?: never[];
            mocks?: never[];
            error?: string;
          }
        | null;
      if (!res.ok || !data?.user) {
        setError(data?.error ?? "Login failed — please try again.");
        return;
      }
      setSession(data.user, data.enrollments ?? [], data.mocks ?? []);
    } catch {
      setError("Could not reach the server — please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto grid max-w-4xl items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Benefits panel */}
          <Reveal>
            <div className="flex h-full flex-col justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient">
                <LockKeyhole className="h-5.5 w-5.5 text-[#16120a]" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                শুধু ভর্তিকৃত শিক্ষার্থীদের জন্য{" "}
                <span className="text-gold-gradient">প্রাইভেট পোর্টাল</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                ভর্তির সময় আপনার জন্য account ও password তৈরি করা হয় — পোর্টালের সব
                কনটেন্ট শুধু আপনার জন্য।
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
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient">
                    <KeyRound className="h-5 w-5 text-[#16120a]" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Portal Login</h3>
                    <p className="text-xs text-muted-foreground">
                      ভর্তির সময় দেওয়া মোবাইল নম্বর ও পাসওয়ার্ড দিন
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
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
                        autoComplete="username"
                        aria-invalid={!!error}
                        className="rounded-l-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                        placeholder="Your portal password"
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
                    className="w-full bg-gold-gradient py-6 text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90 disabled:opacity-60"
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

                <Separator className="my-5 bg-primary/10" />
                <details className="group rounded-xl border border-dashed border-border bg-[#101014] px-4 py-3">
                  <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-open:text-primary">
                    Demo accounts (for testing)
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {demoAccounts.map((d) => (
                      <button
                        key={d.phone}
                        type="button"
                        onClick={() => {
                          setPhone(d.phone);
                          setPassword("sadia123");
                          setError(null);
                        }}
                        className="rounded-full border border-border bg-[#141419] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {d.phone} · {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[11px] text-muted-foreground">
                    Password for all demo accounts:{" "}
                    <span className="font-mono font-bold text-primary">sadia123</span>
                  </p>
                </details>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Not enrolled yet?{" "}
                  <a href="#/contact" className="font-semibold text-primary hover:underline">
                    Enroll now
                  </a>{" "}
                  — or call{" "}
                  <a href={site.phoneHref} className="font-semibold text-primary hover:underline">
                    {site.phone}
                  </a>
                  . ভর্তির পরই আপনার login তৈরি হবে।
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
