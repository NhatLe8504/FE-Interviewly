"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  Video,
  Link as LinkIcon,
  PlayCircle,
  FileText,
  HelpCircle,
  Award,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  X,
  FileVideo,
  Info,
  Trash2,
  ExternalLink,
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
  type LessonCreateIn,
} from "@/services/admin/courseAdminApi";
import type { CourseItem } from "@/types/course";
import type { CourseCurriculumSection, ResolvedLesson } from "@/data/lessonResolver";

interface AdminLessonEditClientProps {
  slug: string;
  lessonId: string;
}

export default function AdminLessonEditClient({
  slug,
  lessonId,
}: AdminLessonEditClientProps) {
  const router = useRouter();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [sections, setSections] = useState<CourseCurriculumSection[]>([]);
  const [originalLesson, setOriginalLesson] = useState<ResolvedLesson | null>(null);
  const [originalChapter, setOriginalChapter] = useState<CourseCurriculumSection | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [targetChapterId, setTargetChapterId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [type, setType] = useState<"video" | "reading" | "star_practice" | "mock_simulation" | "quiz">("video");
  const [isFree, setIsFree] = useState(false);

  // Video State
  const [videoMode, setVideoMode] = useState<"upload" | "link">("link");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Content / Notes
  const [contentHtml, setContentHtml] = useState("");

  // STAR Practice fields
  const [starPrompt, setStarPrompt] = useState("");
  const [starIntent, setStarIntent] = useState("");
  const [starSituation, setStarSituation] = useState("");
  const [starTask, setStarTask] = useState("");
  const [starAction, setStarAction] = useState("");
  const [starResult, setStarResult] = useState("");
  const [starSample, setStarSample] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s, lessonRes] = await Promise.all([
        courseAdminApi.getCourse(slug),
        courseAdminApi.getCurriculum(slug),
        courseAdminApi.getLesson(slug, lessonId),
      ]);
      setCourse(c);
      setSections(s);

      if (!lessonRes) {
        toast.error("Không tìm thấy bài học này trong giáo trình");
        return;
      }

      const { lesson, chapter } = lessonRes;
      setOriginalLesson(lesson);
      setOriginalChapter(chapter);

      setTargetChapterId(chapter.id);
      setTitle(lesson.title);
      setDurationMinutes(lesson.durationMinutes || 15);
      setType(lesson.type as any || "video");
      setIsFree(Boolean(lesson.isFree));
      setVideoUrl(lesson.videoUrl || "");
      if (lesson.videoUrl && (lesson.videoUrl.includes("blob:") || lesson.videoUrl.includes("upload"))) {
        setVideoMode("upload");
        setUploadedFileName("Video đã lưu");
      }
      setContentHtml(lesson.contentHtml || "");

      if (lesson.practiceQuestion) {
        setStarPrompt(lesson.practiceQuestion.prompt || "");
        setStarIntent(lesson.practiceQuestion.intent || "");
        setStarSituation(lesson.practiceQuestion.starSituation || "");
        setStarTask(lesson.practiceQuestion.starTask || "");
        setStarAction(lesson.practiceQuestion.starAction || "");
        setStarResult(lesson.practiceQuestion.starResult || "");
        setStarSample(lesson.practiceQuestion.sampleAnswer || "");
      }
    } catch (err: any) {
      toast.error("Lỗi tải thông tin bài học: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [slug, lessonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Video File Upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chỉ chọn tệp định dạng video (MP4, WebM, MOV, v.v.)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const res = await courseAdminApi.uploadVideo(file);
      clearInterval(interval);
      setUploadProgress(100);
      setVideoUrl(res.url);
      toast.success("Tải video lên thành công! Bạn có thể xem trước video bên dưới.");
    } catch (err: any) {
      clearInterval(interval);
      toast.error("Lỗi khi tải video lên: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Submit / Update Lesson
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học!");
      return;
    }

    setSubmitting(true);
    try {
      const currentChapterId = originalChapter ? originalChapter.id : targetChapterId;
      const lessonData: Partial<LessonCreateIn> = {
        title: title.trim(),
        durationMinutes: Number(durationMinutes) || 15,
        type,
        isFree,
        videoUrl: videoUrl.trim() || undefined,
        videoFileName: uploadedFileName || undefined,
        videoSize: uploadedFileSize || undefined,
        contentHtml: contentHtml.trim() || undefined,
        targetChapterId: targetChapterId !== currentChapterId ? targetChapterId : undefined,
        practiceQuestion: type === "star_practice" && starPrompt.trim() ? {
          prompt: starPrompt.trim(),
          intent: starIntent.trim() || undefined,
          starSituation: starSituation.trim() || undefined,
          starTask: starTask.trim() || undefined,
          starAction: starAction.trim() || undefined,
          starResult: starResult.trim() || undefined,
          sampleAnswer: starSample.trim() || undefined,
        } : undefined,
      };

      await courseAdminApi.updateLesson(slug, currentChapterId, lessonId, lessonData);
      toast.success("Đã cập nhật bài học thành công!");
      router.push(`/admin/courses/${slug}`);
    } catch (err: any) {
      toast.error("Lỗi cập nhật bài học: " + (err?.message || "Không thể lưu"));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Lesson
  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài học "${title}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    setDeleting(true);
    try {
      const currentChapterId = originalChapter ? originalChapter.id : targetChapterId;
      await courseAdminApi.deleteLesson(slug, currentChapterId, lessonId);
      toast.success(`Đã xóa bài học "${title}" thành công!`);
      router.push(`/admin/courses/${slug}`);
    } catch (err: any) {
      toast.error("Lỗi xóa bài học: " + err.message);
      setDeleting(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground space-y-3">
        <RefreshCw className="size-8 animate-spin text-primary mx-auto" />
        <p className="text-sm">Đang tải thông tin chi tiết bài học...</p>
      </div>
    );
  }

  if (!originalLesson) {
    return (
      <div className="@container/main flex min-w-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center lg:px-6">
        <AlertCircle className="size-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Không tìm thấy bài học</h2>
        <p className="text-sm text-muted-foreground">Bài học này không tồn tại trong khóa học `{slug}`.</p>
        <Button asChild>
          <Link href={`/admin/courses/${slug}`}>Quay lại quản lý khóa học</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
      {/* Breadcrumb Navigation */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
          <span>/</span>
          <Link href="/admin/courses" className="hover:text-foreground">Khóa học</Link>
          <span>/</span>
          <Link href={`/admin/courses/${slug}`} className="hover:text-foreground truncate max-w-xs">{course?.title || slug}</Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs">{originalLesson.title}</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Chỉnh sửa</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
              <Link href={`/admin/courses/${slug}`}>
                <ArrowLeft className="size-4 mr-1.5" />
                Quay lại chi tiết khóa học
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-black text-foreground">
              Chỉnh sửa bài học
            </h1>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
            Không dùng Popup • Trang chuyên biệt
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Form Fields (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Thông tin cơ bản bài học
                </CardTitle>
                <CardDescription className="text-xs">
                  Cập nhật tiêu đề, chương học phân phối và thời lượng bài học.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chapter Select / Move Chapter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Chương học thuộc về</Label>
                  <select
                    value={targetChapterId}
                    onChange={(e) => setTargetChapterId(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {sections.map((sec, idx) => (
                      <option key={sec.id} value={sec.id}>
                        Chương {idx + 1}: {sec.title}
                      </option>
                    ))}
                  </select>
                  {originalChapter && targetChapterId !== originalChapter.id && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      * Bài học sẽ được chuyển sang chương mới này sau khi bấm Lưu.
                    </p>
                  )}
                </div>

                {/* Lesson Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tiêu đề bài học *</Label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Tổng quan tiêu chí đánh giá vòng Leadership Principles"
                    className="h-9 text-xs"
                  />
                </div>

                {/* Type and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Loại bài học</Label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="video">Video bài giảng</option>
                      <option value="reading">Bài đọc lý thuyết</option>
                      <option value="star_practice">Luyện tập STAR</option>
                      <option value="quiz">Câu hỏi trắc nghiệm</option>
                      <option value="mock_simulation">Giả lập Mock Interview</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Thời lượng ước tính (Phút)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Free Preview Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer" htmlFor="free-edit-toggle">
                      Cho phép học thử miễn phí (Free Preview)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Học viên chưa mua khóa học có thể truy cập và xem bài học này.
                    </p>
                  </div>
                  <input
                    id="free-edit-toggle"
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Management Card (Upload OR Link) */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Video className="size-4 text-sky-500" />
                      Nội dung Video bài giảng
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tải lên video thay thế hoặc sửa đổi link video.
                    </CardDescription>
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center rounded-lg border bg-muted/60 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setVideoMode("link")}
                      className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                        videoMode === "link"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LinkIcon className="size-3" />
                      Điền link video
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoMode("upload")}
                      className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                        videoMode === "upload"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Upload className="size-3" />
                      Tải video lên
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoMode === "upload" ? (
                  /* UPLOAD MODE */
                  <div className="space-y-3">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer"
                      onClick={() => document.getElementById("edit-video-file-input")?.click()}
                    >
                      <input
                        id="edit-video-file-input"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/mkv"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <FileVideo className="size-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground">
                        Kéo thả tệp video mới vào đây, hoặc nhấp để chọn từ máy tính
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Hỗ trợ MP4, WebM, MOV. Tối đa 500MB.
                      </p>
                    </div>

                    {isUploading && (
                      <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Đang tải video mới lên...</span>
                          <span className="font-mono text-primary font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadedFileName && (
                      <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          <span className="font-medium text-foreground truncate max-w-xs">{uploadedFileName}</span>
                          {uploadedFileSize && <span className="text-muted-foreground">({uploadedFileSize})</span>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVideoUrl("");
                            setUploadedFileName("");
                            setUploadedFileSize("");
                          }}
                          className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                        >
                          Gỡ video
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* LINK MODE */
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Đường dẫn video (URL)</Label>
                      <Input
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... hoặc https://.../video.mp4"
                        className="h-9 text-xs font-mono"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-muted-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded">YouTube</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded">Vimeo</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded">Cloudinary</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded">MP4 Trực tiếp</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Preview Player */}
                {videoUrl && (
                  <div className="space-y-1.5 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                        <PlayCircle className="size-3.5 text-primary" />
                        Xem trước video đang gán cho bài học
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoUrl("");
                          setUploadedFileName("");
                        }}
                        className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        Gỡ video
                      </Button>
                    </div>
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border relative shadow-xs">
                      {isYouTube ? (
                        <iframe
                          src={getEmbedUrl(videoUrl)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Video Preview"
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description / Content Card */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="size-4 text-emerald-500" />
                  Nội dung chi tiết & Ghi chú bài giảng
                </CardTitle>
                <CardDescription className="text-xs">
                  Nhập tài liệu học tập, kiến thức trọng tâm hoặc hướng dẫn bài đọc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  rows={5}
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  placeholder="Ghi chú nội dung bài giảng, dàn ý chính hoặc tài liệu..."
                  className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans"
                />
              </CardContent>
            </Card>

            {/* STAR Practice Card */}
            {type === "star_practice" && (
              <Card className="border shadow-xs bg-amber-500/5 border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-700">
                    <Award className="size-4 text-amber-500" />
                    Cấu trúc câu hỏi thực hành STAR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Đề bài câu hỏi STAR</Label>
                    <Input
                      value={starPrompt}
                      onChange={(e) => setStarPrompt(e.target.value)}
                      placeholder="VD: Kể lại một tình huống bạn phải giải quyết xung đột ý kiến..."
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">S - Tình huống (Situation)</Label>
                      <Input
                        value={starSituation}
                        onChange={(e) => setStarSituation(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">T - Nhiệm vụ (Task)</Label>
                      <Input
                        value={starTask}
                        onChange={(e) => setStarTask(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">A - Hành động (Action)</Label>
                      <Input
                        value={starAction}
                        onChange={(e) => setStarAction(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">R - Kết quả (Result)</Label>
                      <Input
                        value={starResult}
                        onChange={(e) => setStarResult(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="border shadow-xs sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">
                  Thao tác cập nhật
                </CardTitle>
                <CardDescription className="text-xs">
                  Cập nhật hoặc xóa bài học khỏi giáo trình.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Button
                  type="submit"
                  disabled={submitting || deleting}
                  className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  <Save className="size-3.5 mr-1.5" />
                  {submitting ? "Đang lưu thay đổi..." : "Cập nhật bài học"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full h-8 text-xs"
                >
                  <Link href={`/courses/${slug}/${originalChapter?.id || targetChapterId}/${lessonId}`} target="_blank">
                    <ExternalLink className="size-3.5 mr-1.5 text-muted-foreground" />
                    Xem trang học viên
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  asChild
                  className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link href={`/admin/courses/${slug}`}>
                    Quay lại giáo trình
                  </Link>
                </Button>

                <div className="pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={deleting || submitting}
                    onClick={handleDelete}
                    className="w-full h-8 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    {deleting ? "Đang xóa..." : "Xóa bài học này"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Student Preview Card */}
            <Card className="border shadow-xs bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Xem trước thẻ bài học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl border bg-background space-y-2 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {type}
                    </Badge>
                    {isFree && (
                      <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                        Học thử miễn phí
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-foreground line-clamp-2">
                    {title || originalLesson.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {durationMinutes} phút
                    </span>
                    <span>{videoUrl ? "Có video bài giảng" : "Tài liệu lý thuyết"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
