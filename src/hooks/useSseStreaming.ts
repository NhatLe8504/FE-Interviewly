"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { interviewApi } from "@/services/interviewApi";
import { SSEQuestionDonePayload } from "@/types/interview";

interface UseSseStreamingOptions {
  onToken?: (token: string) => void;
  onQuestionDone?: (payload: SSEQuestionDonePayload) => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
  sessionId?: string;
}

export function useSseStreaming(options: UseSseStreamingOptions = {}) {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const textBufferRef = useRef("");

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const connect = useCallback(
    (sessionId: string) => {
      disconnect();

      setStreamedText("");
      setIsCompleted(false);
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

        // Lắng nghe generic message
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

        // Lắng nghe custom event "token"
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

        // Lắng nghe custom event "question_done"
        es.addEventListener("question_done", (event: MessageEvent) => {
          setIsStreaming(false);
          setIsCompleted(true);
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

        // Lắng nghe custom event "error" hoặc lỗi connection
        es.addEventListener("error", (errEvent: Event) => {
          const errMsg = "Mất kết nối luồng AI streaming.";
          setError(errMsg);
          setIsStreaming(false);
          options.onError?.(errMsg);
          disconnect();
        });

        es.onerror = () => {
          // Khi server đóng kết nối sau khi stream xong
          setIsStreaming(false);
          disconnect();
        };
      } catch (err: any) {
        const msg = err.message || "Không thể khởi tạo EventSource.";
        setError(msg);
        setIsStreaming(false);
        options.onError?.(msg);
      }
    },
    [disconnect, options]
  );

  useEffect(() => {
    if (options.autoConnect && options.sessionId) {
      connect(options.sessionId);
    }
    return () => {
      disconnect();
    };
  }, [options.autoConnect, options.sessionId, connect, disconnect]);

  const resetStream = useCallback(() => {
    disconnect();
    setStreamedText("");
    setIsCompleted(false);
    setError(null);
    textBufferRef.current = "";
  }, [disconnect]);

  return {
    streamedText,
    isStreaming,
    isCompleted,
    error,
    connect,
    disconnect,
    resetStream,
  };
}