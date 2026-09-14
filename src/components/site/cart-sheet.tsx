"use client";

import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart-store";
import { FREE_COURIER_THRESHOLD } from "@/lib/delivery";

const taka = (n: number) => `৳${n.toLocaleString("en-US")}`;

/**
 * Slide-over shopping cart — opened from the header bag button.
 * Qty steppers, line removal, live subtotal and the checkout CTA.
 */
export function CartSheet({ open, onOpenChange, trigger }: { open?: boolean; onOpenChange?: (o: boolean) => void; trigger?: React.ReactNode }) {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const toFree = FREE_COURIER_THRESHOLD - subtotal;

  const body = (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b border-border pb-4">
        <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold">
          <ShoppingBag className="h-5 w-5 text-primary" aria-hidden />
          Your Cart {hasHydrated && count > 0 ? <span className="text-sm font-semibold text-primary">({count})</span> : null}
        </SheetTitle>
        <SheetDescription className="sr-only">Review the books in your cart before checkout</SheetDescription>
      </SheetHeader>

      {!hasHydrated ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" aria-label="Loading cart" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
            <ShoppingBag className="h-7 w-7 text-primary/70" aria-hidden />
          </span>
          <p className="font-display text-base font-bold text-foreground">আপনার কার্ট খালি</p>
          <p className="text-sm text-muted-foreground">Shop থেকে পছন্দের বইগুলো কার্টে যোগ করুন।</p>
          <Button asChild variant="outline" className="mt-2 rounded-full border-border bg-card text-foreground font-semibold hover:border-primary/50 hover:text-primary">
            <a href="#/shop" onClick={() => onOpenChange?.(false)}>
              Browse Books
            </a>
          </Button>
        </div>
      ) : (
        <>
          {/* Free-courier progress */}
          {toFree > 0 ? (
            <p className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-primary">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              আর {taka(toFree)} যোগ করলেই সারাদেশে <span className="font-bold">ফ্রি কুরিয়ার</span>! (৳{FREE_COURIER_THRESHOLD.toLocaleString("en-US")}+)
            </p>
          ) : (
            <p className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-[#2e7d5b]/20 bg-[#2e7d5b]/10 px-3 py-2 text-[11px] font-semibold text-[#225941]">
              <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              অভিনন্দন! কুরিয়ার ডেলিভারি এখন ফ্রি 🎉
            </p>
          )}

          {/* Lines */}
          <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {items.map((item) => (
              <li
                key={item.slug}
                className="flex gap-3 rounded-2xl border border-border bg-muted/60 p-3"
              >
                <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-lg border border-primary/15">
                  <Image src={item.cover} alt="" fill sizes="60px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-primary">{taka(item.price)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.title}`}
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Minus className="h-3 w-3" aria-hidden />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-foreground" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.title}`}
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {taka(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.title} from cart`}
                  onClick={() => remove(item.slug)}
                  className="self-start rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-border px-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg font-bold text-ink">{taka(subtotal)}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Delivery fee checkout-এ যোগ হবে (Sreemangal-এ ফ্রি)।
            </p>
            <Button asChild className="mt-3 w-full rounded-full bg-ink py-5 font-bold text-white hover:opacity-85">
              <a href="#/checkout" onClick={() => onOpenChange?.(false)}>
                Checkout — অর্ডার করুন
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Single controlled sheet — the parent (header) owns the trigger & state.
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="right"
        className="flex w-[360px] max-w-[92vw] flex-col border-l border-border bg-card p-0 sm:w-[400px]"
      >
        {body}
      </SheetContent>
    </Sheet>
  );
}
