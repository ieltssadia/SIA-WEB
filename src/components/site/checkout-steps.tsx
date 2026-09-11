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
    <ol className="flex items-center gap-2" aria-label="Checkout steps">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-gold-gradient text-[#16120a]"
                  : active
                    ? "border-2 border-primary bg-primary/10 text-primary"
                    : "border border-border text-muted-foreground"
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
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
