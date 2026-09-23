"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, BookOpenCheck, Headphones, Mic, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/site/reveal";

interface BookRow {
  number: number;
  module: string;
  accent: string;
  testCount: number;
}

const SKILLS = [
  { icon: Headphones, label: "Listening" },
  { icon: BookOpenCheck, label: "Reading" },
  { icon: PenLine, label: "Writing" },
  { icon: Mic, label: "Speaking" },
];

/**
 * Homepage teaser for the Cambridge IELTS Library — a dark forest band
 * with a mini bookshelf (newest editions) and the four per-skill perks.
 */
export function CambridgeTeaser() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cambridge/books", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json?.ok) return;
        const rows: BookRow[] = json.books ?? [];
        setBooks(rows.slice(0, 7));
        setTotal(rows.reduce((sum: number, b: BookRow) => sum + (b.testCount ?? 0), 0));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#121009] shadow-[0_24px_80px_rgba(23,20,16,0.30)]">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:p-14">
            {/* Copy side */}
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight text-[#f6ecd4] sm:text-4xl">
                পুরো Cambridge সিরিজ,{" "}
                <span className="text-[#d9b75c]">এখন ইন্টার‌্যাক্টিভ</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#c6b995] sm:text-base">
                Books 1-19 (Academic + GT) · {total || 140} প্র্যাকটিস টেস্ট, সম্পূর্ণ ফ্রি।
              </p>

              {/* Per-skill perk pills — 10MS-style, icon + one word */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                {SKILLS.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5"
                  >
                    <s.icon className="h-4 w-4 text-[#d9b75c]" aria-hidden />
                    <span className="text-xs font-bold text-[#f6ecd4]">{s.label}</span>
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="rounded-full bg-brand-gradient px-6 font-semibold text-white shadow-[0_10px_30px_rgba(169,127,42,0.30)] transition-opacity hover:opacity-90"
                >
                  <a href="#/cambridge">
                    Open the Library
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <a
                  href="#/cambridge/book/19?module=academic"
                  className="text-sm font-semibold text-[#d9b75c] underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Try the latest test (Book 19)
                </a>
              </div>
            </div>

            {/* Mini bookshelf */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a3977b]">
                  On the shelf: latest editions
                </p>
                <div className="mt-4 flex items-end gap-2 sm:gap-2.5">
                  {(books.length ? books : Array.from({ length: 7 }, (_, i) => null)).map(
                    (b, i) => (
                      <a
                        key={b ? `${b.number}-${b.module}` : `skeleton-${i}`}
                        href={b ? `#/cambridge/book/${b.number}?module=${b.module}` : "#/cambridge"}
                        aria-label={b ? `Cambridge IELTS ${b.number} ${b.module === "general" ? "General Training" : "Academic"}` : "Cambridge Library"}
                        className="group relative flex-1"
                      >
                        <div
                          className="relative flex aspect-[3/4.6] items-end justify-center overflow-hidden rounded-md ring-1 ring-white/15 transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-[-2deg]"
                          style={{
                            background: b
                              ? b.accent
                              : "linear-gradient(160deg,#1d1810,rgba(0,0,0,0.55))",
                          }}
                        >
                          {b ? (
                            <>
                              <Image
                                src={`/images/cambridge/cambridge-${b.number}.jpg`}
                                alt=""
                                aria-hidden
                                fill
                                sizes="90px"
                                className="object-cover"
                              />
                              <span
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10"
                              />
                              <span className="relative pb-1 font-display text-sm font-extrabold text-white drop-shadow sm:text-lg">
                                {b.number}
                              </span>
                            </>
                          ) : (
                            <span className="font-display text-sm font-extrabold text-white/60 sm:text-lg">
                              ·
                            </span>
                          )}
                        </div>
                        <span aria-hidden className="mt-1 block h-[3px] rounded-full bg-white/20" />
                      </a>
                    )
                  )}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white/[0.05] py-2">
                    <p className="font-display text-lg font-extrabold text-[#d9b75c]">19</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a3977b]">Books</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.05] py-2">
                    <p className="font-display text-lg font-extrabold text-[#d9b75c]">{total || 140}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a3977b]">Tests</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.05] py-2">
                    <p className="font-display text-lg font-extrabold text-[#d9b75c]">100%</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a3977b]">Answers</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}