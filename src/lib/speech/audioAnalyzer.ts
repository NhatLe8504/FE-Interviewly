import { VADConfig } from "@/types/delivery";

export const VAD_CONFIG: VADConfig = {
  calibrationMs: 300,
  minSpeechDurationMs: 400,
  longPauseThresholdMs: 3000, // Khoảng lặng >= 3.0s được tính là 1 lần ngập ngừng dài
  endTurnSilenceMs: 2500,     // 2.5s im lặng sau khi đã phát biểu ➔ tự động báo kết thúc hoặc sẵn sàng
  hysteresisDebounceMs: 150,  // Khử nhiễu giật lag (150ms) khi chuyển giữa nói và im lặng
};

export interface VADEventCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: (pauseDurationMs: number) => void;
  onVolumeChange?: (volumeRms: number, normalizedLevel: number) => void;
  onAutoEndDetected?: () => void;
}

export class WebAudioVADAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;

  private config: VADConfig;
  private callbacks: VADEventCallbacks;

  // Noise floor calibration (300ms)
  private isCalibrating = false;
  private calibrationSamples: number[] = [];
  private noiseFloorRms = 0.015;
  private speechThresholdRms = 0.035;

  // State tracking
  private isSpeaking = false;
  private speechStartTime = 0;
  private lastSpeechEndTime = 0;
  private lastStateChangeTime = 0;
  private totalActiveSpeechMs = 0;
  private pauseDurationsMs: number[] = [];
  private longPauseCount = 0;
  private startedSpeakingAtMs = 0;

  private isRunning = false;
  private startTime = 0;

  constructor(callbacks: VADEventCallbacks = {}, config: Partial<VADConfig> = {}) {
    this.callbacks = callbacks;
    this.config = { ...VAD_CONFIG, ...config };
  }

  public async start(stream: MediaStream): Promise<void> {
    this.mediaStream = stream;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      console.warn("Web Audio API not supported in this browser environment.");
      return;
    }

    this.audioContext = new AudioCtx();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.2;

    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyser);

    this.startTime = performance.now();
    this.lastStateChangeTime = this.startTime;
    this.isRunning = true;
    this.isCalibrating = true;
    this.calibrationSamples = [];
    this.pauseDurationsMs = [];
    this.totalActiveSpeechMs = 0;
    this.longPauseCount = 0;
    this.startedSpeakingAtMs = 0;
    this.lastSpeechEndTime = 0;

    this.loop();
  }

  private loop = (): void => {
    if (!this.isRunning || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate Root Mean Square (RMS)
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const norm = (dataArray[i] - 128) / 128;
      sumSquares += norm * norm;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const now = performance.now();
    const elapsedSinceStart = now - this.startTime;

    // Phase 1: 300ms Noise Floor Calibration
    if (this.isCalibrating) {
      this.calibrationSamples.push(rms);
      if (elapsedSinceStart >= this.config.calibrationMs) {
        this.isCalibrating = false;
        const avgNoise =
          this.calibrationSamples.reduce((a, b) => a + b, 0) /
          Math.max(1, this.calibrationSamples.length);
        this.noiseFloorRms = Math.max(0.008, avgNoise);
        // Adaptive threshold: noise floor + proportional headroom
        this.speechThresholdRms = Math.max(0.025, this.noiseFloorRms * 2.2);
      }
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    // Normalized volume (0 - 100) for real-time waveform animation
    const normVol = Math.min(100, Math.round((rms / (this.speechThresholdRms * 3.2)) * 100));
    this.callbacks.onVolumeChange?.(rms, normVol);

    // Hysteresis Voice Activity Detection with 150ms time-based debounce
    const isAboveThreshold = rms >= this.speechThresholdRms;
    const timeSinceLastStateChange = now - this.lastStateChangeTime;

    if (isAboveThreshold) {
      if (!this.isSpeaking && timeSinceLastStateChange >= this.config.hysteresisDebounceMs) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        this.lastStateChangeTime = now;

        if (this.startedSpeakingAtMs === 0) {
          this.startedSpeakingAtMs = elapsedSinceStart;
        }

        // Record pause duration from previous speech end
        if (this.lastSpeechEndTime > 0) {
          const pauseDuration = now - this.lastSpeechEndTime;
          if (pauseDuration >= 300) {
            this.pauseDurationsMs.push(Math.round(pauseDuration));
            if (pauseDuration >= this.config.longPauseThresholdMs) {
              this.longPauseCount++;
            }
          }
        }
        this.callbacks.onSpeechStart?.();
      }
    } else {
      if (this.isSpeaking && timeSinceLastStateChange >= this.config.hysteresisDebounceMs) {
        this.isSpeaking = false;
        this.lastSpeechEndTime = now;
        this.lastStateChangeTime = now;

        const speechSegment = now - this.speechStartTime;
        if (speechSegment >= this.config.minSpeechDurationMs) {
          this.totalActiveSpeechMs += speechSegment;
        }
        this.callbacks.onSpeechEnd?.(now - this.lastSpeechEndTime);
      }

      // Check auto-finish detection after prolonged silence
      if (
        this.startedSpeakingAtMs > 0 &&
        this.lastSpeechEndTime > 0 &&
        now - this.lastSpeechEndTime >= this.config.endTurnSilenceMs
      ) {
        this.callbacks.onAutoEndDetected?.();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public getStats(totalDurationMs: number) {
    let activeMs = this.totalActiveSpeechMs;
    if (this.isSpeaking && this.speechStartTime > 0) {
      activeMs += Math.max(0, performance.now() - this.speechStartTime);
    }
    activeMs = Math.min(totalDurationMs, Math.max(0, activeMs));

    const totalPauses = this.pauseDurationsMs.length;
    const maxPause = totalPauses > 0 ? Math.max(...this.pauseDurationsMs) : 0;
    const avgPause =
      totalPauses > 0
        ? Math.round(this.pauseDurationsMs.reduce((a, b) => a + b, 0) / totalPauses)
        : 0;

    const endSilence =
      this.lastSpeechEndTime > 0
        ? Math.round(Math.max(0, performance.now() - this.lastSpeechEndTime))
        : 0;

    return {
      activeSpeechMs: Math.round(activeMs),
      pauseDurationsMs: this.pauseDurationsMs,
      longPauseCount: this.longPauseCount,
      maxPauseMs: maxPause,
      averagePauseMs: avgPause,
      startedSpeakingAtMs: Math.round(this.startedSpeakingAtMs),
      endSilenceMs: endSilence,
      noiseFloorRms: Number(this.noiseFloorRms.toFixed(4)),
      speechThresholdRms: Number(this.speechThresholdRms.toFixed(4)),
    };
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
