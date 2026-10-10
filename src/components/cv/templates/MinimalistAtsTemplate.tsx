"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { Plus, Trash2 } from "lucide-react";
import { TemplateProps } from "./ModernTechTemplate";

export const MinimalistAtsTemplate: React.FC<TemplateProps> = ({
  cv,
  onUpdate,
  isEditable = true,
  onTextSelect,
}) => {
  const theme = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.slate;
  const font = CV_FONT_FAMILIES[cv.font_family] || CV_FONT_FAMILIES.roboto;

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

  const addHighlight = (expIdx: number) => {
    const list = [...cv.work_experiences];
    const hls = [...list[expIdx].highlights, "Nêu thành tích đạt được theo mô hình STAR."];
    list[expIdx] = { ...list[expIdx], highlights: hls };
    onUpdate({ work_experiences: list });
  };

  return (
    <div
      className={`w-full max-w-[850px] min-h-[1100px] bg-white text-black shadow-2xl rounded-sm mx-auto p-10 md:p-14 print:shadow-none print:m-0 print:p-8 print:w-full ${font.fontClass}`}
      style={{ fontFamily: font.cssFamily }}
    >
      {/* HEADER: Centered & Classic ATS Format */}
      <div className="text-center pb-4 mb-4 border-b border-black">
        <EditableText
          tag="h1"
          value={cv.personal_info.full_name || "HỌ VÀ TÊN"}
          onChange={(v) => updatePersonalInfo("full_name", v)}
          isEditable={isEditable}
          sectionContext="personal_info"
          onTextSelect={onTextSelect}
          className="text-2xl md:text-3xl font-bold tracking-wider uppercase block"
        />
        <EditableText
          tag="div"
          value={cv.personal_info.title || "Vị trí ứng tuyển"}
          onChange={(v) => updatePersonalInfo("title", v)}
          isEditable={isEditable}
          sectionContext="personal_info"
          onTextSelect={onTextSelect}
          className="text-sm font-semibold tracking-wide text-neutral-800 mt-1 block"
        />

        {/* Contact Line */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-700 mt-2">
          {cv.personal_info.location && (
            <>
              <EditableText
                value={cv.personal_info.location}
                onChange={(v) => updatePersonalInfo("location", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
              />
              <span>•</span>
            </>
          )}
          {cv.personal_info.phone && (
            <>
              <EditableText
                value={cv.personal_info.phone}
                onChange={(v) => updatePersonalInfo("phone", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
              />
              <span>•</span>
            </>
          )}
          {cv.personal_info.email && (
            <>
              <EditableText
                value={cv.personal_info.email}
                onChange={(v) => updatePersonalInfo("email", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
              />
              <span>•</span>
            </>
          )}
          {cv.personal_info.linkedin && (
            <>
              <EditableText
                value={cv.personal_info.linkedin}
                onChange={(v) => updatePersonalInfo("linkedin", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
              />
              {cv.personal_info.github && <span>•</span>}
            </>
          )}
          {cv.personal_info.github && (
            <EditableText
              value={cv.personal_info.github}
              onChange={(v) => updatePersonalInfo("github", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
            />
          )}
        </div>
      </div>

      {/* PROFESSIONAL SUMMARY */}
      {cv.summary && (
        <div className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            TÓM TẮT CHUYÊN MÔN
          </h2>
          <EditableText
            tag="p"
            value={cv.summary}
            onChange={(v) => onUpdate({ summary: v })}
            isEditable={isEditable}
            sectionContext="summary"
            onTextSelect={onTextSelect}
            className="text-xs text-neutral-800 leading-relaxed text-justify"
          />
        </div>
      )}

      {/* CORE SKILLS */}
      <div className="mb-5">
        <h2
          className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          KỸ NĂNG CỐT LÕI
        </h2>
        <div className="text-xs text-neutral-800 leading-relaxed">
          <EditableText
            tag="div"
            value={cv.skills.join(" • ")}
            onChange={(v) => {
              const items = v.split("•").map((s) => s.trim()).filter(Boolean);
              onUpdate({ skills: items });
            }}
            isEditable={isEditable}
            sectionContext="skills"
            onTextSelect={onTextSelect}
          />
        </div>
      </div>

      {/* WORK EXPERIENCE */}
      <div className="mb-5">
        <div className="flex items-center justify-between pb-0.5 mb-2 border-b" style={{ borderColor: theme.primary }}>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
            KINH NGHIỆM LÀM VIỆC
          </h2>
        </div>

        <div className="space-y-4">
          {cv.work_experiences.map((exp, expIdx) => (
            <div key={exp.id || expIdx}>
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <EditableText
                    value={exp.company}
                    onChange={(v) => updateExperience(expIdx, "company", v)}
                    isEditable={isEditable}
                    sectionContext="experience_company"
                    className="font-bold text-black"
                  />
                  <span className="text-neutral-500 mx-1">—</span>
                  <EditableText
                    value={exp.role}
                    onChange={(v) => updateExperience(expIdx, "role", v)}
                    isEditable={isEditable}
                    sectionContext="experience_role"
                    className="font-semibold italic text-neutral-800"
                  />
                </div>
                <div className="text-neutral-600 font-medium text-[11px]">
                  <EditableText
                    value={`${exp.start_date} – ${exp.is_current ? "Hiện tại" : exp.end_date}`}
                    onChange={(v) => updateExperience(expIdx, "start_date", v)}
                    isEditable={isEditable}
                  />
                </div>
              </div>

              {/* Highlights */}
              <ul className="mt-1 list-disc list-outside pl-4 space-y-1 text-xs text-neutral-800">
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
        <div className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            DỰ ÁN TIÊU BIỂU
          </h2>
          <div className="space-y-3">
            {cv.projects.map((proj, projIdx) => (
              <div key={proj.id || projIdx} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-black">
                  <div>
                    <EditableText
                      value={proj.name}
                      onChange={(v) => {
                        const list = [...cv.projects];
                        list[projIdx] = { ...list[projIdx], name: v };
                        onUpdate({ projects: list });
                      }}
                      isEditable={isEditable}
                      sectionContext="project_name"
                    />
                    {proj.role && (
                      <span className="font-normal italic text-neutral-600 ml-1">
                        | {proj.role}
                      </span>
                    )}
                  </div>
                  <span className="font-normal text-[11px] text-neutral-500">
                    {proj.start_date} – {proj.end_date || "Hoàn tất"}
                  </span>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    <strong>Công nghệ:</strong> {proj.technologies.join(", ")}
                  </div>
                )}
                <ul className="mt-1 list-disc list-outside pl-4 space-y-0.5 text-neutral-800">
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

      {/* EDUCATION */}
      <div className="mb-5">
        <h2
          className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          HỌC VẤN
        </h2>
        {cv.educations.map((edu, eduIdx) => (
          <div key={edu.id || eduIdx} className="flex justify-between items-baseline text-xs mb-1">
            <div>
              <span className="font-bold text-black">{edu.institution}</span>
              <span className="text-neutral-500 mx-1">—</span>
              <span className="text-neutral-700">{edu.degree} chuyên ngành {edu.field_of_study}</span>
              {edu.honors && <span className="italic text-neutral-600 block text-[11px]">{edu.honors}</span>}
            </div>
            <span className="text-neutral-600 text-[11px]">{edu.start_date} – {edu.end_date}</span>
          </div>
        ))}
      </div>

      {/* CERTIFICATIONS */}
      {cv.certifications && cv.certifications.length > 0 && (
        <div>
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1.5 border-b"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            CHỨNG CHỈ NGHỀ NGHIỆP
          </h2>
          <div className="space-y-1 text-xs">
            {cv.certifications.map((cert, certIdx) => (
              <div key={cert.id || certIdx} className="flex justify-between items-baseline">
                <span className="font-semibold text-black">{cert.name} — {cert.issuer}</span>
                <span className="text-neutral-500 text-[11px]">{cert.issue_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
