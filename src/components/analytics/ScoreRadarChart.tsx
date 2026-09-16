"use client";

import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SkillRadar } from "@/types/analytics";

interface ScoreRadarChartProps {
  data: SkillRadar;
  className?: string;
}

export function ScoreRadarChart({ data, className }: ScoreRadarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    { subject: "Độ rõ ràng", score: data.clarity, fullMark: 100 },
    { subject: "Cấu trúc logic", score: data.logic, fullMark: 100 },
    { subject: "Dẫn chứng thực tế", score: data.evidence, fullMark: 100 },
    { subject: "Phong thái giọng nói", score: data.delivery, fullMark: 100 },
    { subject: "Khung STAR", score: data.star_method, fullMark: 100 },
  ];

  if (!mounted) {
    return (
      <div className={`h-64 flex items-center justify-center text-sm text-slate-400 ${className || ""}`}>
        Đang tải biểu đồ radar...
      </div>
    );
  }

  return (
    <div className={`w-full h-72 ${className || ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          <Radar
            name="Điểm kỹ năng"
            dataKey="score"
            stroke="#38bdf8"
            fill="#0284c7"
            fillOpacity={0.45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.5rem",
              color: "#f8fafc",
            }}
            formatter={(value: any) => [`${value} / 100`, "Điểm"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
