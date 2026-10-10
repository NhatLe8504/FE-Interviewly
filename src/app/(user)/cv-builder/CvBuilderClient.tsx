"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CvDocument, CvTemplateId, CvColorTheme, CvFontFamily, CvAtsScoreResponse } from "@/types/cv";
import { cvApi } from "@/services/cvApi";
import { CvTopBar } from "@/components/cv/CvTopBar";
import { TemplateRenderer } from "@/components/cv/templates/TemplateRenderer";
import { FloatingAiToolbar } from "@/components/cv/FloatingAiToolbar";
import { AtsScoreWidget } from "@/components/cv/AtsScoreWidget";
import { AiDraftModal } from "@/components/cv/AiDraftModal";
import {
  Sparkles,
  BarChart3,
  Loader2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Plus,
  Briefcase,
  History,
} from "lucide-react";

const INITIAL_FALLBACK_CV: CvDocument = {
  id: 0,
  user_id: 1,
  template_id: "modern_tech",
  title: "CV Chuyên Nghiệp - Bản Chuẩn",
  color_theme: "navy",
  font_family: "inter",
  personal_info: {
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 912 345 678",
    title: "Senior Fullstack Engineer",
    location: "Hà Nội, Việt Nam",
    linkedin: "linkedin.com/in/nguyenvana",
    github: "github.com/nguyenvana",
    portfolio: "https://portfolio.dev",
    avatar_url: "",
  },
  summary:
    "Kỹ sư phần mềm giàu kinh nghiệm với thế mạnh về kiến trúc hệ thống phân tán, xử lý tải cao và phát triển ứng dụng hiện đại. Thành thạo TypeScript, React, Next.js, Node.js, FastAPI, PostgreSQL và Docker. Đam mê tối ưu hóa trải nghiệm người dùng, tự động hóa quy trình CI/CD và luôn hướng tới việc tạo ra giá trị kinh doanh thực tế.",
  work_experiences: [
    {
      id: "exp-1",
      company: "Tech Innovation Corp",
      role: "Senior Fullstack Engineer",
      location: "Hà Nội, Việt Nam",
      start_date: "2023-01",
      end_date: "",
      is_current: true,
      description: "Chịu trách nhiệm kiến trúc nền tảng và phát triển hệ thống lõi phục vụ hơn 200,000 người dùng hàng tháng.",
      highlights: [
        "Tái cấu trúc kiến trúc microservices giúp giảm 45% thời gian phản hồi API (p99 latency từ 850ms xuống 460ms).",
        "Thiết kế và triển khai pipeline CI/CD tự động hoá với Docker và GitHub Actions, rút ngắn chu kỳ deploy từ 2 giờ xuống 15 phút.",
        "Dẫn dắt đội ngũ 6 kỹ sư, triển khai quy chuẩn Unit & Integration Testing nâng cao code coverage từ 55% lên 88%.",
      ],
    },
    {
      id: "exp-2",
      company: "VTI Cloud Solutions",
      role: "Backend Engineer",
      location: "Hà Nội, Việt Nam",
      start_date: "2021-06",
      end_date: "2022-12",
      is_current: false,
      description: "Tham gia phát triển các sản phẩm SaaS và tích hợp hệ thống thanh toán điện tử.",
      highlights: [
        "Xây dựng tính năng thanh toán đa cổng kết nối xử lý thành công 50,000+ giao dịch mỗi ngày với độ ổn định 99.98%.",
        "Tối ưu hóa các truy vấn PostgreSQL và lập chỉ mục (indexing), giảm tải database 30% trong giờ cao điểm.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "High-Throughput E-Commerce Platform",
      role: "Lead Architect & Developer",
      start_date: "2023-05",
      end_date: "2023-11",
      technologies: ["Next.js", "FastAPI", "PostgreSQL", "Redis", "Kafka"],
      link: "https://github.com/project/demo",
      description: "Nền tảng thương mại điện tử chịu tải cao với khả năng đồng bộ kho hàng theo thời gian thực.",
      highlights: [
        "Triển khai cơ chế cache đa tầng với Redis giúp chịu tải 10,000 req/s trong các đợt flash sale.",
        "Áp dụng Clean Architecture và Domain-Driven Design giúp việc mở rộng tính năng mới nhanh hơn 35%.",
      ],
    },
    {
      id: "proj-2",
      name: "AI Interview Coach Assistant",
      role: "Core AI & Backend Engineer",
      start_date: "2024-01",
      end_date: "2024-06",
      technologies: ["Python", "FastAPI", "WebSockets", "Groq LPU", "WebRTC"],
      link: "https://github.com/project/interview-coach",
      description: "Hệ thống luyện phỏng vấn thông minh với phản hồi giọng nói thời gian thực dưới 300ms.",
      highlights: [
        "Tích hợp mô hình ngôn ngữ lớn LLM và Edge TTS để sinh phản hồi phỏng vấn mượt mà theo phương pháp STAR.",
        "Xây dựng pipeline phân tích chỉ số ATS và phát hiện lỗ hổng kỹ năng của ứng viên tự động.",
      ],
    },
  ],
  skills: [
    "TypeScript",
    "React / Next.js",
    "Node.js",
    "Python / FastAPI",
    "PostgreSQL",
    "Redis",
    "Docker / K8s",
    "CI/CD Pipeline",
    "Microservices",
    "RESTful APIs",
    "System Architecture",
  ],
  educations: [
    {
      id: "edu-1",
      institution: "Đại học Bách Khoa Hà Nội",
      degree: "Kỹ sư",
      field_of_study: "Công nghệ Thông tin",
      start_date: "2018",
      end_date: "2022",
      gpa: "3.5/4.0",
      honors: "Tốt nghiệp loại Giỏi",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      issue_date: "2023-08",
      expiration_date: "2026-08",
      credential_id: "AWS-PSA-894721",
      url: "https://aws.amazon.com",
    },
  ],
  section_order: ["summary", "experience", "projects", "skills", "education", "certifications"],
  ats_score: 88,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function CvBuilderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cvIdParam = searchParams.get("id");
  const jobIdParam = searchParams.get("jobId");

  const [cv, setCv] = useState<CvDocument>(INITIAL_FALLBACK_CV);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [showAtsSidebar, setShowAtsSidebar] = useState(true);
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);

  // Text selection state for Floating AI Toolbar
  const [selection, setSelection] = useState<{
    text: string;
    rect: DOMRect | null;
    sectionContext: string;
  } | null>(null);

  // ATS score state
  const [atsScoreData, setAtsScoreData] = useState<CvAtsScoreResponse | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // Load or initialize CV
  useEffect(() => {
    async function initCv() {
      setLoading(true);
      try {
        if (cvIdParam) {
          const fetched = await cvApi.getCv(Number(cvIdParam));
          setCv(fetched);
          if (fetched.ats_feedback) {
            setAtsScoreData(fetched.ats_feedback);
          }
        } else if (jobIdParam) {
          // Initialize CV targeted to this job
          const created = await cvApi.createCv({
            title: `CV Ứng Tuyển - ${new Date().toLocaleDateString("vi-VN")}`,
            target_job_id: jobIdParam,
            load_from_user_skills: true,
          });
          setCv(created);
          router.replace(`/cv-builder?id=${created.id}`);
        } else {
          // Check if user has an existing CV, else create a new one
          const list = await cvApi.listCvs();
          if (list.length > 0) {
            const latest = await cvApi.getCv(list[0].id);
            setCv(latest);
            router.replace(`/cv-builder?id=${latest.id}`);
          } else {
            const created = await cvApi.createCv({
              title: "My Professional Tech CV",
              load_from_user_skills: true,
            });
            setCv(created);
            router.replace(`/cv-builder?id=${created.id}`);
          }
        }
      } catch (err) {
        console.warn("Failed to load CV from server, using local template:", err);
      } finally {
        setLoading(false);
      }
    }

    initCv();
  }, [cvIdParam, jobIdParam, router]);

  // Update CV in state
  const handleUpdate = useCallback((updated: Partial<CvDocument>) => {
    setCv((prev) => ({
      ...prev,
      ...updated,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  // Save CV to backend
  const handleSave = async () => {
    if (!cv.id) return;
    setSaving(true);
    try {
      const saved = await cvApi.updateCv(cv.id, {
        title: cv.title,
        template_id: cv.template_id,
        color_theme: cv.color_theme,
        font_family: cv.font_family,
        personal_info: cv.personal_info,
        summary: cv.summary,
        work_experiences: cv.work_experiences,
        projects: cv.projects,
        skills: cv.skills,
        educations: cv.educations,
        certifications: cv.certifications,
        section_order: cv.section_order,
        target_job_id: cv.target_job_id,
      });
      setCv(saved);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Text selection handler triggered from inside EditableText
  const handleTextSelect = (sel: { text: string; rect: DOMRect; sectionContext: string }) => {
    setSelection(sel);
  };

  // Replace selected text with refined version
  const handleApplyReplacement = (newText: string) => {
    if (!selection) return;

    // Direct replacement in summary or highlights
    const oldText = selection.text;

    // Check summary
    if (cv.summary && cv.summary.includes(oldText)) {
      handleUpdate({ summary: cv.summary.replace(oldText, newText) });
      setSelection(null);
      return;
    }

    // Check work experiences
    const updatedExps = cv.work_experiences.map((exp) => {
      const newHighlights = exp.highlights.map((hl) =>
        hl.includes(oldText) ? hl.replace(oldText, newText) : hl
      );
      const newDesc = exp.description?.includes(oldText)
        ? exp.description.replace(oldText, newText)
        : exp.description;
      return { ...exp, highlights: newHighlights, description: newDesc };
    });
    handleUpdate({ work_experiences: updatedExps });

    // Check projects
    const updatedProjs = cv.projects.map((proj) => {
      const newHighlights = proj.highlights.map((hl) =>
        hl.includes(oldText) ? hl.replace(oldText, newText) : hl
      );
      const newDesc = proj.description?.includes(oldText)
        ? proj.description.replace(oldText, newText)
        : proj.description;
      return { ...proj, highlights: newHighlights, description: newDesc };
    });
    handleUpdate({ projects: updatedProjs });

    setSelection(null);
  };

  // Calculate ATS score
  const handleRefreshAts = async () => {
    if (!cv.id) return;
    setAtsLoading(true);
    try {
      const res = await cvApi.calculateAtsScore(cv.id, cv.target_job_id);
      setAtsScoreData(res);
      handleUpdate({ ats_score: res.ats_score });
    } catch (err) {
      console.error("ATS check error:", err);
    } finally {
      setAtsLoading(false);
    }
  };

  // Append missing keyword from ATS widget to CV skills
  const handleAddSkill = (skill: string) => {
    if (!cv.skills.includes(skill)) {
      handleUpdate({ skills: [...cv.skills, skill] });
    }
  };

  // Apply AI Draft into current CV
  const handleApplyDraft = (draft: Partial<CvDocument>) => {
    handleUpdate({
      ...draft,
      title: draft.title || cv.title,
      template_id: cv.template_id,
      color_theme: cv.color_theme,
      font_family: cv.font_family,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Đang khởi tạo không gian thiết kế CV AI...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* TOP CONTROL BAR */}
      <CvTopBar
        cv={cv}
        onUpdate={handleUpdate}
        onSave={handleSave}
        saving={saving}
        onGenerateAiDraft={() => setShowAiDraftModal(true)}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CENTER: Canvas A4 Paper Sheet with zoom scale */}
        <main className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 w-full flex justify-center"
          >
            <TemplateRenderer
              cv={cv}
              onUpdate={handleUpdate}
              isEditable={true}
              onTextSelect={handleTextSelect}
            />
          </div>
        </main>

        {/* FLOATING AI SELECTION TOOLBAR */}
        {selection && (
          <FloatingAiToolbar
            selectedText={selection.text}
            anchorRect={selection.rect}
            sectionContext={selection.sectionContext}
            targetJobId={cv.target_job_id}
            onApply={handleApplyReplacement}
            onClose={() => setSelection(null)}
          />
        )}

        {/* RIGHT DRAWER: ATS Analysis & Guidance */}
        <aside
          className={`print:hidden fixed lg:relative right-0 top-[53px] lg:top-0 h-[calc(100vh-53px)] lg:h-auto z-30 transition-all duration-300 flex ${
            showAtsSidebar ? "w-80 md:w-96" : "w-0"
          }`}
        >
          {/* Toggle Tab */}
          <button
            onClick={() => setShowAtsSidebar(!showAtsSidebar)}
            className="absolute -left-9 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-l-xl shadow-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
            title={showAtsSidebar ? "Thu gọn phân tích ATS" : "Mở phân tích ATS"}
          >
            {showAtsSidebar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Sidebar Body */}
          <div className="w-full h-full bg-slate-50/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-4">
            <AtsScoreWidget
              scoreData={atsScoreData}
              score={cv.ats_score}
              loading={atsLoading}
              onRefresh={handleRefreshAts}
              onAddSkill={handleAddSkill}
            />

            {/* Quick Tips */}
            <div className="bg-white/80 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Mẹo tối ưu hóa với AI</span>
              </h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>Bôi đen bất kỳ đoạn văn nào để AI viết lại chuẩn STAR có số liệu %.</li>
                <li>Nhấp trực tiếp vào tên công ty, chức danh, kỹ năng để sửa trực tiếp.</li>
                <li>Thêm từ khóa còn thiếu từ bảng ATS để tăng tỷ lệ được mời phỏng vấn.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* AI DRAFT MODAL */}
      <AiDraftModal
        isOpen={showAiDraftModal}
        onClose={() => setShowAiDraftModal(false)}
        onApplyDraft={handleApplyDraft}
        currentCv={cv}
      />
    </div>
  );
}
