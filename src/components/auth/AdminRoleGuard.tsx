"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, RefreshCw, Home, LogIn } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Allow admin login route to render without blocking
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // 1. Loading state while verifying user session and role
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <RefreshCw className="size-8 animate-spin text-primary mb-3.5" />
        <p className="text-sm font-medium text-foreground">Đang kiểm tra quyền truy cập hệ thống...</p>
        <p className="text-xs text-muted-foreground mt-1">Xác thực chứng chỉ quản trị viên bảo mật</p>
      </div>
    );
  }

  // 2. Unauthenticated state (Redirecting to login)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="max-w-md w-full text-center p-8 border-border shadow-lg">
          <CardContent className="space-y-4 pt-4">
            <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <LogIn className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Yêu Cầu Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn cần đăng nhập tài khoản có quyền Quản trị viên để truy cập trang này.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button asChild className="gap-1.5 w-full sm:w-auto">
                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                  <LogIn className="size-4" />
                  <span>Đăng nhập ngay</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/">Về trang chủ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Authenticated but unauthorized role (Candidate trying to access /admin)
  const isAdmin = user.role?.toLowerCase() === "admin";
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="max-w-md w-full text-center p-8 border-destructive/30 shadow-2xl">
          <CardContent className="space-y-4 pt-4">
            <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldAlert className="size-9" />
            </div>
            <div>
              <Badge variant="destructive" className="mb-2 uppercase tracking-wider text-[10px]">
                403 Không có quyền
              </Badge>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Từ Chối Quyền Truy Cập
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tài khoản <strong>{user.email}</strong> hiện có vai trò{" "}
              <span className="font-semibold text-foreground uppercase">[{user.role}]</span>, không đủ
              thẩm quyền để vào trang quản trị <code>/admin</code>.
            </p>
            <div className="p-3 rounded-xl bg-muted/60 text-[11px] text-muted-foreground text-left space-y-1 border">
              <div>• Chỉ tài khoản có vai trò <strong>Quản trị viên</strong> mới có thể quản lý hệ thống.</div>
              <div>• Nếu bạn là quản trị viên, vui lòng đăng nhập bằng đúng tài khoản được cấp quyền.</div>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button asChild variant="outline" className="gap-1.5 w-full sm:w-auto">
                <Link href="/">
                  <Home className="size-4" />
                  <span>Về trang chủ</span>
                </Link>
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  logout();
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                }}
                className="gap-1.5 w-full sm:w-auto"
              >
                <LogIn className="size-4" />
                <span>Đổi tài khoản khác</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Authorized Admin
  return <>{children}</>;
}
