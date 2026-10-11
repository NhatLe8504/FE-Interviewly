"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import { TemplateProps } from "./ModernTechTemplate";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Plus, Trash2 } from "lucide-react";

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

  const addExperience = () => {
    const newExp = {
      id: String(Date.now()),
      company: "Studio / Tech Agency Mới",
      role: "Product Designer / Engineer",
      location: "TP. Hồ Chí Minh",
      start_date: "2023",
      end_date: "",
      is_current: true,
      description: "Xây dựng trải nghiệm sản phẩm và hệ thống thiết kế toàn diện.",
      highlights: ["Tăng tỷ lệ kích hoạt người dùng lên 35% nhờ tái cấu trúc flow UX."],
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
    const hls = [...list[expIdx].highlights, "Nêu kết quả thực chiến hoặc chỉ số tăng trưởng đạt được."];
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
      name: "Dự án Sản phẩm sáng tạo mới",
      role: "Lead Product Architect",
      start_date: "2024",
      end_date: "2024",
      technologies: ["Next.js", "Tailwind CSS", "Figma"],
      link: "",
      description: "Nền tảng thương mại tương tác thế hệ mới.",
      highlights: ["Hơn 10,000 active users trong tháng đầu tiên ra mắt."],
    };
    onUpdate({ projects: [newProj, ...cv.projects] });
  };

  const removeProject = (index: number) => {
    const list = cv.projects.filter((_, i) => i !== index);
    onUpdate({ projects: list });
  };

  const addProjectHighlight = (projIdx: number) => {
    const list = [...cv.projects];
    const hls = [...(list[projIdx].highlights || []), "Điểm nổi bật hoặc tính năng sáng tạo của sản phẩm."];
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
      institution: "Đại học Kiến Trúc / Mỹ Thuật",
      degree: "Cử nhân",
      field_of_study: "Thiết kế Tương tác & Đồ họa",
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
      name: "Google UX Design Professional",
      issuer: "Coursera / Google",
      issue_date: "2023",
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
              {isEditable && (
                <div className="mt-2 text-xs">
                  <span className="text-[10px] text-white/60 italic">Sửa kỹ năng (phẩy):</span>
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
                    className="mt-1 p-1.5 bg-white/10 rounded text-[11px] text-white"
                  />
                </div>
              )}
            </div>

            {/* EDUCATION IN SIDEBAR */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/70 mb-3 border-b border-white/20 pb-1">
                <span>Học vấn</span>
                {isEditable && (
                  <button
                    onClick={addEducation}
                    className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.5 rounded print:hidden inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" /> Thêm
                  </button>
                )}
              </div>

              {cv.educations.length === 0 && isEditable && (
                <div
                  onClick={addEducation}
                  className="p-2 border border-dashed border-white/30 rounded text-center text-[11px] text-white/70 hover:text-white cursor-pointer print:hidden"
                >
                  + Thêm học vấn
                </div>
              )}

              {cv.educations.map((edu, idx) => (
                <div key={edu.id || idx} className="mb-3 text-xs relative group pr-4">
                  {isEditable && (
                    <button
                      onClick={() => removeEducation(idx)}
                      className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-0.5 text-red-200 hover:text-red-400 rounded transition print:hidden"
                      title="Xóa học vấn này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <div className="font-bold text-white">
                    <EditableText
                      value={edu.institution}
                      onChange={(v) => updateEducation(idx, "institution", v)}
                      isEditable={isEditable}
                      sectionContext="education"
                      placeholder="Tên trường học"
                    />
                  </div>
                  <div className="text-white/80">
                    <EditableText
                      value={`${edu.degree} - ${edu.field_of_study}`}
                      onChange={(v) => updateEducation(idx, "degree", v)}
                      isEditable={isEditable}
                      sectionContext="education"
                    />
                  </div>
                  <div className="text-white/60 text-[11px]">
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
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/70 mb-3 border-b border-white/20 pb-1">
                  <span>Chứng chỉ</span>
                  {isEditable && (
                    <button
                      onClick={addCertification}
                      className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.5 rounded print:hidden inline-flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> Thêm
                    </button>
                  )}
                </div>

                {cv.certifications.length === 0 && isEditable && (
                  <div
                    onClick={addCertification}
                    className="p-2 border border-dashed border-white/30 rounded text-center text-[11px] text-white/70 hover:text-white cursor-pointer print:hidden"
                  >
                    + Thêm chứng chỉ
                  </div>
                )}

                {cv.certifications.map((cert, idx) => (
                  <div key={cert.id || idx} className="mb-2 text-xs relative group pr-4">
                    {isEditable && (
                      <button
                        onClick={() => removeCertification(idx)}
                        className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-0.5 text-red-200 hover:text-red-400 rounded transition print:hidden"
                        title="Xóa chứng chỉ này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <div className="font-semibold text-white">
                      <EditableText
                        value={cert.name}
                        onChange={(v) => updateCertification(idx, "name", v)}
                        isEditable={isEditable}
                        sectionContext="certification"
                        placeholder="Tên chứng chỉ"
                      />
                    </div>
                    <div className="text-white/70 text-[11px]">
                      <EditableText
                        value={`${cert.issuer} • ${cert.issue_date}`}
                        onChange={(v) => updateCertification(idx, "issuer", v)}
                        isEditable={isEditable}
                      />
                    </div>
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
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-1">
              <span>Kinh nghiệm thực chiến</span>
              {isEditable && (
                <button
                  onClick={addExperience}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal normal-case transition print:hidden"
                >
                  <Plus className="w-2.5 h-2.5" /> Thêm công ty
                </button>
              )}
            </div>

            {cv.work_experiences.length === 0 && isEditable && (
              <div
                onClick={addExperience}
                className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer print:hidden"
              >
                + Nhấn để thêm kinh nghiệm thực chiến
              </div>
            )}

            <div className="space-y-5">
              {cv.work_experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="relative pl-4 border-l-2 group" style={{ borderColor: theme.border }}>
                  {isEditable && (
                    <button
                      onClick={() => removeExperience(expIdx)}
                      className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                      title="Xóa kinh nghiệm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex justify-between items-baseline pr-6">
                    <span className="font-bold text-slate-900 text-sm">
                      <EditableText
                        value={exp.role}
                        onChange={(v) => updateExperience(expIdx, "role", v)}
                        isEditable={isEditable}
                        sectionContext="experience_role"
                        onTextSelect={onTextSelect}
                        placeholder="Vị trí công việc"
                      />
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      <EditableText
                        value={`${exp.start_date} – ${exp.is_current ? "Hiện tại" : exp.end_date}`}
                        onChange={(v) => updateExperience(expIdx, "start_date", v)}
                        isEditable={isEditable}
                      />
                    </span>
                  </div>
                  <div className="text-xs font-semibold mb-1" style={{ color: theme.primaryLight }}>
                    <EditableText
                      value={exp.company}
                      onChange={(v) => updateExperience(expIdx, "company", v)}
                      isEditable={isEditable}
                      sectionContext="experience_company"
                      placeholder="Tên công ty"
                    />
                    {exp.location && (
                      <span className="text-slate-400 font-normal ml-1">• {exp.location}</span>
                    )}
                  </div>
                  <ul className="space-y-1 list-disc list-outside pl-4 text-xs text-slate-700">
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
                            className="opacity-0 group-hover/hl:opacity-100 ml-2 text-slate-400 hover:text-red-500 inline-block align-middle transition print:hidden"
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
                      className="mt-1 text-[11px] text-amber-700 hover:underline inline-flex items-center gap-0.5 print:hidden"
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
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-1">
                <span>Sản phẩm nổi bật</span>
                {isEditable && (
                  <button
                    onClick={addProject}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal normal-case transition print:hidden"
                  >
                    <Plus className="w-2.5 h-2.5" /> Thêm sản phẩm
                  </button>
                )}
              </div>

              {cv.projects.length === 0 && isEditable && (
                <div
                  onClick={addProject}
                  className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer print:hidden"
                >
                  + Nhấn để thêm sản phẩm nổi bật
                </div>
              )}

              <div className="space-y-4">
                {cv.projects.map((proj, projIdx) => (
                  <div key={proj.id || projIdx} className="text-xs relative group">
                    {isEditable && (
                      <button
                        onClick={() => removeProject(projIdx)}
                        className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                        title="Xóa dự án này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex justify-between items-baseline font-bold text-slate-900 pr-6">
                      <span>
                        <EditableText
                          value={proj.name}
                          onChange={(v) => updateProject(projIdx, "name", v)}
                          isEditable={isEditable}
                          sectionContext="project_name"
                          placeholder="Tên sản phẩm"
                        />
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        <EditableText
                          value={`${proj.start_date} – ${proj.end_date || "Xong"}`}
                          onChange={(v) => updateProject(projIdx, "start_date", v)}
                          isEditable={isEditable}
                        />
                      </span>
                    </div>
                    {proj.description && (
                      <div className="text-slate-600 mt-0.5">
                        <EditableText
                          value={proj.description}
                          onChange={(v) => updateProject(projIdx, "description", v)}
                          isEditable={isEditable}
                          sectionContext="project_description"
                          onTextSelect={onTextSelect}
                        />
                      </div>
                    )}
                    <ul className="mt-1 list-disc list-outside pl-4 text-slate-700 space-y-0.5">
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
                              className="opacity-0 group-hover/phl:opacity-100 ml-2 text-slate-400 hover:text-red-500 inline-block align-middle transition print:hidden"
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
                        className="mt-1 text-[11px] text-amber-700 hover:underline inline-flex items-center gap-0.5 print:hidden"
                      >
                        <Plus className="w-2.5 h-2.5" /> Thêm điểm nhấn sản phẩm
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
