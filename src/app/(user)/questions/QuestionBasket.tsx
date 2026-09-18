"use client";

import React, { useState } from "react";
import {
  ShoppingBasket,
  Check,
  X,
  AlertTriangle,
  Lock,
  Sparkles,
  Trash2,
  Minimize2,
  ChevronDown,
  Layers,
} from "lucide-react";
import type { QuestionOut } from "@/types/catalog";
import { UserTooltip } from "@/components/user-component/common";
import styles from "./QuestionBasket.module.css";

interface QuestionBasketProps {
  selectedQuestions: QuestionOut[];
  lockedDomainId: number | null;
  lockedDomainName: string | null;
  isBasketActive: boolean;
  setIsBasketActive: (active: boolean) => void;
  isRejected: boolean;
  rejectionMessage: string | null;
  onRemoveQuestion: (questionId: number) => void;
  onClearBasket: () => void;
  onConfirmPractice: () => void;
}

export function QuestionBasket({
  selectedQuestions,
  lockedDomainId,
  lockedDomainName,
  isBasketActive,
  setIsBasketActive,
  isRejected,
  rejectionMessage,
  onRemoveQuestion,
  onClearBasket,
  onConfirmPractice,
}: QuestionBasketProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  // If basket mode is not active, render the playful tilted floating button ("nằm ngổn ngang")
  if (!isBasketActive || isMinimized) {
    return (
      <div style={{ position: "relative" }}>
        <UserTooltip content="Mở giỏ đề luyện tập" side="left">
          <button
            type="button"
            className={`${styles.tiltedBasketBtn} ${
              isBasketActive ? styles.tiltedBasketBtnActive : ""
            } ${isRejected ? styles.tiltedBasketBtnRejected : ""}`}
            onClick={() => {
              setIsBasketActive(true);
              setIsMinimized(false);
            }}
            aria-label="Giỏ đề luyện tập"
          >
            <ShoppingBasket size={20} />
            <span style={{ fontSize: "12px", fontWeight: 800 }}>
              Giỏ đề
            </span>
            <span className={styles.basketBadge}>
              {selectedQuestions.length}
            </span>
          </button>
        </UserTooltip>

        {/* Rejection tooltip bubble popping out when rejected while minimized */}
        {isRejected && rejectionMessage && (
          <div className={styles.rejectionBubble}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
              <strong style={{ color: "#b91c1c", fontSize: "12px" }}>TỪ CHỐI BỐC CÂU HỎI!</strong>
            </div>
            <span>{rejectionMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Expanded Basket Dock / Panel
  return (
    <div
      className={`${styles.basketPanel} ${
        isRejected ? styles.panelRejected : ""
      }`}
      role="region"
      aria-label="Giỏ đề luyện tập phỏng vấn"
    >
      {/* Panel Header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleWrap}>
          <div className={styles.panelTitleIcon}>
            <ShoppingBasket size={17} />
          </div>
          <div>
            <h3 className={styles.panelTitle}>Giỏ đề luyện tập</h3>
            <p className={styles.panelSub}>
              {selectedQuestions.length > 0
                ? `Đã chọn ${selectedQuestions.length} câu hỏi`
                : "Chưa có câu hỏi nào trong giỏ"}
            </p>
          </div>
        </div>
        <UserTooltip content="Thu gọn giỏ" side="top">
          <button
            type="button"
            className={styles.panelMinimizeBtn}
            onClick={() => setIsMinimized(true)}
            aria-label="Thu gọn giỏ"
          >
            <Minimize2 size={13} />
          </button>
        </UserTooltip>
      </div>

      {/* Domain Lock Status Banner */}
      <div className={styles.domainLockBanner}>
        {lockedDomainName ? (
          <div className={styles.domainLockTag}>
            <Lock size={12} className="text-[#d98236]" />
            <span>Chủ đề: {lockedDomainName}</span>
          </div>
        ) : (
          <div className={styles.domainUnlockNotice}>
            <Sparkles size={13} className="text-[#d98236]" />
            <span>Bốc câu đầu tiên để khóa ngành</span>
          </div>
        )}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: "999px",
            background: selectedQuestions.length > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(106, 72, 49, 0.1)",
            color: selectedQuestions.length > 0 ? "#059669" : "#8b4513",
          }}
        >
          {selectedQuestions.length} câu
        </span>
      </div>

      {/* Rejection Alert if user tried to add question from another domain */}
      {isRejected && rejectionMessage && (
        <div className={styles.panelAlertReject}>
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span>{rejectionMessage}</span>
        </div>
      )}

      {/* Picked Questions List */}
      <div className={styles.questionsList}>
        {selectedQuestions.length === 0 ? (
          <div className={styles.emptyBasketHint}>
            <ShoppingBasket size={32} className="text-stone-300" />
            <p style={{ margin: 0 }}>
              Cuộn trang xuống danh sách câu hỏi và bấm nút{" "}
              <strong style={{ color: "#8b4513" }}>&ldquo;+&rdquo;</strong>{" "}
              để thêm câu hỏi vào bộ đề ôn luyện.
            </p>
          </div>
        ) : (
          selectedQuestions.map((q, idx) => (
            <div key={q.question_id} className={styles.questionItem}>
              <span className={styles.questionItemIndex}>{idx + 1}</span>
              <UserTooltip content={q.question_text} side="top" align="start">
                <p className={styles.questionItemText}>
                  {q.question_text}
                </p>
              </UserTooltip>
              <UserTooltip content="Bỏ câu này ra khỏi giỏ" side="top">
                <button
                  type="button"
                  className={styles.questionItemRemoveBtn}
                  onClick={() => onRemoveQuestion(q.question_id)}
                  aria-label={`Bỏ câu hỏi ${idx + 1} khỏi giỏ`}
                >
                  <X size={14} />
                </button>
              </UserTooltip>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons Row: DẤU TÍCH (✓) VÀ DẤU X (✗) */}
      <div className={styles.actionButtonsRow}>
        {/* Dấu X (✗) - Hủy bỏ / Làm trống giỏ */}
        <UserTooltip content="Xóa toàn bộ câu hỏi trong giỏ và mở khóa ngành" side="top">
          <button
            type="button"
            className={styles.btnCancelBasket}
            onClick={onClearBasket}
          >
            <X size={16} />
            <span>Hủy giỏ (✗)</span>
          </button>
        </UserTooltip>

        {/* Dấu tích (✓) - Xác nhận luyện tập */}
        <UserTooltip
          content={
            selectedQuestions.length === 0
              ? "Hãy bốc ít nhất 1 câu hỏi vào giỏ trước khi xác nhận"
              : "Bắt đầu phiên phỏng vấn với bộ câu hỏi này (✓)"
          }
          side="top"
        >
          <button
            type="button"
            className={styles.btnConfirmBasket}
            onClick={onConfirmPractice}
            disabled={selectedQuestions.length === 0}
          >
            <Check size={16} />
            <span>Luyện tập (✓)</span>
          </button>
        </UserTooltip>
      </div>
    </div>
  );
}