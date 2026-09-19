"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { normalizeAvatarFramePath } from "@/lib/avatar-frames";

export type FramedAvatarProps = {
  src?: string | null;
  frameSrc?: string | null;
  fallback: ReactNode;
  alt?: string;
  sizes?: string;
  className?: string;
  avatarClassName?: string;
  fallbackClassName?: string;
  frameClassName?: string;
  showOnline?: boolean;
  onlineDotClassName?: string;
  onClick?: () => void;
};

export function FramedAvatar({
  src,
  frameSrc,
  fallback,
  alt = "avatar",
  sizes = "160px",
  className,
  avatarClassName,
  fallbackClassName,
  frameClassName,
  showOnline = false,
  onlineDotClassName,
  onClick,
}: FramedAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const safeFrameSrc = normalizeAvatarFramePath(frameSrc);
  const avatarInset = safeFrameSrc ? "inset-[10%]" : "inset-0";
  const hasImage = Boolean(src && !imgError);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative inline-flex aspect-square shrink-0 items-center justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "absolute overflow-hidden rounded-full bg-background shadow-inner",
          "z-0",
          avatarInset,
          avatarClassName,
        )}
      >
        {hasImage ? (
          <Image
            src={src!}
            alt={alt}
            className="object-cover"
            fill
            sizes={sizes}
            onError={() => setImgError(true)}
            unoptimized={src!.startsWith("blob:") || src!.startsWith("data:")}
          />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center font-black",
              fallbackClassName,
            )}
          >
            {fallback}
          </span>
        )}
      </div>

      {safeFrameSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeFrameSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10 h-full w-full object-contain select-none",
            frameClassName,
          )}
        />
      )}

      {showOnline && (
        <span
          className={cn(
            "absolute z-20 rounded-full bg-emerald-500 border-2 border-white pointer-events-none shadow-sm",
            "bottom-0 right-0 h-2.5 w-2.5",
            onlineDotClassName,
          )}
          title="Đang trực tuyến"
        />
      )}
    </div>
  );
}

export default FramedAvatar;
