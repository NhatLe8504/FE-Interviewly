"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { getBrandDefinition } from "@/lib/brand-icons";

interface BrandIconProps {
  name: string;
  size?: number;
  className?: string;
  decorative?: boolean;
  fallback?: ReactNode;
}

export function BrandIcon({ name, size = 20, className = "", decorative = true, fallback = null }: BrandIconProps) {
  const brand = getBrandDefinition(name);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!brand || failedSource === brand.src) return fallback;

  return (
    <Image
      src={brand.src}
      alt={decorative ? "" : brand.label}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      unoptimized
      className={"inline-block shrink-0 object-contain " + className}
      style={{ width: size, height: size }}
      onError={() => setFailedSource(brand.src)}
    />
  );
}

