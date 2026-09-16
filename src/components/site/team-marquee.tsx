"use client";

import Image from "next/image";
import { teamMembers } from "@/lib/site-data";
import { Reveal } from "@/components/site/reveal";

/**
 * Moving team strip — studio portraits drifting slowly left, pausing on
 * hover. Grayscale at rest, colour on hover (agency-style). Every card
 * links to the member's profile page (#/team/<slug>).
 */

function TeamCard({ member }: { member: (typeof teamMembers)[number] }) {
  return (
    <a
      href={`#/team/${member.slug}`}
      aria-label={`${member.name} — ${member.role}`}
      className="group relative mx-3 block w-52 shrink-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_14px_40px_rgba(30,27,20,0.10)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_22px_56px_rgba(30,27,20,0.18)] sm:w-60"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 208px, 240px"
          className="object-cover grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
        />
        {/* Name plate — solid card, like the highlighted card in the reference */}
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/40 bg-white/95 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(30,27,20,0.14)] backdrop-blur transition-colors duration-300 group-hover:bg-forest/90">
          <p className="font-display text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-[#f6ecd4]">
            {member.name}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-[#d9b75c]">
            {member.role}
          </p>
        </div>
      </div>
    </a>
  );
}

export function TeamMarquee() {
  // Track = two copies of the list; translating -50% loops seamlessly.
  const loop = [...teamMembers, ...teamMembers];
  return (
    <Reveal>
      <div className="team-marquee team-marquee-mask overflow-hidden py-2" aria-label="Our team members">
        <ul className="team-marquee-track m-0 list-none p-0">
          {loop.map((member, i) => (
            <li key={`${member.slug}-${i}`} aria-hidden={i >= teamMembers.length} className="flex-none">
              <TeamCard member={member} />
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
