"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DeliveryMetrics, SpeechTurnState, VADConfig } from "@/types/delivery";
import { WebAudioVADAnalyzer } from "@/lib/speech/audioAnalyzer";
import { BrowserSpeechRecognizer } from "@/lib/speech/speechRecognizer";
import { computeDeliveryMetrics } from "@/lib/speech/deliveryAnalyzer";

interface UseDeliveryVoiceRecorderOptions {
  language?: string;
  vadConfig?: Partial<VADConfig>;
  onAutoEndDetected?: () => void;
}

export function useDeliveryVoiceRecorder(options: UseDeliveryVoiceRecorderOptions = {}) {
  const { language = "vi-VN", vadConfig, onAutoEndDetected } = options;

  const [turnState, setTurnState] = useState<SpeechTurnState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [deliveryMetrics, setDeliveryMetrics] = useState<DeliveryMetrics | null>(null);

  // References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const vadAnalyzerRef = useRef<WebAudioVADAnalyzer | null>(null);
  const speechRecognizerRef = useRef<BrowserSpeechRecognizer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup all media resources safely
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (vadAnalyzerRef.current) {
      vadAnalyzerRef.current.stop();
      vadAnalyzerRef.current = null;
    }
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.abort();
      speechRecognizerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    cleanup();

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert("Trình duyệt không hỗ trợ truy cập microphone.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 1. Initialize MediaRecorder for Audio Playback & Enqueue
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      };

      recorder.start(250);

      // 2. Initialize VAD Analyzer with State Machine events
      setTurnState("calibrating");
      const vad = new WebAudioVADAnalyzer(
        {
          onSpeechStart: () => {
            setTurnState("speakingDetected");
          },
          onSpeechEnd: () => {
            setTurnState("paused");
          },
          onVolumeChange: (_rms, normLevel) => {
            setVolumeLevel(normLevel);
          },
          onAutoEndDetected: () => {
            onAutoEndDetected?.();
          },
        },
        vadConfig
      );
      vadAnalyzerRef.current = vad;
      await vad.start(stream);

      // 3. Initialize Browser Speech Recognizer
      const recognizer = new BrowserSpeechRecognizer(
        {
          onFinalTranscript: (finalText) => {
            setTranscript(finalText);
            setInterimTranscript("");
          },
          onInterimTranscript: (interimText) => {
            setInterimTranscript(interimText);
          },
          onError: (err) => {
            console.warn("Speech recognizer warning:", err);
          },
        },
        language
      );
      speechRecognizerRef.current = recognizer;
      recognizer.start();

      // 4. Start Elapsed Timer
      startTimeRef.current = performance.now();
      setRecordingSeconds(0);
      setTranscript("");
      setInterimTranscript("");
      setDeliveryMetrics(null);
      setRecordedAudioUrl(null);
      setRecordedAudioBlob(null);

      // After calibration period, transition to listening
      setTimeout(() => {
        setTurnState((prev) => (prev === "calibrating" ? "listening" : prev));
      }, vadConfig?.calibrationMs || 300);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Không thể kết nối microphone. Vui lòng cấp quyền trong trình duyệt.");
      setTurnState("idle");
    }
  }, [cleanup, language, onAutoEndDetected, vadConfig]);

  const stopRecording = useCallback((): DeliveryMetrics | null => {
    setTurnState("finalizing");
    const totalDurationMs = performance.now() - startTimeRef.current;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop Recognizer & get full transcript
    let fullTranscript = "";
    let provider: "webkitSpeechRecognition" | "SpeechRecognition" | "none" = "none";
    if (speechRecognizerRef.current) {
      fullTranscript = speechRecognizerRef.current.stop();
      provider = speechRecognizerRef.current.provider;
    }
    setTranscript(fullTranscript);
    setInterimTranscript("");

    // Get VAD Stats & compute final DeliveryMetrics
    let metrics: DeliveryMetrics | null = null;
    if (vadAnalyzerRef.current) {
      const vadStats = vadAnalyzerRef.current.getStats(totalDurationMs);
      vadAnalyzerRef.current.stop();

      metrics = computeDeliveryMetrics({
        transcript: fullTranscript,
        durationMs: totalDurationMs,
        activeSpeechMs: vadStats.activeSpeechMs,
        pauseDurationsMs: vadStats.pauseDurationsMs,
        longPauseCount: vadStats.longPauseCount,
        maxPauseMs: vadStats.maxPauseMs,
        averagePauseMs: vadStats.averagePauseMs,
        startedSpeakingAtMs: vadStats.startedSpeakingAtMs,
        endSilenceMs: vadStats.endSilenceMs,
        transcriptProvider: provider,
      });

      setDeliveryMetrics(metrics);
    }

    // Release microphone tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    setVolumeLevel(0);
    setTurnState("ready");
    return metrics;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setTurnState("idle");
    setRecordingSeconds(0);
    setVolumeLevel(0);
    setTranscript("");
    setInterimTranscript("");
    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setDeliveryMetrics(null);
  }, [cleanup]);

  return {
    turnState,
    isRecording: turnState !== "idle" && turnState !== "ready" && turnState !== "finalizing",
    recordingSeconds,
    volumeLevel,
    transcript,
    interimTranscript,
    recordedAudioUrl,
    recordedAudioBlob,
    deliveryMetrics,
    startRecording,
    stopRecording,
    reset,
  };
}
