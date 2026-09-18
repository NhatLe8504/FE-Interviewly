"use client";

import React, { useState } from "react";
import { History, X, Bot, User, Clock, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import type { InterviewTurnItem } from "@/hooks/useInterviewSession";

interface ConversationTimelineDrawerProps {
  turns: InterviewTurnItem[];
  currentTurnNumber: number;
}

export function ConversationTimelineDrawer({
  turns,
  currentTurnNumber,
}: ConversationTimelineDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group into Q&A turn pairs
  const aiTurns = turns.filter((t) => t.speaker === "ai");
  const userTurns = turns.filter((t) => t.speaker === "user");

  return (
    <>
      {/* Floating Toggle Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          left: "24px",
          top: "140px",
          zIndex: 40,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "9999px",
          background: "rgba(255, 255, 255, 0.85)",
          border: "1px solid rgba(106, 72, 49, 0.2)",
          backdropFilter: "blur(20px)",
          color: "#211914",
          fontSize: "12px",
          fontWeight: "750",
          boxShadow: "0 8px 24px -4px rgba(84, 50, 27, 0.12), inset 0 1px 2px rgba(255, 255, 255, 1)",
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        title="Xem lại lịch sử các câu hỏi & câu trả lời đã diễn ra"
      >
        <History size={15} className="text-[#d98236]" />
        <span>Lịch sử hội thoại</span>
        <span
          style={{
            padding: "2px 7px",
            borderRadius: "999px",
            background: "rgba(217, 130, 54, 0.15)",
            color: "#8b4513",
            fontSize: "11px",
            fontWeight: "800",
          }}
        >
          {turns.length}
        </span>
      </button>

      {/* Slide-out Drawer Backdrop */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(33, 25, 20, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "flex-start",
            animation: "fadeIn 0.2s ease both",
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer Sheet */}
          <div
            style={{
              width: "480px",
              maxWidth: "calc(100vw - 32px)",
              height: "100%",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(32px) saturate(200%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "10px 0 40px rgba(84, 50, 27, 0.2)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(106, 72, 49, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, rgba(217, 130, 54, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #d98236 0%, #8b4513 100%)",
                    color: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <History size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#211914" }}>
                    Lịch Sử Phỏng Vấn
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "rgba(45, 31, 23, 0.65)" }}>
                    Dòng thời gian hội thoại (Lượt {currentTurnNumber})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid rgba(106, 72, 49, 0.15)",
                  background: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#211914",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation Timeline List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {turns.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 16px",
                    color: "rgba(45, 31, 23, 0.6)",
                    fontSize: "13px",
                  }}
                >
                  Chưa có câu hỏi nào được lưu lại.
                </div>
              ) : (
                turns.map((turn, index) => {
                  const isAi = turn.speaker === "ai";
                  return (
                    <div
                      key={turn.id || index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        position: "relative",
                        paddingLeft: "28px",
                        borderLeft: `2px dashed ${isAi ? "#d98236" : "#10b981"}`,
                      }}
                    >
                      {/* Timeline Dot Icon */}
                      <span
                        style={{
                          position: "absolute",
                          left: "-13px",
                          top: "2px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: isAi ? "#d98236" : "#10b981",
                          color: "#ffffff",
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {isAi ? <Bot size={12} /> : <User size={12} />}
                      </span>

                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: isAi ? "#8b4513" : "#059669",
                          }}
                        >
                          {isAi ? `AI Interviewer (Câu ${turn.turnNumber || index + 1})` : "Câu trả lời của bạn"}
                        </span>
                        {turn.durationSeconds !== undefined && turn.durationSeconds !== null && (
                          <span
                            style={{
                              fontSize: "10.5px",
                              color: "rgba(45, 31, 23, 0.5)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Clock size={10} />
                            {turn.durationSeconds}s
                          </span>
                        )}
                      </div>

                      {/* Content Bubble */}
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: "16px",
                          background: isAi
                            ? "linear-gradient(135deg, rgba(217, 130, 54, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)"
                            : "rgba(255, 255, 255, 0.8)",
                          border: `1px solid ${isAi ? "rgba(217, 130, 54, 0.25)" : "rgba(16, 185, 129, 0.25)"}`,
                          fontSize: "13px",
                          lineHeight: "1.55",
                          color: "#211914",
                          boxShadow: "0 2px 8px rgba(84, 50, 27, 0.04)",
                        }}
                      >
                        {turn.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}