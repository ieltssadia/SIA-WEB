"use client";

import {
  BarChart3,
  BookOpen,
  Headphones,
  Lightbulb,
  Mic,
  PenLine,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
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
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import { bnNum } from "@/components/site/portal/portal-utils";
import type { PortalMock } from "@/lib/portal-store";

const moduleMeta = [
  { key: "listening" as const, label: "Listening", icon: Headphones },
  { key: "reading" as const, label: "Reading", icon: BookOpen },
  { key: "writing" as const, label: "Writing", icon: PenLine },
  { key: "speaking" as const, label: "Speaking", icon: Mic },
];

/** One actionable coaching tip per module — production EdTech insight, not filler. */
const moduleTips: Record<(typeof moduleMeta)[number]["key"], string> = {
  listening: "প্রতিদিন ২০ মিনিট Cambridge audio শুনুন — dictation প্র্যাকটিসে spelling লস কমবে।",
  reading: "Skimming-এ প্যাসেজ পড়ে প্রশ্নের ধরন অনুযায়ী scan করুন — সময় বাঁচবে ৫–৭ মিনিট।",
  writing: "Task 2-এর structure bank ফলো করুন আর প্রতি রিভিউতে feedback-এর পয়েন্ট ঠিক করুন।",
  speaking: "প্রতিদিন ১টি cue card রেকর্ড করে নিজের কথা শুনুন — fluency আর filler দুটোই ধরা পড়বে।",
};

function bandBarColor(band: number): string {
  if (band >= 7.5) return "bg-[#225941]";
  if (band >= 6.5) return "bg-primary";
  return "bg-amber-600";
}

/* ── Radar chart: module balance across the four skills ─────────────────── */

const RADAR_SIZE = 240;
const RADAR_C = RADAR_SIZE / 2;
const RADAR_R = 84;

function radarPoint(index: number, value: number): { x: number; y: number } {
  const angle = (Math.PI / 2) * index - Math.PI / 2; // 0=top, 1=right, 2=bottom, 3=left
  const r = (Math.min(Math.max(value, 0), 9) / 9) * RADAR_R;
  return {
    x: RADAR_C + r * Math.cos(angle),
    y: RADAR_C + r * Math.sin(angle),
  };
}

function ModuleRadar({ mock }: { mock: PortalMock }) {
  const values = [mock.listening, mock.reading, mock.writing, mock.speaking];
  const poly = values
    .map((v, i) => {
      const p = radarPoint(i, v);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
      role="img"
      aria-label={`Module balance — Listening ${mock.listening}, Reading ${mock.reading}, Writing ${mock.writing}, Speaking ${mock.speaking}`}
      className="mx-auto h-auto w-full max-w-[260px]"
    >
      {/* grid rings at band 3 / 6 / 9 */}
      {[3, 6, 9].map((band) => (
        <polygon
          key={band}
          points={moduleMeta
            .map((_, i) => {
              const p = radarPoint(i, band);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ")}
          fill={band === 9 ? "rgba(217,183,92,0.04)" : "none"}
          stroke="rgba(217,183,92,0.22)"
          strokeWidth="1"
        />
      ))}
      {/* spokes */}
      {moduleMeta.map((_, i) => {
        const p = radarPoint(i, 9);
        return (
          <line
            key={i}
            x1={RADAR_C}
            y1={RADAR_C}
            x2={p.x}
            y2={p.y}
            stroke="rgba(217,183,92,0.16)"
            strokeWidth="1"
          />
        );
      })}
      {/* value polygon */}
      <polygon points={poly} fill="rgba(217,183,92,0.18)" stroke="#d9b75c" strokeWidth="2" />
      {/* dots */}
      {values.map((v, i) => {
        const p = radarPoint(i, v);
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#d9b75c" stroke="#15120b" strokeWidth="1.5" />;
      })}
      {/* axis labels */}
      {moduleMeta.map(({ label }, i) => {
        const p = radarPoint(i, 11.1);
        return (
          <text
            key={label}
            x={p.x}
            y={p.y}
            textAnchor={i === 1 ? "start" : i === 3 ? "end" : "middle"}
            dominantBaseline={i === 0 ? "auto" : i === 2 ? "hanging" : "middle"}
            fontSize="10.5"
            fontWeight="600"
            fill="#c6b995"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function ScoresSection({
  mocks,
  targetBand,
}: {
  mocks: PortalMock[];
  targetBand: string | null;
}) {
  const latest = mocks.length > 0 ? mocks[mocks.length - 1] : null;
  const target = targetBand ? Number(targetBand) : null;
  const toTarget =
    latest && target !== null && !Number.isNaN(target)
      ? Math.round((target - latest.overall) * 10) / 10
      : null;
  const bestOverall = mocks.length > 0 ? Math.max(...mocks.map((m) => m.overall)) : null;
  const first = mocks.length > 0 ? mocks[0] : null;

  // Weakest module in the latest mock → coaching tip
  const weakest =
    latest
      ? moduleMeta.reduce((min, m) => (latest[m.key] < latest[min.key] ? m : min), moduleMeta[0])
      : null;

  if (!latest) {
    return (
      <div className="space-y-6">
        <Reveal y={12}>
          <PortalSectionHeader
            eyebrow="Progress Report"
            title="মক স্কোর"
            desc="প্রতিটি mock test-এর বিস্তারিত band report, মডিউল বিশ্লেষণ আর ট্রেন্ড — সব এখানে।"
          />
        </Reveal>
        <Reveal y={12} delay={0.03}>
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-muted/50 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-7 w-7 text-primary" aria-hidden />
            </span>
            <p className="font-display text-lg font-bold text-foreground">এখনো কোনো মক রেজাল্ট নেই</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              প্রতি বৃহস্পতিবারের ফুল-লেন্থ mock test-এ অংশ নিলে এখানে আপনার band report দেখা যাবে।
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          eyebrow="Progress Report"
          title="মক স্কোর"
          desc="প্রতিটি mock test-এর বিস্তারিত band report, মডিউল বিশ্লেষণ আর ট্রেন্ড — সব এখানে।"
          action={
            <Badge variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {bnNum(mocks.length)} টি মক
            </Badge>
          }
        />
      </Reveal>

      {/* Latest band + module balance */}
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Reveal y={12}>
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d9b75c]">{latest.label}</p>
            <p className="mt-1 text-xs text-[#c6b995]">{latest.date}</p>
            <p className="mt-4 font-display text-6xl font-bold leading-none text-[#d9b75c]">
              {bnNum(latest.overall.toFixed(1))}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wider text-[#c6b995]">Overall band</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {toTarget !== null ? (
                toTarget <= 0 ? (
                  <Badge
                    variant="outline"
                    className="border-[#2e7d5b]/40 bg-[#2e7d5b]/10 text-[#529b78]"
                  >
                    <Trophy className="mr-1 h-3 w-3" aria-hidden />
                    টার্গেট {bnNum(targetBand)} অর্জিত!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-white/10 bg-white/10 text-[#e4d5ae]">
                    <Target className="mr-1 h-3 w-3" aria-hidden />
                    টার্গেট {bnNum(targetBand)}-এর জন্য {bnNum(toTarget.toFixed(1))} ব্যান্ড বাকি
                  </Badge>
                )
              ) : null}
              {bestOverall !== null && bestOverall > latest.overall ? (
                <Badge variant="outline" className="border-white/10 bg-white/10 text-[#e4d5ae]">
                  সেরা {bnNum(bestOverall.toFixed(1))}
                </Badge>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal y={12} delay={0.05}>
          <div className="h-full rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">মডিউল ব্রেকডাউন</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {latest.label} · {latest.date}
                </p>
              </div>
              {first && mocks.length > 1 ? (
                <Badge variant="outline" className="border-[#28694d]/40 bg-[#2e7d5b]/10 text-[#225941]">
                  <TrendingUp className="mr-1 h-3 w-3" aria-hidden />
                  শুরু থেকে {bnNum((latest.overall - first.overall).toFixed(1))}↑
                </Badge>
              ) : null}
            </div>

            <div className="mt-5 grid items-center gap-6 lg:grid-cols-[260px_1fr]">
              <ModuleRadar mock={latest} />
              <div className="space-y-4">
                {moduleMeta.map(({ key, label, icon: Icon }) => {
                  const band = latest[key];
                  const delta =
                    first && mocks.length > 1
                      ? Math.round((band - first[key]) * 10) / 10
                      : null;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                          </span>
                          {label}
                        </span>
                        <span className="flex items-center gap-2">
                          {delta !== null && delta !== 0 ? (
                            <span
                              className={`text-[10px] font-bold ${
                                delta > 0 ? "text-[#225941]" : "text-amber-700"
                              }`}
                            >
                              {delta > 0 ? `+${bnNum(delta.toFixed(1))}` : bnNum(delta.toFixed(1))}
                            </span>
                          ) : null}
                          <span className="font-display font-bold text-foreground">
                            {bnNum(band.toFixed(1))}
                          </span>
                        </span>
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
          </div>
        </Reveal>
      </div>

      {/* Coaching insight — weakest module */}
      {weakest ? (
        <Reveal y={12} delay={0.03}>
          <div className="flex items-start gap-3.5 rounded-3xl border border-[#d9b75c]/30 bg-[#d9b75c]/[0.07] p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/15">
              <Lightbulb className="h-5 w-5 text-[#8a7a4d]" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                কোচিং টিপ — {weakest.label} এই মাসের ফোকাস
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{moduleTips[weakest.key]}</p>
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* Trend */}
      <Reveal y={12} delay={0.05}>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">প্রোগ্রেস ট্রেন্ড</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            প্রতিটি mock-এর overall band — ধারাবাহিক উন্নতিই লক্ষ্য।
          </p>
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
                      <span className="text-[10px] font-bold text-white">{bnNum(m.overall.toFixed(1))}</span>
                    </div>
                  </div>
                  {delta !== null && delta > 0 ? (
                    <Badge
                      variant="outline"
                      className="shrink-0 border-[#28694d]/40 bg-[#2e7d5b]/10 text-[10px] text-[#225941]"
                    >
                      +{bnNum(delta.toFixed(1))}
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
          <h2 className="font-display text-lg font-bold text-foreground">সব মক রেজাল্ট</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-muted/50 hover:bg-muted/50">
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
                    <TableCell>{bnNum(m.listening.toFixed(1))}</TableCell>
                    <TableCell>{bnNum(m.reading.toFixed(1))}</TableCell>
                    <TableCell>{bnNum(m.writing.toFixed(1))}</TableCell>
                    <TableCell>{bnNum(m.speaking.toFixed(1))}</TableCell>
                    <TableCell className="font-display font-bold text-primary">
                      {bnNum(m.overall.toFixed(1))}
                    </TableCell>
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
