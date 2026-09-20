"use client";

import { useState, type ReactNode } from "react";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FolderDown,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  LifeBuoy,
  LogOut,
  Menu,
  Radio,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { site } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { usePortalStore, type PortalUser } from "@/lib/portal-store";

export type PortalSection =
  | "overview"
  | "routine"
  | "course"
  | "scores"
  | "certificates"
  | "downloads"
  | "suggestions"
  | "notices";

type NavItem = {
  id: PortalSection;
  label: string;
  short: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Section items — certificates and downloads are now first-class, separate pages. */
const navGroups: NavGroup[] = [
  {
    label: "শেখা",
    items: [
      { id: "overview", label: "ড্যাশবোর্ড", short: "হোম", icon: LayoutDashboard },
      { id: "routine", label: "আমার রুটিন", short: "রুটিন", icon: CalendarDays },
      { id: "course", label: "আমার কোর্স", short: "কোর্স", icon: BookOpen },
    ],
  },
  {
    label: "প্রোগ্রেস",
    items: [
      { id: "scores", label: "মক স্কোর", short: "স্কোর", icon: BarChart3 },
      { id: "certificates", label: "সার্টিফিকেট", short: "সার্ট", icon: Award },
    ],
  },
  {
    label: "লাইব্রেরি",
    items: [
      { id: "downloads", label: "ডাউনলোডস", short: "ফাইল", icon: FolderDown },
      { id: "suggestions", label: "সাজেশন", short: "সাজেশন", icon: Lightbulb },
      { id: "notices", label: "নোটিশ", short: "নোটিশ", icon: Bell },
    ],
  },
];

const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
const moreSections: PortalSection[] = ["certificates", "downloads", "suggestions", "notices"];

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  onSelect: (s: PortalSection) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-primary"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#d9b75c] transition-opacity",
          active ? "opacity-100" : "opacity-0"
        )}
      />
      <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
      {item.label}
    </button>
  );
}

function LiveClassLink() {
  return (
    <a
      href="#/live"
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-primary"
    >
      <span className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center">
        <Radio className="h-4.5 w-4.5" aria-hidden />
        <span
          aria-hidden
          className="absolute -right-1 -top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-red-600"
        />
      </span>
      লাইভ ক্লাস
      <ChevronRight
        className="ml-auto h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  );
}

/** Shared page header so every portal section reads like one coherent app. */
export function PortalSectionHeader({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground md:text-[28px]">
          {title}
        </h1>
        {desc ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{desc}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function SidebarHelpCard() {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 flex items-start gap-3 rounded-2xl border border-[#d9b75c]/25 bg-[#d9b75c]/[0.07] p-3.5 transition-colors hover:border-[#d9b75c]/50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/15">
        <LifeBuoy className="h-4.5 w-4.5 text-[#8a7a4d]" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">সহায়তা দরকার?</span>
        <span className="block text-xs leading-snug text-muted-foreground">
          WhatsApp-এ মেসেজ করুন — সকাল ৯টা থেকে রাত ৯টা
        </span>
      </span>
    </a>
  );
}

/**
 * Professional EdTech app shell for the student portal:
 * desktop → grouped sidebar navigation, mobile → compact top bar +
 * 5-tab bottom bar with a "More" sheet for the rest.
 */
export function PortalShell({
  user,
  batchLabel,
  section,
  onSectionChange,
  children,
}: {
  user: PortalUser;
  /** Primary batch label shown under the user's name. */
  batchLabel: string;
  section: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  children: ReactNode;
}) {
  const logout = usePortalStore((s) => s.logout);
  const [moreOpen, setMoreOpen] = useState(false);
  const firstName = user.name.split(" ")[0];
  const moreActive = moreSections.includes(section);

  function go(next: PortalSection) {
    setMoreOpen(false);
    onSectionChange(next);
  }

  const userCard = (
    <div className="rounded-2xl border border-white/10 bg-[#121009] p-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-display text-base font-bold text-white">
          {user.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#f6ecd4]">{firstName}</p>
          <p className="truncate text-xs text-[#c6b995]">{batchLabel}</p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={logout}
        className="mt-3 w-full border-white/15 bg-transparent text-xs font-medium text-[#f6ecd4] hover:border-red-500/50 hover:bg-red-500/10 hover:text-[#d98487]"
      >
        <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        লগ আউট
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-4">
            <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Student Portal
            </p>
            <nav aria-label="Portal sections" className="mt-3 space-y-4">
              {navGroups.map((group, gi) => (
                <div key={group.label}>
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavButton
                        key={item.id}
                        item={item}
                        active={section === item.id}
                        onSelect={onSectionChange}
                      />
                    ))}
                    {/* Live classes sits with the learning group */}
                    {gi === 0 ? <LiveClassLink /> : null}
                  </div>
                </div>
              ))}
            </nav>

            <SidebarHelpCard />
            <div className="mt-4">{userCard}</div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 pb-24 lg:pb-0">
          {/* Mobile top bar */}
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-display text-sm font-bold text-white">
                {user.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Student Portal</p>
                <p className="truncate text-xs text-muted-foreground">
                  {firstName} · {batchLabel}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              aria-label="লগ আউট"
              className="h-9 w-9 shrink-0 border-primary/20 hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {children}
        </div>
      </div>

      {/* Mobile bottom tab bar — 5 primary tabs, rest inside the More sheet */}
      <nav
        aria-label="Portal sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {(["overview", "routine", "course", "scores"] as PortalSection[]).map((id) => {
            const item = allNavItems.find((n) => n.id === id)!;
            const Icon = item.icon;
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.short}
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-all",
                    active ? "bg-primary" : "bg-transparent"
                  )}
                />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            className={cn(
              "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors",
              moreActive ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <span className="relative">
              <Menu className="h-5 w-5" aria-hidden />
              {moreActive ? (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full border border-white bg-[#d9b75c]"
                />
              ) : null}
            </span>
            আরও
            <span
              aria-hidden
              className={cn(
                "h-0.5 w-6 rounded-full transition-all",
                moreActive ? "bg-primary" : "bg-transparent"
              )}
            />
          </button>
        </div>
      </nav>

      {/* More sheet — the remaining sections + logout */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" aria-describedby={undefined} className="rounded-t-3xl px-0 pb-6 pt-0">
          <SheetHeader className="border-b border-border px-5 pb-3 pt-4">
            <SheetTitle className="font-display text-base text-foreground">
              আরও অপশন
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="More portal sections" className="space-y-1 px-4 pt-3">
            {moreSections.map((id) => {
              const item = allNavItems.find((n) => n.id === id)!;
              const Icon = item.icon;
              const active = section === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent hover:text-primary"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                  {item.label}
                  {active ? (
                    <Badge className="ml-auto bg-gold-gradient text-[10px] font-bold text-ink hover:bg-gold-gradient">
                      এখানে
                    </Badge>
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/60" aria-hidden />
                  )}
                </button>
              );
            })}
            <a
              href="#/live"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              <Radio className="h-4.5 w-4.5 shrink-0" aria-hidden />
              লাইভ ক্লাস
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/60" aria-hidden />
            </a>
            <div className="my-2 border-t border-border" aria-hidden />
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" aria-hidden />
              লগ আউট
              <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                {user.phone}
              </span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
