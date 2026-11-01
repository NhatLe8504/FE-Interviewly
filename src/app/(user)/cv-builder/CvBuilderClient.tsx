"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CvDocument, CvAtsScoreResponse, CvListItem } from "@/types/cv";
import { cvApi } from "@/services/cvApi";
import { CvTopBar } from "@/components/cv/CvTopBar";
import { TemplateRenderer } from "@/components/cv/templates/TemplateRenderer";
import { FloatingAiToolbar } from "@/components/cv/FloatingAiToolbar";
import type { CvTextSelection } from "@/components/cv/EditableText";
import { AtsScoreWidget } from "@/components/cv/AtsScoreWidget";
import { AiDraftModal } from "@/components/cv/AiDraftModal";
import { PageMascot } from "@/components/user-component/common/PageMascot";
import { CvCardDeck } from "@/components/cv/CvCardDeck";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { toast } from "@/components/user-component/toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
  const [cvList, setCvList] = useState<CvListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);

  const { isSubscribed } = useUserSubscription();
  const isFirstLoadDone = useRef(false);

  const [selection, setSelection] = useState<CvTextSelection | null>(null);

  const [atsScoreData, setAtsScoreData] = useState<CvAtsScoreResponse | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // Fetch list of user's CVs (Max 5 slots)
  const fetchCvList = useCallback(async () => {
    try {
      const list = await cvApi.listCvs();
      setCvList(list);
      return list;
    } catch (err) {
      console.warn("Could not fetch cv list:", err);
      return [];
    }
  }, []);

  // Sync browser URL without causing page reload/flickering
  const syncUrl = useCallback((path: string) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", path);
    }
  }, []);

  // Load or initialize CV with LocalStorage Cache Persistence
  // CHỈ chạy loading spinner ở lần tải trang ĐẦU TIÊN
  useEffect(() => {
    if (isFirstLoadDone.current) return;
    if (jobIdParam && !cvIdParam) {
      router.replace(`/cv-builder/setup?jobId=${encodeURIComponent(jobIdParam)}`);
      return;
    }

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
        const currentList = await fetchCvList();

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
            setLoadError(err instanceof Error ? err.message : "Không thể tải CV từ máy chủ.");
          }
        } else {
          // Trường hợp không có param:
          if (cachedDraft && (cachedDraft.personal_info.full_name || cachedDraft.summary || cachedDraft.work_experiences.length > 0 || cachedDraft.skills.length > 0)) {
            if (!cachedDraft.personal_info.avatar_url && savedAvatar) {
              cachedDraft.personal_info.avatar_url = savedAvatar;
            }
            setCv(cachedDraft);
            if (cachedDraft.ats_feedback) setAtsScoreData(cachedDraft.ats_feedback);
          } else if (currentList.length > 0) {
            try {
              const latest = await cvApi.getCv(currentList[0].id);
              if (!latest.personal_info.avatar_url && savedAvatar) {
                latest.personal_info.avatar_url = savedAvatar;
              }
              setCv(latest);
              syncUrl(`/cv-builder?id=${latest.id}`);
            } catch {
              setCv({
                ...BLANK_CV,
                personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
              });
            }
          } else {
            setCv({
              ...BLANK_CV,
              personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
            });
          }
        }
      } catch (err) {
        console.warn("Init CV error:", err);
      } finally {
        isFirstLoadDone.current = true;
        setLoading(false);
      }
    }

    initCv();
  }, [cvIdParam, jobIdParam, fetchCvList, syncUrl, router]);

  // Tự động cache CV vào localStorage khi có thay đổi (F5 không mất dữ liệu)
  useEffect(() => {
    if (!loading && !loadError && cv) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(cv));
      } catch (err) {
        console.warn("Could not save active draft to localStorage:", err);
      }
    }
  }, [cv, loading, loadError]);

  const handleUpdate = useCallback((updated: Partial<CvDocument>) => {
    setCv((prev) => ({
      ...prev,
      ...updated,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  // Save CV: Pro plan only, max 5 CVs, no full-page re-mount
  const handleSave = async () => {
    // 1. Kiểm tra tài khoản Pro
    if (!isSubscribed) {
      toast.error(
        "Tài khoản Free không hỗ trợ lưu CV trên hệ thống. Vui lòng nâng cấp gói Pro để lưu trữ tối đa 5 bản CV!"
      );
      return;
    }

    // 2. Kiểm tra giới hạn 5 CV nếu đang tạo CV mới
    if (cv.id === 0 && cvList.length >= 5) {
      toast.error(
        "Bạn đã lưu tối đa 5 bản CV. Vui lòng chọn một bản hiện có để cập nhật hoặc xóa bớt để tạo bản mới!"
      );
      return;
    }

    setSaving(true);
    try {
      if (cv.id === 0) {
        // Tạo mới CV trên hệ thống
        const created = await cvApi.createCv({
          title: cv.title || "CV Mới Của Tôi",
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
        await fetchCvList();
        syncUrl(`/cv-builder?id=${fullSaved.id}`);
        toast.success("Đã lưu bản CV mới thành công!");
      } else {
        // Cập nhật CV đã tồn tại
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
        await fetchCvList();
        toast.success("Đã cập nhật bản CV thành công!");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      if (err?.message?.includes("missing bearer token") || err?.status === 401) {
        toast.error("Vui lòng đăng nhập để lưu CV lên hệ thống!");
      } else {
        toast.error(err?.message || "Không thể lưu CV. Vui lòng kiểm tra lại kết nối!");
      }
    } finally {
      setSaving(false);
    }
  };

  // Switch to another CV from deck (Không kích hoạt loading spinner toàn trang)
  const handleSelectCv = async (id: number) => {
    if (cv.id === id) return;
    try {
      const fetched = await cvApi.getCv(id);
      setCv(fetched);
      if (fetched.ats_feedback) setAtsScoreData(fetched.ats_feedback);
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fetched));
      syncUrl(`/cv-builder?id=${id}`);
      toast.info(`Đã mở bản: ${fetched.title || "CV"}`);
    } catch (err) {
      toast.error("Không thể tải bản CV này");
    }
  };

  // Create a new blank CV slot (Không reload, không nháy giao diện)
  const handleCreateNew = () => {
    if (!isSubscribed) {
      toast.error("Tài khoản Free không hỗ trợ lưu nhiều bản CV. Vui lòng nâng cấp gói Pro!");
      return;
    }
    if (cvList.length >= 5) {
      toast.error("Bạn đã sử dụng hết 5/5 slot CV. Hãy xóa bớt một bản để tạo mới!");
      return;
    }

    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_STORAGE_KEY) : null;
    const newDraft: CvDocument = {
      ...BLANK_CV,
      id: 0,
      title: `Bản CV #${cvList.length + 1}`,
      personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
    };
    setCv(newDraft);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newDraft));
    syncUrl("/cv-builder");
    toast.success("Đã khởi tạo bản CV mới. Nhập thông tin và bấm Lưu CV!");
  };

  // Delete a CV from deck or clear draft
  const handleDeleteCv = async (id: number) => {
    if (!id || id <= 0) {
      const savedAvatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_STORAGE_KEY) : null;
      const freshDraft: CvDocument = {
        ...BLANK_CV,
        id: 0,
        title: "Bản CV #1",
        personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
      };
      setCv(freshDraft);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      syncUrl("/cv-builder");
      toast.success("Đã xóa bản thảo CV thành công!");
      return;
    }

    const target = cvList.find((c) => c.id === id);
    const title = target?.title || "Bản CV này";
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${title}" không? Hành động này sẽ giải phóng 1 slot CV.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await cvApi.deleteCv(id);
      toast.success("Đã xóa bản CV thành công!");

      // Optimistically remove from state immediately
      const updatedList = cvList.filter((c) => c.id !== id);
      setCvList(updatedList);

      // If active CV was the deleted one, switch to next or reset to clean draft
      if (cv.id === id) {
        if (updatedList.length > 0) {
          try {
            const nextCv = await cvApi.getCv(updatedList[0].id);
            setCv(nextCv);
            syncUrl(`/cv-builder?id=${nextCv.id}`);
          } catch {
            setCv({
              ...BLANK_CV,
              id: updatedList[0].id,
              title: updatedList[0].title,
            });
            syncUrl(`/cv-builder?id=${updatedList[0].id}`);
          }
        } else {
          const savedAvatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_STORAGE_KEY) : null;
          const freshDraft: CvDocument = {
            ...BLANK_CV,
            id: 0,
            title: "Bản CV #1",
            personal_info: { ...BLANK_CV.personal_info, avatar_url: savedAvatar || "" },
          };
          setCv(freshDraft);
          try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          } catch {}
          syncUrl("/cv-builder");
        }
      }

      // Background re-fetch to sync
      fetchCvList().catch(console.warn);
    } catch (err: any) {
      console.error("Delete CV error:", err);
      const errMsg = err?.message || err?.data?.detail || "Không thể xóa bản CV. Vui lòng thử lại!";
      toast.error(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpgradeRequired = () => {
    toast.info("Tính năng lưu và quản lý 5 bản CV dành cho tài khoản Pro!");
  };

  const handleTextSelect = (selected: CvTextSelection) => {
    setSelection(selected);
  };

  const handleApplyReplacement = (newText: string): boolean => {
    if (!selection?.replaceSelectedText(newText)) {
      toast.error("Đoạn văn đã thay đổi. Vui lòng chọn lại để chỉnh bằng AI.");
      setSelection(null);
      return false;
    }
    setSelection(null);
    return true;
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

  if (loadError) {
    return <div className={s.loadingContainer} role="alert">
      <p className={s.loadingText}>Không thể mở CV: {loadError}</p>
      <button type="button" onClick={() => window.location.reload()}>Thử tải lại</button>
      <Link href="/jobs">Trở về trang tuyển dụng</Link>
    </div>;
  }

  return (
    <div id="cv-print-root" className={s.pageContainer}>
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
            key={`${selection.sectionContext}-${selection.text}-${selection.rect.top}-${selection.rect.left}`}
            selectedText={selection.text}
            anchorRect={selection.rect}
            sectionContext={selection.sectionContext}
            targetJobId={cv.target_job_id}
            onApply={handleApplyReplacement}
            onClose={() => setSelection(null)}
          />
        )}

        {/* FIXED VIEWPORT ATS CARD WITH MASCOT & FANNED CARD DECK */}
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

          {/* 5 FANNED CARDS DECK LOCATED RIGHT BELOW ATS WIDGET */}
          <CvCardDeck
            cvList={cvList}
            currentCvId={cv.id}
            isSubscribed={isSubscribed}
            onSelectCv={handleSelectCv}
            onCreateNew={handleCreateNew}
            onDeleteCv={handleDeleteCv}
            onUpgradeRequired={handleUpgradeRequired}
            deletingId={deletingId}
          />
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
