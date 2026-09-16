"use client";

import React from "react";
import { Mic, Zap, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SpeechQualityCardProps {
  wpm: number;
  paceRating?: string;
  fillerCount: number;
  fillerWords?: string[];
  pauseDuration?: number;
  className?: string;
}

export function SpeechQualityCard({
  wpm,
  paceRating,
  fillerCount,
  fillerWords = [],
  pauseDuration = 0,
  className,
}: SpeechQualityCardProps) {
  const isIdealPace = wpm >= 115 && wpm <= 160;
  const isSlow = wpm < 115;

  const paceColor = isIdealPace
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : isSlow
    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Chất Lượng Giọng Nói & Tốc Độ</h3>
            <p className="text-xs text-slate-400">Phân tích nhịp độ phát âm và từ đệm</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${paceColor}`}
        >
          {paceRating || (isIdealPace ? "Lý tưởng (Ideal)" : isSlow ? "Hơi chậm" : "Hơi nhanh")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Tốc độ phát âm</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {wpm} <span className="text-xs font-normal text-slate-400">từ/phút (WPM)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Chuẩn phỏng vấn: 120 - 150 WPM</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Từ đệm mắc phải</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {fillerCount} <span className="text-xs font-normal text-slate-400">lần</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {fillerWords.length > 0 ? (
              fillerWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/20"
                >
                  &quot;{word}&quot;
                </span>
              ))
            ) : (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" /> Không phát hiện từ đệm
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Khoảng ngập ngừng</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {pauseDuration} <span className="text-xs font-normal text-slate-400">giây</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tổng thời gian im lặng khi suy nghĩ</p>
        </div>
      </div>
    </div>
  );
}
