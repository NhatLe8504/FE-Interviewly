"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  isAutoSpeak: boolean;
  speak: (text: string, language?: "vi" | "en" | string) => void;
  stop: () => void;
  toggleAutoSpeak: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/[*_#`~\[\]()]/g, "") // Remove markdown syntax
      .replace(/\s+/g, " ")
      .trim();
  };

  const speak = useCallback(
    (text: string, language: "vi" | "en" | string = "vi") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      const clean = cleanTextForSpeech(text);
      if (!clean) return;

      // Cancel any ongoing utterance
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(clean);
      utteranceRef.current = utterance;

      const langCode = language.startsWith("en") ? "en-US" : "vi-VN";
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select best voice if available
      const matchingVoice = voicesRef.current.find((v) =>
        v.lang.toLowerCase().startsWith(language.startsWith("en") ? "en" : "vi")
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        // Only log if not canceled manually
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("TTS playback warning:", e.error);
        }
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setIsAutoSpeak((prev) => {
      const next = !prev;
      if (!next) {
        stop();
      }
      return next;
    });
  }, [stop]);

  return {
    isSpeaking,
    isSupported,
    isAutoSpeak,
    speak,
    stop,
    toggleAutoSpeak,
  };
}