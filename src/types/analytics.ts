export interface CandidateKpiStats {
  total_interviews: number;
  completed_interviews: number;
  avg_score: number | null;
  total_practice_minutes: number;
  streak_days: number;
}

export interface SkillRadar {
  clarity: number | null;
  logic: number | null;
  evidence: number | null;
  delivery: number | null;
  star_method: number | null;
}

export interface RecentSession {
  session_id: number;
  domain_name: string;
  role_name: string;
  mode: string;
  score: number | null;
  status: string;
  started_at: string;
}

export interface WeakPointRecommendation {
  weak_area: string;
  score: number;
  recommendation: string;
  suggested_question: string;
}

export interface CandidateDashboardData {
  candidate_id: number;
  kpi: CandidateKpiStats;
  skill_radar: SkillRadar;
  recent_sessions: RecentSession[];
  recommendations: WeakPointRecommendation[];
}

export interface ProgressTrendPoint {
  session_id: number;
  date: string;
  overall_score: number | null;
  clarity_score: number | null;
  logic_score: number | null;
  example_score: number | null;
  speaking_pace_wpm: number | null;
  filler_words_count: number | null;
  star_completion_rate: number | null;
}

export interface ProgressTrendsData {
  candidate_id: number;
  trends: ProgressTrendPoint[];
  avg_wpm: number | null;
  avg_filler_count: number | null;
  star_mastery_rate: number | null;
}

export interface HistorySessionItem {
  session_id: number;
  candidate_id: number;
  domain_id: number | null;
  domain_name: string | null;
  role_id: number | null;
  role_name: string | null;
  experience_level: string | null;
  language: string;
  mode: string;
  status: string;
  total_score: number | null;
  started_at: string;
  completed_at: string | null;
  total_turns: number;
}

export interface HistoryPageData {
  items: HistorySessionItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TurnDetail {
  turn_id: number;
  turn_number: number;
  speaker: string;
  question_id: number | null;
  message_text: string | null;
  audio_url: string | null;
  user_audio_url: string | null;
  transcribed_text: string | null;
  clarity_score: number | null;
  logic_score: number | null;
  example_score: number | null;
  overall_score: number | null;
  feedback_text: string | null;
  question_type: string | null;
  star_analysis: { situation: boolean; task: boolean; action: boolean; result: boolean } | null;
  speaking_pace: number | null;
  hesitation_count: number;
  filler_word_count: number;
  tips_text: string | null;
  ideal_answer: string | null;
  created_at: string;
}

export interface SessionDetailData {
  session_id: number;
  candidate_id: number;
  domain_name: string | null;
  role_name: string | null;
  experience_level: string | null;
  language: string;
  mode: string;
  status: string;
  total_score: number | null;
  started_at: string;
  completed_at: string | null;
  turns: TurnDetail[];
  avg_clarity: number | null;
  avg_logic: number | null;
  avg_example: number | null;
}

export interface SessionResultData {
  session_id: number;
  candidate_id: number;
  status: string;
  total_score: number | null;
  readiness_badge: string;
  clarity_score: number | null;
  structure_score: number | null;
  evidence_score: number | null;
  speaking_pace_wpm: number | null;
  pace_rating: string | null;
  filler_count: number | null;
  filler_words: string[];
  pause_duration: number | null;
  star_analysis: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  } | null;
  evaluation_status: "ready" | "pending" | "partial" | "unavailable";
  evaluated_turns: number;
  eligible_turns: number;
  turns: TurnDetail[];
}
