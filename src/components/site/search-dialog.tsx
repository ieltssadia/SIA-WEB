"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CornerDownLeft,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Search,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { books, courses, popularSearches, site, tips } from "@/lib/site-data";
import { navigate } from "@/lib/router";

/**
 * 10MS-style ⌘K search palette for the header.
 *
 * Filtering is done manually (case-insensitive substring on title + titleBn +
 * tag/category), so <Command> runs with shouldFilter={false}; cmdk still shows
 * <CommandEmpty> automatically because it renders whenever zero items are
 * registered in the list.
 */

/** Right-aligned price chip — ৳8,000 / Free / Call (mirrors the course cards). */
function priceLabel(price: number | null): string {
  if (price === null) return "Call";
  if (price === 0) return "Free";
  return `৳${price.toLocaleString("en-US")}`;
}

const quickLinks = [
  { label: "All Courses", href: "#/courses", icon: GraduationCap },
  { label: "Book Shop", href: "#/shop", icon: BookOpen },
  { label: "Free Tips", href: "#/tips", icon: Lightbulb },
  { label: "Student Portal", href: "#/portal", icon: GraduationCap },
  { label: "Verify Certificate", href: "#/verify", icon: FileText },
  { label: "Contact", href: "#/contact", icon: MessageCircle },
];

/** Gold highlight on keyboard/pointer selection (overrides the neutral accent). */
const itemCls =
  "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary";

const kbdCls =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-primary/20 bg-primary/5 px-1 font-mono text-[10px] leading-none";

const badgeCls =
  "shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  /** Wraps the parent callback so the query clears on every close path
   * (Escape, overlay click, ⌘K toggle, item select) — the palette then
   * always opens with a fresh search. Event-driven, never in an effect. */
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) setQuery("");
      onOpenChange(v);
    },
    [onOpenChange]
  );

  // ⌘K / Ctrl+K toggles the palette from anywhere on the page.
  // (Escape is handled by the Dialog itself.)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleOpenChange]);

  const go = (href: string) => {
    // Same as window.location.hash = href — routed through the shared helper.
    navigate(href.replace(/^#/, ""));
    handleOpenChange(false);
  };

  const askOnWhatsapp = () => {
    window.open(site.whatsapp, "_blank", "noopener,noreferrer");
    handleOpenChange(false);
  };

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  const matchedCourses = hasQuery
    ? courses.filter((course) =>
        [course.title, course.titleBn, course.tag].some((field) =>
          field.toLowerCase().includes(q)
        )
      )
    : [];

  const matchedBooks = hasQuery
    ? books.filter((book) =>
        [book.title, book.titleBn, book.tag].some((field) =>
          (field ?? "").toLowerCase().includes(q)
        )
      )
    : [];

  const matchedTips = hasQuery
    ? tips.filter((tip) =>
        [tip.title, tip.category].some((field) => field.toLowerCase().includes(q))
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden gap-0 border-primary/25 bg-[#101014] p-0 sm:top-[15%] sm:translate-y-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search Sadia&apos;s IELTS</DialogTitle>
          <DialogDescription>
            Search courses, books and free IELTS tips.
          </DialogDescription>
        </DialogHeader>

        <Command
          loop
          shouldFilter={false}
          className="w-full rounded-lg bg-[#101014] [&_[data-slot=command-input-wrapper]]:border-primary/15"
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search courses, books, tips…"
          />
          <CommandList className="max-h-[min(60vh,400px)] py-1">
            {!hasQuery ? (
              <>
                <CommandGroup heading="জনপ্রিয় সার্চ">
                  {popularSearches.map((term) => (
                    <CommandItem
                      key={term}
                      value={`popular-${term}`}
                      onSelect={() => setQuery(term)}
                      className={itemCls}
                    >
                      <Search className="text-primary" aria-hidden />
                      <span className="truncate">{term}</span>
                      <ArrowRight className="ml-auto size-3.5 opacity-50" aria-hidden />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Quick Links">
                  {quickLinks.map((link) => (
                    <CommandItem
                      key={link.href}
                      value={`link-${link.href}`}
                      onSelect={() => go(link.href)}
                      className={itemCls}
                    >
                      <link.icon className="text-primary" aria-hidden />
                      <span className="truncate">{link.label}</span>
                      <ArrowRight className="ml-auto size-3.5 opacity-50" aria-hidden />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}

            {matchedCourses.length > 0 ? (
              <CommandGroup heading="Courses">
                {matchedCourses.map((course) => (
                  <CommandItem
                    key={course.slug}
                    value={`course-${course.slug}`}
                    onSelect={() => go(`#/courses/${course.slug}`)}
                    className={itemCls}
                  >
                    <GraduationCap aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{course.title}</span>
                        <span className={badgeCls}>{course.tag}</span>
                      </div>
                      <span className="block truncate text-xs text-muted-foreground">
                        {course.titleBn}
                      </span>
                    </div>
                    <span className="ml-auto shrink-0 text-xs font-bold">
                      {priceLabel(course.price)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {matchedBooks.length > 0 ? (
              <CommandGroup heading="Book Shop">
                {matchedBooks.map((book) => (
                  <CommandItem
                    key={book.slug}
                    value={`book-${book.slug}`}
                    onSelect={() => go("#/shop")}
                    className={itemCls}
                  >
                    <BookOpen aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{book.title}</span>
                        {book.tag ? <span className={badgeCls}>{book.tag}</span> : null}
                      </div>
                      <span className="block truncate text-xs text-muted-foreground">
                        {priceLabel(book.price)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {matchedTips.length > 0 ? (
              <CommandGroup heading="Tips & Tricks">
                {matchedTips.map((tip, index) => (
                  <CommandItem
                    key={`tip-${index}-${tip.title}`}
                    value={`tip-${index}-${tip.title}`}
                    onSelect={() => go("#/tips")}
                    className={itemCls}
                  >
                    <Lightbulb aria-hidden />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{tip.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {tip.category}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            <CommandEmpty>
              <button
                type="button"
                onClick={askOnWhatsapp}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-foreground/90 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <MessageCircle className="size-4 text-primary" aria-hidden />
                <span>
                  কিছু পাওয়া যায়নি —{" "}
                  <span className="font-semibold text-primary">
                    WhatsApp-এ জিজ্ঞেস করুন
                  </span>
                </span>
              </button>
            </CommandEmpty>
          </CommandList>

          {/* Keyboard hints */}
          <div className="flex items-center gap-3 border-t border-primary/15 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className={kbdCls}>↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className={kbdCls}>
                <CornerDownLeft className="size-2.5" aria-hidden />
              </kbd>{" "}
              open
            </span>
            <span className="ml-auto flex items-center gap-1">
              <kbd className={kbdCls}>esc</kbd> close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
