"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface AudioPlayerTurnProps {
  audioUrl?: string | null;
  turnNumber: number;
  className?: string;
}

export function AudioPlayerTurn({ audioUrl, turnNumber, className }: AudioPlayerTurnProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay policy or invalid audio file
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!audioUrl) {
    return (
      <div className={`p-3 rounded-xl bg-white/70 border border-[rgba(106,72,49,0.12)] text-xs text-[#543a2a]/70 flex items-center gap-2 ${className || ""}`}>
        <Volume2 className="w-4 h-4 text-[#8b4513] shrink-0" />
        <span>Bản ghi âm giọng nói không khả dụng cho lượt trả lời #{turnNumber} (trả lời qua Text).</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl bg-white/85 border border-[rgba(106,72,49,0.14)] flex items-center gap-3 shadow-xs ${
        className || ""
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d98236] to-[#8b4513] hover:opacity-90 text-white flex items-center justify-center shrink-0 transition-opacity shadow-sm cursor-pointer"
        title={isPlaying ? "Tạm dừng" : "Phát ghi âm"}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] text-[#543a2a]/70 mb-1 font-mono font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[rgba(106,72,49,0.15)] rounded-lg appearance-none cursor-pointer accent-[#d98236]"
        />
      </div>

      <button
        type="button"
        onClick={cyclePlaybackRate}
        className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[rgba(106,72,49,0.08)] hover:bg-[rgba(106,72,49,0.14)] text-[#211914] transition-colors cursor-pointer"
        title="Tốc độ phát"
      >
        {playbackRate}x
      </button>

      <button
        type="button"
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
          }
        }}
        className="p-1 rounded text-[#543a2a]/60 hover:text-[#211914] transition-colors cursor-pointer"
        title="Phát lại từ đầu"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}