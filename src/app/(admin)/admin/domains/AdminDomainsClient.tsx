"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  BriefcaseBusiness,
  Database,
  Eye,
  Layers3,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { domainAdminApi, type DomainAdminCreateIn } from "@/services/admin/domainAdminApi";
import type { CatalogStatusFilter, DomainAdminSummary } from "@/types/catalog";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
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

export default function AdminDomainsClient() {
  const [statusFilter, setStatusFilter] = useState<CatalogStatusFilter>("active");
  const [search, setSearch] = useState("");
  const [domains, setDomains] = useState<DomainAdminSummary[]>([]);
  const [stats, setStats] = useState({ activeDomains: 0, archivedDomains: 0, activeRoles: 0, totalQuestions: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingDomain, setEditingDomain] = useState<DomainAdminSummary | null>(null);
  const [form, setForm] = useState<DomainAdminCreateIn>({ domain_name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<DomainAdminSummary | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await domainAdminApi.getDomains(statusFilter);
      setDomains(data.items);
      setStats({
        activeDomains: data.active_domains,
        archivedDomains: data.archived_domains,
        activeRoles: data.active_roles,
        totalQuestions: data.total_questions,
      });
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải danh sách domain");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredDomains = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return domains;
    return domains.filter((domain) =>
      [domain.domain_name, domain.description].some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [domains, search]);

  const openCreate = () => {
    setEditingDomain(null);
    setForm({ domain_name: "", description: "" });
    setFormMode("create");
  };

  const openEdit = (domain: DomainAdminSummary) => {
    setEditingDomain(domain);
    setForm({ domain_name: domain.domain_name, description: domain.description || "" });
    setFormMode("edit");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const domainName = form.domain_name.trim();
    if (!domainName) {
      toast.error("Vui lòng nhập tên domain");
      return;
    }
    setSubmitting(true);
    try {
      if (formMode === "edit" && editingDomain) {
        await domainAdminApi.updateDomain(editingDomain.domain_id, {
          domain_name: domainName,
          description: form.description?.trim() || null,
        });
        toast.success("Đã cập nhật domain");
      } else {
        await domainAdminApi.createDomain({
          domain_name: domainName,
          description: form.description?.trim() || null,
        });
        toast.success("Đã tạo domain mới");
      }
      setFormMode(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu domain");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmTarget) return;
    setStatusUpdating(true);
    try {
      await domainAdminApi.setDomainStatus(confirmTarget.domain_id, !confirmTarget.is_active);
      toast.success(confirmTarget.is_active ? "Đã lưu trữ domain" : "Đã khôi phục domain");
      setConfirmTarget(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật trạng thái domain");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6">
      <AdminPageHeader
        title="Lĩnh vực nghề nghiệp"
        description="Quản lý domain, role và phạm vi câu hỏi được hiển thị trong hệ thống."
        badge={`${domains.length} domain`}
      >
        <Button variant="outline" size="sm" onClick={() => void loadData(true)} disabled={refreshing} className="gap-1.5">
          <RefreshCw className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} />
          Làm mới
        </Button>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="size-3.5" />
          Tạo domain
        </Button>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Domain hoạt động" value={stats.activeDomains} icon={<Layers3 className="size-5" />} description="Đang hiển thị trên catalog" />
        <AdminStatCard title="Domain lưu trữ" value={stats.archivedDomains} icon={<Archive className="size-5" />} iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400" description="Có thể khôi phục bất kỳ lúc nào" />
        <AdminStatCard title="Role hoạt động" value={stats.activeRoles} icon={<BriefcaseBusiness className="size-5" />} iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400" description="Thuộc các domain đang dùng" />
        <AdminStatCard title="Tổng câu hỏi" value={stats.totalQuestions} icon={<MessageSquareText className="size-5" />} iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400" description="Gắn với toàn bộ domain" />
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4 border-b pb-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Danh sách domain</CardTitle>
            <CardDescription>Chọn một domain để quản lý các role và nội dung liên quan.</CardDescription>
          </div>
          <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mô tả..." className="h-9 pl-9" aria-label="Tìm domain" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CatalogStatusFilter)}>
              <SelectTrigger className="h-9 w-full" aria-label="Lọc trạng thái domain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="active">{statusLabels.active}</SelectItem>
                <SelectItem value="archived">{statusLabels.archived}</SelectItem>
                <SelectItem value="all">{statusLabels.all}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
            </div>
          ) : filteredDomains.length === 0 ? (
            <AdminEmptyState
              icon={<Database className="size-8 opacity-40 text-muted-foreground" />}
              title={search ? "Không tìm thấy domain phù hợp" : "Chưa có domain nào"}
              description={search ? "Thử thay đổi từ khóa tìm kiếm." : "Tạo domain đầu tiên để bắt đầu tổ chức ngân hàng câu hỏi."}
              action={!search ? <Button size="sm" onClick={openCreate}><Plus className="size-3.5" />Tạo domain</Button> : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Domain</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-12 pr-4 text-right"><span className="sr-only">Thao tác</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomains.map((domain) => (
                  <TableRow key={domain.domain_id}>
                    <TableCell className="max-w-[360px] pl-4">
                      <div className="min-w-0 space-y-1">
                        <Link href={`/admin/domains/${domain.domain_id}`} className="block truncate font-semibold text-foreground hover:text-primary hover:underline">
                          {domain.domain_name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{domain.description || "Chưa có mô tả"}</p>
                      </div>
                    </TableCell>
                    <TableCell><span className="font-medium">{domain.active_role_count}</span><span className="text-muted-foreground"> / {domain.role_count}</span></TableCell>
                    <TableCell><span className="font-medium">{domain.question_count}</span></TableCell>
                    <TableCell><Badge variant={domain.is_active ? "default" : "outline"}>{domain.is_active ? "Đang hoạt động" : "Đã lưu trữ"}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(domain.created_at)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label={`Thao tác với ${domain.domain_name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild><Link href={`/admin/domains/${domain.domain_id}`}><Eye className="size-4" />Xem chi tiết</Link></DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openEdit(domain)}><Pencil className="size-4" />Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setConfirmTarget(domain)}>
                            {domain.is_active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
                            {domain.is_active ? "Lưu trữ" : "Khôi phục"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formMode !== null} onOpenChange={(open) => !open && setFormMode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Chỉnh sửa domain" : "Tạo domain mới"}</DialogTitle>
            <DialogDescription>Thông tin này giúp admin phân loại role và ngân hàng câu hỏi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-name">Tên domain <span className="text-destructive">*</span></Label>
              <Input id="domain-name" value={form.domain_name} onChange={(event) => setForm((current) => ({ ...current, domain_name: event.target.value }))} placeholder="Ví dụ: Engineering Management" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain-description">Mô tả</Label>
              <textarea id="domain-description" value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn về phạm vi domain..." rows={4} className="flex min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormMode(null)}>Hủy</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : formMode === "edit" ? "Lưu thay đổi" : "Tạo domain"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmTarget !== null} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><TriangleAlert className="size-5" /></div>
              <div className="space-y-1"><DialogTitle>{confirmTarget?.is_active ? "Lưu trữ domain?" : "Khôi phục domain?"}</DialogTitle><DialogDescription>{confirmTarget?.domain_name}</DialogDescription></div>
            </div>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">{confirmTarget?.is_active ? "Domain sẽ ẩn khỏi catalog public và các bộ lọc câu hỏi. Dữ liệu role, câu hỏi và lịch sử vẫn được giữ nguyên." : "Domain sẽ xuất hiện lại trong catalog public. Các role đã lưu trữ vẫn giữ nguyên trạng thái riêng."}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>Hủy</Button>
            <Button onClick={() => void handleStatusChange()} disabled={statusUpdating}>{statusUpdating ? "Đang cập nhật..." : confirmTarget?.is_active ? "Lưu trữ domain" : "Khôi phục domain"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
