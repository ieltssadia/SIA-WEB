"use client";

import { useEffect, useState } from "react";

/**
 * 10MS-style evergreen offer countdown.
 *
 * 10 Minute School anchors every price to a visible deadline ("কোর্সে অফার
 * শেষ হতে বাকি: 3d 17h 54m 09s"). We replicate that with an evergreen
 * deadline: the end of the current month (Asia/Dhaka, GMT+6). When less than
 * 36 hours remain, the deadline rolls to the end of the NEXT month so the
 * timer never deadpans at zero.
 *
 * Rendering is hydration-safe: the first (server + first client) render shows
 * a neutral placeholder, then the live clock starts after mount.
 */

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True before mount / first tick — render a stable placeholder. */
  ready: boolean;
  /** e.g. "31 Oct" — the deadline date shown next to the timer. */
  endsOn: string;
};

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

function endOfCurrentMonthDhaka(now: Date): Date {
  // Work in Dhaka wall-clock terms: shift now by +6h, take UTC fields.
  const dhaka = new Date(now.getTime() + DHAKA_OFFSET_MS);
  const y = dhaka.getUTCFullYear();
  const m = dhaka.getUTCMonth();
  // Midnight (Dhaka) of the first day of the next month, expressed back in UTC.
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59) - DHAKA_OFFSET_MS);
  return end;
}

export function offerDeadline(now: Date = new Date()): Date {
  const end = endOfCurrentMonthDhaka(now);
  // Roll over early: the last day-and-a-half jumps to next month's end.
  if (end.getTime() - now.getTime() < 36 * 60 * 60 * 1000) {
    return endOfCurrentMonthDhaka(new Date(end.getTime() + 24 * 60 * 60 * 1000));
  }
  return end;
}

export function offerEndsOnLabel(now: Date = new Date()): string {
  const end = offerDeadline(now);
  const dhaka = new Date(end.getTime() + DHAKA_OFFSET_MS);
  return dhaka.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function diffParts(target: Date, now: Date) {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Live countdown to the evergreen offer deadline (starts after mount). */
export function useOfferCountdown(): Countdown {
  const [state, setState] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ready: false,
    endsOn: "",
  });

  useEffect(() => {
    let deadline = offerDeadline();
    const tick = () => {
      const now = new Date();
      if (deadline.getTime() - now.getTime() <= 0) deadline = offerDeadline(now);
      setState({ ...diffParts(deadline, now), ready: true, endsOn: offerEndsOnLabel(now) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}

/** "2d 14h 33m" — compact label used on cards and banners. */
export function compactCountdown(c: Countdown): string {
  if (!c.ready) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  if (c.days > 0) return `${c.days}d ${pad(c.hours)}h ${pad(c.minutes)}m`;
  if (c.hours > 0) return `${c.hours}h ${pad(c.minutes)}m ${pad(c.seconds)}s`;
  return `${c.minutes}m ${pad(c.seconds)}s`;
}
