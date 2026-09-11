"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** One book line in the shopping cart (courses enroll via the portal flow). */
export type CartItem = {
  slug: string;
  title: string;
  titleBn: string;
  price: number;
  oldPrice?: number;
  cover: string;
  quantity: number;
};

/** Snapshot of a placed order — kept so a page refresh keeps the receipt. */
export type PlacedOrder = {
  orderNo: string;
  name: string;
  phone: string;
  zone: string;
  zoneLabel: string;
  address: string | null;
  paymentMethod: string;
  transactionId: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  placedAt: string; // ISO
  items: {
    slug: string;
    title: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }[];
};

type CartState = {
  items: CartItem[];
  lastOrder: PlacedOrder | null;
  /** True once the persisted cart has been restored on the client. */
  hasHydrated: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  setLastOrder: (order: PlacedOrder | null) => void;
  setHasHydrated: (value: boolean) => void;
};

const MAX_QTY_PER_LINE = 10;

/**
 * Shopping cart for the Book Shop — persisted to localStorage so the cart
 * survives reloads. Components must gate count-dependent rendering on
 * `hasHydrated` to avoid SSR/hydration mismatches (see site-header badge).
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      lastOrder: null,
      hasHydrated: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug
                  ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, i.quantity + quantity) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(MAX_QTY_PER_LINE, quantity) }] };
        }),
      remove: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.slug !== slug)
              : state.items.map((i) =>
                  i.slug === slug
                    ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, quantity) }
                    : i
                ),
        })),
      clear: () => set({ items: [] }),
      setLastOrder: (lastOrder) => set({ lastOrder }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      version: 1,
      name: "sadias-ielts-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, lastOrder: state.lastOrder }),
      // SSR safety: don't restore localStorage during the first client render
      // (that would race React hydration → attribute mismatch). SiteRouter
      // calls persist.rehydrate() in a mount effect instead.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Total number of units in the cart (for the header badge). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Cart subtotal in BDT. */
export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
