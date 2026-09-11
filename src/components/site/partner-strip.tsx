"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";

/**
 * Trust strip above the footer — mirrors the real sadiasielts.com partner band
 * (Sadia's IELTS · IDP IELTS · British Council) but as a continuous marquee:
 * logos glide side by side, pause on hover, and reveal their brand colors.
 *
 * The band is data-driven — add/edit entries in PARTNERS below and the loop
 * (width, duration, aria list) adapts automatically. Nothing is hardcoded
 * in the layout itself.
 */

/* British Council brand purple, sampled from the real site's logo */
const BRITISH_COUNCIL_PURPLE = "#1B035B";

/* ---------------------------------- logos --------------------------------- */

function SadiasIeltsLogo() {
  return (
    <span className="flex items-center gap-3" aria-hidden>
      <Image
        src="/sadia-logo.png"
        alt=""
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
    </span>
  );
}

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
      {/* 2×2 dot grid mark — true brand purple (revealed on hover) */}
      <svg viewBox="0 0 44 44" className="h-9 w-9" role="img" aria-label="British Council logo">
        <circle cx="12" cy="12" r="8.5" fill={BRITISH_COUNCIL_PURPLE} />
        <circle cx="32" cy="12" r="8.5" fill={BRITISH_COUNCIL_PURPLE} />
        <circle cx="12" cy="32" r="8.5" fill={BRITISH_COUNCIL_PURPLE} />
        <circle cx="32" cy="32" r="8.5" fill={BRITISH_COUNCIL_PURPLE} />
      </svg>
      <span
        className="text-left text-[19px] font-extrabold uppercase leading-[1.05] tracking-wide"
        style={{ color: BRITISH_COUNCIL_PURPLE }}
      >
        British
        <br />
        Council
      </span>
    </span>
  );
}

/* ---------------------------------- data ---------------------------------- */

type Partner = {
  id: string;
  name: string;
  logo: ReactNode;
};

const PARTNERS: Partner[] = [
  { id: "sadias-ielts", name: "Sadia's IELTS", logo: <SadiasIeltsLogo /> },
  { id: "idp-ielts", name: "IDP IELTS", logo: <IdpIeltsLogo /> },
  { id: "british-council", name: "British Council", logo: <BritishCouncilLogo /> },
];

/* --------------------------------- marquee -------------------------------- */

/* Each half of the track repeats the partner set this many times so one half
   is always wider than the viewport (~3.2k px) — the loop stays truly endless
   with zero empty gap, even on ultrawide screens. */
const LOOP_REPEATS = 4;

export function PartnerStrip() {
  return (
    <section
      aria-label="Registration partners — IDP IELTS and British Council"
      className="overflow-hidden border-t border-border bg-white"
    >
      {/* Screen-reader list — the moving logos themselves are decorative */}
      <h2 className="sr-only">Our registration partners</h2>
      <ul className="sr-only">
        {PARTNERS.map((partner) => (
          <li key={partner.id}>{partner.name}</li>
        ))}
      </ul>

      <div
        className="partner-marquee py-10"
        style={{ "--marquee-duration": "26s" } as CSSProperties}
      >
        <div className="partner-marquee-track flex w-max items-center">
          {/* Two identical halves → translateX(-50%) loops seamlessly, 0 gap */}
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex items-center gap-16 pr-16 sm:gap-24 sm:pr-24"
            >
              {Array.from({ length: LOOP_REPEATS }, (_, set) =>
                PARTNERS.map((partner) => (
                  <li
                    key={`${set}-${partner.id}`}
                    title={partner.name}
                    className="partner-logo"
                  >
                    {partner.logo}
                  </li>
                ))
              )}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
