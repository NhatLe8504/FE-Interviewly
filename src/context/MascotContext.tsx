"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMascot, type MascotId } from "@/lib/mascots";

interface MascotContextValue {
  mascotId: MascotId;
  setSavedMascot: (mascotId: MascotId, userId: number) => void;
}

const MascotContext = createContext<MascotContextValue | null>(null);

export function MascotProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState<{ mascotId: MascotId; userId: number } | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const userId = user?.user_id;
  const mascotId = saved && saved.userId === user?.user_id
    ? saved.mascotId
    : getMascot(user?.mascot_id).id;

  const setSavedMascot = useCallback((selected: MascotId, userId: number) => {
    setSaved({ mascotId: selected, userId });
    channelRef.current?.postMessage({ mascotId: selected, userId });
  }, []);
  useEffect(() => {
    if (!userId || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("interviewly_mascot");
    channelRef.current = channel;
    channel.onmessage = ({ data }) => {
      if (!data || data.userId !== userId) return;
      const selected = getMascot(data.mascotId);
      if (selected.id !== data.mascotId) return;
      setSaved({ mascotId: selected.id, userId });
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [userId]);
  const value = useMemo(() => ({ mascotId, setSavedMascot }), [mascotId, setSavedMascot]);

  return <MascotContext value={value}>{children}</MascotContext>;
}

export function useMascot() {
  const context = use(MascotContext);
  if (!context) throw new Error("useMascot must be used within MascotProvider");
  return context;
}
