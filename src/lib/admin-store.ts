"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminAuthUser } from "@/lib/admin-types";

type LoginResult = { ok: boolean; error?: string };

type AdminState = {
  /** Signed session token — echoed back as the `x-admin-key` header. */
  token: string | null;
  /** Signed-in team member (name + role drive the CMS navigation). */
  user: AdminAuthUser | null;
  /** True once the persisted token has been restored on the client. */
  hasHydrated: boolean;
  /** POST /api/admin/login → persists token + user on success. */
  login: (email: string, password: string) => Promise<LoginResult>;
  /** Refresh the signed-in profile from GET /api/admin/me. */
  refreshUser: () => Promise<void>;
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
 *
 * v2: single shared password → per-member email+password with roles. Old v1
 * payloads (raw password tokens) are discarded by the migrate hook.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hasHydrated: false,
      login: async (email, password) => {
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = (await res.json().catch(() => null)) as
            | { ok?: boolean; token?: string; user?: AdminAuthUser; error?: string }
            | null;
          if (res.ok && data?.ok && typeof data.token === "string" && data.user) {
            set({ token: data.token, user: data.user });
            return { ok: true };
          }
          return {
            ok: false,
            error: data?.error ?? "ভুল ইমেইল বা পাসওয়ার্ড। (Incorrect email or password.)",
          };
        } catch {
          return {
            ok: false,
            error: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন। (Network error — please try again.)",
          };
        }
      },
      refreshUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch("/api/admin/me", {
            headers: { "x-admin-key": token },
          });
          const data = (await res.json().catch(() => null)) as
            | { ok?: boolean; user?: AdminAuthUser }
            | null;
          if (!res.ok || !data?.ok || !data.user) {
            // Token revoked / account disabled → force re-login.
            set({ token: null, user: null });
            return;
          }
          set({ user: data.user });
        } catch {
          // Network hiccup — keep the cached profile.
        }
      },
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      version: 2,
      name: "sadia-admin",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      migrate: (persisted, version) => {
        // v1 stored only the raw password token — force a fresh login.
        if (version < 2) return { token: null, user: null } as never;
        return persisted as never;
      },
      // SSR safety: restore via an explicit mount-effect rehydrate()
      // (admin-page.tsx) instead of racing React hydration.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
