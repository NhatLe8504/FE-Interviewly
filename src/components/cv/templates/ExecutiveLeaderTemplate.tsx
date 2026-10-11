"use client";

import React from "react";
import { CvDocument } from "@/types/cv";
import { CV_COLOR_THEMES, CV_FONT_FAMILIES } from "../cvThemes";
import { EditableText } from "../EditableText";
import { CvAvatar } from "../CvAvatar";
import { TemplateProps } from "./ModernTechTemplate";
import { Plus, Trash2 } from "lucide-react";

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

  const addExperience = () => {
    const newExp = {
      id: String(Date.now()),
      company: "TẬP ĐOÀN / CÔNG TY MỚI",
      role: "CHIEF EXECUTIVE OFFICER / VP",
      location: "Hà Nội, Việt Nam",
      start_date: "2022",
      end_date: "",
      is_current: true,
      description: "Định hướng chiến lược kinh doanh toàn cầu và dẫn dắt tổ chức.",
      highlights: ["Mở rộng thị phần tăng trưởng doanh thu 45% YoY."],
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
    const hls = [...list[expIdx].highlights, "Chiến lược tối ưu hóa vận hành và tăng trưởng doanh thu."];
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
      name: "Chiến dịch Tái cấu trúc Chuyển đổi số",
      role: "Program Sponsor",
      start_date: "2023",
      end_date: "2024",
      technologies: ["Digital Transformation", "Cloud Migration"],
      link: "",
      description: "Quy mô ngân sách 5 triệu USD và 200 nhân sự kỹ thuật.",
      highlights: ["Số hóa 100% quy trình kinh doanh và tiết kiệm 30% chi phí vận hành."],
    };
    onUpdate({ projects: [newProj, ...cv.projects] });
  };

  const removeProject = (index: number) => {
    const list = cv.projects.filter((_, i) => i !== index);
    onUpdate({ projects: list });
  };

  const addProjectHighlight = (projIdx: number) => {
    const list = [...cv.projects];
    const hls = [...(list[projIdx].highlights || []), "Tác động kinh doanh và chỉ số thành công chính."];
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
      institution: "Harvard Business School",
      degree: "Executive MBA",
      field_of_study: "General Management",
      start_date: "2018",
      end_date: "2020",
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
      name: "Certified Director (IoD)",
      issuer: "Institute of Directors",
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
        {isEditable && (
          <div className="mt-2 text-xs font-sans">
            <span className="text-[11px] text-slate-400 italic">Sửa danh sách năng lực (ngăn cách bằng dấu phẩy):</span>
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
              className="mt-1 p-2 bg-slate-50 border rounded text-xs text-slate-700"
            />
          </div>
        )}
      </div>

      {/* PROFESSIONAL LEADERSHIP EXPERIENCE */}
      <div className="mb-8">
        <div
          className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-4 font-sans border-b pb-1"
          style={{ color: theme.primary, borderColor: theme.border }}
        >
          <span>Kinh nghiệm điều hành & Tác động kinh doanh</span>
          {isEditable && (
            <button
              onClick={addExperience}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-slate-300 hover:border-slate-800 bg-white text-slate-800 font-normal normal-case transition print:hidden"
            >
              <Plus className="w-3 h-3" /> Thêm vị trí điều hành
            </button>
          )}
        </div>

        {cv.work_experiences.length === 0 && isEditable && (
          <div
            onClick={addExperience}
            className="p-4 border-2 border-dashed border-slate-200 rounded text-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-sans print:hidden"
          >
            + Nhấn để thêm vị trí điều hành mới
          </div>
        )}

        <div className="space-y-6">
          {cv.work_experiences.map((exp, expIdx) => (
            <div key={exp.id || expIdx} className="relative group">
              {isEditable && (
                <button
                  onClick={() => removeExperience(expIdx)}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                  title="Xóa vị trí này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex flex-col md:flex-row justify-between items-baseline mb-1 pr-6">
                <div>
                  <EditableText
                    tag="span"
                    value={exp.role}
                    onChange={(v) => updateExperience(expIdx, "role", v)}
                    isEditable={isEditable}
                    sectionContext="experience_role"
                    onTextSelect={onTextSelect}
                    className="font-bold text-slate-900 text-base font-serif"
                    placeholder="Chức danh lãnh đạo"
                  />
                  <span className="text-slate-400 mx-2">|</span>
                  <EditableText
                    tag="span"
                    value={exp.company}
                    onChange={(v) => updateExperience(expIdx, "company", v)}
                    isEditable={isEditable}
                    sectionContext="experience_company"
                    className="font-semibold text-slate-700 text-sm font-sans"
                    placeholder="Tên tập đoàn / công ty"
                  />
                </div>
                <span className="text-xs text-slate-500 font-sans mt-0.5 md:mt-0">
                  <EditableText
                    value={`${exp.start_date} – ${exp.is_current ? "Hiện tại" : exp.end_date}`}
                    onChange={(v) => updateExperience(expIdx, "start_date", v)}
                    isEditable={isEditable}
                  />
                </span>
              </div>

              {exp.description && (
                <div className="text-xs text-slate-600 mb-2 font-serif italic">
                  <EditableText
                    value={exp.description}
                    onChange={(v) => updateExperience(expIdx, "description", v)}
                    isEditable={isEditable}
                    sectionContext="experience_description"
                    onTextSelect={onTextSelect}
                  />
                </div>
              )}

              <ul className="space-y-1.5 list-disc list-outside pl-4 text-xs font-sans text-slate-800">
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
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {isEditable && (
                <button
                  onClick={() => addHighlight(expIdx)}
                  className="mt-1 text-[11px] text-indigo-700 hover:underline inline-flex items-center gap-0.5 font-sans print:hidden"
                >
                  <Plus className="w-2.5 h-2.5" /> Thêm thành tích chiến lược
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STRATEGIC PROJECTS / INITIATIVES */}
      {((cv.projects && cv.projects.length > 0) || isEditable) && (
        <div className="mb-8">
          <div
            className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-3 font-sans border-b pb-1"
            style={{ color: theme.primary, borderColor: theme.border }}
          >
            <span>Sáng kiến & Dự án quy mô lớn</span>
            {isEditable && (
              <button
                onClick={addProject}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-slate-300 hover:border-slate-800 bg-white text-slate-800 font-normal normal-case transition print:hidden"
              >
                <Plus className="w-3 h-3" /> Thêm sáng kiến lớn
              </button>
            )}
          </div>

          {cv.projects.length === 0 && isEditable && (
            <div
              onClick={addProject}
              className="p-4 border-2 border-dashed border-slate-200 rounded text-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-sans print:hidden"
            >
              + Nhấn để thêm dự án / sáng kiến chiến lược
            </div>
          )}

          <div className="space-y-4">
            {cv.projects.map((proj, projIdx) => (
              <div key={proj.id || projIdx} className="text-xs font-sans relative group">
                {isEditable && (
                  <button
                    onClick={() => removeProject(projIdx)}
                    className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                    title="Xóa dự án này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex justify-between items-baseline font-bold text-slate-900 pr-6">
                  <div>
                    <EditableText
                      value={proj.name}
                      onChange={(v) => updateProject(projIdx, "name", v)}
                      isEditable={isEditable}
                      sectionContext="project_name"
                      placeholder="Tên sáng kiến / dự án"
                    />
                    {proj.role && (
                      <span className="font-normal text-slate-500 ml-1">
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
                  <span className="text-slate-500 text-[11px]">
                    <EditableText
                      value={`${proj.start_date} – ${proj.end_date || "Hoàn tất"}`}
                      onChange={(v) => updateProject(projIdx, "start_date", v)}
                      isEditable={isEditable}
                    />
                  </span>
                </div>
                <div className="text-slate-700 mt-1 leading-relaxed">
                  <EditableText
                    value={proj.highlights?.[0] || proj.description || "Mô tả kết quả và tác động của sáng kiến."}
                    onChange={(v) => {
                      const list = [...cv.projects];
                      const hls = [...(list[projIdx].highlights || [])];
                      if (hls.length > 0) {
                        hls[0] = v;
                      } else {
                        hls.push(v);
                      }
                      list[projIdx] = { ...list[projIdx], highlights: hls };
                      onUpdate({ projects: list });
                    }}
                    isEditable={isEditable}
                    sectionContext="project_highlight"
                    onTextSelect={onTextSelect}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION & BOARD CREDENTIALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs border-t pt-4">
        <div>
          <div className="flex items-center justify-between font-bold uppercase tracking-wider text-slate-900 mb-2">
            <span>Học vấn & Bằng cấp</span>
            {isEditable && (
              <button
                onClick={addEducation}
                className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border border-slate-300 hover:border-slate-800 bg-white text-slate-700 font-normal normal-case transition print:hidden"
              >
                <Plus className="w-2.5 h-2.5" /> Thêm bằng cấp
              </button>
            )}
          </div>

          {cv.educations.length === 0 && isEditable && (
            <div
              onClick={addEducation}
              className="p-3 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer print:hidden"
            >
              + Thêm học vấn
            </div>
          )}

          {cv.educations.map((edu, eduIdx) => (
            <div key={edu.id || eduIdx} className="mb-2 relative group pr-5">
              {isEditable && (
                <button
                  onClick={() => removeEducation(eduIdx)}
                  className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                  title="Xóa học vấn này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <div className="font-semibold text-slate-900">
                <EditableText
                  value={edu.institution}
                  onChange={(v) => updateEducation(eduIdx, "institution", v)}
                  isEditable={isEditable}
                  sectionContext="education"
                  placeholder="Tên trường / Học viện"
                />
              </div>
              <div className="text-slate-600">
                <EditableText
                  value={`${edu.degree} - ${edu.field_of_study}`}
                  onChange={(v) => updateEducation(eduIdx, "degree", v)}
                  isEditable={isEditable}
                  sectionContext="education"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between font-bold uppercase tracking-wider text-slate-900 mb-2">
            <span>Chứng chỉ quản trị</span>
            {isEditable && (
              <button
                onClick={addCertification}
                className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border border-slate-300 hover:border-slate-800 bg-white text-slate-700 font-normal normal-case transition print:hidden"
              >
                <Plus className="w-2.5 h-2.5" /> Thêm chứng chỉ
              </button>
            )}
          </div>

          {cv.certifications.length === 0 && isEditable && (
            <div
              onClick={addCertification}
              className="p-3 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer print:hidden"
            >
              + Thêm chứng chỉ
            </div>
          )}

          {cv.certifications.map((cert, certIdx) => (
            <div key={cert.id || certIdx} className="mb-2 relative group pr-5">
              {isEditable && (
                <button
                  onClick={() => removeCertification(certIdx)}
                  className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition print:hidden"
                  title="Xóa chứng chỉ này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <div className="font-semibold text-slate-900">
                <EditableText
                  value={cert.name}
                  onChange={(v) => updateCertification(certIdx, "name", v)}
                  isEditable={isEditable}
                  sectionContext="certification"
                  placeholder="Tên chứng chỉ"
                />
              </div>
              <div className="text-slate-600">
                <EditableText
                  value={`${cert.issuer} • ${cert.issue_date}`}
                  onChange={(v) => updateCertification(certIdx, "issuer", v)}
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
