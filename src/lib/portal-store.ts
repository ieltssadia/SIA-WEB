"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PortalStudent = {
  name: string;
  phone: string;
  courseSlug: string;
  batch: string;
};

type PortalState = {
  student: PortalStudent | null;
  /** True once the persisted session has been restored on the client. */
  hasHydrated: boolean;
  setStudent: (student: PortalStudent | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

/**
 * Student Portal session — persisted to localStorage so enrolled students
 * stay logged in across visits. Components must gate rendering on
 * `hasHydrated` to avoid SSR/hydration mismatches.
 */
export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      student: null,
      hasHydrated: false,
      setStudent: (student) => set({ student }),
      logout: () => set({ student: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "sadias-ielts-portal",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ student: state.student }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
