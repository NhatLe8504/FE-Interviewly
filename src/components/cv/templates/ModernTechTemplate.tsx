"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Plus,
  Trash2,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";

export interface TemplateProps {
  cv: CvDocument;
  onUpdate: (updated: Partial<CvDocument>) => void;
  isEditable?: boolean;
  onTextSelect?: (selection: { text: string; rect: DOMRect; sectionContext: string }) => void;
}

export const ModernTechTemplate: React.FC<TemplateProps> = ({
  cv,
  onUpdate,
  isEditable = true,
  onTextSelect,
}) => {
  const theme = CV_COLOR_THEMES[cv.color_theme] || CV_COLOR_THEMES.navy;
  const font = CV_FONT_FAMILIES[cv.font_family] || CV_FONT_FAMILIES.inter;

  // Handlers for updating deep nested fields
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
      company: "Tên công ty mới",
      role: "Vị trí công việc",
      location: "Hà Nội, Việt Nam",
      start_date: "2023",
      end_date: "",
      is_current: true,
      description: "Mô tả ngắn gọn phạm vi trách nhiệm.",
      highlights: ["Đạt được thành tựu nổi bật với chỉ số đo lường cụ thể."],
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
    const hls = [...list[expIdx].highlights, "Thành tích hoặc cải tiến mới (nhấn bôi đen để AI chuyển thành STAR)."];
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
      role: "Lead Developer",
      start_date: "2024",
      end_date: "2024",
      technologies: ["React", "TypeScript", "Node.js"],
      link: "https://github.com/...",
      description: "Mô tả giải pháp và kiến trúc của dự án.",
      highlights: ["Tối ưu hiệu năng 40% với cơ chế cache thông minh."],
    };
    onUpdate({ projects: [newProj, ...cv.projects] });
  };

  const removeProject = (index: number) => {
    const list = cv.projects.filter((_, i) => i !== index);
    onUpdate({ projects: list });
  };

  const updateSkills = (val: string) => {
    const arr = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate({ skills: arr });
  };

  return (
    <div
      className={`w-[794px] min-w-[794px] max-w-[794px] min-h-[1123px] box-border shrink-0 bg-white text-slate-800 shadow-2xl rounded-xl mx-auto p-10 print:shadow-none print:m-0 print:p-8 print:w-full print:rounded-none ${font.fontClass}`}
      style={{ fontFamily: font.cssFamily }}
    >
      {/* HEADER SECTION */}
      <div className="border-b-2 pb-6 mb-6" style={{ borderColor: theme.border }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5 flex-1">
            <CvAvatar
              avatarUrl={cv.personal_info.avatar_url}
              onChange={(url) => updatePersonalInfo("avatar_url", url)}
              isEditable={isEditable}
              size={86}
            />
            <div className="flex-1">
              <EditableText
                tag="h1"
                value={cv.personal_info.full_name || "Họ và Tên"}
                onChange={(v) => updatePersonalInfo("full_name", v)}
                isEditable={isEditable}
                sectionContext="personal_info"
                onTextSelect={onTextSelect}
                className="text-3xl md:text-4xl font-extrabold tracking-tight"
                placeholder="Họ và Tên"
              />
              <div className="mt-1">
                <EditableText
                  tag="h2"
                  value={cv.personal_info.title || "Vị trí ứng tuyển"}
                  onChange={(v) => updatePersonalInfo("title", v)}
                  isEditable={isEditable}
                  sectionContext="personal_info"
                  onTextSelect={onTextSelect}
                  className="text-lg md:text-xl font-semibold tracking-wide"
                  placeholder="Vị trí chuyên môn"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="flex flex-col gap-1.5 text-xs md:text-sm text-slate-600">
            {cv.personal_info.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <EditableText
                  value={cv.personal_info.email}
                  onChange={(v) => updatePersonalInfo("email", v)}
                  isEditable={isEditable}
                  sectionContext="personal_info"
                  onTextSelect={onTextSelect}
                />
              </div>
            )}
            {cv.personal_info.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
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
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <EditableText
                  value={cv.personal_info.location}
                  onChange={(v) => updatePersonalInfo("location", v)}
                  isEditable={isEditable}
                  sectionContext="personal_info"
                  onTextSelect={onTextSelect}
                />
              </div>
            )}
            {cv.personal_info.github && (
              <div className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <EditableText
                  value={cv.personal_info.github}
                  onChange={(v) => updatePersonalInfo("github", v)}
                  isEditable={isEditable}
                  sectionContext="personal_info"
                  onTextSelect={onTextSelect}
                />
              </div>
            )}
            {cv.personal_info.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                <EditableText
                  value={cv.personal_info.linkedin}
                  onChange={(v) => updatePersonalInfo("linkedin", v)}
                  isEditable={isEditable}
                  sectionContext="personal_info"
                  onTextSelect={onTextSelect}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {cv.summary && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Tóm tắt chuyên môn
            </h3>
          </div>
          <EditableText
            tag="p"
            value={cv.summary}
            onChange={(v) => onUpdate({ summary: v })}
            isEditable={isEditable}
            sectionContext="summary"
            onTextSelect={onTextSelect}
            className="text-sm text-slate-700 leading-relaxed text-justify"
          />
        </div>
      )}

      {/* SKILLS CHIPS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Kỹ năng trọng tâm & Công nghệ
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cv.skills.map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border"
              style={{
                backgroundColor: theme.bgLight,
                borderColor: theme.border,
                color: theme.primary,
              }}
            >
              {skill}
            </span>
          ))}
          {isEditable && (
            <div className="w-full mt-2">
              <span className="text-[11px] text-slate-400 italic">
                Chỉnh sửa kỹ năng (ngăn cách bằng dấu phẩy):
              </span>
              <EditableText
                tag="div"
                value={cv.skills.join(", ")}
                onChange={updateSkills}
                isEditable={isEditable}
                sectionContext="skills"
                onTextSelect={onTextSelect}
                className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded mt-0.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* WORK EXPERIENCE */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 border-b pb-1" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: theme.primary }} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Kinh nghiệm làm việc
            </h3>
          </div>
          {isEditable && (
            <button
              onClick={addExperience}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Plus className="w-3 h-3" /> Thêm công ty
            </button>
          )}
        </div>

        <div className="space-y-5">
          {cv.work_experiences.map((exp, expIdx) => (
            <div key={exp.id || expIdx} className="relative group">
              {isEditable && cv.work_experiences.length > 1 && (
                <button
                  onClick={() => removeExperience(expIdx)}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition"
                  title="Xóa kinh nghiệm này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline">
                <div>
                  <EditableText
                    tag="span"
                    value={exp.role}
                    onChange={(v) => updateExperience(expIdx, "role", v)}
                    isEditable={isEditable}
                    sectionContext="experience_role"
                    onTextSelect={onTextSelect}
                    className="font-bold text-slate-900 text-sm md:text-base"
                    placeholder="Chức danh"
                  />
                  <span className="text-slate-400 mx-1.5">•</span>
                  <EditableText
                    tag="span"
                    value={exp.company}
                    onChange={(v) => updateExperience(expIdx, "company", v)}
                    isEditable={isEditable}
                    sectionContext="experience_company"
                    onTextSelect={onTextSelect}
                    className="font-semibold text-sm"
                    style={{ color: theme.primary }}
                    placeholder="Tên công ty"
                  />
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5 md:mt-0">
                  <EditableText
                    value={exp.start_date}
                    onChange={(v) => updateExperience(expIdx, "start_date", v)}
                    isEditable={isEditable}
                    sectionContext="experience_date"
                    placeholder="Bắt đầu"
                  />
                  <span>-</span>
                  <EditableText
                    value={exp.is_current ? "Hiện tại" : exp.end_date || "Kết thúc"}
                    onChange={(v) => updateExperience(expIdx, "end_date", v)}
                    isEditable={isEditable}
                    sectionContext="experience_date"
                    placeholder="Kết thúc"
                  />
                  {exp.location && (
                    <>
                      <span className="mx-1">|</span>
                      <EditableText
                        value={exp.location}
                        onChange={(v) => updateExperience(expIdx, "location", v)}
                        isEditable={isEditable}
                        sectionContext="experience_location"
                        placeholder="Địa điểm"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {exp.description && (
                <div className="mt-1 text-xs text-slate-600 italic">
                  <EditableText
                    value={exp.description}
                    onChange={(v) => updateExperience(expIdx, "description", v)}
                    isEditable={isEditable}
                    sectionContext="experience_description"
                    onTextSelect={onTextSelect}
                  />
                </div>
              )}

              {/* STAR Highlights */}
              <ul className="mt-2 space-y-1.5 list-disc list-outside pl-4 text-xs md:text-sm text-slate-700">
                {exp.highlights?.map((hl, hlIdx) => (
                  <li key={hlIdx} className="relative group/hl pl-1 leading-relaxed">
                    <EditableText
                      tag="span"
                      value={hl}
                      onChange={(v) => updateHighlight(expIdx, hlIdx, v)}
                      isEditable={isEditable}
                      sectionContext="experience_highlight"
                      onTextSelect={onTextSelect}
                      className="inline"
                    />
                    {isEditable && exp.highlights.length > 1 && (
                      <button
                        onClick={() => removeHighlight(expIdx, hlIdx)}
                        className="opacity-0 group-hover/hl:opacity-100 ml-2 text-slate-400 hover:text-red-500 inline-block align-middle transition"
                        title="Xóa ý này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {isEditable && (
                <button
                  onClick={() => addHighlight(expIdx)}
                  className="mt-1 text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" /> Thêm thành tích STAR
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PROJECTS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 border-b pb-1" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4" style={{ color: theme.primary }} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Dự án tiêu biểu
            </h3>
          </div>
          {isEditable && (
            <button
              onClick={addProject}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Plus className="w-3 h-3" /> Thêm dự án
            </button>
          )}
        </div>

        <div className="space-y-4">
          {cv.projects.map((proj, projIdx) => (
            <div key={proj.id || projIdx} className="relative group">
              {isEditable && cv.projects.length > 1 && (
                <button
                  onClick={() => removeProject(projIdx)}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition"
                  title="Xóa dự án này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex justify-between items-baseline">
                <div>
                  <EditableText
                    tag="span"
                    value={proj.name}
                    onChange={(v) => updateProject(projIdx, "name", v)}
                    isEditable={isEditable}
                    sectionContext="project_name"
                    onTextSelect={onTextSelect}
                    className="font-bold text-slate-900 text-sm"
                    placeholder="Tên dự án"
                  />
                  {proj.role && (
                    <span className="text-xs text-slate-500 ml-2">
                      (
                      <EditableText
                        value={proj.role}
                        onChange={(v) => updateProject(projIdx, "role", v)}
                        isEditable={isEditable}
                        sectionContext="project_role"
                      />
                      )
                    </span>
                  )}
                </div>
                {proj.start_date && (
                  <span className="text-xs text-slate-400">
                    <EditableText
                      value={`${proj.start_date} - ${proj.end_date || "Hoàn thành"}`}
                      onChange={(v) => updateProject(projIdx, "start_date", v)}
                      isEditable={isEditable}
                    />
                  </span>
                )}
              </div>

              {/* Technologies */}
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {proj.technologies.map((t, ti) => (
                    <span
                      key={ti}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Highlights */}
              <ul className="mt-1.5 space-y-1 list-disc list-outside pl-4 text-xs text-slate-700">
                {proj.highlights?.map((hl, hlIdx) => (
                  <li key={hlIdx} className="pl-1 leading-relaxed">
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

      {/* EDUCATION & CERTIFICATIONS 2-COL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDUCATION */}
        <div>
          <div className="flex items-center gap-2 mb-2 border-b pb-1" style={{ borderColor: theme.border }}>
            <GraduationCap className="w-4 h-4" style={{ color: theme.primary }} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Học vấn
            </h3>
          </div>
          {cv.educations.map((edu, eduIdx) => (
            <div key={edu.id || eduIdx} className="mb-2 text-xs">
              <div className="font-bold text-slate-900">
                <EditableText
                  value={edu.institution}
                  onChange={(v) => {
                    const list = [...cv.educations];
                    list[eduIdx] = { ...list[eduIdx], institution: v };
                    onUpdate({ educations: list });
                  }}
                  isEditable={isEditable}
                  sectionContext="education"
                  placeholder="Tên trường học"
                />
              </div>
              <div className="text-slate-600">
                <EditableText
                  value={`${edu.degree} - ${edu.field_of_study}`}
                  onChange={(v) => {
                    const list = [...cv.educations];
                    list[eduIdx] = { ...list[eduIdx], degree: v };
                    onUpdate({ educations: list });
                  }}
                  isEditable={isEditable}
                  sectionContext="education"
                />
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                <EditableText
                  value={`${edu.start_date} - ${edu.end_date} | GPA: ${edu.gpa}`}
                  onChange={(v) => {
                    const list = [...cv.educations];
                    list[eduIdx] = { ...list[eduIdx], honors: v };
                    onUpdate({ educations: list });
                  }}
                  isEditable={isEditable}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CERTIFICATIONS */}
        <div>
          <div className="flex items-center gap-2 mb-2 border-b pb-1" style={{ borderColor: theme.border }}>
            <Award className="w-4 h-4" style={{ color: theme.primary }} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Chứng chỉ
            </h3>
          </div>
          {cv.certifications.map((cert, certIdx) => (
            <div key={cert.id || certIdx} className="mb-2 text-xs">
              <div className="font-bold text-slate-900">
                <EditableText
                  value={cert.name}
                  onChange={(v) => {
                    const list = [...cv.certifications];
                    list[certIdx] = { ...list[certIdx], name: v };
                    onUpdate({ certifications: list });
                  }}
                  isEditable={isEditable}
                  sectionContext="certification"
                  placeholder="Tên chứng chỉ"
                />
              </div>
              <div className="text-slate-600 text-[11px]">
                <EditableText
                  value={`${cert.issuer} • ${cert.issue_date}`}
                  onChange={(v) => {
                    const list = [...cv.certifications];
                    list[certIdx] = { ...list[certIdx], issuer: v };
                    onUpdate({ certifications: list });
                  }}
                  isEditable={isEditable}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
