"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
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

  const addExperience = () => {
    const newExp = {
      id: String(Date.now()),
      company: "TÊN CÔNG TY MỚI",
      role: "Vị trí công việc",
      location: "Hà Nội, Việt Nam",
      start_date: "2023",
      end_date: "",
      is_current: true,
      description: "Mô tả ngắn gọn trách nhiệm và phạm vi công việc.",
      highlights: ["Nêu thành tích đạt được theo mô hình STAR."],
    };
    onUpdate({ work_experiences: [newExp, ...cv.work_experiences] });
  };

  const removeExperience = (index: number) => {
    const list = cv.work_experiences.filter((_, i) => i !== index);
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

  const removeHighlight = (expIdx: number, hlIdx: number) => {
    const list = [...cv.work_experiences];
    const hls = list[expIdx].highlights.filter((_, i) => i !== hlIdx);
    list[expIdx] = { ...list[expIdx], highlights: hls };
    onUpdate({ work_experiences: list });
  };

  const updateProject = (index: number, field: string, val: any) => {
    const list = [...cv.projects];
    list[index] = { ...list[index], [field]: val };
    onUpdate({ projects: list });
  };

  const addProject = () => {
    const newProj = {
      id: String(Date.now()),
      name: "Tên dự án mới",
      role: "Thành viên cốt lõi",
      start_date: "2024",
      end_date: "2024",
      technologies: ["React", "TypeScript"],
      link: "",
      description: "Mô tả phạm vi và giải pháp của dự án.",
      highlights: ["Mô tả đóng góp hoặc kết quả nổi bật trong dự án."],
    };
    onUpdate({ projects: [newProj, ...cv.projects] });
  };

  const removeProject = (index: number) => {
    const list = cv.projects.filter((_, i) => i !== index);
    onUpdate({ projects: list });
  };

  const addProjectHighlight = (projIdx: number) => {
    const list = [...cv.projects];
    const hls = [...(list[projIdx].highlights || []), "Mô tả kết quả hoặc thành tựu mới trong dự án."];
    list[projIdx] = { ...list[projIdx], highlights: hls };
    onUpdate({ projects: list });
  };

  const removeProjectHighlight = (projIdx: number, hlIdx: number) => {
    const list = [...cv.projects];
    const hls = list[projIdx].highlights.filter((_, i) => i !== hlIdx);
    list[projIdx] = { ...list[projIdx], highlights: hls };
    onUpdate({ projects: list });
  };

  const addEducation = () => {
    const newEdu = {
      id: String(Date.now()),
      institution: "Đại học Bách Khoa",
      degree: "Cử nhân",
      field_of_study: "Công nghệ thông tin",
      start_date: "2020",
      end_date: "2024",
      gpa: "3.5/4.0",
      honors: "",
    };
    onUpdate({ educations: [...cv.educations, newEdu] });
  };

  const removeEducation = (index: number) => {
    const list = cv.educations.filter((_, i) => i !== index);
    onUpdate({ educations: list });
  };

  const updateEducation = (index: number, field: string, val: any) => {
    const list = [...cv.educations];
    list[index] = { ...list[index], [field]: val };
    onUpdate({ educations: list });
  };

  const addCertification = () => {
    const newCert = {
      id: String(Date.now()),
      name: "Chứng chỉ Chuyên môn mới",
      issuer: "Tổ chức cấp",
      issue_date: "2024",
      expiration_date: "",
      credential_id: "",
      url: "",
    };
    onUpdate({ certifications: [...cv.certifications, newCert] });
  };

  const removeCertification = (index: number) => {
    const list = cv.certifications.filter((_, i) => i !== index);
    onUpdate({ certifications: list });
  };

  const updateCertification = (index: number, field: string, val: any) => {
    const list = [...cv.certifications];
    list[index] = { ...list[index], [field]: val };
    onUpdate({ certifications: list });
  };

  return (
    <div
      className={`w-[794px] min-w-[794px] max-w-[794px] min-h-[1123px] box-border shrink-0 bg-white text-black shadow-2xl rounded-sm mx-auto p-12 print:shadow-none print:m-0 print:p-8 print:w-full ${font.fontClass}`}
      style={{ fontFamily: font.cssFamily }}
    >
      {/* HEADER: Centered & Classic ATS Format */}
      <div className="flex flex-col items-center pb-4 mb-4 border-b border-black gap-3 text-center">
        <CvAvatar
          avatarUrl={cv.personal_info.avatar_url}
          onChange={(url) => updatePersonalInfo("avatar_url", url)}
          isEditable={isEditable}
          size={80}
        />
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
          {isEditable && (
            <button
              onClick={addExperience}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 border border-black/30 hover:border-black rounded bg-white text-neutral-800 transition print:hidden"
            >
              <Plus className="w-2.5 h-2.5" /> Thêm công ty
            </button>
          )}
        </div>

        {cv.work_experiences.length === 0 && isEditable && (
          <div
            onClick={addExperience}
            className="p-3 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer print:hidden"
          >
            + Nhấn để thêm kinh nghiệm làm việc
          </div>
        )}

        <div className="space-y-4">
          {cv.work_experiences.map((exp, expIdx) => (
            <div key={exp.id || expIdx} className="relative group">
              {isEditable && (
                <button
                  onClick={() => removeExperience(expIdx)}
                  className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                  title="Xóa kinh nghiệm này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <div className="flex justify-between items-baseline text-xs pr-4">
                <div>
                  <EditableText
                    value={exp.company}
                    onChange={(v) => updateExperience(expIdx, "company", v)}
                    isEditable={isEditable}
                    sectionContext="experience_company"
                    className="font-bold text-black"
                    placeholder="TÊN CÔNG TY"
                  />
                  <span className="text-neutral-500 mx-1">—</span>
                  <EditableText
                    value={exp.role}
                    onChange={(v) => updateExperience(expIdx, "role", v)}
                    isEditable={isEditable}
                    sectionContext="experience_role"
                    className="font-semibold italic text-neutral-800"
                    placeholder="Vị trí công việc"
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
                  <li key={hlIdx} className="leading-relaxed relative group/hl">
                    <EditableText
                      value={hl}
                      onChange={(v) => updateHighlight(expIdx, hlIdx, v)}
                      isEditable={isEditable}
                      sectionContext="experience_highlight"
                      onTextSelect={onTextSelect}
                      className="inline"
                    />
                    {isEditable && (
                      <button
                        onClick={() => removeHighlight(expIdx, hlIdx)}
                        className="opacity-0 group-hover/hl:opacity-100 ml-2 text-neutral-400 hover:text-red-500 inline-block align-middle transition print:hidden"
                        title="Xóa ý này"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {isEditable && (
                <button
                  onClick={() => addHighlight(expIdx)}
                  className="mt-1 text-[11px] text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-0.5 print:hidden"
                >
                  <Plus className="w-2.5 h-2.5" /> Thêm thành tích STAR
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PROJECTS */}
      {((cv.projects && cv.projects.length > 0) || isEditable) && (
        <div className="mb-5">
          <div className="flex items-center justify-between pb-0.5 mb-2 border-b" style={{ borderColor: theme.primary }}>
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
              DỰ ÁN TIÊU BIỂU
            </h2>
            {isEditable && (
              <button
                onClick={addProject}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 border border-black/30 hover:border-black rounded bg-white text-neutral-800 transition print:hidden"
              >
                <Plus className="w-2.5 h-2.5" /> Thêm dự án
              </button>
            )}
          </div>

          {cv.projects.length === 0 && isEditable && (
            <div
              onClick={addProject}
              className="p-3 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer print:hidden"
            >
              + Nhấn để thêm dự án tiêu biểu
            </div>
          )}

          <div className="space-y-3">
            {cv.projects.map((proj, projIdx) => (
              <div key={proj.id || projIdx} className="text-xs relative group">
                {isEditable && (
                  <button
                    onClick={() => removeProject(projIdx)}
                    className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                    title="Xóa dự án này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="flex justify-between items-baseline font-bold text-black pr-4">
                  <div>
                    <EditableText
                      value={proj.name}
                      onChange={(v) => updateProject(projIdx, "name", v)}
                      isEditable={isEditable}
                      sectionContext="project_name"
                      placeholder="Tên dự án"
                    />
                    {proj.role && (
                      <span className="font-normal italic text-neutral-600 ml-1">
                        |{" "}
                        <EditableText
                          value={proj.role}
                          onChange={(v) => updateProject(projIdx, "role", v)}
                          isEditable={isEditable}
                          sectionContext="project_role"
                        />
                      </span>
                    )}
                  </div>
                  <span className="font-normal text-[11px] text-neutral-500">
                    <EditableText
                      value={`${proj.start_date} – ${proj.end_date || "Hoàn tất"}`}
                      onChange={(v) => updateProject(projIdx, "start_date", v)}
                      isEditable={isEditable}
                    />
                  </span>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    <strong>Công nghệ:</strong> {proj.technologies.join(", ")}
                  </div>
                )}
                <ul className="mt-1 list-disc list-outside pl-4 space-y-0.5 text-neutral-800">
                  {proj.highlights?.map((hl, hlIdx) => (
                    <li key={hlIdx} className="relative group/phl">
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
                        className="inline"
                      />
                      {isEditable && (
                        <button
                          onClick={() => removeProjectHighlight(projIdx, hlIdx)}
                          className="opacity-0 group-hover/phl:opacity-100 ml-2 text-neutral-400 hover:text-red-500 inline-block align-middle transition print:hidden"
                          title="Xóa ý này"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {isEditable && (
                  <button
                    onClick={() => addProjectHighlight(projIdx)}
                    className="mt-1 text-[11px] text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-0.5 print:hidden"
                  >
                    <Plus className="w-2.5 h-2.5" /> Thêm mô tả / đóng góp
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION */}
      <div className="mb-5">
        <div className="flex items-center justify-between pb-0.5 mb-1.5 border-b" style={{ borderColor: theme.primary }}>
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
            HỌC VẤN
          </h2>
          {isEditable && (
            <button
              onClick={addEducation}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 border border-black/30 hover:border-black rounded bg-white text-neutral-800 transition print:hidden"
            >
              <Plus className="w-2.5 h-2.5" /> Thêm học vấn
            </button>
          )}
        </div>

        {cv.educations.length === 0 && isEditable && (
          <div
            onClick={addEducation}
            className="p-3 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer print:hidden"
          >
            + Nhấn để thêm học vấn
          </div>
        )}

        {cv.educations.map((edu, eduIdx) => (
          <div key={edu.id || eduIdx} className="flex justify-between items-baseline text-xs mb-2 relative group pr-4">
            {isEditable && (
              <button
                onClick={() => removeEducation(eduIdx)}
                className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                title="Xóa học vấn này"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <div>
              <span className="font-bold text-black">
                <EditableText
                  value={edu.institution}
                  onChange={(v) => updateEducation(eduIdx, "institution", v)}
                  isEditable={isEditable}
                  sectionContext="education"
                  placeholder="Tên trường học"
                />
              </span>
              <span className="text-neutral-500 mx-1">—</span>
              <span className="text-neutral-700">
                <EditableText
                  value={`${edu.degree} chuyên ngành ${edu.field_of_study}`}
                  onChange={(v) => updateEducation(eduIdx, "degree", v)}
                  isEditable={isEditable}
                  sectionContext="education"
                />
              </span>
              {edu.honors && (
                <span className="italic text-neutral-600 block text-[11px]">
                  <EditableText
                    value={edu.honors}
                    onChange={(v) => updateEducation(eduIdx, "honors", v)}
                    isEditable={isEditable}
                  />
                </span>
              )}
            </div>
            <span className="text-neutral-600 text-[11px]">
              <EditableText
                value={`${edu.start_date} – ${edu.end_date}`}
                onChange={(v) => updateEducation(eduIdx, "start_date", v)}
                isEditable={isEditable}
              />
            </span>
          </div>
        ))}
      </div>

      {/* CERTIFICATIONS */}
      {((cv.certifications && cv.certifications.length > 0) || isEditable) && (
        <div>
          <div className="flex items-center justify-between pb-0.5 mb-1.5 border-b" style={{ borderColor: theme.primary }}>
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
              CHỨNG CHỈ NGHỀ NGHIỆP
            </h2>
            {isEditable && (
              <button
                onClick={addCertification}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 border border-black/30 hover:border-black rounded bg-white text-neutral-800 transition print:hidden"
              >
                <Plus className="w-2.5 h-2.5" /> Thêm chứng chỉ
              </button>
            )}
          </div>

          {cv.certifications.length === 0 && isEditable && (
            <div
              onClick={addCertification}
              className="p-3 border border-dashed border-neutral-300 rounded text-center text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer print:hidden"
            >
              + Nhấn để thêm chứng chỉ
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            {cv.certifications.map((cert, certIdx) => (
              <div key={cert.id || certIdx} className="flex justify-between items-baseline relative group pr-4">
                {isEditable && (
                  <button
                    onClick={() => removeCertification(certIdx)}
                    className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                    title="Xóa chứng chỉ này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <span className="font-semibold text-black">
                  <EditableText
                    value={cert.name}
                    onChange={(v) => updateCertification(certIdx, "name", v)}
                    isEditable={isEditable}
                    sectionContext="certification"
                    placeholder="Tên chứng chỉ"
                  />
                  <span className="text-neutral-500 font-normal"> — </span>
                  <EditableText
                    value={cert.issuer}
                    onChange={(v) => updateCertification(certIdx, "issuer", v)}
                    isEditable={isEditable}
                    sectionContext="certification"
                    placeholder="Đơn vị cấp"
                  />
                </span>
                <span className="text-neutral-500 text-[11px]">
                  <EditableText
                    value={cert.issue_date}
                    onChange={(v) => updateCertification(certIdx, "issue_date", v)}
                    isEditable={isEditable}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
