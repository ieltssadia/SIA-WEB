"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PortalUser = {
  name: string;
  phone: string;
};

export type PortalEnrollment = {
  id: string;
  courseSlug: string;
  batch: string;
  targetBand: string | null;
  examDate: string | null;
  progress: number;
  attendance: number;
  status: string;
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
  user: PortalUser | null;
  /** Paid course enrollments — the portal only shows content for these. */
  enrollments: PortalEnrollment[];
  mocks: PortalMock[];
  /** True once the persisted session has been restored on the client. */
  hasHydrated: boolean;
  setSession: (
    user: PortalUser,
    enrollments: PortalEnrollment[],
    mocks: PortalMock[]
  ) => void;
  setMocks: (mocks: PortalMock[]) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

/**
 * Student Portal session — persisted to localStorage so logged-in students
 * stay logged in across visits. Components must gate rendering on
 * `hasHydrated` to avoid SSR/hydration mismatches.
 *
 * Course content is shown ONLY when `enrollments` is non-empty; a logged-in
 * account with zero enrollments renders an empty portal.
 */
export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      user: null,
      enrollments: [],
      mocks: [],
      hasHydrated: false,
      setSession: (user, enrollments, mocks) =>
        set({ user, enrollments, mocks }),
      setMocks: (mocks) => set({ mocks }),
      logout: () => set({ user: null, enrollments: [], mocks: [] }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      // v2 = password login + multi-course enrollments; bumps discard
      // pre-v2 sessions (single-course OTP shape)
      version: 2,
      name: "sadias-ielts-portal",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        enrollments: state.enrollments,
        mocks: state.mocks,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Logged in AND enrolled in at least one course → gated content is visible. */
export function isEnrolled(state: {
  user: PortalUser | null;
  enrollments: PortalEnrollment[];
}): boolean {
  return !!state.user && state.enrollments.length > 0;
}
