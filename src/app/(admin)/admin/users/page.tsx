"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  Plus,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Lock,
  Unlock,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/admin/ui/table";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Card, CardContent } from "@/components/admin/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { AdminPageHeader, AdminStatCard, AdminEmptyState } from "@/components/admin";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetAdminStatsQuery,
} from "@/redux/api/adminApi";
import type { UserAdminOut, UserRole, UserStatus } from "@/types/admin";
import { useSocket } from "@/context/SocketContext";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 15;
  const { onlineCount, isUserOnline } = useSocket();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAdminOut | null>(null);

  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "candidate" as UserRole,
    status: "active" as UserStatus,
    preferred_language: "vi",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const offset = (page - 1) * limit;
  const {
    data: usersData,
    isLoading,
    isFetching,
    refetch,
    error: fetchError,
  } = useGetUsersQuery({
    search: searchTerm.trim() || undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    limit,
    offset,
  });

  const { data: statsData } = useGetAdminStatsQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedRole, selectedStatus]);

  const usersList: UserAdminOut[] = usersData?.items || [];
  const totalUsersCount = usersData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / limit));

  const stats = useMemo(() => {
    return {
      total: statsData?.total_users ?? totalUsersCount,
      active: statsData?.active_users ?? usersList.filter((u) => u.status === "active").length,
      admins: usersList.filter((u) => u.role === "admin").length,
      suspended: usersList.filter((u) => u.status === "suspended").length,
    };
  }, [statsData, totalUsersCount, usersList]);

  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      await updateUserStatus({ userId, status: newStatus }).unwrap();
      toast.success("Cập nhật trạng thái người dùng thành công");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Không thể cập nhật trạng thái người dùng");
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap();
      toast.success(
        newRole === "admin"
          ? "Đã cấp quyền Quản trị viên cho người dùng"
          : "Đã chuyển vai trò về Ứng viên"
      );
    } catch (err: any) {
      toast.error(err?.data?.detail || "Không thể cập nhật vai trò người dùng");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      toast.error("Vui lòng điền đầy đủ họ tên, email và mật khẩu.");
      return;
    }
    setIsSubmittingCreate(true);
    try {
      await createUser(createForm).unwrap();
      toast.success("Tạo người dùng mới thành công!");
      setIsCreateOpen(false);
      setCreateForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        role: "candidate",
        status: "active",
        preferred_language: "vi",
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Lỗi khi tạo người dùng mới.");
    } finally {
      setIsSubmittingCreate(false);
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
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6">
      {/* Reusable Admin Page Header */}
      <AdminPageHeader
        title="Danh Sách Người Dùng"
        badge={`${totalUsersCount} tài khoản`}
        description="Tìm kiếm, phân quyền Quản trị viên và quản lý trạng thái tài khoản ứng viên trong hệ thống."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Plus className="size-4" />
          <span>Thêm người dùng</span>
        </Button>
      </AdminPageHeader>

      {/* Quick Stats Cards using Reusable AdminStatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard
          title="Người dùng Online"
          value={
            <span className="flex items-center gap-1.5">
              {onlineCount} <span className="text-xs font-normal text-muted-foreground">trực tuyến</span>
            </span>
          }
          icon={
            <div className="relative flex items-center justify-center">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
          }
          iconClassName="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          className="border-emerald-500/30 bg-emerald-500/5 shadow-xs"
        />

        <AdminStatCard
          title="Tổng người dùng"
          value={stats.total}
          icon={<Users className="size-5" />}
          iconClassName="bg-primary/10 text-primary"
        />

        <AdminStatCard
          title="Đang hoạt động"
          value={stats.active}
          icon={<UserCheck className="size-5" />}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <AdminStatCard
          title="Quản trị viên"
          value={stats.admins}
          icon={<Shield className="size-5" />}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />

        <AdminStatCard
          title="Tài khoản tạm khóa"
          value={stats.suspended}
          icon={<UserX className="size-5" />}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Search & Filter Controls */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3.5">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, sđt..."
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Filter className="size-3.5" />
              <span>Lọc:</span>
            </div>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-9 w-[170px] text-xs">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="candidate">Ứng viên</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 w-[170px] text-xs">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="suspended">Tạm khóa</SelectItem>
                <SelectItem value="deleted">Đã xóa</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || selectedRole !== "all" || selectedStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("all");
                  setSelectedStatus("all");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table using shadcn Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Người dùng</TableHead>
              <TableHead>Liên hệ & Ngôn ngữ</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                  <span>Đang tải dữ liệu thực từ máy chủ...</span>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-destructive">
                  <p className="font-medium text-sm">Không thể tải dữ liệu từ máy chủ.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vui lòng kiểm tra kết nối API Backend hoặc quyền truy cập tài khoản Quản trị viên.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                    Thử lại
                  </Button>
                </TableCell>
              </TableRow>
            ) : usersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <Users className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-foreground text-sm">Chưa có người dùng nào</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chưa có dữ liệu người dùng nào phù hợp với bộ lọc hiện tại.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              usersList.map((user) => {
                const isAdmin = user.role === "admin";
                const isActive = user.status === "active";
                const isSuspended = user.status === "suspended";

                return (
                  <TableRow key={user.user_id}>
                    {/* User Cell with shadcn Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="size-8">
                            <AvatarFallback
                              className={
                                isAdmin
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs"
                                  : "bg-primary/10 text-primary font-bold text-xs"
                              }
                            >
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {isUserOnline(user.user_id) && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs animate-pulse"
                              title="Đang trực tuyến"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-44 flex items-center gap-1.5">
                            <span>{user.full_name}</span>
                            {isAdmin && <Shield className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-44">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact & Language */}
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span>{user.phone || "Chưa có SĐT"}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                          Ngôn ngữ: {user.preferred_language || "vi"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Role with Dropdown */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-7 px-2.5 text-xs font-semibold gap-1 rounded-full ${
                              isAdmin
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                                : ""
                            }`}
                          >
                            {isAdmin ? "Quản trị viên" : "Ứng viên"}
                            <ArrowUpDown className="size-3 opacity-60" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          <DropdownMenuLabel className="text-xs">Đổi vai trò</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.user_id, "candidate")}
                            className={!isAdmin ? "font-bold text-primary" : ""}
                          >
                            Ứng viên
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.user_id, "admin")}
                            className={isAdmin ? "font-bold text-amber-600" : ""}
                          >
                            Quản trị viên
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Status with Dropdown */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs font-semibold gap-1.5 rounded-full"
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : isSuspended ? "bg-amber-500" : "bg-destructive"
                              }`}
                            />
                            {isActive ? "Hoạt động" : isSuspended ? "Tạm khóa" : "Đã xóa"}
                            <ArrowUpDown className="size-3 opacity-60" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          <DropdownMenuLabel className="text-xs">Đổi trạng thái</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.user_id, "active")}
                            className={isActive ? "font-bold text-emerald-600" : ""}
                          >
                            <CheckCircle2 className="size-3.5 text-emerald-500 mr-1.5" />
                            Đang hoạt động
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.user_id, "suspended")}
                            className={isSuspended ? "font-bold text-amber-600" : ""}
                          >
                            <Lock className="size-3.5 text-amber-500 mr-1.5" />
                            Tạm khóa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.user_id, "deleted")}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5 mr-1.5" />
                            Xóa tài khoản
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Onboarding Status */}
                    <TableCell>
                      {user.is_onboarded ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold"
                        >
                          <CheckCircle2 className="size-2.5 text-emerald-500" />
                          <span>Đã Onboard</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-muted-foreground font-normal">
                          Chưa Onboard
                        </Badge>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </TableCell>

                    {/* Action Column */}
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setSelectedUserForDetail(user)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">Tác vụ người dùng</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/users/${user.user_id}`} className="flex items-center">
                                <Eye className="size-3.5 mr-2" />
                                Xem hồ sơ chi tiết
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.user_id, isAdmin ? "candidate" : "admin")}
                            >
                              <Shield className="size-3.5 mr-2 text-amber-500" />
                              {isAdmin ? "Chuyển thành Ứng viên" : "Thăng cấp Quản trị viên"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(user.user_id, isActive ? "suspended" : "active")
                              }
                            >
                              {isActive ? (
                                <>
                                  <Lock className="size-3.5 mr-2 text-amber-500" />
                                  Khóa tài khoản
                                </>
                              ) : (
                                <>
                                  <Unlock className="size-3.5 mr-2 text-emerald-500" />
                                  Mở khóa tài khoản
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.user_id, "deleted")}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Xóa người dùng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Hiển thị <strong>{usersList.length > 0 ? offset + 1 : 0}</strong> -{" "}
            <strong>{Math.min(offset + limit, totalUsersCount)}</strong> trên tổng số{" "}
            <strong>{totalUsersCount}</strong> người dùng
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Trang trước</span>
            </Button>

            <span className="px-2 font-medium">
              Trang {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1 text-xs"
            >
              <span>Trang sau</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* CREATE USER MODAL with shadcn Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="size-5" />
              </div>
              <div>
                <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
                <DialogDescription>
                  Tạo tài khoản quản trị hoặc ứng viên trực tiếp vào hệ thống.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Họ và tên *</Label>
              <Input
                id="create-name"
                required
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email">Địa chỉ Email *</Label>
              <Input
                id="create-email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="nguyenvana@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password">Mật khẩu khởi tạo *</Label>
              <Input
                id="create-password"
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-phone">Số điện thoại</Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="0912345678"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Ngôn ngữ</Label>
                <Select
                  value={createForm.preferred_language}
                  onValueChange={(val) => setCreateForm({ ...createForm, preferred_language: val })}
                >
                  <SelectTrigger id="create-lang">
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt (VI)</SelectItem>
                    <SelectItem value="en">English (EN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vai trò</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(val) => setCreateForm({ ...createForm, role: val as UserRole })}
                >
                  <SelectTrigger id="create-role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">Ứng viên</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(val) => setCreateForm({ ...createForm, status: val as UserStatus })}
                >
                  <SelectTrigger id="create-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="suspended">Tạm khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isSubmittingCreate} className="gap-1.5">
                {isSubmittingCreate ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Tạo người dùng</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* USER DETAIL MODAL with shadcn Dialog */}
      <Dialog
        open={!!selectedUserForDetail}
        onOpenChange={(open) => !open && setSelectedUserForDetail(null)}
      >
        {selectedUserForDetail && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3.5 mb-2">
                <Avatar className="size-12">
                  <AvatarFallback
                    className={
                      selectedUserForDetail.role === "admin"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-sm"
                        : "bg-primary/10 text-primary font-bold text-sm"
                    }
                  >
                    {getInitials(selectedUserForDetail.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="flex items-center gap-1.5">
                    <span>{selectedUserForDetail.full_name}</span>
                    {selectedUserForDetail.role === "admin" && (
                      <Shield className="size-4 text-amber-500 fill-amber-500" />
                    )}
                  </DialogTitle>
                  <DialogDescription>{selectedUserForDetail.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 text-xs divide-y">
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Mã tài khoản:</span>
                <span className="font-mono font-bold">#{selectedUserForDetail.user_id}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="font-medium">{selectedUserForDetail.phone || "Chưa cập nhật"}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Vai trò hệ thống:</span>
                <Badge
                  variant={selectedUserForDetail.role === "admin" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {selectedUserForDetail.role === "admin" ? "Quản trị viên" : "Ứng viên"}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge
                  variant={
                    selectedUserForDetail.status === "active"
                      ? "default"
                      : selectedUserForDetail.status === "suspended"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {selectedUserForDetail.status === "active" ? "Hoạt động" : "Tạm khóa"}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Ngôn ngữ ưu tiên:</span>
                <span className="font-medium uppercase">{selectedUserForDetail.preferred_language || "vi"}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Ngày khởi tạo:</span>
                <span>{formatDate(selectedUserForDetail.created_at)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Cập nhật gần nhất:</span>
                <span>{formatDate(selectedUserForDetail.updated_at)}</span>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button variant="outline" onClick={() => setSelectedUserForDetail(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
