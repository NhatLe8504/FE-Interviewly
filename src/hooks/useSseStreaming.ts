"use client";

import { useCallback, useRef, useState } from "react";
import { getStoredToken } from "@/services/apiClient";

export interface UseSseStreamingReturn {
  streamedText: string;
  isStreaming: boolean;
  isDone: boolean;
  error: string | null;
  startStream: (
    url: string,
    fallbackText?: string,
    onComplete?: (text: string) => void
  ) => Promise<string>;
  cancelStream: () => void;
  setStreamedText: (text: string | ((prev: string) => string)) => void;
}

export function useSseStreaming(): UseSseStreamingReturn {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Typewriter ticker simulation for fallback or local simulation
  const simulateTypewriter = useCallback(
    (text: string, onComplete?: (res: string) => void): Promise<string> => {
      return new Promise((resolve) => {
        let current = "";
        let index = 0;
        setStreamedText("");
        setIsStreaming(true);
        setIsDone(false);

        const timer = setInterval(() => {
          if (index < text.length) {
            // Stream in natural clusters of 1-3 characters
            const step = Math.min(text.length - index, Math.floor(Math.random() * 2) + 1);
            current += text.slice(index, index + step);
            index += step;
            setStreamedText(current);
          } else {
            clearInterval(timer);
            setIsStreaming(false);
            setIsDone(true);
            if (onComplete) onComplete(text);
            resolve(text);
          }
        }, 25);
      });
    },
    []
  );

  const startStream = useCallback(
    async (
      url: string,
      fallbackText: string = "",
      onComplete?: (text: string) => void
    ): Promise<string> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStreamedText("");
      setIsStreaming(true);
      setIsDone(false);
      setError(null);

      const token = getStoredToken();
      const headers: Record<string, string> = {
        Accept: "text/event-stream",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          // If SSE fails or 404, fallback to typewriter effect of provided question text
          return await simulateTypewriter(fallbackText, onComplete);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const rawData = trimmed.replace(/^data:\s*/, "");
              if (rawData === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.token) {
                  accumulated += parsed.token;
                  setStreamedText(accumulated);
                }
                if (parsed.done) {
                  break;
                }
              } catch {
                // If it's plain text token
                if (rawData) {
                  accumulated += rawData;
                  setStreamedText(accumulated);
                }
              }
            }
          }
        }

        setIsStreaming(false);
        setIsDone(true);
        if (onComplete) onComplete(accumulated || fallbackText);
        return accumulated || fallbackText;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return "";
        }
        // Graceful fallback to typewriter simulation of fallback text
        return await simulateTypewriter(fallbackText, onComplete);
      }
    },
    [simulateTypewriter]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    streamedText,
    isStreaming,
    isDone,
    error,
    startStream,
    cancelStream,
    setStreamedText,
  };
}
