"use client";

import React, { useState } from "react";
import { ArrowRight, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import type { StageTransitionProposal } from "@/hooks/useRealtimeVoiceInterview";
import styles from "./stageTransitionDialog.module.css";

interface StageTransitionDialogProps {
  proposal: StageTransitionProposal | null;
  onConfirm: () => void;
  onDefer: (continueMsg?: string) => void;
  mockMode?: "strict" | "guided";
}

const STAGE_LABELS: Record<string, string> = {
  warmup: "Khởi động & Phá băng",
  technical: "Chuyên môn & Thực chiến",
  closing: "Chào kết & Thảo luận hai chiều",
  completed: "Tổng kết & Đánh giá",
};

export function StageTransitionDialog({
  proposal,
  onConfirm,
  onDefer,
  mockMode = "guided",
}: StageTransitionDialogProps) {
  const [showDeferInput, setShowDeferInput] = useState(false);
  const [deferComment, setDeferComment] = useState("");

  if (!proposal) return null;

  const currentStageName = STAGE_LABELS[proposal.currentStage] || proposal.stageName || "Chặng hiện tại";
  const nextStageName = STAGE_LABELS[proposal.nextStage] || proposal.nextStage || "Chặng tiếp theo";
  const isFinalStage = proposal.nextStage === "closing" || proposal.nextStage === "completed";

  const handleDeferSubmit = () => {
    onDefer(deferComment.trim() || undefined);
    setShowDeferInput(false);
    setDeferComment("");
  };

  return (
    <div className={styles.dialogBackdrop} role="dialog" aria-modal="true" aria-labelledby="stage-dialog-title">
      <div className={styles.dialogCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBox}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 id="stage-dialog-title" className={styles.dialogTitle}>
                {isFinalStage ? "Sắp hoàn tất buổi phỏng vấn" : "Đề xuất chuyển chặng phỏng vấn"}
              </h3>
              <p className={styles.dialogSubtitle}>
                Chế độ: {mockMode === "strict" ? "Thực chiến nghiêm ngặt" : "Huấn luyện có gợi ý"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          {/* Stage Progression Flow */}
          <div className={styles.stageFlowBar}>
            <span className={`${styles.stageChip} ${styles.stageChipCurrent}`}>
              <CheckCircle2 size={13} />
              <span>{currentStageName}</span>
            </span>
            <ArrowRight size={15} className={styles.flowArrow} />
            <span className={`${styles.stageChip} ${styles.stageChipNext}`}>
              <span>Tiếp theo: {nextStageName}</span>
            </span>
          </div>

          {/* AI Lead Summary Callout */}
          <div className={styles.summaryCallout}>
            <div className={styles.summaryCalloutTitle}>
              <Sparkles size={12} />
              <span>Đánh giá từ Người phỏng vấn AI</span>
            </div>
            <p className={styles.summaryCalloutText}>
              {proposal.summaryMessage ||
                "Phần trao đổi vừa rồi đã đủ bối cảnh cần thiết. Bạn đã sẵn sàng bước sang nội dung tiếp theo chưa, hay muốn chia sẻ/hỏi thêm điều gì không?"}
            </p>
          </div>

          {/* Defer Input for candidate if requested */}
          {showDeferInput && (
            <div className={styles.deferInputArea}>
              <input
                type="text"
                className={styles.deferInput}
                placeholder="Nhập nội dung hoặc câu hỏi bạn muốn trao đổi thêm..."
                value={deferComment}
                onChange={(e) => setDeferComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleDeferSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.primaryConfirmBtn}
            onClick={onConfirm}
          >
            <span>Sẵn sàng chuyển sang {nextStageName}</span>
            <ArrowRight size={16} />
          </button>

          {showDeferInput ? (
            <button
              type="button"
              className={styles.secondaryDeferBtn}
              onClick={handleDeferSubmit}
            >
              <MessageSquare size={14} />
              <span>Xác nhận trao đổi tiếp nội dung này</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.secondaryDeferBtn}
              onClick={() => setShowDeferInput(true)}
            >
              <MessageSquare size={14} />
              <span>Tôi muốn chia sẻ hoặc hỏi thêm một chút</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
