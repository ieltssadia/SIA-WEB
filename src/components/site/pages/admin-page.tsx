"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Award,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Eye,
  EyeOff,
  FileUp,
  FolderDown,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  Library,
  Lightbulb,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Radio,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  Users,
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
import type { AdminRole, AdminStats } from "@/lib/admin-types";
import { ToneBadge, type Tone } from "@/components/site/admin/admin-shared";
import { AdminDashboard } from "@/components/site/admin/admin-dashboard";
import { AdminOrders } from "@/components/site/admin/admin-orders";
import { AdminLiveClasses } from "@/components/site/admin/admin-live-classes";
import { AdminLeads } from "@/components/site/admin/admin-leads";
import { AdminStudents } from "@/components/site/admin/admin-students";
import { AdminCertificates } from "@/components/site/admin/admin-certificates";
import { AdminTeam } from "@/components/site/admin/admin-team";
import { AdminCourses } from "@/components/site/admin/admin-courses";
import { AdminBooks } from "@/components/site/admin/admin-books";
import { AdminResources } from "@/components/site/admin/admin-resources";
import { AdminNotices } from "@/components/site/admin/admin-notices";
import { AdminTips } from "@/components/site/admin/admin-tips";
import { AdminSiteTeam } from "@/components/site/admin/admin-site-team";
import { AdminRoutine } from "@/components/site/admin/admin-routine";
import { AdminSuggestions } from "@/components/site/admin/admin-suggestions";

/** Every switchable panel of the admin shell (nav + section router). */
export type AdminSectionKey =
  | "dashboard"
  | "orders"
  | "live-classes"
  | "leads"
  | "students"
  | "certificates"
  | "courses"
  | "books"
  | "resources"
  | "notices"
  | "team"
  | "tips"
  | "site-team"
  | "routine"
  | "suggestions";

const ALL_ROLES: AdminRole[] = ["owner", "admin", "teacher"];

type NavItem = {
  key: AdminSectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AdminRole[];
};

/** Grouped sidebar — role-filtered per member (teacher sees a slim nav). */
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard · ড্যাশবোর্ড", icon: LayoutDashboard, roles: ALL_ROLES },
    ],
  },
  {
    label: "Catalog",
    items: [
      { key: "courses", label: "Courses · কোর্স", icon: BookOpen, roles: ["owner", "admin"] },
      { key: "books", label: "Shop Books · বই", icon: Library, roles: ["owner", "admin"] },
    ],
  },
  {
    label: "Learning",
    items: [
      { key: "live-classes", label: "Live Classes · লাইভ ক্লাস", icon: Radio, roles: ALL_ROLES },
      { key: "routine", label: "Routine · রুটিন", icon: CalendarDays, roles: ALL_ROLES },
      { key: "students", label: "Students · শিক্ষার্থী", icon: GraduationCap, roles: ALL_ROLES },
      { key: "certificates", label: "Certificates · সার্টিফিকেট", icon: Award, roles: ALL_ROLES },
      { key: "tips", label: "Free Tips · টিপস", icon: Lightbulb, roles: ALL_ROLES },
      { key: "suggestions", label: "Suggestions · সাজেশন", icon: FileUp, roles: ALL_ROLES },
    ],
  },
  {
    label: "Library",
    items: [
      { key: "resources", label: "Resources · রিসোর্স", icon: FolderDown, roles: ["owner", "admin"] },
      { key: "notices", label: "Notices · নোটিশ", icon: Megaphone, roles: ALL_ROLES },
      {
        key: "site-team",
        label: "Website Team · ওয়েবসাইট টিম",
        icon: IdCard,
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    label: "Sales",
    items: [
      { key: "orders", label: "Orders · অর্ডার", icon: ShoppingBag, roles: ["owner", "admin"] },
      { key: "leads", label: "Leads · লিড", icon: UserPlus, roles: ["owner", "admin"] },
    ],
  },
  {
    label: "System",
    items: [{ key: "team", label: "Team · টিম", icon: Users, roles: ["owner"] }],
  },
];

const SECTION_TITLE: Record<AdminSectionKey, string> = {
  dashboard: "Dashboard · ড্যাশবোর্ড",
  orders: "Orders · অর্ডার",
  "live-classes": "Live Classes · লাইভ ক্লাস",
  leads: "Leads · লিড",
  students: "Students · শিক্ষার্থী",
  certificates: "Certificates · সার্টিফিকেট",
  courses: "Courses · কোর্স",
  books: "Shop Books · বই",
  resources: "Resources · রিসোর্স",
  notices: "Notices · নোটিশ",
  team: "Team · টিম",
  tips: "Free Tips · টিপস",
  "site-team": "Website Team · ওয়েবসাইট টিম",
  routine: "Routine · রুটিন",
  suggestions: "Suggestions · সাজেশন",
};

const ROLE_TONE: Record<AdminRole, Tone> = {
  owner: "amber",
  admin: "blue",
  teacher: "emerald",
};

const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  teacher: "Teacher",
};

/** Is `key` reachable for `role`? (undefined role → dashboard only) */
function sectionAllowed(key: AdminSectionKey, role: AdminRole | null | undefined): boolean {
  if (!role) return key === "dashboard";
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.key === key) return item.roles.includes(role);
    }
  }
  return false;
}

/**
 * Admin Panel — full-screen (site-router early-returns this WITHOUT the
 * public header/footer). Email+password gate → persisted token+user →
 * sidebar shell grouped by OVERVIEW/CATALOG/LEARNING/LIBRARY/SALES/SYSTEM,
 * filtered by the member's role (owner > admin > teacher). Every API call
 * echoes the session token via the `x-admin-key` header.
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
// Login gate — per-member email + password (3 seeded demo accounts)
// ---------------------------------------------------------------------------

const DEMO_ACCOUNTS = [
  { role: "Owner", email: "sadia@team.com", password: "owner123" },
  { role: "Admin", email: "admin@team.com", password: "admin123" },
  { role: "Teacher", email: "teacher@team.com", password: "teacher123" },
];

function LoginGate({
  login,
  onLogin,
}: {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError("ইমেইল ও পাসওয়ার্ড দিন। (Enter email and password.)");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await login(email.trim(), password);
    setBusy(false);
    if (result.ok) {
      toast.success("স্বাগতম! (Welcome back)");
      onLogin();
    } else {
      setError(result.error ?? "ভুল ইমেইল বা পাসওয়ার্ড।");
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
              সাদিয়া'স আইএলটিএস ম্যানেজমেন্ট প্যানেল
            </p>
          </div>

          <form onSubmit={submit} className="w-full space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email · ইমেইল</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@team.com"
                autoComplete="email"
                autoFocus
                className="min-h-11 rounded-xl border-border bg-muted/40"
              />
            </div>
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
                "Log in · লগ ইন"
              )}
            </Button>
          </form>

          <div className="w-full rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
            <p className="mb-1 text-center font-semibold text-foreground">Demo accounts</p>
            <ul className="space-y-1">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email} className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{a.role}</span>
                  <span className="truncate font-mono text-[11px]">
                    {a.email} · {a.password}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell: grouped sidebar + sticky top bar + role-guarded section switch
// ---------------------------------------------------------------------------

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
  const user = useAdminStore((s) => s.user);
  const refreshUser = useAdminStore((s) => s.refreshUser);
  const logout = useAdminStore((s) => s.logout);
  const [mobileNav, setMobileNav] = useState(false);

  // Re-validate the session on shell mount — a disabled/removed account
  // clears the token in the store and this component unmounts to LoginGate.
  useEffect(() => {
    void refreshUser();
    // Run once per signed-in shell mount.
  }, [refreshUser]);

  // Role guard: a stale/forbidden section (e.g. Team as admin) falls back.
  useEffect(() => {
    if (user && !sectionAllowed(section, user.role)) {
      onSectionChange("dashboard");
    }
  }, [section, user, onSectionChange]);

  function go(key: AdminSectionKey) {
    if (user && !sectionAllowed(key, user.role)) {
      toast.error("এই সেকশনের অনুমতি আপনার নেই।");
      return;
    }
    onSectionChange(key);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navList = (
    <NavList active={section} user={user} onNavigate={go} onLogout={() => logout()} />
  );

  const roleChip = user ? (
    <ToneBadge tone={ROLE_TONE[user.role]} className="px-2.5 py-0.5 text-[10px]">
      {ROLE_LABEL[user.role]}
    </ToneBadge>
  ) : null;

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
            {roleChip}
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
          {section === "team" ? <AdminTeam /> : null}
          {section === "courses" ? <AdminCourses /> : null}
          {section === "books" ? <AdminBooks /> : null}
          {section === "resources" ? <AdminResources /> : null}
          {section === "notices" ? <AdminNotices /> : null}
          {section === "tips" ? <AdminTips /> : null}
          {section === "site-team" ? <AdminSiteTeam /> : null}
          {section === "routine" ? <AdminRoutine /> : null}
          {section === "suggestions" ? <AdminSuggestions /> : null}
        </main>
      </div>

      {/* Mobile navigation */}
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-72 overflow-y-auto p-4">
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
  user,
  onNavigate,
  onLogout,
}: {
  active: AdminSectionKey;
  user: { id: string; name: string; email: string; role: AdminRole } | null;
  onNavigate: (key: AdminSectionKey) => void;
  onLogout: () => void;
}) {
  const role = user?.role;
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !role || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  return (
    <nav aria-label="Admin navigation" className="flex h-full flex-col">
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

      <div className="flex-1 space-y-4 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ key, label, icon: Icon }) => {
                const isActive = key === active;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onNavigate(key)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {isActive ? (
                      <span
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Signed-in user card */}
      <div className="mt-4 space-y-1 border-t border-border pt-3">
        {user ? (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
              aria-hidden="true"
            >
              {user.name
                .split(" ")
                .map((part) => part[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
            <ToneBadge tone={ROLE_TONE[user.role]} className="px-2 py-0 text-[10px]">
              {ROLE_LABEL[user.role]}
            </ToneBadge>
          </div>
        ) : null}
        <a
          href="#/"
          className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          View Site · সাইট
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Logout · লগ আউট
        </button>
      </div>
    </nav>
  );
}

