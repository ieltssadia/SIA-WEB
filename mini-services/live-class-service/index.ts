/**
 * Sadia's IELTS — Live Class Service (socket.io)
 * -----------------------------------------------
 * Real-time classroom backend for #/live/<slug>:
 *   • live chat (teacher + students + system messages)
 *   • teacher-synced lesson slides
 *   • raise hand + emoji reactions
 *   • live polls with one-vote-per-participant
 *   • low-bandwidth teacher camera stream (JPEG frames over websocket,
 *     ~5 fps — no WebRTC/TURN needed inside the sandbox)
 *
 * The frontend always connects with io("/?XTransformPort=3003") so the
 * gateway can forward to this port. DO NOT change the socket.io path "/".
 */
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3003;
/** Shared with src/app/api/live-classes/[slug]/status/route.ts */
export const HOST_KEY = "SADIA-LIVE-2024";

const MAX_CHAT = 200;
const MAX_FRAME_BYTES = 300_000; // ~300 KB per JPEG frame guard
const REACTIONS = new Set(["👍", "❤️", "🎉", "😮", "😂", "🔥"]);

type Role = "teacher" | "student";

interface Participant {
  id: string;
  name: string;
  role: Role;
  handRaised: boolean;
  joinedAt: number;
}

interface ChatMsg {
  id: string;
  name: string;
  role: Role | "system";
  text: string;
  at: number;
  /** sender socket id — lets clients highlight their own messages */
  from?: string;
}

interface Poll {
  question: string;
  options: string[];
  counts: number[];
  voters: Record<string, number>;
}

interface Room {
  classId: string;
  live: boolean;
  slideIndex: number;
  participants: Map<string, Participant>;
  chat: ChatMsg[];
  poll: Poll | null;
  camOn: boolean;
  lastCamFrame: string | null;
}

const rooms = new Map<string, Room>();

function getRoom(classId: string, initialLive = false): Room {
  let room = rooms.get(classId);
  if (!room) {
    room = {
      classId,
      live: initialLive,
      slideIndex: 0,
      participants: new Map(),
      chat: [],
      poll: null,
      camOn: false,
      lastCamFrame: null,
    };
    rooms.set(classId, room);
  }
  return room;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function pushSystem(room: Room, text: string): ChatMsg {
  const msg: ChatMsg = { id: uid(), name: "System", role: "system", text, at: Date.now() };
  room.chat.push(msg);
  if (room.chat.length > MAX_CHAT) room.chat.splice(0, room.chat.length - MAX_CHAT);
  return msg;
}

function publicState(room: Room) {
  return {
    classId: room.classId,
    live: room.live,
    slideIndex: room.slideIndex,
    participants: [...room.participants.values()].map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      handRaised: p.handRaised,
    })),
    chat: room.chat.slice(-MAX_CHAT),
    poll: room.poll
      ? { question: room.poll.question, options: room.poll.options, counts: room.poll.counts, totalVotes: room.poll.counts.reduce((a, b) => a + b, 0) }
      : null,
    camOn: room.camOn,
    lastCamFrame: room.lastCamFrame,
  };
}

const httpServer = createServer((req, res) => {
  // Plain health endpoint — also lets .zscripts/dev.sh wait_for_service pass.
  if (req.url?.startsWith("/health")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "live-class-service",
        rooms: [...rooms.entries()].map(([id, r]) => ({
          id,
          live: r.live,
          participants: r.participants.size,
        })),
      })
    );
    return;
  }
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "live-class-service" }));
});

const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket) => {
  let joined: { classId: string; name: string; role: Role } | null = null;

  const roomOf = (): Room | null => (joined ? rooms.get(joined.classId) ?? null : null);

  const requireTeacher = (): Room | null => {
    const room = roomOf();
    if (!room || !joined || joined.role !== "teacher") return null;
    return room;
  };

  const broadcastParticipants = (room: Room) => {
    io.to(room.classId).emit("participants:update", {
      participants: [...room.participants.values()].map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        handRaised: p.handRaised,
      })),
    });
  };

  socket.on("class:join", (data: unknown, ack?: (res: unknown) => void) => {
    const payload = (data ?? {}) as {
      classId?: string;
      name?: string;
      role?: string;
      hostKey?: string;
      initialLive?: boolean;
    };

    const classId = String(payload.classId ?? "").trim().slice(0, 80);
    if (!classId) {
      socket.emit("class:denied", { reason: "ক্লাস আইডি নেই — আবার চেষ্টা করুন।" });
      ack?.({ ok: false });
      return;
    }

    const wantsTeacher = payload.role === "teacher";
    if (wantsTeacher && payload.hostKey !== HOST_KEY) {
      socket.emit("class:denied", { reason: "ভুল host key — শিক্ষক হিসেবে যুক্ত হওয়া যাচ্ছে না।" });
      ack?.({ ok: false });
      return;
    }

    const name = String(payload.name ?? "").trim().slice(0, 40) || "Student";
    const role: Role = wantsTeacher ? "teacher" : "student";
    const room = getRoom(classId, role === "student" ? !!payload.initialLive : false);

    const participant: Participant = { id: socket.id, name, role, handRaised: false, joinedAt: Date.now() };
    room.participants.set(socket.id, participant);
    joined = { classId, name, role };
    socket.join(classId);

    const msg = pushSystem(room, role === "teacher" ? `${name} (শিক্ষক) ক্লাসে যুক্ত হয়েছেন` : `${name} ক্লাসে যুক্ত হয়েছেন`);
    io.to(classId).emit("chat:new", msg);
    broadcastParticipants(room);

    ack?.({ ok: true, me: { id: socket.id, name, role }, state: publicState(room) });
  });

  // ---------- shared (teacher + students) ----------

  socket.on("chat:send", (data: unknown) => {
    if (!joined) return;
    const room = roomOf();
    const text = String((data as { text?: string })?.text ?? "").trim().slice(0, 500);
    if (!room || !text) return;
    const msg: ChatMsg = { id: uid(), name: joined.name, role: joined.role, text, at: Date.now(), from: socket.id };
    room.chat.push(msg);
    if (room.chat.length > MAX_CHAT) room.chat.splice(0, room.chat.length - MAX_CHAT);
    io.to(room.classId).emit("chat:new", msg);
  });

  socket.on("hand:raise", (data: unknown) => {
    if (!joined) return;
    const room = roomOf();
    const me = room?.participants.get(socket.id);
    if (!room || !me || me.role === "teacher") return;
    me.handRaised = !!(data as { raised?: boolean })?.raised;
    broadcastParticipants(room);
  });

  socket.on("reaction:send", (data: unknown) => {
    if (!joined) return;
    const room = roomOf();
    const emoji = String((data as { emoji?: string })?.emoji ?? "");
    if (!room || !REACTIONS.has(emoji)) return;
    io.to(room.classId).emit("reaction:new", { emoji, by: joined.name });
  });

  socket.on("poll:vote", (data: unknown) => {
    if (!joined) return;
    const room = roomOf();
    const poll = room?.poll;
    const optionIndex = Number((data as { optionIndex?: number })?.optionIndex);
    if (!room || !poll || room.poll === null) return;
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) return;
    if (poll.voters[socket.id] !== undefined) return; // one vote per participant
    poll.voters[socket.id] = optionIndex;
    poll.counts[optionIndex] += 1;
    io.to(room.classId).emit("poll:update", {
      counts: poll.counts,
      totalVotes: poll.counts.reduce((a, b) => a + b, 0),
    });
  });

  // ---------- teacher only ----------

  socket.on("class:go-live", () => {
    const room = requireTeacher();
    if (!room) return;
    room.live = true;
    const msg = pushSystem(room, "🔴 ক্লাস লাইভ শুরু হয়েছে!");
    io.to(room.classId).emit("chat:new", msg);
    io.to(room.classId).emit("class:status", { live: true });
  });

  socket.on("class:end", () => {
    const room = requireTeacher();
    if (!room) return;
    room.live = false;
    room.camOn = false;
    room.lastCamFrame = null;
    const msg = pushSystem(room, "ক্লাস শেষ হয়েছে — রেকর্ডিং শীঘ্রই পোর্টালে যুক্ত হবে।");
    io.to(room.classId).emit("chat:new", msg);
    io.to(room.classId).emit("cam:status", { on: false });
    io.to(room.classId).emit("class:status", { live: false });
  });

  socket.on("slide:goto", (data: unknown) => {
    const room = requireTeacher();
    const index = Number((data as { index?: number })?.index);
    if (!room || !Number.isInteger(index)) return;
    room.slideIndex = Math.max(0, index);
    io.to(room.classId).emit("slide:changed", { index: room.slideIndex });
  });

  socket.on("poll:start", (data: unknown) => {
    const room = requireTeacher();
    if (!room) return;
    const payload = (data ?? {}) as { question?: string; options?: string[] };
    const question = String(payload.question ?? "").trim().slice(0, 200);
    const options = (Array.isArray(payload.options) ? payload.options : [])
      .map((o) => String(o ?? "").trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 4);
    if (!question || options.length < 2) return;
    room.poll = { question, options, counts: options.map(() => 0), voters: {} };
    io.to(room.classId).emit("poll:new", {
      question,
      options,
      counts: room.poll.counts,
      totalVotes: 0,
    });
  });

  socket.on("poll:end", () => {
    const room = requireTeacher();
    if (!room || !room.poll) return;
    room.poll = null;
    io.to(room.classId).emit("poll:closed");
  });

  socket.on("cam:on", () => {
    const room = requireTeacher();
    if (!room) return;
    room.camOn = true;
    io.to(room.classId).emit("cam:status", { on: true });
  });

  socket.on("cam:off", () => {
    const room = requireTeacher();
    if (!room) return;
    room.camOn = false;
    room.lastCamFrame = null;
    io.to(room.classId).emit("cam:status", { on: false });
  });

  socket.on("cam:frame", (data: unknown) => {
    const room = requireTeacher();
    const frame = (data as { data?: string })?.data;
    if (!room || typeof frame !== "string") return;
    if (!frame.startsWith("data:image/jpeg") || frame.length > MAX_FRAME_BYTES) return;
    room.lastCamFrame = frame;
    // Everyone except the sender (teacher sees the local preview already)
    socket.to(room.classId).emit("cam:frame", { data: frame });
  });

  // ---------- disconnect ----------

  socket.on("disconnect", () => {
    if (!joined) return;
    const room = rooms.get(joined.classId);
    if (!room) return;
    const wasTeacher = joined.role === "teacher";
    room.participants.delete(socket.id);
    if (room.poll) delete room.poll.voters[socket.id];

    const msg = pushSystem(room, `${joined.name} ক্লাস ছেড়ে গেছেন`);
    io.to(room.classId).emit("chat:new", msg);
    broadcastParticipants(room);

    if (wasTeacher && room.camOn) {
      room.camOn = false;
      room.lastCamFrame = null;
      io.to(room.classId).emit("cam:status", { on: false });
    }

    // Garbage-collect empty rooms after a quiet minute
    if (room.participants.size === 0) {
      const classId = room.classId;
      setTimeout(() => {
        const r = rooms.get(classId);
        if (r && r.participants.size === 0) rooms.delete(classId);
      }, 60_000);
    }
  });

  socket.on("error", (error: unknown) => {
    console.error(`[live-class] socket error (${socket.id}):`, error);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[live-class-service] listening on port ${PORT}`);
});

process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
