import { DeliveryMetrics, FillerOccurrence } from "@/types/delivery";

// Definitive Fillers (Almost universally speech disfluencies)
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

// Contextual candidate fillers: Evaluated with surrounding heuristic
const CONTEXTUAL_FILLERS_VI = ["thực ra", "thật ra"];
const CONTEXTUAL_FILLERS_EN = ["basically", "actually", "literally", "like"];

// Verbs / grammatical words preceding "like" that make it NOT a filler
const GRAMMATICAL_LIKE_PRECEDING = new Set([
  "feel", "feels", "felt",
  "look", "looks", "looked",
  "sound", "sounds", "sounded",
  "seem", "seems", "seemed",
  "be", "is", "are", "was", "were", "been",
  "would", "should", "could",
  "act", "acts", "acted",
  "something", "anything", "nothing",
  "just", "more", "much", "quite",
]);

export function detectFillers(text: string): {
  fillers: FillerOccurrence[];
  fillerCount: number;
  possibleFillerCount: number;
} {
  if (!text || !text.trim()) {
    return { fillers: [], fillerCount: 0, possibleFillerCount: 0 };
  }

  const occurrences: Map<string, FillerOccurrence> = new Map();
  let totalDefinitive = 0;
  let totalPossible = 0;

  const words = text.split(/\s+/);
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-zA-Z0-9à-ỹ]/g, ""));

  // 1. Detect definitive VI fillers
  const lowerText = text.toLowerCase();
  for (const filler of DEFINITIVE_FILLERS_VI) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, "gi"));
    if (matches && matches.length > 0) {
      const count = matches.length;
      occurrences.set(filler, { text: filler, count, isPossibleFiller: false });
      totalDefinitive += count;
    }
  }

  // 2. Detect definitive EN fillers
  for (const filler of DEFINITIVE_FILLERS_EN) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, "gi"));
    if (matches && matches.length > 0) {
      const count = matches.length;
      occurrences.set(filler, { text: filler, count, isPossibleFiller: false });
      totalDefinitive += count;
    }
  }

  // 3. Contextual Heuristic for "like"
  let likeAsFillerCount = 0;
  for (let i = 0; i < lowerWords.length; i++) {
    if (lowerWords[i] === "like") {
      const prevWord = i > 0 ? lowerWords[i - 1] : "";
      // If preceding word is a grammatical verb/preposition, it's NOT a filler
      if (!GRAMMATICAL_LIKE_PRECEDING.has(prevWord)) {
        likeAsFillerCount++;
      }
    }
  }
  if (likeAsFillerCount > 0) {
    occurrences.set("like", {
      text: "like",
      count: likeAsFillerCount,
      isPossibleFiller: true, // Marked as possible filler to avoid unfair penalty
    });
    totalPossible += likeAsFillerCount;
  }

  // 4. Contextual Heuristic for "thật ra", "thực ra", "actually", "basically"
  for (const cf of [...CONTEXTUAL_FILLERS_VI, "actually", "basically", "literally"]) {
    const escaped = cf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, "gi"));
    if (matches && matches.length > 0) {
      const count = matches.length;
      occurrences.set(cf, { text: cf, count, isPossibleFiller: true });
      totalPossible += count;
    }
  }

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

  // Single word stutters: e.g. "t-tôi", "c-c-code"
  const stutterRegex = /\b([a-zA-Zà-ỹ]{1,3})-\1[a-zA-Zà-ỹ]*\b/gi;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = stutterRegex.exec(text)) !== null) {
    repeated.push(sMatch[0]);
  }

  // Immediate consecutive word repetitions: e.g. "tôi tôi", "we we", "và và"
  const singleRegex = /\b(\w{2,})\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = singleRegex.exec(text)) !== null) {
    repeated.push(`${match[1]} ${match[1]}`);
  }

  // Consecutive 2-word phrase repetitions: e.g. "trong khi trong khi"
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

  // Calculate Speech Rate WPM
  const durationMin = Math.max(0.01, durationMs / 60000);
  const activeMin = Math.max(0.01, activeSpeechMs / 60000);

  // Elapsed WPM: total words over entire session duration
  const elapsedWpm = Math.round(wordCount / durationMin);

  // Active Speech WPM: total words over active speaking duration (excluding long pauses)
  const activeSpeechWpm = Math.round(wordCount / activeMin);

  // Detect Fillers with Contextual Heuristic
  const { fillers, fillerCount, possibleFillerCount } = detectFillers(transcript);

  // Detect Repetitions & Stuttering
  const { repetitionCount, repeatedPhrases } = detectRepetitions(transcript);

  // Filler Rate per 100 words
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
