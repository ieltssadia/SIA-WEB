/** Shared live-class types used by API routes and the classroom UI. */

export type ClassSlide = {
  title: string;
  bullets: string[];
};

export type LiveClassDetail = {
  slug: string;
  title: string;
  courseSlug: string | null;
  targetBatch: string | null;
  teacher: string;
  description: string | null;
  platform: string; // "zoom" | "meet" | "teams" | "other"
  meetingUrl: string | null;
  meetingId: string | null;
  passcode: string | null;
  recordingUrl: string | null;
  startsAt: string; // ISO
  durationMin: number;
  status: "scheduled" | "live" | "ended";
  slides: ClassSlide[];
};

export type LiveClassListItem = {
  slug: string;
  title: string;
  courseSlug: string | null;
  targetBatch: string | null;
  teacher: string;
  description: string | null;
  platform: string; // "zoom" | "meet" | "teams" | "other"
  meetingUrl: string | null;
  meetingId: string | null;
  passcode: string | null;
  recordingUrl: string | null;
  startsAt: string; // ISO
  durationMin: number;
  status: "scheduled" | "live" | "ended";
};
