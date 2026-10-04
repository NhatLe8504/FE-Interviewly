"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  BriefcaseBusiness,
  ChevronRight,
  Database,
  Layers3,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
  Users,
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

type FormMode = "create" | "edit" | null;

const statusLabels: Record<CatalogStatusFilter, string> = {
  active: "Đang hoạt động",
  archived: "Đã lưu trữ",
  all: "Tất cả trạng thái",
};

const DOMAIN_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-800/40",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/40",
];

const DOMAIN_ICON_COLORS = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
];

const formatDate = (value?: string | null) => {
  if (!value) return "\u2014";
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
      toast.error(error?.message || "Không thể tải danh sách ngành nghề");
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
      toast.error("Vui lòng nhập tên ngành nghề");
      return;
    }
    setSubmitting(true);
    try {
      if (formMode === "edit" && editingDomain) {
        await domainAdminApi.updateDomain(editingDomain.domain_id, {
          domain_name: domainName,
          description: form.description?.trim() || null,
        });
        toast.success("Đã cập nhật ngành nghề");
      } else {
        await domainAdminApi.createDomain({
          domain_name: domainName,
          description: form.description?.trim() || null,
        });
        toast.success("Đã tạo ngành nghề mới");
      }
      setFormMode(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmTarget) return;
    setStatusUpdating(true);
    try {
      await domainAdminApi.setDomainStatus(confirmTarget.domain_id, !confirmTarget.is_active);
      toast.success(confirmTarget.is_active ? "Đã lưu trữ ngành nghề" : "Đã khôi phục ngành nghề");
      setConfirmTarget(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <AdminPageHeader
        title="Ngành nghề & Lĩnh vực"
        description="Hệ thống chia thành nhiều ngành lớn, mỗi ngành có các lĩnh vực (role) chuyên sâu bên trong."
        badge={`${stats.activeDomains} ngành · ${stats.activeRoles} lĩnh vực`}
      >
        <Button variant="outline" size="sm" onClick={() => void loadData(true)} disabled={refreshing} className="gap-1.5">
          <RefreshCw className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} />
          Làm mới
        </Button>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="size-3.5" />
          Thêm ngành
        </Button>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Ngành hoạt động" value={stats.activeDomains} icon={<Layers3 className="size-5" />} description="Đang hiển thị trên hệ thống" />
        <AdminStatCard title="Ngành lưu trữ" value={stats.archivedDomains} icon={<Archive className="size-5" />} iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400" description="Có thể khôi phục bất kỳ lúc nào" />
        <AdminStatCard title="Lĩnh vực hoạt động" value={stats.activeRoles} icon={<BriefcaseBusiness className="size-5" />} iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400" description="Tổng role thuộc các ngành" />
        <AdminStatCard title="Tổng câu hỏi" value={stats.totalQuestions} icon={<MessageSquareText className="size-5" />} iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400" description="Gắn với toàn bộ ngành nghề" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên ngành hoặc mô tả..." className="h-9 pl-9" aria-label="Tìm ngành nghề" />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CatalogStatusFilter)}>
          <SelectTrigger className="h-9 w-[180px] shrink-0" aria-label="Lọc trạng thái">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            <SelectItem value="active">{statusLabels.active}</SelectItem>
            <SelectItem value="archived">{statusLabels.archived}</SelectItem>
            <SelectItem value="all">{statusLabels.all}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDomains.length === 0 ? (
        <AdminEmptyState
          icon={<Database className="size-8 opacity-40 text-muted-foreground" />}
          title={search ? "Không tìm thấy ngành phù hợp" : "Chưa có ngành nào"}
          description={search ? "Thử thay đổi từ khóa tìm kiếm." : "Tạo ngành nghề đầu tiên để bắt đầu xây dựng cấu trúc hệ thống."}
          action={!search ? <Button size="sm" onClick={openCreate}><Plus className="size-3.5" />Thêm ngành</Button> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDomains.map((domain, index) => {
            const colorIdx = index % DOMAIN_COLORS.length;
            return (
              <Card key={domain.domain_id} className={`group relative transition-shadow hover:shadow-md border ${domain.is_active ? "" : "opacity-70"}`}>
                <CardContent className="p-0">
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${DOMAIN_ICON_COLORS[colorIdx]}`}>
                          <Layers3 className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm leading-tight truncate">{domain.domain_name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={domain.is_active ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                              {domain.is_active ? "Hoạt động" : "Lưu trữ"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{formatDate(domain.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`Thao tác ${domain.domain_name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => openEdit(domain)}><Pencil className="size-4" />Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setConfirmTarget(domain)}>
                            {domain.is_active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
                            {domain.is_active ? "Lưu trữ" : "Khôi phục"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {domain.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{domain.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <BriefcaseBusiness className="size-3.5 text-muted-foreground" />
                        <span className="font-semibold">{domain.active_role_count}</span>
                        <span className="text-muted-foreground">/{domain.role_count} lĩnh vực</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MessageSquareText className="size-3.5 text-muted-foreground" />
                        <span className="font-semibold">{domain.question_count}</span>
                        <span className="text-muted-foreground">câu hỏi</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/admin/domains/${domain.domain_id}`}
                    className="flex items-center justify-between px-5 py-2.5 border-t bg-muted/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-b-xl"
                  >
                    <span>Xem {domain.role_count} lĩnh vực con</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      </div>

      <Dialog open={formMode !== null} onOpenChange={(open) => !open && setFormMode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Chỉnh sửa ngành nghề" : "Tạo ngành nghề mới"}</DialogTitle>
            <DialogDescription>Mỗi ngành nghề chứa nhiều lĩnh vực (role) con bên trong.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-name">Tên ngành nghề <span className="text-destructive">*</span></Label>
              <Input id="domain-name" value={form.domain_name} onChange={(event) => setForm((current) => ({ ...current, domain_name: event.target.value }))} placeholder="Ví dụ: Công nghệ thông tin (IT)" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain-description">Mô tả</Label>
              <textarea id="domain-description" value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn về phạm vi ngành nghề..." rows={4} className="flex min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormMode(null)}>Hủy</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : formMode === "edit" ? "Lưu thay đổi" : "Tạo ngành"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmTarget !== null} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><TriangleAlert className="size-5" /></div>
              <div className="space-y-1"><DialogTitle>{confirmTarget?.is_active ? "Lưu trữ ngành này?" : "Khôi phục ngành này?"}</DialogTitle><DialogDescription>{confirmTarget?.domain_name}</DialogDescription></div>
            </div>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">{confirmTarget?.is_active ? "Ngành sẽ ẩn khỏi hệ thống. Các lĩnh vực, câu hỏi và dữ liệu liên quan vẫn được giữ nguyên." : "Ngành sẽ xuất hiện lại trên hệ thống. Các lĩnh vực đã lưu trữ riêng vẫn giữ nguyên trạng thái."}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>Hủy</Button>
            <Button onClick={() => void handleStatusChange()} disabled={statusUpdating}>{statusUpdating ? "Đang cập nhật..." : confirmTarget?.is_active ? "Lưu trữ" : "Khôi phục"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
