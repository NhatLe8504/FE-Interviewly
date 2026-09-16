"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  volume: number;
  transcript: string;
  interimTranscript: string;
  audioBlob: Blob | null;
  error: string | null;
  isSpeechRecognitionSupported: boolean;
  startRecording: (language?: string) => Promise<boolean>;
  stopRecording: () => Promise<{ transcript: string; audioBlob: Blob | null; duration: number }>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  setTranscript: (val: string | ((prev: string) => string)) => void;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  // References to Web Audio & MediaRecorder objects
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSpeechRecognitionSupported(Boolean(SpeechRecognition));
    }
  }, []);

  // Continuous volume meter loop
  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Map average (0-255) to 0-100 scale with slight amplification for sensitivity
    const calculatedVolume = Math.min(100, Math.round((average / 128) * 100));
    setVolume(calculatedVolume);

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  }, []);

  // Cleanup helper
  const stopAllAudioResources = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
    setVolume(0);
  }, []);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      stopAllAudioResources();
    };
  }, [stopAllAudioResources]);

  const startRecording = useCallback(
    async (language: string = "vi-VN"): Promise<boolean> => {
      setError(null);
      setAudioBlob(null);
      setInterimTranscript("");
      recordedChunksRef.current = [];

      try {
        // 1. Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        // 2. Audio Context & Analyser for real-time soundwave volume
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Start volume animation loop
        updateVolume();

        // 3. MediaRecorder for audio recording
        let mimeType = "audio/webm;codecs=opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          } else {
            mimeType = "";
          }
        }

        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.start(250); // Slice chunks every 250ms

        // 4. Web Speech API (Speech-to-Text)
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language === "en" || language === "en-US" ? "en-US" : "vi-VN";

            recognition.onresult = (event: any) => {
              let finalChunk = "";
              let interimChunk = "";

              for (let i = event.resultIndex; i < event.results.length; ++i) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalChunk += text + " ";
                } else {
                  interimChunk += text;
                }
              }

              if (finalChunk) {
                setTranscript((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
              }
              setInterimTranscript(interimChunk);
            };

            recognition.onerror = (event: any) => {
              // Non-fatal error during recognition
              if (event.error !== "no-speech") {
                console.warn("Speech recognition warning:", event.error);
              }
            };

            recognition.start();
            recognitionRef.current = recognition;
          } catch (speechErr) {
            console.warn("Speech recognition could not be started:", speechErr);
          }
        }

        // 5. Timer
        startTimeRef.current = Date.now();
        setDurationSeconds(0);
        durationTimerRef.current = setInterval(() => {
          setDurationSeconds((prev) => prev + 1);
        }, 1000);

        setIsRecording(true);
        setIsPaused(false);
        return true;
      } catch (err: any) {
        stopAllAudioResources();
        let msg = "Không thể truy cập micro.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          msg = "Quyền truy cập micro đã bị từ chối. Vui lòng cho phép quyền micro trong cài đặt trình duyệt.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          msg = "Không tìm thấy thiết bị micro nào trên thiết bị của bạn.";
        } else {
          msg = `Lỗi khởi động micro: ${err.message || err.name}`;
        }
        setError(msg);
        return false;
      }
    },
    [stopAllAudioResources, updateVolume]
  );

  const stopRecording = useCallback(async (): Promise<{
    transcript: string;
    audioBlob: Blob | null;
    duration: number;
  }> => {
    return new Promise((resolve) => {
      const finalDuration = durationSeconds;

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        stopAllAudioResources();
        setIsRecording(false);
        setIsPaused(false);
        resolve({
          transcript,
          audioBlob,
          duration: finalDuration,
        });
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const createdBlob =
          recordedChunksRef.current.length > 0
            ? new Blob(recordedChunksRef.current, { type: mimeType })
            : null;

        setAudioBlob(createdBlob);
        stopAllAudioResources();
        setIsRecording(false);
        setIsPaused(false);

        resolve({
          transcript,
          audioBlob: createdBlob,
          duration: finalDuration,
        });
      };

      try {
        mediaRecorderRef.current.stop();
      } catch {
        stopAllAudioResources();
        setIsRecording(false);
        setIsPaused(false);
        resolve({
          transcript,
          audioBlob: null,
          duration: finalDuration,
        });
      }
    });
  }, [audioBlob, durationSeconds, stopAllAudioResources, transcript]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      durationTimerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const resetRecording = useCallback(() => {
    stopAllAudioResources();
    setIsRecording(false);
    setIsPaused(false);
    setDurationSeconds(0);
    setVolume(0);
    setTranscript("");
    setInterimTranscript("");
    setAudioBlob(null);
    setError(null);
  }, [stopAllAudioResources]);

  return {
    isRecording,
    isPaused,
    durationSeconds,
    volume,
    transcript,
    interimTranscript,
    audioBlob,
    error,
    isSpeechRecognitionSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    setTranscript,
  };
}
