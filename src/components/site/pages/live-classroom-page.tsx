"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Play,
  Radio,
  Share2,
  ShieldCheck,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveGate } from "@/components/site/live-gate";
import type { LiveClassDetail } from "@/lib/live-types";
import { courses } from "@/lib/site-data";

const dhakaFull = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/**
 * #/live/<slug> — Google Meet / Zoom Live Classroom Bridge.
 * Enrolled students view credentials, direct Launch button, guidelines, or recording.
 */
export function LiveClassroomPage({ slug }: { slug: string }) {
  return (
    <LiveGate>
      <ClassroomPageInner slug={slug} />
    </LiveGate>
  );
}

function ClassroomPageInner({ slug }: { slug: string }) {
  const [meta, setMeta] = useState<LiveClassDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/live-classes/${slug}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.ok && json.class) setMeta(json.class as LiveClassDetail);
        else setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} কপি হয়েছে!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-2xl font-bold">ক্লাসটি খুঁজে পাওয়া যায়নি</p>
        <p className="mt-2 text-sm text-muted-foreground">
          লিংকটি পুরোনো হতে পারে, লাইভ হাব থেকে বর্তমান ক্লাসগুলো দেখুন।
        </p>
        <Button asChild className="mt-6 rounded-full bg-ink font-semibold text-white hover:opacity-85">
          <a href="#/live">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            লাইভ হাব
          </a>
        </Button>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="py-24 text-center text-muted-foreground" role="status">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="mt-4 text-sm">ক্লাসের তথ্য লোড হচ্ছে…</p>
      </div>
    );
  }

  const courseObj = courses.find((c) => c.slug === meta.courseSlug);
  const isMeet = meta.platform === "meet";
  const isZoom = meta.platform === "zoom";
  const platformName = isMeet ? "Google Meet" : isZoom ? "Zoom" : "Live Meeting";
  const meetingUrl = meta.meetingUrl || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      {/* Back button */}
      <div className="mb-6">
        <a
          href="#/live"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          সকল লাইভ ক্লাস ও শিডিউল
        </a>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_60px_rgba(30,27,20,0.12)]">
        {/* Header bar */}
        <div className="border-b border-border/70 bg-muted/40 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {meta.status === "live" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  লাইভ চলছে
                </span>
              ) : meta.status === "ended" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  ক্লাস সম্পন্ন
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  আসন্ন ক্লাস
                </span>
              )}

              <Badge
                className={
                  isMeet
                    ? "bg-emerald-600 text-white"
                    : isZoom
                      ? "bg-blue-600 text-white"
                      : "bg-stone-700 text-white"
                }
              >
                <Video className="mr-1 h-3 w-3" />
                {platformName}
              </Badge>

              {meta.targetBatch && (
                <Badge variant="outline" className="border-border bg-card font-medium">
                  {meta.targetBatch}
                </Badge>
              )}
            </div>

            {courseObj && (
              <span className="text-xs font-semibold text-primary">{courseObj.title}</span>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold leading-snug text-foreground md:text-3xl">
            {meta.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            ইন্সট্রাক্টর: <strong className="text-foreground">{meta.teacher}</strong> · সময়:{" "}
            {dhakaFull.format(new Date(meta.startsAt))} (Dhaka Time) · সময়কাল: {meta.durationMin} মিনিট
          </p>
        </div>

        <div className="space-y-6 p-6 md:p-8">
          {/* Main Action Banner */}
          {meta.status === "live" || meta.status === "scheduled" ? (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center">
              <h2 className="font-display text-lg font-bold text-foreground">
                {meta.status === "live" ? "ক্লাস শুরু হয়েছে, এখনই যোগ দিন!" : "মিটিং রুমে প্রবেশ করুন"}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                {isMeet
                  ? "Google Meet-এ ক্লাস পরিচালিত হচ্ছে। নিচের বাটনে ক্লিক করে সরাসরি ক্লাসে যুক্ত হন।"
                  : isZoom
                    ? "Zoom-এ ক্লাস পরিচালিত হচ্ছে। অ্যাপ বা ব্রাউজার দিয়ে সহজে জয়েন করুন।"
                    : "নিচের লিংকে ক্লিক করে লাইভ ক্লাসে অংশ নিন।"}
              </p>

              {meetingUrl ? (
                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className={`h-12 rounded-full px-8 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02] ${
                      isMeet
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-5 w-5" />
                      {platformName}-এ জয়েন করুন
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-full border-border bg-card px-5"
                    onClick={() => copyToClipboard(meetingUrl, "মিটিং লিংক")}
                  >
                    {copiedField === "মিটিং লিংক" ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
                        লিংক কপি হয়েছে
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-4 w-4" />
                        মিটিং লিংক কপি
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
                  ক্লাসের সময় মিটিং লিংক এখানে স্বয়ংক্রিয়ভাবে সক্রিয় হবে। অনুগ্রহ করে অপেক্ষা করুন।
                </div>
              )}
            </div>
          ) : null}

          {/* If class has ended */}
          {meta.status === "ended" && (
            <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center">
              <h2 className="font-display text-lg font-bold text-foreground">এই লাইভ ক্লাসটি সম্পন্ন হয়েছে</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                লাইভ ক্লাস শেষ হয়ে গেছে। আপনি যদি ক্লাসটি মিস করে থাকেন, তবে ক্লাসের রেকর্ডিং নিচে দেওয়া হলো।
              </p>
              {meta.recordingUrl ? (
                <div className="mt-4">
                  <Button
                    asChild
                    className="rounded-full bg-ink font-semibold text-white hover:opacity-90"
                  >
                    <a href={meta.recordingUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-2 h-4 w-4 text-amber-400" />
                      ক্লাসের রেকর্ডিং দেখুন
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  📹 ক্লাসের ফুল রেকর্ডিং শীঘ্রই এখানে যুক্ত করা হবে।
                </p>
              )}
            </div>
          )}

          {/* Credentials Box (if ID or Passcode exist) */}
          {(meta.meetingId || meta.passcode) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {meta.meetingId && (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Meeting ID</span>
                    <p className="font-mono text-base font-bold text-foreground">{meta.meetingId}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => copyToClipboard(meta.meetingId!, "Meeting ID")}
                  >
                    {copiedField === "Meeting ID" ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              )}

              {meta.passcode && (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Passcode / Password</span>
                    <p className="font-mono text-base font-bold text-foreground">{meta.passcode}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => copyToClipboard(meta.passcode!, "Passcode")}
                  >
                    {copiedField === "Passcode" ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Description / Agenda */}
          {meta.description && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Info className="h-4 w-4 text-primary" />
                ক্লাসের এজেন্ডা ও বিবরণ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {meta.description}
              </p>
            </div>
          )}

          {/* Live Class Rules & Etiquette */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              লাইভ ক্লাসের নিয়মাবলী ও প্রস্তুতি
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ক্লাস শুরুর ৫ মিনিট আগেই মিটিং লিংকে প্রবেশ করুন।
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ক্লাসরুমে প্রবেশের পর মাইক্রোফোন মিউট রাখুন এবং শিক্ষকের নির্দেশমতো প্রশ্ন করুন।
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                নোট নেওয়ার জন্য খাতা ও কলম সাথে রাখুন।
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                কোনো ইন্টারনেট বিঘ্ন ঘটলে লিংকটি রিফ্রেশ করে পুনরায় যুক্ত হন।
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

