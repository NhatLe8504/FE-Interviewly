import { VADConfig, DEFAULT_VAD_CONFIG } from "@/types/delivery";

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

  // Calibration state
  private isCalibrating = false;
  private calibrationSamples: number[] = [];
  private noiseFloorRms = 0.015;
  private speechThresholdRms = 0.035;

  // Speaking & Pause tracking
  private isSpeaking = false;
  private speechStartTime = 0;
  private lastSpeechEndTime = 0;
  private totalActiveSpeechMs = 0;
  private pauseDurationsMs: number[] = [];
  private longPauseCount = 0;
  private startedSpeakingAtMs = 0;

  // Hysteresis & silence debounce
  private silenceConsecutiveFrames = 0;
  private speechConsecutiveFrames = 0;
  private isRunning = false;
  private startTime = 0;

  constructor(callbacks: VADEventCallbacks = {}, config: Partial<VADConfig> = {}) {
    this.callbacks = callbacks;
    this.config = { ...DEFAULT_VAD_CONFIG, ...config };
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

    // Compute Root Mean Square (RMS) volume
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
        this.noiseFloorRms = Math.max(0.01, avgNoise);
        // Adaptive threshold: noise floor + dynamic delta
        this.speechThresholdRms = Math.max(0.03, this.noiseFloorRms * 2.2);
      }
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    // Normalized volume percentage (0 - 100) for visualizers
    const normVol = Math.min(100, Math.round((rms / (this.speechThresholdRms * 3.5)) * 100));
    this.callbacks.onVolumeChange?.(rms, normVol);

    // Voice Activity Detection with Hysteresis
    const isAboveThreshold = rms >= this.speechThresholdRms;

    if (isAboveThreshold) {
      this.speechConsecutiveFrames++;
      this.silenceConsecutiveFrames = 0;

      // Transition silence -> speech
      if (!this.isSpeaking && this.speechConsecutiveFrames >= 3) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        if (this.startedSpeakingAtMs === 0) {
          this.startedSpeakingAtMs = elapsedSinceStart;
        }

        // Calculate pause duration from last speaking event
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
      this.silenceConsecutiveFrames++;
      this.speechConsecutiveFrames = 0;

      // Transition speech -> silence
      if (this.isSpeaking && this.silenceConsecutiveFrames >= 8) {
        this.isSpeaking = false;
        this.lastSpeechEndTime = now;
        const speechSegment = now - this.speechStartTime;
        if (speechSegment >= this.config.minSpeechDurationMs) {
          this.totalActiveSpeechMs += speechSegment;
        }
        this.callbacks.onSpeechEnd?.(now - this.lastSpeechEndTime);
      }

      // Check auto-end turn after prolonged silence (endTurnSilenceMs)
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
    // If user is currently speaking when stopped, add remaining segment
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
