"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Maximize,
  Pause,
  Play,
  Quote,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Star,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { stories, site, stats } from "@/lib/site-data";
import { videoReviews, VideoReview } from "@/components/site/video-testimonials";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface VideoStoryDetail extends VideoReview {
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
  batch: string;
  highlights: string[];
}

const detailedVideoStories: VideoStoryDetail[] = [
  {
    ...videoReviews[0],
    listening: "8.5",
    reading: "8.0",
    writing: "7.0",
    speaking: "7.5",
    batch: "Live Interactive Batch 312",
    highlights: [
      "প্রথমবারেই Overall Band 7.5 অর্জন",
      "ডেইলি স্পিকিং পার্টনার ক্লাব প্র্যাকটিস",
      "Sadia আপুর ওয়ান-টু-ওয়ান গাইডলাইন",
    ],
  },
  {
    ...videoReviews[1],
    name: "Mahmudul Hasan",
    listening: "7.5",
    reading: "7.5",
    writing: "6.5",
    speaking: "7.0",
    batch: "VIP Executive Batch 289",
    highlights: [
      "ফুল-টাইম জবের পাশাপাশি চমৎকার স্কোর",
      "রেকর্ডেড ক্লাসের আনলিমিটেড অ্যাক্সেস",
      "স্পিকিং মক টেস্টে ইনস্ট্যান্ট ফিডব্যাক",
    ],
  },
  {
    ...videoReviews[2],
    name: "Tanvir Hasan",
    listening: "8.0",
    reading: "7.5",
    writing: "7.0",
    speaking: "7.5",
    batch: "IELTS Crash Care 305",
    highlights: [
      "১ মাসের ক্র্যাশ কোর্সে কাঙ্ক্ষিত স্কোর",
      "রাইটিং টাস্ক ১ ও ২-এর ফর্মুলা মেথড",
      "টাইম ম্যানেজমেন্ট স্ট্র্যাটেজি",
    ],
  },
  {
    ...videoReviews[3],
    listening: "8.5",
    reading: "8.5",
    writing: "7.5",
    speaking: "8.0",
    batch: "Masterclass Pro 298",
    highlights: [
      "Overall Band 8.0 অসাধারণ সাফল্য",
      "ক্যামব্রিজ প্র্যাকটিস টেস্টে সর্বোচ্চ স্কোর",
      "রিডিং ট্রু/ফলস/নট গিভেন টেকনিক",
    ],
  },
];

export function StoriesPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoStoryDetail>(detailedVideoStories[3]); // Start with Band 8.0
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleSelectVideo = (video: VideoStoryDetail) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  const toggleInlinePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const filteredStories = stories.filter((story) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "8") return story.score >= 8.0;
    if (activeFilter === "7.5") return story.score === 7.5;
    if (activeFilter === "7") return story.score === 7.0;
    if (activeFilter === "6.5") return story.score <= 6.5;
    return true;
  });

  return (
    <>
      <PageHeader
        title={
          <>
            Real Students, <span className="text-brand-gradient">Real Results</span>
          </>
        }
        subtitle="সাজানো গল্প নয়, আমাদের সাম্প্রতিক ব্যাচের শিক্ষার্থীদের বাস্তব অভিজ্ঞতা ও সাফল্যের ভিডিও।"
        crumbs={[{ label: "Success Stories" }]}
      />

      {/* Top Stats Strip */}
      <section className="border-b border-border/50 bg-card/40 py-6">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
            {stats.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="font-display text-2xl sm:text-3xl font-black text-primary">
                  {item.value}
                  {item.suffix}
                </span>
                <span className="mt-1 text-xs text-muted-foreground font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: Featured Video Studio & Interactive Spotlight */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            badge={
              <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                Featured Video Spotlight
              </span>
            }
            title={
              <>
                ভিডিওতে দেখুন <span className="text-brand-gradient">সাফল্যের পেছনের গল্প</span>
              </>
            }
            subtitle="শিক্ষার্থীরা কীভাবে দুর্বলতা কাটিয়ে লক্ষ্যমাত্রা পূরণ করেছেন, ক্লিক করে তাদের বক্তব্য শুনুন।"
          />

          {/* Interactive Spotlight Hero Box */}
          <Reveal className="mt-10">
            <div className="overflow-hidden rounded-3xl border-2 border-primary/30 bg-[#0e0c08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Column: Vertical Video Stage */}
                <div className="relative lg:col-span-5 flex items-center justify-center bg-black/90 p-4 sm:p-6">
                  <div className="relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-black shadow-2xl">
                    <video
                      ref={videoRef}
                      src={selectedVideo.videoSrc}
                      poster={selectedVideo.thumbnailSrc}
                      playsInline
                      onEnded={() => setIsPlaying(false)}
                      onClick={toggleInlinePlay}
                      className="h-full w-full object-cover cursor-pointer"
                    />

                    {/* Gradient Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />

                    {/* Top Badges */}
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5 z-10">
                      <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#d9b75c] via-[#f7e098] to-[#d9b75c] px-3 py-1 text-xs font-black text-black shadow-lg">
                        <Trophy className="h-3.5 w-3.5 fill-black text-black" />
                        <span>{selectedVideo.band}</span>
                      </div>
                      <span className="rounded-full bg-black/80 px-2.5 py-1 font-mono text-[11px] font-bold text-white border border-white/20">
                        {selectedVideo.duration}
                      </span>
                    </div>

                    {/* Big Center Play Overlay */}
                    {!isPlaying && (
                      <div
                        onClick={toggleInlinePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-20"
                      >
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-300 bg-[#d9b75c] text-black shadow-2xl transition-all duration-300 hover:scale-110">
                          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/40" />
                          <Play className="ml-1 h-7 w-7 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Playback Controls */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3.5 z-20 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleInlinePlay}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-primary hover:text-black transition-colors"
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-primary hover:text-black transition-colors"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4 text-red-400" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">
                        {selectedVideo.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Score Breakdown & Details */}
                <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-primary/20 bg-gradient-to-br from-[#141009] via-[#0f0d09] to-[#16120b]">
                  <div>
                    {/* Header Details */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#f7e098]">
                            {selectedVideo.name}
                          </h3>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="mt-1 text-sm text-[#d4c194]">
                          {selectedVideo.course} · <span className="text-zinc-400">{selectedVideo.batch}</span>
                        </p>
                      </div>

                      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-[#d9b75c] to-[#b38e34] px-4 py-2 text-center text-black shadow-lg">
                        <span className="block text-[10px] font-black uppercase tracking-wider">Overall Band</span>
                        <span className="font-display text-2xl font-black">{selectedVideo.band}</span>
                      </div>
                    </div>

                    {/* Band Score Sub-Module Badges */}
                    <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                      <div className="rounded-xl border border-primary/30 bg-black/40 p-2.5 text-center backdrop-blur">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase">Listening</span>
                        <span className="font-display text-lg font-black text-[#f7e098]">{selectedVideo.listening}</span>
                      </div>
                      <div className="rounded-xl border border-primary/30 bg-black/40 p-2.5 text-center backdrop-blur">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase">Reading</span>
                        <span className="font-display text-lg font-black text-[#f7e098]">{selectedVideo.reading}</span>
                      </div>
                      <div className="rounded-xl border border-primary/30 bg-black/40 p-2.5 text-center backdrop-blur">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase">Writing</span>
                        <span className="font-display text-lg font-black text-[#f7e098]">{selectedVideo.writing}</span>
                      </div>
                      <div className="rounded-xl border border-primary/30 bg-black/40 p-2.5 text-center backdrop-blur">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase">Speaking</span>
                        <span className="font-display text-lg font-black text-[#f7e098]">{selectedVideo.speaking}</span>
                      </div>
                    </div>

                    {/* Student Quote */}
                    <div className="mt-6 rounded-2xl border border-amber-400/20 bg-black/30 p-4 sm:p-5 relative">
                      <Quote className="h-6 w-6 text-[#d9b75c]/40 absolute right-4 top-4" />
                      <p className="text-xs font-bold text-[#d9b75c] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-[#d9b75c]" />
                        Student Testimonial
                      </p>
                      <p className="text-sm sm:text-base leading-relaxed text-zinc-200 italic">
                        &ldquo;{selectedVideo.quote}&rdquo;
                      </p>
                    </div>

                    {/* Key Highlights */}
                    <div className="mt-6">
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                        কোর্সের বিশেষ সুবিধা যা কাজে লেগেছে:
                      </p>
                      <ul className="space-y-2">
                        {selectedVideo.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
                            <CheckCircle2 className="h-4 w-4 text-[#d9b75c] shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Playlist Selector Buttons */}
                  <div className="mt-8 border-t border-primary/20 pt-5">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                      অন্যান্য ভিডিও রিভিউ দেখুন (Click to play):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {detailedVideoStories.map((video) => {
                        const isSelected = selectedVideo.id === video.id;
                        return (
                          <button
                            key={video.id}
                            onClick={() => handleSelectVideo(video)}
                            className={`flex items-center gap-2 rounded-xl p-2 text-left transition-all ${
                              isSelected
                                ? "border-2 border-[#d9b75c] bg-[#221c0e] shadow-md ring-1 ring-[#d9b75c]"
                                : "border border-white/10 bg-black/40 hover:border-primary/40 hover:bg-black/60"
                            }`}
                          >
                            <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                              <Image
                                src={video.thumbnailSrc}
                                alt={video.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="h-3.5 w-3.5 fill-white text-white" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-xs font-bold ${isSelected ? "text-[#f7e098]" : "text-white"}`}>
                                {video.name}
                              </p>
                              <span className="inline-block text-[10px] font-black text-[#d9b75c]">
                                {video.band}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2: Filterable All Written Stories & Score Cards */}
      <section className="py-12 sm:py-16 md:py-20 border-t border-border/40 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <SectionHeading
                title={
                  <>
                    লিখিত অভিজ্ঞতা ও <span className="text-brand-gradient">স্কোর বিবরণী</span>
                  </>
                }
                subtitle="সরাসরি শিক্ষার্থীদের শেয়ার করা স্কোর ও রিভিউ।"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "All Stories", value: "all" },
                { label: "Band 8.0+", value: "8" },
                { label: "Band 7.5", value: "7.5" },
                { label: "Band 7.0", value: "7" },
                { label: "Band 6.5 & 6.0", value: "6.5" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    activeFilter === tab.value
                      ? "bg-brand-gradient text-white shadow-md"
                      : "border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story, i) => (
              <Reveal key={story.name} delay={(i % 3) * 0.06} className="h-full">
                <Card className="flex h-full flex-col border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <Quote className="h-6 w-6 text-primary/60" aria-hidden />
                      <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#d9b75c] via-[#f7e098] to-[#d9b75c] px-3 py-0.5 text-xs font-black text-black shadow-sm">
                        <Trophy className="h-3 w-3 fill-black text-black" />
                        <span>{story.band}</span>
                      </div>
                    </div>

                    <p className="mt-4 flex-1 text-xs sm:text-sm leading-relaxed text-foreground/90 break-words text-pretty">
                      &ldquo;{story.quote}&rdquo;
                    </p>

                    <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-brand-gradient font-display text-xs sm:text-sm font-bold text-white">
                        {initials(story.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-foreground">
                          {story.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {story.course} · {story.date}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Bottom Journey Box */}
          <Reveal delay={0.15}>
            <div className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-r from-[#15120b] via-[#16130c] to-[#15120b] p-8 text-center md:p-12">
              <p className="font-display text-2xl font-bold text-[#f6ecd4] md:text-3xl">
                পরের সফলতার গল্পটা হতে পারে আপনার!
              </p>
              <p className="mx-auto mt-3 max-w-lg text-sm text-[#c6b995]">
                আমাদের অফিসিয়াল ফেসবুক পেজে প্রতিদিন সফল শিক্ষার্থীদের ফলাফলের পোস্ট দেখুন অথবা আজই আপনার প্রস্তুতি শুরু করুন।
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-brand-gradient font-bold text-white shadow-lg hover:opacity-90"
                >
                  <a href="#/checkout">
                    <Award className="mr-1.5 h-4.5 w-4.5" />
                    Start Your Preparation
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/[0.05] font-semibold text-[#f6ecd4] hover:border-white/50 hover:bg-white/15 hover:text-white"
                >
                  <a
                    href={site.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sadia's IELTS on Facebook"
                  >
                    Result Posts on Facebook
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
