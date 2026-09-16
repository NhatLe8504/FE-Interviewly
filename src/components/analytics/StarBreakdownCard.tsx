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
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Cấu Trúc Trả Lời Chuẩn STAR</h3>
            <p className="text-xs text-slate-400">Độ hoàn thiện 4 yếu tố phương pháp STAR</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Mức độ đạt: </span>
          <span className="text-sm font-bold text-amber-400">{percentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
              step.achieved
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : "bg-slate-950/40 border-slate-800 text-slate-400"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                step.achieved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {step.letter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-slate-200 truncate">
                  {step.title}
                </span>
                {step.achieved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
