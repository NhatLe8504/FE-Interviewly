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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tạo Bản Thảo CV Bằng AI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI sẽ phân tích kỹ năng và yêu cầu công việc để tạo cấu trúc CV tối ưu ATS
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 text-xs">
          {/* Target Role & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Vị trí mục tiêu:
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="VD: Senior Frontend Engineer"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Cấp bậc kinh nghiệm:
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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

          {/* Skill Source Option 1: System Verified Skills */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useSystemSkills}
                onChange={(e) => setUseSystemSkills(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                Tải kỹ năng đã chứng thực trên hệ thống
              </span>
            </label>

            {useSystemSkills && (
              <div className="pl-6">
                {fetchingSkills ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang đồng bộ hồ sơ năng lực...</span>
                  </div>
                ) : systemSkillsData?.skills && systemSkillsData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {systemSkillsData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    Chưa có kỹ năng ghi nhận từ các phiên phỏng vấn. Bạn có thể tự nhập thêm bên dưới!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Skill Source Option 2: Custom Skills */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Kỹ năng người dùng tự nhập bổ sung (ngăn cách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={customSkills}
              onChange={(e) => setCustomSkills(e.target.value)}
              placeholder="VD: Next.js 15, FastAPI, Kubernetes, GraphQL, System Design"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Target JD Text (Optional) */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Dán mô tả công việc (JD) mục tiêu (Tùy chọn):
            </label>
            <textarea
              rows={3}
              value={customJdText}
              onChange={(e) => setCustomJdText(e.target.value)}
              placeholder="Dán nội dung JD để AI tối ưu hóa các thành tích và từ khóa khớp với công việc..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none text-[11px]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI đang tạo bản thảo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo Bản Thảo Mới</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
