"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Award,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Radio,
  ShieldCheck,
  ShoppingBag,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useAdminStore } from "@/lib/admin-store";
import type { AdminStats } from "@/lib/admin-types";
import {
  AdminDashboard,
  type AdminSectionKey,
} from "@/components/site/admin/admin-dashboard";
import { AdminOrders } from "@/components/site/admin/admin-orders";
import { AdminLiveClasses } from "@/components/site/admin/admin-live-classes";
import { AdminLeads } from "@/components/site/admin/admin-leads";
import { AdminStudents } from "@/components/site/admin/admin-students";
import { AdminCertificates } from "@/components/site/admin/admin-certificates";

/**
 * Admin Panel — full-screen (site-router early-returns this WITHOUT the
 * public header/footer). Password gate → persisted token → sidebar shell:
 * Dashboard / Orders / Live Classes / Leads / Students / Certificates.
 * Auth is a single shared password; every API call echoes the token via the
 * `x-admin-key` header.
 */
export function AdminPage() {
  const token = useAdminStore((s) => s.token);
  const hasHydrated = useAdminStore((s) => s.hasHydrated);
  const login = useAdminStore((s) => s.login);

  const [section, setSection] = useState<AdminSectionKey>("dashboard");
  const [liveCount, setLiveCount] = useState(0);

  // Restore the persisted token AFTER mount (skipHydration) — restoring
  // during the first client render races React hydration.
  useEffect(() => {
    useAdminStore.persist.rehydrate();
  }, []);

  function handleStats(stats: AdminStats) {
    setLiveCount(stats.liveClasses.live);
  }

  let content: React.ReactNode;
  if (!hasHydrated) {
    content = (
      <div className="flex min-h-screen items-center justify-center bg-background" aria-busy="true">
        <div className="h-64 w-full max-w-sm animate-pulse rounded-3xl bg-card/70" />
      </div>
    );
  } else if (!token) {
    content = <LoginGate onLogin={() => setSection("dashboard")} login={login} />;
  } else {
    content = (
      <AdminShell section={section} onSectionChange={setSection} liveCount={liveCount} onStats={handleStats} />
    );
  }

  return (
    <>
      <Toaster theme="light" position="top-right" closeButton />
      {content}
    </>
  );
}

// ---------------------------------------------------------------------------
// Password gate
// ---------------------------------------------------------------------------

function LoginGate({
  login,
  onLogin,
}: {
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  onLogin: () => void;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) {
      setError("পাসওয়ার্ড লিখুন। (Enter the password.)");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await login(password);
    setBusy(false);
    if (result.ok) {
      toast.success("স্বাগতম! (Welcome back)");
      onLogin();
    } else {
      setError(result.error ?? "ভুল পাসওয়ার্ড।");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm rounded-3xl border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:p-8">
          <Image
            src="/sadia-logo.png"
            alt="Sadia's IELTS logo"
            width={150}
            height={44}
            priority
            className="h-auto w-36"
          />
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Admin Panel
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              সাদিয়া'স আইএলটিএস — ম্যানেজমেন্ট প্যানেল
            </p>
          </div>

          <form onSubmit={submit} className="w-full space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password · পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  autoFocus
                  className="min-h-11 rounded-xl border-border bg-muted/40 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground"
                  aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={busy}
              className="min-h-11 w-full rounded-full bg-ink text-white hover:bg-ink/90"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Checking…
                </>
              ) : (
                "Log in — লগ ইন"
              )}
            </Button>
          </form>

          <p className="rounded-xl bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
            Demo access: <span className="font-mono font-semibold text-foreground">sadia-admin-2025</span>
            {" "}· set <span className="font-mono">ADMIN_PASSWORD</span> env to change
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell: sidebar + sticky top bar + section switch
// ---------------------------------------------------------------------------

const NAV: { key: AdminSectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard — ড্যাশবোর্ড", icon: LayoutDashboard },
  { key: "orders", label: "Orders — অর্ডার", icon: ShoppingBag },
  { key: "live-classes", label: "Live Classes — লাইভ ক্লাস", icon: Radio },
  { key: "leads", label: "Leads — লিড", icon: UserPlus },
  { key: "students", label: "Students — শিক্ষার্থী", icon: GraduationCap },
  { key: "certificates", label: "Certificates — সার্টিফিকেট", icon: Award },
];

const SECTION_TITLE: Record<AdminSectionKey, string> = {
  dashboard: "Dashboard — ড্যাশবোর্ড",
  orders: "Orders — অর্ডার",
  "live-classes": "Live Classes — লাইভ ক্লাস",
  leads: "Leads — লিড",
  students: "Students — শিক্ষার্থী",
  certificates: "Certificates — সার্টিফিকেট",
};

function AdminShell({
  section,
  onSectionChange,
  liveCount,
  onStats,
}: {
  section: AdminSectionKey;
  onSectionChange: (key: AdminSectionKey) => void;
  liveCount: number;
  onStats: (stats: AdminStats) => void;
}) {
  const logout = useAdminStore((s) => s.logout);
  const [mobileNav, setMobileNav] = useState(false);

  function go(key: AdminSectionKey) {
    onSectionChange(key);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navList = (
    <NavList active={section} onNavigate={go} onLogout={() => logout()} />
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
        {navList}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky top bar */}
        <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-background/90 px-4 py-2 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-border bg-card lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="মেনু খুলুন (Open navigation)"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
            {SECTION_TITLE[section]}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {liveCount > 0 ? (
              <span
                className="flex items-center gap-1.5 rounded-full border border-[#b5d4c4] bg-[#e8f0ea] px-3 py-1 text-xs font-semibold text-[#225941]"
                aria-label={`${liveCount} live class running`}
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2e7d5b] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#28694d]" />
                </span>
                {liveCount} live
              </span>
            ) : null}
            <Image
              src="/sadia-logo.png"
              alt="Sadia's IELTS"
              width={96}
              height={28}
              className="hidden h-6 w-auto sm:block"
            />
          </div>
        </header>

        {/* Sections — lazy-switched by state (like the portal) */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {section === "dashboard" ? (
            <AdminDashboard onStats={onStats} onNavigate={go} />
          ) : null}
          {section === "orders" ? <AdminOrders /> : null}
          {section === "live-classes" ? <AdminLiveClasses /> : null}
          {section === "leads" ? <AdminLeads /> : null}
          {section === "students" ? <AdminStudents /> : null}
          {section === "certificates" ? <AdminCertificates /> : null}
        </main>
      </div>

      {/* Mobile navigation */}
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>অ্যাডমিন প্যানেল নেভিগেশন</SheetDescription>
          </SheetHeader>
          {navList}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavList({
  active,
  onNavigate,
  onLogout,
}: {
  active: AdminSectionKey;
  onNavigate: (key: AdminSectionKey) => void;
  onLogout: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="flex h-full flex-col gap-1">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1">
        <Image
          src="/sadia-logo.png"
          alt="Sadia's IELTS"
          width={140}
          height={40}
          className="h-8 w-auto"
        />
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Admin
        </span>
      </div>

      {NAV.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium transition ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {isActive ? (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" aria-hidden="true" />
            ) : null}
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}

      <div className="mt-auto space-y-1 pt-4">
        <a
          href="#/"
          className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          View Site — সাইট
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Logout — লগ আউট
        </button>
      </div>
    </nav>
  );
}
