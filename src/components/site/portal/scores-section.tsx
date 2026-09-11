"use client";

import { BarChart3, Headphones, Mic, PenLine, Target, BookOpen, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reveal } from "@/components/site/reveal";
import type { PortalMock, PortalStudent } from "@/lib/portal-store";

const moduleMeta = [
  { key: "listening" as const, label: "Listening", icon: Headphones },
  { key: "reading" as const, label: "Reading", icon: BookOpen },
  { key: "writing" as const, label: "Writing", icon: PenLine },
  { key: "speaking" as const, label: "Speaking", icon: Mic },
];

function bandBarColor(band: number): string {
  if (band >= 7.5) return "bg-emerald-500/80";
  if (band >= 6.5) return "bg-gold-gradient";
  return "bg-amber-500/70";
}

export function ScoresSection({
  mocks,
  student,
}: {
  mocks: PortalMock[];
  student: PortalStudent;
}) {
  const latest = mocks.length > 0 ? mocks[mocks.length - 1] : null;
  const target = student.targetBand ? Number(student.targetBand) : null;
  const toTarget =
    latest && target !== null && !Number.isNaN(target)
      ? Math.round((target - latest.overall) * 10) / 10
      : null;
  const bestOverall = mocks.length > 0 ? Math.max(...mocks.map((m) => m.overall)) : null;

  if (!latest) {
    return (
      <Reveal>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-primary/25 bg-card/60 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-7 w-7 text-primary" aria-hidden />
          </span>
          <p className="font-display text-lg font-bold text-foreground">No mock results yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            প্রতি বৃহস্পতিবারের ফুল-লেন্থ mock test-এ অংশ নিলে এখানে আপনার band report দেখা যাবে।
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="space-y-6">
      {/* Latest band + module breakdown */}
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Reveal y={12}>
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-primary/25 bg-gradient-to-br from-[#33290f] via-[#1d1808] to-[#141419] p-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">{latest.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{latest.date}</p>
            <p className="mt-4 font-display text-6xl font-bold leading-none text-gold-gradient">
              {latest.overall.toFixed(1)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">Overall band</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {toTarget !== null ? (
                toTarget <= 0 ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  >
                    <Trophy className="mr-1 h-3 w-3" aria-hidden />
                    Target {student.targetBand} achieved!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                    <Target className="mr-1 h-3 w-3" aria-hidden />
                    {toTarget.toFixed(1)} band to go — target {student.targetBand}
                  </Badge>
                )
              ) : null}
              {bestOverall !== null && bestOverall > latest.overall ? (
                <Badge variant="outline" className="border-border text-muted-foreground">
                  Best {bestOverall.toFixed(1)}
                </Badge>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal y={12} delay={0.05}>
          <div className="h-full rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Module Breakdown</h2>
            <p className="mt-1 text-xs text-muted-foreground">{latest.label} · {latest.date}</p>
            <div className="mt-5 space-y-4">
              {moduleMeta.map(({ key, label, icon: Icon }) => {
                const band = latest[key];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                        </span>
                        {label}
                      </span>
                      <span className="font-display font-bold text-foreground">{band.toFixed(1)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className={`h-full rounded-full ${bandBarColor(band)}`}
                        style={{ width: `${(band / 9) * 100}%` }}
                        role="progressbar"
                        aria-label={`${label} band ${band}`}
                        aria-valuenow={band}
                        aria-valuemin={0}
                        aria-valuemax={9}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Trend */}
      <Reveal y={12} delay={0.05}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Progress Trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">প্রতিটি mock-এর overall band — ধারাবাহিক উন্নতিই লক্ষ্য।</p>
          <div className="mt-5 space-y-3.5">
            {mocks.map((m, i) => {
              const prev = i > 0 ? mocks[i - 1] : null;
              const delta = prev ? Math.round((m.overall - prev.overall) * 10) / 10 : null;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground sm:w-32">
                    {m.label}
                    <span className="block text-[10px] text-muted-foreground/70">{m.date}</span>
                  </span>
                  <div className="h-5 flex-1 overflow-hidden rounded-lg bg-primary/10">
                    <div
                      className={`flex h-full items-center justify-end rounded-lg pr-2 ${bandBarColor(m.overall)}`}
                      style={{ width: `${Math.max((m.overall / 9) * 100, 14)}%` }}
                    >
                      <span className="text-[10px] font-bold text-[#16120a]">{m.overall.toFixed(1)}</span>
                    </div>
                  </div>
                  {delta !== null && delta > 0 ? (
                    <Badge
                      variant="outline"
                      className="shrink-0 border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-400"
                    >
                      +{delta.toFixed(1)}
                    </Badge>
                  ) : (
                    <span className="w-[52px] shrink-0" aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Full results table */}
      <Reveal y={12} delay={0.05}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">All Mock Results</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-[#0d0d11] hover:bg-[#0d0d11]">
                  {["Mock", "Date", "Listening", "Reading", "Writing", "Speaking", "Overall"].map((h) => (
                    <TableHead key={h} className="whitespace-nowrap text-xs uppercase tracking-wider text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...mocks].reverse().map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap font-medium text-foreground">{m.label}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{m.date}</TableCell>
                    <TableCell>{m.listening.toFixed(1)}</TableCell>
                    <TableCell>{m.reading.toFixed(1)}</TableCell>
                    <TableCell>{m.writing.toFixed(1)}</TableCell>
                    <TableCell>{m.speaking.toFixed(1)}</TableCell>
                    <TableCell className="font-display font-bold text-primary">{m.overall.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
