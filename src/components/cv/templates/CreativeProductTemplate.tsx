"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import { TemplateProps } from "./ModernTechTemplate";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

export const CreativeProductTemplate: React.FC<TemplateProps> = ({
  cv,
  onUpdate,
  isEditable = true,
  onTextSelect,
}) => {
  const theme = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.amber;
  const font = CV_FONT_FAMILIES[cv.font_family] || CV_FONT_FAMILIES.inter;

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
      className={`w-[794px] min-w-[794px] max-w-[794px] min-h-[1123px] box-border shrink-0 bg-white text-slate-800 shadow-2xl rounded-lg mx-auto overflow-hidden print:shadow-none print:m-0 print:w-full ${font.fontClass}`}
      style={{ fontFamily: font.cssFamily }}
    >
      <div className="grid grid-cols-12 min-h-[1123px]">
        {/* LEFT SIDEBAR (4 cols) */}
        <div
          className="col-span-12 md:col-span-4 p-8 text-white flex flex-col justify-between"
          style={{ backgroundColor: theme.primary }}
        >
          <div>
            {/* AVATAR UPLOAD */}
            <div className="flex justify-center mb-6">
              <CvAvatar
                avatarUrl={cv.personal_info.avatar_url}
                onChange={(url) => updatePersonalInfo("avatar_url", url)}
                isEditable={isEditable}
                size={96}
                className="shadow-md"
              />
            </div>

            {/* CONTACT DETAILS */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3 border-b border-white/20 pb-1">
                Liên hệ
              </h3>
              <div className="space-y-2 text-xs text-white/90">
                {cv.personal_info.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <EditableText
                      value={cv.personal_info.email}
                      onChange={(v) => updatePersonalInfo("email", v)}
                      isEditable={isEditable}
                      sectionContext="personal_info"
                      onTextSelect={onTextSelect}
                      className="break-all"
                    />
                  </div>
                )}
                {cv.personal_info.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <EditableText
                      value={cv.personal_info.phone}
                      onChange={(v) => updatePersonalInfo("phone", v)}
                      isEditable={isEditable}
                      sectionContext="personal_info"
                      onTextSelect={onTextSelect}
                    />
                  </div>
                )}
                {cv.personal_info.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <EditableText
                      value={cv.personal_info.location}
                      onChange={(v) => updatePersonalInfo("location", v)}
                      isEditable={isEditable}
                      sectionContext="personal_info"
                      onTextSelect={onTextSelect}
                    />
                  </div>
                )}
                {cv.personal_info.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <EditableText
                      value={cv.personal_info.linkedin}
                      onChange={(v) => updatePersonalInfo("linkedin", v)}
                      isEditable={isEditable}
                      sectionContext="personal_info"
                      onTextSelect={onTextSelect}
                      className="break-all"
                    />
                  </div>
                )}
                {cv.personal_info.github && (
                  <div className="flex items-center gap-2">
                    <Github className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <EditableText
                      value={cv.personal_info.github}
                      onChange={(v) => updatePersonalInfo("github", v)}
                      isEditable={isEditable}
                      sectionContext="personal_info"
                      onTextSelect={onTextSelect}
                      className="break-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SKILLS */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3 border-b border-white/20 pb-1">
                Kỹ năng chuyên môn
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-white/15 rounded text-white font-medium backdrop-blur-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* EDUCATION IN SIDEBAR */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3 border-b border-white/20 pb-1">
                Học vấn
              </h3>
              {cv.educations.map((edu, idx) => (
                <div key={idx} className="mb-3 text-xs">
                  <div className="font-bold text-white">{edu.institution}</div>
                  <div className="text-white/80">{edu.degree}</div>
                  <div className="text-white/60 text-[11px]">{edu.start_date} – {edu.end_date}</div>
                </div>
              ))}
            </div>

            {/* CERTIFICATIONS */}
            {cv.certifications && cv.certifications.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3 border-b border-white/20 pb-1">
                  Chứng chỉ
                </h3>
                {cv.certifications.map((cert, idx) => (
                  <div key={idx} className="mb-2 text-xs">
                    <div className="font-semibold text-white">{cert.name}</div>
                    <div className="text-white/70 text-[11px]">{cert.issuer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[10px] text-white/50 text-center pt-4">
            AI Interview Coach Verified
          </div>
        </div>

        {/* RIGHT MAIN CONTENT (8 cols) */}
        <div className="col-span-12 md:col-span-8 p-8 md:p-10 flex flex-col justify-start">
          {/* TOP NAME & TITLE */}
          <div className="border-b-2 pb-5 mb-6" style={{ borderColor: theme.border }}>
            <EditableText
              tag="h1"
              value={cv.personal_info.full_name || "Nguyễn Văn A"}
              onChange={(v) => updatePersonalInfo("full_name", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
            />
            <div
              className="text-base font-bold uppercase tracking-wider mt-1"
              style={{ color: theme.accent }}
            >
              <EditableText
                value={cv.personal_info.title || "Product Designer & Fullstack"}
                onChange={(v) => updatePersonalInfo("title", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
                onTextSelect={onTextSelect}
              />
            </div>
          </div>

          {/* SUMMARY */}
          {cv.summary && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Giới thiệu bản thân
              </h2>
              <EditableText
                tag="p"
                value={cv.summary}
                onChange={(v) => onUpdate({ summary: v })}
                isEditable={isEditable}
                sectionContext="summary"
                onTextSelect={onTextSelect}
                className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify"
              />
            </div>
          )}

          {/* WORK EXPERIENCE */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-1">
              Kinh nghiệm thực chiến
            </h2>
            <div className="space-y-5">
              {cv.work_experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="relative pl-4 border-l-2" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.start_date} – {exp.is_current ? "Hiện tại" : exp.end_date}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mb-1" style={{ color: theme.primaryLight }}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  <ul className="space-y-1 list-disc list-outside pl-4 text-xs text-slate-700">
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

          {/* PROJECTS */}
          {cv.projects && cv.projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-1">
                Sản phẩm nổi bật
              </h2>
              <div className="space-y-4">
                {cv.projects.map((proj, projIdx) => (
                  <div key={proj.id || projIdx} className="text-xs">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{proj.name}</span>
                      <span className="text-slate-400 text-[11px]">{proj.start_date} – {proj.end_date || "Xong"}</span>
                    </div>
                    {proj.description && <p className="text-slate-600 mt-0.5">{proj.description}</p>}
                    <ul className="mt-1 list-disc list-outside pl-4 text-slate-700 space-y-0.5">
                      {proj.highlights?.map((hl, hlIdx) => (
                        <li key={hlIdx}>
                          <EditableText
                            value={hl}
                            onChange={(v) => {
                              const list = [...cv.projects];
                              const hls = [...list[projIdx].highlights];
                              hls[hlIdx] = v;
                              list[projIdx] = { ...list[projIdx], highlights: hls };
                              onUpdate({ projects: list });
                            }}
                            isEditable={isEditable}
                            sectionContext="project_highlight"
                            onTextSelect={onTextSelect}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
