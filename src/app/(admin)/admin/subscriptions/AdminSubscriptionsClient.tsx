"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Users,
  TrendingUp,
  Pencil,
  Trash2,
  Calendar,
  FileCheck2,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import {
  subscriptionAdminApi,
  type SubscriptionPlanAdmin,
  type SubscriptionPlanCreateIn,
  type SubscriptionPlanUpdateIn,
  type UserSubscriptionAdmin,
} from "@/services/admin/subscriptionAdminApi";
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
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CYCLE_LABELS: Record<string, string> = {
  free: "Miễn phí",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
  yearly: "Hàng năm",
};

export function AdminSubscriptionsClient() {
  const [plans, setPlans] = useState<SubscriptionPlanAdmin[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionAdmin[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "subscribers">("plans");

  // Filters for User Subscriptions
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Plan Dialog state
  const [planDialogMode, setPlanDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanAdmin | null>(null);
  const [planForm, setPlanForm] = useState<{
    plan_name: string;
    price: number;
    billing_cycle: string;
    interview_turns: number;
    max_cv_saved: number;
    pdf_reports: boolean;
    speech_analysis: boolean;
    is_active: boolean;
  }>({
    plan_name: "",
    price: 0,
    billing_cycle: "monthly",
    interview_turns: 50,
    max_cv_saved: 5,
    pdf_reports: true,
    speech_analysis: true,
    is_active: true,
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Extend Subscription Dialog state
  const [selectedSub, setSelectedSub] = useState<UserSubscriptionAdmin | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  // Fetch Plans
  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const data = await subscriptionAdminApi.getPlans();
      setPlans(data);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách gói cước");
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  // Fetch User Subscriptions
  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const data = await subscriptionAdminApi.getUserSubscriptions({
        status: subStatusFilter,
        search: searchQuery.trim() || undefined,
        limit: 50,
        offset: 0,
      });
      setSubscriptions(data.items);
      setSubTotal(data.total);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách thuê bao");
    } finally {
      setLoadingSubs(false);
    }
  }, [subStatusFilter, searchQuery]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (activeTab === "subscribers") {
      fetchSubscriptions();
    }
  }, [activeTab, fetchSubscriptions]);

  // Open Create Dialog
  const handleOpenCreatePlan = () => {
    setSelectedPlan(null);
    setPlanForm({
      plan_name: "",
      price: 99000,
      billing_cycle: "monthly",
      interview_turns: 50,
      max_cv_saved: 5,
      pdf_reports: true,
      speech_analysis: true,
      is_active: true,
    });
    setPlanDialogMode("create");
  };

  // Open Edit Dialog
  const handleOpenEditPlan = (p: SubscriptionPlanAdmin) => {
    setSelectedPlan(p);
    setPlanForm({
      plan_name: p.plan_name,
      price: p.price,
      billing_cycle: p.billing_cycle,
      interview_turns: p.feature_limits?.interview_turns ?? 50,
      max_cv_saved: p.feature_limits?.max_cv_saved ?? 5,
      pdf_reports: Boolean(p.feature_limits?.pdf_reports),
      speech_analysis: Boolean(p.feature_limits?.speech_analysis),
      is_active: p.is_active,
    });
    setPlanDialogMode("edit");
  };

  // Submit Plan Form
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.plan_name.trim()) {
      toast.error("Vui lòng nhập tên gói");
      return;
    }

    setSavingPlan(true);
    try {
      const payload: SubscriptionPlanCreateIn | SubscriptionPlanUpdateIn = {
        plan_name: planForm.plan_name.trim(),
        price: Number(planForm.price),
        billing_cycle: planForm.billing_cycle,
        feature_limits: {
          interview_turns: Number(planForm.interview_turns),
          max_cv_saved: Number(planForm.max_cv_saved),
          pdf_reports: planForm.pdf_reports,
          speech_analysis: planForm.speech_analysis,
        },
        is_active: planForm.is_active,
      };

      if (planDialogMode === "create") {
        await subscriptionAdminApi.createPlan(payload as SubscriptionPlanCreateIn);
        toast.success("Đã tạo gói dịch vụ mới thành công");
      } else if (selectedPlan) {
        await subscriptionAdminApi.updatePlan(selectedPlan.plan_id, payload);
        toast.success("Đã cập nhật gói dịch vụ thành công");
      }
      setPlanDialogMode(null);
      await fetchPlans();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi lưu gói dịch vụ");
    } finally {
      setSavingPlan(false);
    }
  };

  // Toggle Plan Status
  const handleTogglePlanActive = async (p: SubscriptionPlanAdmin) => {
    try {
      await subscriptionAdminApi.updatePlan(p.plan_id, { is_active: !p.is_active });
      toast.success(`Đã ${!p.is_active ? "kích hoạt" : "vô hiệu hóa"} gói ${p.plan_name}`);
      await fetchPlans();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi cập nhật trạng thái gói");
    }
  };

  // Open Extend Subscription Modal
  const handleOpenExtendSub = (sub: UserSubscriptionAdmin) => {
    setSelectedSub(sub);
    const dateStr = sub.end_date ? new Date(sub.end_date).toISOString().split("T")[0] : "";
    setNewEndDate(dateStr);
  };

  // Save Extend Subscription
  const handleSaveExtendSub = async () => {
    if (!selectedSub) return;
    setSavingSub(true);
    try {
      await subscriptionAdminApi.updateUserSubscription(selectedSub.user_subscription_id, {
        end_date: newEndDate ? new Date(newEndDate).toISOString() : undefined,
        status: "active",
      });
      toast.success("Cập nhật thời hạn thuê bao thành công");
      setSelectedSub(null);
      await fetchSubscriptions();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi cập nhật thuê bao");
    } finally {
      setSavingSub(false);
    }
  };

  // Cancel Subscription
  const handleCancelSub = async (sub: UserSubscriptionAdmin) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy thuê bao của người dùng "${sub.user_name || sub.user_email}"?`)) {
      return;
    }
    try {
      await subscriptionAdminApi.updateUserSubscription(sub.user_subscription_id, {
        status: "cancelled",
        auto_renew: false,
      });
      toast.success("Đã hủy thuê bao");
      await fetchSubscriptions();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi thao tác");
    }
  };

  // Compute Metrics
  const totalSubscribers = plans.reduce((acc, p) => acc + (p.subscribers_count || 0), 0);
  const activePlansCount = plans.filter((p) => p.is_active).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <AdminPageHeader
        title="Quản Lý Gói Đăng Ký & Thuê Bao"
        description="Cấu hình bảng giá gói cước, quyền lợi tính năng và giám sát danh sách thuê bao người dùng."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchPlans();
              if (activeTab === "subscribers") fetchSubscriptions();
            }}
          >
            <RefreshCw className="size-4 mr-2" />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreatePlan}>
            <Plus className="size-4 mr-2" />
            Thêm gói mới
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng Gói Cước Hoạt Động"
          value={activePlansCount}
          description={`Trên tổng số ${plans.length} gói đã tạo`}
          icon={<Sparkles className="size-5 text-indigo-500" />}
        />
        <AdminStatCard
          title="Thuê Bao Đang Hoạt Động"
          value={totalSubscribers}
          description="Người dùng có quyền lợi VIP/Pro"
          icon={<Users className="size-5 text-emerald-500" />}
        />
        <AdminStatCard
          title="Gói Phổ Biến Nhất"
          value={
            plans.length > 0
              ? plans.reduce((prev, curr) => (curr.subscribers_count > prev.subscribers_count ? curr : prev)).plan_name
              : "Chưa có"
          }
          description="Nhiều lượt đăng ký nhất"
          icon={<TrendingUp className="size-5 text-amber-500" />}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Bảng Giá & Gói Cước ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="size-4" />
            Danh Sách Thuê Bao ({subTotal})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Plans */}
        <TabsContent value="plans" className="mt-6 space-y-6">
          {loadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <AdminEmptyState
              title="Chưa có gói cước nào"
              description="Hệ thống chưa tạo gói cước dịch vụ nào. Hãy thêm gói đầu tiên."
              action={
                <Button size="sm" onClick={handleOpenCreatePlan}>
                  <Plus className="size-4 mr-2" />
                  Tạo gói mới
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <Card
                  key={p.plan_id}
                  className={`relative flex flex-col justify-between border transition-all ${
                    p.is_active ? "border-border shadow-sm hover:shadow-md" : "border-border/50 opacity-60 bg-muted/20"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={p.is_active ? "default" : "secondary"}>
                        {p.is_active ? "Đang mở bán" : "Tạm ngưng"}
                      </Badge>
                      <Badge variant="outline">{CYCLE_LABELS[p.billing_cycle] || p.billing_cycle}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold mt-2">{p.plan_name}</CardTitle>
                    <div className="mt-1">
                      <span className="text-2xl font-extrabold text-foreground">
                        {p.price > 0 ? `${Number(p.price).toLocaleString("vi-VN")} đ` : "Miễn phí"}
                      </span>
                      {p.price > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          /{CYCLE_LABELS[p.billing_cycle] || p.billing_cycle}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 pb-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Quyền lợi gói:
                    </div>
                    <ul className="text-sm space-y-2 text-foreground/90">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <span>
                          <strong>{p.feature_limits?.interview_turns ?? 5}</strong> lượt hỏi đáp phỏng vấn
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <span>
                          Lưu trữ tối đa <strong>{p.feature_limits?.max_cv_saved ?? 1}</strong> hồ sơ CV
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        {p.feature_limits?.pdf_reports ? (
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <span>Xuất báo cáo phân tích PDF</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {p.feature_limits?.speech_analysis ? (
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <span>Phân tích nhịp nói & WPM giọng nói</span>
                      </li>
                    </ul>

                    <div className="pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                      <span>Thuê bao đang dùng:</span>
                      <strong className="text-foreground">{p.subscribers_count} người</strong>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0 flex items-center gap-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenEditPlan(p)}
                    >
                      <Pencil className="size-3.5 mr-1" />
                      Sửa gói
                    </Button>
                    <Button
                      variant={p.is_active ? "ghost" : "secondary"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleTogglePlanActive(p)}
                    >
                      {p.is_active ? "Tắt" : "Bật"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: User Subscribers */}
        <TabsContent value="subscribers" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Danh Sách Thuê Bao Ứng Viên</CardTitle>
                  <CardDescription>Tra cứu, gia hạn hoặc quản lý gói đang kích hoạt của từng tài khoản</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm email, họ tên..."
                      className="pl-8 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") fetchSubscriptions();
                      }}
                    />
                  </div>
                  <Select value={subStatusFilter} onValueChange={(val) => setSubStatusFilter(val)}>
                    <SelectTrigger className="w-36 text-sm">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang kích hoạt</SelectItem>
                      <SelectItem value="expired">Đã hết hạn</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => fetchSubscriptions()}>
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSubs ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Không tìm thấy thuê bao người dùng nào phù hợp với bộ lọc.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-3">Ứng viên</th>
                        <th className="py-3 px-3">Gói dịch vụ</th>
                        <th className="py-3 px-3">Ngày bắt đầu</th>
                        <th className="py-3 px-3">Ngày hết hạn</th>
                        <th className="py-3 px-3">Tự gia hạn</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {subscriptions.map((sub) => (
                        <tr key={sub.user_subscription_id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-medium text-foreground">{sub.user_name || "Chưa cập nhật"}</div>
                            <div className="text-xs text-muted-foreground">{sub.user_email || `ID: ${sub.user_id}`}</div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="font-semibold">
                              {sub.plan_name || "Gói Pro"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
                            {new Date(sub.start_date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3 px-3 text-xs">
                            {sub.end_date ? (
                              <span
                                className={
                                  new Date(sub.end_date) < new Date() ? "text-rose-500 font-medium" : "text-foreground"
                                }
                              >
                                {new Date(sub.end_date).toLocaleDateString("vi-VN")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Vô thời hạn</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {sub.auto_renew ? (
                              <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                                Có
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Không</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {sub.status === "active" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
                                Đang hoạt động
                              </Badge>
                            ) : sub.status === "expired" ? (
                              <Badge variant="secondary" className="text-muted-foreground">
                                Hết hạn
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-rose-500/15 text-rose-600 border-none">
                                Đã hủy
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleOpenExtendSub(sub)}
                            >
                              <Calendar className="size-3 mr-1" />
                              Gia hạn
                            </Button>
                            {sub.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => handleCancelSub(sub)}
                              >
                                Hủy
                              </Button>
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
      </Tabs>

      {/* Plan Dialog (Create / Edit) */}
      <Dialog open={planDialogMode !== null} onOpenChange={(open) => !open && setPlanDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {planDialogMode === "create" ? "Tạo Gói Dịch Vụ Mới" : `Chỉnh Sửa Gói: ${selectedPlan?.plan_name}`}
            </DialogTitle>
            <DialogDescription>
              Thiết lập tên gói cước, giá bán và cấu hình hạn mức quyền lợi phỏng vấn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPlan} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan_name">Tên gói dịch vụ *</Label>
              <Input
                id="plan_name"
                placeholder="VD: Pro Monthly, VIP Sprint..."
                value={planForm.plan_name}
                onChange={(e) => setPlanForm({ ...planForm, plan_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Giá bán (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_cycle">Chu kỳ thanh toán</Label>
                <Select
                  value={planForm.billing_cycle}
                  onValueChange={(val) => setPlanForm({ ...planForm, billing_cycle: val })}
                >
                  <SelectTrigger id="billing_cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Miễn phí</SelectItem>
                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                    <SelectItem value="quarterly">Hàng quý</SelectItem>
                    <SelectItem value="yearly">Hàng năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="turns">Số lượt phỏng vấn / tháng</Label>
                <Input
                  id="turns"
                  type="number"
                  min="1"
                  value={planForm.interview_turns}
                  onChange={(e) => setPlanForm({ ...planForm, interview_turns: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cvs">Hạn mức lưu hồ sơ CV</Label>
                <Input
                  id="cvs"
                  type="number"
                  min="1"
                  max="20"
                  value={planForm.max_cv_saved}
                  onChange={(e) => setPlanForm({ ...planForm, max_cv_saved: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                  checked={planForm.pdf_reports}
                  onChange={(e) => setPlanForm({ ...planForm, pdf_reports: e.target.checked })}
                />
                <span>Cho phép xuất báo cáo đánh giá chi tiết định dạng PDF</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                  checked={planForm.speech_analysis}
                  onChange={(e) => setPlanForm({ ...planForm, speech_analysis: e.target.checked })}
                />
                <span>Mở khóa tính năng phân tích giọng nói & từ ngữ thừa (filler words)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                  checked={planForm.is_active}
                  onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                />
                <span className="font-medium text-foreground">Kích hoạt mở bán gói cước này trên giao diện người dùng</span>
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setPlanDialogMode(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={savingPlan}>
                {savingPlan ? "Đang lưu..." : planDialogMode === "create" ? "Tạo gói" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Modal */}
      <Dialog open={selectedSub !== null} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gia Hạn Thuê Bao</DialogTitle>
            <DialogDescription>
              Điều chỉnh ngày hết hạn thuê bao cho người dùng {selectedSub?.user_name || selectedSub?.user_email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="text-sm">
              <div className="text-muted-foreground">Gói hiện tại:</div>
              <div className="font-semibold text-foreground">{selectedSub?.plan_name || "Gói Pro"}</div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end_date">Ngày hết hạn mới</Label>
              <Input
                id="end_date"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSub(null)}>
              Đóng
            </Button>
            <Button onClick={handleSaveExtendSub} disabled={savingSub}>
              {savingSub ? "Đang lưu..." : "Xác nhận gia hạn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
