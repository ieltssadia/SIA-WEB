"use client";

import { create } from "zustand";

type EnrollState = {
  course: string;
  setCourse: (course: string) => void;
};

/** Shared state so course cards can pre-select a course in the enroll form. */
export const useEnrollStore = create<EnrollState>((set) => ({
  course: "not-sure",
  setCourse: (course) => set({ course }),
}));
