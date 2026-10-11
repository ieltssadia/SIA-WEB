"use client";

import { ChevronRight } from "lucide-react";

/**
 * 3-step checkout progress indicator — shared by the course enrollment
 * checkout and the cart (book shop) checkout.
 */
export function Steps({
  current,
  labels = ["Account", "Payment", "Done"],
}: {
  current: 1 | 2 | 3;
  labels?: string[];
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs" aria-label="Checkout steps">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-primary text-white"
                  : active
                    ? "rounded-full bg-ink text-white"
                    : "rounded-full bg-secondary text-secondary-foreground"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={`text-xs font-semibold sm:text-sm ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < labels.length - 1 ? (
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60 shrink-0" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
