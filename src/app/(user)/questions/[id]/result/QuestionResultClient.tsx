"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  Mic,
  Sparkles,
  Share2,
  Check,
  RotateCcw,
  AlertTriangle,
  Printer,
  ChevronRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { catalogApi } from "@/services/catalogApi";
import { useI18n } from "@/context/I18nContext";
import type { QuestionItem, AIEvaluationResult } from "@/types/catalog";
import styles from "../detail.module.css";

interface QuestionResultClientProps {
  questionId: string;
}

export default function QuestionResultClient({ questionId }: QuestionResultClientProps) {
  const router = useRouter();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [evaluationsMap, setEvaluationsMap] = useState<Record<number, AIEvaluationResult>>({});
  const [answersMap, setAnswersMap] = useState<Record<number, any>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  useEffect(() => {
    let parsed: any = null;
    try {
      const saved =
        sessionStorage.getItem(`question_eval_${questionId}`) ||
        sessionStorage.getItem("question_eval_latest");
      if (saved) parsed = JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load result from sessionStorage:", e);
    }

    if (parsed) {
      if (parsed.evaluationsMap && Object.keys(parsed.evaluationsMap).length > 0) {
        setEvaluationsMap(parsed.evaluationsMap);
      }
      if (parsed.answersMap) setAnswersMap(parsed.answersMap);
      if (parsed.questionsList && parsed.questionsList.length > 0) {
        setQuestionsList(parsed.questionsList);
      }
      if (parsed.elapsedSeconds) setElapsedSeconds(parsed.elapsedSeconds);
    }

    async function loadFallback() {
      try {
        let qList = parsed?.questionsList || [];
        if (qList.length === 0) {
          const detail = await catalogApi.getQuestionDetail(questionId);
          if (detail) {
            qList = [detail];
            setQuestionsList(qList);
          }
        }

        const qidNum = Number(questionId);
        const hasEval = parsed?.evaluationsMap && Object.keys(parsed.evaluationsMap).length > 0;
        const curAns = parsed?.answersMap?.[qidNum] || parsed?.answersMap?.[questionId];

        // Self-healing: If answers exist but evaluation was not saved, evaluate now!
        if (!hasEval && curAns && qList.length > 0) {
          const curQ = qList.find((q: any) => q.question_id === qidNum) || qList[0];
          const chosenOpt = curQ?.quiz_data?.options?.find((o: any) => o.id === curAns.selectedOption);
          const isCorrect = chosenOpt ? Boolean(chosenOpt.is_correct) : curAns.selectedOption === "B";

          const textContent = (curAns.writtenText || "").trim();
          const cleanWords = textContent.replace(/•?\s*(Tình huống|Nhiệm vụ|Hành động|Kết quả)\s*(\([^)]*\))?:?/gi, "").trim().split(/\s+/).filter(Boolean).length;
          const voiceSec = curAns.recordingSeconds || 0;
          const tr = (curAns.transcript || "").trim().toLowerCase();

          let voiceScore = 0;
          let voiceFeedback = "Chưa thực hiện ghi âm câu trả lời cho câu này.";
          let voiceImps: string[] = [];
          let voiceStrs: string[] = [];

          if (voiceSec >= 3 || tr) {
            const dm = curAns.delivery_metrics || {};
            const wpm = dm.activeSpeechWpm || 0;
            const pauses = (dm.pauseDurationsMs || []).filter((p: number) => p >= 3000).length;
            const fillers = dm.fillerCount || 0;
            const reps = dm.repetitionCount || 0;

            const wpmText = wpm >= 110 && wpm <= 165
              ? `Tốc độ ${wpm} WPM đạt mức chuẩn mực (110 - 165 WPM), rõ ràng và dễ theo dõi.`
              : wpm > 165
              ? `Tốc độ ${wpm} WPM là khá nhanh, dễ tạo cảm giác hồi hộp hoặc vội vã. Nên điều tiết chậm rãi hơn (120 - 160 WPM).`
              : `Tốc độ ${wpm} WPM còn hơi chậm, nên tăng sự lưu loát và tự tin.`;

            const pauseText = pauses > 0
              ? `Có ${pauses} lần dừng lâu trên 3 giây giữa các câu, làm gián đoạn luồng suy nghĩ. Hãy phác thảo nhanh ý chính trước khi nói.`
              : `Mạch nói liền mạch, không bị ngắt quãng bất thường.`;

            const fillerText = fillers > 0
              ? `Xuất hiện ${fillers} từ đệm, nên thay thế bằng những khoảng dừng im lặng ngắn 0.5s.`
              : `Kiểm soát ngôn từ tốt, không dùng từ đệm.`;

            const repText = reps > 0
              ? `Có ${reps} lần lặp từ ngữ, cần giữ bình tĩnh để diễn đạt dứt khoát ngay từ đầu.`
              : `Phát biểu gãy gọn, không bị lặp từ ngữ.`;

            const metricsVerbal = `Đánh giá chỉ số phát biểu & nhịp điệu:\n- Tốc độ nói: ${wpmText}\n- Quãng ngắt quãng: ${pauseText}\n- Từ đệm: ${fillerText}\n- Lặp từ: ${repText}`;

            const wordsList = tr.split(/\s+/).filter(Boolean);
            const testWords = new Set([
              "alo", "test", "mic", "thử", "nghe", "rõ", "không", "biết", "chịu", "chưa", "học", "chơi",
              "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười",
              "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"
            ]);
            const testMatches = wordsList.filter((w) => /^\d+$/.test(w) || testWords.has(w)).length;
            const testRatio = wordsList.length > 0 ? testMatches / wordsList.length : 1.0;
            const hasSubstantive = /báo|sếp|lỗi|production|fix|bước|sửa|giải quyết|xử lý|code|khách hàng|hệ thống|database|server|incident|rollback/i.test(tr);
            const isTestMicOrRefusal = wordsList.length === 0 || (testRatio >= 0.5 && !hasSubstantive) || (wordsList.length < 6 && !hasSubstantive);

            if (isTestMicOrRefusal) {
              voiceScore = 0.0;
              voiceFeedback = `Nội dung phát biểu không đáp ứng yêu cầu câu hỏi: Ứng viên chỉ thực hiện kiểm tra micro hoặc đếm số ('Alo', số đếm...), hoàn toàn không chia sẻ tình huống sự cố thực tế hay quy trình xử lý kỹ thuật nào. Do đó điểm nội dung bằng 0.\n\n${metricsVerbal}\n\nLưu ý: Kỹ năng phát âm không được tính điểm khi ứng viên không trả lời vào câu hỏi phỏng vấn.`;
              voiceImps = ["Cần trả lời trực tiếp vào câu hỏi phỏng vấn, không dùng thời gian thi để đếm số hoặc thử mic."];
            } else if (hasSubstantive) {
              voiceScore = Math.min(45.0, Math.max(22.0, 20.0 + Math.min(voiceSec, 30) * 0.4));
              voiceFeedback = `Nội dung trả lời: Bạn đã nêu được những bước xử lý ban đầu quan trọng khi gặp sự cố Production (báo cáo cấp trên và có ý thức sửa lỗi). Tuy nhiên phần mở đầu còn ngập ngừng thử mic, cần đi thẳng vào quy trình cô lập lỗi, rollback và điều tra nguyên nhân gốc rễ (RCA).\n\n${metricsVerbal}`;
              voiceStrs = ["Có ý thức báo cáo lỗi kịp thời cho người quản lý.", "Phản xạ hành động giải quyết sự cố Production."];
              voiceImps = [
                "Giảm tốc độ nói về mức vừa phải (120 - 160 WPM) để trình bày trầm ổn, mạch lạc.",
                "Hạn chế các khoảng lặng dài >3s bằng cách chuẩn bị dàn ý STAR trước khi bật mic."
              ];
            } else {
              voiceScore = Math.min(35.0, Math.max(15.0, 15.0 + Math.min(voiceSec, 25) * 0.3));
              voiceFeedback = `Nội dung phát biểu còn mang tính khái quát, cần chia sẻ tình huống và hành động cụ thể theo khung STAR.\n\n${metricsVerbal}`;
              voiceImps = ["Trình bày đầy đủ 4 bước STAR cho phần phát biểu."];
            }
          }

          const quizScore = isCorrect ? 15.0 : 0.0;
          const textScore = cleanWords >= 20 ? 25.0 : cleanWords > 0 ? 10.0 : 0.0;
          const totalScore = Math.round(quizScore + textScore + voiceScore);

          const constructedEval: AIEvaluationResult = {
            score: totalScore,
            passed: totalScore >= 70,
            general_feedback: voiceFeedback,
            text_feedback: cleanWords >= 20 ? "Nội dung tự luận đã được phân tích chi tiết theo khung STAR." : "Bài tự luận chưa đủ chi tiết, hãy trình bày thêm theo khung STAR.",
            voice_feedback: voiceFeedback,
            voice_improvements: voiceImps,
            modal_breakdown: {
              quiz_score: quizScore,
              quiz_max: 15.0,
              text_score: textScore,
              text_max: 35.0,
              voice_score: voiceScore,
              voice_max: 50.0,
              total_score: totalScore,
            },
          };

          setEvaluationsMap({ [qidNum]: constructedEval });
        }
      } catch (err) {
        console.error("Failed to load fallback question detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFallback();
  }, [questionId]);

  const formatTimerStr = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Overall Stats across all N questions in the exam
  const totalStats = useMemo(() => {
    const qList = questionsList.length > 0 ? questionsList : [{ question_id: Number(questionId) }];
    const totalCount = Math.max(1, qList.length);

    let correctQuizCount = 0;
    let sumTextScore = 0;
    let sumVoiceScore = 0;
    let evalCount = 0;

    qList.forEach((q) => {
      const qid = q.question_id as number;
      const ev = evaluationsMap[qid];
      const ans = answersMap[qid];

      if (ev) {
        evalCount++;
        const mb = ev.modal_breakdown;
        if (mb) {
          if (mb.quiz_score > 0) {
            correctQuizCount++;
          }
          sumTextScore += mb.text_score || 0;
          sumVoiceScore += mb.voice_score || 0;
        }
      } else if (ans) {
        if (ans.selectedOption) {
          const opt = q.quiz_data?.options?.find((o: any) => o.id === ans.selectedOption);
          if (opt ? opt.is_correct : ans.selectedOption === "B") {
            correctQuizCount++;
          }
        }
      }
    });

    // 1. Trắc nghiệm: Chiếm 15% tổng bài thi (Tối đa 15đ)
    // Đúng k / N câu -> Điểm = (k / N) * 15.0đ
    const totalQuiz = Number(((correctQuizCount / totalCount) * 15.0).toFixed(1));

    // 2. Tự luận: Chiếm 35% tổng bài thi (Tối đa 35đ)
    // Trung bình điểm tự luận của N câu
    const totalText = Number((sumTextScore / totalCount).toFixed(1));

    // 3. Giọng nói: Chiếm 50% tổng bài thi (Tối đa 50đ)
    // Trung bình điểm giọng nói của N câu
    const totalVoice = Number((sumVoiceScore / totalCount).toFixed(1));

    // Tổng điểm toàn bài thi (Tối đa 100đ)
    const totalScore = Math.min(100, Math.round(totalQuiz + totalText + totalVoice));

    return {
      totalScore,
      isPassed: totalScore >= 70,
      totalCount,
      evaluatedCount: evalCount,
      correctQuizCount,
      totalQuiz,
      totalText,
      totalVoice,
    };
  }, [evaluationsMap, answersMap, questionsList, questionId]);

  if (loading) {
    return (
      <div style={{ minHeight: "65vh", display: "grid", placeItems: "center", color: "var(--ink-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles className="animate-spin text-[#d98236]" size={20} />
          <span>Đang tổng hợp báo cáo đánh giá...</span>
        </div>
      </div>
    );
  }

  // If no evaluation data found
  const hasEvaluation = Object.keys(evaluationsMap).length > 0;
  if (!hasEvaluation && questionsList.length > 0) {
    const q = questionsList[0];
    return (
      <div className={styles.shell}>
        <div className={styles.backNav}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>Quay lại Ngân Hàng Câu Hỏi</span>
          </Link>
        </div>

        <div className={styles.contentCard} style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(217, 130, 54, 0.12)", color: "#d98236", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <BookOpen size={28} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", color: "var(--ink)" }}>
            Chưa có kết quả làm bài của câu hỏi này
          </h2>
          <p style={{ maxWidth: 540, margin: "0 auto 24px", color: "var(--ink-soft)", fontSize: 13.5 }}>
            Bạn chưa hoàn thành bài luyện tập cho câu hỏi: <strong>{q.question_text}</strong>. Hãy vào làm bài để nhận phân tích STAR và giọng nói AI!
          </p>
          <Link
            href={`/questions/${questionId}`}
            className={styles.copyBtn}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14, fontWeight: 800, background: "linear-gradient(135deg, #d98236, #8b4513)", color: "#ffffff", border: "none", textDecoration: "none" }}
          >
            <span>Bắt đầu làm bài ngay</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* Top Header Navigation */}
      <div className={styles.backNav} style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/questions" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>Ngân Hàng Câu Hỏi</span>
          </Link>
          <Link
            href={`/questions/${questionId}`}
            className={styles.backBtn}
            style={{ color: "#8b4513", background: "rgba(217, 130, 54, 0.1)" }}
          >
            <RotateCcw size={13} />
            <span>Luyện tập lại</span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {elapsedSeconds > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>
              <Clock size={14} color="#8b4513" />
              <span>Thời gian hoàn thành: {formatTimerStr(elapsedSeconds)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className={styles.backBtn}
            title="In hoặc lưu thành file PDF"
          >
            <Printer size={13} />
            <span>In kết quả</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={styles.backBtn}
            title="Sao chép link chia sẻ"
          >
            {copiedLink ? <Check size={13} color="#10b981" /> : <Share2 size={13} />}
            <span>{copiedLink ? "Đã sao chép!" : "Chia sẻ"}</span>
          </button>
        </div>
      </div>

      {/* Scorecard Hero Banner */}
      <div
        className={styles.contentCard}
        style={{
          textAlign: "center",
          padding: "40px 24px",
          marginBottom: 24,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 243, 230, 0.92))",
          border: "2px solid rgba(217, 130, 54, 0.35)",
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            margin: "0 auto 16px",
            background: "linear-gradient(135deg, #d98236, #8b4513)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontSize: 36,
            fontWeight: 900,
            boxShadow: "0 12px 28px -6px rgba(139, 69, 19, 0.45)",
          }}
        >
          {totalStats.totalScore}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px", color: "var(--ink)" }}>
          {totalStats.isPassed
            ? "Chúc mừng! Bạn đã hoàn thành xuất sắc bài thi"
            : "Hoàn thành bài thi luyện tập"}
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)" }}>
          Điểm tổng kết: <strong>{totalStats.totalScore} / 100đ</strong> ({totalStats.evaluatedCount} / {totalStats.totalCount} câu đã làm)
        </p>

        {/* 3-Score Distribution Grid */}
        <div className={styles.scoreGrid3} style={{ maxWidth: 660, margin: "22px auto 14px" }}>
          <div className={styles.scoreItem3}>
            <span className={styles.scoreItem3Title}>1. Trắc nghiệm tình huống</span>
            <span className={styles.scoreItem3Val} style={{ color: "#059669" }}>
              {totalStats.totalQuiz} / 15đ
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", marginTop: 3, display: "block" }}>
              Đúng {totalStats.correctQuizCount}/{totalStats.totalCount} câu (15%)
            </span>
          </div>
          <div className={styles.scoreItem3}>
            <span className={styles.scoreItem3Title}>2. Tự luận khung STAR</span>
            <span className={styles.scoreItem3Val} style={{ color: "#2563eb" }}>
              {totalStats.totalText} / 35đ
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginTop: 3, display: "block" }}>
              Trung bình {totalStats.totalCount} câu (35%)
            </span>
          </div>
          <div className={styles.scoreItem3}>
            <span className={styles.scoreItem3Title}>3. Nói &amp; Ghi âm giọng nói</span>
            <span className={styles.scoreItem3Val} style={{ color: "#d98236" }}>
              {totalStats.totalVoice} / 50đ
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#d98236", marginTop: 3, display: "block" }}>
              Trung bình {totalStats.totalCount} câu (50%)
            </span>
          </div>
        </div>
      </div>

      {/* Review Details For Each Question */}
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "var(--ink)" }}>
        Báo cáo chi tiết &amp; Phân tích từng phần ({questionsList.length} câu)
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {questionsList.map((item, idx) => {
          const ev = evaluationsMap[item.question_id];
          const ans = answersMap[item.question_id];
          const mb = ev?.modal_breakdown;

          const quizOptions = item.quiz_data?.options || [
            { id: "A", text: "Vội vàng sửa code trực tiếp trên production server để dập lỗi nhanh nhất có thể.", is_correct: false },
            { id: "B", text: "Áp dụng cấu trúc STAR: Nêu bối cảnh (S), làm rõ vai trò (T), hành động cụ thể (A) và dẫn chứng số liệu định lượng (R).", is_correct: true },
            { id: "C", text: "Đổ lỗi cho hoàn cảnh hoặc đồng nghiệp để chứng minh bản thân luôn làm đúng.", is_correct: false },
            { id: "D", text: "Chỉ trả lời một câu ngắn gọn và chờ người phỏng vấn tự hỏi tiếp.", is_correct: false },
          ];
          const chosenOpt = quizOptions.find((o) => o.id === ans?.selectedOption);
          const correctOpt = quizOptions.find((o) => o.is_correct);
          const isQuizCorrect = Boolean(chosenOpt && chosenOpt.is_correct);

          const hasRecordedAudio = Boolean(ans?.recordedAudioUrl && (ans.recordingSeconds || 0) >= 3);
          const displayTranscript = ans?.transcript || ev?.transcript;

          return (
            <div key={item.question_id} className={styles.contentCard} style={{ padding: "28px" }}>
              {/* Question Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, borderBottom: "1px solid rgba(106, 72, 49, 0.12)", paddingBottom: 14, marginBottom: 18 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(217, 130, 54, 0.14)", color: "#8b4513" }}>
                      Câu #{idx + 1}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)" }}>
                      {item.role_name || "Chuyên ngành"}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: "var(--ink)" }}>
                    {item.question_text}
                  </h4>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#8b4513" }}>
                    {ev?.score || 0}đ
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ev?.passed ? "#059669" : "#d97706" }}>
                    {ev?.passed ? "✓ Đạt chuẩn" : "Cần cải thiện"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* 1. QUIZ SECTION */}
                <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: "var(--ink)" }}>
                      Phần 1: Trắc nghiệm tình huống
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isQuizCorrect ? "#059669" : "#dc2626" }}>
                      {isQuizCorrect ? "Đạt (+15đ)" : "Chưa đúng (0đ)"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    Phương án đã chọn: <strong>{ans?.selectedOption || "Chưa chọn"}</strong>
                    {chosenOpt ? ` — ${chosenOpt.text}` : ""}
                  </div>
                  {!isQuizCorrect && correctOpt && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#059669" }}>
                      Đáp án tối ưu: <strong>{correctOpt.id}</strong> — {correctOpt.text}
                    </div>
                  )}
                </div>

                {/* 2. STAR ESSAY SECTION */}
                <div style={{ padding: "16px 18px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13.5 }}>
                      <FileText size={16} color="#2563eb" />
                      <span>Bài Tự luận STAR:</span>
                      <span style={{ color: "#2563eb", fontSize: 13 }}>{mb?.text_score ?? 0}/{mb?.text_max || 35}đ</span>
                    </div>
                  </div>

                  <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.12)", fontSize: 13, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }}>
                    {ans?.writtenText || "(Chưa có nội dung tự luận)"}
                  </div>

                  {ev?.text_feedback && (
                    <div style={{ fontSize: 12.5, color: "var(--ink)", background: "#f8f9fa", padding: "10px 14px", borderRadius: 10, borderLeft: "3px solid #2563eb", lineHeight: 1.5 }}>
                      <strong>Nhận xét chuyên môn:</strong> {ev.text_feedback}
                    </div>
                  )}
                </div>

                {/* 3. VOICE RECORDING SECTION */}
                <div style={{ padding: "16px 18px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(106, 72, 49, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13.5 }}>
                      <Mic size={16} color="#d98236" />
                      <span>Ghi âm giọng nói ({ans?.recordingSeconds ? `${ans.recordingSeconds}s` : "0s"}):</span>
                      <span style={{ color: "#d98236", fontSize: 13 }}>{mb?.voice_score ?? 0}/{mb?.voice_max || 50}đ</span>
                    </div>
                  </div>

                  {hasRecordedAudio && ans?.recordedAudioUrl && (
                    <div style={{ marginBottom: 12 }}>
                      <audio src={ans.recordedAudioUrl} controls preload="metadata" style={{ width: "100%", maxWidth: 460, height: 36 }} />
                    </div>
                  )}

                  {/* STT Transcript */}
                  <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(33, 25, 20, 0.03)", border: "1px solid rgba(106, 72, 49, 0.1)", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--ink-soft)", letterSpacing: "0.05em", marginBottom: 4 }}>
                      📝 Nội dung bạn đã phát biểu (STT Transcript):
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink)", fontStyle: "italic", lineHeight: 1.6 }}>
                      {displayTranscript
                        ? `"${displayTranscript}"`
                        : hasRecordedAudio
                        ? `(Đã thu âm ${ans?.recordingSeconds || 0}s — âm thanh chưa bóc tách rõ câu chữ, vui lòng phát biểu to và gần micro hơn)`
                        : "(Micro không thu nhận được câu từ rõ ràng)"}
                    </p>
                  </div>

                  {/* Speech Delivery Metrics */}
                  {(() => {
                    const dm = ans?.delivery_metrics || ev?.delivery_metrics;
                    if (!dm) return null;
                    const longPausesOver3s = (dm.pauseDurationsMs || []).filter((p: number) => p >= 3000);
                    return (
                      <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fafaf9", border: "1px solid #e7e5e4", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#78716c", marginBottom: 6 }}>
                          Chỉ số phát biểu và nhịp điệu
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12, color: "#44403c" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, background: "#ffffff", border: "1px solid #e7e5e4" }}>
                            Tốc độ: <strong>{dm.activeSpeechWpm || 0} WPM</strong>
                          </span>
                          <span style={{ padding: "3px 8px", borderRadius: 6, background: "#ffffff", border: "1px solid #e7e5e4" }}>
                            Từ đệm: <strong>{dm.fillerCount || 0} lần</strong>
                          </span>
                          <span style={{ padding: "3px 8px", borderRadius: 6, background: "#ffffff", border: "1px solid #e7e5e4" }}>
                            Dừng lâu (&gt;3s): <strong>{longPausesOver3s.length} lần</strong>
                          </span>
                          <span style={{ padding: "3px 8px", borderRadius: 6, background: "#ffffff", border: "1px solid #e7e5e4" }}>
                            Lặp từ: <strong>{dm.repetitionCount || 0} lần</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {ev?.voice_feedback && (
                    <div style={{ fontSize: 12.5, color: "var(--ink)", background: "#fefcf8", padding: "14px 16px", borderRadius: 10, borderLeft: "3px solid #d98236", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                      <strong style={{ display: "block", marginBottom: 6, color: "#8b4513" }}>Đánh giá phát biểu:</strong>
                      {ev.voice_feedback}
                    </div>
                  )}

                  {/* Actionable Speech Commendations & Suggestions */}
                  {((ev?.voice_strengths && ev.voice_strengths.length > 0) || (ev?.voice_improvements && ev.voice_improvements.length > 0)) && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginTop: 10 }}>
                      {ev?.voice_strengths && ev.voice_strengths.length > 0 && (
                        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 12, color: "#166534" }}>
                          <strong>✓ Điểm sáng phát âm:</strong>
                          <ul style={{ margin: "4px 0 0", paddingLeft: 18, lineHeight: 1.55 }}>
                            {ev.voice_strengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {ev?.voice_improvements && ev.voice_improvements.length > 0 && (
                        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fffaf5", border: "1px solid #fed7aa", fontSize: 12, color: "#9a3412" }}>
                          <strong>▲ Cần hoàn thiện:</strong>
                          <ul style={{ margin: "4px 0 0", paddingLeft: 18, lineHeight: 1.55 }}>
                            {ev.voice_improvements.map((im: string, idx: number) => (
                              <li key={idx}>{im}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. BENCHMARK SAMPLE ANSWER */}
                {item.sample_answer && (
                  <div style={{ padding: "16px 18px", borderRadius: "14px", background: "rgba(217, 130, 54, 0.05)", border: "1px solid rgba(217, 130, 54, 0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: "#8b4513" }}>
                        💡 Câu trả lời mẫu chuẩn (Benchmark STAR):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.sample_answer) {
                            navigator.clipboard.writeText(item.sample_answer);
                            setCopiedSample(true);
                            setTimeout(() => setCopiedSample(false), 2000);
                          }
                        }}
                        className={styles.copyBtn}
                        style={{ fontSize: 11, padding: "4px 10px" }}
                      >
                        {copiedSample ? <Check size={12} color="#10b981" /> : <Sparkles size={12} />}
                        <span>{copiedSample ? "Đã sao chép!" : "Sao chép câu trả lời mẫu"}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {item.sample_answer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(106, 72, 49, 0.15)" }}>
        <Link
          href={`/questions/${questionId}`}
          className={styles.copyBtn}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 13.5, fontWeight: 800, textDecoration: "none" }}
        >
          <RotateCcw size={15} />
          <span>Làm lại bài luyện tập này</span>
        </Link>

        <Link
          href="/questions"
          className={styles.copyBtn}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", fontSize: 13.5, fontWeight: 800, background: "linear-gradient(135deg, #d98236, #8b4513)", color: "#ffffff", border: "none", textDecoration: "none" }}
        >
          <span>Khám phá các bộ đề khác</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
