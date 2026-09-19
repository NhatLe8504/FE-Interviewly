"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Star,
  BookOpen,
  HelpCircle,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Code2,
  FolderKanban,
  Play,
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
import { toast } from "sonner";
import type { QuestionSetItem } from "@/types/catalog";
import { MOCK_DOMAINS_LIST } from "@/mock/adminQuestionsMock";

export function QuestionSetDataTable({
  initialSets = [],
}: {
  initialSets: QuestionSetItem[];
}) {
  const [sets, setSets] = useState<QuestionSetItem[]>(initialSets);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [previewSet, setPreviewSet] = useState<QuestionSetItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filter logic
  const filteredSets = useMemo(() => {
    return sets.filter((s) => {
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(kw);
        const matchesDomain = s.domain_name.toLowerCase().includes(kw);
        const matchesRole = s.role_name.toLowerCase().includes(kw);
        const matchesTech = s.tech_stack.some((t) => t.toLowerCase().includes(kw));
        if (!matchesTitle && !matchesDomain && !matchesRole && !matchesTech) {
          return false;
        }
      }

      if (selectedDomain !== "all" && String(s.domain_id) !== selectedDomain) {
        return false;
      }

      if (selectedLevel !== "all" && s.experience_level !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [sets, search, selectedDomain, selectedLevel]);

  const totalPages = Math.max(1, Math.ceil(filteredSets.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSets.slice(start, start + pageSize);
  }, [filteredSets, page, pageSize]);

  const handleReset = () => {
    setSearch("");
    setSelectedDomain("all");
    setSelectedLevel("all");
    setPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    setSets((prev) => prev.filter((s) => s.set_id !== deleteConfirmId));
    toast.success(`Đã xóa bộ đề #${deleteConfirmId} khỏi hệ thống.`);
    setDeleteConfirmId(null);
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredSets, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `question_sets_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Đã xuất ${filteredSets.length} bộ đề ra file JSON`);
  };

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên bộ đề, vị trí, công nghệ (Java, React, K8s...)..."
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

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
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
            >
              <Download className="size-3.5" />
              <span>Xuất JSON</span>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-9 gap-1.5 text-xs shadow-xs"
            >
              <Link href="/admin/questions/new">
                <Plus className="size-3.5" />
                <span>Tạo Bộ Câu Hỏi Mới</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Ngành nghề</Label>
            <Select
              value={selectedDomain}
              onValueChange={(v) => {
                setSelectedDomain(v);
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
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Question Sets Table */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
              <TableRow>
                <TableHead className="w-14 font-bold">Mã ID</TableHead>
                <TableHead className="min-w-[320px] font-bold">Tên Bộ Đề & Mô Tả</TableHead>
                <TableHead className="min-w-[180px] font-bold">Vị Trí & Công Nghệ</TableHead>
                <TableHead className="w-28 text-center font-bold">Quy Mô Đề</TableHead>
                <TableHead className="w-24 text-center font-bold">Độ Khó</TableHead>
                <TableHead className="w-28 text-center font-bold">Lượt Thi</TableHead>
                <TableHead className="w-28 text-center font-bold">Trạng Thái</TableHead>
                <TableHead className="w-16 text-right font-bold">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FolderKanban className="size-8 stroke-[1.5]" />
                      <p className="font-semibold text-foreground">Không tìm thấy bộ đề nào</p>
                      <Button variant="outline" size="sm" onClick={handleReset} className="mt-2 text-xs">
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((s) => {
                  return (
                    <TableRow key={s.set_id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-muted-foreground font-semibold">
                        #{s.set_id}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-2">
                            <p
                              className="font-bold text-foreground hover:text-primary cursor-pointer leading-snug line-clamp-1"
                              onClick={() => setPreviewSet(s)}
                              title="Bấm để xem danh sách câu hỏi trong bộ đề"
                            >
                              {s.title}
                            </p>
                            {s.is_curated && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-500/30 bg-amber-500/10 shrink-0">
                                Tuyển chọn
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {s.description}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground truncate">
                            {s.role_name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {s.tech_stack.slice(0, 3).map((tech, idx) => (
                              <span key={idx} className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">
                            {s.question_count} câu hỏi
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            ~{s.estimated_duration_minutes} phút
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-0.5" title={`Độ khó: ${s.target_difficulty}/5`}>
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`size-3 ${
                                starIdx <= s.target_difficulty
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground block">
                            {s.practice_count.toLocaleString("vi-VN")} lượt
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            Đạt {s.pass_rate}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            s.is_active
                              ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                              : "text-muted-foreground"
                          }`}
                        >
                          {s.is_active ? "Đang mở" : "Tạm dừng"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem onClick={() => setPreviewSet(s)}>
                              <Eye className="size-3.5 mr-2" />
                              <span>Xem danh sách câu</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(s.set_id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              <span>Xóa bộ đề</span>
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

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t text-xs text-muted-foreground">
          <div>
            Hiển thị <strong className="text-foreground">{filteredSets.length}</strong> bộ đề phỏng vấn
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2">Trang {page} / {totalPages}</span>
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

      {/* Preview Question Set Drawer */}
      <Sheet open={!!previewSet} onOpenChange={(open) => !open && setPreviewSet(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 text-xs">
          {previewSet && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">#{previewSet.set_id}</Badge>
                  <Badge variant="outline" className="capitalize">{previewSet.experience_level}</Badge>
                  <Badge variant="secondary">{previewSet.questions.length} câu hỏi</Badge>
                </div>
                <SheetTitle className="text-base font-bold leading-snug">
                  {previewSet.title}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {previewSet.domain_name} · {previewSet.role_name} · Thời lượng: {previewSet.estimated_duration_minutes} phút
                </SheetDescription>
              </SheetHeader>

              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">Công nghệ trọng tâm:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewSet.tech_stack.map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-mono">{t}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <span className="font-bold text-foreground block">
                    Danh sách các câu hỏi trong bộ đề ({previewSet.questions.length} câu):
                  </span>
                  {previewSet.questions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">Câu #{idx + 1}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">{q.question_type}</Badge>
                      </div>
                      <p className="font-semibold text-foreground text-xs leading-relaxed">
                        {q.question_text}
                      </p>
                      {q.intent && (
                        <p className="text-[11px] text-muted-foreground">
                          <strong>Mục tiêu:</strong> {q.intent}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Xác Nhận Xóa Bộ Đề #{deleteConfirmId}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Bạn có chắc chắn muốn xóa bộ đề này? Các phiên thi lịch sử đã hoàn thành vẫn được bảo lưu an toàn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="h-8 text-xs">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="h-8 text-xs">
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
