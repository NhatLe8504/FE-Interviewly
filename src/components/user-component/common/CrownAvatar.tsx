"use client";

import React, { useState } from "react";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import styles from "./CrownAvatar.module.css";

export interface CrownAvatarProps {
  size?: "sm" | "md" | "lg";
  src?: string | null;
  initials?: string;
  alt?: string;
  isSubscribed?: boolean;
  className?: string;
  avatarClassName?: string;
  crownClassName?: string;
  interactive?: boolean;
  onClick?: () => void;
  crownSrc?: string;
  showOnline?: boolean;
}

export function CrownAvatar({
  size = "md",
  src,
  initials = "U",
  alt = "User Avatar",
  isSubscribed: explicitSubscribed,
  className = "",
  avatarClassName = "",
  crownClassName = "",
  interactive = false,
  onClick,
  crownSrc = "/victory_crown_new.png",
  showOnline = true,
}: CrownAvatarProps) {
  const { isSubscribed: detectedSubscribed } = useUserSubscription();
  const [imgError, setImgError] = useState(false);

  const activeSubscribed =
    explicitSubscribed !== undefined ? explicitSubscribed : detectedSubscribed;

  const sizeClass =
    size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md;

  const hasImage = Boolean(src && !imgError);

  return (
    <div
      className={`${styles.wrapper} ${sizeClass} ${interactive ? styles.interactive : ""} ${className}`}
      onClick={onClick}
    >
      {/* 1. Avatar tròn ở dưới (z-index: 1), tỉ lệ 1:1, cùng vị trí (inset: 0) và kích thước 100% */}
      <div
        className={`${styles.avatar} ${avatarClassName}`}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={alt}
            className={styles.avatarImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* 2. Khung đè ở trên (z-index: 10), tỉ lệ 1:1, cùng vị trí (inset: 0) và kích thước 100% */}
      {activeSubscribed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={crownSrc}
          alt="Avatar Frame"
          className={`${styles.crown} ${crownClassName}`}
          onError={(e) => {
            const currentSrc = e.currentTarget.src;
            if (!currentSrc.includes("victory_crown_new.png") && !currentSrc.includes("victory_crown.png")) {
              e.currentTarget.src = "/victory_crown_new.png";
            } else if (currentSrc.includes("victory_crown_new.png")) {
              e.currentTarget.src = "/victory_crown.png";
            }
          }}
        />
      )}

      {/* 3. Chấm online đặt góc dưới (z-index: 20) */}
      {showOnline && (
        <span
          className={`${styles.onlineDot} ${
            size === "sm"
              ? styles.onlineDotSm
              : size === "lg"
              ? styles.onlineDotLg
              : styles.onlineDotMd
          }`}
          title="Đang trực tuyến"
        />
      )}
    </div>
  );
}

export default CrownAvatar;
