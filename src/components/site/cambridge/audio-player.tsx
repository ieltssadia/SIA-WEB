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
  Headphones,
  FileText,
  Loader2,
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
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
          setIsLoading(false);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleSeek = (val: number[]) => {
    const time = val[0];
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleVolumeToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
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
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary text-[10px] font-bold">
                Part {partNumber} Official Audio
              </Badge>
              <span className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                {title || `Cambridge IELTS Listening — Part ${partNumber}`}
              </span>
            </div>
            {scenario && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{scenario}</p>
            )}
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          {[0.75, 1, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSpeedChange(speed)}
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                playbackRate === speed
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Time */}
      <div className="mt-4 space-y-1.5">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.5}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Playback Actions */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSkip(-5)}
            className="h-9 w-9 rounded-xl p-0"
            title="Rewind 5s"
          >
            <Rewind className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={togglePlay}
            disabled={isLoading}
            className="h-10 rounded-xl px-5 font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg transition"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 mr-1.5 fill-current" />
            ) : (
              <Play className="h-4 w-4 mr-1.5 fill-current" />
            )}
            {isPlaying ? "Pause Audio" : "Play Audio"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSkip(5)}
            className="h-9 w-9 rounded-xl p-0"
            title="Forward 5s"
          >
            <FastForward className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground"
            title="Restart"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {transcript && (
            <Button
              size="sm"
              variant={showTranscript ? "secondary" : "ghost"}
              onClick={() => setShowTranscript(!showTranscript)}
              className="h-8 rounded-xl text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              {showTranscript ? "Hide Script" : "Transcript"}
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleVolumeToggle}
            className="h-8 w-8 rounded-xl p-0 text-muted-foreground"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Transcript Accordion if open */}
      {showTranscript && transcript && (
        <div className="mt-4 rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-foreground border border-border/60 max-h-60 overflow-y-auto font-sans whitespace-pre-line">
          <p className="font-bold text-primary mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" /> Official Audio Transcript
          </p>
          {transcript}
        </div>
      )}
    </div>
  );
}
