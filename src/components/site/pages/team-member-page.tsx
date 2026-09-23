"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, GraduationCap, MessageCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { site, teamMembers, type TeamMember } from "@/lib/site-data";

/**
 * #/team/<slug> — one member's full profile: portrait, story, credentials,
 * specialties and stats, then the rest of the team to continue exploring.
 */
export function TeamMemberPage({ slug }: { slug: string }) {
  /* CMS-managed team — fetched BEFORE the not-found early return so hooks stay
     unconditional (same pattern as course-detail-page). Static paints first. */
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

  const member = team.find((m) => m.slug === slug);

  if (!member) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="font-display text-2xl font-bold">প্রোফাইলটি খুঁজে পাওয়া যায়নি</p>
        <p className="mt-2 text-sm text-muted-foreground">
          লিংকটি পুরোনো হতে পারে, পুরো টিম একসাথে দেখুন।
        </p>
        <Button asChild className="mt-6 rounded-full bg-ink font-semibold text-white hover:opacity-85">
          <a href="#/team">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            টিম পেজে ফিরুন
          </a>
        </Button>
      </div>
    );
  }

  const others = team.filter((m) => m.slug !== slug);

  return (
    <>
      {/* Profile hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-8 h-[380px] w-[380px] rounded-full bg-radial-glow blur-2xl"
        />
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 lg:px-8">
          <a
            href="#/team"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            পুরো টিম
          </a>

          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* Portrait */}
            <Reveal className="relative mx-auto w-full max-w-sm lg:mx-0">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] bg-brand-gradient opacity-20 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-primary/25 shadow-[0_30px_80px_rgba(30,27,20,0.18)]">
                <Image
                  src={member.photo}
                  alt={`${member.name}, ${member.role} at Sadia's IELTS`}
                  width={864}
                  height={1152}
                  priority
                  className="h-auto w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-forest/80 px-4 py-3 backdrop-blur">
                  <p className="font-display text-base font-bold text-[#f6ecd4]">{member.name}</p>
                  <p className="text-xs text-[#d9b75c]">{member.role}</p>
                </div>
              </div>
            </Reveal>

            {/* Copy */}
            <div>
              <Reveal delay={0.06}>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${member.chip}`}>
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  {member.role}
                </span>
                <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
                  {member.name}
                </h1>
                <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                  {member.tagline}
                </p>
              </Reveal>

              {/* Stats — weight hierarchy: big display numbers, tiny labels */}
              <Reveal delay={0.12}>
                <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-border/80 py-6">
                  {member.stats.map(({ value, label }) => (
                    <div key={label}>
                      <dd className="font-display text-2xl font-extrabold leading-none text-foreground sm:text-3xl">
                        {value}
                      </dd>
                      <dt className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                        {label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </Reveal>

              {/* Specialties */}
              <Reveal delay={0.16}>
                <div className="mt-6 flex flex-wrap gap-2">
                  {member.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground/85"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Reveal>

              {/* CTAs */}
              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-gold-gradient px-6 font-semibold text-ink shadow-[0_6px_20px_rgba(169,127,42,0.35)] transition-transform hover:scale-[1.03]"
                  >
                    <a href="#/checkout">
                      <GraduationCap className="mr-1.5 h-5 w-5" aria-hidden />
                      ক্লাসে ভর্তি হোন
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-border bg-card font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-1.5 h-4.5 w-4.5" aria-hidden />
                      WhatsApp-এ প্রশ্ন করুন
                    </a>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Story + credentials */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              পড়ানোর ধরন, নিজের ভাষায়
            </h2>
            <div className="mt-5 space-y-4">
              {member.bio.map((para, i) => (
                <p key={i} className="text-pretty leading-relaxed text-muted-foreground">
                  {para}
                </p>
              ))}
            </div>
            <figure className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-6">
              <Quote className="h-5 w-5 text-primary/70" aria-hidden />
              <blockquote className="mt-3 font-display text-lg font-semibold leading-relaxed text-foreground">
                {member.quote}
              </blockquote>
              <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {member.name}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground">
                যোগ্যতা ও অভিজ্ঞতা
              </h3>
              <ul className="mt-4 space-y-3">
                {member.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-sm leading-relaxed text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Other members */}
      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8" aria-label="বাকি টিম সদস্য">
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">বাকি টিম</h2>
          <a href="#/team" className="text-sm font-semibold text-primary hover:underline">
            সব প্রোফাইল
          </a>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
          {others.map((m, i) => (
            <Reveal key={m.slug} delay={i * 0.05}>
              <a
                href={`#/team/${m.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_14px_40px_rgba(30,27,20,0.14)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 640px) 45vw, 25vw"
                    className="object-cover grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate font-display text-sm font-bold text-foreground">{m.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{m.role}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
