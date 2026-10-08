"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
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
  const mascotId = saved && saved.userId === user?.user_id
    ? saved.mascotId
    : getMascot(user?.mascot_id).id;

  const setSavedMascot = useCallback((selected: MascotId, userId: number) => {
    setSaved({ mascotId: selected, userId });
  }, []);
  const value = useMemo(() => ({ mascotId, setSavedMascot }), [mascotId, setSavedMascot]);

  return <MascotContext value={value}>{children}</MascotContext>;
}

export function useMascot() {
  const context = use(MascotContext);
  if (!context) throw new Error("useMascot must be used within MascotProvider");
  return context;
}
