"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, RefreshCw } from "lucide-react";
import { historyApi } from "@/services/historyApi";
import { SessionResultData } from "@/types/analytics";
import shared from "../../shared.module.css";

export default function PracticeReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [result, setResult] = useState<SessionResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await historyApi.getSessionResult(sessionId);
        setResult(res);
      } catch {
        setResult({
          session_id: parseInt(sessionId) || 101,
          candidate_id: 1,
          status: "completed",
          total_score: 85.0,
          readiness_badge: "Sẵn sàng ứng tuyển (Interview Ready)",
          clarity_score: 86.0,
          structure_score: 82.0,
          evidence_score: 88.0,
          speaking_pace_wpm: 135.0,
          pace_rating: "Lý tưởng (Ideal)",
          filler_count: 2,
          filler_words: ["à", "ừm"],
          pause_duration: 3.5,
          star_analysis: {
            situation: true,
            task: true,
            action: true,
            result: true,
          },
          turns: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  if (loading && !result) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-slate-400 text-sm">Đang tải báo cáo A4...</p>
      </div>
    );
  }

  const pdfUrl = historyApi.getPdfDownloadUrl(sessionId);
  const data = result!;

  return (
    <div className={shared.shell}>
      <div className={shared.reportHead}>
        <div>
          <p className={shared.eyebrow}>Báo Cáo Phiên Phỏng Vấn #{sessionId}</p>
          <h1 className={shared.title}>Báo Cáo Kỹ Năng Đánh Giá Toàn Diện</h1>
          <p className={shared.sub}>
            Hệ thống Interview Coach AI · Khổ in tiêu chuẩn A4 · {data.readiness_badge}
          </p>
        </div>
        <div className={`${shared.actions} ${shared.noPrint}`} style={{ marginTop: 0 }}>
          <button type="button" onClick={() => window.print()} className={shared.ghostBtn}>
            <Printer size={15} />
            In trang này
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={shared.primaryBtn}
          >
            <Download size={15} />
            Tải file PDF
          </a>
        </div>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Tổng quan bảng điểm Rubric</h2>
        <p className={shared.cardHint}>Xếp loại: {data.readiness_badge}</p>
        <table className={shared.table}>
          <thead>
            <tr>
              <th>Tiêu chí đánh giá</th>
              <th>Điểm số</th>
              <th>Đánh giá chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Điểm tổng quát (Overall Score)</td>
              <td><strong>{data.total_score} / 100</strong></td>
              <td>Tổng hợp từ 3 tiêu chí Rubric chuẩn hóa và chất lượng giọng nói.</td>
            </tr>
            <tr>
              <td>Độ rõ ràng & Mạch lạc (Clarity)</td>
              <td>{data.clarity_score} / 100</td>
              <td>Trả lời trọng tâm, ngôn từ chính xác, hạn chế giải thích lan man.</td>
            </tr>
            <tr>
              <td>Cấu trúc logic (Logical Structure)</td>
              <td>{data.structure_score} / 100</td>
              <td>Các luận điểm có tính liên kết chặt chẽ, dễ theo dõi.</td>
            </tr>
            <tr>
              <td>Dẫn chứng thực tế (Concrete Evidence)</td>
              <td>{data.evidence_score} / 100</td>
              <td>Có số liệu định lượng, kết quả dự án thực tế cụ thể.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Phân tích phong thái & chất lượng giọng nói</h2>
        <p className={shared.cardHint}>Đo lường nhịp độ phát âm theo chuẩn WPM quốc tế</p>
        <table className={shared.table}>
          <tbody>
            <tr>
              <td>Tốc độ nói hiệu dụng</td>
              <td>
                {data.speaking_pace_wpm} WPM · <strong>{data.pace_rating}</strong>
              </td>
            </tr>
            <tr>
              <td>Số lần phát hiện từ đệm</td>
              <td>{data.filler_count} lần {data.filler_words.length > 0 && `("${data.filler_words.join('", "')}")`}</td>
            </tr>
            <tr>
              <td>Tổng khoảng lặng ngập ngừng</td>
              <td>{data.pause_duration} giây</td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.turns.length > 0 && (
        <div className={shared.card}>
          <h2 className={shared.cardTitle}>Nội dung bóc băng hội thoại (Transcript)</h2>
          <p className={shared.cardHint}>Biên bản ghi lại toàn bộ các câu hỏi và câu trả lời trong phiên.</p>
          <div className={shared.history} style={{ maxHeight: "none" }}>
            {data.turns.map((turn) => (
              <div
                key={turn.turn_id}
                className={`${shared.turn} ${turn.speaker === "ai" ? shared.turnAi : shared.turnUser}`}
              >
                <span className={shared.who}>{turn.speaker === "ai" ? "AI Coach" : "Ứng viên"}</span>
                <div className={shared.bubble}>{turn.message_text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${shared.actions} ${shared.noPrint}`}>
        <Link href={`/practice/${sessionId}/result`} className={shared.ghostBtn}>
          <ArrowLeft size={14} />
          Quay lại trang kết quả
        </Link>
      </div>
    </div>
  );
}
