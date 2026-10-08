"use client";

import { AlertCircle, AudioLines, Check, Headphones, Loader2, Mic, RotateCcw, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { useVoiceAnswerDraft } from "@/hooks/useVoiceAnswerDraft";
import { AudioWaveformVisualizer } from "./AudioWaveformVisualizer";
import styles from "./voiceAnswerPanel.module.css";

interface VoiceAnswerPanelProps {
  draft: ReturnType<typeof useVoiceAnswerDraft>;
  canRecord: boolean;
  isConnected: boolean;
  isAiSpeaking: boolean;
  onInterrupt: () => void;
  onSwitchToText: () => void;
}

export function VoiceAnswerPanel({ draft, canRecord, isConnected, isAiSpeaking, onInterrupt, onSwitchToText }: VoiceAnswerPanelProps) {
  const previewRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = previewRef.current;
    return () => { audio?.pause(); };
  }, [draft.audioUrl]);
  const submitDraft = () => { previewRef.current?.pause(); draft.submit(); };
  const recording = draft.state === "recording";
  const reviewing = draft.state === "review";
  const busy = draft.state === "processing" || draft.state === "requesting";
  const step = reviewing ? 2 : 1;
  const timer = `${Math.floor(draft.durationSeconds / 60).toString().padStart(2, "0")}:${(draft.durationSeconds % 60).toString().padStart(2, "0")}`;
  const title = recording ? "Đang thu câu trả lời của bạn" : reviewing ? "Nghe lại trước khi gửi" : busy ? "Đang chuẩn bị bản thu" : canRecord ? "Đến lượt bạn trả lời" : "Lắng nghe câu hỏi từ AI";

  return (
    <section className={`${styles.panel} ${recording ? styles.recording : ""}`} aria-labelledby="voice-answer-title">
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>CÂU TRẢ LỜI CỦA BẠN</span>
          <h2 id="voice-answer-title">{title}</h2>
          <p>{draft.autoSubmit ? "Chế độ tự động: ngừng nói 3 giây để gửi. Bạn vẫn có thể dừng để nghe lại." : "Bạn quyết định khi nào gửi. AI không nhận câu trả lời trong lúc bạn đang thu âm."}</p>
        </div>
        <button type="button" role="switch" aria-checked={draft.autoSubmit} aria-label="Tự động gửi câu trả lời sau khi ngừng nói" className={styles.autoToggle} onClick={draft.toggleAutoSubmit} disabled={busy}>
          <span className={styles.switchTrack}><span /></span>
          <span>Tự động gửi <strong>{draft.autoSubmit ? "Bật" : "Tắt"}</strong></span>
        </button>
      </div>
      <ol className={styles.steps} aria-label="Các bước trả lời">
        {["Thu câu trả lời", "Nghe lại & chỉnh sửa", "Gửi cho AI"].map((label, index) => (
          <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={step === index + 1 ? styles.currentStep : ""}>
            <span>{reviewing && index === 0 ? <Check size={13} /> : index + 1}</span>{label}
          </li>
        ))}
      </ol>
      {reviewing ? (
        <div className={styles.reviewArea}>
          <div className={styles.audioHeading}><Headphones size={18} /><strong>Bản thu của bạn</strong><span>{timer}</span></div>
          {draft.audioUrl ? <audio ref={previewRef} key={draft.audioUrl} controls preload="metadata" src={draft.audioUrl} aria-label="Nghe lại câu trả lời của bạn" /> : <p>Không có bản ghi âm để phát lại. Bạn vẫn có thể kiểm tra nội dung bên dưới.</p>}
          <label htmlFor="voice-answer-transcript">Nội dung AI sẽ nhận</label>
          <textarea id="voice-answer-transcript" value={draft.transcript} onChange={(event) => draft.editTranscript(event.target.value)} rows={4} placeholder="Sửa lỗi nhận diện hoặc nhập nội dung câu trả lời…" onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); submitDraft(); }
          }} />
          <p className={styles.helper}>Có thể chỉnh bản chép lời; bản thu gốc không thay đổi. Bản thu chỉ được giữ trên trình duyệt để nghe lại.</p>
        </div>
      ) : (
        <div className={styles.captureArea}>
          <div className={styles.captureIcon}>{busy ? <Loader2 size={24} className={styles.spinner} /> : recording ? <AudioLines size={25} /> : <Mic size={25} />}</div>
          {recording ? (
            <>
              <AudioWaveformVisualizer isRecording volume={draft.volume} barCount={32} height={40} />
              <span className={styles.recordingTimer}>{timer} <span>Đang thu âm</span></span>
              <p className={styles.liveTranscript}>{[draft.transcript, draft.interimTranscript].filter(Boolean).join(" ") || "Hãy nói tự nhiên. Nội dung nhận diện sẽ hiện ở đây…"}</p>
            </>
          ) : <p>{busy ? "Đợi hoàn tất âm thanh và bản chép lời…" : !isConnected ? "Đang chờ kết nối. Bản nháp chưa gửi sẽ được giữ lại." : canRecord ? "Nhấn bắt đầu, trả lời theo nhịp của bạn, rồi dừng để nghe lại." : "Micro đang tắt. Chỉ bắt đầu thu khi AI đã nói xong."}</p>}
        </div>
      )}
      {draft.silenceRemaining !== null && recording && <div className={styles.countdown} role="status">Tự gửi sau {draft.silenceRemaining} giây. Nói tiếp để tiếp tục thu, hoặc tắt Tự động gửi.</div>}
      {draft.error && <div className={styles.error} role="alert"><AlertCircle size={17} /><span>{draft.error}</span></div>}
      <div className={styles.actions}>
        <button type="button" className={styles.textButton} onClick={onSwitchToText}>Chuyển sang nhập văn bản</button>
        <div className={styles.primaryActions}>
          {reviewing ? (
            <>
              <button type="button" className={styles.secondaryButton} onClick={draft.discard} aria-label="Xóa bản nháp"><Trash2 size={17} /></button>
              <button type="button" className={styles.secondaryButton} onClick={() => { previewRef.current?.pause(); void draft.startRecording(); }} disabled={!canRecord || !draft.sttSupported}><RotateCcw size={17} />Thu lại</button>
              <button type="button" className={styles.primaryButton} onClick={submitDraft} disabled={!canRecord || !draft.transcript.trim()}><Send size={17} />Gửi câu trả lời</button>
            </>
          ) : recording ? (
            <button type="button" className={styles.stopButton} onClick={() => void draft.stopRecording()}><Square size={16} fill="currentColor" />Dừng & nghe lại</button>
          ) : isAiSpeaking ? (
            <button type="button" className={styles.secondaryButton} onClick={onInterrupt}><Square size={16} />Dừng AI để trả lời</button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={() => void draft.startRecording()} disabled={!canRecord || busy || !draft.sttSupported}>{busy ? <Loader2 size={17} className={styles.spinner} /> : <Mic size={17} />}Bắt đầu trả lời</button>
          )}
        </div>
      </div>
      <div className={styles.footer} role="status">{reviewing ? "Bản nháp chưa được gửi • Ctrl / ⌘ + Enter để gửi" : draft.autoSubmit ? "Tự động chỉ thu khi đến lượt bạn • Dừng & nghe lại để kiểm tra trước khi gửi" : "Chế độ thủ công • Không tự gửi khi bạn ngừng nói"}</div>
    </section>
  );
}
