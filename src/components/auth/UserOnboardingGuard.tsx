"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function isCandidateProtectedRoute(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  if (pathname === "/reports" || pathname.startsWith("/reports/")) return true;
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return true;
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return true;
  if (pathname === "/cv-builder" || pathname.startsWith("/cv-builder/")) return true;
  if (pathname === "/onboarding") return true;
  if (
    pathname.startsWith("/subscription/checkout") ||
    pathname.startsWith("/subscription/history") ||
    pathname.startsWith("/subscription/my") ||
    pathname.startsWith("/subscription/result")
  ) {
    return true;
  }
  if (pathname === "/practice/new" || pathname.startsWith("/practice/setup/")) return true;
  if (pathname.startsWith("/practice/") && pathname !== "/practice") return true;
  if (pathname === "/questions/practice") return true;

  return false;
}

export function UserOnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProtected = isCandidateProtectedRoute(pathname);

  useEffect(() => {
    if (isLoading) return;

    // 1. Unauthenticated user accessing a protected candidate route
    if (!isAuthenticated && isProtected) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${returnUrl}`);
      return;
    }

    // 2. Automatically redirect ANY logged-in user who hasn't completed onboarding
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
  }, [isAuthenticated, user, isLoading, isProtected, pathname, router]);

  // Loading state while checking authentication on protected route
  if (isLoading && isProtected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="size-8 animate-spin text-primary mb-3.5" />
        <p className="text-sm font-medium text-foreground">Đang kiểm tra quyền truy cập hệ thống...</p>
        <p className="text-xs text-muted-foreground mt-1">Xác thực phiên làm việc bảo mật</p>
      </div>
    );
  }

  // Unauthenticated fallback on protected route while redirecting
  if (!isAuthenticated && isProtected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-4">
          <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="size-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Yêu Cầu Đăng Nhập</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Bạn cần đăng nhập tài khoản để sử dụng tính năng và quản lý dữ liệu cá nhân này.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                <LogIn className="size-4" />
                <span>Đăng nhập ngay</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
