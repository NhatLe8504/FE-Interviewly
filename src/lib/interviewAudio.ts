let primedContext: AudioContext | null = null;

export const DEFAULT_INTERVIEW_PLAYBACK_SPEED = 1.15;
export const INTERVIEW_PLAYBACK_SPEED_STORAGE_KEY = "interviewly_playback_speed";

export function clampInterviewPlaybackSpeed(value: number): number {
  return Number.isFinite(value) ? Math.max(0.85, Math.min(1.5, value)) : DEFAULT_INTERVIEW_PLAYBACK_SPEED;
}

export function primeInterviewAudio(): void {
  if (typeof window === "undefined") return;
  const AudioContextConstructor = window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;

  try {
    if (!primedContext || primedContext.state === "closed") {
      primedContext = new AudioContextConstructor();
    }
    void primedContext.resume().catch(() => {});
  } catch {
    primedContext = null;
  }
}

export function takePrimedInterviewAudioContext(): AudioContext | null {
  const context = primedContext;
  primedContext = null;
  return context && context.state !== "closed" ? context : null;
}

export function releasePrimedInterviewAudio(): void {
  const context = primedContext;
  primedContext = null;
  if (context && context.state !== "closed") void context.close().catch(() => {});
}
