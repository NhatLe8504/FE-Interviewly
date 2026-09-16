"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ProgressTrendPoint } from "@/types/analytics";

interface ScoreTrendLineChartProps {
  data: ProgressTrendPoint[];
  className?: string;
}

export function ScoreTrendLineChart({ data, className }: ScoreTrendLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-64 flex items-center justify-center text-sm text-slate-400 ${className || ""}`}>
        Đang tải biểu đồ xu hướng...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`h-64 flex flex-col items-center justify-center text-sm text-slate-400 border border-dashed border-slate-700 rounded-xl ${className || ""}`}>
        <p>Chưa có dữ liệu xu hướng phỏng vấn.</p>
        <span className="text-xs text-slate-500 mt-1">Hoàn thành ít nhất 1 phiên để xem đồ thị tiến độ.</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-72 ${className || ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            stroke="#475569"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            stroke="#475569"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.5rem",
              color: "#f8fafc",
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            name="Điểm tổng thể"
            dataKey="overall_score"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ fill: "#38bdf8", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            name="Độ rõ ràng"
            dataKey="clarity_score"
            stroke="#34d399"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            name="Cấu trúc logic"
            dataKey="logic_score"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
