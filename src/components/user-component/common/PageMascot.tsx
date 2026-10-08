"use client";

import { Mascot } from "page-mascot";
import { useMascot } from "@/context/MascotContext";
import { useI18n } from "@/context/I18nContext";
import { getMascot, getMascotSheets } from "@/lib/mascots";

interface PageMascotProps {
  size?: number;
  className?: string;
}

export function PageMascot({ size = 96, className }: PageMascotProps) {
  const { mascotId } = useMascot();
  const { locale } = useI18n();
  if (mascotId === "none") return null;

  return (
    <Mascot
      {...getMascotSheets(mascotId)}
      size={size}
      className={`${className ?? ""} ${mascotId === "fox-pixel" ? "portal-mascot--pixel" : ""}`}
      label={getMascot(mascotId).name[locale]}
      key={mascotId}
    />
  );
}
