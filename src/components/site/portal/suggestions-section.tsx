"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileCode2,
  FileText,
  Hash,
  Lightbulb,
  Link2,
  Lock,
  Music,
  Play,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import { bnNum } from "@/components/site/portal/portal-utils";
import { usePortalStore } from "@/lib/portal-store";

type SuggestionKind = "html" | "pdf" | "audio" | "video" | "link";

type SuggestionItem = {
  id: string;
  title: string;
  desc: string;
  category: string;
  fileUrl: string;
  kind: SuggestionKind;
  serial?: number | null;
  createdAt: string;
};

type LoadState =
  | { phase: "loading" }
  | { phase: "locked" }
  | { phase: "ready"; items: SuggestionItem[] };

/** Serial buckets derived from the test titles — mirrors the DB serial order. */
type SerialGroup = "all" | "full-test" | "listening" | "other";

const groupMeta: Record<
  Exclude<SerialGroup, "all">,
  { label: string; tile: string }
> = {
  "full-test": { label: "ফুল প্র্যাকটিস টেস্ট", tile: "bg-pastel-sky text-[#2c4f8a]" },
  listening: { label: "লিসেনিং টেস্ট", tile: "bg-pastel-green text-[#1f5c40]" },
  other: { label: "অন্যান্য প্র্যাকটিস", tile: "bg-pastel-butter text-[#7a5a16]" },
};

function groupOf(item: SuggestionItem): Exclude<SerialGroup, "all"> {
  if (/Listening Full Test/i.test(item.title)) return "full-test";
  if (/Listening Test/i.test(item.title)) return "listening";
  return "other";
}

const kindMeta: Record<SuggestionKind, { icon: LucideIcon; label: string; tile: string }> = {
  html: { icon: FileCode2, label: "HTML Test", tile: "bg-pastel-sky text-[#2c4f8a]" },
  pdf: { icon: FileText, label: "PDF", tile: "bg-pastel-ruby text-[#7a2734]" },
  audio: { icon: Music, label: "Audio", tile: "bg-pastel-green text-[#1f5c40]" },
  video: { icon: Video, label: "Video", tile: "bg-pastel-orange text-[#7a4c12]" },
  link: { icon: Link2, label: "Link", tile: "bg-pastel-butter text-[#7a5a16]" },
};

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/** ISO createdAt → "২৩ সেপ্টেম্বর" — client-only (data arrives post-mount), hydration-safe. */
function uploadedDateBn(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${bnNum(d.getDate())} ${BN_MONTHS[d.getMonth()] ?? ""}`;
}

const cardClass =
  "group flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#d9b75c]/60 hover:shadow-[0_10px_28px_rgba(217,183,92,0.14)]";

const actionPillClass =
  "flex h-8 items-center gap-1.5 rounded-full border border-primary/30 px-3 text-xs font-bold text-primary transition-all group-hover:border-[#d9b75c] group-hover:bg-[#d9b75c] group-hover:text-ink";

/* ------------------------------------------------------------------ */
/*  Serial badge — gold coin with the Bengali serial number            */
/* ------------------------------------------------------------------ */

function SerialBadge({ serial }: { serial: number }) {
  return (
    <span
      title={`সিরিয়াল ${bnNum(serial)}`}
      className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#eeda9d] via-[#d9b75c] to-[#b08a2e] px-1.5 font-display text-[13px] font-extrabold text-ink shadow-[0_3px_10px_rgba(176,138,46,0.35)]"
    >
      {bnNum(serial)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive Web-Based Suggestion Reader (PDF + HTML + Audio)       */
/* ------------------------------------------------------------------ */

type ReaderTheme = "light" | "sepia" | "dark";
type SideTool = "none" | "answers" | "timer" | "notes";

function SuggestionWebReader({
  item,
  onClose,
}: {
  item: SuggestionItem;
  onClose: () => void;
}) {
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [zoom, setZoom] = useState<number>(100);
  const [sideTool, setSideTool] = useState<SideTool>("answers");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Answer Sheet state (Q1 - Q40)
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questionCount, setQuestionCount] = useState<number>(40);

  // Study Notes state
  const [notes, setNotes] = useState<string>("");

  // Exam Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(60 * 60); // default 60 min
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerPreset, setTimerPreset] = useState<number>(60);

  // Load saved answers & notes from localStorage
  useEffect(() => {
    try {
      const savedAns = localStorage.getItem(`sia_ans_${item.id}`);
      if (savedAns) setAnswers(JSON.parse(savedAns));
      const savedNotes = localStorage.getItem(`sia_notes_${item.id}`);
      if (savedNotes) setNotes(savedNotes);
    } catch {
      /* ignore */
    }
  }, [item.id]);

  // Save answers & notes to localStorage
  const updateAnswer = (qNum: number, val: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [qNum]: val };
      try {
        localStorage.setItem(`sia_ans_${item.id}`, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const updateNotes = (val: string) => {
    setNotes(val);
    try {
      localStorage.setItem(`sia_notes_${item.id}`, val);
    } catch {
      /* ignore */
    }
  };

  const clearAnswers = () => {
    if (window.confirm("আপনি কি নিশ্চিত যে সব উত্তর মুছে ফেলতে চান?")) {
      setAnswers({});
      try {
        localStorage.removeItem(`sia_ans_${item.id}`);
      } catch {
        /* ignore */
      }
    }
  };

  // Timer countdown interval
  useEffect(() => {
    if (!timerRunning) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerRunning]);

  const resetTimer = (mins: number) => {
    setTimerPreset(mins);
    setTimerSeconds(mins * 60);
    setTimerRunning(false);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Keyboard shortcut for Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isFullscreen) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;

  const isPdf = item.kind === "pdf" || item.fileUrl.toLowerCase().endsWith(".pdf");

  // PDF iframe source with web flags
  const viewerUrl = useMemo(() => {
    if (isPdf) {
      // Append toolbar & view parameters for clean embedding
      return `${item.fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
    }
    return item.fileUrl;
  }, [item.fileUrl, isPdf]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col transition-colors duration-200",
        theme === "light" && "bg-[#f4f5f8] text-foreground",
        theme === "sepia" && "bg-[#fbf0d9] text-[#433422]",
        theme === "dark" && "bg-[#121316] text-[#e2e4e9]"
      )}
    >
      {/* ── Top Bar ── */}
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-4 shadow-sm z-10 transition-colors",
          theme === "light" && "border-border bg-card",
          theme === "sepia" && "border-[#e3d3b4] bg-[#f5e6c7] text-[#433422]",
          theme === "dark" && "border-[#272a30] bg-[#1a1c21] text-[#e2e4e9]"
        )}
      >
        {/* Left: Back + Title info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={cn(
              "h-8 shrink-0 rounded-full font-semibold text-xs transition",
              theme === "sepia" && "border-[#d8c39e] bg-[#ede0c3] hover:bg-[#e4d4b2] text-[#433422]",
              theme === "dark" && "border-[#333740] bg-[#22252c] text-[#e2e4e9] hover:bg-[#2b2f38]"
            )}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            ফিরে যান
          </Button>

          {typeof item.serial === "number" && (
            <span className="hidden sm:flex h-6 items-center rounded-full bg-[#d9b75c]/25 px-2 font-display text-[11px] font-bold text-[#8a6720]">
              সিরিয়াল {bnNum(item.serial)}
            </span>
          )}

          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-bold leading-tight">
              {item.title}
            </h2>
            <p className="truncate text-[10px] text-muted-foreground">
              {isPdf ? "ওয়েব রিডার (Interactive Document Reader)" : "ইন্টার‍্যাক্টিভ টেস্ট (Web Test)"} · {item.category}
            </p>
          </div>
        </div>

        {/* Center/Right: Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Theme Switcher */}
          <div className="flex items-center rounded-full border border-border/80 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              title="Clean White"
              className={cn(
                "flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition",
                theme === "light"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ☀️ দিন
            </button>
            <button
              type="button"
              onClick={() => setTheme("sepia")}
              title="Eye-Care Paper Sepia"
              className={cn(
                "flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition",
                theme === "sepia"
                  ? "bg-[#ede0c3] text-[#433422] shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              📜 আই-কেয়ার
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              title="Dark Reading Mode"
              className={cn(
                "flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition",
                theme === "dark"
                  ? "bg-[#2b2f38] text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌙 ডার্ক
            </button>
          </div>

          {/* Zoom Controls (for PDF / Web) */}
          {isPdf && (
            <div className="hidden md:flex items-center rounded-full border border-border/80 bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="h-7 w-7 rounded-full text-center hover:bg-muted font-bold"
                title="Zoom Out"
              >
                -
              </button>
              <span className="px-1.5 font-mono text-[11px] font-semibold text-muted-foreground">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                className="h-7 w-7 rounded-full text-center hover:bg-muted font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="rounded-full px-2 py-0.5 text-[10px] hover:bg-muted font-medium text-muted-foreground"
                title="Reset Zoom"
              >
                Fit
              </button>
            </div>
          )}

          {/* Interactive Tools Toggles */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={sideTool === "answers" ? "default" : "outline"}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold gap-1.5",
                sideTool === "answers" && "bg-ink text-white"
              )}
              onClick={() => setSideTool(sideTool === "answers" ? "none" : "answers")}
            >
              📝 উত্তরপত্র
              {answeredCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-bold">
                  {answeredCount}
                </span>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant={sideTool === "timer" ? "default" : "outline"}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold gap-1.5",
                sideTool === "timer" && "bg-ink text-white",
                timerRunning && "border-amber-500 text-amber-600 animate-pulse"
              )}
              onClick={() => setSideTool(sideTool === "timer" ? "none" : "timer")}
            >
              ⏱️ {formatTimer(timerSeconds)}
            </Button>

            <Button
              type="button"
              size="sm"
              variant={sideTool === "notes" ? "default" : "outline"}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold gap-1.5",
                sideTool === "notes" && "bg-ink text-white"
              )}
              onClick={() => setSideTool(sideTool === "notes" ? "none" : "notes")}
            >
              🗒️ নোটস
            </Button>
          </div>

          {/* New Tab & Fullscreen */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 rounded-full"
            title="Fullscreen"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ── Main Reader Workspace ── */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Document Pane */}
        <div
          className={cn(
            "flex-1 min-h-0 overflow-auto transition-all relative flex flex-col items-center p-2 sm:p-4",
            theme === "sepia" && "bg-[#f6ebd4]",
            theme === "dark" && "bg-[#0e0f12]"
          )}
        >
          <div
            style={{
              width: isPdf ? `${zoom}%` : "100%",
              maxWidth: isPdf ? undefined : "100%",
              height: "100%",
              minHeight: "100%",
              transition: "width 0.2s ease-out",
            }}
            className={cn(
              "rounded-2xl overflow-hidden shadow-md flex-1 w-full border transition-all duration-200",
              theme === "light" && "border-border bg-white",
              theme === "sepia" && "border-[#dfcca7] bg-[#fbf0d9] sepia-[0.35] brightness-[0.98] contrast-[0.95]",
              theme === "dark" && "border-[#22252c] bg-[#1a1c21] invert-[0.9] hue-rotate-[180deg]"
            )}
          >
            <iframe
              src={viewerUrl}
              className="h-full w-full border-0 min-h-[600px]"
              title={item.title}
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>

        {/* ── Interactive Side Tools Drawer ── */}
        {sideTool !== "none" && (
          <aside
            className={cn(
              "w-full sm:w-80 md:w-96 flex flex-col border-l shadow-xl z-20 transition-all duration-300",
              theme === "light" && "border-border bg-card",
              theme === "sepia" && "border-[#e3d3b4] bg-[#f8ecce] text-[#433422]",
              theme === "dark" && "border-[#272a30] bg-[#1a1c21] text-[#e2e4e9]"
            )}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 border-border/80">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold">
                  {sideTool === "answers" && "📝 উত্তরপত্র (Answer Sheet)"}
                  {sideTool === "timer" && "⏱️ পরীক্ষার টাইমার (Exam Timer)"}
                  {sideTool === "notes" && "🗒️ স্টাডি নোটস ও ভোকাবুলারি"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSideTool("none")}
                className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* ── Tab 1: Interactive Answer Sheet ── */}
            {sideTool === "answers" && (
              <div className="flex-1 flex flex-col min-h-0 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="text-xs text-muted-foreground">
                    পূরণ করা হয়েছে: <strong className="text-foreground">{answeredCount}</strong> / {questionCount}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="h-7 rounded-lg border border-border bg-muted/40 px-2 text-xs font-medium"
                    >
                      <option value={13}>১৩ টি প্রশ্ন</option>
                      <option value={14}>১৪ টি প্রশ্ন</option>
                      <option value={20}>২০ টি প্রশ্ন</option>
                      <option value={26}>২৬ টি প্রশ্ন</option>
                      <option value={40}>৪০ টি প্রশ্ন (Full)</option>
                    </select>
                    <button
                      type="button"
                      onClick={clearAnswers}
                      className="text-[11px] text-destructive hover:underline"
                    >
                      রিসেট
                    </button>
                  </div>
                </div>

                {/* Question Input Grid */}
                <div className="flex-1 overflow-y-auto py-3 pr-1 space-y-2">
                  {Array.from({ length: questionCount }).map((_, i) => {
                    const q = i + 1;
                    const val = answers[q] || "";
                    return (
                      <div key={q} className="flex items-center gap-2">
                        <span className="w-8 shrink-0 text-right font-mono text-xs font-bold text-muted-foreground">
                          Q{q}.
                        </span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => updateAnswer(q, e.target.value)}
                          placeholder={`উত্তর ${q}`}
                          className={cn(
                            "h-8 flex-1 rounded-lg border px-2.5 text-xs font-medium uppercase transition",
                            val
                              ? "border-emerald-500/60 bg-emerald-500/5 text-foreground font-bold"
                              : "border-border bg-muted/30 text-foreground"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-border/70 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    ✓ উত্তরগুলো আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।
                  </p>
                </div>
              </div>
            )}

            {/* ── Tab 2: Exam Timer ── */}
            {sideTool === "timer" && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-muted/50 p-8 shadow-inner border border-border/80">
                  <span className="font-mono text-4xl font-extrabold tracking-wider text-foreground">
                    {formatTimer(timerSeconds)}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    {timerRunning ? "পরীক্ষা চলছে…" : "টাইমার থামানো আছে"}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={cn(
                      "rounded-full px-6 font-bold shadow-md",
                      timerRunning ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                  >
                    {timerRunning ? "⏸ Pause" : "▶ Start Timer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => resetTimer(timerPreset)}
                    className="rounded-full"
                  >
                    ↺ Reset
                  </Button>
                </div>

                <div className="mt-6 w-full border-t border-border/60 pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Preset নির্বাচন করুন:</p>
                  <div className="flex justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => resetTimer(60)}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      60 Min (Full)
                    </button>
                    <button
                      type="button"
                      onClick={() => resetTimer(20)}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      20 Min (Passage)
                    </button>
                    <button
                      type="button"
                      onClick={() => resetTimer(10)}
                      className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      10 Min (Quick)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 3: Study Notes ── */}
            {sideTool === "notes" && (
              <div className="flex-1 flex flex-col p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  পড়ার সময় গুরুত্বপূর্ণ ভোকাবুলারি ও স্ট্র্যাটেজি নোট রাখুন:
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="এখানে আপনার নোটস লিখুন... যেমন: 
- Note 1: Para B contains heading trick
- Vocab: Disseminate = spread information"
                  className="flex-1 w-full rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>✓ স্বয়ংক্রিয়ভাবে সেভ হচ্ছে</span>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(notes);
                      toast.success("নোট কপি হয়েছে!");
                    }}
                    className="text-primary hover:underline font-semibold"
                  >
                    নোট কপি করুন
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggestion card                                                    */
/* ------------------------------------------------------------------ */

function SuggestionCard({
  item,
  onOpenViewer,
}: {
  item: SuggestionItem;
  onOpenViewer: (item: SuggestionItem) => void;
}) {
  const group = groupOf(item);
  const date = uploadedDateBn(item.createdAt);
  const hasSerial = typeof item.serial === "number";
  const isWebReadable = item.kind === "html" || item.kind === "pdf" || item.fileUrl.endsWith(".pdf") || item.fileUrl.endsWith(".html");

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {hasSerial ? (
            <SerialBadge serial={item.serial as number} />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground" aria-hidden>
              <Hash className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a7d5f]">
              {groupMeta[group].label}
            </p>
            {date ? (
              <p className="text-[10px] font-semibold text-muted-foreground/70">
                আপলোড · {date}
              </p>
            ) : null}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
            item.kind === "pdf"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : item.kind === "html"
                ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                : "border-border/70 bg-muted/60 text-muted-foreground"
          )}
        >
          {item.kind === "pdf" ? "ওয়েব রিডার (PDF)" : item.kind === "html" ? "ইন্টার‍্যাক্টিভ টেস্ট" : kindMeta[item.kind]?.label ?? "ফাইল"}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {item.title}
      </p>
      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {item.desc || "IELTS পরীক্ষার জন্য গুরুত্বপূর্ণ সাজেস্টিভ প্র্যাকটিস টেস্ট ও ম্যাটেরিয়াল।"}
      </p>

      {item.kind === "audio" ? (
        <audio
          controls
          preload="none"
          src={item.fileUrl}
          className="mt-3 h-9 w-full"
          aria-label={item.title}
        />
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {hasSerial ? `সিরিয়াল ${bnNum(item.serial as number)}` : "SUGGESTIONS"}
        </span>

        {isWebReadable ? (
          <span className={actionPillClass}>
            <Play className="h-3.5 w-3.5" aria-hidden />
            {item.kind === "pdf" ? "ওয়েব রিডারে পড়ুন" : "টেস্ট শুরু করুন"}
          </span>
        ) : item.kind === "audio" ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={actionPillClass}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            নত ট্যাবে খুলুন
          </a>
        ) : (
          <span className={actionPillClass}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            খুলুন
          </span>
        )}
      </div>
    </>
  );

  // Both PDF and HTML open the interactive in-portal web reader
  if (isWebReadable) {
    return (
      <button
        type="button"
        onClick={() => onOpenViewer(item)}
        aria-haspopup="dialog"
        className={cn(cardClass, "cursor-pointer")}
      >
        {body}
      </button>
    );
  }
  if (item.kind === "audio") {
    return <article className={cardClass}>{body}</article>;
  }
  return (
    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {body}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function SuggestionsSection() {
  const user = usePortalStore((s) => s.user);
  const phone = user?.phone ?? null;
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [active, setActive] = useState<SuggestionItem | null>(null);
  const [filter, setFilter] = useState<SerialGroup>("all");
  const closeViewer = useCallback(() => setActive(null), []);
  const openViewer = useCallback((item: SuggestionItem) => setActive(item), []);

  useEffect(() => {
    if (!phone) return;
    let alive = true;
    fetch(`/api/portal/suggestions?phone=${encodeURIComponent(phone)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (d?.ok && d.locked === true) {
          setState({ phase: "locked" });
        } else if (d?.ok && Array.isArray(d.suggestions)) {
          setState({ phase: "ready", items: d.suggestions as SuggestionItem[] });
        } else {
          setState({ phase: "ready", items: [] });
        }
      })
      .catch(() => {
        if (alive) setState({ phase: "ready", items: [] });
      });
    return () => {
      alive = false;
    };
  }, [phone]);

  const items = state.phase === "ready" ? state.items : [];
  const counts = useMemo(() => {
    const c: Record<SerialGroup, number> = { all: items.length, "full-test": 0, listening: 0, other: 0 };
    for (const item of items) c[groupOf(item)] += 1;
    return c;
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => groupOf(i) === filter)),
    [items, filter]
  );

  const filterChips: { key: SerialGroup; label: string }[] = [
    { key: "all", label: "সবগুলো" },
    { key: "full-test", label: groupMeta["full-test"].label },
    { key: "listening", label: groupMeta["listening"].label },
    { key: "other", label: groupMeta["other"].label },
  ];

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          title="সাজেশন ও প্র্যাকটিস (Web Interactive Library)"
          desc="কোর্সের সাজেশন ও ফুল প্র্যাকটিস টেস্ট ওয়েব-রিডারে পড়ুন, সাথে ডিজিটাল উত্তরপত্র, টাইমার ও স্টাডি নোটস।"
          action={
            state.phase === "ready" && state.items.length > 0 ? (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <Lightbulb className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {bnNum(state.items.length)} টি ওয়েব ম্যাটেরিয়াল
              </Badge>
            ) : null
          }
        />
      </Reveal>

      {state.phase === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : null}

      {state.phase === "locked" ? (
        <Reveal y={12} delay={0.04}>
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-[#d9b75c]/45 bg-[#d9b75c]/[0.06] px-6 py-14 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-radial-glow blur-2xl"
            />
            <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b75c]/15">
              <Lock className="h-8 w-8 text-[#8a7a4d]" aria-hidden />
            </span>
            <h2 className="relative mx-auto mt-5 max-w-lg font-display text-xl font-bold leading-snug text-foreground md:text-2xl">
              সাজেশন ও প্র্যাকটিস টেস্ট শুধু পেইড কোর্সের শিক্ষার্থীদের জন্য
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              যেকোনো পেইড কোর্সে ভর্তি হলেই সব সাজেশন ও ফুল প্র্যাকটিস টেস্ট আনলক হবে।
            </p>
            <Button
              asChild
              size="lg"
              className="relative mt-7 rounded-full bg-ink font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85"
            >
              <a href="#/courses">
                <Lightbulb className="mr-2 h-4.5 w-4.5" aria-hidden />
                কোর্স দেখুন
              </a>
            </Button>
          </div>
        </Reveal>
      ) : null}

      {state.phase === "ready" ? (
        state.items.length > 0 ? (
          <>
            {/* Serial-group filter chips */}
            <Reveal y={12} delay={0.02}>
              <div
                role="tablist"
                aria-label="সাজেশন ফিল্টার"
                className="flex flex-wrap items-center gap-2"
              >
                {filterChips.map((chip) => {
                  const isActive = filter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setFilter(chip.key)}
                      className={cn(
                        "flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all",
                        isActive
                          ? "border-transparent bg-gradient-to-br from-[#eeda9d] via-[#d9b75c] to-[#b08a2e] text-ink shadow-[0_4px_14px_rgba(176,138,46,0.35)]"
                          : "border-border bg-card text-muted-foreground hover:border-[#d9b75c]/60 hover:text-foreground"
                      )}
                    >
                      {chip.label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none",
                          isActive ? "bg-ink/15 text-ink" : "bg-muted/70 text-muted-foreground"
                        )}
                      >
                        {bnNum(counts[chip.key])}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal y={12} delay={0.04}>
              {visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => (
                    <SuggestionCard key={item.id} item={item} onOpenViewer={openViewer} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
                  <p className="font-display text-base font-bold text-foreground">
                    এই ক্যাটাগরিতে এখনো কিছু নেই
                  </p>
                  <p className="text-sm text-muted-foreground">
                    অন্য ক্যাটাগরি দেখুন, নতুন ফাইল যোগ হতে থাকবে।
                  </p>
                </div>
              )}
            </Reveal>
          </>
        ) : (
          <Reveal y={12} delay={0.04}>
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" aria-hidden />
              </span>
              <p className="font-display text-base font-bold text-foreground">
                এখনো কোনো সাজেশন আপলোড হয়নি
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                আপডেটের জন্য অপেক্ষা করুন, নতুন সাজেশন ও প্র্যাকটিস টেস্ট এখানেই যোগ হতে থাকবে।
              </p>
            </div>
          </Reveal>
        )
      ) : null}

      {active ? <SuggestionWebReader item={active} onClose={closeViewer} /> : null}
    </div>
  );
}

