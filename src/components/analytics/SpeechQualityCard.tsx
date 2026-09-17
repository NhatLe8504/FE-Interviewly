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
    ? "text-[#2e6b34] bg-[rgba(46,107,52,0.1)] border-[rgba(46,107,52,0.25)]"
    : isSlow
    ? "text-[#d98236] bg-[rgba(217,130,54,0.1)] border-[rgba(217,130,54,0.25)]"
    : "text-[#b91c1c] bg-[rgba(185,28,28,0.1)] border-[rgba(185,28,28,0.25)]";

  return (
    <div
      className={`rounded-2xl border border-[rgba(106,72,49,0.14)] bg-white/75 backdrop-blur-md p-5 shadow-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[rgba(217,130,54,0.14)] text-[#8b4513]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#211914] text-sm">Chất Lượng Giọng Nói & Tốc Độ</h3>
            <p className="text-xs text-[#543a2a]/70">Phân tích nhịp độ phát âm và từ đệm</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${paceColor}`}
        >
          {paceRating || (isIdealPace ? "Lý tưởng (Ideal)" : isSlow ? "Hơi chậm" : "Hơi nhanh")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white/85 border border-[rgba(106,72,49,0.12)] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#543a2a]/75 mb-1">
            <Zap className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Tốc độ phát âm</span>
          </div>
          <div className="text-xl font-extrabold text-[#211914]">
            {wpm} <span className="text-xs font-normal text-[#543a2a]/60">từ/phút (WPM)</span>
          </div>
          <p className="text-[11px] text-[#543a2a]/60 mt-1">Chuẩn phỏng vấn: 120 - 150 WPM</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/85 border border-[rgba(106,72,49,0.12)] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#543a2a]/75 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#d98236]" />
            <span>Từ đệm mắc phải</span>
          </div>
          <div className="text-xl font-extrabold text-[#211914]">
            {fillerCount} <span className="text-xs font-normal text-[#543a2a]/60">lần</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {fillerWords.length > 0 ? (
              fillerWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[rgba(217,130,54,0.12)] text-[#8b4513] border border-[rgba(217,130,54,0.25)]"
                >
                  &quot;{word}&quot;
                </span>
              ))
            ) : (
              <span className="text-[11px] font-semibold text-[#2e6b34] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" /> Không phát hiện từ đệm
              </span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/85 border border-[rgba(106,72,49,0.12)] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#543a2a]/75 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#8b4513]" />
            <span>Khoảng ngập ngừng</span>
          </div>
          <div className="text-xl font-extrabold text-[#211914]">
            {pauseDuration} <span className="text-xs font-normal text-[#543a2a]/60">giây</span>
          </div>
          <p className="text-[11px] text-[#543a2a]/60 mt-1">Tổng thời gian im lặng khi suy nghĩ</p>
        </div>
      </div>
    </div>
  );
}