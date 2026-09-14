"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Lightbulb, Mail, Menu, Phone, MapPin, Quote, Users, GraduationCap, LayoutDashboard, LogIn, Search, ShoppingBag, Timer, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { navPrimary, navMore, promoBar, site } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { usePortalStore } from "@/lib/portal-store";
import { cartCount, useCartStore } from "@/lib/cart-store";
import { CartSheet } from "@/components/site/cart-sheet";
import { SearchDialog } from "@/components/site/search-dialog";
import { compactCountdown, useOfferCountdown } from "@/lib/offer";

const emptySubscribe = () => () => {};

/* "More" dropdown icon + jewel-pastel chip rotation (Gilded Court order) */
const MORE_ICONS: Record<string, LucideIcon> = {
  "#/about": Users,
  "#/tips": Lightbulb,
  "#/stories": Quote,
  "#/shop": ShoppingBag,
  "#/contact": Phone,
};
const MORE_CHIPS = [
  "bg-pastel-sky text-[#2c4f8a]",
  "bg-pastel-butter text-[#7a5a16]",
  "bg-pastel-ruby text-[#7a2734]",
  "bg-pastel-green text-[#1f5c40]",
  "bg-pastel-orange text-[#7a4c12]",
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoClosed, setPromoClosed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const route = useHashRoute();
  // "More" trigger wears the active pill while any of its routes is open
  const moreActive = navMore.some((l) => (l.href.replace(/^#/, "") || "/") === route);
  // 10MS-style "অফার শেষ হতে বাকি" timer for the announcement bar
  const countdown = useOfferCountdown();
  const offerLeft = compactCountdown(countdown); // "" until mounted → hydration-safe
  // Swaps the header CTA to "My Portal" once the persisted session restores
  const portalUser = usePortalStore((s) => s.user);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);
  const portalAuthed = hasHydrated && !!portalUser;
  // Cart badge — count only after mount so SSR/client markup matches
  const cartItems = useCartStore((s) => s.items);
  // Live-now indicator — pings the live-class API every 60 s; the pulsing dot
  // only decorates the "Live" nav item, so a failed fetch is harmless.
  const [liveNow, setLiveNow] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = () =>
      fetch("/api/live-classes", { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          setLiveNow(
            !!json?.ok &&
              Array.isArray(json.classes) &&
              json.classes.some((c: { status?: string }) => c.status === "live")
          );
        })
        .catch(() => {});
    check();
    const t = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);
  // Hydration-safe "client only" flag (false during SSR, true on client)
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const bagCount = mounted ? cartCount(cartItems) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    /* NOTE: no overflow-hidden here — it would clip the "More" dropdown panel */
    <header className="sticky top-0 z-50">
      {/* Promo announcement bar — 10MS style, dismissible, collapses on scroll */}
      {!promoClosed ? (
        <div
          className={`relative overflow-hidden bg-brand-gradient text-white transition-all duration-300 ${
            scrolled ? "max-h-0" : "max-h-12"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-xs font-semibold lg:px-8">
            <p className="truncate">{promoBar.message}</p>
            {offerLeft ? (
              <span className="hidden shrink-0 items-center gap-1 text-[11px] font-semibold text-white/80 sm:flex">
                <Timer className="h-3 w-3" aria-hidden />
                <span className="tabular-nums">অফার শেষ হতে বাকি {offerLeft}</span>
                <span className="hidden md:inline">· {countdown.endsOn}</span>
              </span>
            ) : null}
            <a
              href={promoBar.ctaHref}
              className="hidden shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-primary transition-opacity hover:opacity-85 sm:inline-block"
            >
              {promoBar.ctaLabel}
            </a>
          </div>
          <button
            type="button"
            onClick={() => setPromoClosed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-black/10"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ) : null}

      {/* Top contact strip — collapses on scroll to keep the sticky nav compact */}
      <div
        className={`hidden overflow-hidden border-b border-border/70 bg-muted/60 transition-all duration-300 md:block ${
          scrolled ? "max-h-0" : "max-h-12"
        }`}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground lg:px-8">
          <div className="flex items-center gap-5">
            <a
              href={site.phoneHref}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Phone className="h-3 w-3 text-primary" aria-hidden />
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Mail className="h-3 w-3 text-primary" aria-hidden />
              {site.email}
            </a>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary" aria-hidden />
              {site.addressShort}
            </span>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sadia's IELTS on Facebook"
              className="transition-colors hover:text-primary"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-border/80 bg-card/90 shadow-[0_12px_32px_rgba(30,27,20,0.08)] backdrop-blur-xl"
            : "border-transparent bg-card/60 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          {/* Logo */}
          <Link href="#/" className="flex min-w-0 items-center gap-3" aria-label="Sadia's IELTS — Home">
            <Image
              src="/sadia-logo.png"
              alt="Sadia's IELTS logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full ring-1 ring-primary/30"
              priority
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-bold leading-tight tracking-wide">
                Sadia&apos;s <span className="text-brand-gradient">IELTS</span>
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
                Unlock Your Future
              </span>
            </span>
          </Link>

          {/* Desktop nav — 10MS-style de-cluttered pill group: 4 primary links + "More" dropdown */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 rounded-full border border-border/80 bg-card/80 p-1 shadow-[0_2px_16px_rgba(30,27,20,0.06)] backdrop-blur xl:flex"
          >
            {navPrimary.map((link) => {
              const target = link.href.replace(/^#/, "") || "/";
              const active = route === target;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-ink text-white"
                      : "text-foreground/75 hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {link.label}
                  {link.href === "#/live" && liveNow ? (
                    <span
                      aria-hidden
                      className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 align-middle"
                    />
                  ) : null}
                </a>
              );
            })}

            {/* Secondary links under a "More" dropdown (viewport=false → inline panel).
                Rendered after mount only — Radix useId differs between SSR and client
                otherwise (same hydration gate as CartSheet / SearchDialog / mobile Sheet) */}
            {mounted ? (
              <NavigationMenu viewport={false}>
                <NavigationMenuList className="gap-0">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`h-auto rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                        moreActive
                          ? "bg-ink text-white hover:bg-ink hover:text-white focus:bg-ink focus:text-white data-[state=open]:bg-ink data-[state=open]:text-white"
                          : "bg-transparent text-foreground/75 hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary data-[state=open]:bg-secondary data-[state=open]:text-primary"
                      }`}
                    >
                      More
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="rounded-2xl border-border bg-card p-2 shadow-[0_24px_60px_rgba(30,27,20,0.16)]">
                      <div className="grid w-[320px] gap-0.5">
                        {navMore.map((item, i) => {
                          const Icon = MORE_ICONS[item.href] ?? Users;
                          return (
                            <NavigationMenuLink asChild key={item.href}>
                              <a
                                href={item.href}
                                className="flex flex-row items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary/80 focus-visible:bg-secondary/80"
                              >
                                <span
                                  aria-hidden
                                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                    MORE_CHIPS[i % MORE_CHIPS.length]
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-foreground">
                                    {item.label}
                                  </span>
                                  <span className="block text-xs leading-snug text-muted-foreground">
                                    {item.desc}
                                  </span>
                                </span>
                              </a>
                            </NavigationMenuLink>
                          );
                        })}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search — opens the ⌘K palette */}
            <Button
              variant="outline"
              size="icon"
              aria-label="Search (Ctrl+K)"
              onClick={() => setSearchOpen(true)}
              className="rounded-full border-border/80 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Search className="h-4.5 w-4.5" aria-hidden />
            </Button>
            {/* Cart — opens the slide-over bag (client-only to stay hydration-safe:
                Radix useId differs between SSR and client otherwise) */}
            {mounted ? (
              <CartSheet
                open={cartOpen}
                onOpenChange={setCartOpen}
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Open cart${bagCount ? ` — ${bagCount} item${bagCount > 1 ? "s" : ""}` : ""}`}
                  className="relative rounded-full border-border/80 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
                  {bagCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-gradient px-1 text-[10px] font-bold text-ink shadow">
                      {bagCount > 9 ? "9+" : bagCount}
                    </span>
                  ) : null}
                </Button>
              }
              />
            ) : null}
            <a
              href={site.phoneHref}
              className="hidden items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent 2xl:flex"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {site.phone}
            </a>
            {!portalAuthed ? (
              <Button
                asChild
                variant="outline"
                className="hidden border-primary/30 font-semibold text-primary hover:bg-primary/10 hover:text-primary sm:inline-flex"
              >
                <a href="#/portal">
                  <LogIn className="mr-1 h-4 w-4" aria-hidden />
                  Log in
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              className="hidden rounded-full bg-gold-gradient px-5 font-semibold text-ink shadow-[0_6px_20px_rgba(169,127,42,0.35)] transition-transform hover:scale-[1.03] sm:inline-flex"
            >
              <a href={portalAuthed ? "#/portal" : "#/checkout"}>
                {portalAuthed ? (
                  <LayoutDashboard className="mr-1 h-4 w-4" aria-hidden />
                ) : (
                  <GraduationCap className="mr-1 h-4 w-4" aria-hidden />
                )}
                {portalAuthed ? "My Portal" : "Enroll Now"}
              </a>
            </Button>

            {/* Mobile menu — Sheet rendered after mount to avoid Radix useId hydration mismatch */}
            {mounted ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              <SheetContent
                  side="right"
                  className="flex w-[280px] flex-col border-l border-border bg-card"
                >
                  <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold">
                    <Image
                      src="/sadia-logo.png"
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full ring-1 ring-primary/30"
                    />
                    Sadia&apos;s <span className="text-brand-gradient">IELTS</span>
                  </SheetTitle>
                  <Separator className="bg-primary/10" />
                  <nav aria-label="Mobile navigation" className="mt-2 flex flex-col gap-1">
                    {navPrimary.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                      >
                        {link.label}
                        {link.href === "#/live" && liveNow ? (
                          <span
                            aria-hidden
                            className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 align-middle"
                          />
                        ) : null}
                      </a>
                    ))}
                    <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Explore more
                    </p>
                    {navMore.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-auto space-y-3 pb-2">
                    <Button asChild className="w-full rounded-full bg-ink font-semibold text-white transition-opacity hover:opacity-85">
                      <a href={portalAuthed ? "#/portal" : "#/checkout"} onClick={() => setOpen(false)}>
                        {portalAuthed ? (
                          <LayoutDashboard className="mr-1 h-4 w-4" aria-hidden />
                        ) : (
                          <GraduationCap className="mr-1 h-4 w-4" aria-hidden />
                        )}
                        {portalAuthed ? "My Portal" : "Enroll Now"}
                      </a>
                    </Button>
                    {!portalAuthed ? (
                      <Button asChild variant="outline" className="w-full border-primary/25 font-semibold hover:text-primary">
                        <a href="#/portal" onClick={() => setOpen(false)}>
                          <LogIn className="mr-1 h-4 w-4" aria-hidden />
                          Student Login
                        </a>
                      </Button>
                    ) : null}
                    <Button asChild variant="outline" className="w-full border-primary/25 hover:text-primary">
                      <a href={site.phoneHref}>
                        <Phone className="mr-1 h-4 w-4" aria-hidden />
                        {site.phone}
                      </a>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}

            {/* ⌘K search palette — client-only to stay hydration-safe */}
            {mounted ? (
              <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
