"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  Send,
  Keyboard,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { AudioWaveformVisualizer } from "./AudioWaveformVisualizer";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface ResponseInputAreaProps {
  sessionId: string;
  defaultMode: "text" | "voice";
  language: string;
  isCompleted: boolean;
  isSubmitting: boolean;
  onSubmit: (answerText: string, audioBlob?: Blob | null, durationSeconds?: number) => Promise<boolean>;
}

export function ResponseInputArea({
  sessionId,
  defaultMode,
  language,
  isCompleted,
  isSubmitting,
  onSubmit,
}: ResponseInputAreaProps) {
  const [activeTab, setActiveTab] = useState<"text" | "voice">(defaultMode);
  const [textAnswer, setTextAnswer] = useState("");

  const voice = useVoiceRecording();

  // Keep text answer synced when voice transcript is recorded
  useEffect(() => {
    if (voice.transcript) {
      setTextAnswer(voice.transcript);
    }
  }, [voice.transcript]);

  const wordCount = textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0;
  const charCount = textAnswer.length;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = async () => {
    if (voice.isRecording) {
      await voice.stopRecording();
    } else {
      const ok = await voice.startRecording(language);
      if (!ok && voice.error) {
        // Microphone access failed
      }
    }
  };

  const handleSend = async () => {
    let finalAnswer = textAnswer.trim();

    if (voice.isRecording) {
      const stopped = await voice.stopRecording();
      finalAnswer = stopped.transcript || finalAnswer;
      if (!finalAnswer) return;
      const success = await onSubmit(finalAnswer, stopped.audioBlob, stopped.duration);
      if (success) {
        setTextAnswer("");
        voice.resetRecording();
      }
    } else {
      if (!finalAnswer) return;
      const success = await onSubmit(finalAnswer, voice.audioBlob, voice.durationSeconds);
      if (success) {
        setTextAnswer("");
        voice.resetRecording();
      }
    }
  };

  const handleClear = () => {
    setTextAnswer("");
    voice.resetRecording();
  };

  const clock = `${String(Math.floor(voice.durationSeconds / 60)).padStart(2, "0")}:${String(
    voice.durationSeconds % 60
  ).padStart(2, "0")}`;

  return (
    <div
      style={{
        marginTop: "20px",
        borderRadius: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* Top bar: Mode switcher & stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid #f3f4f6",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
              backgroundColor: activeTab === "text" ? "#ffffff" : "transparent",
              color: activeTab === "text" ? "#ff7a45" : "#6b7280",
              boxShadow: activeTab === "text" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Keyboard size={14} />
            <span>Văn bản (Text)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
              backgroundColor: activeTab === "voice" ? "#ffffff" : "transparent",
              color: activeTab === "voice" ? "#ff7a45" : "#6b7280",
              boxShadow: activeTab === "voice" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Mic size={14} />
            <span>Giọng nói (Voice STT)</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#6b7280" }}>
          <span>
            <strong>{wordCount}</strong> từ ({charCount} ký tự)
          </span>
          <span style={{ color: "#d1d5db" }}>•</span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>Ctrl + Enter để gửi</span>
        </div>
      </div>

      {/* Voice Mode Area */}
      {activeTab === "voice" && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f3f4f6",
            backgroundColor: voice.isRecording ? "rgba(255, 122, 69, 0.04)" : "#ffffff",
          }}
        >
          {/* Waveform & Record Control */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              disabled={isCompleted || isSubmitting}
              onClick={handleVoiceToggle}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                backgroundColor: voice.isRecording ? "#ef4444" : "#ff7a45",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "13px",
                cursor: isCompleted || isSubmitting ? "not-allowed" : "pointer",
                boxShadow: voice.isRecording
                  ? "0 4px 16px rgba(239, 68, 68, 0.4)"
                  : "0 4px 16px rgba(255, 122, 69, 0.3)",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {voice.isRecording ? <Square size={16} /> : <Mic size={16} />}
              <span>{voice.isRecording ? "Dừng ghi âm" : "Bắt đầu nói"}</span>
            </button>

            {voice.isRecording && (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#ef4444",
                  fontFamily: "monospace",
                }}
              >
                ● {clock}
              </span>
            )}

            {/* Live Canvas Soundwave */}
            <div style={{ flex: 1, minWidth: "120px" }}>
              <AudioWaveformVisualizer isRecording={voice.isRecording} volume={voice.volume} height={44} />
            </div>
          </div>

          {/* Error notice if micro blocked */}
          {voice.error && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#b91c1c",
                fontSize: "12px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{voice.error}</span>
            </div>
          )}

          {/* Web Speech support notification */}
          {!voice.isSpeechRecognitionSupported && (
            <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#9ca3af" }}>
              * Trình duyệt của bạn đang dùng cơ chế ghi âm Audio Blob trực tiếp (hỗ trợ chuyển văn bản khi nộp).
            </p>
          )}

          {/* Interim transcript indicator */}
          {voice.isRecording && voice.interimTranscript && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#f3f4f6",
                fontSize: "12px",
                color: "#4b5563",
                fontStyle: "italic",
              }}
            >
              Đang nhận diện: &quot;{voice.interimTranscript}&quot;…
            </div>
          )}
        </div>
      )}

      {/* Main editable text area */}
      <div style={{ padding: "16px 20px" }}>
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCompleted || isSubmitting}
          placeholder={
            activeTab === "voice"
              ? "Giọng nói của bạn sẽ được chuyển thành văn bản tại đây. Bạn có thể tự do gõ sửa lỗi chính tả trước khi bấm Gửi…"
              : "Nhập câu trả lời của bạn ở đây theo cấu trúc STAR (Tình huống -> Nhiệm vụ -> Hành động -> Kết quả)…"
          }
          style={{
            width: "100%",
            minHeight: "110px",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontSize: "14px",
            lineHeight: "1.7",
            color: "#1f2937",
            fontFamily: "inherit",
            backgroundColor: "transparent",
          }}
        />

        {/* Bottom Actions Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {textAnswer && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting || isCompleted}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#9ca3af",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={12} />
                <span>Xóa trắng</span>
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {!isCompleted ? (
              <button
                type="button"
                onClick={handleSend}
                disabled={!textAnswer.trim() || isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "12px",
                  backgroundColor: !textAnswer.trim() || isSubmitting ? "#e5e7eb" : "#ff7a45",
                  color: !textAnswer.trim() || isSubmitting ? "#9ca3af" : "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: "none",
                  cursor: !textAnswer.trim() || isSubmitting ? "not-allowed" : "pointer",
                  boxShadow:
                    !textAnswer.trim() || isSubmitting
                      ? "none"
                      : "0 4px 14px rgba(255, 122, 69, 0.35)",
                  transition: "all 0.2s",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles size={16} className="animate-spin" />
                    <span>Đang nộp câu trả lời…</span>
                  </>
                ) : (
                  <>
                    <span>Gửi câu trả lời</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/practice/${sessionId}/result`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(255, 77, 79, 0.35)",
                }}
              >
                <span>Xem kết quả & Bảng điểm</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
