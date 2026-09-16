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
  insertedStarter?: string | null;
  onVoiceStart?: () => void;
  onSubmit: (answerText: string, audioBlob?: Blob | null, durationSeconds?: number) => Promise<boolean>;
}

export function ResponseInputArea({
  sessionId,
  defaultMode,
  language,
  isCompleted,
  isSubmitting,
  insertedStarter,
  onVoiceStart,
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

  // Insert STAR starter template when candidate clicks from drawer
  useEffect(() => {
    if (insertedStarter) {
      setTextAnswer((prev) => {
        if (!prev.trim()) return insertedStarter;
        return `${prev.trim()}\n\n${insertedStarter}`;
      });
      setActiveTab("text"); // Switch to text tab so user can review and edit
    }
  }, [insertedStarter]);

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
      if (onVoiceStart) {
        onVoiceStart();
      }
      const ok = await voice.startRecording(language);
      if (!ok && voice.error) {
        // Microphone access error
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
            background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isSubmitting || isCompleted}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: isSubmitting || isCompleted ? "not-allowed" : "pointer",
                  backgroundColor: voice.isRecording ? "#ef4444" : "#ff7a45",
                  color: "#ffffff",
                  boxShadow: voice.isRecording
                    ? "0 0 20px rgba(239, 68, 68, 0.45)"
                    : "0 4px 14px rgba(255, 122, 69, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                {voice.isRecording ? <Square size={22} fill="#ffffff" /> : <Mic size={24} />}
              </button>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: voice.isRecording ? "#ef4444" : "#9ca3af",
                      animation: voice.isRecording ? "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" : "none",
                    }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {voice.isRecording ? "Đang thu âm..." : "Bấm Micro để nói"}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "monospace",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: "#f3f4f6",
                      color: "#4b5563",
                    }}
                  >
                    {clock}
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>
                  {voice.isRecording
                    ? "Nói to, rõ ràng theo cấu trúc STAR. Bấm dừng khi nói xong."
                    : "Hỗ trợ bóc băng thời gian thực. Bạn có thể sửa văn bản trước khi gửi."}
                </p>
              </div>
            </div>

            {/* Audio Waveform Canvas */}
            <div style={{ width: "240px", flexShrink: 0 }}>
              <AudioWaveformVisualizer isRecording={voice.isRecording} volume={voice.volume} />
            </div>
          </div>

          {/* Voice Error notice */}
          {voice.error && (
            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={14} />
              <span>{voice.error}</span>
            </div>
          )}

          {/* Web Speech support notification */}
          {!voice.isSpeechRecognitionSupported && (
            <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#9ca3af" }}>
              * Trình duyệt của bạn đang dùng cơ chế ghi âm Audio Blob trực tiếp (hỗ trợ chuyển văn bản khi nộp).
            </p>
          )}
        </div>
      )}

      {/* Editable Response Textarea */}
      <div style={{ padding: "16px 20px" }}>
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting || isCompleted}
          placeholder={
            activeTab === "voice"
              ? "Lời nói của bạn sẽ tự động xuất hiện ở đây... Bạn có thể chỉnh sửa tự do trước khi nộp."
              : "Nhập câu trả lời của bạn theo phương pháp STAR: Tình huống (S) -> Nhiệm vụ (T) -> Hành động (A) -> Kết quả (R)..."
          }
          style={{
            width: "100%",
            minHeight: "120px",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#1f2937",
            backgroundColor: "transparent",
            fontFamily: "inherit",
          }}
        />

        {/* Interim speech preview during live speech */}
        {voice.isRecording && voice.interimTranscript && (
          <div
            style={{
              padding: "8px 12px",
              marginTop: "8px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 122, 69, 0.08)",
              border: "1px dashed rgba(255, 122, 69, 0.3)",
              fontSize: "13px",
              color: "#c2410c",
              fontStyle: "italic",
            }}
          >
            Đang nhận diện: &quot;{voice.interimTranscript}&quot;
          </div>
        )}

        {/* Bottom Actions */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {textAnswer.trim().length > 0 && !isSubmitting && !isCompleted && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "6px",
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleSend}
              disabled={(!textAnswer.trim() && !voice.isRecording) || isSubmitting || isCompleted}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "12px",
                border: "none",
                background:
                  (!textAnswer.trim() && !voice.isRecording) || isSubmitting || isCompleted
                    ? "#e5e7eb"
                    : "linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)",
                color: (!textAnswer.trim() && !voice.isRecording) || isSubmitting || isCompleted ? "#9ca3af" : "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor:
                  (!textAnswer.trim() && !voice.isRecording) || isSubmitting || isCompleted
                    ? "not-allowed"
                    : "pointer",
                boxShadow:
                  (!textAnswer.trim() && !voice.isRecording) || isSubmitting || isCompleted
                    ? "none"
                    : "0 4px 14px rgba(255, 77, 79, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid #ffffff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span>AI đang phân tích...</span>
                </>
              ) : (
                <>
                  <span>Gửi câu trả lời</span>
                  <Send size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}