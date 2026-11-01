"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Bot,
  RefreshCw,
  Search,
  Play,
  ExternalLink,
  Layers,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MapPin,
  DollarSign,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  jobAdminApi,
  type JobPostingAdmin,
  type JobSourceAdmin,
} from "@/services/admin/jobAdminApi";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getCompanyInitials = (name?: string | null) => {
  if (!name) return "CT";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getCompanyColor = (_name?: string | null) => {
  return "bg-muted text-foreground border-border";
};

const renderSourceBadge = (sourceId?: string, sourceName?: string | null) => {
  const s = (sourceId || "").toLowerCase();
  if (s.includes("itviec")) {
    return (
      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-[11px] font-semibold gap-1">
        <span className="size-1.5 rounded-full bg-red-500" />
        ITViec
      </Badge>
    );
  }
  if (s.includes("topcv")) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold gap-1">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        TopCV
      </Badge>
    );
  }
  if (s.includes("vietnamworks")) {
    return (
      <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-semibold gap-1">
        <span className="size-1.5 rounded-full bg-blue-500" />
        VietnamWorks
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs font-semibold capitalize">
      {sourceName || sourceId || "Crawler"}
    </Badge>
  );
};

export function AdminJobsClient() {
  const [jobs, setJobs] = useState<JobPostingAdmin[]>([]);
  const [sources, setSources] = useState<JobSourceAdmin[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");

  // Filters
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobPostingAdmin | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await jobAdminApi.getJobs({
        search: searchQuery.trim() || undefined,
        source_id: sourceFilter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setJobs(data.items);
      setTotalJobs(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách việc làm");
    } finally {
      setLoadingJobs(false);
    }
  }, [searchQuery, sourceFilter, page, pageSize]);

  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const data = await jobAdminApi.getSources();
      setSources(data);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách nguồn tuyển dụng");
    } finally {
      setLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchSources();
  }, [fetchJobs, fetchSources]);

  const handleTriggerCrawl = async (sourceId?: string) => {
    setTriggering(true);
    try {
      const res = await jobAdminApi.triggerCrawler(sourceId);
      toast.success(res.message || "Đã kích hoạt bot quét việc làm thành công");
      await fetchSources();
      await fetchJobs();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi kích hoạt bot cào");
    } finally {
      setTriggering(false);
    }
  };

  const handleToggleSource = async (source: JobSourceAdmin) => {
    try {
      await jobAdminApi.toggleSource(source.source_id);
      toast.success(`Đã ${!source.is_active ? "bật" : "tắt"} nguồn ${source.source_name}`);
      await fetchSources();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi thao tác");
    }
  };

  const handleToggleJobStatus = async (job: JobPostingAdmin) => {
    const nextStatus = !job.is_active;
    setJobs((prev) =>
      prev.map((j) => (j.job_id === job.job_id ? { ...j, is_active: nextStatus } : j))
    );
    try {
      await jobAdminApi.updateJobStatus(job.job_id, nextStatus);
      toast.success(`Đã ${nextStatus ? "kích hoạt" : "ẩn"} tin tuyển dụng "${job.title}"`);
    } catch (err: any) {
      setJobs((prev) =>
        prev.map((j) => (j.job_id === job.job_id ? { ...j, is_active: !nextStatus } : j))
      );
      toast.error(err?.message || "Lỗi cập nhật trạng thái tin");
    }
  };

  const activeSourcesCount = sources.filter((s) => s.is_active).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Quản Lý Tin Tuyển Dụng & Bot Cào Dữ Liệu (Job Aggregator)"
        description="Điều phối bot thu thập tin việc làm từ các trang tuyển dụng lớn (ITViec, TopCV, VietnamWorks) và quản lý kho JD phỏng vấn."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchJobs();
              fetchSources();
            }}
          >
            <RefreshCw className="size-4 mr-2" />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={() => handleTriggerCrawl()}
            disabled={triggering}
            
          >
            <Play className={`size-4 mr-2 ${triggering ? "animate-spin" : ""}`} />
            {triggering ? "Đang quét..." : "Quét việc làm ngay"}
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Tin Tuyển Dụng Thu Thập"
          value={totalJobs}
          description="Được chuẩn hóa dùng cho phỏng vấn JD"
          icon={<Briefcase className="size-5" />}
        />
        <AdminStatCard
          title="Nguồn Cào Đang Kích Hoạt"
          value={`${activeSourcesCount} / ${sources.length}`}
          description="Cổng tuyển dụng được tích hợp"
          icon={<Bot className="size-5" />}
        />
        <AdminStatCard
          title="Tần Suất Quét Tự Động"
          value="Mỗi 2 giờ"
          description="Được quản lý bởi scheduler backend"
          icon={<Clock className="size-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="size-4" />
            Tin Tuyển Dụng ({totalJobs})
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Bot className="size-4" />
            Nguồn & Bot Cào ({sources.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Job Postings */}
        <TabsContent value="jobs" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Kho Tin Tuyển Dụng</CardTitle>
                  <CardDescription>
                    Hiển thị {jobs.length} tin việc làm đã thu thập từ các nguồn trực tuyến
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm vị trí, doanh nghiệp..."
                      className="pl-8 text-sm"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") fetchJobs();
                      }}
                    />
                  </div>

                  <Select value={sourceFilter} onValueChange={(val) => { setSourceFilter(val); setPage(1); }}>
                    <SelectTrigger className="w-44 text-sm">
                      <SelectValue placeholder="Nguồn cào" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả nguồn cào</SelectItem>
                      {sources.map((s) => (
                        <SelectItem key={s.source_id} value={s.source_id}>
                          {s.source_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={() => fetchJobs()}>
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loadingJobs ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <AdminEmptyState
                  title="Không tìm thấy việc làm nào"
                  description="Kho tin việc làm trống hoặc không có tin phù hợp với bộ lọc."
                  action={
                    <Button
                      size="sm"
                      onClick={() => handleTriggerCrawl()}
                      disabled={triggering}
                    >
                      <Play className="size-4 mr-2" />
                      Kích hoạt cào ngay
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-3">Vị trí tuyển dụng</th>
                        <th className="py-3 px-3">Doanh nghiệp</th>
                        <th className="py-3 px-3">Nguồn cào</th>
                        <th className="py-3 px-3">Mức lương</th>
                        <th className="py-3 px-3">Địa điểm</th>
                        <th className="py-3 px-3">Ngày cào</th>
                        <th className="py-3 px-3 text-center">Trạng thái</th>
                        <th className="py-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {jobs.map((job) => (
                        <tr key={job.job_id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-foreground text-sm max-w-xs truncate">
                              {job.title}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              ID: {job.job_id}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {job.company_logo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={job.company_logo}
                                  alt={job.company_name || ""}
                                  className="size-8 rounded-lg object-contain border bg-white p-0.5 shrink-0"
                                />
                              ) : (
                                <div className={`size-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${getCompanyColor(job.company_name)}`}>
                                  {getCompanyInitials(job.company_name)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-foreground truncate max-w-[150px]">
                                  {job.company_name || "Doanh nghiệp ẩn danh"}
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="size-2.5" />
                                  <span className="truncate max-w-[140px]">{job.location || "Toàn quốc"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {renderSourceBadge(job.source_id, job.source_name)}
                          </td>
                          <td className="py-3 px-3 text-xs text-foreground font-medium">
                            {job.salary_text || "Thỏa thuận"}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
                            {job.location || "Toàn quốc"}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(job.created_at).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              className="inline-flex items-center gap-1.5 focus:outline-none"
                              title="Bấm để bật hoặc tắt hiển thị tin việc làm này"
                            >
                              {job.is_active ? (
                                <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none text-[11px] font-semibold cursor-pointer">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Hiển thị
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="hover:bg-muted text-[11px] font-semibold cursor-pointer text-muted-foreground">
                                  <XCircle className="size-3 mr-1" />
                                  Đã ẩn
                                </Badge>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => setSelectedJobForDetail(job)}
                                title="Xem chi tiết JD công việc"
                              >
                                <Eye className="size-3.5 mr-1" />
                                Chi tiết
                              </Button>
                              {job.url && (
                                <Button variant="outline" size="sm" asChild className="h-8 px-2 text-xs">
                                  <a href={job.url} target="_blank" rel="noopener noreferrer" title="Mở trang gốc">
                                    <ExternalLink className="size-3.5" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loadingJobs && jobs.length > 0 && (
                <AdminPagination
                  currentPage={page}
                  totalPages={Math.max(1, Math.ceil(totalJobs / pageSize))}
                  totalItems={totalJobs}
                  pageSize={pageSize}
                  onPageChange={(p) => setPage(p)}
                  onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                  }}
                  pageSizeOptions={[10, 15, 25, 50]}
                  itemName="tin việc làm"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Crawler Sources */}
        <TabsContent value="sources" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingSources ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)
            ) : sources.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                Chưa có nguồn cào nào được cấu hình trong CSDL.
              </div>
            ) : (
              sources.map((src) => (
                <Card key={src.source_id} className="border shadow-xs flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant={src.is_active ? "default" : "secondary"}>
                          {src.is_active ? "Đang bật" : "Tạm ngưng"}
                        </Badge>
                        <CardTitle className="text-base font-bold mt-2 text-foreground">
                          {src.source_name}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono truncate max-w-[240px]">
                          {src.base_url}
                        </CardDescription>
                      </div>
                      <Bot className="size-6 text-foreground shrink-0" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tổng tin đã cào:</span>
                      <strong className="text-foreground text-sm">{src.postings_count} tin</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Chu kỳ quét tự động:</span>
                      <span className="font-medium text-foreground">{src.crawl_interval_m} phút</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Đồng bộ gần nhất:</span>
                      <span className="text-muted-foreground font-mono">
                        {src.last_synced_at
                          ? new Date(src.last_synced_at).toLocaleString("vi-VN")
                          : "Chưa quét lần nào"}
                      </span>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0 border-t flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => handleTriggerCrawl(src.source_id)}
                      disabled={triggering || !src.is_active}
                    >
                      <Play className="size-3 mr-1" />
                      Quét nguồn này
                    </Button>
                    <Button
                      variant={src.is_active ? "ghost" : "secondary"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleToggleSource(src)}
                    >
                      {src.is_active ? "Tắt" : "Bật"}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Detail Dialog */}
      <Dialog
        open={selectedJobForDetail !== null}
        onOpenChange={(open) => !open && setSelectedJobForDetail(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedJobForDetail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="text-lg font-bold">
                      {selectedJobForDetail.title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 pt-0.5">
                      <span>ID: #{selectedJobForDetail.job_id}</span>
                      <span>•</span>
                      {renderSourceBadge(
                        selectedJobForDetail.source_id,
                        selectedJobForDetail.source_name,
                      )}
                    </DialogDescription>
                  </div>
                  <div>
                    {selectedJobForDetail.is_active ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-none text-xs">
                        <CheckCircle2 className="size-3 mr-1" />
                        Đang hiển thị
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs text-muted-foreground">
                        <XCircle className="size-3 mr-1" />
                        Đang ẩn
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Company card banner */}
                <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center gap-3">
                  {selectedJobForDetail.company_logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedJobForDetail.company_logo}
                      alt={selectedJobForDetail.company_name || ""}
                      className="size-12 rounded-lg object-contain border bg-white p-1 shrink-0"
                    />
                  ) : (
                    <div
                      className={`size-12 rounded-lg border flex items-center justify-center font-bold text-base shrink-0 ${getCompanyColor(
                        selectedJobForDetail.company_name,
                      )}`}
                    >
                      {getCompanyInitials(selectedJobForDetail.company_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedJobForDetail.company_name || "Doanh nghiệp ẩn danh"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-primary" />
                        {selectedJobForDetail.location || "Toàn quốc"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <DollarSign className="size-3 text-emerald-500" />
                        {selectedJobForDetail.salary_text || "Thỏa thuận"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key metadata grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-card text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nguồn thu thập</span>
                    <strong className="text-foreground capitalize">
                      {selectedJobForDetail.source_name || selectedJobForDetail.source_id}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Ngày cào dữ liệu</span>
                    <strong className="text-foreground">
                      {new Date(selectedJobForDetail.created_at).toLocaleString("vi-VN")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Trạng thái kho tin</span>
                    <strong className="text-foreground">
                      {selectedJobForDetail.is_active ? "Sẵn sàng phỏng vấn" : "Tạm ngưng"}
                    </strong>
                  </div>
                </div>

                {/* Usage notice in system */}
                <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs text-foreground space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-primary" />
                    Ứng dụng trong Hệ Thống Phỏng Vấn AI
                  </div>
                  <p className="leading-relaxed text-[11px] text-muted-foreground">
                    Tin tuyển dụng này được AI sử dụng để tự động phân tích Job Description (JD), trích xuất bộ từ khóa kỹ năng, và mô phỏng buổi phỏng vấn sát với yêu cầu thực tế của doanh nghiệp.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleToggleJobStatus(selectedJobForDetail);
                    setSelectedJobForDetail((prev) =>
                      prev ? { ...prev, is_active: !prev.is_active } : null,
                    );
                  }}
                  className="w-full sm:w-auto text-xs"
                >
                  {selectedJobForDetail.is_active ? (
                    <>
                      <XCircle className="size-3.5 mr-1.5 text-rose-500" />
                      Ẩn khỏi hệ thống
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-500" />
                      Kích hoạt hiển thị
                    </>
                  )}
                </Button>

                {selectedJobForDetail.url && (
                  <Button asChild size="sm" className="w-full sm:w-auto text-xs">
                    <a
                      href={selectedJobForDetail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5 mr-1.5" />
                      Mở liên kết JD gốc
                    </a>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
