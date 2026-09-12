"use client";

import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site-data";

/**
 * Footer mirrors the real sadiasielts.com footer:
 * brand + contact block, then Company / Links / Courses / Recommend columns.
 */

const whatsappTeacher =
  "https://wa.me/8801752716238?text=Assalamu%20Alaikum!%20I%20want%20to%20apply%20as%20an%20instructor%20at%20Sadia's%20IELTS.";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#/about" },
      { label: "Blog", href: "#/tips" },
      { label: "Contact", href: "#/contact" },
      { label: "Become a Teacher", href: whatsappTeacher, external: true },
    ],
  },
  {
    title: "Links",
    links: [
      { label: "Courses", href: "#/courses" },
      { label: "Live Classes", href: "#/live" },
      { label: "Events", href: "#/routine" },
      { label: "Gallery", href: site.facebook, external: true },
      { label: "FAQs", href: "#faq" },
      { label: "Verify Certificate", href: "#/verify" },
    ],
  },
  {
    title: "Courses",
    links: [
      { label: "Basic To IELTS", href: "#/courses/basic-to-ielts-in-batch" },
      { label: "IELTS Without Basic", href: "#/courses" },
      { label: "Crash Course", href: "#/courses/ielts-crash-course" },
      { label: "Free Course", href: "#/courses/free-course" },
    ],
  },
  {
    title: "Recommend",
    links: [
      { label: "Shop", href: "#/shop" },
      { label: "Success Story", href: "#/stories" },
      { label: "Events", href: "#/routine" },
      { label: "Partnership", href: "#/contact" },
    ],
  },
];

type FooterLink = (typeof columns)[number]["links"][number];

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
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
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 bg-[#070708]">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr_1fr]">
            {/* Brand + contact — like the real site footer */}
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

              <ul className="mt-6 space-y-3.5 text-sm">
                <li>
                  <a
                    href={site.phoneHref}
                    className="group flex items-start gap-2.5 transition-colors hover:text-primary"
                  >
                    <Phone
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="text-muted-foreground transition-colors group-hover:text-primary">
                      +8801752-716238
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="max-w-[240px] text-muted-foreground">
                    Sreemangal, Moulvi Bazar District, Sylhet Division, Bangladesh, 3210
                  </span>
                </li>
                <li>
                  <a
                    href={`mailto:${site.email2}`}
                    className="group flex items-start gap-2.5 transition-colors hover:text-primary"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="break-all text-muted-foreground transition-colors group-hover:text-primary">
                      {site.email2}
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Link columns — Company / Links / Courses / Recommend */}
            {columns.map((col) => (
              <nav key={col.title} aria-label={`Footer — ${col.title}`}>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLinkItem key={link.label} link={link} />
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <Separator className="my-8 bg-primary/10" />

          <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Sadia&apos;s IELTS. All Rights Reserved.</p>
            <p className="flex items-center gap-4">
              <span className="cursor-pointer transition-colors hover:text-primary">
                Privacy
              </span>
              <span className="cursor-pointer transition-colors hover:text-primary">
                Terms
              </span>
              <span className="cursor-pointer transition-colors hover:text-primary">
                Sitemap
              </span>
            </p>
          </div>
        </div>
      </footer>
  );
}
