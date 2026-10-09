export type ExperienceLevel =
  | "intern"
  | "fresher"
  | "junior"
  | "middle"
  | "senior"
  | "lead";

export type PreferredLanguage = "vi" | "en";

export interface ProfileOut {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  preferred_language: string;
  status: string;
  experience_level: string | null;
  target_domain_id: number | null;
  target_domain_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  mascot_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileUpdateIn {
  full_name?: string | null;
  phone?: string | null;
  preferred_language?: PreferredLanguage | null;
  experience_level?: ExperienceLevel | null;
  target_domain_id?: number | null;
  bio?: string | null;
  avatar_url?: string | null;
  mascot_id?: string | null;
}

export interface ChangePasswordIn {
  current_password: string;
  new_password: string;
}

export interface MessageOut {
  message: string;
}

export interface SkillLevelItem {
  skill_id: string;
  name: string;
  ability_score: number;
  level: string;
  confidence: number;
  evidence_count: number;
  max_difficulty_passed: number;
}

export interface UserCareerProfileOut {
  user_id: number;
  primary_role_track: string;
  secondary_role_track: string | null;
  role_confidence: number;
  overall_level: string;
  top_skills: Array<{
    skill_id: string;
    name: string;
    level: string;
    ability_score: number;
    confidence: number;
  }>;
  weak_skills: Array<{
    skill_id: string;
    name: string;
    level: string;
    ability_score: number;
    confidence: number;
  }>;
  skills: SkillLevelItem[];
}
