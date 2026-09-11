"use client";

import Image from "next/image";
import { BadgeCheck, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { paymentMethods, site } from "@/lib/site-data";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#/about" },
      { label: "Student Portal", href: "#/portal" },
      { label: "Success Stories", href: "#/stories" },
      { label: "FAQs", href: "#faq" },
      { label: "Contact", href: "#/contact" },
    ],
  },
  {
    title: "Courses",
    links: [
      { label: "All Courses", href: "#/courses" },
      { label: "Basic to IELTS", href: "#/courses/basic-to-ielts-in-batch" },
      { label: "Pre-IELTS Course", href: "#/courses/pre-ielts" },
      { label: "Crash Course", href: "#/courses/ielts-crash-course" },
      { label: "Free Course", href: "#/courses/free-course" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Class Routine", href: "#/routine" },
      { label: "Free Live Classes", href: "#/routine" },
      { label: "Free Tips & Tricks", href: "#/tips" },
      { label: "Book Shop", href: "#/shop" },
      { label: "Our Facebook Page", href: site.facebook, external: true },
      { label: "Official Website", href: site.website, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-primary/10 bg-[#070708]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/sadia-logo.png"
                alt="Sadia's IELTS logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full ring-1 ring-primary/30"
              />
              <div>
                <p className="font-display text-lg font-bold tracking-wide">
                  Sadia&apos;s <span className="text-gold-gradient">IELTS</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Unlock Your Future
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Transform your English skills to perfection. {site.addressShort}&apos;s most
              trusted IELTS coaching — 9+ years, 316+ batches, 5,983+ learners.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sadia's IELTS on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-[#16120a]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${site.email}`}
                aria-label="Email Sadia's IELTS"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-[#16120a]"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={site.phoneHref}
                aria-label="Call Sadia's IELTS"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-[#16120a]"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={`Footer — ${col.title}`}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact strip */}
        <Separator className="my-8 bg-primary/10" />
        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <a
            href={site.phoneHref}
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" aria-hidden />
            {site.phone}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            {site.email}
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {site.address}
          </span>
        </div>

        <Separator className="my-8 bg-primary/10" />

        {/* Payment methods — 10MS style trust strip */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" aria-hidden />
            Easy Payment Via
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
            {paymentMethods.map((method) => (
              <li
                key={method}
                className="rounded-lg border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground/85"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-8 bg-primary/10" />
        <div className="flex flex-col items-center justify-between gap-3 px-0 text-xs text-muted-foreground sm:flex-row sm:px-28 lg:px-36">
          <p>© {new Date().getFullYear()} Sadia&apos;s IELTS. All Rights Reserved.</p>
          <p className="flex items-center gap-4">
            <span className="transition-colors hover:text-primary">Privacy</span>
            <span className="transition-colors hover:text-primary">Terms</span>
            <span className="transition-colors hover:text-primary">Sitemap</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
