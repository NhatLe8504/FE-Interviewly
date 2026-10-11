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

// Rotation and offset calculation for 5 fanned cards
const FAN_TRANSFORMS = [
  { rotate: -15, x: -44, y: 8, z: 1 },
  { rotate: -7.5, x: -22, y: 2, z: 2 },
  { rotate: 0, x: 0, y: 0, z: 3 },
  { rotate: 7.5, x: 22, y: 2, z: 4 },
  { rotate: 15, x: 44, y: 8, z: 5 },
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

  // Tạo mảng đúng 5 slot
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

      {/* VIEW: FANNED CARDS */}
      {viewMode === "fan" ? (
        <div className={s.fanViewport}>
          {slots.map((item, idx) => {
            const transform = FAN_TRANSFORMS[idx] || { rotate: 0, x: 0, y: 0, z: idx + 1 };
            const isActive = item ? item.id === currentCvId : false;
            const isHovered = hoveredIdx === idx;

            // Tính toán inline transform cho lá bài xòe ra
            const cardStyle: React.CSSProperties = {
              transform: isHovered
                ? `translateY(-24px) scale(1.14) rotate(0deg)`
                : `translateX(${transform.x}px) translateY(${transform.y}px) rotate(${transform.rotate}deg)`,
              zIndex: isHovered ? 60 : isActive ? 20 : transform.z,
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
                  title={`Nhấp để mở: ${item.title || "CV"}`}
                >
                  <div className={s.cardHeader}>
                    <span className={s.cardSlotNum}>Slot #{idx + 1}</span>
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
                      <span style={{ color: "var(--ink-muted)" }}>Draft</span>
                    )}
                  </div>
                </div>
              );
            }

            // SLOT TRỐNG
            return (
              <div
                key={`empty-${idx}`}
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
                <Plus style={{ width: 18, height: 18, strokeWidth: 2.2 }} />
                <span style={{ fontSize: 10, fontWeight: 700 }}>Slot #{idx + 1}</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>+ Tạo mới</span>
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
                    <FileText style={{ width: 14, height: 14, color: "var(--accent-deep)", shrink: 0 }} />
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

      {/* OVERLAY KHÓA DÀNH CHO TÀI KHOẢN FREE */}
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
