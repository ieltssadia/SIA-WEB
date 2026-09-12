"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

/**
 * Real-time classroom client for #/live/<slug>.
 * Connects to the live-class mini service through the gateway
 * (io("/?XTransformPort=3003") — never a direct port URL).
 */

export type Role = "teacher" | "student";

export interface ChatMsg {
  id: string;
  name: string;
  role: Role | "system";
  text: string;
  at: number;
  /** sender socket id — lets the UI mark your own messages */
  from?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: Role;
  handRaised: boolean;
}

export interface PollState {
  question: string;
  options: string[];
  counts: number[];
  totalVotes: number;
}

export type JoinStatus = "idle" | "connecting" | "joined" | "denied" | "error";

type UseLiveRoomOptions = {
  classId: string; // LiveClass.slug
  name: string;
  role: Role;
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
  const [slideIndex, setSlideIndex] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [poll, setPoll] = useState<PollState | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [initialFrame, setInitialFrame] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !classId) return;

    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        "class:join",
        { classId, name, role, hostKey: hostKey ?? undefined, initialLive },
        (res: { ok?: boolean; me?: { id?: string }; state?: RoomSnapshotLike } & Record<string, unknown>) => {
          if (!res?.ok || !res.state) return;
          setMeId(typeof res.me?.id === "string" ? res.me.id : null);
          const s = res.state;
          setLive(!!s.live);
          setSlideIndex(Number(s.slideIndex) || 0);
          setParticipants(Array.isArray(s.participants) ? s.participants : []);
          setChat(Array.isArray(s.chat) ? s.chat : []);
          setPoll(s.poll ?? null);
          setCamOn(!!s.camOn);
          setInitialFrame(typeof s.lastCamFrame === "string" ? s.lastCamFrame : null);
          setJoinState("joined");
        }
      );
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("reconnect", () => setConnected(true));
    socket.io.on("reconnect_failed", () => setJoinState("error"));

    socket.on("class:denied", (data: { reason?: string }) => {
      setDeniedReason(data?.reason ?? "যুক্ত হওয়া যাচ্ছে না।");
      setJoinState("denied");
    });

    socket.on("chat:new", (msg: ChatMsg) => {
      setChat((prev) => [...prev.slice(-299), msg]);
    });

    socket.on("participants:update", (data: { participants?: Participant[] }) => {
      setParticipants(Array.isArray(data?.participants) ? data.participants : []);
    });

    socket.on("slide:changed", (data: { index?: number }) => {
      setSlideIndex(Number(data?.index) || 0);
    });

    socket.on("class:status", (data: { live?: boolean }) => {
      setLive(!!data?.live);
    });

    socket.on("poll:new", (data: { question: string; options: string[]; counts: number[]; totalVotes: number }) => {
      setPoll({
        question: data.question,
        options: data.options,
        counts: data.counts,
        totalVotes: data.totalVotes,
      });
    });

    socket.on("poll:update", (data: { counts: number[]; totalVotes: number }) => {
      setPoll((prev) => (prev ? { ...prev, counts: data.counts, totalVotes: data.totalVotes } : prev));
    });

    socket.on("poll:closed", () => setPoll(null));

    socket.on("cam:status", (data: { on?: boolean }) => {
      setCamOn(!!data?.on);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // The room is joined once per (classId, identity) — name/hostKey changes
    // remount the classroom page, so depending on them here is safe.
  }, [enabled, classId, role]);

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit("chat:send", { text });
  }, []);

  const setHand = useCallback((raised: boolean) => {
    socketRef.current?.emit("hand:raise", { raised });
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    socketRef.current?.emit("reaction:send", { emoji });
  }, []);

  const vote = useCallback((optionIndex: number) => {
    socketRef.current?.emit("poll:vote", { optionIndex });
  }, []);

  const goLive = useCallback(() => {
    socketRef.current?.emit("class:go-live");
    fetch(`/api/live-classes/${classId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hostKey: hostKey ?? "", status: "live" }),
    }).catch(() => {});
  }, [classId, hostKey]);

  const endClass = useCallback(() => {
    socketRef.current?.emit("class:end");
    fetch(`/api/live-classes/${classId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hostKey: hostKey ?? "", status: "ended" }),
    }).catch(() => {});
  }, [classId, hostKey]);

  const gotoSlide = useCallback((index: number) => {
    socketRef.current?.emit("slide:goto", { index });
  }, []);

  const startPoll = useCallback((question: string, options: string[]) => {
    socketRef.current?.emit("poll:start", { question, options });
  }, []);

  const endPoll = useCallback(() => {
    socketRef.current?.emit("poll:end");
  }, []);

  const startCam = useCallback(() => {
    socketRef.current?.emit("cam:on");
  }, []);

  const stopCam = useCallback(() => {
    socketRef.current?.emit("cam:off");
  }, []);

  const sendCamFrame = useCallback((dataUrl: string) => {
    socketRef.current?.emit("cam:frame", { data: dataUrl });
  }, []);

  return {
    status,
    deniedReason,
    connected,
    meId,
    live,
    slideIndex,
    participants,
    chat,
    poll,
    camOn,
    initialFrame,
    socket: socketRef,
    sendChat,
    setHand,
    sendReaction,
    vote,
    goLive,
    endClass,
    gotoSlide,
    startPoll,
    endPoll,
    startCam,
    stopCam,
    sendCamFrame,
  };
}

type RoomSnapshotLike = {
  live?: boolean;
  slideIndex?: number;
  participants?: Participant[];
  chat?: ChatMsg[];
  poll?: PollState | null;
  camOn?: boolean;
  lastCamFrame?: string | null;
};
