"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Sparkles } from "lucide-react";
import { CV_COLOR_THEMES, CV_TEMPLATES_INFO } from "@/components/cv/cvThemes";
import { cvApi } from "@/services/cvApi";
import type { CvColorTheme, CvGenerationJob, CvTemplateId } from "@/types/cv";
import styles from "./cvSetup.module.css";

const COLOR_OPTIONS: { id: CvColorTheme; name: string }[] = [
  { id: "navy", name: "Xanh dương" },
  { id: "emerald", name: "Xanh lá" },
  { id: "crimson", name: "Đỏ trầm" },
  { id: "indigo", name: "Chàm" },
  { id: "amber", name: "Hổ phách" },
  { id: "slate", name: "Ghi đậm" },
];

export default function CvSetupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetJobId = searchParams.get("jobId");
  const taskId = searchParams.get("task");
  const initialRequest = useRef<{ key: string; promise: Promise<CvGenerationJob> } | null>(null);
  const answersLoadedFor = useRef<string | null>(null);
  const [hydratedJobId, setHydratedJobId] = useState<string | null>(null);
  const completionHandledFor = useRef<string | null>(null);
  const [job, setJob] = useState<CvGenerationJob | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [templateId, setTemplateId] = useState<CvTemplateId>("modern_tech");
  const [colorTheme, setColorTheme] = useState<CvColorTheme>("navy");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    if ("Notification" in window) setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!taskId && !targetJobId) {
      setError("Hãy chọn một tin tuyển dụng trước khi tạo CV.");
      return;
    }
    let active = true;
    const key = taskId || targetJobId!;
    const request = initialRequest.current?.key === key
      ? initialRequest.current.promise
      : taskId ? cvApi.getGeneration(taskId) : cvApi.startGeneration(targetJobId!);
    initialRequest.current = { key, promise: request };
    request.then((result) => {
      if (!active) return;
      setJob(result);
      window.history.replaceState(null, "", `/cv-builder/setup?jobId=${encodeURIComponent(result.target_job_id || targetJobId || "")}&task=${encodeURIComponent(result.job_id)}`);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Không thể chuẩn bị CV.");
    });
    return () => { active = false; };
  }, [targetJobId, taskId]);

  useEffect(() => {
    if (!job || job.status !== "QUESTIONS_READY" || answersLoadedFor.current === job.job_id) return;
    answersLoadedFor.current = job.job_id;
    let saved: { answers?: Record<string, string>; templateId?: CvTemplateId; colorTheme?: CvColorTheme } = {};
    try {
      const draft = JSON.parse(localStorage.getItem(`cv-answers-${job.job_id}`) || "{}");
      saved = draft && typeof draft === "object" && !Array.isArray(draft) ? draft : {};
    } catch { saved = {}; }
    setAnswers({ ...job.answers, ...(saved.answers && typeof saved.answers === "object" ? saved.answers : {}) });
    setHydratedJobId(job.job_id);
    setTemplateId(saved.templateId || job.template_id || "modern_tech");
    setColorTheme(saved.colorTheme || job.color_theme || "navy");
  }, [job]);

  useEffect(() => {
    if (!job || job.status !== "QUESTIONS_READY" || hydratedJobId !== job.job_id) return;
    try { localStorage.setItem(`cv-answers-${job.job_id}`, JSON.stringify({ answers, templateId, colorTheme })); }
    catch { setError("Không thể lưu nháp trên thiết bị này. Vui lòng hoàn thành trước khi rời trang."); }
  }, [answers, job, hydratedJobId, templateId, colorTheme]);

  const refresh = useCallback(async (jobId: string) => {
    const next = await cvApi.getGeneration(jobId);
    setJob(next);
    setError("");
  }, []);

  useEffect(() => {
    if (!job || !["PREPARING", "GENERATING"].includes(job.status)) return;
    let busy = false;
    const timer = window.setInterval(async () => {
      if (busy) return;
      busy = true;
      try { await refresh(job.job_id); } catch { setError("Mất kết nối tạm thời. Đang thử lại…"); }
      finally { busy = false; }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [job?.job_id, job?.status, refresh]);

  useEffect(() => {
    if (!job || job.status !== "COMPLETED" || !job.cv_id || completionHandledFor.current === job.job_id) return;
    completionHandledFor.current = job.job_id;
    localStorage.removeItem(`cv-answers-${job.job_id}`);
    void cvApi.acknowledgeGenerationNotification(job.job_id).catch(() => {});
    router.replace(`/cv-builder?id=${job.cv_id}`);
  }, [job, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job || working) return;
    setWorking(true);
    setError("");
    try {
      setJob(await cvApi.submitGenerationAnswers(job.job_id, answers, templateId, colorTheme));
    } catch (cause) {
      const current = await cvApi.getGeneration(job.job_id).catch(() => null);
      if (current && current.status !== "QUESTIONS_READY") setJob(current);
      else setError(cause instanceof Error ? cause.message : "Không thể gửi câu trả lời.");
    } finally { setWorking(false); }
  };

  const retry = async () => {
    if (!job || working) return;
    setWorking(true);
    setError("");
    try { setJob(await cvApi.retryGeneration(job.job_id)); }
    catch (cause) {
      const current = await cvApi.getGeneration(job.job_id).catch(() => null);
      if (current && current.status !== "FAILED") setJob(current);
      else setError(cause instanceof Error ? cause.message : "Không thể thử lại.");
    }
    finally { setWorking(false); }
  };

  const editAnswers = async () => {
    if (!job || working) return;
    setWorking(true);
    setError("");
    try { setJob(await cvApi.editGenerationAnswers(job.job_id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể mở lại câu trả lời."); }
    finally { setWorking(false); }
  };

  const restartInitialRequest = async () => {
    if ((!taskId && !targetJobId) || working) return;
    setWorking(true);
    setError("");
    try {
      const result = taskId ? await cvApi.getGeneration(taskId) : await cvApi.startGeneration(targetJobId!);
      setJob(result);
      window.history.replaceState(null, "", `/cv-builder/setup?jobId=${encodeURIComponent(result.target_job_id || "")}&task=${encodeURIComponent(result.job_id)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể chuẩn bị CV."); }
    finally { setWorking(false); }
  };

  const preparing = (!job && !error) || job?.status === "PREPARING";
  const generating = job?.status === "GENERATING";
  const doneCount = job?.questions.filter((question) => answers[question.id]?.trim()).length || 0;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link href={job?.target_job_id ? `/jobs/${job.target_job_id}` : "/jobs"} className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" /> Trở về tin tuyển dụng
        </Link>
        <header className={styles.header}>
          <div className={styles.kicker}><Sparkles size={15} aria-hidden="true" /> AI CV STUDIO · THEO VỊ TRÍ ỨNG TUYỂN</div>
          <h1>CV tốt bắt đầu từ <em>câu chuyện thật</em> của bạn.</h1>
          <p>AI đọc yêu cầu tuyển dụng, hỏi về kinh nghiệm của bạn rồi biên tập thành CV. Không tự điền thành tích hoặc kỹ năng bạn chưa cung cấp.</p>
          {job && <div className={styles.jobTag}><FileText size={17} aria-hidden="true" /><span>{job.job_title}{job.company_name ? ` · ${job.company_name}` : ""}</span></div>}
        </header>

        <div className={styles.steps} aria-label="Tiến trình tạo CV">
          <span className={preparing ? styles.activeStep : styles.finishedStep}>01 · Phân tích JD</span>
          <span className={job?.status === "QUESTIONS_READY" ? styles.activeStep : job?.answers && Object.keys(job.answers).length ? styles.finishedStep : ""}>02 · Chia sẻ kinh nghiệm</span>
          <span className={generating || job?.status === "COMPLETED" ? styles.activeStep : ""}>03 · AI biên tập CV</span>
        </div>

        {(preparing || generating || (job?.status === "COMPLETED" && Boolean(job.cv_id))) && (
          <section className={styles.statusCard} role="status" aria-live="polite">
            <div className={styles.orbit}><Loader2 size={33} className={styles.spin} aria-hidden="true" /></div>
            <span className={styles.cardEyebrow}>{generating ? "BƯỚC 03 / 03" : "ĐANG XỬ LÝ"}</span>
            <h2>{generating ? "Đang biên tập CV của bạn" : job?.status === "COMPLETED" ? "CV đã hoàn tất, đang mở trình chỉnh sửa" : "AI đang chuẩn bị câu hỏi từ JD"}</h2>
            <p>{generating ? "AI chỉ dùng thông tin bạn đã trả lời. Khi hoàn tất, CV sẽ mở trong trình chỉnh sửa." : "AI đang đọc yêu cầu công việc và chọn những điều cần hỏi về kinh nghiệm thực tế của bạn."}</p>
            <div className={styles.statusNote}>Bạn có thể rời trang. Tác vụ tiếp tục chạy và hệ thống sẽ thông báo khi hoàn tất.</div>
            {notificationPermission === "default" && <button type="button" className={styles.notifyButton}
              onClick={async () => {
                try { setNotificationPermission(await Notification.requestPermission()); }
                catch { setNotificationPermission("denied"); }
              }}>
              Bật thông báo trình duyệt khi rời tab
            </button>}
          </section>
        )}

        {job?.status === "QUESTIONS_READY" && (
          <form onSubmit={submit} className={styles.form}>
            <div className={styles.sectionHeading}>
              <div><span className={styles.cardEyebrow}>BƯỚC 02 / 03</span><h2>Cho AI biết về bạn</h2><p>Trả lời bằng thông tin thật; chưa có kinh nghiệm nào, bạn có thể nói rõ “chưa có”.</p></div>
              <span className={styles.counter}>{doneCount}/{job.questions.length} đã trả lời</span>
            </div>
            <div className={styles.questionList}>
              {job.questions.map((item, index) => (
                <div className={styles.question} key={item.id}>
                  <div className={styles.questionTop}><span>{String(index + 1).padStart(2, "0")}</span><label htmlFor={item.id}>{item.question}{item.required && <small> *</small>}</label></div>
                  {item.hint && <p className={styles.hint}>{item.hint}</p>}
                  <textarea id={item.id} rows={3} maxLength={3000} required={item.required} value={answers[item.id] || ""}
                    onChange={(event) => setAnswers((previous) => ({ ...previous, [item.id]: event.target.value }))}
                    placeholder="Viết câu trả lời của bạn ở đây…" />
                </div>
              ))}
            </div>
            <div className={styles.sectionHeading}><div><span className={styles.cardEyebrow}>CÁ NHÂN HÓA</span><h2>Chọn phong cách CV</h2><p>Bạn vẫn có thể thay đổi mẫu và màu trong trình chỉnh sửa sau khi tạo.</p></div></div>
            <div className={styles.templateGrid} role="group" aria-label="Chọn mẫu CV">
              {CV_TEMPLATES_INFO.map((template) => (
                <button type="button" key={template.id} aria-pressed={templateId === template.id}
                  className={`${styles.template} ${templateId === template.id ? styles.selected : ""}`}
                  onClick={() => setTemplateId(template.id)}>
                  <span className={styles.templateMini} data-template={template.id}><i /><i /><i /></span>
                  <span className={styles.templateText}><strong>{template.name}</strong><small>{template.description}</small></span>
                  {templateId === template.id && <Check size={18} className={styles.check} aria-hidden="true" />}
                </button>
              ))}
            </div>
            <div className={styles.colors} role="group" aria-label="Chọn màu nhấn CV">
              <strong>Màu nhấn</strong>
              {COLOR_OPTIONS.map((color) => (
                <button type="button" key={color.id} title={color.name} aria-label={color.name} aria-pressed={colorTheme === color.id}
                  className={colorTheme === color.id ? styles.selectedColor : styles.color}
                  style={{ background: CV_COLOR_THEMES[color.id].primary }} onClick={() => setColorTheme(color.id)}>
                  {colorTheme === color.id && <Check size={15} aria-hidden="true" />}
                </button>
              ))}
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.formFooter}><span>Câu trả lời được lưu tạm trên thiết bị khi bạn rời trang.</span>
              <button type="submit" disabled={working} className={styles.primary}>
                {working ? <Loader2 size={18} className={styles.spin} /> : <Sparkles size={18} />} {working ? "Đang gửi…" : "Tạo CV bằng AI"} <ArrowRight size={17} />
              </button>
            </div>
            {notificationPermission === "default" && <button type="button" className={styles.notifyButton}
              onClick={async () => {
                try { setNotificationPermission(await Notification.requestPermission()); }
                catch { setNotificationPermission("denied"); }
              }}>
              Bật thông báo trình duyệt khi rời tab
            </button>}
          </form>
        )}

        {job?.status === "FAILED" && (
          <section className={styles.statusCard} role="alert">
            <span className={styles.cardEyebrow}>CÓ THỂ THỬ LẠI</span>
            <h2>AI chưa hoàn thành bước này</h2>
            <p>{job.error_message || "Đã có lỗi khi tạo CV. Câu trả lời của bạn vẫn được giữ lại."}</p>
            <div className={styles.failureActions}>
              {job.questions.length > 0 && <button type="button" className={styles.secondary} disabled={working} onClick={editAnswers}>Chỉnh câu trả lời</button>}
              <button type="button" className={styles.primary} disabled={working} onClick={retry}>
                {working && <Loader2 size={18} className={styles.spin} />} Thử lại <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}
        {job?.status === "COMPLETED" && !job.cv_id && <section className={styles.statusCard} role="alert"><h2>CV này không còn khả dụng</h2><p>Bản CV có thể đã được xóa. Bạn có thể tạo lại từ tin tuyển dụng.</p><Link href={job.target_job_id ? `/cv-builder/setup?jobId=${encodeURIComponent(job.target_job_id)}` : "/jobs"} className={styles.primary}>Trở lại tin tuyển dụng</Link></section>}
        {!job && error && <section className={styles.statusCard} role="alert"><h2>Chưa thể bắt đầu</h2><p>{error}</p><div className={styles.failureActions}>{(taskId || targetJobId) && <button type="button" disabled={working} onClick={restartInitialRequest} className={styles.primary}>Thử lại <ArrowRight size={17} /></button>}<Link href="/jobs" className={styles.secondary}>Xem việc làm</Link></div></section>}
        {job?.status !== "QUESTIONS_READY" && job && error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </div>
  );
}
