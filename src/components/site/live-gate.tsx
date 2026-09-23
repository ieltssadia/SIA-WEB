"use client";

import { GraduationCap, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortalStore } from "@/lib/portal-store";

/**
 * Portal-only guard for live class surfaces (#/live and #/live/<slug>).
 *
 * Live classes are an enrolled-student feature — like every real coaching
 * brand, the classroom is never reachable from the public site. Visitors
 * see a locked card with a login CTA; only an authenticated portal session
 * renders the children.
 *
 * Hydration-safe: renders the spinner until the persisted session restores,
 * so SSR markup and client markup always match.
 */
export function LiveGate({ children }: { children: React.ReactNode }) {
  const user = usePortalStore((s) => s.user);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="py-24 text-center text-muted-foreground" role="status">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="mt-4 text-sm">চেক করা হচ্ছে…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="rounded-3xl border border-primary/15 bg-card p-8 text-center shadow-[0_20px_60px_rgba(30,27,20,0.14)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <Lock className="h-6 w-6 text-primary" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold leading-snug">
            লাইভ ক্লাস শুধু এনরোল্ড স্টুডেন্টদের জন্য
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            ক্লাসরুম, রেকর্ডিং আর লাইভ শিডিউল পোর্টালের ভেতরে, এনরোলমেন্টের সময়
            দেওয়া মোবাইল নম্বর আর পাসওয়ার্ড দিয়ে লগ ইন করুন।
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button
              asChild
              className="w-full rounded-full bg-gold-gradient px-6 font-semibold text-ink shadow-[0_6px_20px_rgba(169,127,42,0.35)] transition-transform hover:scale-[1.03] sm:w-auto"
            >
              <a href="#/portal">
                <GraduationCap className="mr-1 h-4 w-4" aria-hidden />
                Student Portal-এ লগ ইন
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-primary/30 font-semibold text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
            >
              <a href="#/courses">কোর্স দেখুন</a>
            </Button>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            এনরোল করেছেন কিন্তু পাসওয়ার্ড পাননি? কল করুন +880 1752-716238।
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
