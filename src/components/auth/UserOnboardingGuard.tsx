"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function UserOnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Automatically redirect ANY logged-in user who hasn't completed onboarding
    if (isAuthenticated && user && user.is_onboarded === false) {
      const isExcluded =
        pathname === "/onboarding" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/admin"); // Admin routes

      if (!isExcluded) {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, user, isLoading, pathname, router]);

  return <>{children}</>;
}