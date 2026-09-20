/**
 * Shared live-class contract (v2) — the single source of truth between
 *
 *   • the classroom client  (src/lib/use-live-room.ts, src/lib/use-live-media.ts,
 *     src/components/site/live-classroom.tsx) and
 *   • the real-time backend (mini-services/live-class-service, port 3003,
 *     reached through the gateway as io("/?XTransformPort=3003", { path: "/" })).
 *
 * v2 upgrades the room to Google Meet / Zoom grade:
 *   • real WebRTC audio/video mesh — EVERY participant can share camera + mic
 *     (signaling is relayed by the socket server; media flows peer-to-peer),
 *   • screen sharing via getDisplayMedia + replaceTrack (no renegotiation),
 *   • per-participant media state (audio / video / screen) + voice-activity
 *     "speaking" indicators,
 *   • host moderation: mute one / mute all / remove participant,
 *   • class elapsed timer anchored to a server-side startedAt,
 *   • connection-quality probe (RTT).
 *
 * The legacy low-bandwidth teacher JPEG camera (cam:on/off/frame) is retired.
 *
 * This file must stay DOM-free (no RTC* types) so the bun mini-service can
 * import it too. Both sides MUST use the EV constants — never raw strings.
 */

export type LiveRole = "teacher" | "student";

/** One participant as seen by everyone in the room. */
export interface ParticipantDTO {
  id: string; // socket id
  name: string;
  role: LiveRole;
  handRaised: boolean;
  /** microphone enabled (track enabled, not necessarily unmuted by host) */
  audio: boolean;
  /** camera enabled */
  video: boolean;
  /** currently sharing the screen (stage priority) */
  screen: boolean;
  /** voice activity right now (best-effort, client-measured) */
  speaking: boolean;
  joinedAt: number;
}

export interface ChatMsg {
  id: string;
  name: string;
  role: LiveRole | "system";
  text: string;
  at: number;
  /** sender socket id — lets the UI mark your own messages */
  from?: string;
}

export interface PollDTO {
  question: string;
  options: string[];
  counts: number[];
  totalVotes: number;
}

/** Full room state returned by the join ack (and the shape kept in sync). */
export interface RoomSnapshot {
  classId: string;
  live: boolean;
  /** epoch ms when the host pressed "go live"; null while not live */
  startedAt: number | null;
  slideIndex: number;
  participants: ParticipantDTO[];
  chat: ChatMsg[];
  poll: PollDTO | null;
}

/** Payload of rtc:signal `data` — offer/answer SDP or a trickle ICE candidate. */
export type RtcSignalData =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | {
      type: "candidate";
      candidate: {
        candidate: string;
        sdpMid: string | null;
        sdpMLineIndex: number | null;
      };
    };

/** Every socket event name used by the live classroom. */
export const EV = {
  // ── room lifecycle ────────────────────────────────────────────────────
  join: "class:join", // C→S {classId, name, role, hostKey?, initialLive?} ack {ok, me:{id,name,role}, state:RoomSnapshot}
  denied: "class:denied", // S→C {reason}
  status: "class:status", // S→C {live, startedAt} — host went live / ended
  goLive: "class:go-live", // C→S (teacher)
  end: "class:end", // C→S (teacher)

  // ── shared interaction ────────────────────────────────────────────────
  chatSend: "chat:send", // C→S {text}
  chatNew: "chat:new", // S→C ChatMsg
  handRaise: "hand:raise", // C→S {raised}
  reactionSend: "reaction:send", // C→S {emoji}
  reactionNew: "reaction:new", // S→C {emoji, by}

  // ── polls ─────────────────────────────────────────────────────────────
  pollStart: "poll:start", // C→S (teacher) {question, options[]}
  pollNew: "poll:new", // S→C {question, options, counts, totalVotes}
  pollVote: "poll:vote", // C→S {optionIndex} (one vote per socket)
  pollUpdate: "poll:update", // S→C {counts, totalVotes}
  pollEnd: "poll:end", // C→S (teacher)
  pollClosed: "poll:closed", // S→C

  // ── lesson slides (teacher-synced) ────────────────────────────────────
  slideGoto: "slide:goto", // C→S (teacher) {index}
  slideChanged: "slide:changed", // S→C {index}

  // ── presence / media state ────────────────────────────────────────────
  participantsUpdate: "participants:update", // S→C {participants: ParticipantDTO[]}
  mediaUpdate: "media:update", // C→S {audio, video, screen}
  participantMedia: "participant:media", // S→C {id, audio, video, screen}
  speakerUpdate: "speaker:update", // C→S {speaking} (client-throttled voice activity)
  participantSpeaker: "participant:speaker", // S→C {id, speaking}

  // ── WebRTC mesh signaling (server relays, never inspects) ─────────────
  rtcSignal: "rtc:signal", // C→S {to, data:RtcSignalData} → S→`to` {from, data}
  rtcPeerJoined: "rtc:peer-joined", // S→others {peer:{id}} — a new peer appeared
  rtcPeerLeft: "rtc:peer-left", // S→others {id} — close that peer connection

  // ── host moderation (teacher-only events, server enforced) ────────────
  modMuteOne: "mod:mute-one", // C→S (teacher) {target}
  modMuteAll: "mod:mute-all", // C→S (teacher)
  modRemove: "mod:remove", // C→S (teacher) {target} → target receives mod:removed
  modForceMute: "mod:force-mute", // S→target — turn your mic off now
  modRemoved: "mod:removed", // S→target — you were removed from the class

  // ── connection quality ────────────────────────────────────────────────
  netPing: "net:ping", // C→S ack {t} — client measures RTT
} as const;

/** Join ack response shape (server → client, on EV.join). */
export type JoinAck = {
  ok?: boolean;
  me?: { id?: string; name?: string; role?: string };
  state?: RoomSnapshot;
};

/** WebRTC topology notes (both sides implement this): */
export const RTC_NOTES = `
• On join ack, the newcomer creates an RTCPeerConnection for every other
  participant and lets onnegotiationneeded drive the first offer.
• Existing peers learn about the newcomer via rtc:peer-joined and create a
  (still passive) PC; both sides attach local tracks, so whoever's
  negotiationneeded fires first offers and Perfect Negotiation resolves any
  glare (polite = mySocketId > peerSocketId, deterministic on both sides).
• Tracks are added once and toggled with track.enabled (mic/cam) — no
  renegotiation. Screen share uses sender.replaceTrack per peer.
• rtc:peer-left (and stale-participant diffing) tears the PC down.
`;
