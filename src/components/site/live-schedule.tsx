"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, History, Loader2, Play, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveClassListItem } from "@/lib/live-types";

const dhakaFull = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** Compact future countdown: "2d 3h", "4h 12m", "45m", "শীঘ্রই". */
function untilLabel(targetIso: string, now: number): string {
  const ms = new Date(targetIso).getTime() - now;
  if (ms <= 60_000) return "শীঘ্রই";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} মিনিট বাকি`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা ${mins % 60} মিনিট বাকি`;
  return `${Math.floor(hours / 24)} দিন ${hours % 24} ঘণ্টা বাকি`;
}

/**
 * Live class schedule for #/live — Live Now / Upcoming / Completed,
 * auto-refreshing every 30 s. Join buttons open #/live/<slug>.
 */
export function LiveSchedule() {
  const [classes, setClasses] = useState<LiveClassListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/live-classes", { cache: "no-store" });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? "failed");
      setClasses(json.classes as LiveClassListItem[]);
      setError(null);
    } catch {
      setError("লাইভ ক্লাস লোড করা যায়নি — কিছুক্ষণ পর আবার চেষ্টা করুন।");
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    load();
    const refresh = setInterval(load, 30_000);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, [load]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={load} className="mt-4 rounded-full border-border bg-card text-foreground hover:border-primary/50 hover:text-primary">
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  if (!classes || now === null) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="লাইভ ক্লাস লোড হচ্ছে">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl border border-primary/10 bg-card/60" />
        ))}
      </div>
    );
  }

  const live = classes.filter((c) => c.status === "live");
  const upcoming = classes
    .filter((c) => c.status === "scheduled")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const ended = classes
    .filter((c) => c.status === "ended")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  return (
    <div className="space-y-10">
      {/* ── Live now ─────────────────────────────────────────────── */}
      <section aria-labelledby="live-now-heading">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <h2 id="live-now-heading" className="font-display text-xl font-bold">
            এখন লাইভ
          </h2>
          <span className="text-xs text-muted-foreground">({live.length})</span>
        </div>

        {live.length === 0 ? (
          <p className="rounded-xl border border-primary/10 bg-card/50 px-5 py-6 text-sm text-muted-foreground">
            এই মুহূর্তে কোনো ক্লাস লাইভ নেই — নিচের আসন্ন ক্লাসগুলো দেখুন।
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <article
                key={c.slug}
                className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-card p-5 shadow-[0_0_40px_rgba(220,38,38,0.08)]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Radio className="h-3 w-3" aria-hidden />
                    লাইভ চলছে
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    চলমান
                  </span>
                </div>
                <h3 className="font-display text-base font-bold leading-snug">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.teacher}</p>
                {c.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">{c.description}</p>
                ) : null}
                <Button asChild className="mt-4 w-full rounded-full bg-ink font-semibold text-white hover:opacity-85">
                  <a href={`#/live/${c.slug}`}>
                    <Play className="mr-1.5 h-4 w-4" aria-hidden />
                    ক্লাসে জয়েন করুন
                  </a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Upcoming ─────────────────────────────────────────────── */}
      <section aria-labelledby="upcoming-heading">
        <div className="mb-4 flex items-center gap-2.5">
          <CalendarClock className="h-4.5 w-4.5 text-primary" aria-hidden />
          <h2 id="upcoming-heading" className="font-display text-xl font-bold">
            আসন্ন লাইভ ক্লাস
          </h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-primary/10 bg-card/50 px-5 py-6 text-sm text-muted-foreground">
            শীঘ্রই নতুন লাইভ ক্লাসের শিডিউল ঘোষণা করা হবে।
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((c) => (
              <article key={c.slug} className="rounded-2xl border border-primary/12 bg-card p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    আসন্ন
                  </span>
                  {now !== null ? (
                    <span className="text-xs font-medium tabular-nums text-primary/90">{untilLabel(c.startsAt, now)}</span>
                  ) : null}
                </div>
                <h3 className="font-display text-base font-bold leading-snug">{c.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {dhakaFull.format(new Date(c.startsAt))} · Dhaka time
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{c.teacher} · {c.durationMin} মিনিট</p>
                {c.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">{c.description}</p>
                ) : null}
                <Button asChild variant="outline" className="mt-4 w-full rounded-full border-border bg-card font-semibold text-foreground hover:border-primary/50 hover:text-primary">
                  <a href={`#/live/${c.slug}`}>ওয়েটিং রুমে ঢুকুন</a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Completed ────────────────────────────────────────────── */}
      {ended.length > 0 ? (
        <section aria-labelledby="ended-heading">
          <div className="mb-4 flex items-center gap-2.5">
            <History className="h-4.5 w-4.5 text-muted-foreground" aria-hidden />
            <h2 id="ended-heading" className="font-display text-xl font-bold text-muted-foreground">
              সম্পন্ন ক্লাস
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ended.map((c) => (
              <article key={c.slug} className="rounded-2xl border border-primary/8 bg-card/50 p-5 opacity-80">
                <span className="mb-3 inline-block rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  শেষ হয়েছে
                </span>
                <h3 className="font-display text-sm font-bold leading-snug text-foreground/85">{c.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {dhakaFull.format(new Date(c.startsAt))} · {c.teacher}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3" aria-hidden />
                  রেকর্ডিং শীঘ্রই পোর্টালে যুক্ত হবে
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
