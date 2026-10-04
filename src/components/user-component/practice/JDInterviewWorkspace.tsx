"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  FileText,
  Link as LinkIcon,
  UploadCloud,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  Play,
  RotateCcw,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  Layers,
  ShieldAlert,
  HelpCircle,
  Volume2,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react";
import { jdInterviewApi, JDJobStatusResponse, InterviewScriptResult, ScriptItem } from "@/services/jdInterviewApi";

export function JDInterviewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryJobId = searchParams.get("job_id");

  // Input tabs
  const [activeTab, setActiveTab] = useState<"text" | "url" | "file">("text");

  // Input states
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [language, setLanguage] = useState("vi");

  // Workflow state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<JDJobStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryJobId && !jobId) {
      setJobId(queryJobId);
    }
  }, [queryJobId, jobId]);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);

  // Status Polling Effect
  useEffect(() => {
    if (!jobId) return;
    if (jobState?.status === "COMPLETED" || jobState?.status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await jdInterviewApi.getJobStatus(jobId);
        setJobState(res);
        if (res.status === "FAILED") {
          setErrorMessage(res.error || "Quá trình phân tích JD thất bại. Vui lòng thử lại.");
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [jobId, jobState?.status]);

  const handleStartGeneration = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setJobState(null);
    setJobId(null);

    try {
      let res: JDJobStatusResponse;
      if (activeTab === "text") {
        if (!jdText.trim() || jdText.trim().length < 30) {
          setErrorMessage("Vui lòng nhập nội dung Job Description (tối thiểu 30 ký tự).");
          setIsSubmitting(false);
          return;
        }
        res = await jdInterviewApi.submitText(jdText, durationMinutes, undefined, language);
      } else if (activeTab === "url") {
        if (!jdUrl.trim() || !jdUrl.startsWith("http")) {
          setErrorMessage("Vui lòng nhập đường link bài đăng tuyển dụng hợp lệ (http hoặc https).");
          setIsSubmitting(false);
          return;
        }
        res = await jdInterviewApi.submitUrl(jdUrl, durationMinutes, undefined, language);
      } else {
        if (!selectedFile) {
          setErrorMessage("Vui lòng chọn tệp tin JD định dạng PDF, DOCX hoặc TXT.");
          setIsSubmitting(false);
          return;
        }
        res = await jdInterviewApi.submitFile(selectedFile, durationMinutes, undefined, language);
      }

      setJobId(res.job_id);
      setJobState(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Không thể gửi yêu cầu tạo phỏng vấn. Vui lòng kiểm tra lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchInterview = async () => {
    if (!jobId) return;
    setIsStartingSession(true);
    try {
      const sess = await jdInterviewApi.startSession(jobId, mode);
      if (sess && sess.session_id) {
        router.push(`/practice/${sess.session_id}`);
      } else {
        setErrorMessage("Không thể khởi tạo phòng phỏng vấn.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi bắt đầu buổi phỏng vấn.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const scriptResult: InterviewScriptResult | null = jobState?.result || null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6">
      {/* Configuration & Input Card */}
      <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
              <Sparkles className="size-3.5" />
              <span>AI JD Intelligence</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Tạo Buổi Phỏng Vấn Từ Job Description
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Nhập tin tuyển dụng để AI tự động phân tích yêu cầu chuyên môn, lập Blueprint và sinh kịch bản phỏng vấn thực chiến.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-2xl border">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mode === "text"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Phỏng vấn Text</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("voice")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mode === "voice"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Volume2 className="size-3.5" />
              <span>Phỏng vấn Voice AI</span>
            </button>
          </div>
        </div>

        {/* Input Method Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-1">
            <button
              type="button"
              onClick={() => { setActiveTab("text"); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
                activeTab === "text"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="size-4" />
              <span>Dán Văn Bản JD</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("url"); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
                activeTab === "url"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="size-4" />
              <span>Nhập Link Tuyển Dụng</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("file"); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
                activeTab === "file"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <UploadCloud className="size-4" />
              <span>Tải Lên Tệp (PDF / DOCX / TXT)</span>
            </button>
          </div>

          {/* Tab 1: Raw Text */}
          {activeTab === "text" && (
            <div className="space-y-2">
              <label htmlFor="jd-textarea" className="text-xs font-semibold text-foreground">
                Nội dung Job Description (Yêu cầu, Trách nhiệm, Quyền lợi)
              </label>
              <textarea
                id="jd-textarea"
                rows={7}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Dán toàn bộ nội dung tin tuyển dụng vào đây... Ví dụ: Vị trí Senior Backend Engineer, 3 năm kinh nghiệm Python, FastAPI, PostgreSQL..."
                className="w-full rounded-2xl border border-input bg-transparent p-4 text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {/* Tab 2: URL */}
          {activeTab === "url" && (
            <div className="space-y-2">
              <label htmlFor="jd-url-input" className="text-xs font-semibold text-foreground">
                Đường dẫn liên kết bài đăng tuyển dụng công khai
              </label>
              <input
                id="jd-url-input"
                type="url"
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                placeholder="https://topcv.vn/viec-lam/... hoặc https://linkedin.com/jobs/view/..."
                className="w-full h-11 rounded-2xl border border-input bg-transparent px-4 text-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Hệ thống tự động loại bỏ quảng cáo, menu và trích xuất nội dung tin tuyển dụng với cơ chế bảo mật chống SSRF.
              </p>
            </div>
          )}

          {/* Tab 3: File Upload */}
          {activeTab === "file" && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 p-8 text-center cursor-pointer transition-colors space-y-2"
              >
                <div className="size-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <UploadCloud className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {selectedFile ? selectedFile.name : "Bấm để chọn tệp tài liệu JD từ máy tính"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hỗ trợ định dạng PDF, DOCX, TXT hoặc Markdown (Tối đa 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Duration & Language Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t text-xs">
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground">Thời lượng phỏng vấn mục tiêu</span>
            <div className="flex gap-2">
              {[30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                    durationMinutes === mins
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {mins} phút
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-semibold text-foreground">Ngôn ngữ phỏng vấn</span>
            <div className="flex gap-2">
              {[
                { code: "vi", label: "Tiếng Việt" },
                { code: "en", label: "English" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                    language === lang.code
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-destructive/10 text-destructive text-xs font-semibold">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="button"
            disabled={isSubmitting || (jobState?.status && jobState.status !== "COMPLETED" && jobState.status !== "FAILED")}
            onClick={handleStartGeneration}
            className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Khởi Tạo Kịch Bản Phỏng Vấn Với AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Stepper & Live State */}
      {jobState && (
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {jobState.progress_pct}%
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Tiến Trình Phân Tích & Sinh Kịch Bản</h3>
                <p className="text-xs text-muted-foreground">{jobState.stage}</p>
              </div>
            </div>

            {jobState.status === "COMPLETED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-3.5" /> Hoàn thành
              </span>
            ) : jobState.status === "FAILED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                <AlertTriangle className="size-3.5" /> Thất bại
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600">
                <Loader2 className="size-3.5 animate-spin" /> Đang xử lý
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${jobState.progress_pct}%` }}
            />
          </div>

          {/* Stepper details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
            <div className={`p-2.5 rounded-xl border ${jobState.progress_pct >= 25 ? "bg-primary/5 border-primary/30 font-semibold text-primary" : "text-muted-foreground"}`}>
              1. Tiêu hóa & Hash JD
            </div>
            <div className={`p-2.5 rounded-xl border ${jobState.progress_pct >= 45 ? "bg-primary/5 border-primary/30 font-semibold text-primary" : "text-muted-foreground"}`}>
              2. Phân tích năng lực
            </div>
            <div className={`p-2.5 rounded-xl border ${jobState.progress_pct >= 85 ? "bg-primary/5 border-primary/30 font-semibold text-primary" : "text-muted-foreground"}`}>
              3. Sinh câu hỏi song song
            </div>
            <div className={`p-2.5 rounded-xl border ${jobState.progress_pct >= 100 ? "bg-primary/5 border-primary/30 font-semibold text-primary" : "text-muted-foreground"}`}>
              4. Lọc trùng & Kiểm định
            </div>
          </div>
        </div>
      )}

      {/* Blueprint & Script Review Section (Once Completed) */}
      {scriptResult && (
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-xl font-bold text-foreground">{scriptResult.role}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                  {scriptResult.seniority}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HelpCircle className="size-3.5" />
                  {scriptResult.total_questions} câu hỏi tuyển chọn
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  ~{scriptResult.estimated_minutes} phút phỏng vấn
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/practice/setup/${jobId}`)}
                className="h-11 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
              >
                <SlidersHorizontal className="size-4" />
                <span>Cấu Hình & Bắt Đầu Phỏng Vấn</span>
              </button>

              <button
                type="button"
                disabled={isStartingSession}
                onClick={handleLaunchInterview}
                className="h-11 px-4 rounded-2xl border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
              >
                {isStartingSession ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-3.5 fill-current" />
                )}
                <span>Vào thẳng phòng</span>
              </button>
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Danh Sách Câu Hỏi & Khung Tiêu Chí Đánh Giá (STAR Blueprint)
            </h4>

            {scriptResult.questions.map((item, idx) => {
              const isExpanded = expandedQuestionIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-muted/10 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary tabular-nums">
                          #{item.order_index}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground capitalize border">
                          {item.section_type}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground truncate">
                          {item.competency_name}
                        </span>
                        <div className="inline-flex items-center gap-0.5 ml-auto sm:ml-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-2.5 ${star <= item.difficulty ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-foreground leading-snug">
                        {item.question_text}
                      </p>
                    </div>

                    <div className="size-6 shrink-0 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mt-0.5">
                      {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/50 text-xs space-y-3 bg-card">
                      {item.rationale && (
                        <div>
                          <span className="font-bold text-muted-foreground text-[11px]">Mục đích câu hỏi từ JD:</span>
                          <p className="text-foreground leading-relaxed mt-0.5">{item.rationale}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {item.expected_signals && item.expected_signals.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5">
                              <CheckCircle2 className="size-3.5" /> Tín hiệu mong đợi (Positive Signals)
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                              {item.expected_signals.map((sig, sIdx) => (
                                <li key={sIdx}>{sig}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.red_flags && item.red_flags.length > 0 && (
                          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                            <span className="font-bold text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                              <ShieldAlert className="size-3.5" /> Dấu hiệu cần tránh (Red Flags)
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                              {item.red_flags.map((rf, rIdx) => (
                                <li key={rIdx}>{rf}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {item.sample_good_answer && (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                          <span className="font-bold text-primary text-[11px]">Gợi ý cấu trúc trả lời chuẩn STAR:</span>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.sample_good_answer}</p>
                        </div>
                      )}

                      {item.follow_up_probes && item.follow_up_probes.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-muted-foreground text-[11px]">Câu hỏi phụ đào sâu (Follow-up Probes):</span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                            {item.follow_up_probes.map((probe, pIdx) => (
                              <li key={pIdx}>{probe}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
