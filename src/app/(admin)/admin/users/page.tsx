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
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetAdminStatsQuery,
} from "@/redux/api/adminApi";
import type { UserAdminOut, UserRole, UserStatus } from "@/types/admin";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 15;

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

  const usersList: UserAdminOut[] = useMemo(() => {
    if (usersData?.items && usersData.items.length > 0) {
      return usersData.items;
    }
    if (usersData?.total === 0) {
      return [];
    }
    return [
      {
        user_id: 1,
        full_name: "Lê Văn Nhật",
        email: "nhatle08052004n@gmail.com",
        phone: "0981234567",
        role: "admin",
        status: "active",
        preferred_language: "vi",
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: 2,
        full_name: "Lê Anh Vũ",
        email: "vule556677@gmail.com",
        phone: "0976543210",
        role: "admin",
        status: "active",
        preferred_language: "vi",
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: 3,
        full_name: "Lê Trung Hiếu",
        email: "lhieu20231@gmail.com",
        phone: "0912345678",
        role: "admin",
        status: "active",
        preferred_language: "vi",
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: 4,
        full_name: "Huỳnh Thanh Sơn",
        email: "thanhson240624@gmail.com",
        phone: "0934567890",
        role: "admin",
        status: "active",
        preferred_language: "vi",
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: 5,
        full_name: "Trần Minh Quang",
        email: "quang.tran@techcorp.vn",
        phone: "0945678901",
        role: "candidate",
        status: "active",
        preferred_language: "vi",
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: 6,
        full_name: "Nguyễn Thị Mai",
        email: "mai.nguyen@fintech.io",
        phone: "0923456789",
        role: "candidate",
        status: "suspended",
        preferred_language: "vi",
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }, [usersData]);

  const totalUsersCount = usersData?.total ?? usersList.length;
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / limit));

  const stats = useMemo(() => {
    if (statsData) {
      return {
        total: statsData.total_users,
        active: statsData.active_users,
        admins: usersList.filter((u) => u.role === "admin").length,
        suspended: usersList.filter((u) => u.status === "suspended").length,
      };
    }
    return {
      total: usersList.length,
      active: usersList.filter((u) => u.status === "active").length,
      admins: usersList.filter((u) => u.role === "admin").length,
      suspended: usersList.filter((u) => u.status === "suspended").length,
    };
  }, [statsData, usersList]);

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
          ? "Đã cấp quyền Quản trị viên (Admin) cho người dùng"
          : "Đã chuyển vai trò về Ứng viên (Candidate)"
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
        <SiteHeader title="Quản Lý Người Dùng" />

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Danh Sách Người Dùng
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                  {totalUsersCount} tài khoản
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Tìm kiếm, phân quyền Quản trị viên và quản lý trạng thái tài khoản ứng viên trong hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <Plus className="size-4" />
                <span>Thêm người dùng</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3.5">
              <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Tổng người dùng</div>
                <div className="text-xl font-bold text-foreground">{stats.total}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3.5">
              <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <UserCheck className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Đang hoạt động</div>
                <div className="text-xl font-bold text-foreground">{stats.active}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3.5">
              <div className="size-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Shield className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Quản trị viên (Admin)</div>
                <div className="text-xl font-bold text-foreground">{stats.admins}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center gap-3.5">
              <div className="size-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <UserX className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Tài khoản tạm khóa</div>
                <div className="text-xl font-bold text-foreground">{stats.suspended}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row items-center justify-between gap-3.5">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên, email, sđt..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Filter className="size-3.5" />
                <span>Lọc:</span>
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="candidate">Ứng viên (Candidate)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="suspended">Tạm khóa</option>
                <option value="deleted">Đã xóa</option>
              </select>

              {(searchTerm || selectedRole !== "all" || selectedStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRole("all");
                    setSelectedStatus("all");
                  }}
                  className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Người dùng</th>
                    <th className="py-3 px-4">Liên hệ & Ngôn ngữ</th>
                    <th className="py-3 px-4">Vai trò</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Ngày tham gia</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                        <span>Đang tải danh sách người dùng...</span>
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Users className="size-8 mx-auto mb-2 opacity-40" />
                        <div className="font-semibold text-foreground text-sm">Không tìm thấy người dùng nào</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usersList.map((user) => {
                      const isAdmin = user.role === "admin";
                      const isActive = user.status === "active";
                      const isSuspended = user.status === "suspended";

                      return (
                        <tr key={user.user_id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  isAdmin
                                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                    : "bg-primary/15 text-primary border border-primary/25"
                                }`}
                              >
                                {getInitials(user.full_name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate max-w-44 flex items-center gap-1.5">
                                  <span>{user.full_name}</span>
                                  {isAdmin && <Shield className="size-3 text-amber-500 fill-amber-500" />}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate max-w-44">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-0.5 text-muted-foreground">
                              <span>{user.phone || "Chưa cập nhật"}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                                Ngôn ngữ: {user.preferred_language || "vi"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                    isAdmin
                                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                                  }`}
                                >
                                  {isAdmin ? "Admin" : "Candidate"}
                                  <ArrowUpDown className="size-3 opacity-60" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-44">
                                <DropdownMenuLabel className="text-xs">Đổi vai trò</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.user_id, "candidate")}
                                  className={!isAdmin ? "font-bold text-primary" : ""}
                                >
                                  Ứng viên (Candidate)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.user_id, "admin")}
                                  className={isAdmin ? "font-bold text-amber-600" : ""}
                                >
                                  Quản trị viên (Admin)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>

                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                    isActive
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                      : isSuspended
                                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                                  }`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${
                                      isActive ? "bg-emerald-500" : isSuspended ? "bg-amber-500" : "bg-rose-500"
                                    }`}
                                  />
                                  {isActive ? "Hoạt động" : isSuspended ? "Tạm khóa" : "Đã xóa"}
                                  <ArrowUpDown className="size-3 opacity-60" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-44">
                                <DropdownMenuLabel className="text-xs">Đổi trạng thái</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.user_id, "active")}
                                  className={isActive ? "font-bold text-emerald-600" : ""}
                                >
                                  <CheckCircle2 className="size-3.5 text-emerald-500 mr-1.5" />
                                  Hoạt động (Active)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.user_id, "suspended")}
                                  className={isSuspended ? "font-bold text-amber-600" : ""}
                                >
                                  <Lock className="size-3.5 text-amber-500 mr-1.5" />
                                  Tạm khóa (Suspend)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.user_id, "deleted")}
                                  className={user.status === "deleted" ? "font-bold text-rose-600" : "text-rose-600"}
                                >
                                  <Trash2 className="size-3.5 text-rose-500 mr-1.5" />
                                  Xóa tài khoản (Delete)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>

                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            {formatDate(user.created_at)}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <Link
                                href={`/admin/users/${user.user_id}`}
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Xem chi tiết trang"
                              >
                                <Eye className="size-4" />
                              </Link>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <MoreVertical className="size-4" />
                                  </button>
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
                                    {isAdmin ? "Hạ quyền Candidate" : "Nâng quyền Admin"}
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
                                    className="text-rose-600 focus:text-rose-600"
                                  >
                                    <Trash2 className="size-3.5 mr-2" />
                                    Xóa người dùng
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <div>
                Hiển thị <strong>{usersList.length > 0 ? offset + 1 : 0}</strong> -{" "}
                <strong>{Math.min(offset + limit, totalUsersCount)}</strong> trên tổng số{" "}
                <strong>{totalUsersCount}</strong> người dùng
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Trang trước</span>
                </button>

                <span className="px-2 font-medium">
                  Trang {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CREATE USER MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 relative">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Thêm Người Dùng Mới</h3>
                  <p className="text-xs text-muted-foreground">Tạo tài khoản quản trị hoặc ứng viên trực tiếp vào hệ thống.</p>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Họ và tên <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Địa chỉ Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="nguyenvana@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Mật khẩu khởi tạo <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="0912345678"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Ngôn ngữ</label>
                    <select
                      value={createForm.preferred_language}
                      onChange={(e) => setCreateForm({ ...createForm, preferred_language: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="vi">Tiếng Việt (VI)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Vai trò</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="candidate">Ứng viên (Candidate)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Trạng thái</label>
                    <select
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as UserStatus })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="suspended">Tạm khóa</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                  >
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
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* USER DETAIL MODAL */}
        {selectedUserForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedUserForDetail(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-5">
                <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold border border-primary/30">
                  {getInitials(selectedUserForDetail.full_name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    <span>{selectedUserForDetail.full_name}</span>
                    {selectedUserForDetail.role === "admin" && <Shield className="size-3.5 text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedUserForDetail.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">ID tài khoản:</span>
                  <span className="font-mono font-bold">#{selectedUserForDetail.user_id}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span className="font-medium">{selectedUserForDetail.phone || "Chưa cập nhật"}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Vai trò hệ thống:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      selectedUserForDetail.role === "admin"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {selectedUserForDetail.role === "admin" ? "Quản trị viên (Admin)" : "Ứng viên (Candidate)"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      selectedUserForDetail.status === "active"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {selectedUserForDetail.status === "active" ? "Đang hoạt động" : "Tạm khóa"}
                  </span>
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

              <div className="flex items-center justify-end gap-2 pt-5 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUserForDetail(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
