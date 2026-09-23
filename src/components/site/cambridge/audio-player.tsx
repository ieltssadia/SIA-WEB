"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Sparkles,
  Headphones,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface AudioPlayerProps {
  audioSrc?: string;
  transcript?: string;
  title?: string;
  scenario?: string;
  partNumber?: number;
}

export function CambridgeAudioPlayer({
  audioSrc,
  transcript,
  title,
  scenario,
  partNumber = 1,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isSyntheticSpeech, setIsSyntheticSpeech] = useState(false);
  const [synthSpeaking, setSynthSpeaking] = useState(false);

  // High quality Web Speech API British English synthesis fallback for crystal clear accent
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playSpeechSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !transcript) return;

    if (synthSpeaking) {
      window.speechSynthesis.pause();
      setSynthSpeaking(false);
      setIsPlaying(false);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSynthSpeaking(true);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = transcript.replace(/^[A-Z\s]+:\s*/gm, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick British or Australian native voice if available
    const voices = window.speechSynthesis.getVoices();
    const britishVoice =
      voices.find((v) => v.lang === "en-GB" && (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google") || v.name.includes("George") || v.name.includes("Hazel"))) ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en-AU")) ||
      voices.find((v) => v.lang.startsWith("en-US"));

    if (britishVoice) utterance.voice = britishVoice;
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSynthSpeaking(true);
      setIsPlaying(true);
      setIsSyntheticSpeech(true);
    };

    utterance.onend = () => {
      setSynthSpeaking(false);
      setIsPlaying(false);
      setIsSyntheticSpeech(false);
    };

    utterance.onerror = () => {
      setSynthSpeaking(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (audioRef.current && audioSrc && !isSyntheticSpeech) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // If audio file is missing or fails to load, fallback to high-definition speech synthesis!
          playSpeechSynthesis();
        });
      }
    } else {
      playSpeechSynthesis();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (val: number[]) => {
    const time = val[0];
    if (audioRef.current && !isSyntheticSpeech) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (isSyntheticSpeech && synthSpeaking) {
      // restart with new rate
      playSpeechSynthesis();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/90 p-4 sm:p-5 shadow-sm">
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            // Gracefully handle missing audio source
          }}
          className="hidden"
        />
      )}

      {/* Track info & Voice Quality Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="h-4.5 w-4.5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {title || `Part ${partNumber} Audio Track`}
            </h4>
            <p className="text-xs text-muted-foreground">{scenario || "Cambridge IELTS Exam Recording"}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="gap-1 border-primary/25 bg-primary/5 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            Official Cambridge Standard
          </Badge>
        </div>
      </div>

      {/* Main player controls */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Scrubber */}
        {!isSyntheticSpeech && duration > 0 ? (
          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Rewind 5s */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 5);
              }}
              className="h-9 w-9 rounded-full border-border/80"
              title="Rewind 5s"
            >
              <Rewind className="h-4 w-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              onClick={togglePlay}
              size="default"
              className="h-10 rounded-full bg-ink px-5 font-bold text-white shadow hover:opacity-90"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-1.5 h-4 w-4 fill-white" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-4 w-4 fill-white" />
                  Play Audio
                </>
              )}
            </Button>

            {/* Fast forward 5s */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 5);
              }}
              className="h-9 w-9 rounded-full border-border/80"
              title="Forward 5s"
            >
              <FastForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed & Accent Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs font-semibold">
              {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => handleSpeedChange(speed)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    playbackRate === speed
                      ? "bg-card font-bold text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* British Accent Studio Voice Toggle */}
            {transcript ? (
              <Button
                variant={isSyntheticSpeech ? "default" : "outline"}
                size="sm"
                onClick={playSpeechSynthesis}
                className={`h-8 rounded-lg text-xs font-semibold ${
                  isSyntheticSpeech ? "bg-primary text-primary-foreground" : "border-primary/30 text-primary hover:bg-primary/10"
                }`}
                title="Narrate with British native accent audio synthesis"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {isSyntheticSpeech && isPlaying ? "Speaking (British)..." : "British Voice (HD)"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
