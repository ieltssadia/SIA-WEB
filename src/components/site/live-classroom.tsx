"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Crown,
  Hand,
  Loader2,
  MessageSquare,
  Radio,
  Send,
  Users,
  Vote,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveRoom, type ChatMsg, type Participant, type Role } from "@/lib/use-live-room";
import type { ClassSlide, LiveClassDetail } from "@/lib/live-types";

const REACTIONS = ["👍", "❤️", "🎉", "😮", "😂", "🔥"] as const;

const dhakaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

function startLabel(iso: string): string {
  return dhakaTime.format(new Date(iso));
}

/** "1h 05m 12s"-style elapsed clock. */
function elapsedLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/** Compact future countdown: "2d 3h", "4h 12m", "9m", "<1m". */
function countdownLabel(ms: number): string {
  if (ms <= 60_000) return "<1 মিনিট";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} মিনিট`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা ${mins % 60} মিনিট`;
  return `${Math.floor(hours / 24)} দিন ${hours % 24} ঘণ্টা`;
}

export type LiveIdentity = { name: string; role: Role; hostKey?: string };

/**
 * The real-time classroom. Everything interactive (chat, slides, polls,
 * reactions, camera) runs over the socket room joined in useLiveRoom.
 */
export function LiveClassroom({ classMeta, identity }: { classMeta: LiveClassDetail; identity: LiveIdentity }) {
  const room = useLiveRoom({
    classId: classMeta.slug,
    name: identity.name,
    role: identity.role,
    hostKey: identity.hostKey,
    initialLive: classMeta.status === "live",
    enabled: true,
  });

  const [tab, setTab] = useState("chat");
  const [now, setNow] = useState<number | null>(null);
  const [pollFormOpen, setPollFormOpen] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftOptions, setDraftOptions] = useState<string[]>(["", ""]);
  const [camError, setCamError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ticking clock (client-only → hydration-safe; first tick fires async)
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  // My poll vote — reset automatically when a new poll question arrives
  // (React's sanctioned "adjust state during render" pattern).
  const pollQuestion = room.poll?.question ?? null;
  const [voteState, setVoteState] = useState<{ q: string | null; index: number | null }>({
    q: null,
    index: null,
  });
  if (voteState.q !== pollQuestion) {
    setVoteState({ q: pollQuestion, index: null });
  }
  const myVote = voteState.q === pollQuestion ? voteState.index : null;

  const slides: ClassSlide[] = classMeta.slides.length
    ? classMeta.slides
    : [{ title: classMeta.title, bullets: [classMeta.description ?? ""] }];
  const safeSlideIndex = Math.min(room.slideIndex, Math.max(0, slides.length - 1));

  // ---------------- teacher camera (frame streaming) ----------------

  const stopFrameLoop = () => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  };

  const disableCam = () => {
    stopFrameLoop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);
    room.stopCam();
  };

  const enableCam = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 270, frameRate: 15 },
        audio: false,
      });
      streamRef.current = stream;
      setLocalStream(stream);
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = stream;
        await hiddenVideoRef.current.play().catch(() => {});
      }
      room.startCam();
      stopFrameLoop();
      frameTimerRef.current = setInterval(() => {
        const v = hiddenVideoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < 2) return;
        c.width = 480;
        c.height = 270;
        c.getContext("2d")?.drawImage(v, 0, 0, 480, 270);
        try {
          room.sendCamFrame(c.toDataURL("image/jpeg", 0.5));
        } catch {
          /* frame skipped */
        }
      }, 220); // ~4.5 fps — gentle on the gateway, smooth enough for a demo
    } catch {
      setCamError("ক্যামেরা অনুমতি পাওয়া যায়নি — ব্রাউজার permission চেক করুন।");
    }
  };

  useEffect(
    () => () => {
      stopFrameLoop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  // ---------------- states that replace the room UI ----------------

  if (room.status === "denied") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-xl font-bold">{room.deniedReason ?? "যুক্ত হওয়া যাচ্ছে না।"}</p>
        <Button asChild variant="outline" className="mt-6 border-primary/30">
          <a href="#/live">লাইভ হাবে ফিরে যান</a>
        </Button>
      </div>
    );
  }

  if (room.status === "error") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-xl font-bold">সংযোগ ব্যর্থ হয়েছে</p>
        <p className="mt-2 text-sm text-muted-foreground">
          লাইভ সার্ভারের সাথে সংযোগ করা যায়নি — পেজ রিলোড করে আবার চেষ্টা করুন।
        </p>
        <Button asChild variant="outline" className="mt-6 border-primary/30">
          <a href="#/live">লাইভ হাবে ফিরে যান</a>
        </Button>
      </div>
    );
  }

  if (room.status !== "joined") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="mt-4 text-sm">ক্লাসরুমে যুক্ত হচ্ছে…</p>
      </div>
    );
  }

  const me = room.participants.find((p) => p.id === room.meId);
  const handRaised = !!me?.handRaised;
  const teacher = room.participants.find((p) => p.role === "teacher");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-[#0b0b0e] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-primary/10 bg-[#0d0d11] px-4 py-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-primary"
          >
            <a href="#/live">
              <span className="sr-only">লাইভ হাবে ফিরে যান</span>
              ← লাইভ হাব
            </a>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold sm:text-base">{classMeta.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {classMeta.teacher} · {startLabel(classMeta.startsAt)} (Dhaka)
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="tabular-nums">{room.participants.length}</span>
          </span>
          {room.live && now ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio className="h-3.5 w-3.5 text-red-400" aria-hidden />
              <span className="tabular-nums">{elapsedLabel(now - new Date(classMeta.startsAt).getTime())}</span>
            </span>
          ) : null}
          {!room.connected ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
              <WifiOff className="h-3 w-3" aria-hidden />
              পুনরায় সংযোগ হচ্ছে…
            </span>
          ) : null}
        </div>

        {/* ── Stage + sidebar ─────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col">
            <Stage
              slides={slides}
              slideIndex={safeSlideIndex}
              live={room.live}
              startsAt={classMeta.startsAt}
              role={identity.role}
              camOn={room.camOn}
              initialFrame={room.initialFrame}
              socketRef={room.socket}
              localStream={localStream}
              now={now}
            />

            {/* Control bar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-primary/10 bg-[#0d0d11] px-3 py-2.5">
              <div className="flex items-center gap-1">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => room.sendReaction(emoji)}
                    aria-label={`প্রতিক্রিয়া ${emoji}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-accent active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {identity.role === "student" ? (
                <Button
                  variant={handRaised ? "default" : "outline"}
                  size="sm"
                  onClick={() => room.setHand(!handRaised)}
                  aria-pressed={handRaised}
                  className={
                    handRaised
                      ? "bg-gold-gradient font-semibold text-[#16120a]"
                      : "border-primary/25 text-muted-foreground hover:text-primary"
                  }
                >
                  <Hand className="mr-1.5 h-4 w-4" aria-hidden />
                  {handRaised ? "হাত তোলা আছে" : "হাত তুলুন"}
                </Button>
              ) : null}

              {identity.role === "teacher" ? (
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {/* Slides */}
                  <div className="flex items-center rounded-md border border-primary/20">
                    <button
                      type="button"
                      aria-label="আগের স্লাইড"
                      onClick={() => room.gotoSlide(Math.max(0, safeSlideIndex - 1))}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="px-1 text-xs tabular-nums text-muted-foreground">
                      {safeSlideIndex + 1}/{slides.length}
                    </span>
                    <button
                      type="button"
                      aria-label="পরের স্লাইড"
                      onClick={() => room.gotoSlide(Math.min(slides.length - 1, safeSlideIndex + 1))}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (room.camOn ? disableCam() : enableCam())}
                    className={
                      room.camOn
                        ? "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        : "border-primary/25 text-muted-foreground hover:text-primary"
                    }
                  >
                    {room.camOn ? (
                      <CameraOff className="mr-1.5 h-4 w-4" aria-hidden />
                    ) : (
                      <Camera className="mr-1.5 h-4 w-4" aria-hidden />
                    )}
                    {room.camOn ? "ক্যামেরা বন্ধ" : "ক্যামেরা চালু"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPollFormOpen((v) => !v)}
                    className="border-primary/25 text-muted-foreground hover:text-primary"
                  >
                    <Vote className="mr-1.5 h-4 w-4" aria-hidden />
                    পোল
                  </Button>

                  {room.live ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (window.confirm("নিশ্চিতভাবে ক্লাস শেষ করবেন?")) {
                          if (streamRef.current) disableCam();
                          room.endClass();
                        }
                      }}
                      className="bg-red-500 font-semibold text-white hover:bg-red-600"
                    >
                      ক্লাস শেষ করুন
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        room.goLive();
                        setTab("chat");
                      }}
                      className="bg-gold-gradient font-semibold text-[#16120a]"
                    >
                      🔴 লাইভ শুরু করুন
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            {camError ? (
              <p role="alert" className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
                {camError}
              </p>
            ) : null}

            {/* Teacher poll composer */}
            {identity.role === "teacher" && pollFormOpen ? (
              <div className="border-t border-primary/10 bg-[#101014] px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor="poll-q" className="text-xs text-muted-foreground">
                      পোল প্রশ্ন
                    </Label>
                    <Input
                      id="poll-q"
                      value={draftQuestion}
                      onChange={(e) => setDraftQuestion(e.target.value)}
                      placeholder="যেমন: আজকের ক্লাস কেমন লাগছে?"
                      className="h-9 border-primary/20 bg-[#16161b]"
                    />
                  </div>
                  <div className="flex gap-2">
                    {draftOptions.map((opt, i) => (
                      <Input
                        key={i}
                        value={opt}
                        onChange={(e) =>
                          setDraftOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                        }
                        placeholder={`অপশন ${i + 1}`}
                        aria-label={`পোল অপশন ${i + 1}`}
                        className="h-9 w-28 border-primary/20 bg-[#16161b]"
                      />
                    ))}
                    {draftOptions.length < 4 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setDraftOptions((p) => [...p, ""])}
                      >
                        + অপশন
                      </Button>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    className="bg-gold-gradient font-semibold text-[#16120a]"
                    onClick={() => {
                      const opts = draftOptions.map((o) => o.trim()).filter(Boolean);
                      if (!draftQuestion.trim() || opts.length < 2) return;
                      room.startPoll(draftQuestion.trim(), opts);
                      setPollFormOpen(false);
                      setDraftQuestion("");
                      setDraftOptions(["", ""]);
                      setTab("poll");
                    }}
                  >
                    শুরু করুন
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Sidebar: chat / people / poll ──────────────────────── */}
          <aside className="border-t border-primary/10 lg:border-l lg:border-t-0">
            <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-primary/10 bg-[#0d0d11]">
                <TabsTrigger value="chat" className="gap-1.5 data-[state=active]:text-primary">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                  চ্যাট
                </TabsTrigger>
                <TabsTrigger value="people" className="gap-1.5 data-[state=active]:text-primary">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  <span className="tabular-nums">{room.participants.length}</span>
                </TabsTrigger>
                <TabsTrigger value="poll" className="relative gap-1.5 data-[state=active]:text-primary">
                  <Vote className="h-3.5 w-3.5" aria-hidden />
                  পোল
                  {room.poll ? (
                    <span aria-hidden className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                  ) : null}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0 flex min-h-0 flex-col">
                <ChatPanel chat={room.chat} meId={room.meId} onSend={room.sendChat} />
              </TabsContent>

              <TabsContent value="people" className="mt-0">
                <PeoplePanel participants={room.participants} meId={room.meId} />
              </TabsContent>

              <TabsContent value="poll" className="mt-0">
                <PollPanel
                  poll={room.poll}
                  myVote={myVote}
                  role={identity.role}
                  onVote={(i) => {
                    if (myVote !== null) return;
                    setVoteState({ q: pollQuestion, index: i });
                    room.vote(i);
                  }}
                  onEnd={() => room.endPoll()}
                />
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>

      {/* Hidden frame-capture pipeline (teacher camera → JPEG frames) */}
      <video ref={hiddenVideoRef} className="hidden" muted playsInline aria-hidden />
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}

/* ── Stage ──────────────────────────────────────────────────────────── */

function Stage({
  slides,
  slideIndex,
  live,
  startsAt,
  role,
  camOn,
  initialFrame,
  socketRef,
  localStream,
  now,
}: {
  slides: ClassSlide[];
  slideIndex: number;
  live: boolean;
  startsAt: string;
  role: Role;
  camOn: boolean;
  initialFrame: string | null;
  socketRef: React.RefObject<import("socket.io-client").Socket | null>;
  localStream: MediaStream | null;
  now: number | null;
}) {
  const [frame, setFrame] = useState<string | null>(initialFrame);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Live camera frames + floating reactions
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onFrame = (e: { data?: string }) => {
      if (typeof e?.data === "string") setFrame(e.data);
    };
    const onCamStatus = (e: { on?: boolean }) => {
      if (!e?.on) setFrame(null);
    };
    const onReact = (e: { emoji?: string }) => {
      if (!e?.emoji) return;
      const id = Math.random().toString(36).slice(2);
      setReactions((prev) => [...prev.slice(-24), { id, emoji: e.emoji as string, x: 8 + Math.random() * 74 }]);
      setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2700);
    };
    socket.on("cam:frame", onFrame);
    socket.on("cam:status", onCamStatus);
    socket.on("reaction:new", onReact);
    return () => {
      socket.off("cam:frame", onFrame);
      socket.off("cam:status", onCamStatus);
      socket.off("reaction:new", onReact);
    };
  }, [socketRef]);

  // Teacher's own local preview
  useEffect(() => {
    const v = localVideoRef.current;
    if (v && localStream) {
      v.srcObject = localStream;
      v.play().catch(() => {});
    }
  }, [localStream]);

  const slide = slides[Math.min(slideIndex, slides.length - 1)];
  const showCam = camOn && (role === "teacher" ? !!localStream : !!frame);
  const startsIn = now !== null ? new Date(startsAt).getTime() - now : null;
  const isLate = startsIn !== null && startsIn <= 0;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black" data-testid="classroom-stage">
      {/* Main surface */}
      {showCam ? (
        role === "teacher" ? (
          <video ref={localVideoRef} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={frame as string} alt="লাইভ ক্যামেরা" className="h-full w-full object-cover" />
        )
      ) : camOn ? (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ক্যামেরা সংযোগ হচ্ছে…
        </div>
      ) : (
        <SlideView slide={slide} />
      )}

      {/* Slide PIP while the camera is live */}
      {showCam ? (
        <div className="absolute bottom-3 right-3 w-40 overflow-hidden rounded-lg border border-white/15 bg-[#101014]/95 shadow-xl sm:w-52">
          <div className="border-b border-primary/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            স্লাইড {slideIndex + 1}/{slides.length}
          </div>
          <p className="line-clamp-2 px-2.5 py-1.5 text-[11px] leading-snug text-foreground/90">{slide.title}</p>
        </div>
      ) : null}

      {/* LIVE / waiting badge */}
      {live ? (
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          LIVE
        </span>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/72 px-6 text-center backdrop-blur-[2px]">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
            <Radio className="h-6 w-6 text-primary" aria-hidden />
          </span>
          <p className="font-display text-lg font-bold text-foreground">ক্লাস এখনো লাইভ হয়নি</p>
          <p className="text-sm text-muted-foreground">
            {isLate
              ? "ক্লাস শুরুর সময় হয়ে গেছে — শিক্ষক লাইভ করলেই এখানে দেখা যাবে।"
              : startsIn !== null
                ? `শুরু হতে বাকি ${countdownLabel(startsIn)} — শিক্ষক লাইভ করলেই এখানে দেখা যাবে।`
                : "শিক্ষক লাইভ করলেই এখানে দেখা যাবে।"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            চ্যাটে প্রশ্ন করে রাখুন — Sadia Ma'am লাইভে উত্তর দেবেন।
          </p>
        </div>
      )}

      {/* Floating reactions */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {reactions.map((r) => (
          <span
            key={r.id}
            className="live-reaction absolute bottom-2 text-3xl drop-shadow-lg"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Slide renderer ─────────────────────────────────────────────────── */

function SlideView({ slide }: { slide: ClassSlide }) {
  return (
    <div
      key={slide.title}
      className="animate-in fade-in slide-in-from-bottom-3 flex h-full w-full flex-col justify-center bg-[radial-gradient(ellipse_at_top,#17131f_0%,#070708_65%)] px-6 pt-16 pb-8 duration-300 sm:px-12 sm:py-0"
    >
      <div className="mx-auto w-full max-w-3xl">
        <span className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          <span className="h-px w-8 bg-primary/60" aria-hidden />
          Lesson
        </span>
        <h2 className="font-display text-xl font-bold leading-snug text-foreground sm:text-3xl">{slide.title}</h2>
        <ul className="mt-5 space-y-3">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 text-sm leading-relaxed text-foreground/85 duration-300 sm:text-base"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-gradient" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Chat ───────────────────────────────────────────────────────────── */

function ChatPanel({ chat, meId, onSend }: { chat: ChatMsg[]; meId: string | null; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.length]);

  return (
    <div className="flex h-[380px] flex-col sm:h-[440px] lg:h-[560px]">
      <div
        ref={scrollRef}
        className="live-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3"
        aria-label="ক্লাস চ্যাট"
        aria-live="polite"
      >
        {chat.length === 0 ? (
          <p className="pt-10 text-center text-xs text-muted-foreground">
            ক্লাস শুরু হলেই এখানে কথা বলা যাবে — প্রথম মেসেজটি আপনিই পাঠান!
          </p>
        ) : null}
        {chat.map((msg) =>
          msg.role === "system" ? (
            <p key={msg.id} className="text-center text-[11px] leading-relaxed text-muted-foreground/80">
              {msg.text}
            </p>
          ) : (
            <ChatBubble key={msg.id} msg={msg} own={!!msg.from && msg.from === meId} />
          )
        )}
      </div>
      <form
        className="flex items-center gap-2 border-t border-primary/10 bg-[#0d0d11] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          onSend(t);
          setText("");
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="মেসেজ লিখুন…"
          aria-label="চ্যাট মেসেজ"
          maxLength={500}
          className="h-10 border-primary/20 bg-[#16161b]"
        />
        <Button type="submit" size="icon" aria-label="পাঠান" className="h-10 w-10 shrink-0 bg-gold-gradient text-[#16120a] hover:opacity-90">
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}

function ChatBubble({ msg, own }: { msg: ChatMsg; own: boolean }) {
  return (
    <div className={own ? "flex justify-end" : ""}>
      <div className={own ? "max-w-[85%]" : "max-w-full"}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          {msg.role === "teacher" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-1.5 py-px text-[9px] font-bold uppercase text-[#16120a]">
              শিক্ষক
            </span>
          ) : null}
          {msg.name}
          <span className="font-normal text-muted-foreground/60">
            {new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: true }).format(
              new Date(msg.at)
            )}
          </span>
        </p>
        <p
          className={`mt-0.5 break-words text-sm leading-relaxed ${
            own ? "rounded-lg bg-primary/10 px-2.5 py-1.5" : msg.role === "teacher" ? "font-medium text-primary/95" : "text-foreground/90"
          }`}
        >
          {msg.text}
        </p>
      </div>
    </div>
  );
}

/* ── People ─────────────────────────────────────────────────────────── */

function PeoplePanel({ participants, meId }: { participants: Participant[]; meId: string | null }) {
  const sorted = [...participants].sort((a, b) => (a.role === "teacher" ? -1 : 1) - (b.role === "teacher" ? -1 : 1));
  return (
    <div className="live-scroll h-[380px] overflow-y-auto px-4 py-3 sm:h-[440px] lg:h-[560px]">
      <p className="mb-3 text-xs text-muted-foreground">
        ক্লাসে আছেন <span className="font-semibold text-foreground tabular-nums">{participants.length}</span> জন
      </p>
      <ul className="space-y-1.5">
        {sorted.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-sm transition-colors hover:border-primary/10 hover:bg-accent/50"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
            >
              {p.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">
              {p.name}
              {p.id === meId ? <span className="font-normal text-muted-foreground"> (আপনি)</span> : null}
            </span>
            {p.role === "teacher" ? <Crown className="h-4 w-4 shrink-0 text-primary" aria-label="শিক্ষক" /> : null}
            {p.handRaised ? <Hand className="h-4 w-4 shrink-0 text-amber-400" aria-label="হাত তুলেছেন" /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Poll ───────────────────────────────────────────────────────────── */

function PollPanel({
  poll,
  myVote,
  role,
  onVote,
  onEnd,
}: {
  poll: { question: string; options: string[]; counts: number[]; totalVotes: number } | null;
  myVote: number | null;
  role: Role;
  onVote: (index: number) => void;
  onEnd: () => void;
}) {
  if (!poll) {
    return (
      <div className="flex h-[380px] flex-col items-center justify-center gap-2 px-8 text-center sm:h-[440px] lg:h-[560px]">
        <Vote className="h-8 w-8 text-primary/50" aria-hidden />
        <p className="text-sm text-muted-foreground">
          কোনো পোল চালু নেই — শিক্ষক পোল চালু করলে এখানে ভোট দেওয়া যাবে।
        </p>
      </div>
    );
  }

  return (
    <div className="live-scroll h-[380px] overflow-y-auto px-4 py-4 sm:h-[440px] lg:h-[560px]">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">লাইভ পোল</p>
      <h3 className="mt-1.5 font-display text-base font-bold leading-snug">{poll.question}</h3>

      <div className="mt-4 space-y-2.5">
        {poll.options.map((opt, i) => {
          const pct = poll.totalVotes > 0 ? Math.round((poll.counts[i] / poll.totalVotes) * 100) : 0;
          const voted = myVote === i;
          return (
            <button
              key={i}
              type="button"
              disabled={myVote !== null || role === "teacher"}
              onClick={() => onVote(i)}
              aria-pressed={voted}
              className={`relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                voted
                  ? "border-primary/60"
                  : "border-primary/15 hover:border-primary/40 hover:bg-accent/50 disabled:hover:border-primary/15 disabled:hover:bg-transparent"
              }`}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-primary/10 transition-[width] duration-500"
                style={{ width: myVote !== null || role === "teacher" ? `${pct}%` : "0%" }}
              />
              <span className="relative flex items-center justify-between gap-2">
                <span className={voted ? "font-semibold text-primary" : ""}>
                  {opt}
                  {voted ? <span className="ml-1.5 text-[10px] font-bold uppercase text-primary">আপনার ভোট</span> : null}
                </span>
                {myVote !== null || role === "teacher" ? (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{pct}%</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {myVote === null
          ? role === "teacher"
            ? `শিক্ষক ভিউ — মোট ভোট: ${poll.totalVotes}`
            : "একটি অপশনে ক্লিক করে ভোট দিন"
          : `মোট ভোট: ${poll.totalVotes} — রেজাল্ট লাইভ আপডেট হচ্ছে`}
      </p>

      {role === "teacher" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onEnd}
          className="mt-3 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          পোল শেষ করুন
        </Button>
      ) : null}
    </div>
  );
}
