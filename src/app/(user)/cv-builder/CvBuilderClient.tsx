"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CvDocument, CvAtsScoreResponse } from "@/types/cv";
import { cvApi } from "@/services/cvApi";
import { CvTopBar } from "@/components/cv/CvTopBar";
import { TemplateRenderer } from "@/components/cv/templates/TemplateRenderer";
import { FloatingAiToolbar } from "@/components/cv/FloatingAiToolbar";
import { AtsScoreWidget } from "@/components/cv/AtsScoreWidget";
import { AiDraftModal } from "@/components/cv/AiDraftModal";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { Loader2 } from "lucide-react";
import s from "./cvBuilder.module.css";

const DRAFT_STORAGE_KEY = "interviewly_cv_active_draft";
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
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);

  const [selection, setSelection] = useState<{
    text: string;
    rect: DOMRect | null;
    sectionContext: string;
  } | null>(null);

  const [atsScoreData, setAtsScoreData] = useState<CvAtsScoreResponse | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // Load or initialize CV with LocalStorage Cache Persistence
  useEffect(() => {
    async function initCv() {
      setLoading(true);

      // Đọc cached draft và saved avatar từ localStorage để đề phòng F5
      let cachedDraft: CvDocument | null = null;
      try {
        const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (rawDraft) {
          cachedDraft = JSON.parse(rawDraft);
        }
      } catch (err) {
        console.warn("Could not parse cached draft:", err);
      }

      const savedAvatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_STORAGE_KEY) : null;

      try {
        if (cvIdParam) {
          try {
            const fetched = await cvApi.getCv(Number(cvIdParam));
            if (!fetched.personal_info.avatar_url && savedAvatar) {
              fetched.personal_info.avatar_url = savedAvatar;
            }
            setCv(fetched);
            if (fetched.ats_feedback) setAtsScoreData(fetched.ats_feedback);
          } catch (err) {
            console.warn("Failed to fetch cv from server:", err);
            if (cachedDraft && String(cachedDraft.id) === cvIdParam) {
              setCv(cachedDraft);
            }
          }
        } else if (jobIdParam) {
          try {
            const created = await cvApi.createCv({
              title: `CV Ứng Tuyển - ${new Date().toLocaleDateString("vi-VN")}`,
              target_job_id: jobIdParam,
              load_from_user_skills: true,
            });
            if (!created.personal_info.avatar_url && savedAvatar) {
              created.personal_info.avatar_url = savedAvatar;
            }
            setCv(created);
            router.replace(`/cv-builder?id=${created.id}`);
          } catch {
            // Offline / fallback: dùng cached draft nếu có hoặc BLANK_CV
            if (cachedDraft) {
              setCv(cachedDraft);
            } else {
              setCv({
                ...BLANK_CV,
                target_job_id: jobIdParam,
                personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
              });
            }
          }
        } else {
          // Trường hợp không có query param:
          // Nếu có bản nháp trong localStorage, khôi phục ngay để F5 không bị mất
          if (cachedDraft && (cachedDraft.personal_info.full_name || cachedDraft.summary || cachedDraft.work_experiences.length > 0 || cachedDraft.skills.length > 0)) {
            if (!cachedDraft.personal_info.avatar_url && savedAvatar) {
              cachedDraft.personal_info.avatar_url = savedAvatar;
            }
            setCv(cachedDraft);
            if (cachedDraft.ats_feedback) setAtsScoreData(cachedDraft.ats_feedback);
          } else {
            // Thử lấy danh sách CV từ backend
            try {
              const list = await cvApi.listCvs();
              if (list.length > 0) {
                const latest = await cvApi.getCv(list[0].id);
                if (!latest.personal_info.avatar_url && savedAvatar) {
                  latest.personal_info.avatar_url = savedAvatar;
                }
                setCv(latest);
                router.replace(`/cv-builder?id=${latest.id}`);
              } else {
                const created = await cvApi.createCv({
                  title: "",
                  load_from_user_skills: true,
                });
                if (!created.personal_info.avatar_url && savedAvatar) {
                  created.personal_info.avatar_url = savedAvatar;
                }
                setCv(created);
                router.replace(`/cv-builder?id=${created.id}`);
              }
            } catch {
              setCv({
                ...BLANK_CV,
                personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
              });
            }
          }
        }
      } catch (err) {
        console.warn("Init CV error:", err);
      } finally {
        setLoading(false);
      }
    }

    initCv();
  }, [cvIdParam, jobIdParam, router]);

  // Tự động cache CV vào localStorage khi có thay đổi (F5 không mất dữ liệu)
  useEffect(() => {
    if (!loading && cv) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(cv));
      } catch (err) {
        console.warn("Could not save active draft to localStorage:", err);
      }
    }
  }, [cv, loading]);

  const handleUpdate = useCallback((updated: Partial<CvDocument>) => {
    setCv((prev) => ({
      ...prev,
      ...updated,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const handleSave = async () => {
    if (!cv.id) {
      // Nếu chưa có id backend (đang offline hoặc chưa tạo trên BE), thử tạo mới
      try {
        setSaving(true);
        const created = await cvApi.createCv({
          title: cv.title || "CV Của Tôi",
          template_id: cv.template_id,
          color_theme: cv.color_theme,
          font_family: cv.font_family,
          target_job_id: cv.target_job_id,
        });
        const fullSaved = await cvApi.updateCv(created.id, {
          title: cv.title || created.title,
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
        setCv(fullSaved);
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fullSaved));
        router.replace(`/cv-builder?id=${fullSaved.id}`);
      } catch (err) {
        console.error("Create & save error:", err);
      } finally {
        setSaving(false);
      }
      return;
    }

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
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(saved));
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
      {/* LEFT VERTICAL LIQUID GLASS TOOLBAR */}
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

        {/* FIXED VIEWPORT ATS CARD WITH MASCOT */}
        <div className={s.atsFloatingContainer}>
          {/* MASCOT STANDING PROUDLY ON TOP */}
          <div className={s.atsMascotWrapper}>
            <PageMascot size={78} />
          </div>

          {/* ATS SCORE CARD */}
          <div className={s.atsCardWrapper}>
            <AtsScoreWidget
              scoreData={atsScoreData}
              score={cv.ats_score}
              loading={atsLoading}
              onRefresh={handleRefreshAts}
              onAddSkill={handleAddSkill}
            />
          </div>
        </div>
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
