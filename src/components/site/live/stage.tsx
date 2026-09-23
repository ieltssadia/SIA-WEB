"use client";

import { useCallback } from "react";
import { CircleCheck, Loader2, MonitorUp, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassSlide } from "@/lib/live-types";
import type { ParticipantDTO } from "@/lib/live-protocol";
import { VideoTile } from "./video-tile";
import { ReactionsLayer, type FloatingReaction } from "./reactions-layer";
import { bnNum, countdownLabel } from "./labels";

/**
 * The stage — Meet/Zoom-style main surface. Content priority:
 *   1. screen share (remote video / self placeholder)
 *   2. pinned participant
 *   3. lesson slides (default) — or a speaker spotlight when no slides exist
 * Overlays stack: floating reactions → waiting room → class-ended.
 */

export type EnlargedTile = {
  participant: ParticipantDTO;
  stream: MediaStream | null;
  isSelf: boolean;
  selfCamOn: boolean;
  selfSpeaking: boolean;
};

type StageViewProps = {
  slides: ClassSlide[];
  slideIndex: number;
  live: boolean;
  ended: boolean;
  startsAt: string;
  /** client-only ticking clock (null during SSR / first paint) */
  now: number | null;
  screenSharer: ParticipantDTO | null;
  screenStream: MediaStream | null;
  /** the screen sharer is me → self placeholder instead of a video element */
  screenIsSelf: boolean;
  pinned: EnlargedTile | null;
  spotlight: EnlargedTile | null;
  reactions: FloatingReaction[];
  onStopScreenShare: () => void;
};

export function StageView({
  slides,
  slideIndex,
  live,
  ended,
  startsAt,
  now,
  screenSharer,
  screenStream,
  screenIsSelf,
  pinned,
  spotlight,
  reactions,
  onStopScreenShare,
}: StageViewProps) {
  const showSlides = !screenSharer && !pinned && slides.length > 0;
  const showSpotlight = !screenSharer && !pinned && slides.length === 0;
  const slide = slides[Math.min(slideIndex, Math.max(0, slides.length - 1))];

  return (
    <div
      className="relative min-h-[320px] w-full overflow-hidden bg-[#0f0d08] sm:min-h-[420px]"
      data-testid="classroom-stage"
    >
      {/* ── 1. Screen share ─────────────────────────────────────────── */}
      {screenSharer ? (
        <ScreenShareLayer
          sharer={screenSharer}
          stream={screenStream}
          self={screenIsSelf}
          onStop={onStopScreenShare}
        />
      ) : null}

      {/* ── 2. Pinned participant ───────────────────────────────────── */}
      {!screenSharer && pinned ? (
        <div className="absolute inset-0 bg-[#0f0d08] p-2 sm:p-3">
          <VideoTile
            participant={pinned.participant}
            stream={pinned.stream}
            isSelf={pinned.isSelf}
            selfCamOn={pinned.selfCamOn}
            selfSpeaking={pinned.selfSpeaking}
            pinned
            contain
            className="h-full w-full"
          />
        </div>
      ) : null}

      {/* ── 3a. Lesson slides ───────────────────────────────────────── */}
      {showSlides && slide ? (
        <>
          <SlideView key={slide.title} slide={slide} />
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-[#f6ecd4]">
            স্লাইড {bnNum(slideIndex + 1)}/{bnNum(slides.length)}
          </span>
        </>
      ) : null}

      {/* ── 3b. Speaker spotlight (no slides) ───────────────────────── */}
      {showSpotlight && spotlight ? (
        <div className="absolute inset-0 bg-[#0f0d08] p-2 sm:p-3">
          <VideoTile
            participant={spotlight.participant}
            stream={spotlight.stream}
            isSelf={spotlight.isSelf}
            selfCamOn={spotlight.selfCamOn}
            selfSpeaking={spotlight.selfSpeaking}
            contain
            className="h-full w-full"
          />
        </div>
      ) : null}

      {/* ── Floating reactions ──────────────────────────────────────── */}
      <ReactionsLayer items={reactions} />

      {/* ── Waiting room ────────────────────────────────────────────── */}
      {!live && !ended ? <WaitingOverlay startsAt={startsAt} now={now} /> : null}

      {/* ── Class ended (above everything) ──────────────────────────── */}
      {ended ? <EndedOverlay /> : null}
    </div>
  );
}

/* ── Screen share ───────────────────────────────────────────────────── */

function ScreenShareLayer({
  sharer,
  stream,
  self,
  onStop,
}: {
  sharer: ParticipantDTO;
  stream: MediaStream | null;
  self: boolean;
  onStop: () => void;
}) {
  const hasTrack = !!stream && stream.getVideoTracks().some((t) => t.readyState === "live");

  const attach = useCallback(
    (el: HTMLVideoElement | null) => {
      if (!el) return;
      if (stream && el.srcObject !== stream) el.srcObject = stream;
      void el.play().catch(() => {});
    },
    [stream]
  );

  return (
    <div className="absolute inset-0 bg-black">
      {self ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#121009] px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b75c]/40 bg-[#d9b75c]/10">
            <MonitorUp className="h-6 w-6 text-[#d9b75c]" aria-hidden />
          </span>
          <p className="font-display text-lg font-bold text-[#f6ecd4]">আপনি স্ক্রিন শেয়ার করছেন</p>
          <p className="text-sm text-[#c6b995]">ক্লাসের সবাই এখন আপনার স্ক্রিন দেখছেন।</p>
          <Button
            type="button"
            onClick={onStop}
            className="mt-1 h-11 rounded-full bg-red-500 px-5 font-semibold text-white hover:bg-red-600"
          >
            <MonitorUp className="mr-1.5 h-4 w-4" aria-hidden />
            শেয়ার বন্ধ করুন
          </Button>
        </div>
      ) : hasTrack ? (
        <>
          <video autoPlay playsInline ref={attach} className="h-full w-full object-contain" />
          <span className="absolute left-3 top-3 flex max-w-[80%] items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-[#f6ecd4]">
            <MonitorUp className="h-3.5 w-3.5 shrink-0 text-[#d9b75c]" aria-hidden />
            <span className="truncate">{sharer.name} স্ক্রিন শেয়ার করছেন</span>
          </span>
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#c6b995]">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <p className="text-sm">{sharer.name} স্ক্রিন শেয়ার শুরু করছেন…</p>
        </div>
      )}
    </div>
  );
}

/* ── Slide renderer (upgraded v1) ───────────────────────────────────── */

function SlideView({ slide }: { slide: ClassSlide }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 absolute inset-0 flex flex-col justify-center bg-[radial-gradient(ellipse_at_top,#18150e_0%,#0f0d08_65%)] px-6 py-10 duration-300 sm:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="font-display text-xl font-bold leading-snug text-[#f6ecd4] sm:text-3xl">{slide.title}</h2>
        <ul className="mt-5 space-y-3">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 text-sm leading-relaxed text-[#f6ecd4]/85 duration-300 sm:text-base"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gradient" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Waiting room ───────────────────────────────────────────────────── */

function WaitingOverlay({ startsAt, now }: { startsAt: string; now: number | null }) {
  const startsIn = now !== null ? new Date(startsAt).getTime() - now : null;
  const isLate = startsIn !== null && startsIn <= 0;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[#0f0d08]/85 px-6 text-center backdrop-blur-[2px]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10">
        <Radio className="h-6 w-6 text-[#d9b75c]" aria-hidden />
      </span>
      <p className="font-display text-lg font-bold text-[#f6ecd4]">ক্লাস এখনো লাইভ হয়নি</p>
      <p className="text-sm text-[#c6b995]">
        {isLate
          ? "ক্লাস শুরুর সময় হয়ে গেছে…"
          : startsIn !== null
            ? `শুরু হতে বাকি ${countdownLabel(startsIn)}…`
            : "শিক্ষক লাইভ করলেই এখানে দেখা যাবে।"}
      </p>
      <p className="text-xs text-[#a3977b]">চ্যাটে প্রশ্ন করে রাখুন, Sadia Ma'am লাইভে উত্তর দেবেন।</p>
    </div>
  );
}

/* ── Class ended ────────────────────────────────────────────────────── */

function EndedOverlay() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-[#0f0d08]/90 px-6 text-center backdrop-blur-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b75c]/40 bg-[#d9b75c]/10">
        <CircleCheck className="h-7 w-7 text-[#d9b75c]" aria-hidden />
      </span>
      <p className="font-display text-2xl font-bold text-[#f6ecd4]">ক্লাস শেষ হয়েছে</p>
      <p className="text-sm text-[#c6b995]">রেকর্ডিং শীঘ্রই পোর্টালে যুক্ত হবে</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="h-11 rounded-full bg-brand-gradient px-5 font-semibold text-[#f6ecd4] hover:opacity-90">
          <a href="#/portal">পোর্টালে ফিরুন</a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-white/15 bg-transparent px-5 font-semibold text-[#c6b995] hover:bg-white/10 hover:text-[#f6ecd4]"
        >
          <a href="#/live">লাইভ হাব</a>
        </Button>
      </div>
    </div>
  );
}
