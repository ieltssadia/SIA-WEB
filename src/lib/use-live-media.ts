"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { EV, type LiveRole, type ParticipantDTO, type RtcSignalData } from "@/lib/live-protocol";

/**
 * Meet/Zoom-grade media engine for the live classroom:
 *   • local mic/camera (lazy acquisition, graceful fallback when a device or
 *     permission is missing — the classroom still fully works without media),
 *   • a full-mesh of RTCPeerConnections with Perfect Negotiation (glare-safe,
 *     deterministic by socket-id comparison), signaled over the shared
 *     live-class socket through the gateway,
 *   • screen sharing via getDisplayMedia + sender.replaceTrack (no
 *     renegotiation; camera track restored on stop),
 *   • client-side voice activity (AnalyserNode RMS + hangover) that drives
 *     speaking rings locally and broadcasts change-only via the socket.
 *
 * Toggles use track.enabled — mic/cam switches never renegotiate.
 */

const ICE_SERVERS: RTCIceServer[] = [
  {
    // Public STUN so peers behind different routers can still find each other;
    // inside the sandbox same-host candidates do the job.
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
  },
];

const RMS_ON = 0.045; // voice-activity threshold
const HANGOVER_MS = 1200; // keep "speaking" lit briefly after silence

type PeerEntry = {
  pc: RTCPeerConnection;
  polite: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  senders: { audio?: RTCRtpSender; video?: RTCRtpSender };
};

type UseLiveMediaOptions = {
  socketRef: React.RefObject<Socket | null>;
  meId: string | null;
  participants: ParticipantDTO[];
  joined: boolean;
  role: LiveRole;
  /** bumps when the host forces our mic off */
  forceMuteTick: number;
  /** broadcast voice-activity changes (socket layer) */
  onSpeakingChange: (speaking: boolean) => void;
};

export function useLiveMedia({
  socketRef,
  meId,
  participants,
  joined,
  role,
  forceMuteTick,
  onSpeakingChange,
}: UseLiveMediaOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  // Desired states — students join muted & camera-off, teacher auto-on.
  const [micOn, setMicOn] = useState(role === "teacher");
  const [camOn, setCamOn] = useState(role === "teacher");
  const [screenOn, setScreenOn] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [speakingSelf, setSpeakingSelf] = useState(false);

  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micOnRef = useRef(micOn);
  const camOnRef = useRef(camOn);
  const screenOnRef = useRef(screenOn);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingRef = useRef(false);
  const aliveRef = useRef(true);
  const onSpeakingRef = useRef(onSpeakingChange);
  // Sync the latest callback after commit — the level-meter timer reads it
  // at most 200ms later, so post-commit timing is always fresh enough.
  useEffect(() => {
    onSpeakingRef.current = onSpeakingChange;
  });

  // ── helpers ───────────────────────────────────────────────────────────

  const sendSignal = useCallback((to: string, data: RtcSignalData) => {
    socketRef.current?.emit(EV.rtcSignal, { to, data });
  }, [socketRef]);

  const emitMediaState = useCallback(() => {
    socketRef.current?.emit(EV.mediaUpdate, {
      audio: micOnRef.current,
      video: camOnRef.current,
      screen: screenOnRef.current,
    });
  }, [socketRef]);

  /** Attach (or replace) my local tracks on every existing peer connection. */
  const attachToAllPeers = useCallback(() => {
    const stream = localStreamRef.current;
    peersRef.current.forEach((entry) => {
      const audioTrack = stream?.getAudioTracks()[0] ?? null;
      const videoTrack = screenOnRef.current && screenStreamRef.current
        ? screenStreamRef.current.getVideoTracks()[0] ?? null
        : cameraTrackRef.current;
      if (audioTrack) {
        if (entry.senders.audio) entry.senders.audio.replaceTrack(audioTrack).catch(() => {});
        else {
          try {
            entry.senders.audio = entry.pc.addTrack(audioTrack, stream as MediaStream);
          } catch {
            /* peer closing */
          }
        }
      }
      if (videoTrack) {
        if (entry.senders.video) entry.senders.video.replaceTrack(videoTrack).catch(() => {});
        else {
          try {
            entry.senders.video = entry.pc.addTrack(videoTrack, stream as MediaStream);
          } catch {
            /* peer closing */
          }
        }
      }
    });
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (meterTimerRef.current) {
      clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        /* already gone */
      }
      analyserRef.current = null;
    }
  }, []);

  const startLevelMeter = useCallback((track: MediaStreamTrack) => {
    stopLevelMeter();
    try {
      const AudioCtx = window.AudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current ?? new AudioCtx();
      audioCtxRef.current = ctx;
      void ctx.resume().catch(() => {});
      const source = ctx.createMediaStreamSource(new MediaStream([track]));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Float32Array(analyser.fftSize);
      let lastLoudAt = 0;
      meterTimerRef.current = setInterval(() => {
        const a = analyserRef.current;
        if (!a) return;
        a.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const now = Date.now();
        if (rms > RMS_ON) lastLoudAt = now;
        const speaking = micOnRef.current && now - lastLoudAt < HANGOVER_MS;
        if (speaking !== speakingRef.current) {
          speakingRef.current = speaking;
          setSpeakingSelf(speaking);
          onSpeakingRef.current(speaking);
        }
      }, 200);
    } catch {
      /* audio analysis unavailable — speaking indicators stay off */
    }
  }, [stopLevelMeter]);

  /**
   * Acquire local devices (best effort): full video+audio → audio-only →
   * error. Never throws; returns null when nothing could be opened.
   */
  const ensureLocalMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;
    setMediaError(null);
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) {
      setMediaError("এই ব্রাউজারে ক্যামেরা/মাইক্রোফোন সাপোর্ট নেই।");
      return null;
    }
    let stream: MediaStream | null = null;
    try {
      stream = await md.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      try {
        stream = await md.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        setMediaError("ক্যামেরা পাওয়া যায়নি, শুধু মাইক্রোফোন চালু হয়েছে।");
      } catch {
        setMediaError("মাইক্রোফোন/ক্যামেরার অনুমতি পাওয়া যায়নি, চ্যাট আর স্লাইড দিয়ে ক্লাস চালিয়ে যান।");
        return null;
      }
    }
    if (!aliveRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return null;
    }
    localStreamRef.current = stream;
    cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
    // Apply the desired on/off states to the fresh tracks
    stream.getAudioTracks().forEach((t) => (t.enabled = micOnRef.current));
    stream.getVideoTracks().forEach((t) => (t.enabled = camOnRef.current));
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) startLevelMeter(audioTrack);
    setLocalStream(stream);
    attachToAllPeers();
    return stream;
  }, [attachToAllPeers, startLevelMeter]);

  // ── WebRTC mesh (Perfect Negotiation) ─────────────────────────────────

  const closePeer = useCallback((peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    peersRef.current.delete(peerId);
    try {
      entry.pc.ontrack = null;
      entry.pc.onicecandidate = null;
      entry.pc.onnegotiationneeded = null;
      entry.pc.close();
    } catch {
      /* already closed */
    }
    setRemoteStreams((prev) => {
      if (!prev.has(peerId)) return prev;
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  const createPeer = useCallback(
    (peerId: string): PeerEntry => {
      const existing = peersRef.current.get(peerId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, bundlePolicy: "max-bundle" });
      const entry: PeerEntry = {
        pc,
        // Deterministic on both sides — exactly one polite peer per pair.
        polite: meId ? meId > peerId : true,
        makingOffer: false,
        ignoreOffer: false,
        senders: {},
      };
      peersRef.current.set(peerId, entry);

      pc.onicecandidate = ({ candidate }) => {
        if (candidate && peerId) {
          sendSignal(peerId, {
            type: "candidate",
            candidate: {
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex,
            },
          });
        }
      };

      pc.ontrack = (ev) => {
        const stream = ev.streams[0];
        if (!stream) return;
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          if (next.get(peerId) !== stream) next.set(peerId, stream);
          return next;
        });
      };

      pc.onnegotiationneeded = () => {
        entry.makingOffer = true;
        pc.setLocalDescription()
          .then(() => {
            const desc = pc.localDescription;
            if (desc) {
              sendSignal(peerId, { type: desc.type as "offer" | "answer", sdp: desc.sdp });
            }
          })
          .catch(() => {})
          .finally(() => {
            entry.makingOffer = false;
          });
      };

      attachToAllPeers();
      return entry;
    },
    [attachToAllPeers, meId, sendSignal]
  );

  const handleSignal = useCallback(
    async (from: string, data: RtcSignalData) => {
      const entry = peersRef.current.get(from) ?? createPeer(from);
      const { pc } = entry;

      if (data.type === "candidate") {
        try {
          await pc.addIceCandidate({
            candidate: data.candidate.candidate,
            sdpMid: data.candidate.sdpMid,
            sdpMLineIndex: data.candidate.sdpMLineIndex,
          });
        } catch {
          /* stale candidate for a rolled-back offer — safe to drop */
        }
        return;
      }

      const readyForOffer = !entry.makingOffer && (pc.signalingState === "stable" || pc.signalingState === "have-local-offer");
      const offerCollision = data.type === "offer" && !readyForOffer;
      entry.ignoreOffer = !entry.polite && offerCollision;
      if (entry.ignoreOffer) return;

      try {
        if (offerCollision && entry.polite) {
          await pc.setLocalDescription({ type: "rollback" } as RTCLocalSessionDescriptionInit);
        }
        await pc.setRemoteDescription({ type: data.type, sdp: data.sdp });
        if (data.type === "offer") {
          await pc.setLocalDescription();
          const desc = pc.localDescription;
          if (desc) sendSignal(from, { type: desc.type as "answer", sdp: desc.sdp });
        }
      } catch {
        /* malformed or stale description — the next negotiation round fixes it */
      }
    },
    [createPeer, sendSignal]
  );

  // ── socket wiring ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!joined || !meId) return;
    const socket = socketRef.current;
    if (!socket) return;

    const onSignal = (payload: { from?: string; data?: RtcSignalData }) => {
      if (typeof payload?.from === "string" && payload.data) {
        void handleSignal(payload.from, payload.data);
      }
    };
    const onPeerLeft = (payload: { id?: string }) => {
      if (typeof payload?.id === "string") closePeer(payload.id);
    };
    socket.on(EV.rtcSignal, onSignal);
    socket.on(EV.rtcPeerLeft, onPeerLeft);

    return () => {
      socket.off(EV.rtcSignal, onSignal);
      socket.off(EV.rtcPeerLeft, onPeerLeft);
    };
  }, [joined, meId, socketRef, handleSignal, closePeer]);

  // Keep the peer set in sync with the participants list (creates missing
  // peers, closes stale ones — covers races and reconnects).
  useEffect(() => {
    if (!joined || !meId) return;
    const ids = participants.map((p) => p.id).filter((id) => id && id !== meId);
    ids.forEach((id) => createPeer(id));
    peersRef.current.forEach((_, id) => {
      if (!ids.includes(id)) closePeer(id);
    });
  }, [joined, meId, participants, createPeer, closePeer]);

  // ── toggles ───────────────────────────────────────────────────────────

  const toggleMic = useCallback(async () => {
    const next = !micOnRef.current;
    if (next) {
      const stream = await ensureLocalMedia();
      const track = stream?.getAudioTracks()[0];
      if (!track) {
        setMicOn(false);
        micOnRef.current = false;
        emitMediaState();
        return;
      }
      track.enabled = true;
    } else {
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false));
    }
    setMicOn(next);
    micOnRef.current = next;
    emitMediaState();
  }, [ensureLocalMedia, emitMediaState]);

  const toggleCam = useCallback(async () => {
    const next = !camOnRef.current;
    if (next) {
      const stream = await ensureLocalMedia();
      const track = stream?.getVideoTracks()[0];
      if (!track) {
        // We may hold an audio-only stream — try to upgrade with video.
        try {
          const extra = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          const audio = localStreamRef.current?.getAudioTracks() ?? [];
          const merged = new MediaStream([...audio, ...extra.getVideoTracks()]);
          extra.getVideoTracks().forEach((t) => (t.enabled = true));
          extra.getAudioTracks().forEach((t) => t.stop()); // duplicated if any
          localStreamRef.current = merged;
          cameraTrackRef.current = extra.getVideoTracks()[0] ?? null;
          setLocalStream(merged);
          attachToAllPeers();
        } catch {
          setMediaError("ক্যামেরা চালু করা যায়নি, ব্রাউজারে অনুমতি দিন।");
          return;
        }
      }
      // Fresh tracks are acquired muted — enable the camera track now. The
      // track list of localStreamRef covers both the normal and the upgraded
      // (audio-only → video) paths, since the merged stream is stored there.
      localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true));
    }
    if (!next) {
      if (cameraTrackRef.current) cameraTrackRef.current.enabled = false;
      localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = false));
    }
    setCamOn(next);
    camOnRef.current = next;
    emitMediaState();
  }, [ensureLocalMedia, emitMediaState, attachToAllPeers]);

  const stopScreenShare = useCallback(() => {
    const screenTrack = screenStreamRef.current?.getVideoTracks()[0] ?? null;
    screenTrack?.stop();
    screenStreamRef.current = null;
    setScreenOn(false);
    screenOnRef.current = false;
    // Restore the camera track (or drop video entirely) on every peer.
    peersRef.current.forEach((entry) => {
      const camTrack = camOnRef.current ? cameraTrackRef.current : null;
      if (entry.senders.video) entry.senders.video.replaceTrack(camTrack).catch(() => {});
    });
    attachToAllPeers();
    emitMediaState();
  }, [attachToAllPeers, emitMediaState]);

  const toggleScreen = useCallback(async () => {
    if (screenOnRef.current) {
      stopScreenShare();
      return;
    }
    const md = navigator.mediaDevices;
    if (!md?.getDisplayMedia) {
      setMediaError("এই ডিভাইসে স্ক্রিন শেয়ার সাপোর্ট নেই।");
      return;
    }
    try {
      const screen = await md.getDisplayMedia({ video: { frameRate: { ideal: 15 } }, audio: false });
      screenStreamRef.current = screen;
      const track = screen.getVideoTracks()[0] ?? null;
      setScreenOn(true);
      screenOnRef.current = true;
      track?.addEventListener("ended", () => stopScreenShare());
      // Swap the video sender track on every peer — no renegotiation needed.
      peersRef.current.forEach((entry) => {
        if (entry.senders.video && track) entry.senders.video.replaceTrack(track).catch(() => {});
      });
      attachToAllPeers();
      emitMediaState();
    } catch {
      setScreenOn(false);
      screenOnRef.current = false;
    }
  }, [attachToAllPeers, emitMediaState, stopScreenShare]);

  // Host forced our mic off — the state mirror is adjusted during render
  // (guarded on the last applied tick), while the imperative mirrors
  // (track disable, ref, socket) happen in the effect below.
  const [appliedForceMuteTick, setAppliedForceMuteTick] = useState(forceMuteTick);
  if (forceMuteTick !== appliedForceMuteTick) {
    setAppliedForceMuteTick(forceMuteTick);
    if (forceMuteTick > 0) setMicOn(false);
  }
  useEffect(() => {
    if (forceMuteTick === 0) return;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false));
    micOnRef.current = false;
    emitMediaState();
  }, [forceMuteTick, emitMediaState]);

  // ── init + teardown ───────────────────────────────────────────────────

  useEffect(() => {
    aliveRef.current = true;
    let cancelled = false;
    if (joined && role === "teacher") {
      // Acquisition starts in a microtask so its state reset never runs
      // synchronously inside the effect body (react-compiler compliant).
      void Promise.resolve()
        .then(() => (cancelled ? null : ensureLocalMedia()))
        .then(() => {
          if (!cancelled) emitMediaState();
        });
    }
    return () => {
      cancelled = true;
      aliveRef.current = false;
      peersRef.current.forEach((entry) => {
        try {
          entry.pc.close();
        } catch {
          /* already closed */
        }
      });
      peersRef.current = new Map();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      cameraTrackRef.current = null;
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      stopLevelMeter();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setRemoteStreams(new Map());
      setLocalStream(null);
    };
  }, [joined, role, ensureLocalMedia, emitMediaState, stopLevelMeter]);

  const clearMediaError = useCallback(() => setMediaError(null), []);

  return {
    localStream,
    remoteStreams,
    micOn,
    camOn,
    screenOn,
    speakingSelf,
    mediaError,
    toggleMic,
    toggleCam,
    toggleScreen,
    stopScreenShare,
    clearMediaError,
  };
}

export type LiveMediaState = ReturnType<typeof useLiveMedia>;
