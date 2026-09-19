"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Star,
  BookOpen,
  MessageSquare,
  HelpCircle,
  SlidersHorizontal,
  MoreHorizontal,
  FileSpreadsheet,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/admin/ui/table";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Checkbox } from "@/components/admin/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/admin/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/admin/ui/tabs";
import { toast } from "sonner";
import type { AdminQuestionItem } from "@/mock/adminQuestionsMock";
import { MOCK_DOMAINS_LIST, MOCK_ROLES_LIST } from "@/mock/adminQuestionsMock";
import { DEFAULT_RUBRIC_CRITERIA } from "@/services/catalogApi";

export function QuestionDataTable({
  initialQuestions = [],
  onRefresh,
}: {
  initialQuestions: AdminQuestionItem[];
  onRefresh?: () => void;
}) {
  const [questions, setQuestions] = useState<AdminQuestionItem[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedModeration, setSelectedModeration] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [detailItem, setDetailItem] = useState<AdminQuestionItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminQuestionItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states for Create/Edit
  const [formData, setFormData] = useState({
    question_text: "",
    domain_id: 1,
    role_id: 1,
    experience_level: "junior",
    question_type: "behavioral",
    language: "vi",
    difficulty: 3,
    intent: "",
    sample_answer: "",
    situation_guide: "",
    task_guide: "",
    action_guide: "",
    result_guide: "",
    is_active: true,
  });

  // Dynamic roles based on selected domain in form
  const formRoles = useMemo(() => {
    return MOCK_ROLES_LIST.filter((r) => r.domain_id === formData.domain_id);
  }, [formData.domain_id]);

  // Filtered dynamic roles for filter bar
  const filterRoles = useMemo(() => {
    if (selectedDomain === "all") return MOCK_ROLES_LIST;
    return MOCK_ROLES_LIST.filter((r) => String(r.domain_id) === selectedDomain);
  }, [selectedDomain]);

  // Filter logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        const matchesText = q.question_text.toLowerCase().includes(kw);
        const matchesDomain = q.domain_name?.toLowerCase().includes(kw);
        const matchesRole = q.role_name?.toLowerCase().includes(kw);
        const matchesTags = q.tags?.some((t) => t.toLowerCase().includes(kw));
        if (!matchesText && !matchesDomain && !matchesRole && !matchesTags) {
          return false;
        }
      }

      // Domain
      if (selectedDomain !== "all" && String(q.domain_id) !== selectedDomain) {
        return false;
      }

      // Role
      if (selectedRole !== "all" && String(q.role_id) !== selectedRole) {
        return false;
      }

      // Level
      if (selectedLevel !== "all" && q.experience_level !== selectedLevel) {
        return false;
      }

      // Type
      if (selectedType !== "all" && q.question_type !== selectedType) {
        return false;
      }

      // Moderation
      if (selectedModeration !== "all" && q.moderation_status !== selectedModeration) {
        return false;
      }

      // Active status
      if (selectedStatus !== "all") {
        const activeBool = selectedStatus === "active";
        if (q.is_active !== activeBool) return false;
      }

      return true;
    });
  }, [
    questions,
    search,
    selectedDomain,
    selectedRole,
    selectedLevel,
    selectedType,
    selectedModeration,
    selectedStatus,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, page, pageSize]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentItems.map((q) => q.question_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllCurrentSelected =
    currentItems.length > 0 &&
    currentItems.every((q) => selectedIds.includes(q.question_id));

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedDomain("all");
    setSelectedRole("all");
    setSelectedLevel("all");
    setSelectedType("all");
    setSelectedModeration("all");
    setSelectedStatus("all");
    setPage(1);
  };

  // Action: Toggle active
  const handleToggleActive = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.question_id === questionId) {
          const nextState = !q.is_active;
          toast.success(
            `Đã ${nextState ? "kích hoạt" : "tạm dừng"} câu hỏi #${questionId}`
          );
          return { ...q, is_active: nextState };
        }
        return q;
      })
    );
  };

  // Action: Change moderation status
  const handleChangeModeration = (
    questionId: number,
    status: "approved" | "rejected" | "pending"
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.question_id === questionId) {
          toast.success(`Đã chuyển trạng thái câu hỏi #${questionId} thành: ${status}`);
          return { ...q, moderation_status: status };
        }
        return q;
      })
    );
  };

  // Action: Delete
  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    setQuestions((prev) => prev.filter((q) => q.question_id !== deleteConfirmId));
    setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmId));
    toast.success(`Đã xóa câu hỏi #${deleteConfirmId} khỏi hệ thống`);
    setDeleteConfirmId(null);
  };

  // Bulk actions
  const handleBulkApprove = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        selectedIds.includes(q.question_id)
          ? { ...q, moderation_status: "approved" as const }
          : q
      )
    );
    toast.success(`Đã phê duyệt ${selectedIds.length} câu hỏi đã chọn`);
    setSelectedIds([]);
  };

  const handleBulkActivate = (active: boolean) => {
    setQuestions((prev) =>
      prev.map((q) =>
        selectedIds.includes(q.question_id) ? { ...q, is_active: active } : q
      )
    );
    toast.success(
      `Đã ${active ? "kích hoạt" : "tạm dừng"} ${selectedIds.length} câu hỏi đã chọn`
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.question_id)));
    toast.success(`Đã xóa ${selectedIds.length} câu hỏi`);
    setSelectedIds([]);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredQuestions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `interview_questions_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Đã xuất ${filteredQuestions.length} câu hỏi dạng file JSON`);
  };

  // Open Edit Form
  const handleOpenEdit = (q: AdminQuestionItem) => {
    setEditItem(q);
    setFormData({
      question_text: q.question_text,
      domain_id: q.domain_id,
      role_id: q.role_id || 1,
      experience_level: q.experience_level || "junior",
      question_type: q.question_type || "behavioral",
      language: q.language || "vi",
      difficulty: q.difficulty || 3,
      intent: q.intent || "",
      sample_answer: q.sample_answer || "",
      situation_guide: q.star_template?.situation_guide || "",
      task_guide: q.star_template?.task_guide || "",
      action_guide: q.star_template?.action_guide || "",
      result_guide: q.star_template?.result_guide || "",
      is_active: q.is_active,
    });
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setFormData({
      question_text: "",
      domain_id: 1,
      role_id: 1,
      experience_level: "junior",
      question_type: "behavioral",
      language: "vi",
      difficulty: 3,
      intent: "",
      sample_answer: "",
      situation_guide: "",
      task_guide: "",
      action_guide: "",
      result_guide: "",
      is_active: true,
    });
    setIsCreateOpen(true);
  };

  // Save Create or Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    const domainObj = MOCK_DOMAINS_LIST.find((d) => d.domain_id === formData.domain_id);
    const roleObj = MOCK_ROLES_LIST.find((r) => r.role_id === formData.role_id);

    if (editItem) {
      // Update
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.question_id === editItem.question_id) {
            return {
              ...q,
              question_text: formData.question_text,
              domain_id: formData.domain_id,
              domain_name: domainObj?.domain_name || q.domain_name,
              role_id: formData.role_id,
              role_name: roleObj?.role_name || q.role_name,
              experience_level: formData.experience_level,
              question_type: formData.question_type,
              language: formData.language,
              difficulty: formData.difficulty,
              intent: formData.intent,
              sample_answer: formData.sample_answer,
              is_active: formData.is_active,
              star_template: {
                star_template_id: q.star_template?.star_template_id || 999,
                title: `STAR Template cho ${roleObj?.role_name || "câu hỏi"}`,
                situation_guide: formData.situation_guide,
                task_guide: formData.task_guide,
                action_guide: formData.action_guide,
                result_guide: formData.result_guide,
                language: formData.language,
              },
              updated_at: new Date().toISOString(),
            };
          }
          return q;
        })
      );
      toast.success(`Cập nhật câu hỏi #${editItem.question_id} thành công`);
      setEditItem(null);
    } else {
      // Create
      const newId = Math.max(100, ...questions.map((q) => q.question_id)) + 1;
      const newQ: AdminQuestionItem = {
        question_id: newId,
        domain_id: formData.domain_id,
        domain_name: domainObj?.domain_name || "Công nghệ thông tin (IT)",
        role_id: formData.role_id,
        role_name: roleObj?.role_name || "Backend Engineer",
        experience_level: formData.experience_level,
        question_type: formData.question_type,
        language: formData.language,
        question_text: formData.question_text,
        star_template_id: newId,
        is_active: formData.is_active,
        moderation_status: "approved",
        source: "admin_manual",
        difficulty: formData.difficulty,
        intent: formData.intent,
        practice_count: 0,
        avg_score: 80.0,
        tags: ["Mới tạo", roleObj?.role_name || "Chuyên ngành"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        star_template: {
          star_template_id: newId,
          title: `STAR Guide cho #${newId}`,
          situation_guide: formData.situation_guide,
          task_guide: formData.task_guide,
          action_guide: formData.action_guide,
          result_guide: formData.result_guide,
          language: formData.language,
        },
        sample_answer: formData.sample_answer,
        rubric_criteria: DEFAULT_RUBRIC_CRITERIA,
        follow_up_questions: [
          "Bạn có thể giải thích cụ thể hơn về bài học kinh nghiệm rút ra?",
          "Nếu có cơ hội làm lại tình huống này, bạn sẽ thay đổi điều gì?",
        ],
        tips: [
          "Giữ nhịp điệu trả lời tự tin, tốc độ 120-150 WPM.",
          "Nêu số liệu định lượng cụ thể để tăng độ thuyết phục.",
        ],
      };

      setQuestions((prev) => [newQ, ...prev]);
      toast.success(`Tạo câu hỏi mới #${newId} thành công`);
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Search & Multi-Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo nội dung câu hỏi, vị trí, ngành nghề hoặc từ khóa tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 text-sm h-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              <span>Đặt lại</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="h-9 gap-1.5 text-xs"
              title="Xuất toàn bộ câu hỏi đã lọc ra file JSON"
            >
              <Download className="size-3.5" />
              <span>Xuất JSON</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-9 gap-1.5 text-xs shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Tạo Câu Hỏi Mới</span>
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t text-xs">
          {/* Domain Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Ngành nghề</Label>
            <Select
              value={selectedDomain}
              onValueChange={(v) => {
                setSelectedDomain(v);
                setSelectedRole("all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tất cả ngành" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {MOCK_DOMAINS_LIST.map((d) => (
                  <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                    {d.domain_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Vị trí chuyên môn</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => {
                setSelectedRole(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tất cả vị trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vị trí</SelectItem>
                {filterRoles.map((r) => (
                  <SelectItem key={r.role_id} value={String(r.role_id)}>
                    {r.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Cấp độ</Label>
            <Select
              value={selectedLevel}
              onValueChange={(v) => {
                setSelectedLevel(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tất cả cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
                <SelectItem value="fresher">Fresher</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Middle</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead / Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Dạng câu hỏi</Label>
            <Select
              value={selectedType}
              onValueChange={(v) => {
                setSelectedType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tất cả dạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dạng</SelectItem>
                <SelectItem value="behavioral">Hành vi (Behavioral)</SelectItem>
                <SelectItem value="technical">Chuyên môn (Technical)</SelectItem>
                <SelectItem value="situational">Tình huống (Situational)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Moderation Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Kiểm duyệt</Label>
            <Select
              value={selectedModeration}
              onValueChange={(v) => {
                setSelectedModeration(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tất cả kiểm duyệt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kiểm duyệt</SelectItem>
                <SelectItem value="approved">Đã phê duyệt</SelectItem>
                <SelectItem value="pending">Chờ kiểm duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Trạng thái</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => {
                setSelectedStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              Đã chọn {selectedIds.length} câu hỏi
            </span>
            <span className="text-muted-foreground">· Thao tác hàng loạt:</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkApprove}
              className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
            >
              <CheckCircle2 className="size-3 mr-1" />
              Phê duyệt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkActivate(true)}
              className="h-7 text-xs"
            >
              Kích hoạt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkActivate(false)}
              className="h-7 text-xs"
            >
              Tạm dừng
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3 mr-1" />
              Xóa đã chọn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-7 text-xs"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* Main Questions Table */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
              <TableRow>
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={isAllCurrentSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Chọn tất cả"
                  />
                </TableHead>
                <TableHead className="w-14 font-bold">Mã ID</TableHead>
                <TableHead className="min-w-[340px] font-bold">Nội Dung Câu Hỏi & Thẻ Phân Loại</TableHead>
                <TableHead className="min-w-[180px] font-bold">Ngành & Vị Trí</TableHead>
                <TableHead className="w-28 font-bold">Cấp Độ & Dạng</TableHead>
                <TableHead className="w-24 text-center font-bold">Độ Khó</TableHead>
                <TableHead className="w-28 text-center font-bold">Kiểm Duyệt</TableHead>
                <TableHead className="w-24 text-center font-bold">Trạng Thái</TableHead>
                <TableHead className="w-14 text-right font-bold">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <HelpCircle className="size-8 stroke-[1.5]" />
                      <p className="font-semibold text-foreground">Không tìm thấy câu hỏi nào</p>
                      <p className="text-xs">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bấm &quot;Đặt lại&quot; bộ lọc.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="mt-2 text-xs"
                      >
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((q) => {
                  const isChecked = selectedIds.includes(q.question_id);

                  // Difficulty stars
                  const diff = q.difficulty || 3;

                  // Moderation badge
                  let modBadge = (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px]">
                      <Clock className="size-2.5 mr-1" /> Chờ duyệt
                    </Badge>
                  );
                  if (q.moderation_status === "approved") {
                    modBadge = (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                        <CheckCircle2 className="size-2.5 mr-1" /> Đã duyệt
                      </Badge>
                    );
                  } else if (q.moderation_status === "rejected") {
                    modBadge = (
                      <Badge variant="outline" className="text-rose-600 border-rose-500/30 bg-rose-500/10 text-[10px]">
                        <XCircle className="size-2.5 mr-1" /> Bị từ chối
                      </Badge>
                    );
                  }

                  // Question type label
                  const typeLabel =
                    q.question_type === "behavioral"
                      ? "Hành vi"
                      : q.question_type === "technical"
                      ? "Kỹ thuật"
                      : "Tình huống";

                  // Level badge color
                  const levelColors: Record<string, string> = {
                    intern: "bg-blue-500/10 text-blue-600 border-blue-500/30",
                    fresher: "bg-teal-500/10 text-teal-600 border-teal-500/30",
                    junior: "bg-sky-500/10 text-sky-600 border-sky-500/30",
                    mid: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
                    senior: "bg-purple-500/10 text-purple-600 border-purple-500/30",
                    lead: "bg-rose-500/10 text-rose-600 border-rose-500/30",
                  };

                  return (
                    <TableRow
                      key={q.question_id}
                      data-state={isChecked ? "selected" : undefined}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleSelectOne(q.question_id, !!checked)
                          }
                          aria-label={`Chọn #${q.question_id}`}
                        />
                      </TableCell>

                      {/* ID */}
                      <TableCell className="font-mono text-muted-foreground font-semibold">
                        #{q.question_id}
                      </TableCell>

                      {/* Question Text & Tags */}
                      <TableCell>
                        <div className="space-y-1.5 py-1">
                          <p
                            className="font-medium text-foreground leading-relaxed line-clamp-2 hover:text-primary cursor-pointer"
                            onClick={() => setDetailItem(q)}
                            title="Bấm để xem chi tiết đầy đủ câu hỏi"
                          >
                            {q.question_text}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {q.language === "en" && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                English
                              </Badge>
                            )}

                            {q.tags?.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}

                            <span className="text-[10px] text-muted-foreground ml-auto hidden sm:inline">
                              {q.practice_count ? `${q.practice_count} lượt luyện` : "Mới thêm"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Domain & Role */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground truncate">
                            {q.role_name || "Vị trí chung"}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {q.domain_name}
                          </div>
                        </div>
                      </TableCell>

                      {/* Level & Type */}
                      <TableCell>
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${
                              levelColors[q.experience_level || "junior"] ||
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {q.experience_level || "Junior"}
                          </span>
                          <div className="text-[11px] text-muted-foreground">
                            {typeLabel}
                          </div>
                        </div>
                      </TableCell>

                      {/* Difficulty */}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-0.5" title={`Độ khó: ${diff}/5`}>
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`size-3 ${
                                starIdx <= diff
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>

                      {/* Moderation */}
                      <TableCell className="text-center">{modBadge}</TableCell>

                      {/* Active Status */}
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(q.question_id)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                            q.is_active
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                          title="Bấm để bật / tắt trạng thái câu hỏi"
                        >
                          {q.is_active ? "Kích hoạt" : "Tạm dừng"}
                        </button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Mở menu thao tác</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem onClick={() => setDetailItem(q)}>
                              <Eye className="size-3.5 mr-2" />
                              <span>Xem chi tiết câu hỏi</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleOpenEdit(q)}>
                              <Edit2 className="size-3.5 mr-2" />
                              <span>Chỉnh sửa nội dung</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {q.moderation_status !== "approved" && (
                              <DropdownMenuItem
                                onClick={() => handleChangeModeration(q.question_id, "approved")}
                                className="text-emerald-600 focus:text-emerald-600"
                              >
                                <CheckCircle2 className="size-3.5 mr-2" />
                                <span>Phê duyệt câu hỏi</span>
                              </DropdownMenuItem>
                            )}

                            {q.moderation_status !== "rejected" && (
                              <DropdownMenuItem
                                onClick={() => handleChangeModeration(q.question_id, "rejected")}
                                className="text-rose-600 focus:text-rose-600"
                              >
                                <XCircle className="size-3.5 mr-2" />
                                <span>Từ chối duyệt</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => handleToggleActive(q.question_id)}>
                              <Check className="size-3.5 mr-2" />
                              <span>{q.is_active ? "Tạm dừng kích hoạt" : "Kích hoạt hiển thị"}</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(q.question_id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              <span>Xóa câu hỏi</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>
              trong tổng số <strong className="text-foreground">{filteredQuestions.length}</strong> câu hỏi
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="mr-2">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Question Detail Sheet (Drawer) */}
      <Sheet open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 text-xs">
          {detailItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{detailItem.question_id}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {detailItem.experience_level || "Junior"}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {detailItem.question_type}
                  </Badge>
                  {detailItem.is_active ? (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                      Hoạt động
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Tạm dừng
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-base font-bold text-foreground leading-snug">
                  {detailItem.question_text}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {detailItem.domain_name} · {detailItem.role_name}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <div className="px-6 pt-3 border-b bg-muted/10">
                  <TabsList className="grid grid-cols-4 h-9">
                    <TabsTrigger value="overview" className="text-xs">Tổng quan</TabsTrigger>
                    <TabsTrigger value="star" className="text-xs">Chuẩn STAR</TabsTrigger>
                    <TabsTrigger value="sample" className="text-xs">Đáp án mẫu</TabsTrigger>
                    <TabsTrigger value="rubric" className="text-xs">Rubric AI</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  {/* Tab 1: Overview */}
                  <TabsContent value="overview" className="space-y-4 m-0">
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Ngành nghề:</span>
                        <span className="font-semibold text-foreground">{detailItem.domain_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Vị trí chức danh:</span>
                        <span className="font-semibold text-foreground">{detailItem.role_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Độ khó đánh giá:</span>
                        <span className="font-semibold text-foreground">{detailItem.difficulty || 3} / 5 sao</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Số lượt luyện tập:</span>
                        <span className="font-semibold text-foreground">{detailItem.practice_count || 0} lượt</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Điểm số trung bình:</span>
                        <span className="font-semibold text-foreground">{detailItem.avg_score || 80}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Nguồn tạo:</span>
                        <span className="font-semibold text-foreground capitalize">{detailItem.source || "admin_manual"}</span>
                      </div>
                    </div>

                    {detailItem.intent && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                        <span className="font-bold text-primary flex items-center gap-1.5">
                          <Sparkles className="size-3.5" />
                          Mục Tiêu Đánh Giá (Intent)
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {detailItem.intent}
                        </p>
                      </div>
                    )}

                    {detailItem.tips && detailItem.tips.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <BookOpen className="size-3.5 text-amber-500" />
                          Mẹo Phỏng Vấn Dành Cho Ứng Viên
                        </span>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {detailItem.tips.map((tip, idx) => (
                            <li key={idx} className="leading-relaxed">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {detailItem.follow_up_questions && detailItem.follow_up_questions.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <MessageSquare className="size-3.5 text-blue-500" />
                          Câu Hỏi Đào Sâu (Follow-up Questions)
                        </span>
                        <ul className="list-decimal pl-5 space-y-1 text-muted-foreground">
                          {detailItem.follow_up_questions.map((fq, idx) => (
                            <li key={idx} className="leading-relaxed">{fq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab 2: STAR Structure */}
                  <TabsContent value="star" className="space-y-3 m-0">
                    {detailItem.star_template ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                            S - Situation (Bối cảnh tình huống)
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {detailItem.star_template.situation_guide || "Chưa có hướng dẫn."}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                            T - Task (Nhiệm vụ & Thách thức)
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {detailItem.star_template.task_guide || "Chưa có hướng dẫn."}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border bg-amber-500/5 border-amber-500/20">
                          <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">
                            A - Action (Hành động cụ thể)
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {detailItem.star_template.action_guide || "Chưa có hướng dẫn."}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border bg-purple-500/5 border-purple-500/20">
                          <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                            R - Result (Kết quả & Bài học)
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {detailItem.star_template.result_guide || "Chưa có hướng dẫn."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground border rounded-xl">
                        Câu hỏi này chưa gắn mẫu hướng dẫn STAR.
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab 3: Sample Answer */}
                  <TabsContent value="sample" className="space-y-3 m-0">
                    <div className="p-4 rounded-xl border bg-card text-foreground leading-relaxed space-y-2">
                      <span className="font-bold text-sm block">Câu Trả Lời Xuất Sắc Điển Hình:</span>
                      <p className="whitespace-pre-line text-xs text-muted-foreground leading-relaxed">
                        {detailItem.sample_answer || "Chưa cập nhật câu trả lời mẫu cho câu hỏi này."}
                      </p>
                    </div>
                  </TabsContent>

                  {/* Tab 4: Rubric */}
                  <TabsContent value="rubric" className="space-y-3 m-0">
                    <div className="space-y-3">
                      {(detailItem.rubric_criteria || DEFAULT_RUBRIC_CRITERIA).map((rc) => (
                        <div key={rc.criterion_id} className="p-3 rounded-xl border bg-card space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{rc.title}</span>
                            <Badge variant="outline" className="text-[10px]">Trọng số {rc.weight}%</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{rc.description}</p>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[10.5px]">
                            <div className="p-2 rounded bg-muted/40">
                              <span className="font-semibold text-emerald-600 block">Xuất sắc (9-10đ)</span>
                              <span className="text-muted-foreground">{rc.descriptors.excellent.description}</span>
                            </div>
                            <div className="p-2 rounded bg-muted/40">
                              <span className="font-semibold text-blue-600 block">Đạt chuẩn (4-6đ)</span>
                              <span className="text-muted-foreground">{rc.descriptors.average.description}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create / Edit Question Dialog */}
      <Dialog
        open={isCreateOpen || !!editItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto text-xs">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editItem ? `Chỉnh Sửa Câu Hỏi #${editItem.question_id}` : "Thêm Câu Hỏi Phỏng Vấn Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Điền đầy đủ thông tin phân loại, nội dung câu hỏi và hướng dẫn cấu trúc STAR.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveForm} className="space-y-4 pt-2">
            {/* Question Text */}
            <div className="space-y-1.5">
              <Label htmlFor="q_text">Nội dung câu hỏi phỏng vấn *</Label>
              <textarea
                id="q_text"
                rows={3}
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Nhập nội dung câu hỏi rõ ràng, trọng tâm..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            {/* Domain & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ngành nghề tuyển dụng *</Label>
                <Select
                  value={String(formData.domain_id)}
                  onValueChange={(v) => {
                    const dId = Number(v);
                    const firstRole = MOCK_ROLES_LIST.find((r) => r.domain_id === dId);
                    setFormData({
                      ...formData,
                      domain_id: dId,
                      role_id: firstRole ? firstRole.role_id : 1,
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DOMAINS_LIST.map((d) => (
                      <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                        {d.domain_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Vị trí chuyên môn *</Label>
                <Select
                  value={String(formData.role_id)}
                  onValueChange={(v) => setFormData({ ...formData, role_id: Number(v) })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formRoles.map((r) => (
                      <SelectItem key={r.role_id} value={String(r.role_id)}>
                        {r.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Level, Type, Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Cấp độ kinh nghiệm</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(v) => setFormData({ ...formData, experience_level: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="fresher">Fresher</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Middle</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead / Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Dạng câu hỏi</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(v) => setFormData({ ...formData, question_type: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">Hành vi (Behavioral)</SelectItem>
                    <SelectItem value="technical">Kỹ thuật (Technical)</SelectItem>
                    <SelectItem value="situational">Tình huống (Situational)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Độ khó (1 - 5 sao)</Label>
                <Select
                  value={String(formData.difficulty)}
                  onValueChange={(v) => setFormData({ ...formData, difficulty: Number(v) })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">★ 1 - Dễ</SelectItem>
                    <SelectItem value="2">★★ 2 - Cơ bản</SelectItem>
                    <SelectItem value="3">★★★ 3 - Trung bình</SelectItem>
                    <SelectItem value="4">★★★★ 4 - Khó</SelectItem>
                    <SelectItem value="5">★★★★★ 5 - Rất khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Intent */}
            <div className="space-y-1.5">
              <Label htmlFor="intent">Mục tiêu đánh giá của câu hỏi (Intent)</Label>
              <Input
                id="intent"
                value={formData.intent}
                onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                placeholder="Ví dụ: Đo lường kỹ năng xử lý sự cố dưới áp lực cao..."
                className="h-8 text-xs"
              />
            </div>

            {/* Sample Answer */}
            <div className="space-y-1.5">
              <Label htmlFor="sample_answer">Câu trả lời mẫu xuất sắc (Sample Answer)</Label>
              <textarea
                id="sample_answer"
                rows={3}
                value={formData.sample_answer}
                onChange={(e) => setFormData({ ...formData, sample_answer: e.target.value })}
                placeholder="Mẫu câu trả lời có cấu trúc rõ ràng, số liệu định lượng..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* STAR Template section */}
            <div className="space-y-3 pt-2 border-t">
              <span className="font-bold text-foreground block">Hướng dẫn phương pháp STAR:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-emerald-600">S - Situation (Bối cảnh)</Label>
                  <Input
                    value={formData.situation_guide}
                    onChange={(e) => setFormData({ ...formData, situation_guide: e.target.value })}
                    placeholder="Mô tả bối cảnh phát sinh vấn đề..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-blue-600">T - Task (Nhiệm vụ)</Label>
                  <Input
                    value={formData.task_guide}
                    onChange={(e) => setFormData({ ...formData, task_guide: e.target.value })}
                    placeholder="Mục tiêu cần giải quyết..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-amber-600">A - Action (Hành động)</Label>
                  <Input
                    value={formData.action_guide}
                    onChange={(e) => setFormData({ ...formData, action_guide: e.target.value })}
                    placeholder="Các bước kỹ thuật đã triển khai..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-purple-600">R - Result (Kết quả)</Label>
                  <Input
                    value={formData.result_guide}
                    onChange={(e) => setFormData({ ...formData, result_guide: e.target.value })}
                    placeholder="Kết quả định lượng và bài học..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditItem(null);
                }}
                className="h-8 text-xs"
              >
                Hủy
              </Button>
              <Button type="submit" className="h-8 text-xs">
                {editItem ? "Lưu Thay Đổi" : "Tạo Mới Câu Hỏi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Xác Nhận Xóa Câu Hỏi #{deleteConfirmId}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Hành động này sẽ xóa câu hỏi khỏi ngân hàng đề thi. Các phiên phỏng vấn lịch sử đã hoàn thành vẫn được bảo lưu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="h-8 text-xs"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="h-8 text-xs"
            >
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

