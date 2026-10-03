"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  RefreshCw,
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
  MoreHorizontal,
  ChevronRight,
  Eye,
  FileText,
  PlayCircle,
  HelpCircle,
  Mic,
  Video,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/admin/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/admin/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { toast } from "sonner";
import {
  courseAdminApi,
  type CourseAdminCreateIn,
  type ChapterCreateIn,
  type LessonCreateIn,
} from "@/services/admin/courseAdminApi";
import type { CourseItem } from "@/types/course";
import type { CourseCurriculumSection, ResolvedLesson } from "@/data/lessonResolver";
import { COURSE_CATEGORIES } from "@/data/coursesData";

export default function AdminCoursesClient() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Course Create / Edit Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [courseFormData, setCourseFormData] = useState<CourseAdminCreateIn>({
    title: "",
    slug: "",
    type: "Learning Path",
    category: "swe",
    role: "Backend Engineer",
    level: "mid",
    estimatedHours: 24,
    description: "",
    targetCompanies: ["Google", "Meta", "Amazon"],
    skills: ["System Design", "Algorithms", "STAR"],
    image: "https://images.ctfassets.net/x78yjrjc11pq/25mhKSvDOiCwC89lDj89Ah/9a5fbfacc8d93f05c238ab55baa4e5e5/fde.png?w=800&h=800&fm=webp&q=75",
  });

  // Course Delete Dialog
  const [deleteCourseSlug, setDeleteCourseSlug] = useState<string | null>(null);

  // Curriculum Management Drawer
  const [managingCourse, setManagingCourse] = useState<CourseItem | null>(null);
  const [curriculumSections, setCurriculumSections] = useState<CourseCurriculumSection[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(new Set());

  // Chapter Modal
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState<ChapterCreateIn>({
    title: "",
    description: "",
  });

  // Lesson Modal
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetChapterId, setTargetChapterId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonCreateIn>({
    title: "",
    durationMinutes: 15,
    type: "video",
    isFree: true,
    videoUrl: "",
  });

  // Load Courses
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseAdminApi.getCourses();
      setCourses(data);
    } catch (err: any) {
      toast.error("Lỗi nạp danh sách khóa học: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalLessons = courses.reduce((acc, c) => acc + (c.totalLessonsCount || 0), 0);
    const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
    const avgRating = totalCourses > 0
      ? (courses.reduce((acc, c) => acc + (c.rating || 4.9), 0) / totalCourses).toFixed(2)
      : "4.95";

    return { totalCourses, totalLessons, totalEnrolled, avgRating };
  }, [courses]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        const inTitle = c.title.toLowerCase().includes(kw);
        const inRole = c.role.toLowerCase().includes(kw);
        const inSkills = c.skills.some((s) => s.toLowerCase().includes(kw));
        if (!inTitle && !inRole && !inSkills) return false;
      }
      if (selectedCategory !== "all" && c.category !== selectedCategory) return false;
      if (selectedType !== "all" && c.type !== selectedType) return false;
      if (selectedLevel !== "all" && c.level !== selectedLevel && c.level !== "all") return false;
      return true;
    });
  }, [courses, search, selectedCategory, selectedType, selectedLevel]);

  // Open Create Course
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseFormData({
      title: "",
      slug: "",
      type: "Learning Path",
      category: "swe",
      role: "Backend Engineer",
      level: "mid",
      estimatedHours: 24,
      description: "",
      targetCompanies: ["Google", "Meta", "Amazon"],
      skills: ["System Design", "Algorithms", "STAR"],
      image: "https://images.ctfassets.net/x78yjrjc11pq/25mhKSvDOiCwC89lDj89Ah/9a5fbfacc8d93f05c238ab55baa4e5e5/fde.png?w=800&h=800&fm=webp&q=75",
    });
    setIsCourseModalOpen(true);
  };

  // Open Edit Course
  const handleOpenEditCourse = (c: CourseItem) => {
    setEditingCourse(c);
    setCourseFormData({
      title: c.title,
      slug: c.slug,
      type: c.type,
      category: c.category,
      role: c.role,
      level: c.level,
      estimatedHours: c.estimatedHours,
      description: c.description,
      targetCompanies: c.targetCompanies,
      skills: c.skills,
      image: c.image,
    });
    setIsCourseModalOpen(true);
  };

  // Save Course (Create / Edit)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) {
      toast.error("Vui lòng nhập tên khóa học!");
      return;
    }

    try {
      if (editingCourse) {
        await courseAdminApi.updateCourse(editingCourse.slug, courseFormData);
        toast.success(`Cập nhật khóa học '${courseFormData.title}' thành công!`);
      } else {
        await courseAdminApi.createCourse(courseFormData);
        toast.success(`Đã thêm khóa học '${courseFormData.title}' vào thư viện!`);
      }
      setIsCourseModalOpen(false);
      loadCourses();
    } catch (err: any) {
      toast.error("Lưu khóa học thất bại: " + err.message);
    }
  };

  // Delete Course
  const handleDeleteCourse = async () => {
    if (!deleteCourseSlug) return;
    try {
      await courseAdminApi.deleteCourse(deleteCourseSlug);
      toast.success("Đã xóa khóa học thành công!");
      setDeleteCourseSlug(null);
      loadCourses();
    } catch (err: any) {
      toast.error("Xóa thất bại: " + err.message);
    }
  };

  // Open Curriculum Management Drawer
  const handleManageCurriculum = async (course: CourseItem) => {
    setManagingCourse(course);
    setIsLoadingCurriculum(true);
    try {
      const sections = await courseAdminApi.getCurriculum(course.slug);
      setCurriculumSections(sections);
      setOpenChapterIds(new Set(sections.map((s) => s.id)));
    } catch (err: any) {
      toast.error("Lỗi nạp chương trình học: " + err.message);
    } finally {
      setIsLoadingCurriculum(false);
    }
  };

  const toggleChapterOpen = (chapterId: string) => {
    setOpenChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  // Chapter Handlers
  const handleOpenAddChapter = () => {
    setEditingChapterId(null);
    setChapterForm({ title: "", description: "" });
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (sec: CourseCurriculumSection) => {
    setEditingChapterId(sec.id);
    setChapterForm({ title: sec.title, description: sec.description || "" });
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCourse || !chapterForm.title.trim()) return;

    try {
      if (editingChapterId) {
        await courseAdminApi.updateChapter(managingCourse.slug, editingChapterId, chapterForm);
        toast.success("Đã cập nhật chương học thành công!");
      } else {
        await courseAdminApi.addChapter(managingCourse.slug, chapterForm);
        toast.success("Đã thêm chương học mới!");
      }
      setIsChapterModalOpen(false);
      const updated = await courseAdminApi.getCurriculum(managingCourse.slug);
      setCurriculumSections(updated);
    } catch (err: any) {
      toast.error("Lỗi lưu chương: " + err.message);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!managingCourse) return;
    if (!confirm("Bạn có chắc muốn xóa chương này và các bài học bên trong?")) return;

    try {
      await courseAdminApi.deleteChapter(managingCourse.slug, chapterId);
      toast.success("Đã xóa chương học thành công!");
      const updated = await courseAdminApi.getCurriculum(managingCourse.slug);
      setCurriculumSections(updated);
      loadCourses();
    } catch (err: any) {
      toast.error("Lỗi xóa chương: " + err.message);
    }
  };

  // Lesson Handlers
  const handleOpenAddLesson = (chapterId: string) => {
    setTargetChapterId(chapterId);
    setEditingLessonId(null);
    setLessonForm({
      title: "",
      durationMinutes: 15,
      type: "video",
      isFree: false,
      videoUrl: "",
    });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (chapterId: string, lesson: ResolvedLesson) => {
    setTargetChapterId(chapterId);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      durationMinutes: lesson.durationMinutes,
      type: lesson.type,
      isFree: lesson.isFree,
      videoUrl: lesson.videoUrl || "",
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCourse || !targetChapterId || !lessonForm.title.trim()) return;

    try {
      if (editingLessonId) {
        await courseAdminApi.updateLesson(managingCourse.slug, targetChapterId, editingLessonId, lessonForm);
        toast.success("Đã cập nhật bài học!");
      } else {
        await courseAdminApi.addLesson(managingCourse.slug, targetChapterId, lessonForm);
        toast.success("Đã thêm bài học mới vào chương!");
      }
      setIsLessonModalOpen(false);
      const updated = await courseAdminApi.getCurriculum(managingCourse.slug);
      setCurriculumSections(updated);
      loadCourses();
    } catch (err: any) {
      toast.error("Lỗi lưu bài học: " + err.message);
    }
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    if (!managingCourse) return;
    try {
      await courseAdminApi.deleteLesson(managingCourse.slug, chapterId, lessonId);
      toast.success("Đã xóa bài học!");
      const updated = await courseAdminApi.getCurriculum(managingCourse.slug);
      setCurriculumSections(updated);
      loadCourses();
    } catch (err: any) {
      toast.error("Lỗi xóa bài học: " + err.message);
    }
  };

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-2">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-4 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          <p className="text-xs text-muted-foreground">
            Quản trị <strong className="text-foreground">Khóa Học &amp; Lộ Trình Tuyển Dụng</strong>, xây dựng giáo trình chương hồi và bài học thực chiến chuẩn STAR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCourses}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateCourse}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Tạo Khóa Học Mới</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4 px-4 lg:px-6">
        {/* Top KPI Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl border bg-card shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Compass className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Khóa Học &amp; Lộ Trình</div>
              <div className="text-xl font-bold tracking-tight text-foreground">{stats.totalCourses} Khóa</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Tổng Số Bài Học</div>
              <div className="text-xl font-bold tracking-tight text-foreground">{stats.totalLessons}+ Bài</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Lượt Học Viên Đăng Ký</div>
              <div className="text-xl font-bold tracking-tight text-foreground">{stats.totalEnrolled.toLocaleString()} lượt</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="size-5 fill-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Đánh Giá Trung Bình</div>
              <div className="text-xl font-bold tracking-tight text-foreground">{stats.avgRating} ★</div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên khóa học, chức danh, kỹ năng công nghệ (RAG, Java, React...)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                  setSelectedLevel("all");
                }}
                className="h-9 gap-1.5 text-xs"
              >
                <RefreshCw className="size-3.5" />
                <span>Đặt lại</span>
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Lĩnh vực chuyên môn</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Hình thức đào tạo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hình thức</SelectItem>
                  <SelectItem value="Learning Path">Lộ trình (Learning Path)</SelectItem>
                  <SelectItem value="Course">Khóa học lẻ (Course)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Cấp độ mục tiêu</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  <SelectItem value="fresher">Fresher / Junior</SelectItem>
                  <SelectItem value="mid">Middle</SelectItem>
                  <SelectItem value="senior">Senior / Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Courses Data Table */}
        <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="table-fixed">
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                <TableRow>
                  <TableHead className="w-[5%]">Mã</TableHead>
                  <TableHead className="w-[30%]">Khóa Học &amp; Mô Tả</TableHead>
                  <TableHead className="w-[20%]">Lĩnh Vực &amp; Vị Trí</TableHead>
                  <TableHead className="w-[15%] text-center">Hình Thức &amp; Cấp Độ</TableHead>
                  <TableHead className="w-[12%] text-center">Quy Mô Bài Học</TableHead>
                  <TableHead className="w-[12%] text-center">Học Viên &amp; Điểm</TableHead>
                  <TableHead className="w-[6%] text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      Không tìm thấy khóa học nào phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((c, idx) => (
                    <TableRow key={c.id || idx} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-muted-foreground font-semibold">
                        #{c.id.replace("c-", "")}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3 py-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.image}
                            alt={c.title}
                            className="size-12 rounded-lg object-cover border shrink-0 bg-muted"
                          />
                          <div className="space-y-0.5 overflow-hidden">
                            <Link
                              href={`/admin/courses/${c.slug}`}
                              className="font-bold text-foreground hover:text-primary leading-snug truncate max-w-[280px] block transition-colors cursor-pointer"
                              title="Nhấp để vào trang quản lý chi tiết bài học"
                            >
                              {c.title}
                            </Link>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[320px]" title={c.description}>
                              {c.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground truncate max-w-[180px]">
                            {c.role}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {c.skills.slice(0, 2).map((s, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground truncate max-w-[100px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <Badge variant={c.type === "Learning Path" ? "default" : "secondary"}>
                            {c.type}
                          </Badge>
                          <div className="text-[11px] text-muted-foreground capitalize">
                            {c.levelLabel}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-0.5">
                          <strong className="text-foreground font-bold">
                            {c.totalLessonsCount} bài
                          </strong>
                          <div className="text-[11px] text-muted-foreground">
                            ~{c.estimatedHours} giờ
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground">
                            {c.enrolledCount.toLocaleString()} hv
                          </span>
                          <div className="text-[11px] text-amber-600 font-bold flex items-center justify-center gap-1">
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            <span>{c.rating}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 text-xs">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${c.slug}`}>
                                <Layers className="size-3.5 mr-2 text-primary" />
                                <span className="font-bold">Quản lý chi tiết & bài học</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleManageCurriculum(c)}>
                              <BookOpen className="size-3.5 mr-2 text-muted-foreground" />
                              <span>Mở ngăn giáo trình nhanh</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleOpenEditCourse(c)}>
                              <Edit2 className="size-3.5 mr-2" />
                              <span>Chỉnh sửa khóa học</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href={`/courses/${c.slug}`} target="_blank">
                                <ExternalLink className="size-3.5 mr-2 text-muted-foreground" />
                                <span>Xem trang học viên</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setDeleteCourseSlug(c.slug)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              <span>Xóa khóa học này</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* =========================================================
          CREATE / EDIT COURSE DIALOG
         ========================================================= */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto text-xs">
          <form onSubmit={handleSaveCourse}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingCourse ? `Chỉnh Sửa Khóa Học: ${editingCourse.title}` : "Tạo Khóa Học / Lộ Trình Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Điền thông tin khóa học, lĩnh vực chuyên môn và công nghệ mục tiêu.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tên khóa học phỏng vấn *</Label>
                <Input
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder="Ví dụ: AI Engineering Interview Prep"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hình thức đào tạo</Label>
                  <Select
                    value={courseFormData.type}
                    onValueChange={(v: any) => setCourseFormData({ ...courseFormData, type: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Learning Path">Lộ trình toàn diện (Learning Path)</SelectItem>
                      <SelectItem value="Course">Khóa học chuyên sâu (Course)</SelectItem>
                      <SelectItem value="Workshop">Workshop thực chiến</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Lĩnh vực chuyên môn</Label>
                  <Select
                    value={courseFormData.category}
                    onValueChange={(v) => setCourseFormData({ ...courseFormData, category: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Vị trí chức danh</Label>
                  <Input
                    value={courseFormData.role}
                    onChange={(e) => setCourseFormData({ ...courseFormData, role: e.target.value })}
                    placeholder="Ví dụ: AI / ML Engineer, Backend Lead..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cấp độ mục tiêu</Label>
                  <Select
                    value={courseFormData.level}
                    onValueChange={(v: any) => setCourseFormData({ ...courseFormData, level: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher / Mới tốt nghiệp</SelectItem>
                      <SelectItem value="junior">Junior (1 - 2 năm)</SelectItem>
                      <SelectItem value="mid">Middle (2 - 4 năm)</SelectItem>
                      <SelectItem value="senior">Senior / Lead (5+ năm)</SelectItem>
                      <SelectItem value="all">Mọi cấp độ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Kỹ năng &amp; Công nghệ trọng tâm (cách nhau bởi dấu phẩy)</Label>
                <Input
                  value={courseFormData.skills?.join(", ")}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Ví dụ: RAG Pipeline, Vector DB, LLM, Python..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mô tả tóm tắt khóa học</Label>
                <textarea
                  rows={3}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Mô tả nội dung chương trình, các vòng thi trọng tâm và giá trị khóa học mang lại..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">URL ảnh đại diện (Thumbnail)</Label>
                <Input
                  value={courseFormData.image}
                  onChange={(e) => setCourseFormData({ ...courseFormData, image: e.target.value })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)} className="h-8 text-xs">
                Hủy bỏ
              </Button>
              <Button type="submit" className="h-8 text-xs font-semibold">
                {editingCourse ? "Lưu Thay Đổi" : "Tạo Khóa Học Ngay"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          CURRICULUM & LESSON MANAGER SHEET (CHƯƠNG & BÀI HỌC)
         ========================================================= */}
      <Sheet open={managingCourse !== null} onOpenChange={(open) => !open && setManagingCourse(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 text-xs flex flex-col">
          {managingCourse && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-5 pb-4 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-[11px]">{managingCourse.type}</Badge>
                    <Badge variant="outline" className="text-[11px] font-mono">#{managingCourse.id}</Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleOpenAddChapter}
                    className="h-7 text-xs gap-1 shadow-2xs"
                  >
                    <Plus className="size-3" />
                    <span>Thêm chương mới</span>
                  </Button>
                </div>

                <SheetTitle className="text-base font-bold leading-snug">
                  Quản Lý Giáo Trình: {managingCourse.title}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Thêm, sửa, xóa chương học và thiết lập các bài học, video bài giảng tương ứng.
                </SheetDescription>
              </SheetHeader>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                {isLoadingCurriculum ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Sparkles className="size-5 animate-spin text-primary" />
                    <span>Đang nạp giáo trình...</span>
                  </div>
                ) : curriculumSections.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground border rounded-xl bg-card">
                    Chưa có chương học nào trong khóa học này. Bấm &quot;Thêm chương mới&quot; để bắt đầu!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {curriculumSections.map((sec, secIdx) => {
                      const isOpen = openChapterIds.has(sec.id);
                      return (
                        <div key={sec.id} className="rounded-xl border bg-card overflow-hidden shadow-2xs">
                          {/* Chapter Header */}
                          <div className="p-3.5 bg-muted/30 border-b flex items-center justify-between gap-3">
                            <div
                              onClick={() => toggleChapterOpen(sec.id)}
                              className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                            >
                              <span className="size-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                {secIdx + 1}
                              </span>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-foreground text-xs leading-snug truncate">
                                  {sec.title}
                                </h4>
                                <span className="text-[10.5px] text-muted-foreground font-medium">
                                  {sec.lessons.length} bài học
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAddLesson(sec.id)}
                                className="h-7 px-2 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10"
                                title="Thêm bài học mới vào chương này"
                              >
                                <Plus className="size-3" />
                                <span className="hidden sm:inline">Thêm bài</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditChapter(sec)}
                                className="size-7 text-muted-foreground hover:text-foreground"
                                title="Sửa tên chương"
                              >
                                <Edit2 className="size-3" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteChapter(sec.id)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                                title="Xóa chương này"
                              >
                                <Trash2 className="size-3" />
                              </Button>

                              <button
                                type="button"
                                onClick={() => toggleChapterOpen(sec.id)}
                                className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Lessons in Chapter */}
                          {isOpen && (
                            <div className="p-2 divide-y divide-border/40">
                              {sec.lessons.length === 0 ? (
                                <div className="py-4 text-center text-muted-foreground text-xs italic">
                                  Chưa có bài học nào trong chương này.
                                </div>
                              ) : (
                                sec.lessons.map((lesson, lIdx) => (
                                  <div
                                    key={lesson.id}
                                    className="py-2 px-2.5 flex items-center justify-between gap-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {lesson.type === "video" ? (
                                        <PlayCircle className="size-3.5 text-blue-500 shrink-0" />
                                      ) : lesson.type === "star_practice" ? (
                                        <Star className="size-3.5 text-amber-500 shrink-0" />
                                      ) : lesson.type === "mock_simulation" ? (
                                        <Mic className="size-3.5 text-purple-500 shrink-0" />
                                      ) : (
                                        <FileText className="size-3.5 text-emerald-500 shrink-0" />
                                      )}
                                      <span className="font-medium text-foreground truncate">
                                        {secIdx + 1}.{lIdx + 1} {lesson.title}
                                      </span>
                                      {lesson.isFree && (
                                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 shrink-0">
                                          Miễn phí
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10.5px] text-muted-foreground">
                                        {lesson.durationMinutes}p
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditLesson(sec.id, lesson)}
                                        className="size-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
                                        title="Sửa bài học"
                                      >
                                        <Edit2 className="size-3" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(sec.id, lesson.id)}
                                        className="size-6 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
                                        title="Xóa bài học"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* =========================================================
          CHAPTER CREATE / EDIT DIALOG
         ========================================================= */}
      <Dialog open={isChapterModalOpen} onOpenChange={setIsChapterModalOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <form onSubmit={handleSaveChapter}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingChapterId ? "Chỉnh Sửa Chương Học" : "Thêm Chương Học Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Nhập tiêu đề chương học và mô tả tóm tắt.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tiêu đề chương *</Label>
                <Input
                  required
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  placeholder="Ví dụ: Chương 1: Nền tảng &amp; Tổng quan"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mô tả chương</Label>
                <textarea
                  rows={2}
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  placeholder="Tóm tắt kiến thức và mục tiêu của chương học..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsChapterModalOpen(false)} className="h-8 text-xs">
                Hủy
              </Button>
              <Button type="submit" className="h-8 text-xs font-semibold">
                Lưu Chương Học
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          LESSON CREATE / EDIT DIALOG
         ========================================================= */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <form onSubmit={handleSaveLesson}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingLessonId ? "Chỉnh Sửa Bài Học" : "Thêm Bài Học Mới Vào Chương"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Thiết lập tiêu đề, thời lượng, định dạng và URL video bài giảng.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tên bài học *</Label>
                <Input
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Ví dụ: What is Engineering Management?"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Định dạng bài học</Label>
                  <Select
                    value={lessonForm.type}
                    onValueChange={(v: any) => setLessonForm({ ...lessonForm, type: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video bài giảng</SelectItem>
                      <SelectItem value="reading">Tài liệu đọc</SelectItem>
                      <SelectItem value="star_practice">Thực hành STAR</SelectItem>
                      <SelectItem value="mock_simulation">Phỏng vấn thử AI</SelectItem>
                      <SelectItem value="quiz">Trắc nghiệm tình huống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Thời lượng (phút)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) || 15 })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">URL Video (YouTube Embed hoặc MP4)</Label>
                <Input
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-semibold">Học thử miễn phí (Free Preview)</span>
                <Button
                  type="button"
                  size="sm"
                  variant={lessonForm.isFree ? "default" : "outline"}
                  onClick={() => setLessonForm({ ...lessonForm, isFree: !lessonForm.isFree })}
                  className="h-7 text-xs font-semibold"
                >
                  {lessonForm.isFree ? "✓ Cho phép học thử" : "Khóa (Yêu cầu tài khoản)"}
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsLessonModalOpen(false)} className="h-8 text-xs">
                Hủy
              </Button>
              <Button type="submit" className="h-8 text-xs font-semibold">
                Lưu Bài Học
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          DELETE COURSE CONFIRMATION DIALOG
         ========================================================= */}
      <Dialog open={deleteCourseSlug !== null} onOpenChange={(open) => !open && setDeleteCourseSlug(null)}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Xác Nhận Xóa Khóa Học
            </DialogTitle>
            <DialogDescription className="text-xs">
              Bạn có chắc chắn muốn xóa khóa học này khỏi hệ thống? Tất cả các chương và bài học bên trong sẽ bị gỡ bỏ.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteCourseSlug(null)} className="h-8 text-xs">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} className="h-8 text-xs font-semibold">
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
