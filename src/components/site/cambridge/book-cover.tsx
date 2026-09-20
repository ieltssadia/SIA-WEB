"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type CambridgeModule = "academic" | "general";

function moduleLabel(module: CambridgeModule): string {
  return module === "academic" ? "Academic" : "General Training";
}

/**
 * Real Cambridge IELTS cover photo (public/images/cambridge/cambridge-{n}.jpg)
 * with a branded spine/depth overlay. If the photo is missing, falls back to
 * the CSS-generated cover art so the shelf never shows a broken image.
 */
export function BookCover({
  bookNumber,
  module: bookModule,
  year,
  accent,
  large = false,
  className,
}: {
  bookNumber: number;
  module: CambridgeModule;
  year: number;
  accent: string;
  large?: boolean;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = `/images/cambridge/cambridge-${bookNumber}.jpg`;

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-[0_10px_30px_rgba(11,42,32,0.18)]",
        large && "shadow-[0_14px_40px_rgba(11,42,32,0.22)]",
        className
      )}
      style={{ backgroundColor: accent }}
    >
      {!imgFailed ? (
        <>
          <Image
            src={src}
            alt={`Cambridge IELTS ${bookNumber} ${moduleLabel(bookModule)} — real book cover`}
            fill
            sizes={large ? "320px" : "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"}
            className="object-cover"
            onError={() => setImgFailed(true)}
          />
          {/* spine shading + depth keep the photo feeling like a book */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-black/5 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5"
          />
        </>
      ) : (
        <>
          {/* CSS fallback cover art */}
          <div aria-hidden className="absolute inset-2 rounded-lg border border-white/20" />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/45 via-black/10 to-transparent"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-white/10" />
          <div className={`absolute inset-0 flex flex-col justify-between ${large ? "p-5" : "p-3.5"}`}>
            <p
              className={`font-bold uppercase tracking-[0.3em] text-white/85 ${large ? "text-[10px]" : "text-[9px]"}`}
            >
              Cambridge IELTS
            </p>
            <p
              className={`text-center font-display font-bold leading-none text-white drop-shadow-md ${
                large ? "text-8xl" : "text-7xl"
              }`}
            >
              {bookNumber}
            </p>
            <div className="flex items-end justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-white/85">
              <span>{moduleLabel(bookModule)}</span>
              <span>{year}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
