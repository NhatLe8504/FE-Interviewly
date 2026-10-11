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
  Eye,
  Crown,
  Zap,
  User,
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
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
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

const getInitials = (name?: string | null) => {
  if (!name) return "KH";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name?: string | null) => {
  const colors = [
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const renderPlanBadge = (planName?: string | null) => {
  const name = (planName || "").toLowerCase();
  if (name.includes("free") || name.includes("miễn phí")) {
    return (
      <Badge variant="outline" className="text-xs font-semibold gap-1">
        <Sparkles className="size-3 text-muted-foreground" />
        {planName || "Gói Free"}
      </Badge>
    );
  }
  if (name.includes("vip") || name.includes("enterprise") || name.includes("doanh nghiệp")) {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold gap-1">
        <Crown className="size-3 text-amber-500" />
        {planName || "Gói VIP"}
      </Badge>
    );
  }
  return (
    <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold gap-1">
      <Zap className="size-3 text-primary" />
      {planName || "Gói Pro"}
    </Badge>
  );
};

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

  // Detail Subscriber Dialog state
  const [selectedSubDetail, setSelectedSubDetail] = useState<UserSubscriptionAdmin | null>(null);

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
                            <div className="flex items-center gap-2.5">
                              <Avatar className={`size-8 border shrink-0 ${getAvatarColor(sub.user_name)}`}>
                                <AvatarFallback className="font-bold text-xs bg-transparent">
                                  {getInitials(sub.user_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate max-w-[160px]">
                                  {sub.user_name || "Chưa cập nhật"}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                                  {sub.user_email || `ID: ${sub.user_id}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {renderPlanBadge(sub.plan_name)}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(sub.start_date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3 px-3 text-xs whitespace-nowrap">
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
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => setSelectedSubDetail(sub)}
                                title="Xem chi tiết quyền lợi & hạn mức"
                              >
                                <Eye className="size-3.5 mr-1" />
                                Chi tiết
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => handleOpenExtendSub(sub)}
                              >
                                <Calendar className="size-3 mr-1" />
                                Gia hạn
                              </Button>
                              {sub.status === "active" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                  onClick={() => handleCancelSub(sub)}
                                >
                                  Hủy
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

      {/* Subscriber Detail Dialog */}
      <Dialog
        open={selectedSubDetail !== null}
        onOpenChange={(open) => !open && setSelectedSubDetail(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedSubDetail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <span>Chi Tiết Thuê Bao #{selectedSubDetail.user_subscription_id}</span>
                      {renderPlanBadge(selectedSubDetail.plan_name)}
                    </DialogTitle>
                    <DialogDescription>
                      Người dùng: <strong>{selectedSubDetail.user_name || "Chưa cập nhật"}</strong> ({selectedSubDetail.user_email || `ID #${selectedSubDetail.user_id}`})
                    </DialogDescription>
                  </div>
                  <div>
                    {selectedSubDetail.status === "active" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-none text-xs">
                        Đang hoạt động
                      </Badge>
                    ) : selectedSubDetail.status === "expired" ? (
                      <Badge variant="secondary" className="text-xs text-muted-foreground">
                        Hết hạn
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-rose-500/15 text-rose-600 border-none text-xs">
                        Đã hủy
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* User card info */}
                <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
                  <Avatar className={`size-10 border shrink-0 ${getAvatarColor(selectedSubDetail.user_name)}`}>
                    <AvatarFallback className="font-bold text-sm bg-transparent">
                      {getInitials(selectedSubDetail.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-foreground truncate">
                      {selectedSubDetail.user_name || "Khách hàng"}
                    </div>
                    <div className="text-muted-foreground truncate">
                      {selectedSubDetail.user_email} • User ID: #{selectedSubDetail.user_id}
                    </div>
                  </div>
                </div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-card">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Ngày kích hoạt</span>
                    <strong className="text-foreground">
                      {new Date(selectedSubDetail.start_date).toLocaleDateString("vi-VN")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Ngày hết hạn</span>
                    <strong className="text-foreground">
                      {selectedSubDetail.end_date
                        ? new Date(selectedSubDetail.end_date).toLocaleDateString("vi-VN")
                        : "Vô thời hạn (Trọn đời)"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Tự động gia hạn</span>
                    <strong className="text-foreground">
                      {selectedSubDetail.auto_renew ? "Bật (Auto-Renew)" : "Tắt"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mã gói cước</span>
                    <strong className="text-foreground font-mono">
                      PLAN-ID #{selectedSubDetail.plan_id}
                    </strong>
                  </div>
                </div>

                {/* Benefits notice */}
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-1.5">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    Quyền Lợi & Hạn Mức Kích Hoạt
                  </div>
                  <ul className="space-y-1 text-[11px] list-disc list-inside text-emerald-900/80 dark:text-emerald-200/80">
                    <li>Hỏi đáp luyện tập phỏng vấn AI không giới hạn theo cấu hình gói.</li>
                    <li>Lưu trữ hồ sơ CV, phân tích từ khóa ATS theo thời gian thực.</li>
                    <li>Xuất báo cáo phân tích chi tiết định dạng PDF và chấm điểm WPM.</li>
                  </ul>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sub = selectedSubDetail;
                      setSelectedSubDetail(null);
                      handleOpenExtendSub(sub);
                    }}
                    className="text-xs flex-1 sm:flex-initial"
                  >
                    <Calendar className="size-3.5 mr-1" />
                    Gia hạn ngày
                  </Button>
                  {selectedSubDetail.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const sub = selectedSubDetail;
                        setSelectedSubDetail(null);
                        handleCancelSub(sub);
                      }}
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      Hủy gói
                    </Button>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedSubDetail(null)}
                  className="text-xs w-full sm:w-auto"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
