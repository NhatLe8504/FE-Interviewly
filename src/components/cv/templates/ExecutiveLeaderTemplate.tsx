"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import { TemplateProps } from "./ModernTechTemplate";

export const ExecutiveLeaderTemplate: React.FC<TemplateProps> = ({
  cv,
  onUpdate,
  isEditable = true,
  onTextSelect,
}) => {
  const theme = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.indigo;
  const font = CV_FONT_FAMILIES[cv.font_family] || CV_FONT_FAMILIES.playfair;

  const updatePersonalInfo = (field: string, val: string) => {
    onUpdate({
      personal_info: {
        ...cv.personal_info,
        [field]: val,
      },
    });
  };

  const updateExperience = (index: number, field: string, val: any) => {
    const list = [...cv.work_experiences];
    list[index] = { ...list[index], [field]: val };
    onUpdate({ work_experiences: list });
  };

  const updateHighlight = (expIdx: number, hlIdx: number, val: string) => {
    const list = [...cv.work_experiences];
    const hls = [...list[expIdx].highlights];
    hls[hlIdx] = val;
    list[expIdx] = { ...list[expIdx], highlights: hls };
    onUpdate({ work_experiences: list });
  };

  return (
    <div
      className={`w-[794px] min-w-[794px] max-w-[794px] min-h-[1123px] box-border shrink-0 bg-[#fdfdfd] text-slate-900 shadow-2xl rounded-none mx-auto p-12 md:p-14 border-t-8 print:shadow-none print:m-0 print:p-8 print:w-full ${font.fontClass}`}
      style={{
        borderTopColor: theme.primary,
        fontFamily: font.cssFamily,
      }}
    >
      {/* EXECUTIVE HEADER */}
      <div className="border-b-2 pb-6 mb-6" style={{ borderColor: theme.border }}>
        <div className="flex flex-col items-center text-center gap-3">
          <CvAvatar
            avatarUrl={cv.personal_info.avatar_url}
            onChange={(url) => updatePersonalInfo("avatar_url", url)}
            isEditable={isEditable}
            size={90}
          />
          <EditableText
            tag="h1"
            value={cv.personal_info.full_name || "NGUYỄN VĂN A"}
              onChange={(v) => updatePersonalInfo("full_name", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
              className="text-3xl md:text-4xl font-serif font-black tracking-widest uppercase"
              placeholder="HỌ VÀ TÊN LÃNH ĐẠO"
            />
          <div
            className="text-sm font-semibold tracking-widest uppercase mt-1.5"
            style={{ color: theme.primaryLight }}
          >
            <EditableText
              value={cv.personal_info.title || "EXECUTIVE TECHNOLOGY LEADER / CTO"}
              onChange={(v) => updatePersonalInfo("title", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
            />
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-600 mt-3 font-sans">
            {cv.personal_info.location && <span>{cv.personal_info.location}</span>}
            {cv.personal_info.phone && <span>• {cv.personal_info.phone}</span>}
            {cv.personal_info.email && <span>• {cv.personal_info.email}</span>}
            {cv.personal_info.linkedin && <span>• {cv.personal_info.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* EXECUTIVE PROFILE STATEMENT */}
      {cv.summary && (
        <div className="mb-8">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2 font-sans border-b pb-1"
            style={{ color: theme.primary, borderColor: theme.border }}
          >
            Tuyên bố lãnh đạo & Tầm nhìn chiến lược
          </div>
          <EditableText
            tag="p"
            value={cv.summary}
            onChange={(v) => onUpdate({ summary: v })}
            isEditable={isEditable}
            sectionContext="summary"
            onTextSelect={onTextSelect}
            className="text-sm text-slate-800 leading-relaxed font-serif text-justify italic"
          />
        </div>
      )}

      {/* CORE STRATEGIC COMPETENCIES */}
      <div className="mb-8">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-3 font-sans border-b pb-1"
          style={{ color: theme.primary, borderColor: theme.border }}
        >
          Năng lực cốt lõi & Quản trị chiến lược
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-sans text-xs">
          {cv.skills.map((skill, idx) => (
            <div
              key={idx}
              className="p-2 border rounded bg-slate-50 text-slate-800 font-medium flex items-center gap-1.5"
              style={{ borderColor: theme.border }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* PROFESSIONAL LEADERSHIP EXPERIENCE */}
      <div className="mb-8">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4 font-sans border-b pb-1"
          style={{ color: theme.primary, borderColor: theme.border }}
        >
          Kinh nghiệm điều hành & Tác động kinh doanh
        </div>

        <div className="space-y-6">
          {cv.work_experiences.map((exp, expIdx) => (
            <div key={exp.id || expIdx}>
              <div className="flex flex-col md:flex-row justify-between items-baseline mb-1">
                <div>
                  <EditableText
                    tag="span"
                    value={exp.role}
                    onChange={(v) => updateExperience(expIdx, "role", v)}
                    isEditable={isEditable}
                    sectionContext="experience_role"
                    onTextSelect={onTextSelect}
                    className="font-bold text-slate-900 text-base font-serif"
                  />
                  <span className="text-slate-400 mx-2">|</span>
                  <EditableText
                    tag="span"
                    value={exp.company}
                    onChange={(v) => updateExperience(expIdx, "company", v)}
                    isEditable={isEditable}
                    sectionContext="experience_company"
                    className="font-semibold text-slate-700 text-sm font-sans"
                  />
                </div>
                <span className="text-xs text-slate-500 font-sans mt-0.5 md:mt-0">
                  {exp.start_date} – {exp.is_current ? "Hiện tại" : exp.end_date}
                </span>
              </div>

              {exp.description && (
                <p className="text-xs text-slate-600 mb-2 font-serif italic">
                  {exp.description}
                </p>
              )}

              <ul className="space-y-1.5 list-disc list-outside pl-4 text-xs font-sans text-slate-800">
                {exp.highlights?.map((hl, hlIdx) => (
                  <li key={hlIdx} className="leading-relaxed">
                    <EditableText
                      value={hl}
                      onChange={(v) => updateHighlight(expIdx, hlIdx, v)}
                      isEditable={isEditable}
                      sectionContext="experience_highlight"
                      onTextSelect={onTextSelect}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* STRATEGIC PROJECTS / INITIATIVES */}
      {cv.projects && cv.projects.length > 0 && (
        <div className="mb-8">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3 font-sans border-b pb-1"
            style={{ color: theme.primary, borderColor: theme.border }}
          >
            Sáng kiến & Dự án quy mô lớn
          </div>
          <div className="space-y-4">
            {cv.projects.map((proj, projIdx) => (
              <div key={proj.id || projIdx} className="text-xs font-sans">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{proj.name} ({proj.role})</span>
                  <span className="text-slate-500 text-[11px]">{proj.start_date} – {proj.end_date || "Hoàn tất"}</span>
                </div>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  {proj.highlights?.[0] || proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION & BOARD CREDENTIALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs border-t pt-4">
        <div>
          <div className="font-bold uppercase tracking-wider text-slate-900 mb-2">
            Học vấn & Bằng cấp
          </div>
          {cv.educations.map((edu, eduIdx) => (
            <div key={edu.id || eduIdx} className="mb-2">
              <div className="font-semibold text-slate-900">{edu.institution}</div>
              <div className="text-slate-600">{edu.degree} - {edu.field_of_study}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="font-bold uppercase tracking-wider text-slate-900 mb-2">
            Chứng chỉ quản trị cấp cao
          </div>
          {cv.certifications.map((cert, certIdx) => (
            <div key={cert.id || certIdx} className="mb-2">
              <div className="font-semibold text-slate-900">{cert.name}</div>
              <div className="text-slate-600">{cert.issuer} • {cert.issue_date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
