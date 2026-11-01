"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Globe,
  Compass,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import {
  starTemplateAdminApi,
  type StarTemplateAdmin,
  type StarTemplateCreateIn,
  type StarTemplateUpdateIn,
} from "@/services/admin/starTemplateAdminApi";
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

export function AdminStarTemplatesClient() {
  const [templates, setTemplates] = useState<StarTemplateAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StarTemplateAdmin | null>(null);
  const [formState, setFormState] = useState<{
    title: string;
    language: string;
    situation_guide: string;
    task_guide: string;
    action_guide: string;
    result_guide: string;
  }>({
    title: "",
    language: "vi",
    situation_guide: "",
    task_guide: "",
    action_guide: "",
    result_guide: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await starTemplateAdminApi.getStarTemplates(
        languageFilter !== "all" ? languageFilter : undefined,
      );
      setTemplates(data);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách mẫu STAR");
    } finally {
      setLoading(false);
    }
  }, [languageFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTemplates = templates.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.situation_guide || "").toLowerCase().includes(q) ||
      (t.action_guide || "").toLowerCase().includes(q)
    );
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, languageFilter]);

  const paginatedTemplates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, page, pageSize]);

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setFormState({
      title: "",
      language: "vi",
      situation_guide: "",
      task_guide: "",
      action_guide: "",
      result_guide: "",
    });
    setDialogMode("create");
  };

  const handleOpenEdit = (t: StarTemplateAdmin) => {
    setSelectedTemplate(t);
    setFormState({
      title: t.title,
      language: t.language || "vi",
      situation_guide: t.situation_guide || "",
      task_guide: t.task_guide || "",
      action_guide: t.action_guide || "",
      result_guide: t.result_guide || "",
    });
    setDialogMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề mẫu STAR");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formState.title.trim(),
        language: formState.language,
        situation_guide: formState.situation_guide.trim() || undefined,
        task_guide: formState.task_guide.trim() || undefined,
        action_guide: formState.action_guide.trim() || undefined,
        result_guide: formState.result_guide.trim() || undefined,
      };

      if (dialogMode === "create") {
        await starTemplateAdminApi.createStarTemplate(payload as StarTemplateCreateIn);
        toast.success("Tạo mẫu STAR mới thành công");
      } else if (selectedTemplate) {
        await starTemplateAdminApi.updateStarTemplate(selectedTemplate.star_template_id, payload);
        toast.success("Cập nhật mẫu STAR thành công");
      }
      setDialogMode(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi thao tác mẫu STAR");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (template: StarTemplateAdmin) => {
    try {
      await starTemplateAdminApi.updateStarTemplate(template.star_template_id, { is_active: template.is_active === false });
      toast.success(template.is_active === false ? "Đã khôi phục mẫu STAR" : "Đã lưu trữ mẫu STAR");
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật trạng thái mẫu");
    }
  };

  const handleDelete = async (t: StarTemplateAdmin) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu STAR "${t.title}"?`)) return;
    try {
      await starTemplateAdminApi.deleteStarTemplate(t.star_template_id);
      toast.success("Đã xóa mẫu STAR thành công");
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi xóa mẫu STAR");
    }
  };

  const viCount = templates.filter((t) => t.language === "vi").length;
  const enCount = templates.filter((t) => t.language === "en").length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Khung Hướng Dẫn STAR (Situation - Task - Action - Result)"
        description="Quản trị các khung mẫu trả lời hành vi, giúp AI hướng dẫn ứng viên cấu trúc câu trả lời chuẩn quốc tế."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="size-4 mr-2" />
            Thêm mẫu STAR mới
          </Button>
        </div>
      </AdminPageHeader>

      {/* Architecture & Scope Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                ℹ
              </span>
              <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                Phạm Vi Áp Dụng & Bản Chất Khung STAR trong Hệ Thống
              </h3>
            </div>
            <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed max-w-4xl">
              • <strong>Chỉ dành cho Câu hỏi Hành vi (Behavioral Questions):</strong> Khung STAR (Tình huống - Nhiệm vụ - Hành động - Kết quả) là tiêu chuẩn phỏng vấn quốc tế nhằm hướng dẫn ứng viên chia sẻ kinh nghiệm xử lý xung đột, áp lực và lãnh đạo.
              <br />
              • <strong>Không ép buộc với Câu hỏi Kỹ thuật (Technical / System Design):</strong> Các câu hỏi chuyên môn lập trình, kiến trúc hệ thống và trắc nghiệm được AI đánh giá trực tiếp theo độ chính xác kỹ thuật mà không gán khung STAR (trường <code>star_template_id</code> được thiết kế <code>NULL</code>).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="border-blue-300 text-blue-800 dark:border-blue-800 dark:text-blue-300 bg-white/60 dark:bg-blue-950/40 text-xs">
              Mô hình Tùy chọn (Optional)
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Số Mẫu STAR"
          value={templates.length}
          description="Khung hướng dẫn phản hồi"
          icon={<Compass className="size-5 text-primary" />}
        />
        <AdminStatCard
          title="Mẫu Tiếng Việt"
          value={viCount}
          description="Dành cho phỏng vấn tiếng Việt"
          icon={<Flag className="size-5 text-rose-500" />}
        />
        <AdminStatCard
          title="Mẫu Tiếng Anh"
          value={enCount}
          description="Dành cho phỏng vấn Global/English"
          icon={<Globe className="size-5 text-emerald-500" />}
        />
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Thư Viện Khung STAR Mẫu</CardTitle>
              <CardDescription>
                Hiển thị {filteredTemplates.length} mẫu hướng dẫn ứng xử theo 4 bước S-T-A-R
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tiêu đề, nội dung..."
                  className="pl-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-36 text-sm">
                  <SelectValue placeholder="Ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">Tiếng Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <AdminEmptyState
              title="Chưa có mẫu STAR nào"
              description="Hệ thống chưa có mẫu hướng dẫn STAR phù hợp. Hãy tạo mẫu đầu tiên."
              action={
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="size-4 mr-2" />
                  Thêm mẫu STAR mới
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedTemplates.map((tmpl) => (
                <Card key={tmpl.star_template_id} className="border shadow-xs flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs uppercase font-bold">
                            {tmpl.language === "vi" ? "Tiếng Việt" : "English"}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            ID #{tmpl.star_template_id} · {tmpl.usage_count ?? 0} câu hỏi sử dụng
                          </span>
                          {tmpl.is_active === false && <Badge variant="secondary">Đã lưu trữ</Badge>}
                        </div>
                        <CardTitle className="text-base font-bold mt-1 text-foreground">
                          {tmpl.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEdit(tmpl)}
                        >
                          <Pencil className="size-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleArchive(tmpl)}
                          title={tmpl.is_active === false ? "Khôi phục mẫu" : "Lưu trữ mẫu"}
                        >
                          {tmpl.is_active === false ? "Khôi phục" : "Lưu trữ"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(tmpl)}
                          disabled={Boolean(tmpl.usage_count)}
                          title={tmpl.usage_count ? "Mẫu đang được câu hỏi sử dụng" : "Xóa mẫu"}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4 text-xs leading-relaxed flex-1">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                        <span className="size-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          S
                        </span>
                        Situation (Tình huống & Bối cảnh)
                      </div>
                      <p className="text-foreground/90 pl-5">
                        {tmpl.situation_guide || "Chưa có hướng dẫn bối cảnh"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                      <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
                        <span className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                          T
                        </span>
                        Task (Nhiệm vụ & Mục tiêu cần đạt)
                      </div>
                      <p className="text-foreground/90 pl-5">
                        {tmpl.task_guide || "Chưa có hướng dẫn nhiệm vụ"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                        <span className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                          A
                        </span>
                        Action (Hành động & Giải pháp triển khai)
                      </div>
                      <p className="text-foreground/90 pl-5">
                        {tmpl.action_guide || "Chưa có hướng dẫn hành động"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                        <span className="size-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                          R
                        </span>
                        Result (Kết quả & Bài học đo lường được)
                      </div>
                      <p className="text-foreground/90 pl-5">
                        {tmpl.result_guide || "Chưa có hướng dẫn kết quả"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
              <AdminPagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(filteredTemplates.length / pageSize))}
                totalItems={filteredTemplates.length}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                pageSizeOptions={[4, 6, 10, 20]}
                itemName="mẫu STAR"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit STAR Modal */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Thêm Mẫu Hướng Dẫn STAR Mới" : `Chỉnh Sửa Mẫu STAR: ${selectedTemplate?.title}`}
            </DialogTitle>
            <DialogDescription>
              Soạn thảo chi tiết 4 khía cạnh gợi ý phản hồi cho ứng viên khi trả lời câu hỏi phỏng vấn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="title">Tiêu đề mẫu STAR *</Label>
                <Input
                  id="title"
                  placeholder="VD: Xử lý xung đột nhóm, Tối ưu hệ thống chịu tải lớn..."
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lang">Ngôn ngữ</Label>
                <Select
                  value={formState.language}
                  onValueChange={(val) => setFormState({ ...formState, language: val })}
                >
                  <SelectTrigger id="lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">Tiếng Anh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s_guide" className="text-blue-600 dark:text-blue-400 font-semibold">
                S - Situation Guide (Bối cảnh tình huống)
              </Label>
              <textarea
                id="s_guide"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Gợi ý cách mở đầu: Nêu rõ quy mô dự án, thời điểm xảy ra và thách thức gặp phải..."
                value={formState.situation_guide}
                onChange={(e) => setFormState({ ...formState, situation_guide: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="t_guide" className="text-foreground font-semibold">
                T - Task Guide (Nhiệm vụ của ứng viên)
              </Label>
              <textarea
                id="t_guide"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Gợi ý cách nêu nhiệm vụ: Trách nhiệm cụ thể được giao là gì? KPI hoặc deadline cần đạt..."
                value={formState.task_guide}
                onChange={(e) => setFormState({ ...formState, task_guide: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="a_guide" className="text-emerald-600 dark:text-emerald-400 font-semibold">
                A - Action Guide (Hành động & Các bước giải quyết)
              </Label>
              <textarea
                id="a_guide"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Gợi ý cách nêu hành động: Bạn đã dùng công cụ/kỹ thuật gì? Các bước logic từng bước một..."
                value={formState.action_guide}
                onChange={(e) => setFormState({ ...formState, action_guide: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="r_guide" className="text-amber-600 dark:text-amber-400 font-semibold">
                R - Result Guide (Kết quả định lượng & Bài học)
              </Label>
              <textarea
                id="r_guide"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Gợi ý cách nêu kết quả: Số liệu đo lường (% giảm độ trễ, doanh thu tăng, phản hồi của khách hàng)..."
                value={formState.result_guide}
                onChange={(e) => setFormState({ ...formState, result_guide: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : dialogMode === "create" ? "Tạo mẫu STAR" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
