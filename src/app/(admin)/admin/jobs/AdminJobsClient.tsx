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
} from "lucide-react";
import { toast } from "sonner";
import {
  jobAdminApi,
  type JobPostingAdmin,
  type JobSourceAdmin,
} from "@/services/admin/jobAdminApi";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminJobsClient() {
  const [jobs, setJobs] = useState<JobPostingAdmin[]>([]);
  const [sources, setSources] = useState<JobSourceAdmin[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");

  // Filters
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await jobAdminApi.getJobs({
        search: searchQuery.trim() || undefined,
        source_id: sourceFilter,
        limit: 50,
        offset: 0,
      });
      setJobs(data.items);
      setTotalJobs(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách việc làm");
    } finally {
      setLoadingJobs(false);
    }
  }, [searchQuery, sourceFilter]);

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
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
          icon={<Briefcase className="size-5 text-indigo-500" />}
        />
        <AdminStatCard
          title="Nguồn Cào Đang Kích Hoạt"
          value={`${activeSourcesCount} / ${sources.length}`}
          description="Cổng tuyển dụng được tích hợp"
          icon={<Bot className="size-5 text-emerald-500" />}
        />
        <AdminStatCard
          title="Tần Suất Quét Tự Động"
          value="Mỗi 2 giờ"
          description="Được quản lý bởi scheduler backend"
          icon={<Clock className="size-5 text-amber-500" />}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") fetchJobs();
                      }}
                    />
                  </div>

                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
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
                        <th className="py-3 px-3 text-right">Xem gốc</th>
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
                            <div className="flex items-center gap-2">
                              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium text-xs">{job.company_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-xs font-semibold capitalize">
                              {job.source_name || job.source_id}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-xs text-foreground font-medium">
                            {job.salary_text}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
                            {job.location}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
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
                            {job.url ? (
                              <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="size-3.5 mr-1" />
                                  Link JD
                                </a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                      <Bot className="size-6 text-indigo-500 shrink-0" />
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
    </div>
  );
}
