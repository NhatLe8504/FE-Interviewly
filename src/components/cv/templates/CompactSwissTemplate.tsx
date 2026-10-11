"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import { TemplateProps } from "./ModernTechTemplate";
import { Plus, Trash2 } from "lucide-react";

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

  const addExperience = () => {
    const newExp = {
      id: String(Date.now()),
      company: "CÔNG TY MỚI",
      role: "VỊ TRÍ CHUYÊN MÔN",
      location: "Hà Nội, Việt Nam",
      start_date: "2023",
      end_date: "",
      is_current: true,
      description: "Quản lý và thực thi các dự án trọng điểm.",
      highlights: ["Đạt hiệu suất công việc vượt mức chỉ tiêu 25%."],
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
    const hls = [...list[expIdx].highlights, "Nêu kết quả và thành tích cụ thể theo chuẩn STAR."];
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
      name: "DỰ ÁN MỚI",
      role: "Core Developer",
      start_date: "2024",
      end_date: "2024",
      technologies: ["React", "Go"],
      link: "",
      description: "Hệ thống phân tán hiệu năng cao.",
      highlights: ["Khả năng xử lý 10,000 requests/giây."],
    };
    onUpdate({ projects: [newProj, ...cv.projects] });
  };

  const removeProject = (index: number) => {
    const list = cv.projects.filter((_, i) => i !== index);
    onUpdate({ projects: list });
  };

  const addProjectHighlight = (projIdx: number) => {
    const list = [...cv.projects];
    const hls = [...(list[projIdx].highlights || []), "Chỉ số cải tiến hoặc kết quả dự án."];
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
      institution: "ĐẠI HỌC BÁCH KHOA",
      degree: "Kỹ sư",
      field_of_study: "Khoa học Máy tính",
      start_date: "2019",
      end_date: "2023",
      gpa: "",
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
      name: "CHỨNG CHỈ QUỐC TẾ MỚI",
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
          <div>
            <EditableText
              value={cv.personal_info.email}
              onChange={(v) => updatePersonalInfo("email", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
            />
          </div>
          <div>
            <EditableText
              value={cv.personal_info.phone}
              onChange={(v) => updatePersonalInfo("phone", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
            />
          </div>
          <div>
            <EditableText
              value={cv.personal_info.location}
              onChange={(v) => updatePersonalInfo("location", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
            />
          </div>
          <div>
            <EditableText
              value={cv.personal_info.github}
              onChange={(v) => updatePersonalInfo("github", v)}
              isEditable={isEditable}
              sectionContext="personal_info"
              onTextSelect={onTextSelect}
            />
          </div>
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
            {isEditable && (
              <div className="mt-2 text-xs">
                <span className="text-[10px] text-neutral-500 font-mono italic">Sửa kỹ năng (phẩy):</span>
                <EditableText
                  tag="div"
                  value={cv.skills.join(", ")}
                  onChange={(v) => {
                    const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
                    onUpdate({ skills: arr });
                  }}
                  isEditable={isEditable}
                  sectionContext="skills"
                  onTextSelect={onTextSelect}
                  className="mt-1 p-1 border border-neutral-300 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* EDUCATION */}
          <div>
            <div className="flex items-center justify-between border-b border-black pb-0.5 mb-2">
              <h2 className="text-xs font-black uppercase tracking-widest text-black">
                03 / HỌC VẤN
              </h2>
              {isEditable && (
                <button
                  onClick={addEducation}
                  className="border border-black text-[10px] font-bold px-1.5 py-0.5 uppercase hover:bg-black hover:text-white transition print:hidden flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" /> Thêm
                </button>
              )}
            </div>

            {cv.educations.length === 0 && isEditable && (
              <div
                onClick={addEducation}
                className="p-2 border border-dashed border-neutral-400 text-center text-xs text-neutral-500 hover:text-black cursor-pointer print:hidden font-mono"
              >
                + Thêm học vấn
              </div>
            )}

            {cv.educations.map((edu, idx) => (
              <div key={edu.id || idx} className="mb-2 text-xs relative group pr-4">
                {isEditable && (
                  <button
                    onClick={() => removeEducation(idx)}
                    className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-600 transition print:hidden"
                    title="Xóa học vấn này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="font-bold">
                  <EditableText
                    value={edu.institution}
                    onChange={(v) => updateEducation(idx, "institution", v)}
                    isEditable={isEditable}
                    sectionContext="education"
                    placeholder="Tên trường học"
                  />
                </div>
                <div className="text-neutral-600">
                  <EditableText
                    value={`${edu.degree} - ${edu.field_of_study}`}
                    onChange={(v) => updateEducation(idx, "degree", v)}
                    isEditable={isEditable}
                    sectionContext="education"
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-500">
                  <EditableText
                    value={`${edu.start_date} – ${edu.end_date}`}
                    onChange={(v) => updateEducation(idx, "start_date", v)}
                    isEditable={isEditable}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* CERTIFICATIONS */}
          {((cv.certifications && cv.certifications.length > 0) || isEditable) && (
            <div>
              <div className="flex items-center justify-between border-b border-black pb-0.5 mb-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-black">
                  04 / CHỨNG CHỈ
                </h2>
                {isEditable && (
                  <button
                    onClick={addCertification}
                    className="border border-black text-[10px] font-bold px-1.5 py-0.5 uppercase hover:bg-black hover:text-white transition print:hidden flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" /> Thêm
                  </button>
                )}
              </div>

              {cv.certifications.length === 0 && isEditable && (
                <div
                  onClick={addCertification}
                  className="p-2 border border-dashed border-neutral-400 text-center text-xs text-neutral-500 hover:text-black cursor-pointer print:hidden font-mono"
                >
                  + Thêm chứng chỉ
                </div>
              )}

              {cv.certifications.map((c, idx) => (
                <div key={c.id || idx} className="mb-1 text-xs relative group pr-4">
                  {isEditable && (
                    <button
                      onClick={() => removeCertification(idx)}
                      className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-600 transition print:hidden"
                      title="Xóa chứng chỉ này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <div className="font-bold">
                    <EditableText
                      value={c.name}
                      onChange={(v) => updateCertification(idx, "name", v)}
                      isEditable={isEditable}
                      sectionContext="certification"
                      placeholder="Tên chứng chỉ"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500">
                    <EditableText
                      value={`${c.issuer} • ${c.issue_date}`}
                      onChange={(v) => updateCertification(idx, "issuer", v)}
                      isEditable={isEditable}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: EXPERIENCE & PROJECTS (8 cols) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* EXPERIENCE */}
          <div>
            <div className="flex items-center justify-between border-b border-black pb-0.5 mb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-black">
                05 / KINH NGHIỆM THỰC TIỄN
              </h2>
              {isEditable && (
                <button
                  onClick={addExperience}
                  className="border border-black text-[10px] font-bold px-2 py-0.5 uppercase hover:bg-black hover:text-white transition print:hidden flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm công ty
                </button>
              )}
            </div>

            {cv.work_experiences.length === 0 && isEditable && (
              <div
                onClick={addExperience}
                className="p-4 border-2 border-dashed border-neutral-300 text-center text-xs text-neutral-500 hover:text-black cursor-pointer font-mono print:hidden"
              >
                + Nhấn để thêm kinh nghiệm thực tiễn
              </div>
            )}

            <div className="space-y-4">
              {cv.work_experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="text-xs relative group pr-6">
                  {isEditable && (
                    <button
                      onClick={() => removeExperience(expIdx)}
                      className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 transition print:hidden"
                      title="Xóa kinh nghiệm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <div>
                      <EditableText
                        value={exp.role}
                        onChange={(v) => updateExperience(expIdx, "role", v)}
                        isEditable={isEditable}
                        sectionContext="experience_role"
                        onTextSelect={onTextSelect}
                        className="inline font-bold"
                        placeholder="VỊ TRÍ"
                      />
                      <span className="mx-1">@</span>
                      <EditableText
                        value={exp.company}
                        onChange={(v) => updateExperience(expIdx, "company", v)}
                        isEditable={isEditable}
                        sectionContext="experience_company"
                        onTextSelect={onTextSelect}
                        className="inline font-bold"
                        placeholder="CÔNG TY"
                      />
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">
                      <EditableText
                        value={`${exp.start_date} – ${exp.is_current ? "HIỆN TẠI" : exp.end_date}`}
                        onChange={(v) => updateExperience(expIdx, "start_date", v)}
                        isEditable={isEditable}
                      />
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1 list-square list-outside pl-4 text-neutral-800">
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
                            className="opacity-0 group-hover/hl:opacity-100 ml-2 text-neutral-400 hover:text-red-600 inline-block align-middle transition print:hidden"
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
                      className="mt-1 text-[11px] font-mono text-neutral-600 hover:text-black underline inline-flex items-center gap-0.5 print:hidden"
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
            <div>
              <div className="flex items-center justify-between border-b border-black pb-0.5 mb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-black">
                  06 / DỰ ÁN & SẢN PHẨM
                </h2>
                {isEditable && (
                  <button
                    onClick={addProject}
                    className="border border-black text-[10px] font-bold px-2 py-0.5 uppercase hover:bg-black hover:text-white transition print:hidden flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm dự án
                  </button>
                )}
              </div>

              {cv.projects.length === 0 && isEditable && (
                <div
                  onClick={addProject}
                  className="p-4 border-2 border-dashed border-neutral-300 text-center text-xs text-neutral-500 hover:text-black cursor-pointer font-mono print:hidden"
                >
                  + Nhấn để thêm dự án & sản phẩm
                </div>
              )}

              <div className="space-y-3">
                {cv.projects.map((proj, projIdx) => (
                  <div key={proj.id || projIdx} className="text-xs relative group pr-6">
                    {isEditable && (
                      <button
                        onClick={() => removeProject(projIdx)}
                        className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 transition print:hidden"
                        title="Xóa dự án này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex justify-between items-baseline font-bold">
                      <span>
                        <EditableText
                          value={proj.name}
                          onChange={(v) => updateProject(projIdx, "name", v)}
                          isEditable={isEditable}
                          sectionContext="project_name"
                          placeholder="TÊN DỰ ÁN"
                        />
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">
                        <EditableText
                          value={`${proj.start_date} – ${proj.end_date || "DONE"}`}
                          onChange={(v) => updateProject(projIdx, "start_date", v)}
                          isEditable={isEditable}
                        />
                      </span>
                    </div>
                    <ul className="mt-1 space-y-1 list-square list-outside pl-4 text-neutral-800">
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
                              className="opacity-0 group-hover/phl:opacity-100 ml-2 text-neutral-400 hover:text-red-600 inline-block align-middle transition print:hidden"
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
                        className="mt-1 text-[11px] font-mono text-neutral-600 hover:text-black underline inline-flex items-center gap-0.5 print:hidden"
                      >
                        <Plus className="w-2.5 h-2.5" /> Thêm chi tiết dự án
                      </button>
                    )}
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
