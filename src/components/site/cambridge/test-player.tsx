"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Headphones,
  Hourglass,
  Mic,
  PenLine,
  RotateCcw,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/* ── Payload types — GET /api/cambridge/tests/{id}?skill=… ────────────── */

type SkillKey = "listening" | "reading" | "writing" | "speaking";

interface Question {
  n: number;
  type: "blank" | "mcq" | "tfng" | "match";
  label: string;
  options?: string[];
  answer: string;
  accept?: string[];
  explanation: string;
}

interface ListeningPart {
  n: number;
  title: string;
  scenario: string;
  audio: string;
  transcript: string;
  questions: Question[];
}

interface ListeningContent {
  durationMin: number;
  parts: ListeningPart[];
}

interface ReadingPassage {
  n: number;
  title: string;
  text: string;
  questions: Question[];
}

interface ReadingContent {
  durationMin: number;
  kind: "academic" | "general";
  passages: ReadingPassage[];
}

interface WritingContent {
  task1: {
    kind: "report" | "letter";
    prompt: string;
    chartNote?: string;
    bulletPoints?: string[];
    band9: string;
    comments: string;
  };
  task2: { prompt: string; band9: string; comments: string };
}

interface SpeakingContent {
  part1: { topic: string; questions: string[] };
  part2: { prompt: string; cues: string[]; prepareSec: number; speakSec: number };
  part3: { topic: string; questions: string[] };
  sample: { text: string; audio: string };
}

interface TestPayload {
  id: string;
  number: number;
  book: { number: number; module: "academic" | "general"; title: string; year: number };
  skill: SkillKey;
  content: unknown;
}

interface TestResponse {
  ok: boolean;
  test?: TestPayload;
  error?: string;
}

/* ── Constants & helpers ──────────────────────────────────────────────── */

const TFNG_OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"] as const;

const SKILL_META: Record<SkillKey, { icon: LucideIcon; label: string }> = {
  listening: { icon: Headphones, label: "Listening" },
  reading: { icon: BookOpenCheck, label: "Reading" },
  writing: { icon: PenLine, label: "Writing" },
  speaking: { icon: Mic, label: "Speaking" },
};

/* Custom slim emerald scrollbar for the reading passage pane. */
const SCROLL_PANE =
  "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb:hover]:bg-primary/60";

function bandFromScaled(scaled: number): number {
  if (scaled >= 39) return 9;
  if (scaled >= 37) return 8.5;
  if (scaled >= 35) return 8;
  if (scaled >= 33) return 7.5;
  if (scaled >= 30) return 7;
  if (scaled >= 27) return 6.5;
  if (scaled >= 23) return 6;
  if (scaled >= 19) return 5.5;
  if (scaled >= 15) return 5;
  if (scaled >= 13) return 4.5;
  if (scaled >= 10) return 4;
  if (scaled >= 8) return 3.5;
  if (scaled >= 6) return 3;
  return 2.5;
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;]$/, "");
}

function isCorrectAnswer(question: Question, userRaw: string): boolean {
  const user = normalizeAnswer(userRaw);
  if (!user) return false;
  const candidates = [question.answer, ...(question.accept ?? [])].map(normalizeAnswer);
  if (candidates.includes(user)) return true;
  /* MCQ answers may be stored as a letter or as the option text — allow both. */
  if (question.type === "mcq" && question.options) {
    const letter = user.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      const index = letter.charCodeAt(0) - 65;
      const picked = question.options[index];
      if (picked && candidates.includes(normalizeAnswer(picked))) return true;
    }
  }
  return false;
}

function fmtClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function fmtMS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/* Seeded titles carry their own "Part 1 —" / "Reading Passage 2 —" prefix;
   strip it so the “Part {n} ·” headings don’t repeat themselves. */
function stripSkillPrefix(title: string): string {
  return title.replace(/^(Part|Reading Passage)\s*\d+\s*[—–-]\s*/i, "").trim();
}

/* ── Question renderer ────────────────────────────────────────────────── */

function QuestionBlock({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {question.n}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-relaxed text-foreground">{question.label}</p>

          <div className="mt-3">
            {question.type === "blank" ? (
              <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Your answer"
                aria-label={`Your answer for question ${question.n}`}
                className="h-11 sm:max-w-xs"
              />
            ) : null}

            {question.type === "mcq" ? (
              <RadioGroup value={value} onValueChange={onChange} className="gap-1">
                {(question.options ?? []).map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <label
                      key={`${question.n}-${letter}`}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary/5"
                    >
                      <RadioGroupItem value={letter} />
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-[10px] font-bold text-foreground">
                        {letter}
                      </span>
                      <span className="text-sm text-foreground/90">{option}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            ) : null}

            {question.type === "tfng" ? (
              <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-2">
                {TFNG_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-xs font-bold uppercase tracking-wide transition-colors focus-within:ring-2 focus-within:ring-ring/50 ${
                      value === option
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <RadioGroupItem value={option} className="sr-only" />
                    {option}
                  </label>
                ))}
              </RadioGroup>
            ) : null}

            {question.type === "match" ? (
              <Select value={value || undefined} onValueChange={onChange}>
                <SelectTrigger
                  className="h-11 w-full sm:max-w-xs"
                  aria-label={`Select the answer for question ${question.n}`}
                >
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  {(question.options ?? []).map((option, index) => (
                    <SelectItem key={option} value={option}>
                      {String.fromCharCode(65 + index)}. {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Writing task card ────────────────────────────────────────────────── */

function WritingTaskCard({
  idSuffix,
  chipText,
  minutesText,
  targetWords,
  prompt,
  chartNote,
  bulletPoints,
  band9,
  comments,
  value,
  onChange,
  revealed,
  onToggleReveal,
}: {
  idSuffix: string;
  chipText: string;
  minutesText: string;
  targetWords: number;
  prompt: string;
  chartNote?: string;
  bulletPoints?: string[];
  band9: string;
  comments: string;
  value: string;
  onChange: (next: string) => void;
  revealed: boolean;
  onToggleReveal: () => void;
}) {
  const words = countWords(value);
  const progress = Math.min(100, Math.round((words / targetWords) * 100));

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-transparent bg-ink text-white">{chipText}</Badge>
        <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
          <Clock3 className="h-3 w-3" aria-hidden />
          {minutesText}
        </Badge>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{prompt}</p>

      {chartNote ? (
        <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">About the visual</p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{chartNote}</p>
        </div>
      ) : null}

      {bulletPoints && bulletPoints.length > 0 ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Make sure you cover
          </p>
          <ul className="mt-2 space-y-1.5">
            {bulletPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <label htmlFor={`writing-${idSuffix}`} className="font-semibold uppercase tracking-wider">
            Your answer
          </label>
          <span>
            <span className="font-display text-sm font-bold text-foreground">{words}</span> / {targetWords}{" "}
            words
          </span>
        </div>
        <Textarea
          id={`writing-${idSuffix}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write your answer here…"
          className="min-h-56"
        />
        <Progress className="mt-2" value={progress} aria-label={`Task word count progress`} />
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleReveal}
          aria-expanded={revealed}
          className="min-h-9 rounded-full border-primary/30 px-4 text-xs font-semibold hover:border-primary/60 hover:text-primary"
        >
          {revealed ? "Hide Band-9 sample" : "Reveal Band-9 sample"}
        </Button>
        {revealed ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Band-9 sample</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{band9}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Examiner comments
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {comments}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function TestPlayer({
  testId,
  skill,
}: {
  testId: string;
  skill: "listening" | "reading" | "writing" | "speaking";
}) {
  const [test, setTest] = useState<TestPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [notFound, setNotFound] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  /* Scored-skill state (listening / reading) */
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [manualSubmitted, setManualSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  /* Writing state */
  const [task1Text, setTask1Text] = useState("");
  const [task2Text, setTask2Text] = useState("");
  const [revealed, setRevealed] = useState<{ task1: boolean; task2: boolean }>({
    task1: false,
    task2: false,
  });

  /* Speaking Part-2 cue timer */
  const [cueTimer, setCueTimer] = useState<{ mode: "prepare" | "speak"; left: number } | null>(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    // Yield to a microtask first — state resets must not run synchronously
    // inside the effect body (react-hooks/set-state-in-effect).
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("loading");
      setNotFound(false);
      setTest(null);
      setAnswers({});
      setManualSubmitted(false);
      setSecondsLeft(null);
      setTask1Text("");
      setTask2Text("");
      setRevealed({ task1: false, task2: false });
      setCueTimer(null);
    };
    void run();

    fetch(`/api/cambridge/tests/${encodeURIComponent(testId)}?skill=${skill}`, { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as TestResponse | null;
        if (!res.ok || !json?.ok || !json.test) {
          throw Object.assign(new Error(json?.error ?? "Failed to load test"), { status: res.status });
        }
        return json.test;
      })
      .then((payload) => {
        if (cancelled) return;
        setTest(payload);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setNotFound((error as { status?: number })?.status === 404);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [testId, skill, retryTick]);

  /* ── Narrowed content (defensive against empty/malformed JSON columns) ── */
  const durationMin = useMemo(() => {
    if (!test) return null;
    const raw = (test.content as { durationMin?: unknown } | null)?.durationMin;
    if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.round(raw);
    return skill === "listening" ? 40 : 60;
  }, [test, skill]);

  const listeningParts = useMemo<ListeningPart[]>(() => {
    if (!test || skill !== "listening") return [];
    const content = test.content as Partial<ListeningContent> | null;
    return content?.parts ?? [];
  }, [test, skill]);

  const readingPassages = useMemo<ReadingPassage[]>(() => {
    if (!test || skill !== "reading") return [];
    const content = test.content as Partial<ReadingContent> | null;
    return content?.passages ?? [];
  }, [test, skill]);

  const writingContent = useMemo<WritingContent | null>(() => {
    if (!test || skill !== "writing") return null;
    const content = test.content as Partial<WritingContent> | null;
    if (!content?.task1 || !content.task2) return null;
    return {
      task1: {
        kind: content.task1.kind === "letter" ? "letter" : "report",
        prompt: content.task1.prompt ?? "",
        chartNote: content.task1.chartNote,
        bulletPoints: content.task1.bulletPoints,
        band9: content.task1.band9 ?? "",
        comments: content.task1.comments ?? "",
      },
      task2: {
        prompt: content.task2.prompt ?? "",
        band9: content.task2.band9 ?? "",
        comments: content.task2.comments ?? "",
      },
    };
  }, [test, skill]);

  const speakingContent = useMemo<SpeakingContent | null>(() => {
    if (!test || skill !== "speaking") return null;
    const content = test.content as Partial<SpeakingContent> | null;
    if (!content?.part1 || !content.part2 || !content.part3) return null;
    return {
      part1: { topic: content.part1.topic ?? "", questions: content.part1.questions ?? [] },
      part2: {
        prompt: content.part2.prompt ?? "",
        cues: content.part2.cues ?? [],
        prepareSec: content.part2.prepareSec || 60,
        speakSec: content.part2.speakSec || 120,
      },
      part3: { topic: content.part3.topic ?? "", questions: content.part3.questions ?? [] },
      sample: { text: content.sample?.text ?? "", audio: content.sample?.audio ?? "" },
    };
  }, [test, skill]);

  const allQuestions = useMemo<Question[]>(() => {
    if (!test) return [];
    if (skill === "listening") {
      return listeningParts.flatMap((part) => (Array.isArray(part.questions) ? part.questions : []));
    }
    if (skill === "reading") {
      return readingPassages.flatMap((passage) =>
        Array.isArray(passage.questions) ? passage.questions : []
      );
    }
    return [];
  }, [test, skill, listeningParts, readingPassages]);

  const totalQuestions = allQuestions.length;
  const answeredCount = allQuestions.filter((q) => (answers[q.n] ?? "").trim() !== "").length;
  const correctCount = allQuestions.filter((q) => isCorrectAnswer(q, answers[q.n] ?? "")).length;
  const scaled = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 40) : 0;
  const band = bandFromScaled(scaled);
  const isScored = skill === "listening" || skill === "reading";
  const timerOn = isScored && status === "ready" && secondsLeft !== null;
  /* Auto-submit: hitting zero counts as submitted — derived, no extra effect. */
  const expired = timerOn && secondsLeft === 0;
  const submitted = manualSubmitted || expired;

  /* ── Countdown timer (listening / reading) ── pauses once submitted. ── */
  useEffect(() => {
    if (!timerOn || manualSubmitted || expired) return;
    const id = window.setInterval(() => {
      setSecondsLeft((current) => (current === null || current <= 0 ? current : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn, manualSubmitted, expired]);

  /* ── Speaking Part-2 cue timer ── */
  const cueRunning = cueTimer !== null;
  const cueMode = cueTimer?.mode ?? null;
  useEffect(() => {
    if (!cueRunning || !cueMode) return;
    const id = window.setInterval(() => {
      setCueTimer((current) => (current && current.left > 1 ? { ...current, left: current.left - 1 } : null));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cueRunning, cueMode]);

  function setAnswer(questionNumber: number, value: string) {
    setAnswers((current) => ({ ...current, [questionNumber]: value }));
  }

  function handleSubmit() {
    setManualSubmitted(true);
    window.requestAnimationFrame(() => {
      document.getElementById("cambridge-score")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function tryAgain() {
    setAnswers({});
    setManualSubmitted(false);
    setSecondsLeft((durationMin ?? 40) * 60);
  }

  function startCueTimer(mode: "prepare" | "speak") {
    if (!speakingContent) return;
    setCueTimer({
      mode,
      left: mode === "prepare" ? speakingContent.part2.prepareSec : speakingContent.part2.speakSec,
    });
  }

  const skillMeta = SKILL_META[skill];
  const timerLow = secondsLeft !== null && secondsLeft < 5 * 60;

  return (
    <div className="py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Header card */}
        {status === "ready" && test ? (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <a
                href={`#/cambridge/book/${test.book.number}?module=${test.book.module}`}
                className="inline-flex min-h-9 min-w-0 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                <span className="max-w-[200px] truncate sm:max-w-xs">{test.book.title}</span>
              </a>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-transparent bg-ink text-white">Test {test.number}</Badge>
                <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                  <skillMeta.icon className="h-3.5 w-3.5" aria-hidden />
                  {skillMeta.label}
                </Badge>
                {timerOn && secondsLeft !== null ? (
                  <span
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-bold tabular-nums ${
                      timerLow
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-primary/30 bg-primary/5 text-primary"
                    }`}
                  >
                    <Timer className="h-3.5 w-3.5" aria-hidden />
                    {fmtClock(secondsLeft)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-16 w-full rounded-2xl" />
        )}

        {/* Loading skeleton */}
        {status === "loading" ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : null}

        {/* Error / not-found */}
        {status === "error" ? (
          <Card className="mx-auto mt-6 max-w-lg items-center gap-3 p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </span>
            <p className="font-display text-lg font-bold text-foreground">
              {notFound ? "টেস্টটি খুঁজে পাওয়া যায়নি" : "টেস্টটি লোড করা যায়নি"}
            </p>
            <p className="text-sm text-muted-foreground">
              {notFound
                ? "This test isn't on the shelf. Head back to the book page and pick another test."
                : "Something went wrong while loading this test. Please try again."}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setRetryTick((tick) => tick + 1)}
                className="min-h-11 rounded-full bg-ink px-6 font-bold text-white hover:opacity-85"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
                Try again
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-full border-primary/30 font-semibold hover:border-primary/60 hover:text-primary"
              >
                <a href="#/cambridge">Back to Library</a>
              </Button>
            </div>
          </Card>
        ) : null}

        {/* Player body */}
        {status === "ready" && test ? (
          <div className="mt-6">
            {/* ── LISTENING ── */}
            {skill === "listening" ? (
              listeningParts.length === 0 || totalQuestions === 0 ? (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  This test doesn&apos;t have listening content yet — please check back soon.
                </Card>
              ) : submitted ? (
                <ScoreAndReview
                  correct={correctCount}
                  total={totalQuestions}
                  band={band}
                  questions={allQuestions}
                  answers={answers}
                  onTryAgain={tryAgain}
                  backHref={`#/cambridge/book/${test.book.number}?module=${test.book.module}`}
                />
              ) : (
                <div className="space-y-10">
                  {listeningParts.map((part) => (
                    <section key={part.n} className="space-y-4">
                      <div>
                        <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
                          Part {part.n} · {stripSkillPrefix(part.title)}
                        </h2>
                        {part.scenario ? (
                          <p className="mt-1 text-sm text-muted-foreground">{part.scenario}</p>
                        ) : null}
                      </div>

                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Part {part.n} audio · demo narration
                        </p>
                        <audio controls preload="none" src={part.audio} className="h-10 w-full" />
                      </div>

                      <div className="grid gap-3">
                        {(Array.isArray(part.questions) ? part.questions : []).map((question) => (
                          <QuestionBlock
                            key={question.n}
                            question={question}
                            value={answers[question.n] ?? ""}
                            onChange={(next) => setAnswer(question.n, next)}
                          />
                        ))}
                      </div>

                      <Accordion
                        type="single"
                        collapsible
                        className="rounded-xl border border-border bg-card px-4"
                      >
                        <AccordionItem value={`transcript-${part.n}`} className="border-b-0">
                          <AccordionTrigger className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Show transcript (Part {part.n})
                          </AccordionTrigger>
                          <AccordionContent className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                            {part.transcript}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </section>
                  ))}
                </div>
              )
            ) : null}

            {/* ── READING ── */}
            {skill === "reading" ? (
              readingPassages.length === 0 || totalQuestions === 0 ? (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  This test doesn&apos;t have reading content yet — please check back soon.
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Passage pane (desktop) */}
                  <div className="hidden lg:block">
                    <div
                      className={`sticky top-24 max-h-[70vh] space-y-6 overflow-y-auto rounded-2xl border border-border bg-card p-6 ${SCROLL_PANE}`}
                    >
                      {readingPassages.map((passage) => (
                        <article key={passage.n}>
                          <h2 className="font-display text-base font-bold text-foreground">
                            Passage {passage.n} · {stripSkillPrefix(passage.title)}
                          </h2>
                          <div className="mt-2 space-y-3 text-sm leading-relaxed text-foreground/85">
                            {passage.text
                              .split("\n\n")
                              .filter((paragraph) => paragraph.trim() !== "")
                              .map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                              ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  {/* Questions column */}
                  <div className="space-y-8">
                    {submitted ? (
                      <ScoreAndReview
                        correct={correctCount}
                        total={totalQuestions}
                        band={band}
                        questions={allQuestions}
                        answers={answers}
                        onTryAgain={tryAgain}
                        backHref={`#/cambridge/book/${test.book.number}?module=${test.book.module}`}
                      />
                    ) : (
                      readingPassages.map((passage) => (
                        <section key={passage.n} className="space-y-3">
                          {/* Mobile passage accordion */}
                          <Accordion
                            type="single"
                            collapsible
                            className="rounded-xl border border-border bg-card px-4 lg:hidden"
                          >
                            <AccordionItem value={`passage-${passage.n}`} className="border-b-0">
                              <AccordionTrigger className="py-4 text-sm font-bold text-foreground hover:no-underline">
                                Passage {passage.n} · {stripSkillPrefix(passage.title)}
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3 text-sm leading-relaxed text-foreground/85">
                                {passage.text
                                  .split("\n\n")
                                  .filter((paragraph) => paragraph.trim() !== "")
                                  .map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                  ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>

                          <div>
                            <h2 className="hidden font-display text-base font-bold text-foreground lg:block">
                              Passage {passage.n} · {stripSkillPrefix(passage.title)}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              {(Array.isArray(passage.questions) ? passage.questions : []).length} questions
                            </p>
                          </div>

                          <div className="grid gap-3">
                            {(Array.isArray(passage.questions) ? passage.questions : []).map((question) => (
                              <QuestionBlock
                                key={question.n}
                                question={question}
                                value={answers[question.n] ?? ""}
                                onChange={(next) => setAnswer(question.n, next)}
                              />
                            ))}
                          </div>
                        </section>
                      ))
                    )}
                  </div>
                </div>
              )
            ) : null}

            {/* ── WRITING ── */}
            {skill === "writing" ? (
              writingContent ? (
                <div className="space-y-6">
                  <WritingTaskCard
                    idSuffix="task1"
                    chipText={
                      writingContent.task1.kind === "report"
                        ? "Academic Task 1 · Report"
                        : "General Task 1 · Letter"
                    }
                    minutesText="Recommended: 20 min"
                    targetWords={150}
                    prompt={writingContent.task1.prompt}
                    chartNote={writingContent.task1.chartNote}
                    bulletPoints={writingContent.task1.bulletPoints}
                    band9={writingContent.task1.band9}
                    comments={writingContent.task1.comments}
                    value={task1Text}
                    onChange={setTask1Text}
                    revealed={revealed.task1}
                    onToggleReveal={() =>
                      setRevealed((current) => ({ ...current, task1: !current.task1 }))
                    }
                  />
                  <WritingTaskCard
                    idSuffix="task2"
                    chipText="Task 2 · Essay"
                    minutesText="Recommended: 40 min"
                    targetWords={250}
                    prompt={writingContent.task2.prompt}
                    band9={writingContent.task2.band9}
                    comments={writingContent.task2.comments}
                    value={task2Text}
                    onChange={setTask2Text}
                    revealed={revealed.task2}
                    onToggleReveal={() =>
                      setRevealed((current) => ({ ...current, task2: !current.task2 }))
                    }
                  />
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  This test doesn&apos;t have writing content yet — please check back soon.
                </Card>
              )
            ) : null}

            {/* ── SPEAKING ── */}
            {skill === "speaking" ? (
              speakingContent ? (
                <div className="space-y-6">
                  {/* Part 1 */}
                  <article className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-ink text-white">Part 1</Badge>
                      {speakingContent.part1.topic ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {speakingContent.part1.topic}
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-bold text-foreground">
                      Introduction &amp; interview
                    </h2>
                    <ol className="mt-3 space-y-2">
                      {speakingContent.part1.questions.map((question, index) => (
                        <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                          <span className="font-bold text-primary">{index + 1}.</span>
                          {question}
                        </li>
                      ))}
                    </ol>
                  </article>

                  {/* Part 2 — cue card + timers */}
                  <article className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-ink text-white">Part 2</Badge>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        Cue card · long turn
                      </Badge>
                    </div>
                    <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
                      <p className="font-display text-base font-bold leading-snug text-foreground">
                        {speakingContent.part2.prompt}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {speakingContent.part2.cues.map((cue) => (
                          <li key={cue} className="flex items-start gap-2 text-sm text-foreground/85">
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            {cue}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        onClick={() => startCueTimer("prepare")}
                        disabled={cueTimer !== null}
                        className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-white hover:opacity-85"
                      >
                        <Hourglass className="mr-1.5 h-4 w-4" aria-hidden />
                        Prepare · {fmtMS(speakingContent.part2.prepareSec)}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => startCueTimer("speak")}
                        disabled={cueTimer !== null}
                        className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-white hover:opacity-85"
                      >
                        <Mic className="mr-1.5 h-4 w-4" aria-hidden />
                        Speak · {fmtMS(speakingContent.part2.speakSec)}
                      </Button>
                      {cueTimer ? (
                        <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 text-sm font-bold tabular-nums text-primary">
                          <Timer className="h-4 w-4" aria-hidden />
                          {cueTimer.mode === "prepare" ? "Prepare" : "Speak"} {fmtClock(cueTimer.left)}
                        </span>
                      ) : null}
                    </div>
                  </article>

                  {/* Part 3 */}
                  <article className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-ink text-white">Part 3</Badge>
                      {speakingContent.part3.topic ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {speakingContent.part3.topic}
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-bold text-foreground">Two-way discussion</h2>
                    <ol className="mt-3 space-y-2">
                      {speakingContent.part3.questions.map((question, index) => (
                        <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                          <span className="font-bold text-primary">{index + 1}.</span>
                          {question}
                        </li>
                      ))}
                    </ol>
                  </article>

                  {/* Band-9 sample */}
                  <article className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-primary/10 text-primary">Sample</Badge>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Band-9 speaking sample
                      </h2>
                    </div>
                    {speakingContent.sample.audio ? (
                      <audio
                        controls
                        preload="none"
                        src={speakingContent.sample.audio}
                        className="mt-3 h-10 w-full"
                      />
                    ) : null}
                    <Accordion
                      type="single"
                      collapsible
                      className="mt-3 rounded-xl border border-border bg-muted/30 px-4"
                    >
                      <AccordionItem value="sample-transcript" className="border-b-0">
                        <AccordionTrigger className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">
                          Show Band-9 transcript
                        </AccordionTrigger>
                        <AccordionContent className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                          {speakingContent.sample.text}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </article>
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  This test doesn&apos;t have speaking content yet — please check back soon.
                </Card>
              )
            ) : null}

            {/* Sticky submit bar (listening / reading, before submission) */}
            {isScored && !submitted && totalQuestions > 0 ? (
              <div className="sticky bottom-4 z-30 mt-8">
                <div className="flex items-center justify-between gap-4 rounded-full border border-border bg-card/95 py-3 pl-6 pr-3 shadow-[0_14px_40px_rgba(11,42,32,0.18)] backdrop-blur">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-display text-base font-bold text-foreground">{answeredCount}</span>
                    /{totalQuestions} answered
                  </p>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="min-h-11 rounded-full bg-ink px-6 text-sm font-bold text-white hover:opacity-85"
                  >
                    Submit &amp; Score
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Score + review screen (listening / reading) ──────────────────────── */

function ScoreAndReview({
  correct,
  total,
  band,
  questions,
  answers,
  onTryAgain,
  backHref,
}: {
  correct: number;
  total: number;
  band: number;
  questions: Question[];
  answers: Record<number, string>;
  onTryAgain: () => void;
  backHref: string;
}) {
  return (
    <div>
      <section
        id="cambridge-score"
        className="rounded-2xl border border-primary/25 bg-card p-6 text-center shadow-[0_10px_30px_rgba(11,42,32,0.08)] md:p-10"
      >
        <Badge className="border-transparent bg-primary/10 text-primary">Test scored</Badge>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Raw score
        </p>
        <p className="mt-1 font-display text-5xl font-bold text-foreground md:text-6xl">
          {correct} <span className="text-muted-foreground/50">/ {total}</span>
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Estimated band
        </p>
        <p className="font-display text-6xl font-bold text-brand-gradient md:text-7xl">
          {band.toFixed(1)}
        </p>
        <div className="mx-auto mt-4 w-full max-w-sm">
          <Progress value={(band / 9) * 100} aria-label="Band score progress" />
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            onClick={onTryAgain}
            className="min-h-11 rounded-full bg-ink px-6 font-bold text-white hover:opacity-85"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-11 rounded-full border-primary/30 font-semibold hover:border-primary/60 hover:text-primary"
          >
            <a href={backHref}>Back to book</a>
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-xl font-bold text-foreground">Review answers</h3>
        <div className="mt-4 space-y-3">
          {questions.map((question) => {
            const user = answers[question.n] ?? "";
            const ok = isCorrectAnswer(question, user);
            return (
              <div
                key={question.n}
                className={`rounded-xl border p-4 ${
                  ok ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      ok ? "bg-primary/15 text-primary" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {question.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-relaxed text-foreground">{question.label}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className={ok ? "font-semibold text-primary" : "font-semibold text-destructive line-through"}>
                        {user.trim() !== "" ? user.trim() : "No answer"}
                      </span>
                      <span className="text-foreground/70">
                        Correct: <span className="font-semibold text-primary">{question.answer}</span>
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {question.explanation}
                    </p>
                  </div>
                  {ok ? (
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <X className="mt-1 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
