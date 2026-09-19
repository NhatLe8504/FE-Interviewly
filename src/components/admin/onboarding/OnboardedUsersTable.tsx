"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Download,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Eye,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  Video,
  Youtube,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { ChannelBrandIcon } from "./BrandLogos";
import type { OnboardedUserRecord } from "./types";

interface OnboardedUsersTableProps {
  users: OnboardedUserRecord[];
}

export function OnboardedUsersTable({ users }: OnboardedUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [selectedUser, setSelectedUser] = useState<OnboardedUserRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Extract unique domains
  const uniqueDomains = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.domain_name) set.add(u.domain_name);
    });
    return Array.from(set).sort();
  }, [users]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.full_name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesRole = u.role_name.toLowerCase().includes(q);
        const matchesDomain = u.domain_name.toLowerCase().includes(q);
        const matchesChannel = u.acquisition_channel.toLowerCase().includes(q);

        if (!matchesName && !matchesEmail && !matchesRole && !matchesDomain && !matchesChannel) {
          return false;
        }
      }

      if (selectedDomain !== "all" && u.domain_name !== selectedDomain) {
        return false;
      }

      if (selectedChannel !== "all" && u.acquisition_channel !== selectedChannel) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, selectedDomain, selectedChannel]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDomain("all");
    setSelectedChannel("all");
    setPage(1);
    toast.info("Đã đặt lại bộ lọc danh sách ứng viên.");
  };

  const hasActiveFilters =
    searchTerm !== "" || selectedDomain !== "all" || selectedChannel !== "all";

  // Channel badge
  const renderChannelBadge = (ch: string) => {
    const channelKey = ch.toLowerCase();
    const label =
      channelKey === "facebook"
        ? "Facebook"
        : channelKey === "tiktok"
        ? "TikTok"
        : channelKey === "youtube"
        ? "YouTube"
        : channelKey === "ai_recommendation"
        ? "Gợi ý AI"
        : channelKey === "google_search"
        ? "Google"
        : channelKey === "referral"
        ? "Bạn bè"
        : "Khác";

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-card shadow-2xs">
        <ChannelBrandIcon channelKey={channelKey} className="size-3.5 shrink-0" />
        <span className="font-semibold text-foreground">{label}</span>
      </span>
    );
  };

  const handleExportCsv = () => {
    try {
      const headers = [
        "User ID",
        "Họ và tên",
        "Email",
        "Ngành nghề",
        "Vị trí ứng tuyển",
        "Cấp bậc",
        "Nguồn tiếp cận",
        "Mục tiêu",
        "Thời gian (s)",
        "Ngày hoàn thành",
      ];

      const rows = filteredUsers.map((u) => [
        `USER-${u.user_id}`,
        `"${u.full_name.replace(/"/g, '""')}"`,
        `"${u.email}"`,
        `"${u.domain_name}"`,
        `"${u.role_name}"`,
        `"${u.experience_level}"`,
        `"${u.acquisition_channel}"`,
        `"${u.target_goal.replace(/"/g, '""')}"`,
        `"${u.time_spent_seconds}"`,
        `"${new Date(u.completed_at).toISOString()}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `interviewly_onboarding_responses_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Đã xuất ${filteredUsers.length} hồ sơ Onboarding sang file CSV!`);
    } catch {
      toast.error("Không thể xuất file CSV. Vui lòng thử lại.");
    }
  };

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Search & Filters */}
      <Card className="shadow-xs border bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Tìm theo tên ứng viên, email, vị trí, nguồn tiếp cận..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-9 gap-1.5 text-xs"
                disabled={filteredUsers.length === 0}
                title="Tải danh sách ứng viên đã onboard ra file CSV"
              >
                <Download className="size-3.5" />
                <span>Xuất CSV</span>
              </Button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 font-medium">
              <SlidersHorizontal className="size-3.5" />
              <span>Lọc hồ sơ:</span>
            </div>

            {/* Filter by Domain */}
            <div className="w-[180px]">
              <Select
                value={selectedDomain}
                onValueChange={(val) => {
                  setSelectedDomain(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Ngành nghề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành nghề</SelectItem>
                  {uniqueDomains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Marketing Channel */}
            <div className="w-[180px]">
              <Select
                value={selectedChannel}
                onValueChange={(val) => {
                  setSelectedChannel(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Nguồn tiếp cận" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nguồn tiếp cận</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="ai_recommendation">Gợi ý từ AI</SelectItem>
                  <SelectItem value="google_search">Google Search</SelectItem>
                  <SelectItem value="referral">Bạn bè giới thiệu</SelectItem>
                  <SelectItem value="other">Kênh khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
              >
                <X className="size-3.5" />
                <span>Xóa lọc</span>
              </Button>
            )}

            <div className="ml-auto text-muted-foreground font-mono text-[11px]">
              Hiển thị <strong className="text-foreground">{filteredUsers.length}</strong> ứng viên
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="shadow-xs border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[190px] text-xs font-bold">Ứng viên</TableHead>
                <TableHead className="w-[160px] text-xs font-bold">Ngành nghề</TableHead>
                <TableHead className="min-w-[180px] text-xs font-bold">Vị trí công việc</TableHead>
                <TableHead className="w-[140px] text-xs font-bold">Cấp bậc</TableHead>
                <TableHead className="w-[140px] text-xs font-bold">Nguồn tiếp cận</TableHead>
                <TableHead className="w-[80px] text-xs font-bold">Micro</TableHead>
                <TableHead className="w-[110px] text-xs font-bold">Ngày hoàn tất</TableHead>
                <TableHead className="w-[60px] text-right text-xs font-bold">Xem</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Users className="size-5" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        Không tìm thấy ứng viên nào
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Không có hồ sơ nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-2 text-xs"
                        >
                          Xóa bộ lọc để xem tất cả
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((u) => (
                  <TableRow
                    key={u.user_id}
                    onClick={() => {
                      setSelectedUser(u);
                      setIsDetailOpen(true);
                    }}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7 border">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {u.full_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-foreground block truncate max-w-[125px]">
                            {u.full_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px] block">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Domain */}
                    <TableCell className="text-xs font-medium text-foreground">
                      {u.domain_name}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="text-xs font-semibold text-foreground">
                      {u.role_name}
                    </TableCell>

                    {/* Level */}
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-medium">
                        {u.experience_level.split("(")[0].trim()}
                      </Badge>
                    </TableCell>

                    {/* Acquisition Channel */}
                    <TableCell>
                      {renderChannelBadge(u.acquisition_channel)}
                    </TableCell>

                    {/* Mic Check */}
                    <TableCell>
                      {u.mic_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <Mic className="size-3.5" />
                          <span>OK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <MicOff className="size-3.5" />
                          <span>Bỏ qua</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Completed Date */}
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(u.completed_at).toLocaleDateString("vi-VN")}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => {
                                setSelectedUser(u);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              <span className="sr-only">Xem chi tiết</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Xem chi tiết khảo sát</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t bg-muted/20 text-xs">
            <div className="text-muted-foreground">
              Hiển thị{" "}
              <strong className="text-foreground">
                {Math.min(filteredUsers.length, (page - 1) * pageSize + 1)}
              </strong>{" "}
              -{" "}
              <strong className="text-foreground">
                {Math.min(filteredUsers.length, page * pageSize)}
              </strong>{" "}
              trong tổng số <strong className="text-foreground">{filteredUsers.length}</strong> ứng viên
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>Trang trước</span>
              </Button>

              <div className="px-2 font-mono text-xs text-muted-foreground">
                Trang <strong className="text-foreground">{page}</strong> / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 gap-1 text-xs"
              >
                <span>Trang sau</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* User Survey Response Detail Dialog */}
      {selectedUser && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <Badge variant="outline" className="text-xs">
                  #USER-{selectedUser.user_id}
                </Badge>
                <Badge className="bg-emerald-500 text-white text-[10px] gap-1">
                  <CheckCircle2 className="size-3" />
                  Đã hoàn thành
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-foreground mt-2">
                Hồ Sơ Khảo Sát Onboarding: {selectedUser.full_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                {selectedUser.email} &bull; Hoàn tất lúc {new Date(selectedUser.completed_at).toLocaleString("vi-VN")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngành nghề mục tiêu:</span>
                  <span className="font-bold text-foreground">{selectedUser.domain_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vị trí / Chức danh:</span>
                  <span className="font-bold text-foreground">{selectedUser.role_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trình độ &amp; Kinh nghiệm:</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {selectedUser.experience_level}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-muted">
                  <span className="text-muted-foreground">Nguồn tiếp cận:</span>
                  {renderChannelBadge(selectedUser.acquisition_channel)}
                </div>
              </div>

              <div className="bg-card p-3 rounded-xl border space-y-1.5">
                <span className="text-muted-foreground block text-[11px]">Mục tiêu phỏng vấn cốt lõi:</span>
                <p className="font-medium text-foreground leading-relaxed italic">
                  &ldquo;{selectedUser.target_goal}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border bg-card">
                  <span className="text-muted-foreground block text-[11px]">Ngôn ngữ ưu tiên:</span>
                  <span className="font-bold text-foreground capitalize">
                    {selectedUser.language === "en" ? "Tiếng Anh (en-US)" : "Tiếng Việt (vi-VN)"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border bg-card">
                  <span className="text-muted-foreground block text-[11px]">Kiểm tra micro:</span>
                  <span className={`font-bold ${selectedUser.mic_verified ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {selectedUser.mic_verified ? "Đã xác thực mic OK" : "Bỏ qua bước mic"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setIsDetailOpen(false)} className="text-xs">
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}