import type {
  PracticeLanguage,
  PracticeLevel,
  PracticeQuestion,
  PracticeResult,
  PracticeRole,
  PracticeDomain,
} from "@/types/practice";

export const MOCK_DOMAINS: PracticeDomain[] = [
  { id: "software", label: "Software Engineering" },
  { id: "data-ai", label: "Data & AI" },
  { id: "product-design", label: "Product & Design" },
  { id: "marketing", label: "Marketing" },
];

export const MOCK_ROLES: PracticeRole[] = [
  { id: "frontend", label: "Frontend Developer", domainId: "software" },
  { id: "backend", label: "Backend Developer", domainId: "software" },
  { id: "mobile", label: "Mobile Developer", domainId: "software" },
  { id: "ml-engineer", label: "ML Engineer", domainId: "data-ai" },
  { id: "data-analyst", label: "Data Analyst", domainId: "data-ai" },
  { id: "product-manager", label: "Product Manager", domainId: "product-design" },
  { id: "ui-ux", label: "UI/UX Designer", domainId: "product-design" },
  { id: "content-marketer", label: "Content Marketer", domainId: "marketing" },
];

export const MOCK_LEVELS: PracticeLevel[] = [
  { id: "intern", label: "Intern" },
  { id: "fresher", label: "Fresher" },
  { id: "junior", label: "Junior" },
  { id: "middle", label: "Middle" },
  { id: "senior", label: "Senior" },
];

export const MOCK_LANGUAGES: PracticeLanguage[] = [
  { id: "en", label: "English" },
  { id: "vi", label: "Vietnamese" },
];

export const MOCK_SCRIPT: PracticeQuestion[] = [
  {
    id: "q1",
    text: "Walk me through how you would design the state management for a large dashboard with realtime updates.",
    category: "System thinking",
    behavioral: false,
    followUp:
      "Good start. Now assume the dashboard must stay usable with 50k rows streaming in — what would you change?",
  },
  {
    id: "q2",
    text: "Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?",
    category: "Behavioral",
    behavioral: true,
    starTip:
      "Use STAR: one Situation, one Task, the Actions you personally took, and a measurable Result.",
    followUp:
      "What did you learn from that disagreement, and what would you do differently next time?",
  },
  {
    id: "q3",
    text: "How do you make sure your UI stays fast on low-end mobile devices?",
    category: "Craft",
    behavioral: false,
    followUp:
      "Last one: which single metric would you watch after shipping that optimization?",
  },
];

export const MOCK_TRANSCRIPT_SEED = [
  {
    id: "t0",
    speaker: "ai",
    text: "Hi, I am your AI interview coach. Let us warm up before the scored rounds begin.",
  },
] as const;

export function mockSessionMeta(sessionId: string) {
  return {
    id: sessionId,
    roleLabel: "Frontend Developer",
    domainLabel: "Software Engineering",
    levelLabel: "Junior",
    languageLabel: "English",
    mode: "voice",
    startedAt: "Sep 10, 2026 · 09:30",
    duration: "18 min",
  };
}

export function mockResult(sessionId: string): PracticeResult {
  return {
    sessionId,
    overall: 78,
    verdict: "Strong foundation — tighten structure and evidence.",
    rubric: { clarity: 82, logic: 75, examples: 71 },
    feedback: [
      "Answers open with a clear headline before the details.",
      "Technical reasoning is sound, especially around state and rendering.",
      "Behavioral answer names the conflict but undersells your personal contribution.",
    ],
    improvements: [
      "End each answer with a one-line takeaway so the point lands.",
      "Attach a number to every example: users affected, time saved, size handled.",
      "Pause once before answering behavioral questions, then follow STAR in order.",
    ],
    speech: {
      paceWpm: 132,
      paceLabel: "Steady, easy to follow",
      fillerWords: 9,
      longPauses: 2,
      summary:
        "Pace sits in the ideal band. Nine filler words across the session is acceptable; two long pauses happened before the behavioral answers.",
    },
    transcript: [
      { id: "t1", speaker: "ai", text: MOCK_SCRIPT[0].text },
      {
        id: "t2",
        speaker: "user",
        text: "I keep shared server state in a query cache, local UI state in components, and push realtime updates through a single socket channel with optimistic patches.",
      },
      { id: "t3", speaker: "ai", text: MOCK_SCRIPT[0].followUp },
      {
        id: "t4",
        speaker: "user",
        text: "I would virtualize the table, windowing rows to about fifty at a time, and aggregate the stream into one-second buckets before rendering.",
      },
    ],
  };
}

