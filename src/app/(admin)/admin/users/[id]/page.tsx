"use client";

import React, { use } from "react";
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
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  Activity,
  UserCog,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/admin/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { toast } from "sonner";
import {
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
} from "@/redux/api/adminApi";
import type { UserRole, UserStatus } from "@/types/admin";
import { useSocket } from "@/context/SocketContext";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  // 100% REAL DATA FROM API - NO MOCK FALLBACK
  const {
    data: user,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetUserQuery(userId, { skip: isNaN(userId) });

  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const { isUserOnline } = useSocket();

  const isAdmin = user?.role === "admin";
  const isActive = user?.status === "active";
  const isSuspended = user?.status === "suspended";

  const handleToggleRole = async () => {
    if (!user) return;
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
    if (!user) return;
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
        <SiteHeader title={user ? `Chi Tiết Người Dùng #${user.user_id}` : "Chi Tiết Người Dùng"} />

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6 max-w-5xl">
          <div>
            <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
              <Link href="/admin/users">
                <ArrowLeft className="size-4" />
                <span>Quay lại danh sách người dùng</span>
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <Card className="p-12 text-center">
              <RefreshCw className="size-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium text-foreground">Đang tải dữ liệu người dùng từ máy chủ...</p>
            </Card>
          ) : error || !user ? (
            <Card className="p-12 text-center border-destructive/30">
              <AlertCircle className="size-10 text-destructive mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">Không tìm thấy người dùng #{userId}</h2>
              <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
                Tài khoản này không tồn tại trong hệ thống hoặc bạn không có quyền truy cập dữ liệu quản trị.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Thử tải lại
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin/users">Về danh sách người dùng</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Profile Overview Card */}
              <Card>
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                      <AvatarFallback
                        className={
                          isAdmin
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-xl"
                            : "bg-primary/15 text-primary font-extrabold text-xl"
                        }
                      >
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl font-bold text-foreground">{user.full_name}</h1>
                        <Badge variant={isAdmin ? "default" : "secondary"} className="gap-1">
                          {isAdmin && <Shield className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                          {isAdmin ? "Quản trị viên (Admin)" : "Ứng viên (Candidate)"}
                        </Badge>

                        <Badge
                          variant={
                            isActive
                              ? "default"
                              : isSuspended
                              ? "secondary"
                              : "destructive"
                          }
                          className="gap-1.5"
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : isSuspended ? "bg-amber-500" : "bg-destructive"
                            }`}
                          />
                          {isActive ? "Hoạt động" : isSuspended ? "Tạm khóa" : "Đã xóa"}
                        </Badge>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleRole}
                      disabled={isUpdatingRole}
                      className="gap-1.5"
                    >
                      <Shield className="size-3.5 text-amber-500" />
                      <span>{isAdmin ? "Hạ về Candidate" : "Nâng quyền Admin"}</span>
                    </Button>

                    <Button
                      variant={isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(isActive ? "suspended" : "active")}
                      disabled={isUpdatingStatus}
                      className="gap-1.5"
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
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <UserCog className="size-4 text-primary" />
                      <span>Thông Tin Định Danh & Liên Hệ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Mã ID tài khoản:</span>
                      <span className="font-mono font-bold">#{user.user_id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Họ và tên:</span>
                      <span className="font-semibold text-foreground">{user.full_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Email đăng nhập:</span>
                      <span className="font-medium text-foreground">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Số điện thoại:</span>
                      <span className="font-medium text-foreground">{user.phone || "Chưa thiết lập"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Ngôn ngữ giao diện:</span>
                      <span className="font-bold uppercase">{user.preferred_language || "vi"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Thời điểm tạo:</span>
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Lần cập nhật cuối:</span>
                      <span>{formatDate(user.updated_at)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="size-4 text-emerald-500" />
                      <span>Hoạt Động & Quyền Hạn Hệ Thống</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3.5 text-xs text-muted-foreground">
                    <div className="p-3.5 rounded-xl bg-muted/50 border">
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

                    <div className="p-3.5 rounded-xl bg-muted/50 border">
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

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus("deleted")}
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Xóa vĩnh viễn tài khoản</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
