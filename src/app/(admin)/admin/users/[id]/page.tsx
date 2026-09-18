"use client";

import React, { use, useState } from "react";
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
  Clock,
  KeyRound,
  FileText,
  Sparkles,
  AlertTriangle,
  Globe,
  Award,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/admin/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/admin/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Skeleton } from "@/components/admin/ui/skeleton";
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "role" | "status" | "delete";
    targetRole?: UserRole;
    targetStatus?: UserStatus;
  }>({ isOpen: false, type: "role" });

  const isAdmin = user?.role === "admin";
  const isActive = user?.status === "active";
  const isSuspended = user?.status === "suspended";
  const online = isUserOnline(user?.user_id);

  const handleToggleRole = async () => {
    if (!user) return;
    const nextRole: UserRole = isAdmin ? "candidate" : "admin";
    try {
      await updateUserRole({ userId: user.user_id, role: nextRole }).unwrap();
      toast.success(
        nextRole === "admin"
          ? "Đã nâng cấp quyền Quản trị viên thành công!"
          : "Đã chuyển vai trò người dùng về Ứng viên!"
      );
      setConfirmModal({ isOpen: false, type: "role" });
    } catch (err: any) {
      toast.error(err?.data?.detail || "Không thể thay đổi vai trò người dùng.");
    }
  };

  const handleToggleStatus = async (newStatus: UserStatus) => {
    if (!user) return;
    try {
      await updateUserStatus({ userId: user.user_id, status: newStatus }).unwrap();
      toast.success(
        newStatus === "active"
          ? "Đã kích hoạt tài khoản thành công!"
          : newStatus === "suspended"
          ? "Đã tạm khóa tài khoản thành công!"
          : "Đã chuyển trạng thái tài khoản thành Đã xóa!"
      );
      setConfirmModal({ isOpen: false, type: "status" });
      if (newStatus === "deleted") {
        router.push("/admin/users");
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || "Không thể cập nhật trạng thái tài khoản.");
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Chưa cập nhật";
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

  const getInitials = (name?: string) => {
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
        <SiteHeader title={user ? `Hồ Sơ Người Dùng #${user.user_id}` : "Chi Tiết Người Dùng"} />

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6 max-w-6xl mx-auto w-full">
          {/* Breadcrumb & Quick Actions Bar */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/admin/users">
                <ArrowLeft className="size-4" />
                <span>Danh sách người dùng</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </Button>
            </div>
          </div>

          {/* SKELETON LOADING STATE */}
          {isLoading && (
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="h-24 bg-muted/50" />
                <CardContent className="p-6 pt-0 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
                    <Skeleton className="size-20 rounded-2xl ring-4 ring-card" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-32 rounded-lg" />
                      <Skeleton className="h-9 w-28 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="p-6 space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
                <Card className="p-6 space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {!isLoading && (error || !user) && (
            <Card className="p-12 text-center border-destructive/30 shadow-lg">
              <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1.5">
                Không tìm thấy thông tin người dùng #{userId}
              </h2>
              <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Tài khoản này có thể đã bị xóa hoặc máy chủ API backend chưa được kết nối.
                Vui lòng kiểm tra lại mã định danh tài khoản.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                  <RefreshCw className="size-3.5" />
                  <span>Thử tải lại</span>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin/users">Về danh sách người dùng</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* LOADED SUCCESS CONTENT */}
          {!isLoading && user && (
            <div className="space-y-6">
              {/* HERO PROFILE CARD */}
              <Card className="overflow-hidden shadow-xs border-border">
                {/* Decorative Header Banner */}
                <div className="h-28 bg-gradient-to-r from-primary/15 via-amber-500/10 to-primary/5 border-b border-border/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                </div>

                <CardContent className="p-6 pt-0 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-5">
                    {/* Avatar & Online Dot */}
                    <div className="relative shrink-0">
                      <Avatar className="size-24 rounded-2xl ring-4 ring-card shadow-md">
                        <AvatarFallback
                          className={`text-2xl font-black rounded-2xl ${
                            isAdmin
                              ? "bg-gradient-to-br from-amber-500/25 to-amber-600/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                              : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      {online && (
                        <span
                          className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 ring-4 ring-card shadow-xs flex items-center justify-center"
                          title="Người dùng đang trực tuyến"
                        >
                          <span className="size-2 rounded-full bg-white" />
                        </span>
                      )}
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: "role",
                            targetRole: isAdmin ? "candidate" : "admin",
                          })
                        }
                        disabled={isUpdatingRole}
                        className="gap-1.5"
                      >
                        <Shield className="size-3.5 text-amber-500" />
                        <span>{isAdmin ? "Chuyển về Ứng viên" : "Thăng cấp Quản trị viên"}</span>
                      </Button>

                      <Button
                        variant={isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: "status",
                            targetStatus: isActive ? "suspended" : "active",
                          })
                        }
                        disabled={isUpdatingStatus}
                        className="gap-1.5"
                      >
                        {isActive ? (
                          <>
                            <Lock className="size-3.5" />
                            <span>Tạm khóa</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="size-3.5" />
                            <span>Kích hoạt lại</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: "delete",
                            targetStatus: "deleted",
                          })
                        }
                        className="text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Xóa</span>
                      </Button>
                    </div>
                  </div>

                  {/* Name, Badges & Meta Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        {user.full_name}
                      </h1>

                      <Badge
                        variant={isAdmin ? "default" : "secondary"}
                        className={`gap-1 font-semibold ${
                          isAdmin
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                            : ""
                        }`}
                      >
                        {isAdmin && <Shield className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                        {isAdmin ? "Quản trị viên" : "Ứng viên"}
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
                        {isActive ? "Đang hoạt động" : isSuspended ? "Tạm khóa" : "Đã xóa"}
                      </Badge>

                      {online && (
                        <Badge variant="outline" className="gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Đang trực tuyến
                        </Badge>
                      )}

                      <span className="text-xs font-mono text-muted-foreground ml-auto">
                        ID: #{user.user_id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-foreground/70" />
                        <span>{user.email}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-foreground/70" />
                        <span>{user.phone || "Chưa có số điện thoại"}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Globe className="size-3.5 text-foreground/70" />
                        <span>Ngôn ngữ: <strong>{user.preferred_language?.toUpperCase() || "VI"}</strong></span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-foreground/70" />
                        <span>Tham gia: {formatDate(user.created_at)}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SHADCN TABS SECTION */}
              <Tabs defaultValue="profile" className="w-full space-y-5">
                <TabsList className="grid w-full grid-cols-2 max-w-md h-10">
                  <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5">
                    <UserCog className="size-3.5" />
                    <span>Hồ sơ & Tài khoản</span>
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="text-xs font-semibold gap-1.5">
                    <Shield className="size-3.5" />
                    <span>Quyền hạn & Hệ thống</span>
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: PROFILE & ACCOUNT DETAILS */}
                <TabsContent value="profile" className="space-y-5 focus-visible:outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Primary Info Card */}
                    <Card>
                      <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <UserCog className="size-4 text-primary" />
                          <span>Thông Tin Định Danh</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Chi tiết các trường thông tin đăng ký của người dùng trong cơ sở dữ liệu.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 space-y-3.5 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">Mã định danh tài khoản:</span>
                          <span className="font-mono font-bold text-foreground">#{user.user_id}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">Họ và tên:</span>
                          <span className="font-semibold text-foreground">{user.full_name}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">Email tài khoản:</span>
                          <span className="font-medium text-foreground">{user.email}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">Số điện thoại:</span>
                          <span className="font-medium text-foreground">{user.phone || "Chưa thiết lập"}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">Ngôn ngữ ưu tiên:</span>
                          <span className="font-bold uppercase text-foreground">{user.preferred_language || "vi"}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">Thời điểm tạo:</span>
                          <span className="text-foreground">{formatDate(user.created_at)}</span>
                        </div>

                        <div className="flex justify-between py-1.5">
                          <span className="text-muted-foreground">Lần cập nhật cuối:</span>
                          <span className="text-foreground">{formatDate(user.updated_at)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Status & Security Card */}
                    <Card>
                      <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Activity className="size-4 text-emerald-500" />
                          <span>Tình Trạng & Bảo Mật</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Trạng thái kết nối thời gian thực và an toàn tài khoản.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 space-y-4 text-xs">
                        <div className="p-3.5 rounded-xl border bg-muted/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                              <span>Trạng thái tài khoản:</span>
                            </span>
                            <Badge
                              variant={isActive ? "default" : isSuspended ? "secondary" : "destructive"}
                              className="text-[11px] font-semibold"
                            >
                              {isActive ? "Đang hoạt động" : isSuspended ? "Tạm khóa" : "Đã xóa"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {isActive
                              ? "Tài khoản có đầy đủ quyền đăng nhập và tham gia các tính năng theo gói cước."
                              : "Tài khoản bị hạn chế đăng nhập và không thể thực hiện các phiên phỏng vấn mới."}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border bg-muted/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <Sparkles className="size-3.5 text-primary" />
                              <span>Kết nối thời gian thực:</span>
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-semibold ${
                                online
                                  ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {online ? "Đang trực tuyến" : "Ngoại tuyến"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {online
                              ? "Người dùng hiện đang mở ứng dụng và kết nối WebSocket với máy chủ."
                              : "Người dùng hiện không có phiên WebSocket hoạt động."}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: "status",
                                targetStatus: isActive ? "suspended" : "active",
                              })
                            }
                            className="gap-1.5 text-xs"
                          >
                            {isActive ? (
                              <>
                                <Lock className="size-3.5 text-amber-500" />
                                <span>Tạm khóa tài khoản này</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="size-3.5 text-emerald-500" />
                                <span>Mở khóa tài khoản này</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* TAB 2: ROLES & SYSTEM CAPABILITIES */}
                <TabsContent value="roles" className="space-y-5 focus-visible:outline-none">
                  <Card>
                    <CardHeader className="pb-4 border-b">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Shield className="size-4 text-amber-500" />
                        <span>Quyền Hạn Hệ Thống Của Tài Khoản</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Vai trò hiện tại của người dùng là <strong>{isAdmin ? "Quản trị viên (Admin)" : "Ứng viên (Candidate)"}</strong>.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border transition-all ${
                          isAdmin ? "border-amber-500/40 bg-amber-500/5 shadow-xs" : "bg-muted/30 opacity-70"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                              <Shield className="size-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">Quản Trị Viên (Admin)</p>
                              <p className="text-[11px] text-muted-foreground">Toàn quyền vận hành hệ thống</p>
                            </div>
                          </div>

                          <ul className="space-y-1.5 text-[11px] text-muted-foreground list-disc list-inside mt-3">
                            <li>Truy cập toàn bộ cổng quản trị <code>/admin/*</code></li>
                            <li>Quản lý người dùng, phân quyền và khóa tài khoản</li>
                            <li>Quản lý ngân hàng câu hỏi, ngành nghề và vị trí tuyển dụng</li>
                            <li>Kiểm duyệt nội dung câu hỏi và câu trả lời vi phạm</li>
                            <li>Xem nhật ký hoạt động hệ thống (System Audit Logs)</li>
                          </ul>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all ${
                          !isAdmin ? "border-primary/40 bg-primary/5 shadow-xs" : "bg-muted/30 opacity-70"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                              <UserCog className="size-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">Ứng Viên (Candidate)</p>
                              <p className="text-[11px] text-muted-foreground">Người dùng luyện phỏng vấn</p>
                            </div>
                          </div>

                          <ul className="space-y-1.5 text-[11px] text-muted-foreground list-disc list-inside mt-3">
                            <li>Thực hành phỏng vấn AI bằng Giọng nói và Văn bản</li>
                            <li>Nhận phản hồi chấm điểm STAR & Rubric 3 tiêu chí</li>
                            <li>Khám phá ngân hàng câu hỏi chọn lọc và gợi ý câu trả lời</li>
                            <li>Quản lý hồ sơ cá nhân và lịch sử kết quả phỏng vấn</li>
                            <li>Đăng ký và quản lý các gói dịch vụ nâng cấp Pro</li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-between border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Thao tác thay đổi quyền hạn sẽ được ghi lại trong <strong>Nhật ký hệ thống (Audit Logs)</strong>.
                        </p>

                        <Button
                          variant={isAdmin ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: "role",
                              targetRole: isAdmin ? "candidate" : "admin",
                            })
                          }
                          disabled={isUpdatingRole}
                          className="gap-1.5 text-xs"
                        >
                          <Shield className="size-3.5 text-amber-500" />
                          <span>{isAdmin ? "Chuyển vai trò thành Ứng viên" : "Thăng cấp thành Quản trị viên"}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* SHADCN CONFIRMATION DIALOG */}
        <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && setConfirmModal({ isOpen: false, type: "role" })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`size-10 rounded-xl flex items-center justify-center ${
                  confirmModal.type === "delete"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}>
                  {confirmModal.type === "delete" ? (
                    <Trash2 className="size-5" />
                  ) : confirmModal.type === "role" ? (
                    <Shield className="size-5" />
                  ) : (
                    <AlertTriangle className="size-5" />
                  )}
                </div>

                <div>
                  <DialogTitle>
                    {confirmModal.type === "delete"
                      ? "Xác nhận xóa tài khoản?"
                      : confirmModal.type === "role"
                      ? "Xác nhận thay đổi vai trò?"
                      : "Xác nhận cập nhật trạng thái?"}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Người dùng: <strong>{user?.full_name}</strong> ({user?.email})
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-2 text-xs text-muted-foreground leading-relaxed">
              {confirmModal.type === "delete" ? (
                <p>
                  Bạn có chắc chắn muốn xóa tài khoản này không? Tài khoản sẽ chuyển sang trạng thái
                  <strong> Đã xóa</strong> và người dùng sẽ không thể đăng nhập vào hệ thống.
                </p>
              ) : confirmModal.type === "role" ? (
                <p>
                  Bạn có chắc chắn muốn chuyển vai trò của người dùng này sang{" "}
                  <strong>{confirmModal.targetRole === "admin" ? "Quản trị viên (Admin)" : "Ứng viên (Candidate)"}</strong> không?
                  {confirmModal.targetRole === "admin" && " Người dùng sẽ có toàn quyền truy cập các tính năng quản trị."}
                </p>
              ) : (
                <p>
                  Bạn có chắc chắn muốn chuyển trạng thái tài khoản sang{" "}
                  <strong>{confirmModal.targetStatus === "active" ? "Đang hoạt động" : "Tạm khóa"}</strong> không?
                </p>
              )}
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmModal({ isOpen: false, type: "role" })}>
                Hủy bỏ
              </Button>
              <Button
                variant={confirmModal.type === "delete" ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  if (confirmModal.type === "role") {
                    handleToggleRole();
                  } else if (confirmModal.targetStatus) {
                    handleToggleStatus(confirmModal.targetStatus);
                  }
                }}
              >
                Xác nhận thực hiện
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
