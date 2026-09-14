"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LoginResult = { ok: boolean; error?: string };

type AdminState = {
  /** Stable admin token — echoed back as the `x-admin-key` header. */
  token: string | null;
  /** True once the persisted token has been restored on the client. */
  hasHydrated: boolean;
  /** POST /api/admin/login → persists the token on success. */
  login: (password: string) => Promise<LoginResult>;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

/**
 * Admin session — persisted to localStorage ("sadia-admin") so the admin
 * stays logged in across visits. Components must gate rendering on
 * `hasHydrated` to avoid SSR/hydration mismatches.
 *
 * Like the portal store, hydration is skipped at import time; the page
 * (admin-page.tsx) calls `useAdminStore.persist.rehydrate()` in a mount
 * effect, and `onRehydrateStorage` flips `hasHydrated`.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      hasHydrated: false,
      login: async (password) => {
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          const data = (await res.json().catch(() => null)) as
            | { ok?: boolean; token?: string; error?: string }
            | null;
          if (res.ok && data?.ok && typeof data.token === "string") {
            set({ token: data.token });
            return { ok: true };
          }
          return {
            ok: false,
            error: data?.error ?? "ভুল পাসওয়ার্ড। (Incorrect password.)",
          };
        } catch {
          return {
            ok: false,
            error: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন। (Network error — please try again.)",
          };
        }
      },
      logout: () => set({ token: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      version: 1,
      name: "sadia-admin",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      // SSR safety: restore via an explicit mount-effect rehydrate()
      // (admin-page.tsx) instead of racing React hydration.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
