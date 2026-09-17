"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, User, CheckCircle2, AlertCircle, Volume2, Square } from "lucide-react";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { InterviewHeader } from "./components/InterviewHeader";
import { AiStageAvatar } from "./components/AiStageAvatar";
import { ResponseInputArea } from "./components/ResponseInputArea";
import { StarGuidanceDrawer } from "./components/StarGuidanceDrawer";
import { UserTooltip } from "@/components/user-component/common";
import { useI18n } from "@/context/I18nContext";
import shared from "../shared.module.css";

export default function InterviewRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { t, locale } = useI18n();

  const {
    metadata,
    turns,
    turnNumber,
    totalEstimatedTurns,
    currentQuestion,
    currentStarTip,
    aiState,
    isStreaming,
    isSubmitting,
    isCompleted,
    sessionDurationSeconds,
    error,
    submitTurn,
    endSessionEarly,
  } = useInterviewSession(sessionId);

  // AI Voice Text-To-Speech
  const tts = useTextToSpeech();
  const [insertedStarter, setInsertedStarter] = useState<string | null>(null);

  const historyRef = useRef<HTMLDivElement>(null);
  const lastSpokenQuestionRef = useRef<string>("");

  // Automatically speak question when AI finishes streaming a new question
  useEffect(() => {
    if (
      !isStreaming &&
      currentQuestion &&
      !isCompleted &&
      tts.isAutoSpeak &&
      currentQuestion !== lastSpokenQuestionRef.current
    ) {
      lastSpokenQuestionRef.current = currentQuestion;
      const lang = metadata.languageLabel === "English" ? "en" : "vi";
      // Small timeout for natural speech initiation
      const timer = setTimeout(() => {
        tts.speak(currentQuestion, lang);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isCompleted, isStreaming, metadata.languageLabel, tts]);

  // Stop TTS when session is completed or submission is in progress
  useEffect(() => {
    if (isCompleted || isSubmitting) {
      tts.stop();
    }
  }, [isCompleted, isSubmitting, tts]);

  // Auto-scroll transcript on new turn or streaming update
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [turns, currentQuestion, isStreaming]);

  const handleSubmitAnswer = async (
    answerText: string,
    audioBlob?: Blob | null,
    durationSeconds?: number
  ): Promise<boolean> => {
    tts.stop();
    return await submitTurn(answerText, audioBlob, durationSeconds);
  };

  const handleManualPlayQuestion = () => {
    if (!currentQuestion) return;
    const lang = metadata.languageLabel === "English" ? "en" : "vi";
    tts.speak(currentQuestion, lang);
  };

  return (
    <div className={shared.shell}>
      {/* STAR Guidance Slide-out Panel */}
      <StarGuidanceDrawer
        starTip={currentStarTip}
        onInsertStarter={(text) => setInsertedStarter(text)}
      />

      {/* Header with timer, progress, metadata */}
      <InterviewHeader
        sessionId={sessionId}
        metadata={metadata}
        turnNumber={turnNumber}
        totalEstimatedTurns={totalEstimatedTurns}
        sessionDurationSeconds={sessionDurationSeconds}
        isCompleted={isCompleted}
        onEndEarly={() => {
          tts.stop();
          endSessionEarly();
        }}
      />

      {/* AI Coach Stage & Status Indicator */}
      <div style={{ marginBottom: "18px" }}>
        <AiStageAvatar
          state={aiState}
          roleName={`${metadata.roleLabel} Coach`}
          isSpeakingAudio={tts.isSpeaking}
          isAutoSpeak={tts.isAutoSpeak}
          isAudioSupported={tts.isSupported}
          onPlayAudio={handleManualPlayQuestion}
          onStopAudio={tts.stop}
          onToggleAutoSpeak={tts.toggleAutoSpeak}
        />
      </div>

      {/* Error notice if any */}
      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Current Active Question Card */}
      <div className={shared.card} style={{ position: "relative", overflow: "hidden" }}>
        {/* Subtle accent indicator */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              aiState === "speaking" || tts.isSpeaking
                ? "linear-gradient(90deg, #ff7a45, #ff4d4f)"
                : aiState === "thinking"
                ? "linear-gradient(90deg, #8b5cf6, #ec4899)"
                : "linear-gradient(90deg, #10b981, #06b6d4)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <p className={shared.questionLead} style={{ margin: 0 }}>
            {isCompleted ? (locale === "vi" ? "Tổng kết phiên" : "Session Summary") : (locale === "vi" ? `Câu hỏi số ${turnNumber} / ${totalEstimatedTurns}` : `Question ${turnNumber} of ${totalEstimatedTurns}`)}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Play/Stop audio icon right on the question */}
            {tts.isSupported && currentQuestion && !isCompleted && !isStreaming && (
              <UserTooltip
                content={
                  tts.isSpeaking
                    ? locale === "vi"
                      ? "Dừng giọng nói"
                      : "Stop voice"
                    : locale === "vi"
                    ? "Nghe lại câu hỏi này"
                    : "Listen to question"
                }
              >
                <button
                  type="button"
                  onClick={tts.isSpeaking ? tts.stop : handleManualPlayQuestion}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid #fed7aa",
                    backgroundColor: tts.isSpeaking ? "#fff7ed" : "#fefce8",
                    color: tts.isSpeaking ? "#ea580c" : "#ca8a04",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {tts.isSpeaking ? (
                    <>
                      <Square size={11} fill="#ea580c" />
                      <span>{locale === "vi" ? "Dừng" : "Stop"}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} />
                      <span>{locale === "vi" ? "Nghe" : "Listen"}</span>
                    </>
                  )}
                </button>
              </UserTooltip>
            )}

            {isStreaming && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#ff7a45",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#ff7a45",
                    display: "inline-block",
                    animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
                {locale === "vi" ? "Đang stream câu hỏi…" : "Streaming question…"}
              </span>
            )}
          </div>
        </div>

        <p
          className={shared.questionText}
          style={{
            minHeight: "44px",
            fontSize: "18px",
            fontWeight: "600",
            lineHeight: "1.6",
            color: "#111827",
          }}
        >
          {currentQuestion || (
            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
              {locale === "vi" ? "Đang chuẩn bị câu hỏi phỏng vấn…" : "Preparing interview question…"}
            </span>
          )}
        </p>

        {/* Quick STAR Hint Banner below question */}
        {!isCompleted && currentStarTip && (
          <div className={shared.starBox} style={{ marginTop: "12px" }}>
            <p className={shared.starTitle}>{locale === "vi" ? "Gợi ý phản xạ nhanh (STAR)" : "Quick STAR Tip"}</p>
            <p className={shared.starText}>{currentStarTip}</p>
          </div>
        )}

        {/* Response Input Area (Text / Voice STT / Waveform) */}
        {!isCompleted ? (
          <ResponseInputArea
            sessionId={sessionId}
            defaultMode={metadata.mode}
            language={metadata.languageLabel === "English" ? "en-US" : "vi-VN"}
            isCompleted={isCompleted}
            isSubmitting={isSubmitting}
            insertedStarter={insertedStarter}
            onVoiceStart={tts.stop}
            onSubmit={handleSubmitAnswer}
          />
        ) : (
          <div
            style={{
              marginTop: "24px",
              padding: "24px",
              borderRadius: "16px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              textAlign: "center",
            }}
          >
            <CheckCircle2 size={36} color="#16a34a" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "800", color: "#166534" }}>
              {locale === "vi" ? "Phiên phỏng vấn đã hoàn tất thành công!" : "Interview Session Completed!"}
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#15803d" }}>
              Toàn bộ dữ liệu âm thanh, văn bản và tốc độ phản xạ của bạn đã được ghi nhận. Hệ thống đã tính toán xong điểm Rubric và gợi ý cải thiện.
            </p>
            <Link
              href={`/practice/${sessionId}/result`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(255, 77, 79, 0.35)",
              }}
            >
              <span>{locale === "vi" ? "Xem bảng điểm & Phân tích chi tiết" : "View Detailed Score & Rubric Report"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Conversation Transcript History */}
      <div className={shared.card} style={{ marginTop: "20px" }}>
        <h2 className={shared.cardTitle}>Nhật ký hội thoại (Conversation Transcript)</h2>
        <p className={shared.cardHint}>
          Toàn bộ lịch sử các lượt hỏi - đáp được lưu vết thời gian thực.
        </p>

        <div ref={historyRef} className={shared.history} style={{ maxHeight: "380px", overflowY: "auto" }}>
          {turns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: "13px" }}>
              {locale === "vi" ? "Lịch sử hội thoại sẽ xuất hiện tại đây khi bắt đầu lượt hỏi đầu tiên…" : "Conversation history will appear here once the first turn begins…"}
            </div>
          ) : (
            turns.map((turn) => (
              <div
                key={turn.id}
                className={`${shared.turn} ${turn.speaker === "ai" ? shared.turnAi : shared.turnUser}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span className={shared.who} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {turn.speaker === "ai" ? (
                      <>
                        <Bot size={13} color="#ff7a45" /> AI Coach
                      </>
                    ) : (
                      <>
                        <User size={13} color="#3b82f6" /> {locale === "vi" ? "Ứng viên (Bạn)" : "Candidate (You)"}
                      </>
                    )}
                  </span>
                  {turn.durationSeconds !== undefined && turn.durationSeconds > 0 && (
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      ({turn.durationSeconds}s)
                    </span>
                  )}
                </div>
                <div className={shared.bubble}>{turn.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}