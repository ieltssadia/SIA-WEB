"use client";

import { useCallback } from "react";
import { Crown, Hand, Loader2, MicOff, MonitorUp, Pin } from "lucide-react";
import type { ParticipantDTO } from "@/lib/live-protocol";

/**
 * One participant's media tile — shared by the filmstrip and the pinned
 * stage view. Shows the WebRTC video when a live track exists, a
 * "connecting" state while the track is expected, or an avatar fallback.
 *
 * Sandbox reality: headless browsers expose no camera, so tiles correctly
 * fall back to avatars — never fake video.
 */

type VideoTileProps = {
  participant: ParticipantDTO;
  /** remoteStreams.get(id) — or the local stream when isSelf */
  stream: MediaStream | null;
  isSelf?: boolean;
  /** my camera's intended state (participant flags of self are not trusted) */
  selfCamOn?: boolean;
  /** my voice-activity flag (media.speakingSelf) */
  selfSpeaking?: boolean;
  pinned?: boolean;
  /** object-contain (stage) instead of object-cover (filmstrip) */
  contain?: boolean;
  className?: string;
  onPinToggle?: () => void;
};

function hasLiveVideoTrack(stream: MediaStream | null): boolean {
  return !!stream && stream.getVideoTracks().some((t) => t.readyState === "live");
}

export function VideoTile({
  participant,
  stream,
  isSelf = false,
  selfCamOn = false,
  selfSpeaking = false,
  pinned = false,
  contain = false,
  className = "",
  onPinToggle,
}: VideoTileProps) {
  const showVideo = isSelf ? selfCamOn && hasLiveVideoTrack(stream) : participant.video && hasLiveVideoTrack(stream);
  // "Connecting" only when a stream exists but its video track isn't live yet
  // (transient renegotiation). No stream at all → honest avatar fallback.
  const connecting = !showVideo && !!stream && (isSelf ? selfCamOn : participant.video);
  const speaking = isSelf ? selfSpeaking : participant.speaking;
  const isTeacher = participant.role === "teacher";

  const attach = useCallback(
    (el: HTMLVideoElement | null) => {
      if (!el) return;
      if (stream && el.srcObject !== stream) el.srcObject = stream;
      void el.play().catch(() => {});
    },
    [stream]
  );

  const body = (
    <>
      {showVideo ? (
        <video
          autoPlay
          playsInline
          ref={attach}
          muted={isSelf}
          className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
        />
      ) : connecting ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#c6b995]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-[11px]">ভিডিও সংযোগ হচ্ছে…</span>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-base font-bold text-[#e4d5ae]"
          >
            {(participant.name || "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[90%] truncate text-[11px] text-[#c6b995]">{participant.name}</span>
        </div>
      )}

      {/* Pinned indicator */}
      {pinned ? (
        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-[#d9b75c] px-1.5 py-0.5 text-[10px] font-bold text-[#1e1b14]">
          <Pin className="h-3 w-3" aria-hidden />
          পিন
        </span>
      ) : null}

      {/* Status chips — mic off / hand raised */}
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
        {!participant.audio ? (
          <span className="rounded-full bg-red-500/20 p-1 text-red-300" title="মাইক বন্ধ">
            <MicOff className="h-3 w-3" aria-hidden />
          </span>
        ) : null}
        {participant.handRaised ? (
          <span className="animate-bounce rounded-full bg-amber-500/20 p-1 text-amber-300" title="হাত তুলেছেন">
            <Hand className="h-3 w-3" aria-hidden />
          </span>
        ) : null}
      </div>

      {/* Name pill */}
      <div className="absolute bottom-1.5 left-1.5 flex max-w-[85%] items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-[#f6ecd4]">
        {isTeacher ? <Crown className="h-3 w-3 shrink-0 text-[#d9b75c]" aria-label="শিক্ষক" /> : null}
        <span className="truncate">
          {participant.name}
          {isSelf ? <span className="text-[#c6b995]"> (আপনি)</span> : null}
        </span>
        {participant.screen ? <MonitorUp className="h-3 w-3 shrink-0 text-[#d9b75c]" aria-label="স্ক্রিন শেয়ার চলছে" /> : null}
      </div>
    </>
  );

  const frameClasses = [
    "relative block overflow-hidden rounded-xl border bg-[#18150e] text-left transition-shadow",
    isTeacher ? "border-[#d9b75c]/40" : "border-white/10",
    speaking ? "ring-2 ring-[#d9b75c] shadow-[0_0_18px_rgba(217,183,92,0.3)]" : "",
    pinned && !speaking ? "ring-2 ring-[#d9b75c]" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onPinToggle) {
    return (
      <button
        type="button"
        onClick={onPinToggle}
        aria-pressed={pinned}
        aria-label={`${participant.name}, ${pinned ? "স্টেজ থেকে আনপিন করুন" : "স্টেজে পিন করুন"}`}
        className={`${frameClasses} cursor-pointer focus-visible:outline-2 focus-visible:outline-[#d9b75c]`}
      >
        {body}
      </button>
    );
  }

  return <div className={frameClasses}>{body}</div>;
}
