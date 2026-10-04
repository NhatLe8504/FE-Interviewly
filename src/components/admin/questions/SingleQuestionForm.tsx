"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  BookOpen,
  Star,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Badge } from "@/components/admin/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { toast } from "sonner";
import { questionAdminApi } from "@/services/admin/questionAdminApi";
import { MOCK_DOMAINS_LIST, MOCK_ROLES_LIST } from "@/mock/adminQuestionsMock";
import type { QuestionDetailOut, DomainOut, RoleOut } from "@/types/catalog";

interface SingleQuestionFormProps {
  initialQuestion?: QuestionDetailOut | null;
  isEdit?: boolean;
}

export function SingleQuestionForm({ initialQuestion, isEdit = false }: SingleQuestionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Domains & Roles from API
  const [domains, setDomains] = useState<DomainOut[]>(MOCK_DOMAINS_LIST as any);
  const [roles, setRoles] = useState<RoleOut[]>(MOCK_ROLES_LIST as any);

  // Form State
  const [domainId, setDomainId] = useState<number>(initialQuestion?.domain_id || 1);
  const [roleId, setRoleId] = useState<number>(initialQuestion?.role_id || 1);
  const [experienceLevel, setExperienceLevel] = useState<string>(initialQuestion?.experience_level || "junior");
  const [questionType, setQuestionType] = useState<"behavioral" | "technical" | "situational">(
    (initialQuestion?.question_type as any) || "technical"
  );
  const [language, setLanguage] = useState<"vi" | "en">((initialQuestion?.language as any) || "vi");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [isActive, setIsActive] = useState<boolean>(initialQuestion?.is_active !== false);

  const [questionText, setQuestionText] = useState<string>(initialQuestion?.question_text || "");
  const [intent, setIntent] = useState<string>((initialQuestion as any)?.intent || "");

  // STAR Guide
  const [situationGuide, setSituationGuide] = useState<string>(
    initialQuestion?.star_template?.situation_guide || ""
  );
  const [taskGuide, setTaskGuide] = useState<string>(
    initialQuestion?.star_template?.task_guide || ""
  );
  const [actionGuide, setActionGuide] = useState<string>(
    initialQuestion?.star_template?.action_guide || ""
  );
  const [resultGuide, setResultGuide] = useState<string>(
    initialQuestion?.star_template?.result_guide || ""
  );

  // Benchmark Answer & Tips
  const [sampleAnswer, setSampleAnswer] = useState<string>(initialQuestion?.sample_answer || "");
  const [followUp1, setFollowUp1] = useState<string>(initialQuestion?.follow_up_questions?.[0] || "");
  const [followUp2, setFollowUp2] = useState<string>(initialQuestion?.follow_up_questions?.[1] || "");
  const [tip1, setTip1] = useState<string>(initialQuestion?.tips?.[0] || "");
  const [tip2, setTip2] = useState<string>(initialQuestion?.tips?.[1] || "");

  // Quiz Options
  const [hasQuiz, setHasQuiz] = useState<boolean>(Boolean((initialQuestion?.quiz_data as any)?.question));
  const [quizQuestion, setQuizQuestion] = useState<string>((initialQuestion?.quiz_data as any)?.question || "");
  const [optA, setOptA] = useState<string>(initialQuestion?.quiz_data?.options?.[0]?.text || "");
  const [optB, setOptB] = useState<string>(initialQuestion?.quiz_data?.options?.[1]?.text || "");
  const [optC, setOptC] = useState<string>(initialQuestion?.quiz_data?.options?.[2]?.text || "");
  const [optD, setOptD] = useState<string>(initialQuestion?.quiz_data?.options?.[3]?.text || "");
  const [correctOpt, setCorrectOpt] = useState<string>(
    initialQuestion?.quiz_data?.options?.find((o: any) => o.is_correct)?.id || "B"
  );

  // Load Real Domains and Roles from Backend & set valid defaults
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [domList, roleList] = await Promise.all([
          questionAdminApi.getDomains(),
          questionAdminApi.getRoles(null),
        ]);
        const validDomains = Array.isArray(domList) && domList.length > 0 ? domList : MOCK_DOMAINS_LIST;
        const validRoles = Array.isArray(roleList) && roleList.length > 0 ? roleList : MOCK_ROLES_LIST;

        setDomains(validDomains as any);
        setRoles(validRoles as any);

        // Compute valid active domainId
        const activeDom =
          initialQuestion?.domain_id ||
          (validDomains.some((d) => d.domain_id === domainId)
            ? domainId
            : validDomains[0]?.domain_id);

        if (activeDom) setDomainId(activeDom);

        // Compute valid active roleId for that domain
        const matchingRoles = validRoles.filter((r) => r.domain_id === activeDom);
        const activeRole =
          initialQuestion?.role_id ||
          (matchingRoles.some((r) => r.role_id === roleId)
            ? roleId
            : matchingRoles[0]?.role_id || validRoles[0]?.role_id);

        if (activeRole) setRoleId(activeRole);
      } catch (e) {
        console.warn("Failed to load metadata:", e);
      }
    }
    loadMetadata();
  }, [initialQuestion]);

  const availableRoles = useMemo(() => {
    if (!domainId) return roles;
    const filtered = roles.filter((r) => r.domain_id === domainId);
    return filtered.length > 0 ? filtered : roles;
  }, [roles, domainId]);

  const handleDomainChange = (v: string) => {
    const dId = Number(v);
    setDomainId(dId);
    const matchingRoles = roles.filter((r) => r.domain_id === dId);
    if (matchingRoles.length > 0) {
      setRoleId(matchingRoles[0].role_id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi phỏng vấn!");
      return;
    }

    setIsSubmitting(true);
    const followUps = [followUp1.trim(), followUp2.trim()].filter(Boolean);
    const tipsList = [tip1.trim(), tip2.trim()].filter(Boolean);

    let quizData: any = null;
    if (hasQuiz && quizQuestion.trim() && optA.trim() && optB.trim()) {
      quizData = {
        question: quizQuestion.trim(),
        options: [
          { id: "A", text: optA.trim(), is_correct: correctOpt === "A" },
          { id: "B", text: optB.trim(), is_correct: correctOpt === "B" },
          { id: "C", text: optC.trim(), is_correct: correctOpt === "C" },
          { id: "D", text: optD.trim(), is_correct: correctOpt === "D" },
        ].filter((o) => o.text.length > 0),
      };
    }

    try {
      if (isEdit && initialQuestion?.question_id) {
        await questionAdminApi.updateQuestion(initialQuestion.question_id, {
          domain_id: domainId,
          role_id: roleId,
          experience_level: experienceLevel,
          question_type: questionType,
          language,
          question_text: questionText.trim(),
          sample_answer: sampleAnswer.trim() || null,
          follow_up_questions: followUps.length > 0 ? followUps : null,
          tips: tipsList.length > 0 ? tipsList : null,
          quiz_data: quizData,
          is_active: isActive,
        });
        toast.success(`Đã cập nhật câu hỏi #${initialQuestion.question_id} thành công!`);
      } else {
        const created = await questionAdminApi.createQuestion({
          domain_id: domainId,
          role_id: roleId,
          experience_level: experienceLevel,
          question_type: questionType,
          language,
          question_text: questionText.trim(),
          sample_answer: sampleAnswer.trim() || null,
          follow_up_questions: followUps.length > 0 ? followUps : null,
          tips: tipsList.length > 0 ? tipsList : null,
          quiz_data: quizData,
        });
        toast.success(`Đã tạo mới câu hỏi #${created.question_id} vào ngân hàng câu hỏi!`);
      }

      router.push("/admin/questions");
    } catch (err: any) {
      toast.error(`Thao tác thất bại: ${err.message || "Lỗi máy chủ"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 lg:px-6 pb-12">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ngân hàng câu hỏi</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-semibold text-primary">
              {isEdit ? `Chỉnh sửa câu hỏi #${initialQuestion?.question_id}` : "Tạo câu hỏi lẻ mới"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? `Chỉnh Sửa Câu Hỏi Phỏng Vấn #${initialQuestion?.question_id}` : "Tạo Câu Hỏi Phỏng Vấn Đơn Lẻ"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEdit
              ? "Cập nhật nội dung câu hỏi, định hướng trả lời khung STAR và đáp án mẫu chuẩn mực."
              : "Thêm một câu hỏi chuyên sâu vào kho đề với đầy đủ thang chuẩn Rubric AI và đáp án mẫu benchmark."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/questions")}
            className="h-9 text-xs"
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Save className="size-3.5" />
            <span>{isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo câu hỏi ngay"}</span>
          </Button>
        </div>
      </div>

      {/* 1. Classification & Meta Configuration */}
      <Card className="shadow-xs border-muted/80 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                1. Phân Loại Ngành Nghề &amp; Vị Trí Ứng Tuyển
              </CardTitle>
              <CardDescription className="text-xs">
                Xác định đối tượng câu hỏi hướng tới để hệ thống gợi ý và phân loại chính xác.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5">
              Bắt buộc
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Row 1: 4 Equal Columns (25% each) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Col 1: Domain */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Ngành nghề tuyển dụng</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select
                value={domainId ? String(domainId) : ""}
                onValueChange={handleDomainChange}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn ngành nghề..." />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (
                    <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                      {d.domain_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Col 2: Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Vị trí chuyên môn</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select
                value={roleId ? String(roleId) : ""}
                onValueChange={(v) => setRoleId(Number(v))}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn vị trí..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.role_id} value={String(r.role_id)}>
                      {r.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Col 3: Level */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Cấp độ kinh nghiệm</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn cấp độ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern (Thực tập sinh)</SelectItem>
                  <SelectItem value="fresher">Fresher (Mới tốt nghiệp)</SelectItem>
                  <SelectItem value="junior">Junior (1 - 2 năm)</SelectItem>
                  <SelectItem value="mid">Middle (2 - 4 năm)</SelectItem>
                  <SelectItem value="senior">Senior (5+ năm)</SelectItem>
                  <SelectItem value="lead">Lead / Architect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Col 4: Language */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Ngôn ngữ phỏng vấn</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn ngôn ngữ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt (VI)</SelectItem>
                  <SelectItem value="en">English (EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Exactly 4 Equal Columns (25% each) - PERFECT ALIGNMENT with Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t">
            {/* Col 1: Question Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Dạng câu hỏi phỏng vấn</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select value={questionType} onValueChange={(v: any) => setQuestionType(v)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn dạng câu hỏi..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Kỹ thuật chuyên môn (Technical)</SelectItem>
                  <SelectItem value="situational">Xử lý tình huống (Situational)</SelectItem>
                  <SelectItem value="behavioral">Hành vi &amp; Văn hóa (Behavioral)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Col 2: Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Độ khó (1 - 5 sao)</Label>
              <Select value={String(difficulty)} onValueChange={(v) => setDifficulty(Number(v))}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn độ khó..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">★ 1 - Nhận biết căn bản</SelectItem>
                  <SelectItem value="2">★★ 2 - Thông hiểu nghiệp vụ</SelectItem>
                  <SelectItem value="3">★★★ 3 - Áp dụng thực tế</SelectItem>
                  <SelectItem value="4">★★★★ 4 - Xử lý sự cố</SelectItem>
                  <SelectItem value="5">★★★★★ 5 - Nâng cao / Chuyên sâu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Col 3: Active Status (Rendered as Select for identical height & styling) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Trạng thái phát hành</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(v) => setIsActive(v === "active")}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span>Đang kích hoạt (Hiển thị)</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <span className="size-2 rounded-full bg-muted-foreground/60 mr-0.5" />
                      <span>Tạm dừng (Ẩn)</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Col 4: Target Duration (Makes it 4 columns exactly matching Row 1) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Thời lượng trả lời gợi ý</Label>
              <Select defaultValue="3">
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">~2 phút (Trả lời nhanh)</SelectItem>
                  <SelectItem value="3">~3 phút (Chuẩn STAR)</SelectItem>
                  <SelectItem value="5">~5 phút (Chuyên sâu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Content & Intent */}
      <Card className="shadow-xs border-muted/80 bg-card">
        <CardHeader className="pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="size-4 text-primary" />
              2. Nội Dung Câu Hỏi &amp; Mục Tiêu Đánh Giá
            </CardTitle>
            <CardDescription className="text-xs">
              Nội dung câu hỏi phỏng vấn chính xác hiển thị cho ứng viên và mục tiêu khảo sát của nhà tuyển dụng.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="question_text" className="text-xs font-medium text-foreground flex items-center gap-1">
              <span>Nội dung câu hỏi phỏng vấn</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <textarea
              id="question_text"
              required
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ví dụ: Hãy kể về một lần bạn phát hiện một lỗi nghiêm trọng (critical bug) trên môi trường Production và các bước bạn đã giải quyết nó?"
              className="w-full rounded-lg border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intent" className="text-xs font-medium text-foreground">
              Mục tiêu đánh giá năng lực (Intent)
            </Label>
            <Input
              id="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Ví dụ: Khảo sát sự bình tĩnh, khả năng phân tích log, quy trình ứng cứu sự cố và tinh thần trách nhiệm."
              className="h-9 text-xs bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. STAR Framework Guidance */}
      <Card className="shadow-xs border-muted/80 bg-card">
        <CardHeader className="pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
              <Star className="size-4 text-primary" />
              3. Hướng Dẫn Cấu Trúc STAR Gợi Ý Cho Ứng Viên
            </CardTitle>
            <CardDescription className="text-xs">
              Các gợi ý chi tiết hiển thị trong phần thi tự luận để ứng viên triển khai câu trả lời theo đúng 4 bước.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Situation */}
            <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
              <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold grid place-items-center">S</span>
                <span>Tình huống (Situation)</span>
              </Label>
              <textarea
                rows={2}
                value={situationGuide}
                onChange={(e) => setSituationGuide(e.target.value)}
                placeholder="Gợi ý bối cảnh: Sự cố xảy ra lúc nào, hệ thống gì, ảnh hưởng ra sao..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Task */}
            <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
              <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold grid place-items-center">T</span>
                <span>Nhiệm vụ (Task)</span>
              </Label>
              <textarea
                rows={2}
                value={taskGuide}
                onChange={(e) => setTaskGuide(e.target.value)}
                placeholder="Gợi ý nhiệm vụ: Mục tiêu cần đạt được, vai trò cụ thể của bạn..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Action */}
            <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
              <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold grid place-items-center">A</span>
                <span>Hành động (Action)</span>
              </Label>
              <textarea
                rows={2}
                value={actionGuide}
                onChange={(e) => setActionGuide(e.target.value)}
                placeholder="Gợi ý hành động: Các bước kỹ thuật, công cụ debug, giải pháp tạm thời và triệt để..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Result */}
            <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
              <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold grid place-items-center">R</span>
                <span>Kết quả (Result)</span>
              </Label>
              <textarea
                rows={2}
                value={resultGuide}
                onChange={(e) => setResultGuide(e.target.value)}
                placeholder="Gợi ý kết quả: Hệ thống phục hồi sau bao lâu, số liệu định lượng, bài học rút ra..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Benchmark Sample Answer & Tips */}
      <Card className="shadow-xs border-muted/80 bg-card">
        <CardHeader className="pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
              <Lightbulb className="size-4 text-primary" />
              4. Đáp Án Mẫu Chuẩn (Benchmark STAR) &amp; Mẹo Phỏng Vấn
            </CardTitle>
            <CardDescription className="text-xs">
              Mô hình AI sẽ đối chiếu câu trả lời của ứng viên với đáp án mẫu này để chấm điểm độ chuẩn xác và chiều sâu kỹ thuật.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sample_answer" className="text-xs font-medium text-foreground">
              Đáp án mẫu đạt điểm tối đa (Benchmark Answer)
            </Label>
            <textarea
              id="sample_answer"
              rows={4}
              value={sampleAnswer}
              onChange={(e) => setSampleAnswer(e.target.value)}
              placeholder="Trình bày một câu trả lời mẫu hoàn chỉnh theo khung STAR có số liệu định lượng cụ thể..."
              className="w-full rounded-lg border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-normal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Câu hỏi đào sâu phỏng vấn (Follow-up)</Label>
              <Input
                value={followUp1}
                onChange={(e) => setFollowUp1(e.target.value)}
                placeholder="Câu hỏi đào sâu 1: Tại sao bạn không chọn giải pháp B?..."
                className="h-8 text-xs bg-background"
              />
              <Input
                value={followUp2}
                onChange={(e) => setFollowUp2(e.target.value)}
                placeholder="Câu hỏi đào sâu 2: Nếu lỗi tái diễn với quy mô gấp 10 lần thì sao?..."
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Mẹo phỏng vấn ghi điểm (Tips)</Label>
              <Input
                value={tip1}
                onChange={(e) => setTip1(e.target.value)}
                placeholder="Mẹo 1: Nhấn mạnh thái độ bình tĩnh và quy trình an toàn..."
                className="h-8 text-xs bg-background"
              />
              <Input
                value={tip2}
                onChange={(e) => setTip2(e.target.value)}
                placeholder="Mẹo 2: Đưa ra con số định lượng về thời gian và % phục hồi..."
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Optional Situational Quiz */}
      <Card className="shadow-xs border-muted/80 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
                <HelpCircle className="size-4 text-primary" />
                5. Trắc Nghiệm Tình Huống Khởi Động (15% Điểm - Tùy Chọn)
              </CardTitle>
              <CardDescription className="text-xs">
                Cho phép thí sinh chọn phương án xử lý tối ưu trước khi bước vào viết tự luận và ghi âm giọng nói.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant={hasQuiz ? "secondary" : "outline"}
              size="sm"
              onClick={() => setHasQuiz(!hasQuiz)}
              className="h-7 text-xs font-medium"
            >
              {hasQuiz ? "✓ Đã bật trắc nghiệm" : "+ Thêm câu trắc nghiệm"}
            </Button>
          </div>
        </CardHeader>

        {hasQuiz && (
          <CardContent className="space-y-3.5 pt-1 border-t animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Nội dung câu hỏi trắc nghiệm</Label>
              <Input
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                placeholder="Ví dụ: Khi phát hiện critical bug làm tăng đột biến tỉ lệ lỗi, bước xử lý ban đầu nào chuẩn xác nhất?"
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                { id: "A", val: optA, set: setOptA },
                { id: "B", val: optB, set: setOptB },
                { id: "C", val: optC, set: setOptC },
                { id: "D", val: optD, set: setOptD },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setCorrectOpt(item.id)}
                    className={`size-6 rounded-md font-bold text-xs shrink-0 flex items-center justify-center transition-colors ${
                      correctOpt === item.id
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={correctOpt === item.id ? "Đáp án đúng" : "Bấm để chọn làm đáp án đúng"}
                  >
                    {item.id}
                  </button>
                  <Input
                    value={item.val}
                    onChange={(e) => item.set(e.target.value)}
                    placeholder={`Phương án ${item.id}...`}
                    className="h-7 text-xs bg-background"
                  />
                  {correctOpt === item.id && (
                    <Badge variant="secondary" className="text-[10px] shrink-0 text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                      Đúng
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bottom Final Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-card shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span>
            Câu hỏi sẽ được lưu trữ và có thể bốc vào bất kỳ bộ đề thi tuyển dụng nào.
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/questions")}
            className="h-9 text-xs"
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Save className="size-3.5" />
            <span>{isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo câu hỏi ngay"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
