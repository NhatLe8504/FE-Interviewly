"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  Eye,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { domainAdminApi, type RoleAdminCreateIn } from "@/services/admin/domainAdminApi";
import type { CatalogStatusFilter, DomainAdminDetail, RoleAdminSummary } from "@/types/catalog";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/admin/ui/dropdown-menu";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";

type FormMode = "create" | "edit" | null;

const statusLabels: Record<CatalogStatusFilter, string> = {
  active: "Đang hoạt động",
  archived: "Đã lưu trữ",
  all: "Tất cả trạng thái",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
};

export default function AdminDomainDetailClient({ domainId }: { domainId: number }) {
  const [statusFilter, setStatusFilter] = useState<CatalogStatusFilter>("active");
  const [detail, setDetail] = useState<DomainAdminDetail | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingRole, setEditingRole] = useState<RoleAdminSummary | null>(null);
  const [form, setForm] = useState<RoleAdminCreateIn>({ domain_id: domainId, role_name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ kind: "domain" | "role"; id: number; name: string; isActive: boolean } | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const nextDetail = await domainAdminApi.getDomainDetail(domainId, statusFilter);
      setDetail(nextDetail);
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải chi tiết domain");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [domainId, statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const domain = detail?.domain;
  const filteredRoles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return detail?.roles || [];
    return (detail?.roles || []).filter((role) =>
      [role.role_name, role.description].some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [detail?.roles, search]);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ domain_id: domainId, role_name: "", description: "" });
    setFormMode("create");
  };

  const openEdit = (role: RoleAdminSummary) => {
    setEditingRole(role);
    setForm({ domain_id: domainId, role_name: role.role_name, description: role.description || "" });
    setFormMode("edit");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const roleName = form.role_name.trim();
    if (!roleName) {
      toast.error("Vui lòng nhập tên role");
      return;
    }
    setSubmitting(true);
    try {
      if (formMode === "edit" && editingRole) {
        await domainAdminApi.updateRole(editingRole.role_id, { role_name: roleName, description: form.description?.trim() || null });
        toast.success("Đã cập nhật role");
      } else {
        await domainAdminApi.createRole({ domain_id: domainId, role_name: roleName, description: form.description?.trim() || null });
        toast.success("Đã tạo role mới");
      }
      setFormMode(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmTarget) return;
    setStatusUpdating(true);
    try {
      if (confirmTarget.kind === "domain") {
        await domainAdminApi.setDomainStatus(confirmTarget.id, !confirmTarget.isActive);
      } else {
        await domainAdminApi.setRoleStatus(confirmTarget.id, !confirmTarget.isActive);
      }
      toast.success(confirmTarget.isActive ? `Đã lưu trữ ${confirmTarget.kind === "domain" ? "domain" : "role"}` : `Đã khôi phục ${confirmTarget.kind === "domain" ? "domain" : "role"}`);
      setConfirmTarget(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!loading && !domain) {
    return (
      <div className="@container/main flex min-w-0 flex-1 flex-col px-4 py-4 lg:px-6 lg:py-6">
        <AdminEmptyState title="Không tìm thấy domain" description="Domain có thể đã bị xóa hoặc đường dẫn không hợp lệ." action={<Button asChild variant="outline" size="sm"><Link href="/admin/domains"><ChevronLeft className="size-4" />Quay lại danh sách</Link></Button>} />
      </div>
    );
  }

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6">
      <AdminPageHeader title={domain?.domain_name || "Chi tiết domain"} description={domain?.description || "Quản lý các role thuộc domain này."} backHref="/admin/domains" backLabel="Quay lại danh sách" badge={domain?.is_active ? "Đang hoạt động" : "Đã lưu trữ"}>
        <Button variant="outline" size="sm" onClick={() => void loadData(true)} disabled={refreshing} className="gap-1.5"><RefreshCw className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} />Làm mới</Button>
        <Button variant="outline" size="sm" onClick={() => domain && setConfirmTarget({ kind: "domain", id: domain.domain_id, name: domain.domain_name, isActive: domain.is_active })} className="gap-1.5">{domain?.is_active ? <Archive className="size-3.5" /> : <ArchiveRestore className="size-3.5" />}{domain?.is_active ? "Lưu trữ" : "Khôi phục"}</Button>
        <Button size="sm" onClick={openCreate} disabled={!domain?.is_active} className="gap-1.5"><Plus className="size-3.5" />Tạo role</Button>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStatCard title="Role hoạt động" value={domain?.active_role_count || 0} icon={<BriefcaseBusiness className="size-5" />} iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400" description={`${domain?.role_count || 0} role trong domain`} />
        <AdminStatCard title="Tổng câu hỏi" value={domain?.question_count || 0} icon={<MessageSquareText className="size-5" />} iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400" description="Bao gồm câu hỏi đã gắn role" />
        <AdminStatCard title="Ngày tạo" value={formatDate(domain?.created_at)} icon={<BriefcaseBusiness className="size-5" />} description={domain?.is_active ? "Domain đang sẵn sàng sử dụng" : "Domain đang được lưu trữ"} />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4 border-b pb-4">
          <div className="flex flex-col gap-1"><CardTitle>Role trong domain</CardTitle><CardDescription>Quản lý các vị trí tuyển dụng và số lượng câu hỏi tương ứng.</CardDescription></div>
          <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative min-w-0"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mô tả..." className="h-9 pl-9" aria-label="Tìm role" /></div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CatalogStatusFilter)}>
              <SelectTrigger className="h-9 w-full" aria-label="Lọc trạng thái role"><SelectValue /></SelectTrigger>
              <SelectContent position="popper" align="end"><SelectItem value="active">{statusLabels.active}</SelectItem><SelectItem value="archived">{statusLabels.archived}</SelectItem><SelectItem value="all">{statusLabels.all}</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : filteredRoles.length === 0 ? <AdminEmptyState icon={<BriefcaseBusiness className="size-8 opacity-40 text-muted-foreground" />} title={search ? "Không tìm thấy role phù hợp" : statusFilter === "archived" ? "Chưa có role lưu trữ" : "Chưa có role nào"} description={search ? "Thử thay đổi từ khóa tìm kiếm." : "Tạo role đầu tiên để gắn câu hỏi vào đúng vị trí tuyển dụng."} action={!search && statusFilter !== "archived" && domain?.is_active ? <Button size="sm" onClick={openCreate}><Plus className="size-3.5" />Tạo role đầu tiên</Button> : undefined} /> : <Table><TableHeader><TableRow><TableHead className="pl-4">Role</TableHead><TableHead>Câu hỏi</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày tạo</TableHead><TableHead className="w-12 pr-4 text-right"><span className="sr-only">Thao tác</span></TableHead></TableRow></TableHeader><TableBody>{filteredRoles.map((role) => <TableRow key={role.role_id}><TableCell className="max-w-[420px] pl-4"><div className="min-w-0 space-y-1"><div className="truncate font-semibold">{role.role_name}</div><p className="truncate text-xs text-muted-foreground">{role.description || "Chưa có mô tả"}</p></div></TableCell><TableCell className="font-medium">{role.question_count}</TableCell><TableCell><Badge variant={role.is_active ? "default" : "outline"}>{role.is_active ? "Đang hoạt động" : "Đã lưu trữ"}</Badge></TableCell><TableCell className="text-xs text-muted-foreground">{formatDate(role.created_at)}</TableCell><TableCell className="pr-4 text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label={`Thao tác với ${role.role_name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Thao tác</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href={`/admin/questions?domain_id=${domainId}`}><Eye className="size-4" />Xem câu hỏi</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => openEdit(role)}><Pencil className="size-4" />Chỉnh sửa</DropdownMenuItem><DropdownMenuItem onSelect={() => setConfirmTarget({ kind: "role", id: role.role_id, name: role.role_name, isActive: role.is_active })}>{role.is_active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}{role.is_active ? "Lưu trữ" : "Khôi phục"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/20"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">Cần rà soát ngân hàng câu hỏi?</p><p className="text-xs text-muted-foreground">Mở trang câu hỏi với bộ lọc domain hiện tại để kiểm tra nội dung.</p></div><Button asChild variant="outline" size="sm" className="gap-1.5"><Link href={`/admin/questions?domain_id=${domainId}`}>Mở ngân hàng câu hỏi<ArrowUpRight className="size-3.5" /></Link></Button></CardContent></Card>

      <Dialog open={formMode !== null} onOpenChange={(open) => !open && setFormMode(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{formMode === "edit" ? "Chỉnh sửa role" : "Tạo role mới"}</DialogTitle><DialogDescription>Role sẽ được gắn trong domain {domain?.domain_name}.</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="role-name">Tên role <span className="text-destructive">*</span></Label><Input id="role-name" value={form.role_name} onChange={(event) => setForm((current) => ({ ...current, role_name: event.target.value }))} placeholder="Ví dụ: Engineering Manager" autoFocus /></div><div className="space-y-2"><Label htmlFor="role-description">Mô tả</Label><textarea id="role-description" value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn về phạm vi công việc..." rows={4} className="flex min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setFormMode(null)}>Hủy</Button><Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : formMode === "edit" ? "Lưu thay đổi" : "Tạo role"}</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={confirmTarget !== null} onOpenChange={(open) => !open && setConfirmTarget(null)}><DialogContent className="sm:max-w-md"><DialogHeader><div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><TriangleAlert className="size-5" /></div><div className="space-y-1"><DialogTitle>{confirmTarget?.isActive ? `Lưu trữ ${confirmTarget.kind === "domain" ? "domain" : "role"}?` : `Khôi phục ${confirmTarget.kind === "domain" ? "domain" : "role"}?`}</DialogTitle><DialogDescription>{confirmTarget?.name}</DialogDescription></div></div></DialogHeader><p className="text-sm leading-relaxed text-muted-foreground">{confirmTarget?.isActive ? "Mục này sẽ ẩn khỏi catalog public và các bộ lọc câu hỏi. Dữ liệu liên quan vẫn được giữ nguyên." : "Mục này sẽ xuất hiện lại trong các khu vực đang sử dụng catalog."}</p><DialogFooter><Button variant="outline" onClick={() => setConfirmTarget(null)}>Hủy</Button><Button onClick={() => void handleStatusChange()} disabled={statusUpdating}>{statusUpdating ? "Đang cập nhật..." : confirmTarget?.isActive ? "Lưu trữ" : "Khôi phục"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
