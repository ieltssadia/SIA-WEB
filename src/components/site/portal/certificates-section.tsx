"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Download,
  FileCheck2,
  FileDown,
  GraduationCap,
  Lock,
  Printer,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { PortalSectionHeader } from "@/components/site/portal/portal-shell";
import type { PortalCertificate, PortalEnrollment } from "@/lib/portal-store";

/* ------------------------------------------------------------------ */
/*  Certificate — canvas PNG renderer + print                          */
/* ------------------------------------------------------------------ */

/**
 * Resolve the real registered family names behind next/font CSS variables,
 * so the canvas can draw with the exact brand fonts (Bricolage display,
 * Urbanist UI, Hind Siliguri Bengali). The variables are declared on <body>
 * (see layout.tsx), and next/font exposes a fallback stack — the canvas
 * needs the single primary family name.
 */
function fontFamilyVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const read = (el: HTMLElement | null) =>
    el ? getComputedStyle(el).getPropertyValue(name).trim() : "";
  const value = read(document.body) || read(document.documentElement);
  if (!value) return fallback;
  return (
    value
      .split(",")[0]
      .trim()
      .replace(/^['"]|['"]$/g, "") || fallback
  );
}

function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  spacing: number
) {
  const chars = [...text];
  const total = chars.reduce((n, c) => n + ctx.measureText(c).width + spacing, -spacing);
  let x = cx - total / 2;
  for (const c of chars) {
    ctx.fillText(c, x, y);
    x += ctx.measureText(c).width + spacing;
  }
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = color;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  display: string
) {
  ctx.save();
  // outer rings
  ctx.strokeStyle = "#d9b75c";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
  ctx.stroke();
  // gold fill + inner face
  ctx.fillStyle = "#d9b75c";
  ctx.beginPath();
  ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#171410";
  ctx.font = `800 ${Math.round(r * 0.62)}px "${display}", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", cx, cy - r * 0.06);
  ctx.font = `600 ${Math.round(r * 0.135)}px "Urbanist", Arial, sans-serif`;
  ctx.fillStyle = "#171410";
  ctx.fillText("SIE · EST 2016", cx, cy + r * 0.36);
  ctx.restore();
}

async function renderCertificate(cert: PortalCertificate): Promise<string> {
  await document.fonts.ready;
  const display = fontFamilyVar("--font-bricolage", "Georgia");
  const ui = fontFamilyVar("--font-urbanist", "Arial");
  const bengali = fontFamilyVar("--font-hind-siliguri", "sans-serif");

  const W = 1754;
  const H = 1240;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const cx = W / 2;
  const CENTER = "center";

  // Paper
  ctx.fillStyle = "#faf6ec";
  ctx.fillRect(0, 0, W, H);

  // Faint watermark monogram
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.fillStyle = "#b3944a";
  ctx.font = `800 760px "${display}", Georgia, serif`;
  ctx.textAlign = CENTER;
  ctx.textBaseline = "middle";
  ctx.fillText("S", cx, H / 2 + 40);
  ctx.restore();

  // Double border + corner diamonds
  ctx.strokeStyle = "#d9b75c";
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "#b3944a";
  ctx.strokeRect(52, 52, W - 104, H - 104);
  for (const [x, y] of [
    [34, 34],
    [W - 34, 34],
    [34, H - 34],
    [W - 34, H - 34],
  ]) {
    drawDiamond(ctx, x, y, 13, "#b3944a");
    drawDiamond(ctx, x, y, 6.5, "#faf6ec");
  }

  ctx.textBaseline = "alphabetic";

  // Header — brand
  ctx.fillStyle = "#b3944a";
  ctx.textAlign = CENTER;
  ctx.font = `700 40px "${display}", Georgia, serif`;
  drawSpaced(ctx, "SADIA'S IELTS", cx, 148, 12);
  ctx.fillStyle = "#6d6552";
  ctx.font = `500 21px "${ui}", Arial, sans-serif`;
  drawSpaced(ctx, "SREEMANGAL · SYLHET · BANGLADESH", cx, 190, 5);

  // Divider
  ctx.strokeStyle = "#d9b75c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 240, 232);
  ctx.lineTo(cx - 28, 232);
  ctx.moveTo(cx + 28, 232);
  ctx.lineTo(cx + 240, 232);
  ctx.stroke();
  drawDiamond(ctx, cx, 232, 9, "#d9b75c");

  // Title
  ctx.fillStyle = "#171410";
  ctx.font = `800 92px "${display}", Georgia, serif`;
  drawSpaced(ctx, "CERTIFICATE", cx, 346, 10);
  ctx.fillStyle = "#8a7a4d";
  ctx.font = `600 30px "${ui}", Arial, sans-serif`;
  drawSpaced(ctx, "OF  ACHIEVEMENT", cx, 396, 9);

  // Bengali recognition line
  ctx.fillStyle = "#5c5647";
  ctx.font = `400 30px "${bengali}", sans-serif`;
  ctx.fillText("কোর্স সফলভাবে সম্পন্ন করায় এই স্বীকৃতি প্রদান করা হচ্ছে", cx, 462);

  // Presented to
  ctx.fillStyle = "#6d6552";
  ctx.font = `italic 400 28px "${ui}", Arial, sans-serif`;
  ctx.fillText("presented to", cx, 524);

  // Name + flourish
  ctx.fillStyle = "#171410";
  ctx.font = `700 96px "${display}", Georgia, serif`;
  ctx.fillText(cert.name, cx, 636);
  ctx.strokeStyle = "#d9b75c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 210, 668);
  ctx.lineTo(cx + 210, 668);
  ctx.stroke();
  drawDiamond(ctx, cx, 668, 8, "#d9b75c");

  // Course + batch
  ctx.fillStyle = "#26221b";
  ctx.font = `600 44px "${display}", Georgia, serif`;
  ctx.fillText(`${cert.course}  ·  ${cert.batch}`, cx, 746);

  // Band line
  ctx.fillStyle = "#5c5647";
  ctx.font = `400 30px "${ui}", Arial, sans-serif`;
  ctx.fillText("achieving an overall band score of", cx, 806);
  ctx.fillStyle = "#b3944a";
  ctx.font = `800 66px "${display}", Georgia, serif`;
  ctx.fillText(cert.band, cx, 878);

  // Footer row: date — seal — signature
  ctx.textAlign = "left";
  ctx.fillStyle = "#171410";
  ctx.font = `600 26px "${ui}", Arial, sans-serif`;
  ctx.fillText(`Issued on ${cert.issued}`, 150, 1005);
  ctx.fillStyle = "#6d6552";
  ctx.font = `500 20px "${ui}", Arial, sans-serif`;
  ctx.fillText("Date of issue", 150, 1038);

  drawSeal(ctx, cx, 1020, 86, display);

  ctx.textAlign = "right";
  ctx.fillStyle = "#171410";
  ctx.font = `italic 600 44px Georgia, serif`;
  ctx.fillText("Sadia Islam", W - 150, 1005);
  ctx.strokeStyle = "#a89b78";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(W - 470, 1026);
  ctx.lineTo(W - 150, 1026);
  ctx.stroke();
  ctx.fillStyle = "#6d6552";
  ctx.font = `500 20px "${ui}", Arial, sans-serif`;
  ctx.fillText("Founder & Lead Instructor", W - 150, 1056);

  // Verification footer
  ctx.textAlign = CENTER;
  ctx.fillStyle = "#8a8168";
  ctx.font = `500 22px "${ui}", Arial, sans-serif`;
  ctx.fillText(
    `Certificate ID: ${cert.id}   ·   verify at sadiasielts.com/#/verify`,
    cx,
    1136
  );

  return canvas.toDataURL("image/png");
}

function downloadCertificate(cert: PortalCertificate, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${cert.id}-${cert.name.replace(/\s+/g, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function printCertificate(dataUrl: string) {
  const win = window.open("", "_blank", "width=1140,height=800");
  if (!win) return;
  win.document.write(
    `<!doctype html><html><head><title>Sadia's IELTS Certificate</title>
     <style>@page{size:A4 landscape;margin:0}html,body{margin:0;height:100%;background:#fff;
     display:flex;align-items:center;justify-content:center}img{max-width:97vw;max-height:97vh}
     </style></head><body><img src="${dataUrl}"
     onload="setTimeout(function(){window.focus();window.print();},200)"></body></html>`
  );
  win.document.close();
}

/* ------------------------------------------------------------------ */
/*  Earned certificate card                                            */
/* ------------------------------------------------------------------ */

function CertificateCard({ cert }: { cert: PortalCertificate }) {
  const [busy, setBusy] = useState<"png" | "print" | null>(null);

  async function handle(action: "png" | "print") {
    try {
      setBusy(action);
      const dataUrl = await renderCertificate(cert);
      if (action === "png") downloadCertificate(cert, dataUrl);
      else printCertificate(dataUrl);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-6 md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-radial-glow blur-2xl"
      />
      {/* Ornamental double border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-2xl border border-[#d9b75c]/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 rounded-[14px] border border-[#d9b75c]/15"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        {/* Seal */}
        <div className="flex shrink-0 flex-col items-center gap-2 md:w-40">
          <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brand-gradient shadow-[0_0_0_8px_rgba(217,183,92,0.12)]">
            <span className="absolute inset-2 rounded-full border border-white/40" aria-hidden />
            <span className="font-display text-5xl font-bold text-[#171410]">S</span>
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c6b995]">
            Official Seal
          </p>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 text-center md:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d9b75c] md:justify-start">
            <Award className="h-4 w-4" aria-hidden />
            Certificate of Achievement
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-[#f6ecd4] md:text-3xl">
            {cert.name}
          </h2>
          <p className="mt-1 text-sm text-[#c6b995]">
            {cert.course} · {cert.batch}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Badge className="bg-gold-gradient font-display text-sm font-bold text-ink hover:bg-gold-gradient">
              Band {cert.band}
            </Badge>
            <Badge
              variant="outline"
              className="border-white/15 bg-white/5 font-mono text-xs text-[#e4d5ae]"
            >
              {cert.id}
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-xs text-[#e4d5ae]">
              Issued {cert.issued}
            </Badge>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
            <Button
              onClick={() => handle("png")}
              disabled={busy !== null}
              className="h-10 rounded-full bg-[#d9b75c] px-5 font-bold text-ink transition-opacity hover:opacity-90"
            >
              {busy === "png" ? (
                <span className="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden />
              ) : (
                <Download className="mr-1.5 h-4 w-4" aria-hidden />
              )}
              ডাউনলোড (PNG)
            </Button>
            <Button
              onClick={() => handle("print")}
              disabled={busy !== null}
              variant="outline"
              className="h-10 rounded-full border-white/20 bg-transparent px-5 font-medium text-[#f6ecd4] hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <Printer className="mr-1.5 h-4 w-4" aria-hidden />
              প্রিন্ট / PDF
            </Button>
            {cert.fileUrl ? (
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-[#d9b75c]/40 bg-transparent px-5 font-semibold text-[#e4d5ae] hover:border-[#d9b75c] hover:bg-[#d9b75c]/10 hover:text-[#f0d894]"
              >
                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" download>
                  <FileDown className="mr-1.5 h-4 w-4" aria-hidden />
                  সার্টিফিকেট ডাউনলোড
                </a>
              </Button>
            ) : null}
            <a
              href="#/verify"
              className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-[#d9b75c] transition-colors hover:text-[#f0d894]"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              পাবলিক ভেরিফিকেশন
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Locked state — CSS certificate preview + requirement timeline      */
/* ------------------------------------------------------------------ */

/** Static CSS mock of the certificate behind a lock veil — a real preview. */
function CertificatePreview({ name, primary }: { name: string; primary: PortalEnrollment }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#211b10] via-[#15120b] to-[#16130c] p-5 md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-radial-glow blur-2xl"
      />
      <div className="relative">
        {/* Miniature certificate sheet */}
        <div
          aria-hidden
          className="relative select-none rounded-2xl border border-[#d9b75c]/50 bg-[#faf6ec] p-4 sm:p-6 md:p-8"
        >
          <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#b3944a]/30" aria-hidden />
          <div className="text-center">
            <p className="font-display text-[11px] font-bold tracking-[0.35em] text-[#b3944a] sm:text-xs">
              SADIA&apos;S IELTS
            </p>
            <p className="mt-3 font-display text-lg font-bold tracking-[0.18em] text-[#171410] sm:text-2xl md:text-3xl">
              CERTIFICATE
            </p>
            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.3em] text-[#8a7a4d] sm:text-[10px]">
              OF ACHIEVEMENT
            </p>
            <p className="mt-3 text-[10px] text-[#5c5647] sm:text-xs">
              কোর্স সফলভাবে সম্পন্ন করায় এই স্বীকৃতি প্রদান করা হচ্ছে
            </p>
            <p className="mt-4 font-display text-base font-bold text-[#171410] sm:text-xl md:text-2xl">
              {name}
            </p>
            <div className="mx-auto mt-2 h-px w-32 bg-[#d9b75c] sm:w-48" aria-hidden />
            <p className="mt-2.5 text-[10px] font-semibold text-[#26221b] sm:text-xs">
              {primary.batch}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 pb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b75c] font-display text-[11px] font-bold text-[#171410] sm:h-10 sm:w-10 sm:text-sm">
                S
              </span>
              <span className="hidden h-px w-16 bg-[#a89b78] sm:block" aria-hidden />
              <span className="font-display text-xs italic text-[#171410] sm:text-sm">
                Sadia Islam
              </span>
            </div>
          </div>
        </div>

        {/* Lock veil */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#171410]/55 backdrop-blur-[3px]">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b75c]/50 bg-[#171410]/80 shadow-[0_0_0_8px_rgba(217,183,92,0.1)]">
            <Lock className="h-6 w-6 text-[#d9b75c]" aria-hidden />
          </span>
          <p className="font-display text-base font-bold text-[#f6ecd4] sm:text-lg">
            প্রিভিউ (কোর্স শেষ করলেই আনলক হবে)
          </p>
          <p className="max-w-xs px-4 text-center text-xs leading-relaxed text-white/70">
            এটাই আপনার সার্টিফিকেটের নমুনা, নাম, কোর্স আর ব্যান্ড সহ। ১০০% সম্পন্ন হলে এখানেই
            ডাউনলোড আর প্রিন্ট বাটন যুক্ত হবে।
          </p>
        </div>
      </div>
    </div>
  );
}

/** Issue pipeline — steps light up as the student progresses. */
function IssueTimeline({ primary }: { primary: PortalEnrollment }) {
  const progress = primary.progress;
  const steps = [
    {
      icon: GraduationCap,
      title: "কোর্স ১০০% সম্পন্ন করুন",
      desc: `সব লেসন, অ্যাসাইনমেন্ট আর মক টেস্ট শেষ, এখন ${progress}%।`,
      done: progress >= 100,
      current: progress < 100,
    },
    {
      icon: FileCheck2,
      title: "ফাইনাল রিভিউ ও ভেরিফিকেশন",
      desc: "কোর্স শেষ করার পর টিম আপনার রেজাল্ট ও উপস্থিতি যাচাই করবে।",
      done: false,
      current: progress >= 100,
    },
    {
      icon: ScrollText,
      title: "সার্টিফিকেট ইস্যু",
      desc: "ভেরিফিকেশনের ৭ কর্মদিবসের মধ্যে আপনার নামে সার্টিফিকেট এই পেজে যোগ হবে।",
      done: false,
      current: false,
    },
    {
      icon: Download,
      title: "ডাউনলোড ও প্রিন্ট",
      desc: "PNG ডাউনলোড বা A4 প্রিন্ট, যেভাবে দরকার, সেভাবে ব্যবহার করুন।",
      done: false,
      current: false,
    },
  ];

  const activeIdx = steps.findIndex((s) => s.current);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-foreground">সার্টিফিকেট কীভাবে পাবেন</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        চার ধাপ, প্রতিটি শেষ হলে পরেরটা চালু হয়।
      </p>
      <ol className="mt-5 space-y-0">
        {steps.map(({ icon: Icon, title, desc, done, current }, i) => {
          const last = i === steps.length - 1;
          const reached = done || current;
          return (
            <li key={title} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector */}
              {!last ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 rounded-full",
                    done ? "bg-[#2e7d5b]/50" : "bg-border"
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  done
                    ? "border-[#2e7d5b]/40 bg-[#2e7d5b]/10 text-[#225941]"
                    : current
                      ? "border-[#d9b75c]/60 bg-[#d9b75c]/15 text-[#8a6720]"
                      : "border-border bg-muted/60 text-muted-foreground/60"
                )}
              >
                {done ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
              </span>
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    "flex flex-wrap items-center gap-2 text-sm font-semibold",
                    reached ? "text-foreground" : "text-muted-foreground/70"
                  )}
                >
                  {title}
                  {current && activeIdx >= 0 ? (
                    <Badge className="bg-gold-gradient text-[9px] font-bold uppercase tracking-wider text-ink hover:bg-gold-gradient">
                      চলবে
                    </Badge>
                  ) : null}
                  {done ? (
                    <Badge
                      variant="outline"
                      className="border-[#28694d]/40 bg-[#2e7d5b]/10 text-[9px] font-bold uppercase tracking-wider text-[#225941]"
                    >
                      সম্পন্ন
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Progress-to-unlock card with live numbers. */
function UnlockProgress({ primary }: { primary: PortalEnrollment }) {
  return (
    <div className="rounded-3xl border border-[#d9b75c]/30 bg-[#d9b75c]/[0.07] p-5">
      <h3 className="font-display text-base font-bold text-foreground">আনলক প্রোগ্রেস</h3>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <GraduationCap className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{primary.batch}</span>
        </span>
        <span className="shrink-0 font-display text-lg font-bold text-primary">
          {primary.progress}%
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#b3944a] to-[#d9b75c] transition-[width] duration-700"
          style={{ width: `${primary.progress}%` }}
          role="progressbar"
          aria-label={`Course progress ${primary.progress}%`}
          aria-valuenow={primary.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <ul className="mt-4 space-y-2 text-xs">
        <li className="flex items-center gap-2 text-muted-foreground">
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
              primary.progress >= 100 ? "bg-[#2e7d5b] text-white" : "border border-border"
            )}
            aria-hidden
          >
            {primary.progress >= 100 ? <CheckCircle2 className="h-3 w-3" /> : null}
          </span>
          কোর্স প্রোগ্রেস ১০০% {primary.progress >= 100 ? ", সম্পন্ন ✓" : `, এখন ${primary.progress}%`}
        </li>
        <li className="flex items-center gap-2 text-muted-foreground">
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
              primary.attendance >= 80 ? "bg-[#2e7d5b] text-white" : "border border-border"
            )}
            aria-hidden
          >
            {primary.attendance >= 80 ? <CheckCircle2 className="h-3 w-3" /> : null}
          </span>
          উপস্থিতি ট্র্যাক হচ্ছে, এখন {primary.attendance}%
        </li>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function CertificatesSection({
  userName,
  certificates,
  primary,
}: {
  userName: string;
  certificates: PortalCertificate[];
  primary: PortalEnrollment;
}) {
  const earned = certificates.length > 0;

  return (
    <div className="space-y-6">
      <Reveal y={12}>
        <PortalSectionHeader
          title="সার্টিফিকেট"
          desc={
            earned
              ? "অফিসিয়াল সার্টিফিকেট ডাউনলোড করুন বা প্রিন্ট করুন, প্রতিটি সার্টিফিকেটের ইউনিক ভেরিফিকেশন ID আছে।"
              : "কোর্স ১০০% সম্পন্ন করলে আপনার নামে অফিসিয়াল সার্টিফিকেট ইস্যু হবে, ডাউনলোড আর প্রিন্ট দুটোই করা যাবে।"
          }
          action={
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1.5 text-xs font-semibold",
                earned
                  ? "border-[#28694d]/40 bg-[#2e7d5b]/10 text-[#225941]"
                  : "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              <Award className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {earned ? `${certificates.length}টি ইস্যু হয়েছে` : "লকড"}
            </Badge>
          }
        />
      </Reveal>

      {earned ? (
        <>
          <Reveal y={12} delay={0.04}>
            <div className="space-y-6">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
            </div>
          </Reveal>

          {/* Keep the pipeline visible even after earning — next steps / re-verification */}
          <Reveal y={12} delay={0.08}>
            <div className="grid gap-6 lg:grid-cols-2">
              <IssueTimeline primary={primary} />
              <div className="flex flex-col gap-6">
                <UnlockProgress primary={primary} />
                <a
                  href="#/verify"
                  className="group flex items-center gap-3 rounded-3xl border border-border bg-card p-5 transition-colors hover:border-[#d9b75c]/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      নিয়োগদাতা সার্টিফিকেট যাচাই করতে চাইলে
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Certificate ID দিয়ে যে কেউ পাবলিক ভেরিফিকেশন পেজে মিলিয়ে নিতে পারবে।
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </div>
            </div>
          </Reveal>
        </>
      ) : (
        <>
          <Reveal y={12} delay={0.04}>
            <CertificatePreview name={userName} primary={primary} />
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal y={12} delay={0.08}>
              <IssueTimeline primary={primary} />
            </Reveal>
            <Reveal y={12} delay={0.12}>
              <div className="flex h-full flex-col gap-6">
                <UnlockProgress primary={primary} />
                <a
                  href="#/verify"
                  className="group flex items-center gap-3 rounded-3xl border border-border bg-card p-5 transition-colors hover:border-[#d9b75c]/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      পুরনো সার্টিফিকেট ভেরিফাই করতে চান?
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      আগের ব্যাচের সার্টিফিকেটও Certificate ID দিয়ে যাচাই করা যায়।
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </div>
            </Reveal>
          </div>
        </>
      )}
    </div>
  );
}
