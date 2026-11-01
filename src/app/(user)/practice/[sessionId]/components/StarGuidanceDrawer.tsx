"use client";

import { useState } from "react";
import { Sparkles, X, CheckCircle2, PlusCircle, Check } from "lucide-react";

import styles from "./starGuidanceDrawer.module.css";

interface StarGuidanceDrawerProps {
  starTip?: string;
  framework?: "behavioral" | "technical" | "situational" | "generic";
  onInsertStarter?: (starterText: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export function StarGuidanceDrawer({
  starTip,
  framework = "generic",
  onInsertStarter,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showTrigger = false,
}: StarGuidanceDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = () => {
    if (controlledOnClose) controlledOnClose();
    else setInternalIsOpen(false);
  };
  const handleOpen = () => setInternalIsOpen(true);
  const [insertedLetter, setInsertedLetter] = useState<string | null>(null);

  const starFramework = [
    {
      letter: "S",
      title: "Situation (Tình huống)",
      color: "#c26d25",
      desc: "Mô tả bối cảnh cụ thể mà bạn gặp phải: Công ty nào, dự án gì, thách thức là gì?",
      starter: "Tại dự án trước đây, khi hệ thống gặp tình trạng...",
    },
    {
      letter: "T",
      title: "Task (Nhiệm vụ)",
      color: "#8b4513",
      desc: "Trách nhiệm cá nhân của bạn trong tình huống đó là gì? Mục tiêu cần đạt được?",
      starter: "Mục tiêu cụ thể của tôi là phải tối ưu hóa độ trễ và xử lý sự cố trong vòng...",
    },
    {
      letter: "A",
      title: "Action (Hành động)",
      color: "#2d5a43",
      desc: "Bạn đã làm gì cụ thể? Quyết định kỹ thuật, công cụ sử dụng, cách phối hợp đội ngũ?",
      starter: "Tôi đã chủ động phân tích nguyên nhân gốc rễ, sau đó triển khai giải pháp...",
    },
    {
      letter: "R",
      title: "Result (Kết quả)",
      color: "#211914",
      desc: "Kết quả định lượng đạt được? Tỷ lệ % cải thiện, bài học kinh nghiệm?",
      starter: "Kết quả là hiệu năng tăng 30%, toàn bộ lỗi được khắc phục và hệ thống vận hành ổn định...",
    },
  ];

  const guidance = framework === "behavioral" ? starFramework : framework === "technical" ? [
    { letter: "1", title: "Cách tiếp cận", color: "#c26d25", desc: "Nêu giải pháp hoặc khái niệm phù hợp với yêu cầu.", starter: "Tôi sẽ tiếp cận vấn đề bằng cách..." },
    { letter: "2", title: "Lập luận", color: "#8b4513", desc: "Giải thích vì sao phương án này đúng trong bối cảnh câu hỏi.", starter: "Lý do tôi chọn cách này là..." },
    { letter: "3", title: "Đánh đổi", color: "#2d5a43", desc: "So sánh giới hạn và các phương án thay thế.", starter: "Đánh đổi quan trọng cần cân nhắc là..." },
    { letter: "4", title: "Kiểm chứng", color: "#211914", desc: "Nêu cách kiểm thử hoặc đo lường hiệu quả.", starter: "Tôi sẽ kiểm chứng bằng..." },
  ] : framework === "situational" ? [
    { letter: "1", title: "Ràng buộc", color: "#c26d25", desc: "Xác định mục tiêu, người liên quan và dữ kiện còn thiếu.", starter: "Trước hết tôi cần làm rõ..." },
    { letter: "2", title: "Phương án", color: "#8b4513", desc: "So sánh những cách giải quyết khả thi.", starter: "Tôi thấy có các phương án..." },
    { letter: "3", title: "Quyết định", color: "#2d5a43", desc: "Chọn hành động ưu tiên và giải thích lý do.", starter: "Tôi sẽ ưu tiên..." },
    { letter: "4", title: "Rủi ro", color: "#211914", desc: "Dự liệu hệ quả và cách theo dõi.", starter: "Rủi ro của lựa chọn này là..." },
  ] : [
    { letter: "1", title: "Làm rõ yêu cầu", color: "#c26d25", desc: "Xác định câu hỏi thực sự muốn đánh giá điều gì.", starter: "Tôi hiểu câu hỏi này là..." },
    { letter: "2", title: "Lập luận", color: "#2d5a43", desc: "Nêu ý chính kèm ví dụ thích hợp.", starter: "Theo tôi, điểm quan trọng là..." },
  ];

  const handleInsert = (letter: string, text: string) => {
    if (onInsertStarter) {
      onInsertStarter(text);
      setInsertedLetter(letter);
      setTimeout(() => setInsertedLetter(null), 2000);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (if enabled) */}
      {showTrigger && (
        <button
          type="button"
          onClick={handleOpen}
          className={styles.headerIconBox}
          style={{
            position: "fixed",
            right: "24px",
            top: "140px",
            zIndex: 40,
            cursor: "pointer",
          }}
          title="Mở gợi ý trả lời"
        >
          <Sparkles size={18} />
        </button>
      )}

      {/* Backdrop */}
      {isOpen && <div onClick={handleClose} className={styles.drawerBackdrop} />}

      {/* Drawer Panel */}
      <aside className={`${styles.drawerPanel} ${isOpen ? styles.drawerPanelOpen : ""}`}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerIconBox}>
              <Sparkles size={18} />
            </span>
            <div>
              <h3 className={styles.drawerTitle}>Khung Trả Lời {framework === "behavioral" ? "STAR" : "Gợi Ý"}</h3>
              <p className={styles.drawerSubtitle}>Chuẩn hóa cấu trúc câu trả lời thuyết phục</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={styles.btnCloseDrawer}
            title="Đóng bảng gợi ý"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.drawerBody}>
          {/* Custom Tip for Current Question */}
          {starTip && (
            <div className={styles.tipCard}>
              <p className={styles.tipCardLabel}>Gợi ý cho câu hỏi hiện tại</p>
              <p className={styles.tipCardText}>{starTip}</p>
            </div>
          )}

          {/* 4 Pillars */}
          <div className={styles.starPillarsList}>
            {guidance.map((item) => {
              const isInserted = insertedLetter === item.letter;
              return (
                <div key={item.letter} className={styles.starItemCard}>
                  <div className={styles.starItemHeader}>
                    <div className={styles.starBadgeGroup}>
                      <span
                        className={styles.starLetterBadge}
                        style={{ backgroundColor: item.color }}
                      >
                        {item.letter}
                      </span>
                      <span className={styles.starItemTitle}>{item.title}</span>
                    </div>

                    {onInsertStarter && (
                      <button
                        type="button"
                        onClick={() => handleInsert(item.letter, item.starter)}
                        className={`${styles.btnInsertStarter} ${
                          isInserted ? styles.btnInsertStarterDone : ""
                        }`}
                      >
                        {isInserted ? (
                          <>
                            <Check size={12} />
                            <span>Đã chèn</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle size={12} />
                            <span>Chèn mẫu</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className={styles.starItemDesc}>{item.desc}</p>
                  <div className={styles.starStarterQuote}>
                    Gợi ý mở đầu: &quot;{item.starter}&quot;
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.coachingNote}>
            <CheckCircle2 size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
            <p className={styles.coachingNoteText}>
              <strong>Mẹo phỏng vấn:</strong> Giữ thời lượng trả lời từ 1.5 - 3 phút (khoảng 150 - 300 từ) để AI đánh giá đầy đủ nhất các tiêu chí.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}