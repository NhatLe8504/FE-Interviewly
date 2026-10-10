"use client";

import React, { useState, useEffect } from "react";
import { cvApi } from "@/services/cvApi";
import { CvDocument, UserSkillsSummaryResponse } from "@/types/cv";
import {
  Sparkles,
  X,
  CheckCircle2,
  Database,
  PenTool,
  Loader2,
  FileText,
  Briefcase,
} from "lucide-react";
import s from "@/app/(user)/cv-builder/cvBuilder.module.css";

interface AiDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (draft: Partial<CvDocument>) => void;
  currentCv: CvDocument;
}

export const AiDraftModal: React.FC<AiDraftModalProps> = ({
  isOpen,
  onClose,
  onApplyDraft,
  currentCv,
}) => {
  const [roleTitle, setRoleTitle] = useState(currentCv.personal_info.title || "Senior Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [useSystemSkills, setUseSystemSkills] = useState(true);
  const [customSkills, setCustomSkills] = useState("");
  const [customJdText, setCustomJdText] = useState("");
  const [systemSkillsData, setSystemSkillsData] = useState<UserSkillsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSkills, setFetchingSkills] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetchingSkills(true);
      cvApi
        .getUserSkillsSummary()
        .then((res) => {
          setSystemSkillsData(res);
          if (res.experience_level) setExperienceLevel(res.experience_level);
        })
        .catch((err) => {
          console.warn("Could not fetch user skills:", err);
        })
        .finally(() => setFetchingSkills(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const additionalSkills = customSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const draft = await cvApi.generateDraft({
        target_job_id: currentCv.target_job_id,
        target_jd_text: customJdText || undefined,
        role_title: roleTitle,
        experience_level: experienceLevel,
        user_provided_skills: additionalSkills,
        use_system_skills: useSystemSkills,
      });

      onApplyDraft(draft);
      onClose();
    } catch (err) {
      console.error("Generate draft failed:", err);
      alert("Đã xảy ra lỗi khi tạo bản thảo AI. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.modalOverlay}>
      <div className={s.modalCard}>
        {/* Close Button */}
        <button onClick={onClose} className={s.modalCloseBtn}>
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className={s.modalHeader}>
          <div className={s.modalIconBadge}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className={s.modalTitle}>Tạo Bản Thảo CV Bằng AI</h2>
            <p className={s.modalSubtitle}>
              AI sẽ phân tích kỹ năng và yêu cầu công việc để tạo cấu trúc CV tối ưu ATS
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div>
          {/* Target Role & Level */}
          <div className={s.modalFormGrid}>
            <div>
              <label className={s.modalLabel}>Vị trí mục tiêu:</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="VD: Senior Frontend Engineer"
                className={s.modalInput}
              />
            </div>

            <div>
              <label className={s.modalLabel}>Cấp bậc kinh nghiệm:</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className={s.modalSelect}
              >
                <option value="intern">Intern / Thực tập</option>
                <option value="fresher">Fresher (Mới tốt nghiệp)</option>
                <option value="junior">Junior (1 - 2 năm)</option>
                <option value="mid">Mid-Level (2 - 4 năm)</option>
                <option value="senior">Senior (5+ năm)</option>
                <option value="lead">Tech Lead / Architect</option>
              </select>
            </div>
          </div>

          <div style={{ height: 16 }} />

          {/* Skill Source Option 1: System Verified Skills */}
          <div className={s.systemSkillsPanel}>
            <label className={s.systemSkillsCheckbox}>
              <input
                type="checkbox"
                checked={useSystemSkills}
                onChange={(e) => setUseSystemSkills(e.target.checked)}
              />
              <Database size={14} />
              <span>Tải kỹ năng đã chứng thực trên hệ thống</span>
            </label>

            {useSystemSkills && (
              <div style={{ paddingLeft: 24, marginTop: 8 }}>
                {fetchingSkills ? (
                  <div className={s.syncingText}>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Đang đồng bộ hồ sơ năng lực...</span>
                  </div>
                ) : systemSkillsData?.skills && systemSkillsData.skills.length > 0 ? (
                  <div className={s.skillPillList}>
                    {systemSkillsData.skills.map((skill, idx) => (
                      <span key={idx} className={s.skillPill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={s.noSkillsText}>
                    Chưa có kỹ năng ghi nhận từ các phiên phỏng vấn. Bạn có thể tự nhập thêm bên dưới!
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 16 }} />

          {/* Skill Source Option 2: Custom Skills */}
          <div>
            <label className={s.modalLabel}>
              Kỹ năng người dùng tự nhập bổ sung (ngăn cách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={customSkills}
              onChange={(e) => setCustomSkills(e.target.value)}
              placeholder="VD: Next.js 15, FastAPI, Kubernetes, GraphQL, System Design"
              className={s.modalInput}
            />
          </div>

          <div style={{ height: 16 }} />

          {/* Target JD Text (Optional) */}
          <div>
            <label className={s.modalLabel}>
              Dán mô tả công việc (JD) mục tiêu (Tùy chọn):
            </label>
            <textarea
              rows={3}
              value={customJdText}
              onChange={(e) => setCustomJdText(e.target.value)}
              placeholder="Dán nội dung JD để AI tối ưu hóa các thành tích và từ khóa khớp với công việc..."
              className={s.modalTextarea}
            />
          </div>
        </div>

        <div style={{ height: 16 }} />

        {/* Footer Actions */}
        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.modalCancelBtn}>
            Hủy
          </button>
          <button onClick={handleGenerate} disabled={loading} className={s.modalGenerateBtn}>
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>AI đang tạo bản thảo...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Tạo Bản Thảo Mới</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
