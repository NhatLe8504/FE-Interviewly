"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Calendar,
  Eye,
  Award,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { historyApi } from "@/services/historyApi";
import { HistorySessionItem } from "@/types/analytics";

export default function ReportsPage() {
  const [sessions, setSessions] = useState<HistorySessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await historyApi.getInterviewHistory({ pageSize: 20 });
        setSessions(res.items);
      } catch {
        setSessions([
          {
            session_id: 101,
            candidate_id: 1,
            domain_id: 1,
            domain_name: "Công nghệ thông tin",
            role_id: 2,
            role_name: "Backend Developer (Python/FastAPI)",
            experience_level: "junior",
            language: "vi",
            mode: "voice",
            status: "completed",
            total_score: 85.0,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            total_turns: 4,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-400" />
            <span>Báo Cáo Kỹ Năng PDF Đã Xuất</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Xem trước trực tuyến khổ chuẩn A4 và tải về các file báo cáo phân tích toàn diện.
          </p>
        </div>

        <Link
          href="/practice"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-sky-500/20"
        >
          <span>Luyện phiên mới</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mb-2" />
          <span>Đang tải danh sách báo cáo PDF...</span>
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => {
            const pdfUrl = historyApi.getPdfDownloadUrl(s.session_id);

            return (
              <div
                key={s.session_id}
                className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-sky-400 font-semibold">
                      Phiên #{s.session_id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      Chuẩn A4 PDF
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 line-clamp-1">
                    {s.role_name || "Vị trí chuyên môn"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 mb-4">
                    {s.domain_name || "Ngành nghề tổng hợp"}
                  </p>

                  <div className="space-y-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Điểm tổng kết:</span>
                      <span className="font-bold text-sky-400">
                        {s.total_score !== null ? `${s.total_score} / 100` : "Chưa chấm"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Số lượt hỏi đáp:</span>
                      <span>{s.total_turns} lượt</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ngày phỏng vấn:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(s.started_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    href={`/reports/${s.session_id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </Link>

                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-all shadow-md shadow-sky-500/15"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải PDF</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center text-slate-500 text-sm">
          Chưa có báo cáo PDF nào được tạo. Hãy hoàn thành phiên phỏng vấn để xuất báo cáo.
        </div>
      )}
    </div>
  );
}
