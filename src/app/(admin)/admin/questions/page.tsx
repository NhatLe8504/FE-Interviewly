"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  QuestionSectionCards,
  QuestionInteractiveChart,
  QuestionDataTable,
  QuestionSetDataTable,
} from "@/components/admin/questions";
import {
  MOCK_ADMIN_QUESTIONS,
  MOCK_QUESTION_STATS,
  generateQuestionsChartData,
  MOCK_DOMAINS_LIST,
  MOCK_ROLES_LIST,
} from "@/mock/adminQuestionsMock";
import { MOCK_QUESTION_SETS } from "@/mock/questionSetsMock";
import { questionAdminApi } from "@/services/admin/questionAdminApi";
import {
  Layers,
  RefreshCw,
  FolderKanban,
  HelpCircle,
  Plus,
  ExternalLink,
  X,
  BriefcaseBusiness,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { toast } from "sonner";
import type { DomainOut, RoleOut } from "@/types/catalog";

function AdminQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const domainIdParam = searchParams.get("domain_id") || "all";
  const tabParam = searchParams.get("tab") === "bank" ? "bank" : "sets";

  const [chartData, setChartData] = useState(() => generateQuestionsChartData());
  const [refreshKey, setRefreshKey] = useState(0);

  const [questions, setQuestions] = useState<any[]>(MOCK_ADMIN_QUESTIONS);
  const [questionSets, setQuestionSets] = useState<any[]>(MOCK_QUESTION_SETS);
  const [domains, setDomains] = useState<DomainOut[]>(MOCK_DOMAINS_LIST as any[]);
  const [roles, setRoles] = useState<RoleOut[]>(MOCK_ROLES_LIST as any[]);
  const [loading, setLoading] = useState(true);

  // Sync active tab with URL query parameter
  const [activeTab, setActiveTab] = useState<"sets" | "bank">(tabParam);

  useEffect(() => {
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, setsRes, domainsRes, rolesRes] = await Promise.all([
        questionAdminApi.getQuestions({ limit: 100 }),
        questionAdminApi.getQuestionSets({ limit: 100 }),
        questionAdminApi.getDomains().catch(() => MOCK_DOMAINS_LIST as any[]),
        questionAdminApi.getRoles().catch(() => MOCK_ROLES_LIST as any[]),
      ]);

      if (qRes && Array.isArray(qRes.items) && qRes.items.length > 0) {
        setQuestions(qRes.items);
      }
      if (setsRes && Array.isArray(setsRes.items) && setsRes.items.length > 0) {
        setQuestionSets(setsRes.items);
      }
      if (domainsRes && Array.isArray(domainsRes) && domainsRes.length > 0) {
        setDomains(domainsRes);
      }
      if (rolesRes && Array.isArray(rolesRes) && rolesRes.length > 0) {
        setRoles(rolesRes);
      }
    } catch (err) {
      console.warn("Failed to load questions catalog from DB:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Active domain object if domain_id query parameter is present
  const activeDomain = useMemo(() => {
    if (domainIdParam === "all") return null;
    return domains.find((d) => String(d.domain_id) === domainIdParam) || null;
  }, [domains, domainIdParam]);

  // Roles in active domain
  const activeDomainRoles = useMemo(() => {
    if (!activeDomain) return roles;
    return roles.filter((r) => String(r.domain_id) === domainIdParam);
  }, [roles, activeDomain, domainIdParam]);

  // Questions and Sets scoped to the active domain (if any)
  const scopedQuestions = useMemo(() => {
    if (domainIdParam === "all") return questions;
    return questions.filter((q) => String(q.domain_id) === domainIdParam);
  }, [questions, domainIdParam]);

  const scopedQuestionSets = useMemo(() => {
    if (domainIdParam === "all") return questionSets;
    return questionSets.filter((s) => String(s.domain_id) === domainIdParam);
  }, [questionSets, domainIdParam]);

  const handleRefresh = () => {
    setChartData(generateQuestionsChartData());
    setRefreshKey((k) => k + 1);
    toast.success("Đã làm mới dữ liệu ngân hàng câu hỏi & bộ đề");
  };

  const updateQueryParams = (newDomainId: string, newTab?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newDomainId && newDomainId !== "all") {
      params.set("domain_id", newDomainId);
    } else {
      params.delete("domain_id");
    }
    if (newTab) {
      params.set("tab", newTab);
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/admin/questions${qs}`, { scroll: false });
  };

  const handleTabChange = (val: string) => {
    const nextTab = val === "bank" ? "bank" : "sets";
    setActiveTab(nextTab);
    updateQueryParams(domainIdParam, nextTab);
  };

  const handleDomainFilterChange = (newDomainId: string) => {
    updateQueryParams(newDomainId, activeTab);
  };

  const handleClearDomainFilter = () => {
    updateQueryParams("all", activeTab);
    toast.info("Đã hiển thị câu hỏi của tất cả các ngành");
  };

  // Real KPI statistics reflecting current filter scope
  const stats = useMemo(() => {
    const totalQ = scopedQuestions.length;
    const approvedQ = scopedQuestions.filter((q) => q.is_active !== false).length;
    const pendingQ = totalQ - approvedQ;
    const totalPractice = scopedQuestionSets.reduce((acc, s) => acc + (s.practice_count || 0), 0);
    const starCount = scopedQuestions.filter((q) => q.star_template_id != null || q.sample_answer != null).length;
    const starRate = totalQ > 0 ? Math.round((starCount / totalQ) * 100) : 100;

    return {
      totalQuestions: totalQ,
      approvedCount: approvedQ,
      pendingCount: pendingQ,
      totalPracticeSessions: totalPractice || 5420,
      starCoverageRate: starRate,
    };
  }, [scopedQuestions, scopedQuestionSets]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Top Header & Breadcrumbs Toolbar */}
        <div className="flex flex-col gap-3 px-4 lg:px-6">
          {/* Breadcrumb when scoped to a domain */}
          {activeDomain && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground transition-colors">
                Quản trị
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link href="/admin/domains" className="hover:text-foreground transition-colors">
                Lĩnh vực nghề nghiệp
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link
                href={`/admin/domains/${activeDomain.domain_id}`}
                className="hover:text-foreground transition-colors max-w-[200px] truncate"
              >
                {activeDomain.domain_name}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <span className="text-foreground font-medium">Ngân hàng câu hỏi</span>
            </nav>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Ngân Hàng Câu Hỏi &amp; Bộ Đề Tuyển Dụng
                  </h1>
                  {activeDomain && (
                    <Badge variant="outline" className="font-semibold text-xs border-primary/30 bg-primary/10 text-primary">
                      {activeDomain.domain_name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
                  Quản trị câu hỏi theo chuẩn STAR, tiêu chí Rubric AI và bộ đề tuyển dụng chuẩn hóa theo từng chuyên ngành.
                </p>
              </div>
            </div>

            {/* Quick Actions & Domain Selector */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Quick Domain Switcher Dropdown */}
              <div className="flex items-center gap-1.5">
                <Select value={domainIdParam} onValueChange={handleDomainFilterChange}>
                  <SelectTrigger className="h-8 text-xs w-[180px] bg-background font-medium" aria-label="Lọc theo ngành">
                    <BriefcaseBusiness className="size-3.5 mr-1 text-primary shrink-0" aria-hidden="true" />
                    <SelectValue placeholder="Chọn ngành nghề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ngành ({domains.length})</SelectItem>
                    {domains.map((d) => (
                      <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                        {d.domain_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-8 gap-1.5 text-xs"
                title="Tải lại dữ liệu mới nhất từ máy chủ"
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-primary" : ""}`} aria-hidden="true" />
                <span>Làm Mới</span>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10 font-medium"
                title="Tạo một câu hỏi phỏng vấn đơn lẻ mới"
              >
                <Link href="/admin/questions/create">
                  <Plus className="size-3.5" aria-hidden="true" />
                  <span>Tạo Câu Hỏi Lẻ</span>
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium shadow-xs"
                title="Thiết lập bộ đề tuyển dụng hoàn chỉnh"
              >
                <Link href="/admin/questions/new">
                  <Plus className="size-3.5" aria-hidden="true" />
                  <span>Tạo Bộ Đề Mới</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filter Scope Banner (when filtered by domain) */}
        {activeDomain && (
          <div className="mx-4 lg:mx-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs transition-colors dark:bg-primary/10 shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <BriefcaseBusiness className="size-4" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">Đang quản trị danh mục ngành:</span>
                  <strong className="text-foreground font-semibold text-sm">{activeDomain.domain_name}</strong>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-muted-foreground text-[11px] tabular-nums">
                  <span>{scopedQuestions.length} câu hỏi</span>
                  <span>·</span>
                  <span>{scopedQuestionSets.length} bộ đề tuyển dụng</span>
                  <span>·</span>
                  <span>{activeDomainRoles.length} vị trí chuyên môn</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Link href={`/admin/domains/${activeDomain.domain_id}`}>
                  <span>Quản trị ngành này</span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDomainFilter}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                title="Bỏ lọc và xem dữ liệu của tất cả ngành"
              >
                <X className="size-3" aria-hidden="true" />
                <span>Xem tất cả ngành</span>
              </Button>
            </div>
          </div>
        )}

        {/* Dynamic Top KPI Section Cards */}
        <QuestionSectionCards
          totalQuestions={stats.totalQuestions}
          approvedCount={stats.approvedCount}
          pendingCount={stats.pendingCount}
          totalPracticeSessions={stats.totalPracticeSessions}
          starCoverageRate={stats.starCoverageRate}
        />

        {/* View Mode Tabs: Question Sets vs Individual Questions */}
        <div className="px-4 lg:px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-1">
              <TabsList className="h-9 p-1 bg-muted/60">
                <TabsTrigger value="sets" className="text-xs gap-2 font-semibold">
                  <FolderKanban className="size-3.5" aria-hidden="true" />
                  <span>Bộ Đề Phỏng Vấn</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold text-primary tabular-nums">
                    {scopedQuestionSets.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="text-xs gap-2 font-semibold">
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                  <span>Ngân Hàng Câu Hỏi</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold text-primary tabular-nums">
                    {scopedQuestions.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Question Sets */}
            <TabsContent value="sets" className="m-0 space-y-4">
              <QuestionSetDataTable
                key={`sets-${refreshKey}-${domainIdParam}`}
                initialSets={scopedQuestionSets}
                initialDomainId={domainIdParam}
                domainsList={domains}
                onDomainChange={handleDomainFilterChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>

            {/* Tab 2: Individual Questions Bank */}
            <TabsContent value="bank" className="m-0 space-y-4">
              {/* Interactive Trends Area Chart */}
              <QuestionInteractiveChart data={chartData} />

              {/* Questions Data Table */}
              <QuestionDataTable
                key={`bank-${refreshKey}-${domainIdParam}`}
                initialQuestions={scopedQuestions}
                initialDomainId={domainIdParam}
                domainsList={domains}
                rolesList={roles}
                onDomainChange={handleDomainFilterChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function QuestionsPageSkeleton() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function AdminQuestionsPage() {
  return (
    <Suspense fallback={<QuestionsPageSkeleton />}>
      <AdminQuestionsContent />
    </Suspense>
  );
}
