"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Link as LinkIcon,
  UploadCloud,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Layers,
  ShieldAlert,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";
import { jdInterviewApi, JDJobStatusResponse, InterviewScriptResult, ScriptItem } from "@/services/jdInterviewApi";
import { Button } from "@/components/ui/button";
import { Mascot } from "page-mascot";
import styles from "./jdInterviewWorkspace.module.css";

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
        res = await jdInterviewApi.submitText(jdText, durationMinutes);
      } else if (activeTab === "url") {
        if (!jdUrl.trim() || !jdUrl.startsWith("http")) {
          setErrorMessage("Vui lòng nhập đường link bài đăng tuyển dụng hợp lệ (http hoặc https).");
          setIsSubmitting(false);
          return;
        }
        res = await jdInterviewApi.submitUrl(jdUrl, durationMinutes);
      } else {
        if (!selectedFile) {
          setErrorMessage("Vui lòng chọn tệp tin JD định dạng PDF, DOCX hoặc TXT.");
          setIsSubmitting(false);
          return;
        }
        res = await jdInterviewApi.submitFile(selectedFile, durationMinutes);
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
      const sess = await jdInterviewApi.startSession(jobId);
      if (sess && sess.session_id) {
        try {
          sessionStorage.setItem(
            `session_metadata_${sess.session_id}`,
            JSON.stringify({
              roleLabel: sess.role,
              companyName: sess.company_name || "",
              levelLabel: sess.seniority,
              mode: "text",
              bargeInEnabled: true,
              selected_stages: ["warmup", "technical", "closing"],
            })
          );
        } catch {
          // ignore
        }
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
    <div className={styles.workspace}>
      {/* Configuration & Input Card */}
        <div className={styles.introHeader}>
          <div>
            <p className={styles.eyebrow}>MỘT BUỔI LUYỆN, ĐÚNG TRỌNG TÂM</p>
            <h1 className={styles.title}>
              Bắt đầu từ <em>công việc bạn muốn.</em>
            </h1>
            <p className={styles.intro}>
              Thêm mô tả công việc để AI chuẩn bị câu hỏi theo vị trí bạn đang ứng tuyển.
              JD tiếng Việt hay tiếng Anh đều được. Khi vào phòng, bạn chọn ngôn ngữ phỏng vấn
              và trả lời bằng giọng nói hoặc văn bản — theo cách thoải mái nhất.
            </p>
          </div>
          <Mascot
            directions="/mascots/fox-pixel-directions.webp"
            reactions="/mascots/fox-pixel-reactions.webp"
            size={96}
            label="Cáo pixel đồng hành luyện phỏng vấn"
            className={styles.mascot}
          />
        </div>
      <div className={`portal-panel ${styles.card}`}>
        {/* Input Method Tabs */}
        <div className={styles.inputSection}>
          <div className={styles.methodTabs} role="group" aria-label="Nguồn mô tả công việc">
            <Button
              type="button"
              variant="home-tab"
              onClick={() => { setActiveTab("text"); setErrorMessage(null); }}
              aria-pressed={activeTab === "text"}
            >
              <FileText size={16} aria-hidden="true" />
              <span>Dán nội dung JD</span>
            </Button>
            <Button
              type="button"
              variant="home-tab"
              onClick={() => { setActiveTab("url"); setErrorMessage(null); }}
              aria-pressed={activeTab === "url"}
            >
              <LinkIcon size={16} aria-hidden="true" />
              <span>Đường dẫn tuyển dụng</span>
            </Button>
            <Button
              type="button"
              variant="home-tab"
              onClick={() => { setActiveTab("file"); setErrorMessage(null); }}
              aria-pressed={activeTab === "file"}
            >
              <UploadCloud size={16} aria-hidden="true" />
              <span>Tải tệp lên</span>
            </Button>
          </div>

          {/* Tab 1: Raw Text */}
          {activeTab === "text" && (
            <div className="space-y-2">
              <label htmlFor="jd-textarea" className="portal-field-label">
                Nội dung mô tả công việc
              </label>
              <textarea
                id="jd-textarea"
                rows={7}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Dán toàn bộ nội dung tin tuyển dụng vào đây... Ví dụ: Vị trí Senior Backend Engineer, 3 năm kinh nghiệm Python, FastAPI, PostgreSQL..."
                className="portal-input"
                aria-describedby="jd-text-help"
              />
              <p id="jd-text-help" className="portal-help-text">Nhập ít nhất 30 ký tự. Nên có vị trí, yêu cầu và trách nhiệm công việc.</p>
            </div>
          )}

          {/* Tab 2: URL */}
          {activeTab === "url" && (
            <div className="space-y-2">
              <label htmlFor="jd-url-input" className="portal-field-label">
                Đường dẫn liên kết bài đăng tuyển dụng công khai
              </label>
              <input
                id="jd-url-input"
                type="url"
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                placeholder="https://topcv.vn/viec-lam/... hoặc https://linkedin.com/jobs/view/..."
                className="portal-input"
                aria-describedby="jd-url-help"
              />
              <p id="jd-url-help" className="portal-help-text">
                Dùng đường dẫn công khai. Nếu trang tuyển dụng chặn truy cập, bạn có thể dán nội dung JD trực tiếp.
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.fileDropzone}
                aria-describedby="jd-file-help"
              >
                <UploadCloud size={24} aria-hidden="true" />
                <span className={styles.fileName}>{selectedFile ? selectedFile.name : "Chọn tệp mô tả công việc"}</span>
                <span id="jd-file-help" className="portal-help-text">PDF, DOCX, TXT hoặc Markdown · Tối đa 10MB</span>
              </button>
            </div>
          )}
        </div>

        <div className={styles.optionsGrid}>
          <div className="space-y-1.5">
            <span className="portal-field-label">Thời lượng dự kiến</span>
            <div className={styles.optionButtons} role="group" aria-label="Thời lượng dự kiến">
              {[30, 45, 60].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant="home-choice"
                  onClick={() => setDurationMinutes(mins)}
                  className="flex-1"
                  aria-pressed={durationMinutes === mins}
                >
                  {mins} phút
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.roomNote}>
            <p>Bạn chưa cần quyết định mọi thứ.</p>
            <span>Ngôn ngữ và cách trả lời có thể chọn ngay trong phòng phỏng vấn.</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.errorAlert} role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <Button
            type="button"
            variant="home-primary"
            disabled={isSubmitting || (jobState?.status && jobState.status !== "COMPLETED" && jobState.status !== "FAILED")}
            onClick={handleStartGeneration}
            className={styles.submitAction}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : (
              <>
                <span>Tạo câu hỏi phỏng vấn</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Stepper & Live State */}
      {jobState && (
        <div className={`portal-panel ${styles.card}`}>
          <div className={styles.progressHeader}>
            <div className="flex items-center gap-3">
              <div className={styles.progressNumber}>
                {jobState.progress_pct}%
              </div>
              <div className={styles.progressHeading}>
                <h3>{jobState.status === "COMPLETED" ? "Buổi luyện đã sẵn sàng" : jobState.status === "FAILED" ? "Chưa thể chuẩn bị buổi luyện" : "Đang chuẩn bị buổi luyện của bạn"}</h3>
                <p>{jobState.stage}</p>
              </div>
            </div>

            {jobState.status === "COMPLETED" ? (
              <span className={`${styles.progressStatus} ${styles.statusReady}`}>
                <CheckCircle2 className="size-3.5" /> Hoàn thành
              </span>
            ) : jobState.status === "FAILED" ? (
              <span className={`${styles.progressStatus} ${styles.statusFailed}`}>
                <AlertTriangle className="size-3.5" /> Thất bại
              </span>
            ) : (
              <span className={styles.progressStatus}>
                <Loader2 className="size-3.5 animate-spin" /> Đang xử lý
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className={styles.progressTrack} role="progressbar" aria-label="Chuẩn bị câu hỏi phỏng vấn" aria-valuemin={0} aria-valuemax={100} aria-valuenow={jobState.progress_pct}>
            <div
              className={styles.progressFill}
              style={{ width: `${jobState.progress_pct}%` }}
            />
          </div>

          {/* Stepper details */}
          <div className={styles.stepsGrid}>
            <div className={styles.step} data-complete={jobState.progress_pct >= 25}>
              1. Đọc mô tả công việc
            </div>
            <div className={styles.step} data-complete={jobState.progress_pct >= 45}>
              2. Phân tích yêu cầu
            </div>
            <div className={styles.step} data-complete={jobState.progress_pct >= 85}>
              3. Chuẩn bị câu hỏi
            </div>
            <div className={styles.step} data-complete={jobState.progress_pct >= 100}>
              4. Kiểm tra nội dung
            </div>
          </div>
        </div>
      )}

      {/* Blueprint & Script Review Section (Once Completed) */}
      {scriptResult && (
        <div className={`portal-panel ${styles.card}`}>
          <div className={styles.resultHeader}>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className={styles.resultTitle}>{scriptResult.role}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                  {scriptResult.seniority}
                </span>
              </div>
              <div className={styles.resultMeta}>
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

            <div className={styles.resultActions}>
              <Button
                type="button"
                variant="home-primary"
                onClick={() => router.push(`/practice/setup/${jobId}`)}
              >
                <SlidersHorizontal className="size-4" />
                <span>Thiết lập buổi luyện</span>
              </Button>

              <Button
                type="button"
                variant="home-outline"
                disabled={isStartingSession}
                onClick={handleLaunchInterview}
              >
                {isStartingSession ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-3.5 fill-current" />
                )}
                <span>Vào thẳng phòng</span>
              </Button>
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className={styles.questionsList}>
            <h4 className={styles.questionsHeading}>
              Những câu hỏi bạn sẽ luyện
            </h4>

            {scriptResult.questions.map((item, idx) => {
              const isExpanded = expandedQuestionIdx === idx;
              return (
                <div
                  key={idx}
                  className={styles.questionCard}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                    className={styles.questionToggle}
                    aria-expanded={isExpanded}
                    aria-controls={`jd-question-${item.order_index}`}
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
                        <span className={styles.difficultyLabel}>Độ khó {item.difficulty}/5</span>
                      </div>
                      <p className={styles.questionTitle}>
                        {item.question_text}
                      </p>
                    </div>

                    <div className="size-6 shrink-0 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mt-0.5">
                      {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div id={`jd-question-${item.order_index}`} className={styles.questionDetails}>
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
