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
} from "lucide-react";
import { toast } from "sonner";
import { domainAdminApi, type DomainAdminCreateIn } from "@/services/admin/domainAdminApi";
import type { CatalogStatusFilter, DomainAdminSummary } from "@/types/catalog";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
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

const DOMAIN_ICON_BG = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
];

const DOMAIN_ACCENT = [
  "border-l-blue-500",
  "border-l-rose-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-violet-500",
  "border-l-cyan-500",
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
      toast.error(error?.message || "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch ng\u00e0nh ngh\u1ec1");
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
      [domain.domain_name, domain.description].some((v) => v?.toLowerCase().includes(keyword)),
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
      toast.error("Vui l\u00f2ng nh\u1eadp t\u00ean ng\u00e0nh ngh\u1ec1");
      return;
    }
    setSubmitting(true);
    try {
      if (formMode === "edit" && editingDomain) {
        await domainAdminApi.updateDomain(editingDomain.domain_id, {
          domain_name: domainName,
          description: form.description?.trim() || null,
        });
        toast.success("\u0110\u00e3 c\u1eadp nh\u1eadt ng\u00e0nh ngh\u1ec1");
      } else {
        await domainAdminApi.createDomain({
          domain_name: domainName,
          description: form.description?.trim() || null,
        });
        toast.success("\u0110\u00e3 t\u1ea1o ng\u00e0nh ngh\u1ec1 m\u1edbi");
      }
      setFormMode(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "C\u00f3 l\u1ed7i x\u1ea3y ra. Vui l\u00f2ng th\u1eed l\u1ea1i.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmTarget) return;
    setStatusUpdating(true);
    try {
      await domainAdminApi.setDomainStatus(confirmTarget.domain_id, !confirmTarget.is_active);
      toast.success(confirmTarget.is_active ? "\u0110\u00e3 l\u01b0u tr\u1eef ng\u00e0nh ngh\u1ec1" : "\u0110\u00e3 kh\u00f4i ph\u1ee5c ng\u00e0nh ngh\u1ec1");
      setConfirmTarget(null);
      await loadData(true);
    } catch (error: any) {
      toast.error(error?.message || "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

      <AdminPageHeader
        title="Ng\u00e0nh ngh\u1ec1 & L\u0129nh v\u1ef1c"
        description="H\u1ec7 th\u1ed1ng chia th\u00e0nh nhi\u1ec1u ng\u00e0nh l\u1edbn, m\u1ed7i ng\u00e0nh c\u00f3 c\u00e1c l\u0129nh v\u1ef1c (role) chuy\u00ean s\u00e2u b\u00ean trong."
        badge={`${stats.activeDomains} ng\u00e0nh \u00b7 ${stats.activeRoles} l\u0129nh v\u1ef1c`}
      >
        <Button variant="outline" size="sm" onClick={() => void loadData(true)} disabled={refreshing} className="gap-1.5">
          <RefreshCw className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
          L\u00e0m m\u1edbi
        </Button>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          Th\u00eam ng\u00e0nh
        </Button>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Ng\u00e0nh ho\u1ea1t \u0111\u1ed9ng" value={stats.activeDomains} icon={<Layers3 className="size-5" />} description="\u0110ang hi\u1ec3n th\u1ecb tr\u00ean h\u1ec7 th\u1ed1ng" />
        <AdminStatCard title="Ng\u00e0nh l\u01b0u tr\u1eef" value={stats.archivedDomains} icon={<Archive className="size-5" />} iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400" description="C\u00f3 th\u1ec3 kh\u00f4i ph\u1ee5c b\u1ea5t k\u1ef3 l\u00fac n\u00e0o" />
        <AdminStatCard title="L\u0129nh v\u1ef1c ho\u1ea1t \u0111\u1ed9ng" value={stats.activeRoles} icon={<BriefcaseBusiness className="size-5" />} iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400" description="T\u1ed5ng role thu\u1ed9c c\u00e1c ng\u00e0nh" />
        <AdminStatCard title="T\u1ed5ng c\u00e2u h\u1ecfi" value={stats.totalQuestions} icon={<MessageSquareText className="size-5" />} iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400" description="G\u1eafn v\u1edbi to\u00e0n b\u1ed9 ng\u00e0nh ngh\u1ec1" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="T\u00ecm theo t\u00ean ng\u00e0nh ho\u1eb7c m\u00f4 t\u1ea3\u2026"
            className="h-9 pl-9"
            aria-label="T\u00ecm ng\u00e0nh ngh\u1ec1"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CatalogStatusFilter)}>
          <SelectTrigger className="h-9 w-[180px] shrink-0" aria-label="L\u1ecdc tr\u1ea1ng th\u00e1i">
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
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDomains.length === 0 ? (
        <AdminEmptyState
          icon={<Database className="size-8 opacity-40 text-muted-foreground" />}
          title={search ? "Kh\u00f4ng t\u00ecm th\u1ea5y ng\u00e0nh ph\u00f9 h\u1ee3p" : "Ch\u01b0a c\u00f3 ng\u00e0nh n\u00e0o"}
          description={search ? "Th\u1eed thay \u0111\u1ed5i t\u1eeb kh\u00f3a t\u00ecm ki\u1ebfm." : "T\u1ea1o ng\u00e0nh ngh\u1ec1 \u0111\u1ea7u ti\u00ean \u0111\u1ec3 b\u1eaft \u0111\u1ea7u x\u00e2y d\u1ef1ng c\u1ea5u tr\u00fac h\u1ec7 th\u1ed1ng."}
          action={!search ? <Button size="sm" onClick={openCreate}><Plus className="size-3.5" aria-hidden="true" />Th\u00eam ng\u00e0nh</Button> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDomains.map((domain, index) => {
            const ci = index % DOMAIN_ICON_BG.length;
            const rolePercent = domain.role_count > 0 ? Math.round((domain.active_role_count / domain.role_count) * 100) : 0;
            return (
              <Card
                key={domain.domain_id}
                className={`group relative border-l-[3px] transition-shadow duration-200 hover:shadow-md ${DOMAIN_ACCENT[ci]} ${domain.is_active ? "" : "opacity-60"}`}
              >
                <CardContent className="p-0">
                  <div className="p-5 pb-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${DOMAIN_ICON_BG[ci]}`}>
                          <Layers3 className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm leading-snug truncate text-foreground">{domain.domain_name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={domain.is_active ? "default" : "outline"} className="text-[10px] leading-tight px-1.5 py-px">
                              {domain.is_active ? "Ho\u1ea1t \u0111\u1ed9ng" : "L\u01b0u tr\u1eef"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground tabular-nums">{formatDate(domain.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150" aria-label={`Thao t\u00e1c v\u1edbi ${domain.domain_name}`}>
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Thao t\u00e1c</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => openEdit(domain)}>
                            <Pencil className="size-4" aria-hidden="true" />Ch\u1ec9nh s\u1eeda
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setConfirmTarget(domain)}>
                            {domain.is_active ? <Archive className="size-4" aria-hidden="true" /> : <ArchiveRestore className="size-4" aria-hidden="true" />}
                            {domain.is_active ? "L\u01b0u tr\u1eef" : "Kh\u00f4i ph\u1ee5c"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {domain.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{domain.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">L\u0129nh v\u1ef1c ho\u1ea1t \u0111\u1ed9ng</span>
                        <span className="font-semibold tabular-nums">{domain.active_role_count}<span className="text-muted-foreground font-normal">/{domain.role_count}</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={rolePercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${domain.active_role_count} tr\u00ean ${domain.role_count} l\u0129nh v\u1ef1c ho\u1ea1t \u0111\u1ed9ng`}>
                        <div className="h-full rounded-full bg-primary/70 transition-all duration-300" style={{ width: `${rolePercent}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquareText className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="tabular-nums font-medium text-foreground">{domain.question_count}</span>
                      <span>c\u00e2u h\u1ecfi trong ng\u00e0nh</span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/domains/${domain.domain_id}`}
                    className="flex items-center justify-between px-5 py-2.5 border-t bg-muted/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 transition-colors duration-150 rounded-b-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <span>Xem {domain.role_count} l\u0129nh v\u1ef1c con</span>
                    <ChevronRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
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
            <DialogTitle>{formMode === "edit" ? "Ch\u1ec9nh s\u1eeda ng\u00e0nh ngh\u1ec1" : "T\u1ea1o ng\u00e0nh ngh\u1ec1 m\u1edbi"}</DialogTitle>
            <DialogDescription>M\u1ed7i ng\u00e0nh ngh\u1ec1 ch\u1ee9a nhi\u1ec1u l\u0129nh v\u1ef1c (role) con b\u00ean trong.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-name">T\u00ean ng\u00e0nh ngh\u1ec1 <span className="text-destructive">*</span></Label>
              <Input
                id="domain-name"
                value={form.domain_name}
                onChange={(event) => setForm((current) => ({ ...current, domain_name: event.target.value }))}
                placeholder="V\u00ed d\u1ee5: C\u00f4ng ngh\u1ec7 th\u00f4ng tin (IT)\u2026"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain-description">M\u00f4 t\u1ea3</Label>
              <textarea
                id="domain-description"
                value={form.description || ""}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="M\u00f4 t\u1ea3 ng\u1eafn v\u1ec1 ph\u1ea1m vi ng\u00e0nh ngh\u1ec1\u2026"
                rows={4}
                className="flex min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormMode(null)}>H\u1ee7y</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (formMode === "edit" ? "\u0110ang l\u01b0u\u2026" : "\u0110ang t\u1ea1o\u2026") : formMode === "edit" ? "L\u01b0u Thay \u0110\u1ed5i" : "T\u1ea1o Ng\u00e0nh"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmTarget !== null} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <DialogTitle>{confirmTarget?.is_active ? "L\u01b0u tr\u1eef ng\u00e0nh n\u00e0y?" : "Kh\u00f4i ph\u1ee5c ng\u00e0nh n\u00e0y?"}</DialogTitle>
                <DialogDescription>{confirmTarget?.domain_name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {confirmTarget?.is_active
              ? "Ng\u00e0nh s\u1ebd \u1ea9n kh\u1ecfi h\u1ec7 th\u1ed1ng. C\u00e1c l\u0129nh v\u1ef1c, c\u00e2u h\u1ecfi & d\u1eef li\u1ec7u li\u00ean quan v\u1eabn \u0111\u01b0\u1ee3c gi\u1eef nguy\u00ean."
              : "Ng\u00e0nh s\u1ebd xu\u1ea5t hi\u1ec7n l\u1ea1i tr\u00ean h\u1ec7 th\u1ed1ng. C\u00e1c l\u0129nh v\u1ef1c \u0111\u00e3 l\u01b0u tr\u1eef ri\u00eang v\u1eabn gi\u1eef nguy\u00ean tr\u1ea1ng th\u00e1i."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>H\u1ee7y</Button>
            <Button onClick={() => void handleStatusChange()} disabled={statusUpdating}>
              {statusUpdating ? "\u0110ang c\u1eadp nh\u1eadt\u2026" : confirmTarget?.is_active ? "L\u01b0u Tr\u1eef" : "Kh\u00f4i Ph\u1ee5c"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
