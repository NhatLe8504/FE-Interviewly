"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  HelpCircle,
  Archive,
  ArchiveRestore,
  Layers3,
  ExternalLink,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  domainAdminApi,
  type RoleAdminCreateIn,
  type RoleAdminUpdateIn,
} from "@/services/admin/domainAdminApi";
import type { CatalogStatusFilter, DomainAdminSummary, RoleAdminSummary } from "@/types/catalog";
import { AdminEmptyState, AdminPageHeader, AdminStatCard, AdminPagination } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";

const getRoleInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getRoleColor = (_name: string) => "bg-muted text-foreground border-border";

export function AdminRolesClient() {
  const [roles, setRoles] = useState<RoleAdminSummary[]>([]);
  const [domains, setDomains] = useState<DomainAdminSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomainId, setSelectedDomainId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<CatalogStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Role Detail State
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<RoleAdminSummary | null>(null);

  // Role Dialog State
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleAdminSummary | null>(null);
  const [formState, setFormState] = useState<{
    role_name: string;
    domain_id: number;
    description: string;
  }>({
    role_name: "",
    domain_id: 1,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [domainRes, rolesRes] = await Promise.all([
        domainAdminApi.getDomains("all"),
        domainAdminApi.getRoles(
          selectedDomainId !== "all" ? Number(selectedDomainId) : undefined,
          statusFilter,
        ),
      ]);
      setDomains(domainRes.items);
      setRoles(rolesRes);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách vị trí công việc");
    } finally {
      setLoading(false);
    }
  }, [selectedDomainId, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map domain name by ID
  const domainMap = new Map(domains.map((d) => [d.domain_id, d.domain_name]));

  // Filtered roles
  const filteredRoles = roles.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const dName = (domainMap.get(r.domain_id) || "").toLowerCase();
    return r.role_name.toLowerCase().includes(q) || dName.includes(q);
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDomainId, statusFilter]);

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, page, pageSize]);

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setFormState({
      role_name: "",
      domain_id: domains[0]?.domain_id || 1,
      description: "",
    });
    setDialogMode("create");
  };

  const handleOpenEdit = (r: RoleAdminSummary) => {
    setSelectedRole(r);
    setFormState({
      role_name: r.role_name,
      domain_id: r.domain_id,
      description: r.description || "",
    });
    setDialogMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.role_name.trim()) {
      toast.error("Vui lòng nhập tên vị trí");
      return;
    }

    setSubmitting(true);
    try {
      if (dialogMode === "create") {
        await domainAdminApi.createRole({
          role_name: formState.role_name.trim(),
          domain_id: Number(formState.domain_id),
          description: formState.description.trim() || undefined,
        });
        toast.success("Tạo vị trí công việc mới thành công");
      } else if (selectedRole) {
        await domainAdminApi.updateRole(selectedRole.role_id, {
          role_name: formState.role_name.trim(),
          description: formState.description.trim() || undefined,
        });
        toast.success("Cập nhật vị trí công việc thành công");
      }
      setDialogMode(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi thao tác vị trí");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (r: RoleAdminSummary) => {
    try {
      await domainAdminApi.setRoleStatus(r.role_id, !r.is_active);
      toast.success(`Đã ${!r.is_active ? "kích hoạt" : "lưu trữ"} vị trí ${r.role_name}`);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (r: RoleAdminSummary) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vị trí "${r.role_name}"?`)) return;
    try {
      await domainAdminApi.deleteRole(r.role_id);
      toast.success("Đã xóa vị trí thành công");
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi xóa vị trí (có thể đang có câu hỏi liên kết)");
    }
  };

  const totalQuestions = roles.reduce((acc, r) => acc + (r.question_count || 0), 0);
  const activeRolesCount = roles.filter((r) => r.is_active).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Danh Mục Vị Trí Tuyển Dụng (Job Roles)"
        description="Quản trị các vị trí chuyên môn phân theo từng nhóm ngành nghề, liên kết ngân hàng câu hỏi."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-2" />
            Thêm vị trí mới
          </Button>
        </div>
      </AdminPageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Số Vị Trí Tuyển Dụng"
          value={roles.length}
          description={`${activeRolesCount} vị trí đang hoạt động`}
          icon={<BriefcaseBusiness className="size-5 text-primary" />}
        />
        <AdminStatCard
          title="Số Ngành Nghề Bao Phủ"
          value={domains.length}
          description="Lĩnh vực chuyên môn phân loại"
          icon={<Layers3 className="size-5 text-emerald-500" />}
        />
        <AdminStatCard
          title="Tổng Câu Hỏi Liên Kết"
          value={totalQuestions}
          description="Câu hỏi thuộc các vị trí"
          icon={<HelpCircle className="size-5 text-amber-500" />}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Danh Sách Vị Trí Chuyên Môn</CardTitle>
              <CardDescription>
                Hiển thị {filteredRoles.length} vị trí theo ngành nghề và ngân hàng đề thi
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên vị trí..."
                  className="pl-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
                <SelectTrigger className="w-44 text-sm">
                  <SelectValue placeholder="Chọn ngành nghề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành nghề</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                      {d.domain_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as CatalogStatusFilter)}>
                <SelectTrigger className="w-36 text-sm">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="archived">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRoles.length === 0 ? (
            <AdminEmptyState
              title="Không tìm thấy vị trí nào"
              description="Chưa có vị trí tuyển dụng phù hợp với bộ lọc đã chọn."
              action={
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="size-4 mr-2" />
                  Thêm vị trí mới
                </Button>
              }
            />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Tên vị trí</th>
                    <th className="py-3 px-3">Ngành nghề</th>
                    <th className="py-3 px-3">Mô tả</th>
                    <th className="py-3 px-3 text-center">Câu hỏi</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedRoles.map((role) => (
                    <tr key={role.role_id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`size-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${getRoleColor(
                              role.role_name,
                            )}`}
                          >
                            {getRoleInitials(role.role_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                              {role.role_name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              ID #{role.role_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="font-normal text-xs">
                          {domainMap.get(role.domain_id) || `Domain #${role.domain_id}`}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground max-w-xs truncate">
                        {role.description || "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          href={`/admin/questions?domain_id=${role.domain_id}&role_id=${role.role_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          {role.question_count} câu hỏi
                          <ExternalLink className="size-3" />
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        {role.is_active ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            Đã lưu trữ
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setSelectedRoleForDetail(role)}
                            title="Xem chi tiết vị trí công việc"
                          >
                            <Eye className="size-3.5 mr-1" />
                            Chi tiết
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleOpenEdit(role)}
                          >
                            <Pencil className="size-3.5 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleToggleStatus(role)}
                          >
                            {role.is_active ? (
                              <>
                                <Archive className="size-3.5 mr-1" />
                                Lưu trữ
                              </>
                            ) : (
                              <>
                                <ArchiveRestore className="size-3.5 mr-1" />
                                Khôi phục
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(role)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(filteredRoles.length / pageSize))}
              totalItems={filteredRoles.length}
              pageSize={pageSize}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              itemName="vị trí"
            />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Role Modal */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Thêm Vị Trí Tuyển Dụng Mới" : `Chỉnh Sửa Vị Trí: ${selectedRole?.role_name}`}
            </DialogTitle>
            <DialogDescription>
              Thiết lập tên vị trí, gán vào nhóm ngành nghề tương ứng.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="role_name">Tên vị trí tuyển dụng *</Label>
              <Input
                id="role_name"
                placeholder="VD: Senior Frontend Engineer, DevOps Specialist..."
                value={formState.role_name}
                onChange={(e) => setFormState({ ...formState, role_name: e.target.value })}
                required
              />
            </div>

            {dialogMode === "create" && (
              <div className="space-y-1.5">
                <Label htmlFor="domain_select">Ngành nghề (Domain) *</Label>
                <Select
                  value={String(formState.domain_id)}
                  onValueChange={(val) => setFormState({ ...formState, domain_id: Number(val) })}
                >
                  <SelectTrigger id="domain_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((d) => (
                      <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                        {d.domain_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="desc">Mô tả ngắn</Label>
              <Input
                id="desc"
                placeholder="Mô tả tóm tắt phạm vi công việc..."
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : dialogMode === "create" ? "Tạo vị trí" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Detail Dialog */}
      <Dialog
        open={selectedRoleForDetail !== null}
        onOpenChange={(open) => !open && setSelectedRoleForDetail(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedRoleForDetail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <span>Vị Trí #{selectedRoleForDetail.role_id}</span>
                      {selectedRoleForDetail.is_active ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-none text-xs">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs text-muted-foreground">
                          Đã lưu trữ
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      Ngành nghề: <strong>{domainMap.get(selectedRoleForDetail.domain_id) || `Domain #${selectedRoleForDetail.domain_id}`}</strong>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Role card banner */}
                <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
                  <div
                    className={`size-12 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 ${getRoleColor(
                      selectedRoleForDetail.role_name,
                    )}`}
                  >
                    {getRoleInitials(selectedRoleForDetail.role_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-foreground">
                      {selectedRoleForDetail.role_name}
                    </div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      Đang liên kết <strong>{selectedRoleForDetail.question_count} câu hỏi</strong> phỏng vấn
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">Mô tả phạm vi công việc:</span>
                  <div className="p-3 rounded-lg border bg-card text-foreground/90 leading-relaxed min-h-[60px]">
                    {selectedRoleForDetail.description || "— Chưa có mô tả chi tiết cho vị trí này —"}
                  </div>
                </div>

                {/* Quick actions box */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-foreground text-[11px] space-y-1">
                  <div className="font-semibold text-primary flex items-center gap-1.5">
                    <Layers3 className="size-3.5" />
                    Ngân Hàng Câu Hỏi & Đề Phỏng Vấn
                  </div>
                  <p className="leading-relaxed">
                    Bạn có thể truy cập trực tiếp danh sách câu hỏi của vị trí này để quản lý hoặc tạo bộ đề phỏng vấn mới.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t">
                <Button
                  asChild
                  size="sm"
                  className="w-full sm:w-auto text-xs"
                >
                  <Link
                    href={`/admin/questions?domain_id=${selectedRoleForDetail.domain_id}&role_id=${selectedRoleForDetail.role_id}`}
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    Xem {selectedRoleForDetail.question_count} câu hỏi liên kết
                  </Link>
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const r = selectedRoleForDetail;
                      setSelectedRoleForDetail(null);
                      handleOpenEdit(r);
                    }}
                  >
                    <Pencil className="size-3 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedRoleForDetail(null)}
                    className="text-xs"
                  >
                    Đóng
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
