"use client";

import { useEffect, useRef, useState } from "react";
import {
  Crown,
  Hand,
  MessageSquare,
  MicOff,
  MonitorUp,
  Send,
  UserX,
  Users,
  VideoOff,
  Vote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChatMsg, ParticipantDTO, LiveRole, PollDTO } from "@/lib/live-protocol";
import { chatTimeLabel } from "./labels";

export type PanelTab = "chat" | "people" | "poll";

type SidePanelsProps = {
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  chat: ChatMsg[];
  meId: string | null;
  onSendChat: (text: string) => void;
  participants: ParticipantDTO[];
  myRole: LiveRole;
  onMuteAll: () => void;
  onMuteOne: (id: string) => void;
  onRemoveOne: (id: string) => void;
  poll: PollDTO | null;
  onVote: (index: number) => void;
  onEndPoll: () => void;
  onStartPoll: (question: string, options: string[]) => void;
};

/** Chat / People / Poll — the classroom side panel (right column & mobile overlay). */
export function ClassroomSidePanel({
  tab,
  onTabChange,
  chat,
  meId,
  onSendChat,
  participants,
  myRole,
  onMuteAll,
  onMuteOne,
  onRemoveOne,
  poll,
  onVote,
  onEndPoll,
  onStartPoll,
}: SidePanelsProps) {
  return (
    <Tabs value={tab} onValueChange={(v) => onTabChange(v as PanelTab)} className="flex h-full min-h-0 flex-1 flex-col">
      <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-white/10 bg-[#18150e]">
        <TabsTrigger
          value="chat"
          className="gap-1 text-xs text-[#c6b995] data-[state=active]:bg-white/10 data-[state=active]:text-[#d9b75c]"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          চ্যাট
        </TabsTrigger>
        <TabsTrigger
          value="people"
          className="gap-1 text-xs text-[#c6b995] data-[state=active]:bg-white/10 data-[state=active]:text-[#d9b75c]"
        >
          <Users className="h-3.5 w-3.5" aria-hidden />
          <span>
            অংশগ্রহণকারী <span className="tabular-nums">{participants.length}</span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="poll"
          className="relative gap-1 text-xs text-[#c6b995] data-[state=active]:bg-white/10 data-[state=active]:text-[#d9b75c]"
        >
          <Vote className="h-3.5 w-3.5" aria-hidden />
          পোল
          {poll ? <span aria-hidden className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" /> : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="mt-0 flex min-h-0 flex-1 flex-col">
        <ChatPanel chat={chat} meId={meId} onSend={onSendChat} />
      </TabsContent>

      <TabsContent value="people" className="mt-0 flex min-h-0 flex-1 flex-col">
        <PeoplePanel
          participants={participants}
          meId={meId}
          myRole={myRole}
          onMuteAll={onMuteAll}
          onMuteOne={onMuteOne}
          onRemoveOne={onRemoveOne}
        />
      </TabsContent>

      <TabsContent value="poll" className="mt-0 flex min-h-0 flex-1 flex-col">
        <PollSection poll={poll} myRole={myRole} onVote={onVote} onEndPoll={onEndPoll} onStartPoll={onStartPoll} />
      </TabsContent>
    </Tabs>
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
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="live-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3"
        aria-label="ক্লাস চ্যাট"
        aria-live="polite"
      >
        {chat.length === 0 ? (
          <p className="pt-10 text-center text-xs text-[#a3977b]">
            ক্লাস শুরু হলেই এখানে কথা বলা যাবে, প্রথম মেসেজটি আপনিই পাঠান!
          </p>
        ) : null}
        {chat.map((msg) =>
          msg.role === "system" ? (
            <p key={msg.id} className="text-center text-[11px] leading-relaxed text-[#a3977b]">
              {msg.text}
            </p>
          ) : (
            <ChatBubble key={msg.id} msg={msg} own={!!msg.from && msg.from === meId} />
          )
        )}
      </div>
      <form
        className="flex items-center gap-2 border-t border-white/10 bg-[#18150e] p-3"
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
          className="h-10 border-white/10 bg-[#1d1810] text-[#f6ecd4] placeholder:text-[#a3977b]"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="পাঠান"
          className="h-11 w-11 shrink-0 bg-gold-gradient text-[#1e1b14] hover:opacity-90"
        >
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
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#c6b995]">
          {msg.role === "teacher" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-1.5 py-px text-[9px] font-bold uppercase text-[#d9b75c]">
              শিক্ষক
            </span>
          ) : null}
          {msg.name}
          <span className="font-normal text-[#a3977b]">{chatTimeLabel(msg.at)}</span>
        </p>
        <p
          className={`mt-0.5 break-words text-sm leading-relaxed ${
            own
              ? "rounded-lg bg-[#1d1810] px-2.5 py-1.5 text-[#f6ecd4]"
              : msg.role === "teacher"
                ? "font-medium text-[#d9b75c]"
                : "text-[#f6ecd4]/90"
          }`}
        >
          {msg.text}
        </p>
      </div>
    </div>
  );
}

/* ── People ─────────────────────────────────────────────────────────── */

function PeoplePanel({
  participants,
  meId,
  myRole,
  onMuteAll,
  onMuteOne,
  onRemoveOne,
}: {
  participants: ParticipantDTO[];
  meId: string | null;
  myRole: LiveRole;
  onMuteAll: () => void;
  onMuteOne: (id: string) => void;
  onRemoveOne: (id: string) => void;
}) {
  const isTeacher = myRole === "teacher";
  const [removeTarget, setRemoveTarget] = useState<ParticipantDTO | null>(null);

  const sorted = [...participants].sort((a, b) => {
    if (a.role !== b.role) return a.role === "teacher" ? -1 : 1;
    if (a.handRaised !== b.handRaised) return a.handRaised ? -1 : 1;
    return a.joinedAt - b.joinedAt;
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <p className="text-xs text-[#c6b995]">
          ক্লাসে আছেন <span className="font-semibold tabular-nums text-[#f6ecd4]">{participants.length}</span> জন
        </p>
        {isTeacher ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onMuteAll}
            className="h-8 border-white/15 bg-transparent px-2.5 text-xs text-[#c6b995] hover:bg-white/10 hover:text-[#f6ecd4]"
          >
            <MicOff className="mr-1 h-3.5 w-3.5" aria-hidden />
            সবার মাইক বন্ধ
          </Button>
        ) : null}
      </div>

      <ul className="live-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {sorted.map((p) => {
          const canModerate = isTeacher && p.id !== meId && p.role !== "teacher";
          return (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm transition-colors hover:border-white/10 hover:bg-white/5"
            >
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-[#e4d5ae]"
              >
                {(p.name || "?").slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-[#f6ecd4]/90">
                {p.name}
                {p.id === meId ? <span className="font-normal text-[#c6b995]"> (আপনি)</span> : null}
              </span>
              {p.role === "teacher" ? <Crown className="h-4 w-4 shrink-0 text-[#d9b75c]" aria-label="শিক্ষক" /> : null}
              {p.handRaised ? <Hand className="h-4 w-4 shrink-0 text-amber-400" aria-label="হাত তুলেছেন" /> : null}
              {!p.audio ? <MicOff className="h-4 w-4 shrink-0 text-red-400" aria-label="মাইক বন্ধ" /> : null}
              {!p.video ? <VideoOff className="h-4 w-4 shrink-0 text-[#a3977b]" aria-label="ক্যামেরা বন্ধ" /> : null}
              {p.screen ? <MonitorUp className="h-4 w-4 shrink-0 text-[#d9b75c]" aria-label="স্ক্রিন শেয়ার চলছে" /> : null}
              {p.speaking ? (
                <span aria-label="এখন কথা বলছেন" className="h-2 w-2 shrink-0 rounded-full bg-[#d9b75c]" />
              ) : null}
              {canModerate ? (
                <span className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMuteOne(p.id)}
                    aria-label={`${p.name} এর মাইক বন্ধ করুন`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#c6b995] transition-colors hover:bg-white/10 hover:text-[#f6ecd4]"
                  >
                    <MicOff className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(p)}
                    aria-label={`${p.name} কে ক্লাস থেকে সরান`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-500/15"
                  >
                    <UserX className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <AlertDialog open={!!removeTarget} onOpenChange={(o) => (o ? undefined : setRemoveTarget(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>এই শিক্ষার্থীকে ক্লাস থেকে সরাবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget ? `${removeTarget.name} ক্লাসরুম থেকে সরিয়ে দেওয়া হবে।` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeTarget) onRemoveOne(removeTarget.id);
                setRemoveTarget(null);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              সরিয়ে দিন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Poll (display + teacher composer) ──────────────────────────────── */

function PollSection({
  poll,
  myRole,
  onVote,
  onEndPoll,
  onStartPoll,
}: {
  poll: PollDTO | null;
  myRole: LiveRole;
  onVote: (index: number) => void;
  onEndPoll: () => void;
  onStartPoll: (question: string, options: string[]) => void;
}) {
  const isTeacher = myRole === "teacher";
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftOptions, setDraftOptions] = useState<string[]>(["", ""]);

  // Teacher with no live poll → composer
  if (isTeacher && !poll) {
    const start = () => {
      const q = draftQuestion.trim();
      const opts = draftOptions.map((o) => o.trim()).filter(Boolean);
      if (!q || opts.length < 2) return;
      onStartPoll(q, opts);
      setDraftQuestion("");
      setDraftOptions(["", ""]);
    };

    return (
      <div className="live-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#d9b75c]">নতুন পোল</p>
        <Label htmlFor="poll-question" className="mt-3 text-xs text-[#c6b995]">
          প্রশ্ন
        </Label>
        <Input
          id="poll-question"
          value={draftQuestion}
          onChange={(e) => setDraftQuestion(e.target.value)}
          placeholder="যেমন: আজকের ক্লাস কেমন লাগছে?"
          maxLength={200}
          className="mt-1 h-10 border-white/10 bg-[#1d1810] text-[#f6ecd4] placeholder:text-[#a3977b]"
        />
        <Label className="mt-3 text-xs text-[#c6b995]">অপশন (কমপক্ষে ২টি)</Label>
        <div className="mt-1 space-y-2">
          {draftOptions.map((opt, i) => (
            <Input
              key={i}
              value={opt}
              onChange={(e) => setDraftOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
              placeholder={`অপশন ${i + 1}`}
              aria-label={`পোল অপশন ${i + 1}`}
              maxLength={120}
              className="h-10 border-white/10 bg-[#1d1810] text-[#f6ecd4] placeholder:text-[#a3977b]"
            />
          ))}
          {draftOptions.length < 4 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDraftOptions((p) => [...p, ""])}
              className="h-9 text-[#c6b995] hover:bg-white/10 hover:text-[#f6ecd4]"
            >
              + অপশন
            </Button>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={start}
          className="mt-4 h-11 w-full rounded-full bg-brand-gradient font-semibold text-[#f6ecd4] hover:opacity-90"
        >
          শুরু করুন
        </Button>
        <p className="mt-2 text-[11px] leading-relaxed text-[#a3977b]">
          পোল চালু হলে সবার পোল প্যানেলে দেখা যাবে, প্রতিজন একবার ভোট দিতে পারবে।
        </p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <Vote className="h-8 w-8 text-[#d9b75c]/60" aria-hidden />
        <p className="text-sm text-[#c6b995]">
          কোনো পোল চালু নেই, শিক্ষক পোল চালু করলে এখানে ভোট দেওয়া যাবে।
        </p>
      </div>
    );
  }

  return <PollDisplay poll={poll} myRole={myRole} onVote={onVote} onEndPoll={onEndPoll} />;
}

function PollDisplay({
  poll,
  myRole,
  onVote,
  onEndPoll,
}: {
  poll: PollDTO;
  myRole: LiveRole;
  onVote: (index: number) => void;
  onEndPoll: () => void;
}) {
  const isTeacher = myRole === "teacher";

  // My vote — reset automatically when a new poll question arrives
  // (React's sanctioned "adjust state during render" pattern, as in v1).
  const [voteState, setVoteState] = useState<{ q: string | null; index: number | null }>({ q: null, index: null });
  if (voteState.q !== poll.question) {
    setVoteState({ q: poll.question, index: null });
  }
  const myVote = voteState.q === poll.question ? voteState.index : null;

  return (
    <div className="live-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#d9b75c]">লাইভ পোল</p>
      <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-[#f6ecd4]">{poll.question}</h3>

      <div className="mt-4 space-y-2.5">
        {poll.options.map((opt, i) => {
          const pct = poll.totalVotes > 0 ? Math.round(((poll.counts[i] ?? 0) / poll.totalVotes) * 100) : 0;
          const voted = myVote === i;
          const reveal = myVote !== null || isTeacher;
          return (
            <button
              key={i}
              type="button"
              disabled={myVote !== null || isTeacher}
              onClick={() => {
                if (myVote !== null) return;
                setVoteState({ q: poll.question, index: i });
                onVote(i);
              }}
              aria-pressed={voted}
              className={`relative min-h-11 w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left text-sm text-[#f6ecd4] transition-colors ${
                voted
                  ? "border-[#d9b75c]/60"
                  : "border-white/10 hover:border-white/25 hover:bg-white/5 disabled:hover:border-white/10 disabled:hover:bg-transparent"
              }`}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-[#d9b75c]/15 transition-[width] duration-500"
                style={{ width: reveal ? `${pct}%` : "0%" }}
              />
              <span className="relative flex items-center justify-between gap-2">
                <span className={voted ? "font-semibold text-[#d9b75c]" : ""}>
                  {opt}
                  {voted ? <span className="ml-1.5 text-[10px] font-bold uppercase text-[#d9b75c]">আপনার ভোট</span> : null}
                </span>
                {reveal ? <span className="shrink-0 text-xs tabular-nums text-[#c6b995]">{pct}%</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-[#c6b995]">
        {myVote === null
          ? isTeacher
            ? `শিক্ষক ভিউ, মোট ভোট: ${poll.totalVotes}`
            : "একটি অপশনে ক্লিক করে ভোট দিন"
          : `মোট ভোট: ${poll.totalVotes}, রেজাল্ট লাইভ আপডেট হচ্ছে`}
      </p>

      {isTeacher ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onEndPoll}
          className="mt-3 h-11 border-red-500/40 bg-transparent px-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <X className="mr-1.5 h-4 w-4" aria-hidden />
          পোল শেষ
        </Button>
      ) : null}
    </div>
  );
}
