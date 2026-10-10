"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CvDocument, CvAtsScoreResponse } from "@/types/cv";
import { cvApi } from "@/services/cvApi";
import { CvTopBar } from "@/components/cv/CvTopBar";
import { TemplateRenderer } from "@/components/cv/templates/TemplateRenderer";
import { FloatingAiToolbar } from "@/components/cv/FloatingAiToolbar";
import { AtsScoreWidget } from "@/components/cv/AtsScoreWidget";
import { AiDraftModal } from "@/components/cv/AiDraftModal";
import {
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Plus,
} from "lucide-react";
import s from "./cvBuilder.module.css";

const AVATAR_STORAGE_KEY = "interviewly_cv_avatar";

const BLANK_CV: CvDocument = {
  id: 0,
  user_id: 0,
  template_id: "modern_tech",
  title: "",
  color_theme: "navy",
  font_family: "inter",
  personal_info: {
    full_name: "",
    email: "",
    phone: "",
    title: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    avatar_url: "",
  },
  summary: "",
  work_experiences: [],
  projects: [],
  skills: [],
  educations: [],
  certifications: [],
  section_order: ["summary", "experience", "projects", "skills", "education", "certifications"],
  ats_score: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function CvBuilderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cvIdParam = searchParams.get("id");
  const jobIdParam = searchParams.get("jobId");

  const [cv, setCv] = useState<CvDocument>(BLANK_CV);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [showAtsSidebar, setShowAtsSidebar] = useState(true);
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);

  const [selection, setSelection] = useState<{
    text: string;
    rect: DOMRect | null;
    sectionContext: string;
  } | null>(null);

  const [atsScoreData, setAtsScoreData] = useState<CvAtsScoreResponse | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load saved avatar from localStorage on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar) {
      setCv((prev) => ({
        ...prev,
        personal_info: { ...prev.personal_info, avatar_url: savedAvatar },
      }));
    }
  }, []);

  // Load or initialize CV
  useEffect(() => {
    async function initCv() {
      setLoading(true);
      try {
        if (cvIdParam) {
          const fetched = await cvApi.getCv(Number(cvIdParam));
          setCv(fetched);
          if (fetched.ats_feedback) setAtsScoreData(fetched.ats_feedback);
        } else if (jobIdParam) {
          const created = await cvApi.createCv({
            title: `CV Ứng Tuyển - ${new Date().toLocaleDateString("vi-VN")}`,
            target_job_id: jobIdParam,
            load_from_user_skills: true,
          });
          setCv(created);
          router.replace(`/cv-builder?id=${created.id}`);
        } else {
          const list = await cvApi.listCvs();
          if (list.length > 0) {
            const latest = await cvApi.getCv(list[0].id);
            setCv(latest);
            router.replace(`/cv-builder?id=${latest.id}`);
          } else {
            const created = await cvApi.createCv({
              title: "",
              load_from_user_skills: true,
            });
            setCv(created);
            router.replace(`/cv-builder?id=${created.id}`);
          }
        }
      } catch (err) {
        console.warn("Failed to load CV from server, using blank template:", err);
        // Restore avatar from localStorage even for fallback
        const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
        if (savedAvatar) {
          setCv((prev) => ({
            ...prev,
            personal_info: { ...prev.personal_info, avatar_url: savedAvatar },
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    initCv();
  }, [cvIdParam, jobIdParam, router]);

  const handleUpdate = useCallback((updated: Partial<CvDocument>) => {
    setCv((prev) => ({
      ...prev,
      ...updated,
      updated_at: new Date().toISOString(),
    }));
  }, []);

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

  const handleTextSelect = (sel: { text: string; rect: DOMRect; sectionContext: string }) => {
    setSelection(sel);
  };

  const handleApplyReplacement = (newText: string) => {
    if (!selection) return;
    const oldText = selection.text;

    if (cv.summary && cv.summary.includes(oldText)) {
      handleUpdate({ summary: cv.summary.replace(oldText, newText) });
      setSelection(null);
      return;
    }

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

  const handleAddSkill = (skill: string) => {
    if (!cv.skills.includes(skill)) {
      handleUpdate({ skills: [...cv.skills, skill] });
    }
  };

  const handleApplyDraft = (draft: Partial<CvDocument>) => {
    handleUpdate({
      ...draft,
      title: draft.title || cv.title,
      template_id: cv.template_id,
      color_theme: cv.color_theme,
      font_family: cv.font_family,
    });
  };

  // Avatar upload handler — save to localStorage for next CV session
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Save to localStorage for persistence across CV sessions
      localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
      handleUpdate({
        personal_info: { ...cv.personal_info, avatar_url: dataUrl },
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className={s.loadingContainer}>
        <Loader2 className={`${s.loadingSpinner} animate-spin`} style={{ width: 32, height: 32 }} />
        <p className={s.loadingText}>Đang khởi tạo không gian thiết kế CV...</p>
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      {/* LEFT VERTICAL SIDEBAR TOOLBAR */}
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
      <div className={s.workspace}>
        <main className={s.canvas}>
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            className={s.canvasZoomWrapper}
          >
            {/* Avatar Upload Circle — positioned above the CV template */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div
                className={s.avatarUpload}
                onClick={() => avatarInputRef.current?.click()}
                title="Tải lên ảnh đại diện"
              >
                {cv.personal_info.avatar_url ? (
                  <img
                    src={cv.personal_info.avatar_url}
                    alt="Avatar"
                    className={s.avatarUploadImage}
                  />
                ) : (
                  <div className={s.avatarUploadPlaceholder}>
                    <Plus className={s.avatarUploadIcon} />
                    <span className={s.avatarUploadLabel}>Ảnh</span>
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className={s.avatarHiddenInput}
                />
              </div>
            </div>

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

        {/* RIGHT DRAWER: ATS Analysis */}
        <aside
          className={`${s.atsSidebar} ${showAtsSidebar ? s.atsSidebarOpen : s.atsSidebarClosed}`}
          style={{ display: "none" }}
          ref={(el) => { if (el) el.style.display = "flex"; }}
        >
          <button
            onClick={() => setShowAtsSidebar(!showAtsSidebar)}
            className={s.atsSidebarToggle}
            title={showAtsSidebar ? "Thu gọn phân tích ATS" : "Mở phân tích ATS"}
          >
            {showAtsSidebar ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
          </button>

          <div className={s.atsSidebarBody}>
            <AtsScoreWidget
              scoreData={atsScoreData}
              score={cv.ats_score}
              loading={atsLoading}
              onRefresh={handleRefreshAts}
              onAddSkill={handleAddSkill}
            />

            <div className={s.tipsCard}>
              <h4 className={s.tipsTitle}>
                <Sparkles className={s.tipsTitleIcon} style={{ width: 14, height: 14 }} />
                <span>Mẹo tối ưu hóa với AI</span>
              </h4>
              <ul className={s.tipsList}>
                <li className={s.tipsItem}>Bôi đen bất kỳ đoạn văn nào để AI viết lại chuẩn STAR có số liệu %.</li>
                <li className={s.tipsItem}>Nhấp trực tiếp vào tên, chức danh, kỹ năng để sửa trực tiếp.</li>
                <li className={s.tipsItem}>Thêm từ khóa còn thiếu từ bảng ATS để tăng tỷ lệ được mời phỏng vấn.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <AiDraftModal
        isOpen={showAiDraftModal}
        onClose={() => setShowAiDraftModal(false)}
        onApplyDraft={handleApplyDraft}
        currentCv={cv}
      />
    </div>
  );
}
