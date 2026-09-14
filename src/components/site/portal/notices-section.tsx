"use client";

import {
  Bell,
  CalendarClock,
  Facebook,
  Headphones,
  Info,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/site/reveal";
import { portalNotices, routineNote, site } from "@/lib/site-data";

const tagStyles: Record<string, string> = {
  "Class Update": "border-primary/40 bg-primary/10 text-primary",
  "Mock Test": "border-amber-600/40 bg-amber-500/10 text-amber-700",
  "Speaking Club": "border-emerald-600/40 bg-emerald-500/10 text-emerald-700",
  Notice: "border-border bg-accent text-muted-foreground",
};

const supportItems = [
  {
    icon: MessageCircle,
    label: "Batch WhatsApp Group",
    desc: "Class links & notices",
    href: site.whatsapp,
    external: true,
  },
  {
    icon: Phone,
    label: "Call Support",
    desc: site.phone,
    href: site.phoneHref,
    external: false,
  },
  {
    icon: Facebook,
    label: "Facebook Page",
    desc: "Free live classes",
    href: site.facebook,
    external: true,
  },
  {
    icon: Headphones,
    label: "Free Tips & Tricks",
    desc: "Practice material",
    href: "#/tips",
    external: false,
  },
];

export function NoticesSection() {
  return (
    <div className="space-y-6">
      <Reveal>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Bell className="h-5 w-5 text-primary" aria-hidden />
            Batch Notices
          </h2>
          <div className="mt-5 space-y-4">
            {portalNotices.map((n, i) => (
              <article
                key={n.title}
                className="relative flex gap-4 rounded-2xl border border-border bg-muted/50 p-4"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
                    {n.date.split(" ")[0]}
                  </span>
                  {i < portalNotices.length - 1 ? (
                    <span className="mt-2 w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${tagStyles[n.tag] ?? tagStyles.Notice}`}
                    >
                      {n.tag}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{n.date} Sep</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">{n.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Routine change note */}
      <Reveal y={12} delay={0.05}>
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Info className="h-4 w-4" aria-hidden />
            {routineNote.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{routineNote.message}</p>
        </div>
      </Reveal>

      {/* Support */}
      <Reveal y={12} delay={0.08}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Need Support?</h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {supportItems.map(({ icon: Icon, label, desc, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{desc}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-primary" aria-hidden />
            Support hours: Saturday – Thursday, 9:00 AM – 9:00 PM (GMT+6).
          </p>
        </div>
      </Reveal>
    </div>
  );
}
