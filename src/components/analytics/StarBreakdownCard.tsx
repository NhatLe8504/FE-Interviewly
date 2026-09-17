"use client";

import React from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface StarAnalysis {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
}

interface StarBreakdownCardProps {
  analysis: StarAnalysis;
  className?: string;
}

export function StarBreakdownCard({ analysis, className }: StarBreakdownCardProps) {
  const steps = [
    {
      key: "situation",
      letter: "S",
      title: "Situation (Bối cảnh)",
      desc: "Nêu rõ bối cảnh cụ thể của dự án/vấn đề",
      achieved: analysis.situation,
    },
    {
      key: "task",
      letter: "T",
      title: "Task (Mục tiêu/Nhiệm vụ)",
      desc: "Làm rõ trách nhiệm và mục tiêu cần giải quyết",
      achieved: analysis.task,
    },
    {
      key: "action",
      letter: "A",
      title: "Action (Hành động)",
      desc: "Các bước kỹ thuật và giải pháp cụ thể đã thực hiện",
      achieved: analysis.action,
    },
    {
      key: "result",
      letter: "R",
      title: "Result (Kết quả)",
      desc: "Số liệu định lượng và tác động thực tế của giải pháp",
      achieved: analysis.result,
    },
  ];

  const achievedCount = Object.values(analysis).filter(Boolean).length;
  const percentage = Math.round((achievedCount / 4) * 100);

  return (
    <div
      className={`rounded-2xl border border-[rgba(106,72,49,0.14)] bg-white/75 backdrop-blur-md p-5 shadow-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[rgba(217,130,54,0.14)] text-[#8b4513]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#211914] text-sm">Cấu Trúc Trả Lời Chuẩn STAR</h3>
            <p className="text-xs text-[#543a2a]/70">Độ hoàn thiện 4 yếu tố phương pháp STAR</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#543a2a]/70">Mức độ đạt: </span>
          <span className="text-sm font-extrabold text-[#8b4513]">{percentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
              step.achieved
                ? "bg-[rgba(240,250,242,0.85)] border-[rgba(46,107,52,0.25)]"
                : "bg-white/60 border-[rgba(106,72,49,0.12)]"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                step.achieved
                  ? "bg-[rgba(46,107,52,0.16)] text-[#2e6b34] border border-[rgba(46,107,52,0.3)]"
                  : "bg-[rgba(106,72,49,0.08)] text-[#543a2a]/60 border border-[rgba(106,72,49,0.12)]"
              }`}
            >
              {step.letter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-bold text-xs truncate ${step.achieved ? "text-[#1b4520]" : "text-[#543a2a]/80"}`}>
                  {step.title}
                </span>
                {step.achieved ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2e6b34] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#543a2a]/40 shrink-0" />
                )}
              </div>
              <p className={`text-[11px] mt-0.5 leading-snug ${step.achieved ? "text-[#2e6b34]/80" : "text-[#543a2a]/60"}`}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}