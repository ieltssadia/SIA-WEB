"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Banknote,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageCircle,
  Phone,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { bookCategories, books, site, type Book } from "@/lib/site-data";
import { useCartStore } from "@/lib/cart-store";

function taka(n: number) {
  return `৳${n.toLocaleString("en-US")}`;
}

function waLink(book: Book) {
  const text = encodeURIComponent(
    `Assalamu Alaikum! I want to order "${book.title}" (${taka(book.price)}) from Sadia's IELTS Book Shop.`
  );
  return `https://wa.me/8801752716238?text=${text}`;
}

function BookCover({ book, className }: { book: Book; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-primary/20 bg-[#121009] ${className ?? ""}`}
    >
      <Image
        src={book.cover}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover opacity-90"
      />
      {/* Spine shading for a real book feel */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/70 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />
      <div className="absolute inset-0 flex flex-col justify-between p-3.5">
        <span className="w-fit rounded-full border border-white/25 bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#f6ecd4]">
          Sadia&apos;s IELTS
        </span>
        <div>
          <p className="font-display text-sm font-bold leading-snug text-[#f6ecd4] line-clamp-3 [text-wrap:balance]">
            {book.title}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#d9b75c]">
            {book.author}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Adds a book to the cart + confirmation toast with a checkout shortcut. */
function useAddToCart() {
  const add = useCartStore((s) => s.add);
  const { toast } = useToast();
  return (b: Book) => {
    add({
      slug: b.slug,
      title: b.title,
      titleBn: b.titleBn,
      price: b.price,
      oldPrice: b.oldPrice,
      cover: b.cover,
    });
    toast({
      title: "কার্টে যোগ হয়েছে ✓",
      description: b.title,
      action: (
        <ToastAction asChild altText="Go to checkout">
          <a href="#/checkout">Checkout</a>
        </ToastAction>
      ),
    });
  };
}

function BookCard({ book, onDetails }: { book: Book; onDetails: (b: Book) => void }) {
  const addToCart = useAddToCart();
  const discount = book.oldPrice
    ? Math.round(((book.oldPrice - book.price) / book.oldPrice) * 100)
    : 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-card transition-colors hover:border-primary/40">
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => onDetails(book)}
            aria-label={`View details of ${book.title}`}
            className="block w-full cursor-pointer text-left"
          >
            <BookCover book={book} className="aspect-[3/4] w-full transition-transform duration-300 group-hover:scale-[1.02]" />
          </button>
          {book.tag ? (
            <Badge className="absolute -right-1.5 -top-1.5 border-transparent bg-brand-gradient text-[10px] font-bold text-white shadow">
              {book.tag}
            </Badge>
          ) : null}
          {discount > 0 ? (
            <span className="absolute bottom-2 right-2 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
              −{discount}%
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 font-display text-sm font-bold leading-snug text-foreground line-clamp-2">
          <button
            type="button"
            onClick={() => onDetails(book)}
            className="cursor-pointer text-left transition-colors hover:text-primary"
          >
            {book.title}
          </button>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {book.titleBn} · {book.pages} pages
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-primary">{taka(book.price)}</span>
          {book.oldPrice ? (
            <span className="text-xs text-muted-foreground line-through">{taka(book.oldPrice)}</span>
          ) : null}
        </div>

        <ul className="mt-3 space-y-1.5">
          {book.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-1.5 text-xs text-foreground/80">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex gap-2 pt-4">
          <Button
            size="sm"
            className="flex-1 rounded-full bg-ink text-[12px] font-bold text-white hover:opacity-85"
            onClick={() => addToCart(book)}
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="outline"
            aria-label={`Order ${book.title} on WhatsApp`}
            className="border-primary/25 px-2.5 hover:border-primary/60 hover:text-primary"
            asChild
          >
            <a href={waLink(book)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/25 px-3 text-xs font-medium hover:border-primary/60 hover:text-primary"
            onClick={() => onDetails(book)}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ShopPage() {
  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<Book | null>(null);
  const [catalog, setCatalog] = useState<{ books: Book[] }>({ books });
  const addToCart = useAddToCart();

  /* CMS-managed book list — static import paints first, then /api/catalog swaps in. */
  useEffect(() => {
    let alive = true;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok) setCatalog({ books: d.books as Book[] });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const catalogBooks = catalog.books;
  const bundleBook = catalogBooks.length ? catalogBooks[catalogBooks.length - 1] : books[0];
  const bundleTotal = catalogBooks.reduce(
    (s, b) => s + (b.slug === "complete-bundle" ? 0 : b.price),
    0
  );

  const filtered = useMemo(
    () =>
      category === "all"
        ? catalogBooks
        : catalogBooks.filter((b) => b.category === category),
    [category, catalogBooks]
  );

  return (
    <>
      <PageHeader
        eyebrow="Book Shop"
        title={
          <>
            IELTS Study <span className="text-brand-gradient">Books &amp; Materials</span>
          </>
        }
        subtitle="Sadia Rahman-এর proven preparation books — বাংলা ব্যাখ্যাসহ। Order online — সারাদেশে cash on delivery, অথবা ক্যাম্পাস থেকে সংগ্রহ করুন।"
        crumbs={[{ label: "Shop" }]}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Category filter pills */}
          <Reveal>
            <div
              className="flex flex-wrap items-center justify-center gap-2"
              role="group"
              aria-label="Filter books by category"
            >
              {bookCategories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={category === c.value}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    category === c.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Book grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filtered.map((book, i) => (
              <Reveal key={book.slug} delay={(i % 4) * 0.06} className="h-full">
                <BookCard book={book} onDetails={setSelected} />
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              No books in this category yet — check back soon!
            </p>
          ) : null}

          {/* Bundle banner */}
          <Reveal delay={0.1}>
            <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#15120b] via-[#16130c] to-[#15120b] p-6 md:p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="relative h-36 w-28 shrink-0">
                  <BookCover book={bundleBook} className="h-full w-full shadow-2xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge className="border-white/10 bg-white/10 text-[#e4d5ae] hover:bg-white/10">
                    <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                    Best Value
                  </Badge>
                  <h3 className="mt-2 font-display text-xl font-bold text-[#f6ecd4] md:text-2xl">
                    Complete IELTS Bundle — সব বই একসাথে, {taka(2200)}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-[#c6b995]">
                    Reading Tricks + Writing Handbook + Speaking Bank + Vocabulary Builder +
                    Listening Workbook + 10 Mock Tests —{" "}
                    <span className="font-semibold text-[#f6ecd4]">
                      আলাদা কিনলে ৳{bundleTotal.toLocaleString("en-US")}
                    </span>
                    , bundle-এ মাত্র ৳2,200. Free delivery in Sreemangal!
                  </p>
                </div>
                <Button
                  size="lg"
                  className="shrink-0 bg-brand-gradient font-bold text-white hover:opacity-90"
                  onClick={() => addToCart(bundleBook)}
                >
                  <ShoppingBag className="mr-1.5 h-4 w-4" aria-hidden />
                  Add Bundle to Cart
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="shrink-0 border-white/20 bg-transparent font-semibold text-[#f6ecd4] hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <a href={waLink(bundleBook)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Trust strip */}
          <Reveal delay={0.15}>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: "Delivery All Over Bangladesh",
                  desc: "Courier পাঠানো হয় সারাদেশে — Sreemangal-এ free home delivery।",
                },
                {
                  icon: BookOpen,
                  title: "Written by Sadia Rahman",
                  desc: "Cambridge & IDP certified trainer-এর হাতে লেখা classroom-tested materials।",
                },
                {
                  icon: Banknote,
                  title: "Cash on Delivery",
                  desc: "bKash/Nagad advance অথবা সারাদেশে cash on delivery — আপনার সুবিধামতো।",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Courses cross-sell */}
          <Reveal delay={0.2}>
            <div className="mt-12 rounded-2xl border border-primary/20 bg-card p-6 text-center md:p-8">
              <p className="font-display text-lg font-bold text-foreground md:text-xl">
                Books পড়ে লাভ হয়, কিন্তু গাইড ছাড়া প্রস্তুতি অসম্পূর্ণ!
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Sadia apa-র লাইভ ক্লাসে জয়েন করুন — বইয়ের প্রতিটি trick ক্লাসে হাতে-কলমে শেখানো হয়।
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  className="rounded-full bg-ink font-semibold text-white hover:opacity-85"
                >
                  <a href="#/courses">
                    <FileText className="mr-1.5 h-4 w-4" aria-hidden />
                    Browse Courses
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/30 font-medium hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                >
                  <a href={site.phoneHref}>
                    <Phone className="mr-1.5 h-4 w-4" aria-hidden />
                    Call to Order: {site.phone}
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Book details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md border-border bg-popover p-0 overflow-hidden">
          {selected ? (
            <div>
              <DialogHeader className="sr-only">
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>Book details and ordering information</DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 p-5">
                <BookCover book={selected} className="h-44 w-32 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold leading-snug text-foreground">
                    {selected.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.titleBn} · {selected.pages} pages
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-primary">
                      {taka(selected.price)}
                    </span>
                    {selected.oldPrice ? (
                      <span className="text-xs text-muted-foreground line-through">
                        {taka(selected.oldPrice)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-foreground/85">{selected.desc}</p>
                </div>
              </div>
              <div className="border-t border-primary/10 p-5">
                <ul className="space-y-2">
                  {selected.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-foreground/85">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex gap-2">
                  <Button
                    className="flex-1 rounded-full bg-ink font-bold text-white hover:opacity-85"
                    onClick={() => {
                      addToCart(selected);
                      setSelected(null);
                    }}
                  >
                    <ShoppingBag className="mr-1.5 h-4 w-4" aria-hidden />
                    Add to Cart
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary/30 hover:border-primary/60 hover:text-primary"
                  >
                    <a href={waLink(selected)} target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp">
                      <MessageCircle className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary/30 hover:border-primary/60 hover:text-primary"
                  >
                    <a href={site.phoneHref} aria-label={`Call ${site.phone} to order`}>
                      <Phone className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                </div>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Cash on delivery available · bKash / Nagad accepted
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
