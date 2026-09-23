"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  ScrollText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { books, courses, site } from "@/lib/site-data";

/**
 * Sitemap — every page of the site grouped in one place.
 * Data-driven from site-data so new courses/books appear automatically.
 */

type LinkItem = { label: string; href: string; hint?: string; external?: boolean };

type Group = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  links: LinkItem[];
};

const groups: Group[] = [
  {
    icon: Home,
    title: "Main Pages",
    links: [
      { label: "Home", href: "#/", hint: "হোমপেজ" },
      { label: "Courses", href: "#/courses", hint: "সব কোর্স ও ব্যাচ" },
      { label: "Cambridge", href: "#/cambridge", hint: "বই ও ফ্রি টেস্ট" },
      { label: "Free Tips", href: "#/tips", hint: "IELTS টিপস ব্লগ" },
      { label: "Events", href: "#/routine", hint: "ক্লাস রুটিন" },
      { label: "About", href: "#/about" },
      { label: "Team", href: "#/team" },
      { label: "Success Stories", href: "#/stories" },
      { label: "Shop", href: "#/shop", hint: "বই ও ম্যাটেরিয়ালস" },
      { label: "Contact", href: "#/contact" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Courses",
    links: courses.map((c) => ({
      label: c.title,
      href: `#/courses/${c.slug}`,
      hint: c.titleBn,
    })),
  },
  {
    icon: BookOpen,
    title: "Shop Books",
    links: books.map((b) => ({ label: b.title, href: "#/shop", hint: b.titleBn })),
  },
  {
    icon: UserRound,
    title: "Student Account",
    links: [
      { label: "Student Portal", href: "#/portal", hint: "লগইন / রেজিস্ট্রেশন" },
      { label: "Checkout", href: "#/checkout", hint: "ভর্তি ফর্ম" },
      { label: "Verify Certificate", href: "#/verify", hint: "সার্টিফিকেট যাচাই" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#/privacy", hint: "প্রাইভেসি পলিসি" },
      { label: "Terms & Conditions", href: "#/terms", hint: "শর্তাবলী" },
      { label: "Refund & Return Policy", href: "#/refund-policy", hint: "রিফান্ড ও রিটার্ন" },
      { label: "Sitemap", href: "#/sitemap", hint: "এই পেজ" },
      { label: "Facebook Page", href: site.facebook, hint: "আপডেট ও লাইভ", external: true },
    ],
  },
];

export function SitemapPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            সাইটম্যাপ <span className="text-brand-gradient">Sitemap</span>
          </>
        }
        subtitle="সদিয়া'স আইএলটিএস ওয়েবসাইটের সব পেজ এক জায়গায়, যেটা খুঁজছেন এক ক্লিকেই।"
        crumbs={[{ label: "Sitemap" }]}
      />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-[320px] w-[320px] rounded-full bg-radial-glow blur-2xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, gi) => (
              <Reveal key={group.title} y={16} delay={gi * 0.05}>
                <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
                  <h2 className="flex items-center gap-2.5 font-display text-base font-bold text-foreground">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <group.icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    {group.title}
                    <span className="ml-auto text-xs font-medium text-muted-foreground">
                      {group.links.length} পেজ
                    </span>
                  </h2>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {group.links.map((link) => (
                      <li key={link.label + link.href}>
                        <Link
                          href={link.href}
                          {...(link.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/70"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                              {link.label}
                            </span>
                            {link.hint ? (
                              <span className="block truncate text-xs text-muted-foreground">
                                {link.hint}
                              </span>
                            ) : null}
                          </span>
                          {link.external ? (
                            <ArrowUpRight
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                              aria-hidden
                            />
                          ) : (
                            <FileText
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary"
                              aria-hidden
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}

            {/* Legal doc descriptions card — fills the grid nicely */}
            <Reveal y={16} delay={0.25}>
              <div className="flex h-full flex-col rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <h2 className="flex items-center gap-2.5 font-display text-base font-bold text-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <ScrollText className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  লিগ্যাল ডকুমেন্টস
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  প্রাইভেসি পলিসি, শর্তাবলী ও রিফান্ড পলিসি, তিনটি ডকুমেন্টই বাংলায় লেখা,
                  সহজ ভাষায়। ভর্তি বা অর্ডারের আগে একবার পড়ে নিলে দুই পক্ষের
                  প্রত্যাশা পরিষ্কার থাকে।
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      href="#/privacy"
                      className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      → প্রাইভেসি পলিসি
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#/terms"
                      className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      → শর্তাবলী (Terms)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#/refund-policy"
                      className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      → রিফান্ড ও রিটার্ন পলিসি
                    </Link>
                  </li>
                </ul>
                <p className="mt-auto pt-4 text-xs text-muted-foreground">
                  সর্বশেষ হালনাগাদ: ২৩ সেপ্টেম্বর ২০২৬
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
