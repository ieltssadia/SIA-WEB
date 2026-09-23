import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  Home,
  Lightbulb,
  Mail,
  MessagesSquare,
  NotebookPen,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { site } from "@/lib/site-data";

/**
 * Branded 404, shared by two entry points:
 * 1. The hash router (unknown "#/..." routes fall through to this page).
 * 2. src/app/not-found.tsx (real 404 paths at the Next.js level).
 * Pure presentational: no hooks, so both client and server parents can render it.
 */

const popularPages = [
  { label: "কোর্সসমূহ", hint: "Courses", href: "#/courses", icon: GraduationCap },
  { label: "ফ্রি মক টেস্ট", hint: "Cambridge Mock", href: "#/cambridge", icon: NotebookPen },
  { label: "ক্লাস রুটিন", hint: "Class Routine", href: "#/routine", icon: CalendarDays },
  { label: "টিপস ও রিসোর্স", hint: "Tips & Resources", href: "#/tips", icon: Lightbulb },
  { label: "বইয়ের দোকান", hint: "Book Shop", href: "#/shop", icon: ShoppingBag },
  { label: "স্টুডেন্ট পোর্টাল", hint: "Student Portal", href: "#/portal", icon: UserRound },
  { label: "সার্টিফিকেট যাচাই", hint: "Verify Certificate", href: "#/verify", icon: ShieldCheck },
  { label: "যোগাযোগ", hint: "Contact", href: "#/contact", icon: MessagesSquare },
];

export function NotFoundPage() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden border-b border-primary/10">
      {/* Ambient brand glows, same language as PageHeader */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[360px] w-[360px] rounded-full bg-radial-glow blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[320px] w-[320px] rounded-full bg-radial-glow blur-2xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-16 text-center md:py-24 lg:px-8">
        <Reveal y={12}>
          {/* Oversized display numeral in engraved gold */}
          <p
            aria-hidden
            className="font-display text-[5.5rem] font-extrabold leading-none tracking-tight md:text-[9rem]"
          >
            <span className="text-brand-gradient">404</span>
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
            পাতাটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Page not found · Error 404
          </p>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            আপনি যে ঠিকানাটি খুঁজছেন সেটি হয়তো সরিয়ে ফেলা হয়েছে, নাম বদলে
            গেছে অথবা লিংকটিতে ভুল আছে। সমস্যা নেই, নিচের যেকোনো লিংক থেকে আবার
            যাত্রা শুরু করতে পারেন।
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-full bg-ink px-7 font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85"
            >
              <Link href="#/">
                <Home className="mr-2 h-4 w-4" aria-hidden />
                হোমপেজে ফিরুন
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full px-7 font-semibold"
            >
              <Link href="#/courses">
                কোর্স দেখুন
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Popular destinations so the visitor is never stuck */}
        <Reveal delay={0.08} className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            জনপ্রিয় পেজসমূহ
          </p>
          <ul className="mx-auto mt-5 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {popularPages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <page.icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-foreground">
                    {page.label}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {page.hint}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Contact strip — a wrong turn should still lead to a human */}
        <Reveal delay={0.14}>
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm sm:flex-row sm:gap-6">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <MessagesSquare className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              ঠিকানাটি খুঁজে পাচ্ছেন না? আমাদের জানান:
            </p>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {site.email}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
