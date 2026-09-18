"use client";

import React, { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Globe,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Award,
  Flame,
  Activity,
  UserCog,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import {
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
} from "@/redux/api/adminApi";
import type { UserAdminOut, UserRole, UserStatus } from "@/types/admin";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const {
    data: apiUser,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetUserQuery(userId, { skip: isNaN(userId) });

  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  const user: UserAdminOut = useMemo(() => {
    if (apiUser) return apiUser;
    return {
      user_id: userId || 1,
      full_name: userId === 2 ? "Lê Anh Vũ" : "Nguyễn Văn A",
      email: userId === 2 ? "vule556677@gmail.com" : "candidate@example.com",
      phone: "0912345678",
      role: userId === 2 ? "admin" : "candidate",
      status: "active",
      preferred_language: "vi",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [apiUser, userId]);

  const isAdmin = user.role === "admin";
  const isActive = user.status === "active";
  const isSuspended = user.status === "suspended";

  const handleToggleRole = async () => {
    const nextRole: UserRole = isAdmin ? "candidate" : "admin";
    try {
      await updateUserRole({ userId: user.user_id, role: nextRole }).unwrap();
      toast.success(
        nextRole === "admin"
          ? "Đã cấp quyền Quản trị viên (Admin) thành công"
          : "Đã chuyển vai trò về Ứng viên (Candidate)"
      );
    } catch (err: any) {
      toast.error(err?.data?.detail || "Lỗi cập nhật vai trò người dùng");
    }
  };

  const handleToggleStatus = async (newStatus: UserStatus) => {
    try {
      await updateUserStatus({ userId: user.user_id, status: newStatus }).unwrap();
      toast.success(
        newStatus === "active"
          ? "Tài khoản đã được kích hoạt hoạt động trở lại"
          : newStatus === "suspended"
          ? "Tài khoản đã được tạm khóa"
          : "Tài khoản đã được xóa"
      );
    } catch (err: any) {
      toast.error(err?.data?.detail || "Lỗi cập nhật trạng thái người dùng");
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "--";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={`Chi Tiết Người Dùng #${user.user_id}`} />

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl">
          <div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="size-4" />
              <span>Quay lại danh sách người dùng</span>
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className={`size-16 rounded-2xl flex items-center justify-center font-extrabold text-xl shrink-0 ${
                  isAdmin
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-500/30"
                    : "bg-primary/15 text-primary border-2 border-primary/25"
                }`}
              >
                {getInitials(user.full_name)}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{user.full_name}</h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isAdmin
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {isAdmin && <Shield className="size-3 text-amber-500 fill-amber-500" />}
                    {isAdmin ? "Quản trị viên (Admin)" : "Ứng viên (Candidate)"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : isSuspended
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        isActive ? "bg-emerald-500" : isSuspended ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />
                    {isActive ? "Hoạt động" : isSuspended ? "Tạm khóa" : "Đã xóa"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" /> {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" /> {user.phone || "Chưa có SĐT"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" /> Tham gia: {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleRole}
                disabled={isUpdatingRole}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted transition-colors shadow-xs"
              >
                <Shield className="size-3.5 text-amber-500" />
                <span>{isAdmin ? "Hạ về Candidate" : "Nâng quyền Admin"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus(isActive ? "suspended" : "active")}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                  isActive
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isActive ? (
                  <>
                    <Lock className="size-3.5" />
                    <span>Khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <Unlock className="size-3.5" />
                    <span>Mở khóa tài khoản</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground border-b border-border pb-3">
                <UserCog className="size-4 text-primary" />
                <span>Thông Tin Định Danh & Liên Hệ</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Mã ID tài khoản:</span>
                  <span className="font-mono font-bold">#{user.user_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Họ và tên:</span>
                  <span className="font-semibold text-foreground">{user.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Email đăng nhập:</span>
                  <span className="font-medium text-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span className="font-medium text-foreground">{user.phone || "Chưa thiết lập"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Ngôn ngữ giao diện:</span>
                  <span className="font-bold uppercase">{user.preferred_language || "vi"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Thời điểm tạo:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Lần cập nhật cuối:</span>
                  <span>{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground border-b border-border pb-3">
                <Activity className="size-4 text-emerald-500" />
                <span>Hoạt Động & Quyền Hạn Hệ Thống</span>
              </div>

              <div className="space-y-3.5 text-xs text-muted-foreground">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <Shield className="size-3.5 text-amber-500" />
                    <span>Quyền hạn vai trò: {isAdmin ? "Admin (Toàn quyền)" : "Candidate (Ứng viên)"}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {isAdmin
                      ? "Có quyền truy cập toàn bộ trang quản trị /admin: Ngân hàng câu hỏi, Quản lý tài khoản người dùng, Kiểm duyệt nội dung và xem Nhật ký hệ thống (Audit Logs)."
                      : "Có quyền tham gia luyện tập phỏng vấn AI, xem kết quả đánh giá kỹ năng, quản lý hồ sơ ứng viên cá nhân và đăng ký gói cước Pro."}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Tình trạng tài khoản: {isActive ? "Bình thường" : "Đang bị khóa"}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {isActive
                      ? "Tài khoản có đầy đủ quyền đăng nhập và sử dụng toàn bộ tính năng theo gói cước hiện tại."
                      : "Tài khoản đang bị hạn chế đăng nhập và không thể thực hiện các phiên phỏng vấn mới trên nền tảng."}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus("deleted")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Xóa vĩnh viễn tài khoản</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
