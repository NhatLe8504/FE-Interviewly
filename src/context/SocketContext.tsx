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
  onlineCount: number;
  onlineUserIds: number[];
  isUserOnline: (userId?: number | null) => boolean;
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
  const { user, token } = useAuth();
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isManuallyClosedRef = useRef<boolean>(false);
  const currentUrlRef = useRef<string>("");
  const listenersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());

  // Check if a specific user is currently online
  const isUserOnline = useCallback(
    (userId?: number | null): boolean => {
      if (!userId) return false;
      // Current user is always online if socket or session is active
      if (user && user.user_id === userId) return true;
      return onlineUserIds.includes(userId);
    },
    [user, onlineUserIds]
  );

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
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
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
      if (socketRef.current) {
        disconnect();
      }

      isManuallyClosedRef.current = false;
      const baseWs = getBaseWsUrl();
      let fullUrl = endpointOrUrl || `${baseWs}/api/v1/ws/presence`;

      if (!fullUrl.startsWith("ws://") && !fullUrl.startsWith("wss://")) {
        const cleanPath = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
        fullUrl = `${baseWs}${cleanPath}`;
      }

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

          // Start ping heartbeat
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              try {
                ws.send(JSON.stringify({ type: "ping" }));
              } catch {
                // Ignored
              }
            }
          }, 25000);
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            setLastMessage(parsed);

            // Handle presence events
            if (parsed?.type === "presence_state" || parsed?.type === "presence_update") {
              if (typeof parsed.online_count === "number") {
                setOnlineCount(Math.max(1, parsed.online_count));
              }
              if (Array.isArray(parsed.online_user_ids)) {
                setOnlineUserIds(parsed.online_user_ids);
              }
            }

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

        ws.onclose = () => {
          socketRef.current = null;
          setStatus("disconnected");
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }

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
      } catch {
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

  // Auto-connect to presence websocket on mount or token change
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        status,
        isConnected: status === "connected",
        onlineCount,
        onlineUserIds,
        isUserOnline,
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
