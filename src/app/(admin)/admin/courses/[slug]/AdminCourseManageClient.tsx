"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Compass,
  Layers,
  Sparkles,
  Award,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  FileText,
  HelpCircle,
  Mic,
  ExternalLink,
  Save,
  X,
  Search,
  Filter,
  Video,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { toast } from "sonner";
import {
  courseAdminApi,
  type ChapterCreateIn,
} from "@/services/admin/courseAdminApi";
import type { CourseItem } from "@/types/course";
import type { CourseCurriculumSection, ResolvedLesson } from "@/data/lessonResolver";

interface AdminCourseManageClientProps {
  slug: string;
}

export default function AdminCourseManageClient({ slug }: AdminCourseManageClientProps) {
  const router = useRouter();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [sections, setSections] = useState<CourseCurriculumSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchKw, setSearchKw] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Inline Add Chapter (NO POPUP)
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterTitleEn, setNewChapterTitleEn] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");

  // Inline Edit Chapter (NO POPUP)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterDesc, setEditChapterDesc] = useState("");

  // Open Chapters state
  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        courseAdminApi.getCourse(slug),
        courseAdminApi.getCurriculum(slug),
      ]);
      setCourse(c);
      setSections(s);
      setOpenChapterIds(new Set(s.map((sec) => sec.id)));
    } catch (err: any) {
      toast.error("Lỗi nạp khóa học: " + (err?.message || "Không thể tải dữ liệu"));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const handleExpandAll = () => {
    setOpenChapterIds(new Set(sections.map((s) => s.id)));
  };

  const handleCollapseAll = () => {
    setOpenChapterIds(new Set());
  };

  // Reorder Lesson within Chapter (Thay doi thu tu bai hoc)
  const handleMoveLesson = async (chapterId: string, lessonId: string, direction: "up" | "down") => {
    try {
      const updated = await courseAdminApi.moveLesson(slug, chapterId, lessonId, direction);
      setSections([...updated]);
      toast.success("Đã thay đổi thứ tự bài học thành công!");
    } catch (err: any) {
      toast.error("Lỗi đổi thứ tự: " + err.message);
    }
  };

  // Reorder Chapter Up/Down
  const handleMoveChapter = async (chapterId: string, direction: "up" | "down") => {
    try {
      const updated = await courseAdminApi.moveChapter(slug, chapterId, direction);
      setSections([...updated]);
      toast.success("Đã thay đổi thứ tự chương học!");
    } catch (err: any) {
      toast.error("Lỗi đổi thứ tự chương: " + err.message);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (chapterId: string, lessonId: string, lessonTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await courseAdminApi.deleteLesson(slug, chapterId, lessonId);
      const updated = await courseAdminApi.getCurriculum(slug);
      setSections(updated);
      toast.success(`Đã xóa bài học "${lessonTitle}" thành công!`);
    } catch (err: any) {
      toast.error("Lỗi xóa bài học: " + err.message);
    }
  };

  // Save New Chapter (Inline form - NO POPUP)
  const handleSaveNewChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề chương học!");
      return;
    }
    try {
      const newSec = await courseAdminApi.addChapter(slug, {
        title: newChapterTitle.trim(),
        titleEn: newChapterTitleEn.trim() || undefined,
        description: newChapterDesc.trim() || undefined,
      });
      const updated = await courseAdminApi.getCurriculum(slug);
      setSections(updated);
      setOpenChapterIds((prev) => new Set([...prev, newSec.id]));
      setIsAddingChapter(false);
      setNewChapterTitle("");
      setNewChapterTitleEn("");
      setNewChapterDesc("");
      toast.success("Đã thêm chương học mới thành công!");
    } catch (err: any) {
      toast.error("Lỗi thêm chương: " + err.message);
    }
  };

  // Start inline edit chapter
  const handleStartEditChapter = (sec: CourseCurriculumSection) => {
    setEditingChapterId(sec.id);
    setEditChapterTitle(sec.title);
    setEditChapterDesc(sec.description || "");
  };

  // Save Edit Chapter (Inline form - NO POPUP)
  const handleSaveEditChapter = async (chapterId: string) => {
    if (!editChapterTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề chương!");
      return;
    }
    try {
      await courseAdminApi.updateChapter(slug, chapterId, {
        title: editChapterTitle.trim(),
        description: editChapterDesc.trim() || undefined,
      });
      const updated = await courseAdminApi.getCurriculum(slug);
      setSections(updated);
      setEditingChapterId(null);
      toast.success("Đã cập nhật chương học!");
    } catch (err: any) {
      toast.error("Lỗi cập nhật: " + err.message);
    }
  };

  // Delete Chapter
  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa toàn bộ chương "${chapterTitle}" cùng tất cả bài học bên trong?`)) return;
    try {
      await courseAdminApi.deleteChapter(slug, chapterId);
      const updated = await courseAdminApi.getCurriculum(slug);
      setSections(updated);
      toast.success(`Đã xóa chương "${chapterTitle}"!`);
    } catch (err: any) {
      toast.error("Lỗi xóa chương: " + err.message);
    }
  };

  // Filter lessons
  const filteredSections = useMemo(() => {
    return sections.map((sec) => {
      let filteredLessons = sec.lessons;
      if (searchKw.trim()) {
        const kw = searchKw.trim().toLowerCase();
        filteredLessons = filteredLessons.filter((l) =>
          l.title.toLowerCase().includes(kw) ||
          (l.videoUrl && l.videoUrl.toLowerCase().includes(kw))
        );
      }
      if (selectedTypeFilter !== "all") {
        filteredLessons = filteredLessons.filter((l) => l.type === selectedTypeFilter);
      }
      return {
        ...sec,
        lessons: filteredLessons,
      };
    });
  }, [sections, searchKw, selectedTypeFilter]);

  const totalLessons = useMemo(() => {
    return sections.reduce((acc, s) => acc + s.lessons.length, 0);
  }, [sections]);

  const totalMinutes = useMemo(() => {
    return sections.reduce((acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0), 0);
  }, [sections]);

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="size-4 text-sky-500" />;
      case "reading":
        return <FileText className="size-4 text-emerald-500" />;
      case "star_practice":
        return <Award className="size-4 text-amber-500" />;
      case "quiz":
        return <HelpCircle className="size-4 text-purple-500" />;
      case "mock_simulation":
        return <Compass className="size-4 text-rose-500" />;
      default:
        return <BookOpen className="size-4 text-muted-foreground" />;
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video";
      case "reading":
        return "Bài đọc";
      case "star_practice":
        return "STAR";
      case "quiz":
        return "Quiz";
      case "mock_simulation":
        return "Giả lập";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="@container/main flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-muted-foreground lg:px-6">
        <RefreshCw className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Đang tải thông tin chi tiết khóa học và giáo trình...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="@container/main flex min-w-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center lg:px-6">
        <AlertCircle className="size-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Không tìm thấy khóa học</h2>
        <p className="text-sm text-muted-foreground">Khóa học với mã `{slug}` không tồn tại hoặc đã bị xóa.</p>
        <Button asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách khóa học
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/courses" className="hover:text-foreground transition-colors">Quản lý khóa học</Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px] md:max-w-md">{course.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/admin/courses">
                <ArrowLeft className="size-4 mr-1.5" />
                Danh sách khóa học
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Quản lý chi tiết & Giáo trình bài học
            </h1>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs">
            <Link href={`/courses/${course.slug}`} target="_blank">
              <ExternalLink className="size-3.5 mr-1.5 text-muted-foreground" />
              Xem trang học viên
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingChapter((prev) => !prev)}
            className="h-9 text-xs font-semibold"
          >
            <Plus className="size-3.5 mr-1.5" />
            {isAddingChapter ? "Đóng form thêm chương" : "Thêm chương mới"}
          </Button>

          <Button
            size="sm"
            asChild
            className="h-9 text-xs font-bold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <Link href={`/admin/courses/${course.slug}/lessons/create`}>
              <Plus className="size-4 mr-1.5" />
              Tạo bài học mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Course Overview Banner */}
      <Card className="border shadow-xs bg-card/60 backdrop-blur-xs overflow-hidden">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.image}
              alt={course.title}
              className="w-full md:w-44 h-28 object-cover rounded-xl border shrink-0 bg-muted"
            />
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-[11px] font-bold">
                  {course.type}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  {course.role}
                </Badge>
                <Badge variant="outline" className="text-[11px] capitalize">
                  {course.levelLabel || course.level}
                </Badge>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug">
                {course.title}
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {course.description}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  <span><strong>{sections.length}</strong> chương học</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-sky-500" />
                  <span><strong>{totalLessons}</strong> bài học</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-emerald-500" />
                  <span>~<strong>{Math.round(totalMinutes / 60) || course.estimatedHours}</strong> giờ học</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-amber-500" />
                  <span><strong>{course.enrolledCount.toLocaleString()}</strong> học viên</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{course.rating} ({course.reviewCount || 0} đánh giá)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inline Add Chapter Form (NO POPUP) */}
      {isAddingChapter && (
        <Card className="border-2 border-primary/30 bg-primary/5 shadow-xs animate-in fade-in-50 duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Plus className="size-4 text-primary" />
                  Thêm chương học mới (Không dùng Popup)
                </CardTitle>
                <CardDescription className="text-xs">
                  Điền tiêu đề và mô tả chương học để cấu trúc lộ trình giảng dạy rõ ràng.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddingChapter(false)}
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNewChapter} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tiêu đề chương (Tiếng Việt) *</Label>
                  <Input
                    required
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="VD: Chương 2: Thiết kế hệ thống System Design"
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tiêu đề Tiếng Anh (Tùy chọn)</Label>
                  <Input
                    value={newChapterTitleEn}
                    onChange={(e) => setNewChapterTitleEn(e.target.value)}
                    placeholder="VD: Section 2: Large Scale System Design"
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mô tả tóm tắt nội dung chương</Label>
                <textarea
                  rows={2}
                  value={newChapterDesc}
                  onChange={(e) => setNewChapterDesc(e.target.value)}
                  placeholder="Mô tả mục tiêu của chương học, các kỹ năng học viên sẽ đạt được..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingChapter(false)}
                  className="h-8 text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs font-bold">
                  <Save className="size-3.5 mr-1.5" />
                  Lưu chương học mới
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="Tìm kiếm bài học theo tiêu đề..."
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
          {searchKw && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchKw("")}
              className="h-8 px-2 text-xs text-muted-foreground"
            >
              Xóa lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground text-[11px] hidden md:inline">Loại bài:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="video">Chỉ Video</option>
              <option value="reading">Bài đọc</option>
              <option value="star_practice">Luyện tập STAR</option>
              <option value="quiz">Trắc nghiệm</option>
              <option value="mock_simulation">Giả lập</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpandAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Mở tất cả
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Thu gọn
          </Button>
        </div>
      </div>

      {/* Chapters & Lessons List */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <Card className="border-dashed p-8 text-center space-y-3">
            <BookOpen className="size-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Không tìm thấy bài học nào phù hợp</h3>
              <p className="text-xs text-muted-foreground">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm &ldquo;Thêm chương mới&rdquo; để bắt đầu xây dựng giáo trình.
              </p>
            </div>
          </Card>
        ) : (
          filteredSections.map((sec, secIdx) => {
            const isOpen = openChapterIds.has(sec.id);
            const isEditing = editingChapterId === sec.id;
            const secTotalDuration = sec.lessons.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

            return (
              <Card key={sec.id} className="border shadow-xs overflow-hidden transition-all">
                {/* Chapter Card Header */}
                <div className="p-4 bg-muted/20 border-b flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start md:items-center gap-3 flex-1">
                    {/* Chapter Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0 pt-0.5 md:pt-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={secIdx === 0}
                        onClick={() => handleMoveChapter(sec.id, "up")}
                        title="Đẩy chương này lên trên"
                        className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={secIdx === sections.length - 1}
                        onClick={() => handleMoveChapter(sec.id, "down")}
                        title="Đẩy chương này xuống dưới"
                        className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="size-3" />
                      </Button>
                    </div>

                    <div className="space-y-0.5 flex-1 cursor-pointer" onClick={() => toggleChapter(sec.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-background">
                          Chương {secIdx + 1}
                        </Badge>
                        <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                          {sec.title}
                        </h3>
                        {sec.titleEn && (
                          <span className="text-xs text-muted-foreground hidden lg:inline">
                            ({sec.titleEn})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{sec.lessons.length} bài học</span>
                        <span>•</span>
                        <span>~{secTotalDuration} phút</span>
                        {sec.description && (
                          <>
                            <span>•</span>
                            <span className="line-clamp-1 italic max-w-sm">{sec.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chapter Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    {/* Dedicated Add Lesson Page Link (NO POPUP) */}
                    <Button
                      size="sm"
                      asChild
                      className="h-7 px-2.5 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link href={`/admin/courses/${slug}/lessons/create?chapterId=${sec.id}`}>
                        <Plus className="size-3 mr-1" />
                        Thêm bài học
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEditChapter(sec)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      title="Sửa thông tin chương học (inline)"
                    >
                      <Edit2 className="size-3 mr-1" />
                      Sửa chương
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChapter(sec.id, sec.title)}
                      className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                      title="Xóa chương học"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Xóa
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleChapter(sec.id)}
                      className="size-7 text-muted-foreground hover:text-foreground"
                    >
                      {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </div>
                </div>

                {/* Inline Edit Chapter Form (NO POPUP) */}
                {isEditing && (
                  <div className="p-4 bg-muted/40 border-b space-y-3 animate-in fade-in-50 duration-150">
                    <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Edit2 className="size-3.5 text-primary" />
                      Chỉnh sửa chương học: {sec.title}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tiêu đề chương *</Label>
                      <Input
                        value={editChapterTitle}
                        onChange={(e) => setEditChapterTitle(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mô tả chương</Label>
                      <textarea
                        rows={2}
                        value={editChapterDesc}
                        onChange={(e) => setEditChapterDesc(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingChapterId(null)}
                        className="h-7 text-xs"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveEditChapter(sec.id)}
                        className="h-7 text-xs font-bold"
                      >
                        <Save className="size-3 mr-1" />
                        Lưu thay đổi chương
                      </Button>
                    </div>
                  </div>
                )}

                {/* Chapter Body (Lessons List) */}
                {isOpen && (
                  <CardContent className="p-0">
                    {sec.lessons.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Chương này chưa có bài học nào. Hãy thêm bài học đầu tiên!
                        </p>
                        <Button
                          size="sm"
                          asChild
                          variant="outline"
                          className="h-8 text-xs font-semibold"
                        >
                          <Link href={`/admin/courses/${slug}/lessons/create?chapterId=${sec.id}`}>
                            <Plus className="size-3.5 mr-1 text-primary" />
                            Tạo bài học cho chương {secIdx + 1}
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {sec.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="p-3.5 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                          >
                            {/* Left: Reorder, Number, Icon, Title */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Reorder Buttons (Thay đổi thứ tự bài học) */}
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={lIdx === 0}
                                  onClick={() => handleMoveLesson(sec.id, lesson.id, "up")}
                                  title="Đẩy bài học này lên trước"
                                  className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                >
                                  <ArrowUp className="size-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={lIdx === sec.lessons.length - 1}
                                  onClick={() => handleMoveLesson(sec.id, lesson.id, "down")}
                                  title="Đẩy bài học này xuống sau"
                                  className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                >
                                  <ArrowDown className="size-3" />
                                </Button>
                              </div>

                              {/* Index badge */}
                              <span className="font-mono text-xs text-muted-foreground font-semibold shrink-0 w-6 text-center">
                                #{lIdx + 1}
                              </span>

                              {/* Type Icon */}
                              <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">
                                {getLessonTypeIcon(lesson.type)}
                              </div>

                              {/* Title & metadata */}
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link
                                    href={`/admin/courses/${slug}/lessons/${lesson.id}/edit`}
                                    className="font-bold text-xs md:text-sm text-foreground hover:text-primary transition-colors truncate max-w-sm md:max-w-md block"
                                    title="Bấm để chuyển tới trang chỉnh sửa bài học"
                                  >
                                    {lesson.title}
                                  </Link>

                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {getLessonTypeLabel(lesson.type)}
                                  </Badge>

                                  {lesson.isFree ? (
                                    <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                                      Học thử miễn phí
                                    </Badge>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">
                                      Khóa học viên
                                    </span>
                                  )}

                                  {lesson.isVideo && (
                                    <span className="text-[10px] text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                                      <Video className="size-2.5" />
                                      {lesson.videoUrl?.includes("blob:") || lesson.videoUrl?.includes("upload")
                                        ? "Video tải lên"
                                        : "Link video"}
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-3 text-muted-foreground" />
                                    {lesson.durationMinutes} phút
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono text-[10px]">ID: {lesson.id}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions (Chỉnh sửa bài học cụ thể, Xóa bài học) */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                              {/* Dedicated Edit Lesson Page Link (NO POPUP) */}
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="h-7 px-2.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary"
                              >
                                <Link href={`/admin/courses/${slug}/lessons/${lesson.id}/edit`}>
                                  <Edit2 className="size-3 mr-1.5 text-primary" />
                                  Chỉnh sửa bài học
                                </Link>
                              </Button>

                              {/* Delete Lesson Button */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLesson(sec.id, lesson.id, lesson.title)}
                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                title="Xóa bài học này"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
