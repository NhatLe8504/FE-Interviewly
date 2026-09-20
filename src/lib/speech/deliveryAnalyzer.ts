import { DeliveryMetrics, FillerOccurrence } from "@/types/delivery";

// Definitive Fillers: Almost always speech disfluency
const DEFINITIVE_FILLERS_VI = [
  "ừm",
  "ừ",
  "ờ",
  "à",
  "kiểu như là",
  "kiểu là",
  "kiểu như",
  "thì là mà",
  "nói chung là",
  "đại loại là",
  "ý là",
];

const DEFINITIVE_FILLERS_EN = [
  "um",
  "uh",
  "er",
  "ah",
  "hmm",
  "you know",
  "sort of",
  "kind of",
];

// Contextual Fillers: Might be meaningful or filler depending on position
const CONTEXTUAL_FILLERS = [
  "thực ra",
  "thật ra",
  "basically",
  "actually",
  "literally",
  "like",
];

export function detectFillers(text: string): {
  fillers: FillerOccurrence[];
  fillerCount: number;
  possibleFillerCount: number;
} {
  if (!text || !text.trim()) {
    return { fillers: [], fillerCount: 0, possibleFillerCount: 0 };
  }

  const lower = text.toLowerCase();
  const occurrences: Map<string, FillerOccurrence> = new Map();
  let totalDefinitive = 0;
  let totalPossible = 0;

  // Helper matching phrase
  const matchPhrase = (phrase: string, isPossible: boolean) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      const count = matches.length;
      occurrences.set(phrase, { text: phrase, count, isPossibleFiller: isPossible });
      if (isPossible) {
        totalPossible += count;
      } else {
        totalDefinitive += count;
      }
    }
  };

  // Check VI fillers
  DEFINITIVE_FILLERS_VI.forEach((f) => matchPhrase(f, false));
  // Check EN fillers
  DEFINITIVE_FILLERS_EN.forEach((f) => matchPhrase(f, false));
  // Check contextual fillers
  CONTEXTUAL_FILLERS.forEach((f) => matchPhrase(f, true));

  return {
    fillers: Array.from(occurrences.values()),
    fillerCount: totalDefinitive,
    possibleFillerCount: totalPossible,
  };
}

export function detectRepetitions(text: string): {
  repetitionCount: number;
  repeatedPhrases: string[];
} {
  if (!text || !text.trim()) {
    return { repetitionCount: 0, repeatedPhrases: [] };
  }

  const repeated: string[] = [];
  // Regex single word repetitions: "tôi tôi", "we we", "the the"
  const singleRegex = /\b(\w{2,})\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = singleRegex.exec(text)) !== null) {
    repeated.push(`${match[1]} ${match[1]}`);
  }

  // Regex two-word repetitions: "trong khi trong khi"
  const pairRegex = /\b(\w+\s+\w+)\s+\1\b/gi;
  while ((match = pairRegex.exec(text)) !== null) {
    repeated.push(`${match[1]} ${match[1]}`);
  }

  const unique = Array.from(new Set(repeated));
  return {
    repetitionCount: repeated.length,
    repeatedPhrases: unique,
  };
}

export function computeDeliveryMetrics(params: {
  transcript: string;
  durationMs: number;
  activeSpeechMs: number;
  pauseDurationsMs: number[];
  longPauseCount: number;
  maxPauseMs: number;
  averagePauseMs: number;
  startedSpeakingAtMs: number;
  endSilenceMs: number;
  transcriptProvider: "webkitSpeechRecognition" | "SpeechRecognition" | "none";
}): DeliveryMetrics {
  const {
    transcript,
    durationMs,
    activeSpeechMs,
    pauseDurationsMs,
    longPauseCount,
    maxPauseMs,
    averagePauseMs,
    startedSpeakingAtMs,
    endSilenceMs,
    transcriptProvider,
  } = params;

  const words = transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const durationMin = Math.max(0.01, durationMs / 60000);
  const activeMin = Math.max(0.01, activeSpeechMs / 60000);

  const elapsedWpm = Math.round(wordCount / durationMin);
  const activeSpeechWpm = Math.round(wordCount / activeMin);

  const { fillers, fillerCount, possibleFillerCount } = detectFillers(transcript);
  const { repetitionCount, repeatedPhrases } = detectRepetitions(transcript);

  const fillerRatePer100Words =
    wordCount > 0 ? Number(((fillerCount / wordCount) * 100).toFixed(1)) : 0;

  return {
    durationMs: Math.round(durationMs),
    activeSpeechMs: Math.round(activeSpeechMs),
    wordCount,
    elapsedWpm,
    activeSpeechWpm,
    fillerCount,
    possibleFillerCount,
    fillerRatePer100Words,
    fillers,
    longPauseCount,
    pauseDurationsMs,
    maxPauseMs,
    averagePauseMs,
    repetitionCount,
    repeatedPhrases,
    startedSpeakingAtMs,
    endSilenceMs,
    transcriptAvailable: wordCount > 0,
    transcriptProvider,
  };
}
