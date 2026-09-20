"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  Download,
  FileText,
  FolderDown,
  GraduationCap,
  Lock,
  Mic,
  PenLine,
  Printer,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import {
  portalDownloadCategories,
  portalDownloads,
  type PortalDownload,
} from "@/lib/site-data";
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
    `<!doctype html><html><head><title>Sadia's IELTS — Certificate</title>
     <style>@page{size:A4 landscape;margin:0}html,body{margin:0;height:100%;background:#fff;
     display:flex;align-items:center;justify-content:center}img{max-width:97vw;max-height:97vh}
     </style></head><body><img src="${dataUrl}"
     onload="setTimeout(function(){window.focus();window.print();},200)"></body></html>`
  );
  win.document.close();
}

/* ------------------------------------------------------------------ */
/*  Certificate spotlight card                                         */
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

/** No certificate yet — honest locked state with live progress. */
function CertificateLocked({ primary }: { primary: PortalEnrollment }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b75c]/40 bg-[#d9b75c]/10">
        <Lock className="h-6 w-6 text-[#8a7a4d]" aria-hidden />
      </span>
      <p className="font-display text-lg font-bold text-foreground">
        সার্টিফিকেট এখনো ইস্যু হয়নি
      </p>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        কোর্স ১০০% সম্পন্ন করলেই এখানে আপনার নামে অফিসিয়াল সার্টিফিকেট যোগ হবে —
        ডাউনলোড আর প্রিন্ট দুটোই করা যাবে।
      </p>
      <div className="mt-1 w-full max-w-xs rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{primary.batch}</span>
          </span>
          <span className="font-display font-bold text-primary">{primary.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full rounded-full bg-[#d9b75c]"
            style={{ width: `${primary.progress}%` }}
            role="progressbar"
            aria-label={`Course progress ${primary.progress}%`}
            aria-valuenow={primary.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      <a
        href="#/verify"
        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        পুরনো সার্টিফিকেট ভেরিফাই করতে চান?
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Downloads grid                                                     */
/* ------------------------------------------------------------------ */

const categoryIcon: Record<PortalDownload["category"], LucideIcon> = {
  writing: PenLine,
  speaking: Mic,
  vocabulary: BookOpenCheck,
  "mock-tools": FileText,
};

const categoryLabel: Record<PortalDownload["category"], string> = {
  writing: "Writing",
  speaking: "Speaking",
  vocabulary: "Vocabulary",
  "mock-tools": "Mock Tools",
};

function DownloadRow({ item }: { item: PortalDownload }) {
  const Icon = categoryIcon[item.category];
  return (
    <a
      href={item.href}
      download
      className="group flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-[#d9b75c]/60 hover:shadow-[0_2px_12px_rgba(217,183,92,0.15)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-[#d9b75c]/20">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {item.title}
        </span>
        <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
          {item.desc}
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-border/70 bg-muted/60 px-1.5 py-0 text-[9px] uppercase tracking-wide text-muted-foreground"
          >
            {categoryLabel[item.category]}
          </Badge>
          <span className="text-[10px] font-medium text-muted-foreground/80">
            {item.type} · {item.size}
          </span>
        </span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary transition-all group-hover:border-[#d9b75c] group-hover:bg-[#d9b75c] group-hover:text-ink">
        <Download className="h-4 w-4" aria-hidden />
      </span>
    </a>
  );
}

function DownloadsGrid() {
  const [category, setCategory] = useState<string>("all");

  const items = useMemo(
    () =>
      category === "all"
        ? portalDownloads
        : portalDownloads.filter((d) => d.category === category),
    [category]
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <FolderDown className="h-5 w-5 text-primary" aria-hidden />
            ডাউনলোড কর্নার
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            ক্লাসে বলা সব ম্যাটেরিয়ালস এখান থেকে সরাসরি ডাউনলোড করুন — কোনো রিকোয়েস্ট লাগবে না।
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
          {portalDownloads.length} files
        </Badge>
      </div>

      {/* Category filter */}
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter downloads by category">
        {portalDownloadCategories.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-[#d9b75c] bg-[#d9b75c] text-ink"
                  : "border-border bg-secondary text-secondary-foreground hover:border-[#d9b75c]/50 hover:text-primary"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <DownloadRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function ResourcesSection({
  certificates,
  primary,
}: {
  certificates: PortalCertificate[];
  primary: PortalEnrollment;
}) {
  return (
    <div className="space-y-6">
      <Reveal y={12}>
        {certificates.length > 0 ? (
          <div className="space-y-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <CertificateLocked primary={primary} />
        )}
      </Reveal>

      <Reveal y={12} delay={0.05}>
        <DownloadsGrid />
      </Reveal>

      {/* Hint strip */}
      <Reveal y={12} delay={0.08}>
        <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-[#d9b75c]/30 bg-[#d9b75c]/[0.07] p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9b75c]/15">
              <Sparkles className="h-5 w-5 text-[#8a7a4d]" aria-hidden />
            </span>
            <p className="text-sm leading-snug text-foreground">
              <span className="font-semibold">আরও প্র্যাকটিস লাগবে?</span> Cambridge
              লাইব্রেরিতে ১৯ বইয়ের ফুল প্র্যাকটিস টেস্ট আপনার জন্য খোলা।
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="h-9 shrink-0 rounded-full bg-[#d9b75c] font-bold text-ink hover:opacity-90"
          >
            <a href="#/cambridge">
              <BadgeCheck className="mr-1.5 h-4 w-4" aria-hidden />
              Cambridge Library
            </a>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
