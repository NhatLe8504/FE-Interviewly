"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { historyApi } from "@/services/historyApi";
import { HistoryPageData, HistorySessionItem } from "@/types/analytics";

export default function InterviewHistoryPage() {
  const [data, setData] = useState<HistoryPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modeFilter, setModeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await historyApi.getInterviewHistory({
        page,
        pageSize,
        mode: modeFilter || undefined,
        status: statusFilter || undefined,
      });
      setData(res);
    } catch {
      // Fallback data
      setData({
        items: [
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
          {
            session_id: 102,
            candidate_id: 1,
            domain_id: 1,
            domain_name: "Công nghệ thông tin",
            role_id: 3,
            role_name: "Frontend Engineer (React/Next.js)",
            experience_level: "middle",
            language: "vi",
            mode: "text",
            status: "completed",
            total_score: 79.0,
            started_at: new Date(Date.now() - 86400000).toISOString(),
            completed_at: new Date(Date.now() - 86400000).toISOString(),
            total_turns: 3,
          },
        ],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, modeFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-7 h-7 text-sky-400" />
            <span>Lịch Sử Phỏng Vấn</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tra cứu, lọc và xem lại toàn bộ các phiên phỏng vấn và bản ghi âm giọng nói trong quá khứ.
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

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>Bộ lọc:</span>
          </div>

          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">Tất cả hình thức (Mode)</option>
            <option value="voice">Ghi âm Voice</option>
            <option value="text">Nhập Text</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="in_progress">Đang thực hiện</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Tìm thấy <span className="text-sky-400 font-bold">{data?.total || 0}</span> phiên
        </div>
      </div>

      {/* History Table / Card List */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mb-2" />
            <span>Đang nạp danh sách lịch sử...</span>
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Mã phiên</th>
                  <th className="px-5 py-4">Vị trí & Ngành nghề</th>
                  <th className="px-5 py-4">Hình thức</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Điểm số</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.items.map((item) => (
                  <tr key={item.session_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      #{item.session_id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100">
                        {item.role_name || "Vị trí tổng hợp"}
                      </div>
                      <div className="text-xs text-slate-500">{item.domain_name || "Chung"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                        {item.mode === "voice" ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-sky-400" /> Voice
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Text
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {item.status === "completed" ? "Đã hoàn thành" : "Đang thực hiện"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {item.total_score !== null ? (
                        <span className="text-sm font-bold text-sky-400">
                          {item.total_score} / 100
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {new Date(item.started_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link
                        href={`/practice/${item.session_id}/result`}
                        className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 transition-colors"
                      >
                        Bảng điểm
                      </Link>
                      <Link
                        href={`/dashboard/interviews/${item.session_id}`}
                        className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Nghe lại
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            Không tìm thấy phiên phỏng vấn nào phù hợp với bộ lọc.
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.total_pages > 1 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Trang <span className="font-semibold text-slate-200">{data.page}</span> /{" "}
              {data.total_pages}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={data.page >= data.total_pages}
                onClick={() => setPage((p) => Math.min(p + 1, data.total_pages))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
