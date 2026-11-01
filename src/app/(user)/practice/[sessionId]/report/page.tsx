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
      } catch (err: any) {
      setResult(null);
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

  if (!result) {
    return <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <p>Chưa tải được báo cáo. Vui lòng thử lại sau.</p>
      <Link href={`/practice/${sessionId}/result`}>Quay lại trang kết quả</Link>
    </div>;
  }

  const pdfUrl = historyApi.getPdfDownloadUrl(sessionId);
  const data = result;

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
              <td><strong>{data.total_score === null ? "Chưa đủ dữ liệu" : `${data.total_score} / 100`}</strong></td>
              <td>Trung bình các lượt đã chấm; với kịch bản JD, câu hỏi đào sâu được gộp theo nội dung.</td>
            </tr>
            <tr>
              <td>Độ rõ ràng & Mạch lạc (Clarity)</td>
              <td>{data.clarity_score === null ? "Chưa chấm" : `${data.clarity_score} / 100`}</td>
              <td>Trả lời trọng tâm, ngôn từ chính xác, hạn chế giải thích lan man.</td>
            </tr>
            <tr>
              <td>Cấu trúc logic (Logical Structure)</td>
              <td>{data.structure_score === null ? "Chưa chấm" : `${data.structure_score} / 100`}</td>
              <td>Các luận điểm có tính liên kết chặt chẽ, dễ theo dõi.</td>
            </tr>
            <tr>
              <td>Dẫn chứng thực tế (Concrete Evidence)</td>
              <td>{data.evidence_score === null ? "Chưa chấm" : `${data.evidence_score} / 100`}</td>
              <td>Có ví dụ hoặc cách kiểm chứng cụ thể; số liệu chỉ khi có thật.</td>
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
                {data.speaking_pace_wpm === null ? "Chưa đo" : `${data.speaking_pace_wpm} WPM`} {data.pace_rating && <strong>· {data.pace_rating}</strong>}
              </td>
            </tr>
            <tr>
              <td>Số lần phát hiện từ đệm</td>
              <td>{data.filler_count === null ? "Chưa đo" : `${data.filler_count} lần`}</td>
            </tr>
            <tr>
              <td>Tổng khoảng lặng ngập ngừng</td>
              <td>{data.pause_duration === null ? "Chưa đo" : `${data.pause_duration} giây`}</td>
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
                <div className={shared.bubble}>{turn.message_text || turn.transcribed_text}</div>
                {turn.speaker !== "candidate" && turn.transcribed_text && <div className={shared.bubble}>Ứng viên: {turn.transcribed_text}</div>}
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
