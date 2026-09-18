"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

export type SocketStatus = "connecting" | "connected" | "disconnected" | "error";

export interface SocketMessageEvent<T = any> {
  type: string;
  payload?: T;
  [key: string]: any;
}

export type SocketEventHandler<T = any> = (payload: T, rawEvent: MessageEvent) => void;

interface SocketContextType {
  socket: WebSocket | null;
  status: SocketStatus;
  isConnected: boolean;
  lastMessage: any;
  connect: (endpointOrUrl?: string) => void;
  disconnect: () => void;
  send: (data: any) => boolean;
  subscribe: <T = any>(eventType: string, handler: SocketEventHandler<T>) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

function getBaseWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    return apiBase.replace(/^http/, "ws");
  }
  if (typeof window !== "undefined") {
    return `ws://${window.location.hostname}:8000`;
  }
  return "ws://localhost:8000";
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<any>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isManuallyClosedRef = useRef<boolean>(false);
  const currentUrlRef = useRef<string>("");
  const listenersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());

  // Subscribe to specific event types
  const subscribe = useCallback(
    <T = any>(eventType: string, handler: SocketEventHandler<T>): (() => void) => {
      if (!listenersRef.current.has(eventType)) {
        listenersRef.current.set(eventType, new Set());
      }
      const set = listenersRef.current.get(eventType)!;
      set.add(handler as SocketEventHandler);

      return () => {
        set.delete(handler as SocketEventHandler);
        if (set.size === 0) {
          listenersRef.current.delete(eventType);
        }
      };
    },
    []
  );

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      try {
        socketRef.current.close(1000, "Client disconnect");
      } catch {
        // Ignored
      }
      socketRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const connect = useCallback(
    (endpointOrUrl?: string) => {
      // Disconnect existing socket if any
      if (socketRef.current) {
        disconnect();
      }

      isManuallyClosedRef.current = false;
      const baseWs = getBaseWsUrl();
      let fullUrl = endpointOrUrl || `${baseWs}/api/v1/voice/ws/1`;

      if (!fullUrl.startsWith("ws://") && !fullUrl.startsWith("wss://")) {
        const cleanPath = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
        fullUrl = `${baseWs}${cleanPath}`;
      }

      // Append auth token if available and not yet present
      if (token && !fullUrl.includes("token=")) {
        const separator = fullUrl.includes("?") ? "&" : "?";
        fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
      }

      currentUrlRef.current = fullUrl;
      setStatus("connecting");

      try {
        const ws = new WebSocket(fullUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setStatus("connected");
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            setLastMessage(parsed);

            // Notify wildcard and type-specific listeners
            const eventType = parsed?.type || parsed?.event || "message";
            const typeListeners = listenersRef.current.get(eventType);
            if (typeListeners) {
              typeListeners.forEach((handler) => handler(parsed, event));
            }
            const allListeners = listenersRef.current.get("*");
            if (allListeners) {
              allListeners.forEach((handler) => handler(parsed, event));
            }
          } catch {
            setLastMessage(event.data);
          }
        };

        ws.onerror = () => {
          setStatus("error");
        };

        ws.onclose = (event: CloseEvent) => {
          socketRef.current = null;
          setStatus("disconnected");

          // Auto-reconnect if not closed manually and under 5 attempts
          if (!isManuallyClosedRef.current && reconnectAttemptsRef.current < 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
            reconnectAttemptsRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!isManuallyClosedRef.current && currentUrlRef.current) {
                connect(currentUrlRef.current);
              }
            }, delay);
          }
        };
      } catch (err) {
        setStatus("error");
      }
    },
    [token, disconnect]
  );

  const send = useCallback((data: any): boolean => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      socketRef.current.send(payload);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManuallyClosedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {
          // Ignored
        }
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        status,
        isConnected: status === "connected",
        lastMessage,
        connect,
        disconnect,
        send,
        subscribe,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
