"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Phone, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamMarquee } from "@/components/site/team-marquee";
import { Reveal } from "@/components/site/reveal";
import { site, teamMembers, type TeamMember } from "@/lib/site-data";

/**
 * #/team — "The People Behind the Bands."
 * Agency-style hero (pill badge, big statement, one clear CTA), the moving
 * portrait strip, and a trust row — every card opens the member's profile.
 */
export function TeamPage() {
  /* CMS-managed team — static import paints first, then /api/catalog swaps in. */
  const [team, setTeam] = useState<TeamMember[]>(teamMembers);

  useEffect(() => {
    let alive = true;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok) setTeam(d.team as TeamMember[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {/* Hero — reference-style: small pill, big bold statement, single CTA */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full bg-radial-glow blur-2xl"
        />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 text-center md:pt-20 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground/80 shadow-[0_2px_10px_rgba(30,27,20,0.05)]">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
              যাদের হাতে আপনার প্রস্তুতি উঠে আসবে
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              পরিচিত হোন <span className="text-brand-gradient">মানুষদের</span> সাথে
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              ব্যানার-বোর্ডে নাম নয় — প্রতিটি শিক্ষার্থীর খাতা, প্রতিটি mock test আর
              পরীক্ষার হলের ভয়টা এঁরাই ভাগ করে নেন। একবার এঁদের সাথে কথা বলুন,
              পার্থক্যটা বুঝতে পারবেন।
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-ink px-7 text-base font-semibold text-white shadow-[0_10px_30px_rgba(30,27,20,0.22)] transition-all hover:opacity-85"
              >
                <a href={site.phoneHref}>
                  <Phone className="mr-1.5 h-5 w-5" aria-hidden />
                  সরাসরি কথা বলুন
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-card text-base font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                <a href="#/courses">কোর্স দেখুন</a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Moving portrait strip */}
      <section aria-label="Team members" className="pb-6 pt-6">
        <TeamMarquee />
        <Reveal delay={0.1}>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            যেকোনো ছবিতে ক্লিক করুন — প্রোফাইল খুলবে
          </p>
        </Reveal>
      </section>

      {/* Trust row — reference-style stat bar */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <dl className="grid grid-cols-1 gap-4 rounded-3xl border border-border bg-card/60 p-6 sm:grid-cols-3 sm:p-8">
              {[
                { value: "৫,০০০+", label: "শিক্ষার্থী এঁদের ক্লাস পেরিয়ে পরীক্ষা দিয়েছে" },
                { value: "৯ বছর", label: "একই জায়গায়, একই নিয়মে পড়ানোর অভিজ্ঞতা" },
                { value: "৪.৯/৫", label: "শিক্ষার্থীদের রেটিং — মুখে মুখে ছড়ানো খ্যাতি" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                  <dd className="font-display text-3xl font-extrabold text-foreground">{value}</dd>
                  <dt className="text-sm leading-relaxed text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Directory — full profiles at a glance */}
      <section className="pb-20" aria-label="সব সদস্যের প্রোফাইল">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <span className="h-px w-8 bg-primary/60" aria-hidden />
              Full Profiles
              <span className="h-px w-8 bg-primary/60" aria-hidden />
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
              কে কী পড়ান, কেন
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <Reveal key={member.slug} delay={i * 0.06}>
                <a
                  href={`#/team/${member.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_48px_rgba(30,27,20,0.14)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border">
                      <Image
                        src={member.photo}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-foreground">{member.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {member.tagline}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {member.specialties.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${member.chip}`}
                      >
                        <BadgeCheck className="h-3 w-3" aria-hidden />
                        {s}
                      </span>
                    ))}
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-10 flex items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-6 py-4 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                কোন কোর্স আপনার জন্য — নিশ্চিত না হলে ফোন করুন{" "}
                <a href={site.phoneHref} className="font-semibold text-primary hover:underline">
                  {site.phone}
                </a>{" "}
                — কে পড়াবেন সেটা আমরা মিলিয়ে দেব।
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
