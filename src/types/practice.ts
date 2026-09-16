export type PracticeMode = "text" | "voice";

export interface PracticeDomain {
  id: string;
  label: string;
}

export interface PracticeRole {
  id: string;
  label: string;
  domainId: string;
}

export interface PracticeLevel {
  id: string;
  label: string;
}

export interface PracticeLanguage {
  id: string;
  label: string;
}

export interface PracticeSetup {
  roleId: string;
  domainId: string;
  levelId: string;
  languageId: string;
  mode: PracticeMode;
}

export interface PracticeQuestion {
  id: string;
  text: string;
  category: string;
  behavioral: boolean;
  starTip?: string;
  followUp: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: "ai" | "user";
  text: string;
}

export interface PracticeSession {
  id: string;
  roleLabel: string;
  domainLabel: string;
  levelLabel: string;
  languageLabel: string;
  mode: PracticeMode;
  startedAt: string;
  duration: string;
}

export interface RubricScore {
  clarity: number;
  logic: number;
  examples: number;
}

export interface SpeechAnalysis {
  paceWpm: number;
  paceLabel: string;
  fillerWords: number;
  longPauses: number;
  summary: string;
}

export interface PracticeResult {
  sessionId: string;
  overall: number;
  verdict: string;
  rubric: RubricScore;
  feedback: string[];
  improvements: string[];
  speech: SpeechAnalysis;
  transcript: TranscriptTurn[];
}
