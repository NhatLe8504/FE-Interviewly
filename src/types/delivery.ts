export interface FillerOccurrence {
  text: string;
  count: number;
  isPossibleFiller: boolean; // Phân biệt từ đệm chắc chắn vs từ ngữ cảnh (như "like", "thật ra")
}

export interface DeliveryMetrics {
  durationMs: number;
  activeSpeechMs: number;
  wordCount: number;
  elapsedWpm: number;           // totalWords / totalDuration
  activeSpeechWpm: number;      // totalWords / activeSpeakingDuration (chính xác hơn)
  fillerCount: number;
  possibleFillerCount: number;
  fillerRatePer100Words: number;
  fillers: FillerOccurrence[];
  longPauseCount: number;       // Số khoảng lặng dài (> 1200ms)
  pauseDurationsMs: number[];   // Danh sách các khoảng lặng để phân tích
  maxPauseMs: number;
  averagePauseMs: number;
  repetitionCount: number;
  repeatedPhrases: string[];    // "tôi tôi", "we we"
  startedSpeakingAtMs: number;
  endSilenceMs: number;
  transcriptAvailable: boolean;
  transcriptProvider: "webkitSpeechRecognition" | "SpeechRecognition" | "none";
}

export type SpeechTurnState =
  | "idle"
  | "calibrating"
  | "listening"
  | "speakingDetected"
  | "paused"
  | "finalizing"
  | "ready";

export interface VADConfig {
  calibrationMs: number;
  minSpeechDurationMs: number;
  longPauseThresholdMs: number;
  endTurnSilenceMs: number;
  hysteresisDebounceMs: number;
}

export const DEFAULT_VAD_CONFIG: VADConfig = {
  calibrationMs: 300,
  minSpeechDurationMs: 400,
  longPauseThresholdMs: 1200,
  endTurnSilenceMs: 2500,
  hysteresisDebounceMs: 150,
};

export type PullTaskStatus = "queued" | "processing" | "completed" | "failed";

export interface PullEvaluationQueueResult {
  task_id: string;
  status: PullTaskStatus;
  quiz_score?: number;
  result?: any;
}
