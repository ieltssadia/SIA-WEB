"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PortalStudent = {
  name: string;
  phone: string;
  courseSlug: string;
  batch: string;
  targetBand: string | null;
  examDate: string | null;
  progress: number;
  attendance: number;
};

export type PortalMock = {
  id: string;
  label: string;
  date: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
};

type PortalState = {
  student: PortalStudent | null;
  mocks: PortalMock[];
  /** True once the persisted session has been restored on the client. */
  hasHydrated: boolean;
  setSession: (student: PortalStudent, mocks: PortalMock[]) => void;
  setMocks: (mocks: PortalMock[]) => void;
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
      mocks: [],
      hasHydrated: false,
      setSession: (student, mocks) => set({ student, mocks }),
      setMocks: (mocks) => set({ mocks }),
      logout: () => set({ student: null, mocks: [] }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      // v1 = OTP portal with mock results; bumps discard pre-v1 sessions
      version: 1,
      name: "sadias-ielts-portal",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ student: state.student, mocks: state.mocks }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
