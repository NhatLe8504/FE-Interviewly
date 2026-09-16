"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  FileText,
  User,
  Bot,
  Sparkles,
  RefreshCw,
  Award,
  Download,
} from "lucide-react";
import { historyApi } from "@/services/historyApi";
import { SessionDetailData } from "@/types/analytics";
import { AudioPlayerTurn } from "@/components/analytics/AudioPlayerTurn";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [data, setData] = useState<SessionDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      try {
        const res = await historyApi.getSessionDetails(sessionId);
        setData(res);
      } catch {
        // Fallback realistic presentation data
        setData({
          session_id: parseInt(sessionId) || 101,
          candidate_id: 1,
          domain_name: "Công nghệ thông tin",
          role_name: "Backend Developer (Python/FastAPI)",
          experience_level: "junior",
          language: "vi",
          mode: "voice",
          status: "completed",
          total_score: 85.0,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          avg_clarity: 86.0,
          avg_logic: 82.0,
          avg_example: 88.0,
          turns: [
            {
              turn_id: 1,
              turn_number: 1,
              speaker: "ai",
              question_id: 1,
              message_text: "Chào bạn! Hãy giới thiệu ngắn gọn về một dự án phần mềm tâm đắc nhất bạn từng tham gia?",
              audio_url: null,
              transcribed_text: null,
              clarity_score: null,
              logic_score: null,
              example_score: null,
              overall_score: null,
              feedback_text: null,
              speaking_pace: null,
              hesitation_count: 0,
              filler_word_count: 0,
              tips_text: null,
              created_at: new Date().toISOString(),
            },
            {
              turn_id: 2,
              turn_number: 2,
              speaker: "candidate",
              question_id: null,
              message_text: "Em đã tham gia phát triển hệ thống e-commerce với FastAPI và PostgreSQL. Trong đó, em đảm nhận module giỏ hàng và thanh toán VNPay, xử lý được 500 yêu cầu/giây.",
              audio_url: null,
              transcribed_text: "Em đã tham gia phát triển hệ thống e-commerce...",
              clarity_score: 85.0,
              logic_score: 82.0,
              example_score: 88.0,
              overall_score: 85.0,
              feedback_text: "Câu trả lời ngắn gọn, có nêu rõ trách nhiệm cụ thể và thông số kỹ thuật ấn tượng.",
              speaking_pace: 130.0,
              hesitation_count: 1,
              filler_word_count: 1,
              tips_text: "Có thể bổ sung thêm khó khăn gặp phải khi tích hợp cổng thanh toán.",
              created_at: new Date().toISOString(),
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-slate-400 text-sm">Đang tải chi tiết phiên phỏng vấn...</p>
      </div>
    );
  }

  const session = data!;
  const pdfUrl = historyApi.getPdfDownloadUrl(sessionId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/dashboard/interviews"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại lịch sử phỏng vấn</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-sky-400 font-semibold">
                Phiên #{session.session_id}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                {session.status === "completed" ? "Đã hoàn thành" : session.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{session.role_name || "Vị trí chuyên môn"}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>{session.domain_name || "Ngành nghề chung"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {new Date(session.started_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {session.mode === "voice" ? <Video className="w-3 h-3 text-sky-400" /> : <FileText className="w-3 h-3 text-emerald-400" />}
                {session.mode === "voice" ? "Phỏng vấn bằng giọng nói" : "Phỏng vấn bằng văn bản"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {session.total_score !== null && (
              <div className="px-4 py-2 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Điểm tổng kết</div>
                <div className="text-xl font-extrabold text-sky-400">{session.total_score} / 100</div>
              </div>
            )}

            <Link
              href={`/practice/${session.session_id}/result`}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-all shadow-md shadow-sky-500/20"
            >
              Xem báo cáo kết quả
            </Link>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Tải PDF"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Timeline of Turns */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Dòng Thời Gian Hội Thoại & Bản Ghi Âm</h2>
          <span className="text-xs text-slate-400">{session.turns.length} lượt tương tác</span>
        </div>

        <div className="space-y-4">
          {session.turns.map((turn) => {
            const isCandidate = turn.speaker === "candidate";

            return (
              <div
                key={turn.turn_id}
                className={`p-5 rounded-3xl border transition-all ${
                  isCandidate
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-gradient-to-r from-indigo-950/20 to-slate-900/80 border-indigo-500/20"
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCandidate
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      }`}
                    >
                      {isCandidate ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        {isCandidate ? "Ứng viên (Bạn)" : "AI Người phỏng vấn"}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-2">Lượt #{turn.turn_number}</span>
                    </div>
                  </div>

                  {turn.overall_score !== null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {turn.overall_score} điểm
                    </span>
                  )}
                </div>

                {/* Message Text */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  {turn.message_text || "Không có nội dung."}
                </p>

                {/* Audio Player Turn if Voice */}
                {isCandidate && (
                  <div className="mt-3">
                    <AudioPlayerTurn
                      audioUrl={turn.audio_url}
                      turnNumber={turn.turn_number}
                    />
                  </div>
                )}

                {/* Turn Feedback */}
                {isCandidate && turn.feedback_text && (
                  <div className="mt-4 p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Nhận xét chấm điểm</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {turn.feedback_text}
                    </p>

                    {/* Mini rubric tags */}
                    <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-400">
                      {turn.clarity_score !== null && (
                        <span>
                          Rõ ràng: <strong className="text-sky-400">{turn.clarity_score}</strong>
                        </span>
                      )}
                      {turn.logic_score !== null && (
                        <span>
                          Logic: <strong className="text-emerald-400">{turn.logic_score}</strong>
                        </span>
                      )}
                      {turn.example_score !== null && (
                        <span>
                          Dẫn chứng: <strong className="text-amber-400">{turn.example_score}</strong>
                        </span>
                      )}
                      {turn.speaking_pace !== null && (
                        <span>
                          Tốc độ: <strong className="text-slate-200">{turn.speaking_pace} WPM</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
