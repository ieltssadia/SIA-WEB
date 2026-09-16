"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  EV,
  type ChatMsg,
  type JoinAck,
  type LiveRole,
  type ParticipantDTO,
  type PollDTO,
  type RoomSnapshot,
} from "@/lib/live-protocol";

/**
 * Real-time classroom client (socket layer) for #/live/<slug>.
 * Connects to the live-class mini service through the gateway
 * (io("/?XTransformPort=3003") — never a direct port URL).
 *
 * v2: Meet/Zoom-grade rooms. Media (WebRTC mesh, screen share, voice
 * activity) lives in use-live-media.ts, which shares this socket and the
 * participants list. Host moderation + RTT probe added here.
 */

export type JoinStatus = "idle" | "connecting" | "joined" | "denied" | "error";

type UseLiveRoomOptions = {
  classId: string; // LiveClass.slug
  name: string;
  role: LiveRole;
  hostKey?: string;
  initialLive: boolean; // DB status was "live" when the page loaded
  enabled: boolean;
};

export function useLiveRoom({ classId, name, role, hostKey, initialLive, enabled }: UseLiveRoomOptions) {
  const socketRef = useRef<Socket | null>(null);

  // Raw join state — "connecting" is derived (never set inside an effect)
  const [joinState, setJoinState] = useState<"idle" | "joined" | "denied" | "error">("idle");
  const status: JoinStatus = joinState === "idle" ? (enabled ? "connecting" : "idle") : joinState;
  const [deniedReason, setDeniedReason] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  /** true once this session has seen the class live — powers the "ended" overlay */
  const [wasLive, setWasLive] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [participants, setParticipants] = useState<ParticipantDTO[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [poll, setPoll] = useState<PollDTO | null>(null);
  /** measured socket RTT in ms (null until the first probe lands) */
  const [rtt, setRtt] = useState<number | null>(null);
  /** bumps every time the host forces our mic off — use-live-media listens */
  const [forceMuteTick, setForceMuteTick] = useState(0);
  /** host removed us from the class */
  const [removed, setRemoved] = useState(false);
  /** latest incoming reaction — the floating overlay listens to this */
  const [lastReaction, setLastReaction] = useState<{ id: string; emoji: string; by: string } | null>(null);

  useEffect(() => {
    if (!enabled || !classId) return;

    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        EV.join,
        { classId, name, role, hostKey: hostKey ?? undefined, initialLive },
        (res: JoinAck) => {
          if (!res?.ok || !res.state) return;
          setMeId(typeof res.me?.id === "string" ? res.me.id : null);
          const s = res.state as RoomSnapshot;
          setLive(!!s.live);
          setWasLive(!!s.live);
          setStartedAt(typeof s.startedAt === "number" ? s.startedAt : null);
          setSlideIndex(Number(s.slideIndex) || 0);
          setParticipants(Array.isArray(s.participants) ? s.participants : []);
          setChat(Array.isArray(s.chat) ? s.chat.slice(-300) : []);
          setPoll(s.poll ?? null);
          setRemoved(false);
          setJoinState("joined");
        }
      );
    });

    socket.on("disconnect", () => setConnected(false));
    socket.io.on("reconnect_failed", () => setJoinState("error"));

    socket.on(EV.denied, (data: { reason?: string }) => {
      setDeniedReason(data?.reason ?? "যুক্ত হওয়া যাচ্ছে না।");
      setJoinState("denied");
    });

    socket.on(EV.chatNew, (msg: ChatMsg) => {
      setChat((prev) => [...prev.slice(-299), msg]);
    });

    socket.on(EV.participantsUpdate, (data: { participants?: ParticipantDTO[] }) => {
      if (Array.isArray(data?.participants)) setParticipants(data.participants);
    });

    socket.on(EV.participantMedia, (data: { id?: string; audio?: boolean; video?: boolean; screen?: boolean }) => {
      const { id, audio, video, screen } = data ?? {};
      if (!id) return;
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, audio: audio ?? p.audio, video: video ?? p.video, screen: screen ?? p.screen }
            : p
        )
      );
    });

    socket.on(EV.participantSpeaker, (data: { id?: string; speaking?: boolean }) => {
      const { id, speaking } = data ?? {};
      if (!id) return;
      setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, speaking: !!speaking } : p)));
    });

    socket.on(EV.slideChanged, (data: { index?: number }) => {
      setSlideIndex(Number(data?.index) || 0);
    });

    socket.on(EV.status, (data: { live?: boolean; startedAt?: number | null }) => {
      const nextLive = !!data?.live;
      setLive(nextLive);
      setWasLive((w) => w || nextLive);
      setStartedAt(typeof data?.startedAt === "number" ? data.startedAt : null);
    });

    socket.on(EV.pollNew, (data: { question: string; options: string[]; counts: number[]; totalVotes: number }) => {
      setPoll({
        question: data.question,
        options: data.options,
        counts: data.counts,
        totalVotes: data.totalVotes,
      });
    });

    socket.on(EV.pollUpdate, (data: { counts: number[]; totalVotes: number }) => {
      setPoll((prev) => (prev ? { ...prev, counts: data.counts, totalVotes: data.totalVotes } : prev));
    });

    socket.on(EV.pollClosed, () => setPoll(null));

    socket.on(EV.reactionNew, (data: { emoji?: string; by?: string }) => {
      if (!data?.emoji) return;
      setLastReaction({ id: Math.random().toString(36).slice(2), emoji: data.emoji, by: data.by ?? "" });
    });

    socket.on(EV.modForceMute, () => setForceMuteTick((t) => t + 1));
    socket.on(EV.modRemoved, () => setRemoved(true));

    // Connection-quality probe — server just acks with a timestamp
    const ping = setInterval(() => {
      const t0 = Date.now();
      socket.timeout(4000).emit(EV.netPing, (err: unknown) => {
        if (!err) setRtt(Date.now() - t0);
      });
    }, 8000);

    return () => {
      clearInterval(ping);
      socket.disconnect();
      socketRef.current = null;
    };
    // The room is joined once per (classId, identity) — name/hostKey changes
    // remount the classroom page, so depending on them here is safe.
  }, [enabled, classId, role]);

  // ── actions ───────────────────────────────────────────────────────────

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit(EV.chatSend, { text });
  }, []);

  const setHand = useCallback((raised: boolean) => {
    socketRef.current?.emit(EV.handRaise, { raised });
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    socketRef.current?.emit(EV.reactionSend, { emoji });
  }, []);

  const vote = useCallback((optionIndex: number) => {
    socketRef.current?.emit(EV.pollVote, { optionIndex });
  }, []);

  const gotoSlide = useCallback((index: number) => {
    socketRef.current?.emit(EV.slideGoto, { index });
  }, []);

  const startPoll = useCallback((question: string, options: string[]) => {
    socketRef.current?.emit(EV.pollStart, { question, options });
  }, []);

  const endPoll = useCallback(() => {
    socketRef.current?.emit(EV.pollEnd);
  }, []);

  const goLive = useCallback(() => {
    socketRef.current?.emit(EV.goLive);
    fetch(`/api/live-classes/${classId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hostKey: hostKey ?? "", status: "live" }),
    }).catch(() => {});
  }, [classId, hostKey]);

  const endClass = useCallback(() => {
    socketRef.current?.emit(EV.end);
    fetch(`/api/live-classes/${classId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hostKey: hostKey ?? "", status: "ended" }),
    }).catch(() => {});
  }, [classId, hostKey]);

  /** Broadcast my mic/cam/screen flags (called by use-live-media). */
  const updateMedia = useCallback((state: { audio: boolean; video: boolean; screen: boolean }) => {
    socketRef.current?.emit(EV.mediaUpdate, state);
  }, []);

  /** Broadcast my voice-activity flag (client-measured, change-only). */
  const setSpeaking = useCallback((speaking: boolean) => {
    socketRef.current?.emit(EV.speakerUpdate, { speaking });
  }, []);

  // ── host moderation ───────────────────────────────────────────────────

  const muteOne = useCallback((target: string) => {
    socketRef.current?.emit(EV.modMuteOne, { target });
  }, []);

  const muteAll = useCallback(() => {
    socketRef.current?.emit(EV.modMuteAll);
  }, []);

  const removeOne = useCallback((target: string) => {
    socketRef.current?.emit(EV.modRemove, { target });
  }, []);

  return {
    status,
    deniedReason,
    connected,
    meId,
    live,
    wasLive,
    startedAt,
    slideIndex,
    participants,
    chat,
    poll,
    rtt,
    forceMuteTick,
    removed,
    lastReaction,
    socket: socketRef,
    sendChat,
    setHand,
    sendReaction,
    vote,
    gotoSlide,
    startPoll,
    endPoll,
    goLive,
    endClass,
    updateMedia,
    setSpeaking,
    muteOne,
    muteAll,
    removeOne,
  };
}

export type LiveRoomState = ReturnType<typeof useLiveRoom>;
