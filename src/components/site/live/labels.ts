/**
 * Shared label helpers for the live classroom — Dhaka clock, elapsed timer,
 * future countdown and Bengali numerals. Keep them pure so both the entry
 * file and the split components can import without cycles.
 */

/** Bengali digits for counters like "৩/৮". */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

export function bnNum(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

const dhakaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** "09:30 pm"-style Dhaka clock for a class start ISO string. */
export function startLabel(iso: string): string {
  return dhakaTime.format(new Date(iso));
}

/** Dhaka timestamp for chat messages (epoch ms). */
export function chatTimeLabel(at: number): string {
  return dhakaTime.format(new Date(at));
}

/** "mm:ss" / "h:mm:ss" elapsed clock, tabular-nums friendly. */
export function elapsedLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/** Compact future countdown: "2d 3h", "4h 12m", "9m", "<1m". */
export function countdownLabel(ms: number): string {
  if (ms <= 60_000) return "<1 মিনিট";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} মিনিট`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা ${mins % 60} মিনিট`;
  return `${Math.floor(hours / 24)} দিন ${hours % 24} ঘণ্টা`;
}
