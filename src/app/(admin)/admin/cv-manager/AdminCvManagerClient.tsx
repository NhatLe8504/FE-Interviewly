"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  Award,
  Sparkles,
  TrendingUp,
  Layers,
  Briefcase,
  GraduationCap,
  FolderKanban,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  cvAdminApi,
  type CvDocumentAdmin,
  type CvDocumentDetailAdmin,
  type AtsRulesConfig,
} from "@/services/admin/cvAdminApi";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";

const TEMPLATE_NAMES: Record<string, string> = {
  modern_tech: "Modern Tech",
  executive: "Executive Leader",
  creative: "Creative Designer",
  minimalist: "Minimal Clean",
  academic: "Academic Scholar",
};

export function AdminCvManagerClient() {
  const [cvs, setCvs] = useState<CvDocumentAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal State
  const [selectedCv, setSelectedCv] = useState<CvDocumentDetailAdmin | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ATS Rules Modal State
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [atsRules, setAtsRules] = useState<AtsRulesConfig | null>(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [savingAts, setSavingAts] = useState(false);

  const handleOpenAtsModal = async () => {
    setShowAtsModal(true);
    setLoadingAts(true);
    try {
      const data = await cvAdminApi.getAtsRules();
      setAtsRules(data);
    } catch {
      toast.error("Không thể tải quy chuẩn ATS");
    } finally {
      setLoadingAts(false);
    }
  };

  const handleSaveAtsRules = async () => {
    if (!atsRules) return;
    setSavingAts(true);
    try {
      const updated = await cvAdminApi.updateAtsRules(atsRules);
      setAtsRules(updated);
      toast.success("Đã lưu quy chuẩn tính điểm ATS và hạn mức CV");
      setShowAtsModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi lưu quy chuẩn ATS");
    } finally {
      setSavingAts(false);
    }
  };

  const fetchCvs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cvAdminApi.getCvs({
        search: searchQuery.trim() || undefined,
        template_id: templateFilter,
        limit: 50,
        offset: 0,
      });
      setCvs(data.items);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách hồ sơ CV");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, templateFilter]);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  const handleOpenDetail = async (cv: CvDocumentAdmin) => {
    setLoadingDetail(true);
    try {
      const fullDetail = await cvAdminApi.getCvDetail(cv.id);
      setSelectedCv(fullDetail);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải chi tiết CV");
    } finally {
      setLoadingDetail(false);
    }
  };

  const scoredCvs = cvs.filter((c) => c.ats_score !== null && c.ats_score !== undefined);
  const avgAts =
    scoredCvs.length > 0
      ? (scoredCvs.reduce((acc, c) => acc + (c.ats_score || 0), 0) / scoredCvs.length).toFixed(1)
      : "0";
  const highAtsCount = cvs.filter((c) => (c.ats_score || 0) >= 70).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Quản Lý Hồ Sơ Ứng Viên & Điểm ATS (CV Builder)"
        description="Giám sát toàn bộ hồ sơ CV do ứng viên khởi tạo, theo dõi điểm số tương thích hệ thống lọc tự động ATS."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenAtsModal}>
            <SlidersHorizontal className="size-4 mr-2 text-primary" />
            Tiêu Chuẩn ATS
          </Button>
          <Button variant="outline" size="sm" onClick={fetchCvs} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Số Hồ Sơ Đã Tạo"
          value={total}
          description="Hồ sơ CV lưu trữ trên hệ thống"
          icon={<FileText className="size-5 text-indigo-500" />}
        />
        <AdminStatCard
          title="Điểm ATS Trung Bình"
          value={`${avgAts} / 100`}
          description="Độ tương thích từ khóa tuyển dụng"
          icon={<Award className="size-5 text-emerald-500" />}
        />
        <AdminStatCard
          title="Hồ Sơ Đạt Chuẩn ATS (≥70)"
          value={highAtsCount}
          description={`${((highAtsCount / (cvs.length || 1)) * 100).toFixed(0)}% tỷ lệ vượt qua vòng lọc CV`}
          icon={<TrendingUp className="size-5 text-amber-500" />}
        />
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Danh Sách Hồ Sơ CV</CardTitle>
              <CardDescription>
                Hiển thị {cvs.length} hồ sơ theo ứng viên và mẫu thiết kế
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm tên ứng viên, email, CV..."
                  className="pl-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchCvs();
                  }}
                />
              </div>

              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-44 text-sm">
                  <SelectValue placeholder="Mẫu CV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mẫu thiết kế</SelectItem>
                  {Object.entries(TEMPLATE_NAMES).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => fetchCvs()}>
                <RefreshCw className="size-3.5" />
              </Button>
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
          ) : cvs.length === 0 ? (
            <AdminEmptyState
              title="Không tìm thấy hồ sơ CV nào"
              description="Chưa có hồ sơ CV phù hợp với điều kiện tìm kiếm hiện tại."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Mã CV</th>
                    <th className="py-3 px-3">Ứng viên</th>
                    <th className="py-3 px-3">Tiêu đề hồ sơ</th>
                    <th className="py-3 px-3">Mẫu thiết kế</th>
                    <th className="py-3 px-3 text-center">Điểm ATS</th>
                    <th className="py-3 px-3 text-center">Nội dung</th>
                    <th className="py-3 px-3">Ngày tạo</th>
                    <th className="py-3 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cvs.map((cv) => (
                    <tr key={cv.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                        #{cv.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground">{cv.user_name || "Ứng viên"}</div>
                        <div className="text-xs text-muted-foreground">{cv.user_email || `ID: ${cv.user_id}`}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground max-w-xs truncate">
                        {cv.title}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {TEMPLATE_NAMES[cv.template_id] || cv.template_id}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cv.ats_score !== null && cv.ats_score !== undefined ? (
                          <span
                            className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                              cv.ats_score >= 80
                                ? "bg-emerald-500/15 text-emerald-600"
                                : cv.ats_score >= 50
                                ? "bg-amber-500/15 text-amber-600"
                                : "bg-rose-500/15 text-rose-600"
                            }`}
                          >
                            {cv.ats_score}đ
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa chấm</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-muted-foreground">
                        {cv.experiences_count} kinh nghiệm • {cv.skills_count} kỹ năng
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">
                        {new Date(cv.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleOpenDetail(cv)}
                          disabled={loadingDetail}
                        >
                          <Eye className="size-3.5 mr-1" />
                          Xem CV
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CV Detail Dialog */}
      <Dialog open={selectedCv !== null} onOpenChange={(open) => !open && setSelectedCv(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold">{selectedCv?.title}</DialogTitle>
                <DialogDescription>
                  Ứng viên: {selectedCv?.user_name} ({selectedCv?.user_email})
                </DialogDescription>
              </div>
              {selectedCv?.ats_score && (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-none font-bold text-sm px-3 py-1">
                  ATS: {selectedCv.ats_score}/100
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedCv && (
            <div className="space-y-5 py-3 text-sm">
              {/* Personal Info */}
              <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Thông Tin Liên Lạc:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <strong>Họ tên:</strong> {selectedCv.personal_info?.full_name || selectedCv.user_name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedCv.personal_info?.email || selectedCv.user_email}
                  </div>
                  <div>
                    <strong>Điện thoại:</strong> {selectedCv.personal_info?.phone || "Chưa cập nhật"}
                  </div>
                  <div>
                    <strong>Địa chỉ:</strong> {selectedCv.personal_info?.location || "Chưa cập nhật"}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedCv.summary && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Mục Tiêu & Giới Thiệu:
                  </div>
                  <p className="text-xs leading-relaxed text-foreground bg-card p-3 rounded-md border">
                    {selectedCv.summary}
                  </p>
                </div>
              )}

              {/* Experiences */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="size-3.5" />
                  Kinh Nghiệm Làm Việc ({selectedCv.work_experiences.length}):
                </div>
                {selectedCv.work_experiences.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Chưa có kinh nghiệm</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCv.work_experiences.map((exp: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-md border bg-card text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{exp.position || exp.role} tại {exp.company}</span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {exp.start_date} – {exp.end_date || "Hiện tại"}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kỹ Năng ({selectedCv.skills.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCv.skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {selectedCv.projects && selectedCv.projects.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FolderKanban className="size-3.5" />
                    Dự Án Nổi Bật ({selectedCv.projects.length}):
                  </div>
                  <div className="space-y-2">
                    {selectedCv.projects.map((proj: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-md border bg-card text-xs space-y-1">
                        <div className="font-semibold text-foreground">{proj.name || proj.title}</div>
                        {proj.description && (
                          <p className="text-muted-foreground leading-relaxed">{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ATS Rules & Limits Dialog */}
      <Dialog open={showAtsModal} onOpenChange={setShowAtsModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <SlidersHorizontal className="size-4 text-primary" />
              Cấu Hình Quy Chuẩn Tính Điểm ATS & Hạn Mức CV
            </DialogTitle>
            <DialogDescription>
              Tùy biến trọng số công thức chấm điểm tương thích JD và hạn mức lưu trữ hồ sơ cho từng hạng tài khoản.
            </DialogDescription>
          </DialogHeader>

          {loadingAts ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : atsRules ? (
            <div className="space-y-4 text-xs py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Trọng số Từ khóa chuyên môn (Keywords Weight %)
                  </label>
                  <Input
                    type="number"
                    value={atsRules.keyword_weight}
                    onChange={(e) =>
                      setAtsRules({ ...atsRules, keyword_weight: Number(e.target.value) })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tỷ lệ % khớp kỹ năng yêu cầu trong JD (mặc định: 65%)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Trọng số Định lượng số liệu (Metrics Weight %)
                  </label>
                  <Input
                    type="number"
                    value={atsRules.metrics_weight}
                    onChange={(e) =>
                      setAtsRules({ ...atsRules, metrics_weight: Number(e.target.value) })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tỷ lệ % điểm cộng cho thành tích STAR có số liệu %, $, ms (mặc định: 30%)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Điểm nền tảng bố cục (Base Score)
                  </label>
                  <Input
                    type="number"
                    value={atsRules.base_score}
                    onChange={(e) =>
                      setAtsRules({ ...atsRules, base_score: Number(e.target.value) })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Điểm cơ bản cho cấu trúc hợp lệ (mặc định: 5)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Điểm tối thiểu đạt chuẩn (Min Passing Score)
                  </label>
                  <Input
                    type="number"
                    value={atsRules.min_passing_score}
                    onChange={(e) =>
                      setAtsRules({ ...atsRules, min_passing_score: Number(e.target.value) })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Ngưỡng điểm hiển thị huy hiệu xanh Vượt chuẩn ATS (mặc định: 70)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Hạn mức lưu CV gói Pro
                  </label>
                  <Input
                    type="number"
                    value={atsRules.pro_cv_limit}
                    onChange={(e) =>
                      setAtsRules({ ...atsRules, pro_cv_limit: Number(e.target.value) })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Số lượng thẻ bài CV tối đa tài khoản Pro được lưu (mặc định: 5)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Hạn mức lưu CV gói Miễn phí (Free)
                  </label>
                  <Input
                    type="number"
                    value={atsRules.free_cv_limit}
                    onChange={(e) =>
                      setAtsRules({ ...atsRules, free_cv_limit: Number(e.target.value) })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Số slot CV lưu trữ cho tài khoản Free (mặc định: 0)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Động từ hành động chuẩn ATS (cách nhau bởi dấu phẩy)
                </label>
                <Input
                  value={atsRules.standard_action_verbs?.join(", ") || ""}
                  onChange={(e) =>
                    setAtsRules({
                      ...atsRules,
                      standard_action_verbs: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Các mục thông tin bắt buộc (cách nhau bởi dấu phẩy)
                </label>
                <Input
                  value={atsRules.required_sections?.join(", ") || ""}
                  onChange={(e) =>
                    setAtsRules({
                      ...atsRules,
                      required_sections: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAtsModal(false)}
                  disabled={savingAts}
                >
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSaveAtsRules} disabled={savingAts}>
                  {savingAts ? "Đang lưu..." : "Lưu Thay Đổi"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
