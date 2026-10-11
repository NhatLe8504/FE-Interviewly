"use client";

import React, { useState } from "react";
import { CvListItem } from "@/types/cv";
import {
  Layers,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  LayoutGrid,
  CreditCard,
  FileText,
} from "lucide-react";
import s from "./cvCardDeck.module.css";

interface CvCardDeckProps {
  cvList: CvListItem[];
  currentCvId?: number;
  isSubscribed: boolean;
  onSelectCv: (id: number) => void;
  onCreateNew: () => void;
  onDeleteCv: (id: number) => void;
  onUpgradeRequired?: () => void;
}

const MAX_SLOTS = 5;

// Tọa độ & góc xoay quạt tinh tế cho 5 lá bài (xòe đều, không nghiêng ngả lộn xộn)
const FAN_CARDS_LAYOUT = [
  { left: 10, rotate: -7, y: 5, z: 1 },
  { left: 50, rotate: -3.5, y: 2, z: 2 },
  { left: 90, rotate: 0, y: 0, z: 3 },
  { left: 130, rotate: 3.5, y: 2, z: 4 },
  { left: 170, rotate: 7, y: 5, z: 5 },
];

export const CvCardDeck: React.FC<CvCardDeckProps> = ({
  cvList,
  currentCvId,
  isSubscribed,
  onSelectCv,
  onCreateNew,
  onDeleteCv,
  onUpgradeRequired,
}) => {
  const [viewMode, setViewMode] = useState<"fan" | "list">("fan");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Tạo mảng đúng 5 slot cố định
  const slots: (CvListItem | null)[] = Array.from({ length: MAX_SLOTS }, (_, i) => {
    return cvList[i] || null;
  });

  const savedCount = cvList.length;

  return (
    <div className={s.deckContainer}>
      {/* HEADER */}
      <div className={s.deckHeader}>
        <div className={s.deckTitle}>
          <Layers className={s.deckTitleIcon} style={{ width: 14, height: 14 }} />
          <span>Hồ Sơ Của Bạn</span>
          <span className={`${s.deckBadge} ${!isSubscribed ? s.deckBadgeFree : ""}`}>
            {savedCount}/{MAX_SLOTS} {isSubscribed ? "PRO" : "FREE"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setViewMode((prev) => (prev === "fan" ? "list" : "fan"))}
          className={s.viewToggleBtn}
          title={viewMode === "fan" ? "Chuyển sang dạng danh sách" : "Chuyển sang dạng xòe bài"}
        >
          {viewMode === "fan" ? (
            <>
              <LayoutGrid style={{ width: 11, height: 11 }} />
              <span>Gọn</span>
            </>
          ) : (
            <>
              <CreditCard style={{ width: 11, height: 11 }} />
              <span>Xòe bài</span>
            </>
          )}
        </button>
      </div>

      {/* VIEW: FANNED CARDS (BỘ BÀI XÒE ĐỀU HÌNH CÁNH QUẠT) */}
      {viewMode === "fan" ? (
        <div className={s.fanViewport}>
          {slots.map((item, idx) => {
            const layout = FAN_CARDS_LAYOUT[idx] || { left: idx * 40, rotate: 0, y: 0, z: idx + 1 };
            const isActive = item ? item.id === currentCvId : false;
            const isHovered = hoveredIdx === idx;

            // Tính inline style cho lá bài:
            // - Khi hover: bay thẳng lên trên, không nghiêng, phóng to nhẹ, z-index cao nhất
            // - Khi bình thường: dàn đều sang phải, góc xoay nhẹ thanh lịch
            const cardStyle: React.CSSProperties = {
              left: `${layout.left}px`,
              transform: isHovered
                ? `translateY(-28px) scale(1.12) rotate(0deg)`
                : `translateY(${layout.y}px) rotate(${layout.rotate}deg)`,
              zIndex: isHovered ? 100 : isActive ? 20 : layout.z,
            };

            if (item) {
              return (
                <div
                  key={item.id}
                  style={cardStyle}
                  className={`${s.fanCard} ${isActive ? s.cardActive : ""}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectCv(item.id)}
                  title={`Bấm để mở: ${item.title || "CV"}`}
                >
                  <div className={s.cardHeader}>
                    <span className={s.cardSlotNum}>
                      {isActive && <span className={s.cardActiveIndicator} />}
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCv(item.id);
                      }}
                      className={s.cardDeleteBtn}
                      title="Xóa bản CV này"
                    >
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  </div>

                  <div className={s.cardTitle}>
                    {item.title || `Bản CV #${idx + 1}`}
                  </div>

                  <div className={s.cardFooter}>
                    <span className={s.cardTemplateTag}>
                      {item.template_id.replace("_", " ")}
                    </span>
                    {item.ats_score !== null && item.ats_score !== undefined ? (
                      <span className={s.cardAtsBadge}>
                        <Sparkles style={{ width: 9, height: 9 }} />
                        {Math.round(item.ats_score)}%
                      </span>
                    ) : (
                      <span style={{ color: "var(--ink-muted)", fontSize: 8.5 }}>Draft</span>
                    )}
                  </div>
                </div>
              );
            }

            // LÁ BÀI SLOT TRỐNG
            return (
              <div
                key={`empty-slot-${idx}`}
                style={cardStyle}
                className={`${s.fanCard} ${s.cardEmpty}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => {
                  if (!isSubscribed) {
                    onUpgradeRequired?.();
                  } else {
                    onCreateNew();
                  }
                }}
                title="Tạo bản CV mới vào slot này"
              >
                <div className={s.cardHeader} style={{ width: "100%", justifyContent: "flex-start" }}>
                  <span className={s.cardSlotNum} style={{ color: "var(--ink-muted)" }}>
                    #{idx + 1}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, margin: "auto 0" }}>
                  <Plus style={{ width: 18, height: 18, strokeWidth: 2.2, color: "var(--accent-warm)" }} />
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--ink-muted)" }}>Slot trống</span>
                </div>
                <div className={s.cardFooter} style={{ width: "100%", justifyContent: "center" }}>
                  <span style={{ fontSize: 8.5, color: "var(--accent-deep)", fontWeight: 600 }}>+ Tạo mới</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW: COMPACT LIST */
        <div className={s.listViewWrap}>
          {slots.map((item, idx) => {
            if (item) {
              const isActive = item.id === currentCvId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCv(item.id)}
                  className={`${s.listItem} ${isActive ? s.listItemActive : ""}`}
                >
                  <div className={s.listItemLeft}>
                    <FileText style={{ width: 14, height: 14, color: "var(--accent-deep)", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div className={s.listItemTitle}>
                        #{idx + 1}. {item.title || "CV Không tên"}
                      </div>
                      <div className={s.listItemSub}>
                        {item.template_id} • {item.ats_score ? `ATS: ${Math.round(item.ats_score)}%` : "Bản thảo"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCv(item.id);
                    }}
                    className={s.cardDeleteBtn}
                    style={{ opacity: 1 }}
                    title="Xóa CV"
                  >
                    <Trash2 style={{ width: 11, height: 11 }} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={`empty-list-${idx}`}
                onClick={() => {
                  if (!isSubscribed) {
                    onUpgradeRequired?.();
                  } else {
                    onCreateNew();
                  }
                }}
                className={s.listItemEmpty}
              >
                <Plus style={{ width: 14, height: 14 }} />
                <span>Slot #{idx + 1}: Trống (Nhấp để tạo)</span>
              </div>
            );
          })}
        </div>
      )}

      {/* OVERLAY KHÓA CHO TÀI KHOẢN FREE */}
      {!isSubscribed && (
        <div className={s.lockOverlay}>
          <div className={s.lockIconWrap}>
            <Lock style={{ width: 18, height: 18 }} />
          </div>
          <div className={s.lockTitle}>Bộ 5 Slot Lưu Trữ CV</div>
          <div className={s.lockDesc}>
            Tài khoản Free không hỗ trợ lưu CV trên hệ thống. Hãy nâng cấp Pro để lưu trữ và quản lý tối đa 5 bản CV chuẩn ATS!
          </div>
          <button
            type="button"
            onClick={onUpgradeRequired}
            className={s.lockUpgradeBtn}
          >
            Nâng Cấp Pro Ngay
          </button>
        </div>
      )}
    </div>
  );
};
