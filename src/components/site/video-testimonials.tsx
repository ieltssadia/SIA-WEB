"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  Trophy,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Reveal, SectionHeading } from "@/components/site/reveal";

export interface VideoReview {
  id: string;
  name: string;
  band: string;
  score: number;
  course: string;
  duration: string;
  quote: string;
  videoSrc: string;
  thumbnailSrc: string;
  date: string;
  verified: boolean;
}

export const videoReviews: VideoReview[] = [
  {
    id: "review-1",
    name: "Sumaiya Rahman",
    band: "Band 7.5",
    score: 7.5,
    course: "IELTS Live Interactive Batch",
    duration: "0:45",
    quote: "Sadia আপুর ক্লাসের গাইডলাইন আর স্পিকিং প্র্যাকটিস সেশন আমাকে প্রথমবারেই কাঙ্ক্ষিত স্কোর এনে দিয়েছে।",
    videoSrc: "/videos/reviews/review-1.mp4",
    thumbnailSrc: "/videos/reviews/thumb-1.jpg",
    date: "Recent Batch",
    verified: true,
  },
  {
    id: "review-2",
    name: "Mahmudul Hasan",
    band: "Band 7.0",
    score: 7.0,
    course: "Basic to IELTS VIP Care",
    duration: "0:50",
    quote: "কাজের পাশাপাশি প্রিপারেশন নেওয়া কঠিন ছিল, কিন্তু এই কোর্সের রেকর্ডেড ক্লাস ও মেন্টরিং অসাধারণ ছিল।",
    videoSrc: "/videos/reviews/review-2.mp4",
    thumbnailSrc: "/videos/reviews/thumb-2.jpg",
    date: "Recent Batch",
    verified: true,
  },
  {
    id: "review-3",
    name: "Tanvir Hasan",
    band: "Band 7.5",
    score: 7.5,
    course: "IELTS Intensive Crash Course",
    duration: "0:50",
    quote: "মক টেস্ট এবং রাইটিং-এর ওয়ান-টু-ওয়ান ফিডব্যাক আমার স্কোর বৃদ্ধির মূল চাবিকাঠি ছিল।",
    videoSrc: "/videos/reviews/review-3.mp4",
    thumbnailSrc: "/videos/reviews/thumb-3.jpg",
    date: "Recent Batch",
    verified: true,
  },
  {
    id: "review-4",
    name: "Afrin Sultana",
    band: "Band 8.0",
    score: 8.0,
    course: "Complete IELTS Masterclass",
    duration: "1:43",
    quote: "রিডিং ও লিসেনিং-এর ইউনিক ট্রিকস এবং প্রতিদিনের এক্সাম প্র্যাকটিস আমাকে আত্মবিশ্বাসী করেছে।",
    videoSrc: "/videos/reviews/review-4.mp4",
    thumbnailSrc: "/videos/reviews/thumb-4.jpg",
    date: "Recent Batch",
    verified: true,
  },
];

export function VideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [totalDuration, setTotalDuration] = useState<string>("0:00");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const openVideo = (review: VideoReview) => {
    setActiveVideo(review);
    setIsPlaying(true);
    setProgress(0);
  };

  const closeVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
  };

  const nextVideo = () => {
    if (!activeVideo) return;
    const currentIndex = videoReviews.findIndex((v) => v.id === activeVideo.id);
    const nextIndex = (currentIndex + 1) % videoReviews.length;
    setActiveVideo(videoReviews[nextIndex]);
    setIsPlaying(true);
    setProgress(0);
  };

  const prevVideo = () => {
    if (!activeVideo) return;
    const currentIndex = videoReviews.findIndex((v) => v.id === activeVideo.id);
    const prevIndex = (currentIndex - 1 + videoReviews.length) % videoReviews.length;
    setActiveVideo(videoReviews[prevIndex]);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => {
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

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    if (dur > 0) {
      setProgress((current / dur) * 100);
      const curM = Math.floor(current / 60);
      const curS = Math.floor(current % 60);
      setCurrentTime(`${curM}:${curS < 10 ? "0" : ""}${curS}`);

      const durM = Math.floor(dur / 60);
      const durS = Math.floor(dur % 60);
      setTotalDuration(`${durM}:${durS < 10 ? "0" : ""}${durS}`);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Keyboard shortcut listener for active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeVideo) return;
      if (e.key === "Escape") closeVideo();
      if (e.key === "ArrowRight") nextVideo();
      if (e.key === "ArrowLeft") prevVideo();
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo]);

  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[750px] rounded-full bg-radial-glow opacity-25 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          badge={
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              100% Real Video Testimonials
            </span>
          }
          title={
            <>
              শিক্ষার্থীদের মুখে শুনুন <span className="text-brand-gradient">সাফল্যের গল্প</span>
            </>
          }
          subtitle="আমাদের প্ল্যাটফর্ম ও মেন্টরিং নিয়ে শিক্ষার্থীরা কী বলছেন — সরাসরি ভিডিওতে দেখুন।"
        />

        {/* Side-by-Side Sliding Carousel */}
        <Reveal className="mt-10">
          <div className="relative px-2 sm:px-6 md:px-8">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
              }}
              className="w-full"
              aria-label="Student Video Reviews Carousel"
            >
              <CarouselContent className="-ml-3 sm:-ml-4 pb-3">
                {videoReviews.map((review) => (
                  <CarouselItem
                    key={review.id}
                    className="pl-3 sm:pl-4 basis-[75%] sm:basis-[48%] md:basis-[34%] lg:basis-1/4"
                  >
                    <div
                      onClick={() => openVideo(review)}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-primary/30 bg-[#0f0d09] shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-[0_12px_32px_rgba(217,183,92,0.25)]"
                    >
                      {/* 9:15 Aspect ratio video thumbnail frame */}
                      <div className="relative aspect-[9/15] w-full overflow-hidden bg-black">
                        <Image
                          src={review.thumbnailSrc}
                          alt={`${review.name} - ${review.band} Review`}
                          fill
                          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 48vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Gradient & High-Contrast Badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60" />

                        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5 z-10">
                          {/* Ultra Visible High-Contrast Gold Band Badge */}
                          <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#d9b75c] via-[#f7e098] to-[#d9b75c] px-3 py-1 text-xs font-black text-black shadow-[0_3px_10px_rgba(0,0,0,0.7)] border border-[#ffea9f]">
                            <Trophy className="h-3.5 w-3.5 fill-black text-black" />
                            <span>{review.band}</span>
                          </div>

                          {/* High Contrast Duration Pill */}
                          <span className="rounded-full bg-black/85 px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-white/25 backdrop-blur-md">
                            {review.duration}
                          </span>
                        </div>

                        {/* Center Animated Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-amber-300 bg-black/60 text-[#f7e098] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:scale-115 group-hover:bg-[#d9b75c] group-hover:text-black group-hover:border-white">
                            <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                            <Play className="ml-1 h-6 w-6 fill-current" />
                          </div>
                        </div>

                        {/* Bottom Student Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 z-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                          <div className="flex items-center gap-1.5">
                            <p className="font-display text-sm sm:text-base font-bold text-white group-hover:text-[#f7e098] transition-colors truncate drop-shadow">
                              {review.name}
                            </p>
                            {review.verified && (
                              <CheckCircle2 className="h-4 w-4 text-[#d9b75c] fill-[#d9b75c]/20 shrink-0" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#e8c878] font-semibold truncate">
                            {review.course}
                          </p>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-200 line-clamp-2">
                            &ldquo;{review.quote}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Prev / Next Carousel Controls */}
              <CarouselPrevious className="hidden sm:flex -left-3 lg:-left-5 border-2 border-primary/40 bg-[#16130c] text-[#f7e098] shadow-lg hover:border-primary hover:bg-[#d9b75c] hover:text-black transition-all" />
              <CarouselNext className="hidden sm:flex -right-3 lg:-right-5 border-2 border-primary/40 bg-[#16130c] text-[#f7e098] shadow-lg hover:border-primary hover:bg-[#d9b75c] hover:text-black transition-all" />
            </Carousel>
          </div>
        </Reveal>

        {/* Action Link below */}
        <Reveal delay={0.15}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-2 border-primary/30 bg-card/80 px-6 py-2.5 text-xs sm:text-sm font-bold text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
            >
              <a href="#/stories">
                <Video className="mr-1.5 h-4 w-4 text-primary" />
                সব স্টুডেন্ট রিভিউ ও স্কোর দেখুন
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>

      {/* Fullscreen Reels Video Modal Player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={closeVideo}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-[#0c0a06] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close Bar */}
            <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent p-3.5">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#d9b75c] to-[#f7e098] px-2.5 py-0.5 text-xs font-black text-black">
                  <Trophy className="h-3 w-3 fill-black text-black" />
                  <span>{activeVideo.band}</span>
                </div>
                <span className="text-xs font-bold text-white">
                  {activeVideo.name}
                </span>
              </div>
              <button
                onClick={closeVideo}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/90 backdrop-blur transition-colors hover:bg-white hover:text-black"
                aria-label="Close video player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-[9/16] w-full bg-black" onClick={togglePlay}>
              <video
                ref={videoRef}
                src={activeVideo.videoSrc}
                poster={activeVideo.thumbnailSrc}
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="h-full w-full object-cover cursor-pointer"
              />

              {/* Play / Pause Indicator on Click */}
              {!isPlaying && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/80 text-[#f7e098] border-2 border-amber-400/60 backdrop-blur">
                    <Play className="ml-1 h-8 w-8 fill-current" />
                  </div>
                </div>
              )}

              {/* Navigation Arrows for Prev / Next Video */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevVideo();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-[#d9b75c] hover:text-black transition-colors"
                aria-label="Previous review video"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextVideo();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-[#d9b75c] hover:text-black transition-colors"
                aria-label="Next review video"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Bottom Controls Bar */}
              <div
                className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pt-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Timeline Progress Bar */}
                <div
                  className="group/bar relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full rounded-full bg-[#d9b75c] transition-all group-hover/bar:h-2"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="hover:text-[#f7e098] transition-colors"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 fill-current" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="hover:text-[#f7e098] transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5 text-red-400" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                    <span className="font-mono text-xs text-white/80 font-medium">
                      {currentTime} / {totalDuration || activeVideo.duration}
                    </span>
                  </div>

                  <button
                    onClick={toggleFullScreen}
                    className="hover:text-[#f7e098] transition-colors"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>

                {/* Student Info Details */}
                <div className="mt-3 border-t border-white/15 pt-2.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    {activeVideo.name}
                    <span className="text-[11px] font-medium text-[#e8c878]">
                      · {activeVideo.course}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-200">
                    &ldquo;{activeVideo.quote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
