"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import { TemplateProps } from "./ModernTechTemplate";

export const CompactSwissTemplate: React.FC<TemplateProps> = ({
  cv,
  onUpdate,
  isEditable = true,
  onTextSelect,
}) => {
  const theme = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.slate;
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
      className={`w-[794px] min-w-[794px] max-w-[794px] min-h-[1123px] box-border shrink-0 bg-white text-neutral-900 shadow-2xl mx-auto p-12 print:shadow-none print:m-0 print:p-8 print:w-full ${font.fontClass}`}
      style={{ fontFamily: font.cssFamily }}
    >
      {/* SWISS TOP BAR */}
      <div className="grid grid-cols-12 gap-6 border-b-4 border-black pb-6 mb-6 items-center">
        <div className="col-span-12 md:col-span-8 flex items-center gap-5">
          <CvAvatar
            avatarUrl={cv.personal_info.avatar_url}
            onChange={(url) => updatePersonalInfo("avatar_url", url)}
            isEditable={isEditable}
            size={84}
          />
          <div className="flex-1">
            <EditableText
              tag="h1"
              value={cv.personal_info.full_name || "NGUYỄN VĂN A"}
              onChange={(v) => updatePersonalInfo("full_name", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
              className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none"
            />
            <div className="text-sm font-bold tracking-tight uppercase text-neutral-600 mt-2">
              <EditableText
                value={cv.personal_info.title || "SOFTWARE ARCHITECT"}
                onChange={(v) => updatePersonalInfo("title", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
                onTextSelect={onTextSelect}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 text-xs font-mono space-y-1 text-neutral-700 flex flex-col justify-end">
          <div>{cv.personal_info.email}</div>
          <div>{cv.personal_info.phone}</div>
          <div>{cv.personal_info.location}</div>
          <div>{cv.personal_info.github}</div>
        </div>
      </div>

      {/* SWISS 2-COLUMN GRID */}
      <div className="grid grid-cols-12 gap-8">
        {/* COLUMN 1: INTRO, SKILLS, EDUCATION (4 cols) */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* PROFILE */}
          {cv.summary && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2 border-b border-black pb-0.5">
                01 / HỒ SƠ
              </h2>
              <EditableText
                tag="p"
                value={cv.summary}
                onChange={(v) => onUpdate({ summary: v })}
                isEditable={isEditable}
                sectionContext="summary"
                onTextSelect={onTextSelect}
                className="text-xs text-neutral-700 leading-relaxed text-justify"
              />
            </div>
          )}

          {/* SKILLS */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2 border-b border-black pb-0.5">
              02 / KỸ NĂNG
            </h2>
            <div className="flex flex-wrap gap-1">
              {cv.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-bold border border-black text-black"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* EDUCATION */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2 border-b border-black pb-0.5">
              03 / HỌC VẤN
            </h2>
            {cv.educations.map((edu, idx) => (
              <div key={idx} className="mb-2 text-xs">
                <div className="font-bold">{edu.institution}</div>
                <div className="text-neutral-600">{edu.degree}</div>
                <div className="text-[10px] font-mono text-neutral-500">{edu.start_date} – {edu.end_date}</div>
              </div>
            ))}
          </div>

          {/* CERTIFICATIONS */}
          {cv.certifications && cv.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2 border-b border-black pb-0.5">
                04 / CHỨNG CHỈ
              </h2>
              {cv.certifications.map((c, idx) => (
                <div key={idx} className="mb-1 text-xs">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-[10px] font-mono text-neutral-500">{c.issuer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: EXPERIENCE & PROJECTS (8 cols) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* EXPERIENCE */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-black mb-3 border-b border-black pb-0.5">
              05 / KINH NGHIỆM THỰC TIỄN
            </h2>
            <div className="space-y-4">
              {cv.work_experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span>{exp.role} @ {exp.company}</span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {exp.start_date} – {exp.is_current ? "HIỆN TẠI" : exp.end_date}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1 list-square list-outside pl-4 text-neutral-800">
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
              <h2 className="text-xs font-black uppercase tracking-widest text-black mb-3 border-b border-black pb-0.5">
                06 / DỰ ÁN & SẢN PHẨM
              </h2>
              <div className="space-y-3">
                {cv.projects.map((proj, projIdx) => (
                  <div key={proj.id || projIdx} className="text-xs">
                    <div className="flex justify-between items-baseline font-bold">
                      <span>{proj.name}</span>
                      <span className="font-mono text-[10px] text-neutral-500">{proj.start_date} – {proj.end_date || "DONE"}</span>
                    </div>
                    <ul className="mt-1 space-y-1 list-square list-outside pl-4 text-neutral-800">
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
