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
  crownSrc = "/victory_crown.png",
}: CrownAvatarProps) {
  const { isSubscribed: detectedSubscribed } = useUserSubscription();
  const [imgError, setImgError] = useState(false);

  // Use explicit prop if provided, else use auto-detected subscription
  const activeSubscribed =
    explicitSubscribed !== undefined ? explicitSubscribed : detectedSubscribed;

  const sizeClass =
    size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md;
  const subscribedClass = activeSubscribed
    ? size === "sm"
      ? styles.subscribedSm
      : size === "lg"
      ? styles.subscribedLg
      : styles.subscribedMd
    : "";
  const crownSizeClass =
    size === "sm" ? styles.crownSm : size === "lg" ? styles.crownLg : styles.crownMd;

  const hasImage = Boolean(src && !imgError);

  return (
    <div
      className={`${styles.wrapper} ${interactive ? styles.interactive : ""} ${className}`}
      onClick={onClick}
    >
      {/* Crown Frame Overlay for Subscribed Accounts */}
      {activeSubscribed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={crownSrc}
          alt="VIP Subscription Crown"
          className={`${styles.crown} ${crownSizeClass} ${crownClassName}`}
          onError={(e) => {
            // Fallback to /images/victory_crown.png if relative path issues occur
            if (!e.currentTarget.src.includes("/images/victory_crown.png")) {
              e.currentTarget.src = "/images/victory_crown.png";
            }
          }}
        />
      )}

      {/* Avatar Container with Golden Ring when Subscribed */}
      <div
        className={`${styles.avatar} ${sizeClass} ${subscribedClass} ${avatarClassName}`}
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
    </div>
  );
}

export default CrownAvatar;
