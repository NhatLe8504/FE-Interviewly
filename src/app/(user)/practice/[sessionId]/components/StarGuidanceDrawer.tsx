"use client";

import { useState } from "react";
import { Sparkles, X, ChevronRight, CheckCircle2 } from "lucide-react";

interface StarGuidanceDrawerProps {
  starTip?: string;
}

export function StarGuidanceDrawer({ starTip }: StarGuidanceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const starFramework = [
    {
      letter: "S",
      title: "Situation (Tình huống)",
      color: "#3b82f6",
      desc: "Mô tả bối cảnh cụ thể mà bạn gặp phải: Công ty nào, dự án gì, thách thức là gì?",
      starter: "Tại dự án X ở công ty cũ, khi hệ thống gặp tình trạng...",
    },
    {
      letter: "T",
      title: "Task (Nhiệm vụ)",
      color: "#8b5cf6",
      desc: "Trách nhiệm cá nhân của bạn trong tình huống đó là gì? Mục tiêu cần đạt được?",
      starter: "Mục tiêu cụ thể của tôi là phải tối ưu hóa độ trễ xuống dưới 200ms trong 2 tuần...",
    },
    {
      letter: "A",
      title: "Action (Hành động)",
      color: "#f59e0b",
      desc: "Bạn đã làm gì cụ thể? Quyết định kỹ thuật, công cụ sử dụng, cách phối hợp đội ngũ?",
      starter: "Tôi đã chủ động phân tích memory leak bằng profiling tool, sau đó refactor lại...",
    },
    {
      letter: "R",
      title: "Result (Kết quả)",
      color: "#10b981",
      desc: "Kết quả định lượng đạt được? Tỷ lệ % cải thiện, bài học kinh nghiệm?",
      starter: "Kết quả là throughput tăng 35%, giảm 90% crash report và khách hàng rất hài lòng...",
    },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          right: "24px",
          top: "140px",
          zIndex: 40,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "9999px",
          background: "linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: "700",
          border: "none",
          boxShadow: "0 8px 24px rgba(255, 77, 79, 0.35)",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <Sparkles size={16} />
        <span>Gợi ý STAR</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 50,
            transition: "opacity 0.2s ease-out",
          }}
        />
      )}

      {/* Drawer Panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 90vw)",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.15)",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255, 122, 69, 0.12)",
                color: "#ff7a45",
              }}
            >
              <Sparkles size={18} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
                Khung trả lời STAR
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                Chuẩn hóa cấu trúc câu trả lời thuyết phục
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              color: "#9ca3af",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Custom Tip for Current Question */}
          {starTip && (
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(255, 122, 69, 0.08) 0%, rgba(255, 178, 107, 0.12) 100%)",
                border: "1px solid rgba(255, 122, 69, 0.2)",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#ea580c",
                }}
              >
                Gợi ý cho câu hỏi hiện tại
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
                {starTip}
              </p>
            </div>
          )}

          {/* 4 Pillars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {starFramework.map((item) => (
              <div
                key={item.letter}
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "14px 16px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      backgroundColor: item.color,
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "800",
                    }}
                  >
                    {item.letter}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {item.title}
                  </span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#4b5563", lineHeight: "1.5" }}>
                  {item.desc}
                </p>
                <div
                  style={{
                    fontSize: "11px",
                    fontStyle: "italic",
                    color: "#6b7280",
                    backgroundColor: "#f3f4f6",
                    padding: "6px 10px",
                    borderRadius: "6px",
                  }}
                >
                  Gợi ý mở đầu: &quot;{item.starter}&quot;
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "12px 14px",
              borderRadius: "10px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: "2px", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "12px", color: "#15803d", lineHeight: "1.5" }}>
              <strong>Mẹo phỏng vấn:</strong> Giữ thời lượng trả lời từ 1.5 - 3 phút (khoảng 150 - 300 từ) để AI đánh giá đầy đủ nhất các tiêu chí.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
