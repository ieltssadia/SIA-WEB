"use client";

import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePortalStore, type PortalStudent } from "@/lib/portal-store";

export type PortalSection = "overview" | "routine" | "course" | "scores" | "notices";

const navItems: { id: PortalSection; label: string; short: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", short: "Home", icon: LayoutDashboard },
  { id: "routine", label: "My Routine", short: "Routine", icon: CalendarDays },
  { id: "course", label: "My Course", short: "Course", icon: BookOpen },
  { id: "scores", label: "Mock Scores", short: "Scores", icon: BarChart3 },
  { id: "notices", label: "Notices", short: "Notices", icon: Bell },
];

/**
 * 10MS-style app shell for the student portal:
 * desktop → sidebar navigation, mobile → compact top bar + bottom tab bar.
 */
export function PortalShell({
  student,
  section,
  onSectionChange,
  children,
}: {
  student: PortalStudent;
  section: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  children: ReactNode;
}) {
  const logout = usePortalStore((s) => s.logout);
  const firstName = student.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:px-8">
      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-4">
            <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              My Portal
            </p>
            <nav aria-label="Portal sections" className="mt-3 space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => {
                const active = section === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSectionChange(id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-gold-gradient text-[#16120a] shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
                        : "text-muted-foreground hover:bg-accent hover:text-primary"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* User block */}
            <div className="mt-4 rounded-2xl border border-primary/15 bg-[#101014] p-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient font-display text-base font-bold text-[#16120a]">
                  {student.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{firstName}</p>
                  <p className="truncate text-xs text-muted-foreground">{student.batch}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="mt-3 w-full border-primary/20 text-xs font-medium hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Log out
              </Button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 pb-24 lg:pb-0">
          {/* Mobile top bar */}
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-gradient font-display text-sm font-bold text-[#16120a]">
                {student.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">My Portal</p>
                <p className="truncate text-xs text-muted-foreground">
                  {firstName} · {student.batch}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              aria-label="Log out"
              className="h-9 w-9 shrink-0 border-primary/20 hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {children}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Portal sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/15 bg-[#0c0c10]/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {navItems.map(({ id, short, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]")} aria-hidden />
                {short}
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-all",
                    active ? "bg-gold-gradient" : "bg-transparent"
                  )}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
