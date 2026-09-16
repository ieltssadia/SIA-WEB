"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, Info, Loader2, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveClassroom, type LiveIdentity } from "@/components/site/live-classroom";
import { LiveGate } from "@/components/site/live-gate";
import type { LiveClassDetail } from "@/lib/live-types";

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
 * #/live/<slug> — portal-only. Enrolled students pass the auth gate, then the
 * join gate (name + teacher host key) into the real-time classroom. Class
 * metadata comes from /api/live-classes/<slug>.
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
  const [identity, setIdentity] = useState<LiveIdentity | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/live-classes/${slug}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.ok) setMeta(json.class as LiveClassDetail);
        else setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-2xl font-bold">ক্লাসটি খুঁজে পাওয়া যায়নি</p>
        <p className="mt-2 text-sm text-muted-foreground">
          লিংকটি পুরোনো হতে পারে — লাইভ হাব থেকে বর্তমান ক্লাসগুলো দেখুন।
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

  if (identity) {
    return <LiveClassroom classMeta={meta} identity={identity} />;
  }

  return <JoinGate meta={meta} onJoin={setIdentity} />;
}

function JoinGate({ meta, onJoin }: { meta: LiveClassDetail; onJoin: (identity: LiveIdentity) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [hostKey, setHostKey] = useState("");
  const [nameError, setNameError] = useState(false);
  const [gateOpen, setGateOpen] = useState(meta.status !== "ended");

  const join = () => {
    const n = name.trim();
    if (!n) {
      setNameError(true);
      return;
    }
    try {
      localStorage.setItem("sie-live-name", n);
    } catch {
      /* storage unavailable — fine */
    }
    onJoin({ name: n, role, hostKey: role === "teacher" ? hostKey.trim() : undefined });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-primary/15 bg-card p-6 shadow-[0_20px_60px_rgba(30,27,20,0.16)] sm:p-8">
        {/* Status chip */}
        <div className="mb-4">
          {meta.status === "live" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              লাইভ চলছে
            </span>
          ) : meta.status === "ended" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ক্লাস শেষ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Radio className="h-3 w-3" aria-hidden />
              আসন্ন
            </span>
          )}
        </div>

        <h1 className="font-display text-2xl font-bold leading-snug">{meta.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {meta.teacher} · {dhakaFull.format(new Date(meta.startsAt))} (Dhaka)
        </p>
        {meta.description ? (
          <p className="mt-3 text-sm leading-relaxed text-foreground/75">{meta.description}</p>
        ) : null}

        {meta.status === "ended" && !gateOpen ? (
          <div className="mt-6 rounded-xl border border-border bg-muted/50 px-4 py-5 text-center">
            <p className="text-sm text-muted-foreground">
              এই ক্লাস শেষ হয়ে গেছে — রেকর্ডিং শীঘ্রই স্টুডেন্ট পোর্টালে যুক্ত হবে।
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="rounded-full bg-ink font-semibold text-white hover:opacity-85">
                <a href="#/live">লাইভ হাবে ফিরে যান</a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setGateOpen(true)}
              >
                শিক্ষক হিসেবে ঢুকুন
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              join();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="join-name" className="text-sm">
                আপনার নাম
              </Label>
              <Input
                id="join-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                placeholder="যেমন: রাফি আহমেদ"
                aria-invalid={nameError}
                maxLength={40}
                className="h-11 border-input bg-muted/50"
              />
              {nameError ? (
                <p role="alert" className="text-xs text-destructive">
                  ক্লাসরুমে ঢুকতে নাম লিখুন।
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">ভূমিকা</Label>
              <Tabs value={role} onValueChange={(v) => setRole(v as "student" | "teacher")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student" className="gap-1.5 data-[state=active]:text-primary">
                    <GraduationCap className="h-4 w-4" aria-hidden />
                    স্টুডেন্ট
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="gap-1.5 data-[state=active]:text-primary">
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    শিক্ষক (Host)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {role === "teacher" ? (
              <div className="space-y-1.5">
                <Label htmlFor="join-hostkey" className="text-sm">
                  Host key
                </Label>
                <Input
                  id="join-hostkey"
                  value={hostKey}
                  onChange={(e) => setHostKey(e.target.value)}
                  placeholder="শিক্ষকের host key"
                  className="h-11 border-input bg-muted/50 font-mono"
                  autoComplete="off"
                />
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
                  Host key শুধু শিক্ষকের জন্য — ক্লাসে জয়েন করতে "স্টুডেন্ট" সিলেক্ট করে সরাসরি ঢুকুন।
                </p>
              </div>
            ) : null}

            <Button type="submit" className="h-11 w-full rounded-full bg-ink font-bold text-white hover:opacity-85">
              {meta.status === "live" ? "লাইভ ক্লাসে জয়েন করুন" : "ওয়েটিং রুমে ঢুকুন"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              আপনার নাম শুধু এই ক্লাসরুমের অংশগ্রহণকারীরা দেখবে।
            </p>
          </form>
        )}
      </div>

      <div className="mt-5 text-center">
        <a href="#/live" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          সব লাইভ ক্লাস
        </a>
      </div>
    </div>
  );
}
