"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Hand,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MonitorX,
  SmilePlus,
  Users,
  Video,
  VideoOff,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { LiveRole } from "@/lib/live-protocol";
import type { PanelTab } from "./side-panels";
import { bnNum } from "./labels";

/** Emoji set — must match the server-side REACTIONS allowlist. */
const REACTIONS = ["👍", "❤️", "🎉", "😮", "😂", "🔥"] as const;

type ControlBarProps = {
  role: LiveRole;
  micOn: boolean;
  camOn: boolean;
  screenOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreen: () => void;
  myHand: boolean;
  onToggleHand: () => void;
  chatActive: boolean;
  peopleActive: boolean;
  pollActive: boolean;
  chatUnread: boolean;
  pollLive: boolean;
  participantCount: number;
  onOpenPanel: (tab: PanelTab) => void;
  isTeacher: boolean;
  slideIndex: number;
  slideCount: number;
  onGotoSlide: (index: number) => void;
  live: boolean;
  onGoLive: () => void;
  onEndClass: () => void;
  onMuteAll: () => void;
  onReaction: (emoji: string) => void;
};

const BTN = "flex h-11 min-w-11 items-center justify-center rounded-full transition-colors";
const BTN_ON = `${BTN} bg-white/10 text-[#f6ecd4] hover:bg-white/15`;
const BTN_OFF = `${BTN} border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25`;
const BTN_NEUTRAL = `${BTN} border border-white/10 text-[#c6b995] hover:bg-white/10 hover:text-[#f6ecd4]`;
const BTN_GOLD = `${BTN} border border-[#d9b75c]/50 bg-[#d9b75c]/15 text-[#d9b75c] hover:bg-[#d9b75c]/25`;

export function ControlBar({
  role,
  micOn,
  camOn,
  screenOn,
  onToggleMic,
  onToggleCam,
  onToggleScreen,
  myHand,
  onToggleHand,
  chatActive,
  peopleActive,
  pollActive,
  chatUnread,
  pollLive,
  participantCount,
  onOpenPanel,
  isTeacher,
  slideIndex,
  slideCount,
  onGotoSlide,
  live,
  onGoLive,
  onEndClass,
  onMuteAll,
  onReaction,
}: ControlBarProps) {
  const [reactOpen, setReactOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  return (
    <div
      role="toolbar"
      aria-label="ক্লাসরুম কন্ট্রোল"
      className="flex flex-wrap items-center gap-1.5 border-t border-white/10 bg-[#18150e] px-3 py-2.5"
    >
      {/* ── My media ─────────────────────────────────────────────────── */}
      <button type="button" onClick={onToggleMic} aria-label={micOn ? "মাইক বন্ধ করুন" : "মাইক চালু করুন"} aria-pressed={micOn} className={micOn ? BTN_ON : BTN_OFF}>
        {micOn ? <Mic className="h-5 w-5" aria-hidden /> : <MicOff className="h-5 w-5" aria-hidden />}
      </button>

      <button type="button" onClick={onToggleCam} aria-label={camOn ? "ক্যামেরা বন্ধ করুন" : "ক্যামেরা চালু করুন"} aria-pressed={camOn} className={camOn ? BTN_ON : BTN_OFF}>
        {camOn ? <Video className="h-5 w-5" aria-hidden /> : <VideoOff className="h-5 w-5" aria-hidden />}
      </button>

      <button
        type="button"
        onClick={onToggleScreen}
        aria-label={screenOn ? "স্ক্রিন শেয়ার বন্ধ করুন" : "স্ক্রিন শেয়ার শুরু করুন"}
        aria-pressed={screenOn}
        className={screenOn ? BTN_GOLD : BTN_NEUTRAL}
      >
        {screenOn ? <MonitorUp className="h-5 w-5" aria-hidden /> : <MonitorX className="h-5 w-5" aria-hidden />}
      </button>

      {/* ── Reactions ────────────────────────────────────────────────── */}
      <Popover open={reactOpen} onOpenChange={setReactOpen}>
        <PopoverTrigger asChild>
          <button type="button" aria-label="রিয়াকশন পাঠান" aria-expanded={reactOpen} className={BTN_NEUTRAL}>
            <SmilePlus className="h-5 w-5" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto border-white/10 bg-[#18150e] p-2">
          <div className="grid grid-cols-6 gap-1">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReaction(emoji);
                  setReactOpen(false);
                }}
                aria-label={`প্রতিক্রিয়া ${emoji}`}
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-white/10 active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Raise hand (students) ────────────────────────────────────── */}
      {role !== "teacher" ? (
        <button type="button" onClick={onToggleHand} aria-label={myHand ? "হাত নামান" : "হাত তুলুন"} aria-pressed={myHand} className={myHand ? BTN_GOLD : BTN_NEUTRAL}>
          <Hand className="h-5 w-5" aria-hidden />
        </button>
      ) : null}

      {/* ── Panel toggles ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onOpenPanel("chat")}
        aria-label="চ্যাট প্যানেল"
        aria-pressed={chatActive}
        className={`relative ${chatActive ? BTN_ON : BTN_NEUTRAL}`}
      >
        <MessageSquare className="h-5 w-5" aria-hidden />
        {chatUnread ? <span aria-hidden className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /> : null}
      </button>

      <button type="button" onClick={() => onOpenPanel("people")} aria-label="অংশগ্রহণকারী প্যানেল" aria-pressed={peopleActive} className={peopleActive ? BTN_ON : BTN_NEUTRAL}>
        <Users className="h-5 w-5" aria-hidden />
        <span className="ml-1 text-xs tabular-nums">{participantCount}</span>
      </button>

      <button
        type="button"
        onClick={() => onOpenPanel("poll")}
        aria-label="পোল প্যানেল"
        aria-pressed={pollActive}
        className={`relative ${pollActive ? BTN_ON : BTN_NEUTRAL}`}
      >
        <Vote className="h-5 w-5" aria-hidden />
        {pollLive ? <span aria-hidden className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /> : null}
      </button>

      {/* ── Teacher-only ─────────────────────────────────────────────── */}
      {isTeacher ? (
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <div className="flex items-center rounded-full border border-white/10">
            <button
              type="button"
              aria-label="আগের স্লাইড"
              disabled={slideIndex <= 0}
              onClick={() => onGotoSlide(slideIndex - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-l-full text-[#c6b995] transition-colors hover:bg-white/10 hover:text-[#f6ecd4] disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="px-1 text-xs tabular-nums text-[#c6b995]">
              {bnNum(slideIndex + 1)}/{bnNum(slideCount)}
            </span>
            <button
              type="button"
              aria-label="পরের স্লাইড"
              disabled={slideIndex >= slideCount - 1}
              onClick={() => onGotoSlide(slideIndex + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-r-full text-[#c6b995] transition-colors hover:bg-white/10 hover:text-[#f6ecd4] disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {live ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setEndOpen(true)}
              className="h-11 rounded-full bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600"
            >
              ক্লাস শেষ
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onGoLive}
              className="h-11 rounded-full bg-brand-gradient px-4 text-sm font-semibold text-[#f6ecd4] hover:opacity-90"
            >
              লাইভ শুরু করুন
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="আরও অপশন" className={BTN_NEUTRAL}>
                <EllipsisVertical className="h-5 w-5" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/10 bg-[#18150e] text-[#f6ecd4]">
              <DropdownMenuItem onSelect={onMuteAll} className="gap-2 focus:bg-white/10 focus:text-[#f6ecd4]">
                <MicOff className="h-4 w-4 text-red-300" aria-hidden />
                সবার মাইক বন্ধ করুন
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      {/* ── Leave ────────────────────────────────────────────────────── */}
      <div className={`flex items-center border-l border-white/10 pl-2 ${isTeacher ? "" : "ml-auto"}`}>
        <a
          href="#/live"
          aria-label="ক্লাস ছাড়ুন"
          className="flex h-11 items-center gap-1.5 rounded-full bg-red-500 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          ক্লাস ছাড়ুন
        </a>
      </div>

      {/* ── End-class confirm ────────────────────────────────────────── */}
      <AlertDialog open={endOpen} onOpenChange={setEndOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নিশ্চিতভাবে ক্লাস শেষ করবেন?</AlertDialogTitle>
            <AlertDialogDescription>সব শিক্ষার্থী ক্লাসরুম থেকে বেরিয়ে যাবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEndOpen(false);
                onEndClass();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              ক্লাস শেষ করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
