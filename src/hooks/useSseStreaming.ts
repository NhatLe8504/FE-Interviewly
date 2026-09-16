"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredToken } from "@/services/apiClient";
import { interviewApi } from "@/services/interviewApi";
import { SSEQuestionDonePayload } from "@/types/interview";

export interface UseSseStreamingOptions {
  onToken?: (token: string) => void;
  onQuestionDone?: (payload: SSEQuestionDonePayload) => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
  sessionId?: string;
}

export interface UseSseStreamingReturn {
  streamedText: string;
  isStreaming: boolean;
  isDone: boolean;
  isCompleted: boolean;
  error: string | null;
  startStream: (
    url: string,
    fallbackText?: string,
    onComplete?: (text: string) => void
  ) => Promise<string>;
  cancelStream: () => void;
  setStreamedText: (text: string | ((prev: string) => string)) => void;
  connect: (sessionId: string) => void;
  disconnect: () => void;
  resetStream: () => void;
}

export function useSseStreaming(options: UseSseStreamingOptions = {}): UseSseStreamingReturn {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const textBufferRef = useRef("");

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
            const step = Math.min(text.length - index, Math.floor(Math.random() * 2) + 1);
            current += text.slice(index, index + step);
            index += step;
            setStreamedText(current);
            options.onToken?.(current);
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
    [options]
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
                  options.onToken?.(parsed.token);
                }
                if (parsed.done) {
                  break;
                }
              } catch {
                if (rawData) {
                  accumulated += rawData;
                  setStreamedText(accumulated);
                  options.onToken?.(rawData);
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
        return await simulateTypewriter(fallbackText, onComplete);
      }
    },
    [options, simulateTypewriter]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const connect = useCallback(
    (sessionId: string) => {
      cancelStream();

      setStreamedText("");
      setIsDone(false);
      setError(null);
      setIsStreaming(true);
      textBufferRef.current = "";

      const streamUrl = interviewApi.getStreamUrl(sessionId);

      try {
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsStreaming(true);
          setError(null);
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.token) {
              textBufferRef.current += data.token;
              setStreamedText(textBufferRef.current);
              options.onToken?.(data.token);
            }
          } catch {
            if (event.data) {
              textBufferRef.current += event.data;
              setStreamedText(textBufferRef.current);
              options.onToken?.(event.data);
            }
          }
        };

        es.addEventListener("token", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            const token = data.token || "";
            textBufferRef.current += token;
            setStreamedText(textBufferRef.current);
            options.onToken?.(token);
          } catch {
            textBufferRef.current += event.data;
            setStreamedText(textBufferRef.current);
            options.onToken?.(event.data);
          }
        });

        es.addEventListener("question_done", (event: MessageEvent) => {
          setIsStreaming(false);
          setIsDone(true);
          try {
            const payload = JSON.parse(event.data) as SSEQuestionDonePayload;
            options.onQuestionDone?.(payload);
          } catch {
            options.onQuestionDone?.({
              turn_id: "done",
              turn_number: 1,
              question_text: textBufferRef.current,
              is_last_question: false,
            });
          }
        });

        es.addEventListener("error", () => {
          const errMsg = "Mất kết nối luồng AI streaming.";
          setError(errMsg);
          setIsStreaming(false);
          options.onError?.(errMsg);
          cancelStream();
        });

        es.onerror = () => {
          setIsStreaming(false);
          cancelStream();
        };
      } catch (err: any) {
        const msg = err.message || "Không thể khởi tạo EventSource.";
        setError(msg);
        setIsStreaming(false);
        options.onError?.(msg);
      }
    },
    [cancelStream, options]
  );

  useEffect(() => {
    if (options.autoConnect && options.sessionId) {
      connect(options.sessionId);
    }
    return () => {
      cancelStream();
    };
  }, [options.autoConnect, options.sessionId, connect, cancelStream]);

  const resetStream = useCallback(() => {
    cancelStream();
    setStreamedText("");
    setIsDone(false);
    setError(null);
    textBufferRef.current = "";
  }, [cancelStream]);

  return {
    streamedText,
    isStreaming,
    isDone,
    isCompleted: isDone,
    error,
    startStream,
    cancelStream,
    setStreamedText,
    connect,
    disconnect: cancelStream,
    resetStream,
  };
}