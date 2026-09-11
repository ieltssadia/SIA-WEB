"use client";

import Image from "next/image";

/**
 * Trust strip above the footer — mirrors the real sadiasielts.com partner band:
 * Sadia's IELTS | IDP IELTS | British Council (grayscale until hovered).
 */

function IdpIeltsLogo() {
  return (
    <span className="flex items-center gap-2" aria-hidden>
      {/* idp pinwheel flower — orange / green / blue petals */}
      <svg viewBox="0 0 44 44" className="h-9 w-9" role="img" aria-label="IDP logo">
        <ellipse cx="22" cy="12.5" rx="5.4" ry="9.5" fill="#F6871F" />
        <ellipse
          cx="22"
          cy="12.5"
          rx="5.4"
          ry="9.5"
          fill="#52AE30"
          transform="rotate(120 22 22)"
        />
        <ellipse
          cx="22"
          cy="12.5"
          rx="5.4"
          ry="9.5"
          fill="#009EE0"
          transform="rotate(240 22 22)"
        />
      </svg>
      <span className="text-3xl font-extrabold lowercase leading-none tracking-tight text-[#3D4548]">
        idp
      </span>
      <span className="mx-1 h-8 w-px bg-border" aria-hidden />
      <span className="text-3xl font-black leading-none tracking-tight text-[#D81E34]">
        IELTS
        <span className="align-super text-[10px] font-bold">™</span>
      </span>
    </span>
  );
}

function BritishCouncilLogo() {
  return (
    <span className="flex items-center gap-2.5" aria-hidden>
      {/* 2×2 dot grid mark */}
      <svg viewBox="0 0 44 44" className="h-9 w-9" role="img" aria-label="British Council logo">
        <circle cx="12" cy="12" r="8.5" fill="#8A8D8F" />
        <circle cx="32" cy="12" r="8.5" fill="#8A8D8F" />
        <circle cx="12" cy="32" r="8.5" fill="#8A8D8F" />
        <circle cx="32" cy="32" r="8.5" fill="#8A8D8F" />
      </svg>
      <span className="text-left text-[19px] font-extrabold uppercase leading-[1.05] tracking-wide text-[#575A5C]">
        British
        <br />
        Council
      </span>
    </span>
  );
}

export function PartnerStrip() {
  return (
    <section
      aria-label="Registration partners — IDP IELTS and British Council"
      className="border-t border-border bg-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-4 py-10 sm:flex-row sm:gap-14 lg:justify-between lg:gap-8 lg:px-8">
        {/* Sadia's IELTS */}
        <div className="flex items-center gap-3 opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
          <Image
            src="/sadia-logo.png"
            alt="Sadia's IELTS logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
          />
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-[#575A5C]">
              Sadia&apos;s
            </span>
            <span className="block text-2xl font-black uppercase tracking-wide text-[#575A5C]">
              IELTS
            </span>
          </span>
        </div>

        {/* IDP IELTS */}
        <div className="opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
          <IdpIeltsLogo />
        </div>

        {/* British Council */}
        <div className="opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
          <BritishCouncilLogo />
        </div>
      </div>
    </section>
  );
}
