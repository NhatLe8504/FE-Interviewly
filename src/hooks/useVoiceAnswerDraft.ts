"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getInterviewLanguage } from "@/lib/interviewLanguages";

export type VoiceDraftState = "idle" | "requesting" | "recording" | "processing" | "review";

interface RecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface VoiceRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface VoiceDraftOptions {
  enabled: boolean;
  canRecord: boolean;
  autoListen: boolean;
  canInterrupt: boolean;
  aiSpeechText: string;
  onSpeechStart: () => void;
  language: string;
  onSubmit: (text: string, durationSeconds: number, audioBlob?: Blob | null) => boolean;
}

const AUTO_SEND_SILENCE_MS = 3000;

export function useVoiceAnswerDraft(options: VoiceDraftOptions) {
  const [state, setState] = useState<VoiceDraftState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sttSupported, setSttSupported] = useState(true);
  const [silenceRemaining, setSilenceRemaining] = useState<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [autoSubmit, setAutoSubmit] = useState(options.autoListen);
  useEffect(() => {
    setAutoSubmit(options.autoListen);
  }, [options.autoListen]);
  const autoSubmitRef = useRef(autoSubmit);
  autoSubmitRef.current = autoSubmit;
  const toggleAutoSubmit = useCallback(() => {
    setAutoSubmit((prev) => !prev);
  }, []);
  const stateRef = useRef<VoiceDraftState>("idle");
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const interruptedRef = useRef(false);
  const pendingSubmissionRef = useRef(false);
  const durationRef = useRef(0);
  const recentAiSpeechRef = useRef("");
  if (options.aiSpeechText.trim()) recentAiSpeechRef.current = options.aiSpeechText;
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const captureIdRef = useRef(0);
  const stopRef = useRef<(automatic?: boolean) => Promise<void>>(async () => {});
  const recognitionEndedRef = useRef<(() => void) | null>(null);

  const updateState = useCallback((next: VoiceDraftState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const releaseAudio = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close().catch(() => {});
    contextRef.current = null;
    recorderRef.current = null;
  }, []);

  const clearAudioUrl = useCallback(() => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    audioBlobRef.current = null;
    setAudioUrl(null);
  }, []);

  const discard = useCallback(() => {
    if (stateRef.current === "recording" || stateRef.current === "processing") return;
    captureIdRef.current += 1;
    pendingSubmissionRef.current = false;
    interruptedRef.current = false;
    clearAudioUrl();
    transcriptRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setDurationSeconds(0);
    setError(null);
    updateState("idle");
  }, [clearAudioUrl, updateState]);

  const cancelRecording = useCallback(() => {
    captureIdRef.current += 1;
    recognitionEndedRef.current?.();
    recognitionEndedRef.current = null;
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder?.state !== "inactive") recorder?.stop();
    releaseAudio();
    clearAudioUrl();
    transcriptRef.current = "";
    interimRef.current = "";
    pendingSubmissionRef.current = false;
    interruptedRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    setSilenceRemaining(null);
    setError(null);
    updateState("idle");
  }, [clearAudioUrl, releaseAudio, updateState]);

  const submit = useCallback(() => {
    if (stateRef.current !== "review") return;
    const answer = transcriptRef.current.trim();
    if (!answer) {
      setError("Chưa nhận diện được lời nói. Bạn có thể nhập lại nội dung hoặc thu âm lại.");
      return;
    }
    if (!optionsRef.current.canRecord || !optionsRef.current.onSubmit(answer, durationRef.current, audioBlobRef.current)) {
      setError("Chưa thể gửi lúc này. Bản thu vẫn được giữ lại; hãy đợi AI sẵn sàng hoặc kết nối lại.");
      return;
    }
    discard();
  }, [discard]);

  const startRecording = useCallback(async () => {
    const current = optionsRef.current;
    if (!current.enabled || (!current.canRecord && !current.canInterrupt) || !["idle", "review"].includes(stateRef.current)) return;
    const browser = window as typeof window & {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setSttSupported(false);
      setError("Trình duyệt chưa hỗ trợ thu âm và nhận diện giọng nói. Hãy chuyển sang nhập văn bản.");
      return;
    }
    const captureId = ++captureIdRef.current;
    interruptedRef.current = false;
    pendingSubmissionRef.current = false;
    updateState("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (captureId !== captureIdRef.current || !optionsRef.current.enabled ||
          (!optionsRef.current.canRecord && !optionsRef.current.canInterrupt)) {
        stream.getTracks().forEach((track) => track.stop());
        if (captureId === captureIdRef.current) updateState(audioUrlRef.current ? "review" : "idle");
        return;
      }
      streamRef.current = stream;
      const context = new AudioContext();
      contextRef.current = context;
      await context.resume();
      if (captureId !== captureIdRef.current) return;
      if (!optionsRef.current.enabled || (!optionsRef.current.canRecord && !optionsRef.current.canInterrupt)) {
        releaseAudio();
        updateState(audioUrlRef.current ? "review" : "idle");
        return;
      }
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((mime) => MediaRecorder.isTypeSupported(mime));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getInterviewLanguage(current.language).speechLocale;
      const startedAt = Date.now();
      let lastVoiceAt = startedAt;
      let hasVoice = false;
      let lastMeterAt = 0;
      let recognitionRunning = false;
      recognition.onresult = (event) => {
        if (captureId !== captureIdRef.current) return;
        let finalText = "";
        let interimText = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result.isFinal) finalText += `${result[0].transcript} `;
          else interimText += `${result[0].transcript} `;
        }
        if (optionsRef.current.autoListen && !interruptedRef.current) {
          const candidate = (finalText || interimText).toLowerCase().replace(/[.,!?;:]/g, "").trim();
          const aiSpeech = recentAiSpeechRef.current.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
          if (aiSpeech && candidate && aiSpeech.includes(candidate)) return;
          if (optionsRef.current.canInterrupt) {
            if (candidate.length < 4) return;
            interruptedRef.current = true;
            optionsRef.current.onSpeechStart();
          }
        }
        transcriptRef.current = [transcriptRef.current, finalText.trim()].filter(Boolean).join(" ");
        interimRef.current = interimText.trim();
        setTranscript(transcriptRef.current);
        setInterimTranscript(interimRef.current);
        lastVoiceAt = Date.now();
        hasVoice = true;
      };
      recognition.onerror = (event) => {
        if (captureId !== captureIdRef.current || event.error === "no-speech" || event.error === "aborted") return;
        setError(event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Quyền nhận diện giọng nói bị từ chối. Bản thu vẫn có thể nghe lại và nhập nội dung trước khi gửi."
          : "Nhận diện giọng nói bị gián đoạn. Hãy kiểm tra bản chép lời trước khi gửi.");
        void stopRef.current(false);
      };
      recognition.onend = () => {
        recognitionRunning = false;
        if (recognitionEndedRef.current) {
          recognitionEndedRef.current();
          recognitionEndedRef.current = null;
        } else if (captureId === captureIdRef.current && stateRef.current === "recording") {
          try {
            recognition.start();
            recognitionRunning = true;
          } catch {
            setError("Nhận diện đã dừng. Hãy kết thúc bản thu và kiểm tra nội dung trước khi gửi.");
            void stopRef.current(false);
          }
        }
      };
      stopRef.current = async (submitAfterStop = true) => {
        if (stateRef.current !== "recording" || captureId !== captureIdRef.current) return;
        updateState("processing");
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        setSilenceRemaining(null);
        setVolume(0);
        const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        durationRef.current = duration;
        setDurationSeconds(duration);
        const audioReady = new Promise<Blob>((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }));
          if (recorder.state === "inactive") resolve(new Blob(chunks, { type: recorder.mimeType }));
          else recorder.stop();
        });
        const textReady = new Promise<void>((resolve) => {
          if (!recognitionRunning) { resolve(); return; }
          const timeout = setTimeout(() => {
            recognitionEndedRef.current = null;
            recognition.onend = null;
            recognition.abort();
            resolve();
          }, 1500);
          recognitionEndedRef.current = () => { clearTimeout(timeout); resolve(); };
          try { recognition.stop(); } catch { recognitionEndedRef.current?.(); recognitionEndedRef.current = null; }
        });
        const [blob] = await Promise.all([audioReady, textReady]);
        if (captureId !== captureIdRef.current) return;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognitionRef.current = null;
        releaseAudio();
        clearAudioUrl();
        if (blob.size > 0) {
          audioBlobRef.current = blob;
          audioUrlRef.current = URL.createObjectURL(blob);
          setAudioUrl(audioUrlRef.current);
        }
        const answer = [transcriptRef.current, interimRef.current].filter(Boolean).join(" ").trim();
        transcriptRef.current = answer;
        interimRef.current = "";
        setTranscript(answer);
        setInterimTranscript("");
        updateState("review");
        if (submitAfterStop && optionsRef.current.enabled && answer) {
          if (!optionsRef.current.canRecord) pendingSubmissionRef.current = true;
          else if (optionsRef.current.onSubmit(answer, duration, blob)) discard();
          else setError("Không gửi được câu trả lời. Bản thu được giữ lại để bạn gửi lại.");
        } else if (!answer) {
          setError("Chưa nhận diện được lời nói. Nghe lại bản thu rồi nhập nội dung, hoặc thu âm lại.");
        }
      };
      recognition.start();
      recognitionRunning = true;
      recorder.start(250);
      clearAudioUrl();
      transcriptRef.current = "";
      interimRef.current = "";
      setTranscript("");
      setInterimTranscript("");
      setDurationSeconds(0);
      updateState("recording");
      const samples = new Uint8Array(analyser.fftSize);
      const meter = () => {
        if (captureId !== captureIdRef.current || stateRef.current !== "recording") return;
        const now = Date.now();
        if (now - lastMeterAt >= 80) {
          lastMeterAt = now;
          analyser.getByteTimeDomainData(samples);
          let energy = 0;
          for (const sample of samples) energy += ((sample - 128) / 128) ** 2;
          const rms = Math.sqrt(energy / samples.length);
          if (rms > 0.025) { lastVoiceAt = now; hasVoice = true; }
          setVolume(Math.min(100, Math.round(rms * 500)));
          setDurationSeconds(Math.floor((now - startedAt) / 1000));
          const silenceMs = now - lastVoiceAt;
          const canAutoSend = autoSubmitRef.current && hasVoice &&
            (!optionsRef.current.canInterrupt || interruptedRef.current) &&
            Boolean(transcriptRef.current || interimRef.current);
          setSilenceRemaining(canAutoSend && silenceMs > 800 ? Math.max(0, Math.ceil((AUTO_SEND_SILENCE_MS - silenceMs) / 1000)) : null);
          if (canAutoSend && silenceMs >= AUTO_SEND_SILENCE_MS) {
            void stopRef.current(true);
            return;
          }
        }
        frameRef.current = requestAnimationFrame(meter);
      };
      frameRef.current = requestAnimationFrame(meter);
    } catch (cause) {
      if (captureId !== captureIdRef.current) return;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      releaseAudio();
      const denied = cause instanceof DOMException && cause.name === "NotAllowedError";
      setError(denied ? "Micro bị từ chối. Hãy cấp quyền micro hoặc chuyển sang nhập văn bản." : "Không thể bắt đầu thu âm. Kiểm tra micro và thử lại.");
      updateState(audioUrlRef.current ? "review" : "idle");
    }
  }, [clearAudioUrl, discard, releaseAudio, updateState]);

  useEffect(() => {
    if (!options.enabled && state === "requesting") {
      captureIdRef.current += 1;
      releaseAudio();
      updateState(audioUrlRef.current ? "review" : "idle");
    }
    if ((!options.enabled || (!options.canRecord && !options.canInterrupt && !interruptedRef.current)) &&
        state === "recording") void stopRef.current(false);
    if (options.enabled && (options.canRecord || options.canInterrupt) && options.autoListen &&
        state === "idle" && !error) void startRecording();
  }, [options.enabled, options.canRecord, options.canInterrupt, options.autoListen, state, error, startRecording, releaseAudio, updateState]);

  useEffect(() => {
    if (state === "review" && options.canRecord && pendingSubmissionRef.current) {
      pendingSubmissionRef.current = false;
      submit();
    }
  }, [state, options.canRecord, submit]);

  useEffect(() => () => {
    captureIdRef.current += 1;
    recognitionEndedRef.current?.();
    recognitionEndedRef.current = null;
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }
    const recorder = recorderRef.current;
    if (recorder?.state !== "inactive") recorder?.stop();
    releaseAudio();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, [releaseAudio]);

  return {
    state, transcript, interimTranscript, audioUrl, durationSeconds, volume, error, sttSupported, audioBlob: audioBlobRef.current,
    autoSubmit, toggleAutoSubmit, silenceRemaining, startRecording, stopRecording: () => stopRef.current(true), cancelRecording, discard, submit,
    editTranscript: (text: string) => { transcriptRef.current = text; setTranscript(text); },
  };
}
