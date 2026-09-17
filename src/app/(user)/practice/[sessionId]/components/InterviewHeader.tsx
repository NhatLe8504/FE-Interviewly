"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Square, AlertTriangle, ChevronLeft } from "lucide-react";
import type { SessionMetadata } from "@/hooks/useInterviewSession";
import { useI18n } from "@/context/I18nContext";

interface InterviewHeaderProps {
  sessionId: string;
  metadata: SessionMetadata;
  turnNumber: number;
  totalEstimatedTurns: number;
  sessionDurationSeconds: number;
  isCompleted: boolean;
  onEndEarly: () => void;
}

export function InterviewHeader({
  sessionId,
  metadata,
  turnNumber,
  totalEstimatedTurns,
  sessionDurationSeconds,
  isCompleted,
  onEndEarly,
}: InterviewHeaderProps) {
  const { locale } = useI18n();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Left: Title & Tags */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Link
              href="/practice"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#6b7280",
                textDecoration: "none",
              }}
            >
              <ChevronLeft size={14} /> {locale === "vi" ? "Thiết lập lại" : "Back to setup"}
            </Link>
            <span style={{ color: "#d1d5db" }}>•</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ff7a45",
              }}
            >
              Phiên phỏng vấn AI
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 3vw, 28px)",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              color: "#111827",
            }}
          >
            {metadata.roleLabel} Mock Interview
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: "#f3f4f6",
                color: "#4b5563",
              }}
            >
              {metadata.domainLabel}
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: "#f3f4f6",
                color: "#4b5563",
              }}
            >
              {metadata.levelLabel}
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor: "#f3f4f6",
                color: "#4b5563",
              }}
            >
              {metadata.languageLabel}
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "700",
                backgroundColor: "rgba(255, 122, 69, 0.12)",
                color: "#ea580c",
              }}
            >
              {metadata.mode === "voice" ? "Chế độ Giọng nói" : "Chế độ Văn bản"}
            </span>
          </div>
        </div>

        {/* Right: Progress & Clock */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Round counter */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase" }}>
              Tiến độ câu hỏi
            </span>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#111827" }}>
              Câu {Math.min(turnNumber, totalEstimatedTurns)} / {totalEstimatedTurns}
            </span>
          </div>

          {/* Session Timer */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Clock size={16} color="#ff7a45" />
            <span style={{ fontSize: "14px", fontWeight: "700", fontFamily: "monospace" }}>
              {formatTimer(sessionDurationSeconds)}
            </span>
          </div>

          {/* End Early Button */}
          {!isCompleted && (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: "transparent",
                color: "#dc2626",
                border: "1px solid #fca5a5",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Square size={13} />
              <span>Kết thúc sớm</span>
            </button>
          )}
        </div>
      </header>

      {/* Early termination modal */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "420px",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#111827" }}>
              Dừng buổi phỏng vấn sớm?
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
              Bạn có chắc chắn muốn kết thúc phiên phỏng vấn này không? Các câu trả lời đã nộp sẽ được lưu và hệ thống vẫn tạo báo cáo cho các câu bạn đã trả lời.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#f3f4f6",
                  color: "#4b5563",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Tiếp tục phỏng vấn
              </button>
              <Link
                href={`/practice/${sessionId}/result`}
                onClick={() => {
                  setShowConfirmModal(false);
                  onEndEarly();
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Xác nhận kết thúc
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
