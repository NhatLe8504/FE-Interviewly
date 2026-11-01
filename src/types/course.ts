export type CourseType = "Learning Path" | "Course" | "Workshop";
export type CourseLevel = "all" | "fresher" | "junior" | "mid" | "senior" | "lead";

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  type: "video" | "reading" | "star_practice" | "mock_simulation" | "quiz";
  isFree?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface CourseItem {
  id: string;
  slug: string;
  title: string;
  type: CourseType;
  category: string;
  role: string;
  level: CourseLevel;
  levelLabel: string;
  meta: string;
  totalCoursesCount?: number;
  totalLessonsCount: number;
  estimatedHours: number;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  targetCompanies: string[];
  description: string;
  highlights: string[];
  skills: string[];
  image: string;
  modules?: CourseModule[];
}


export interface LessonOut {
  lesson_id: number;
  chapter_id: number;
  title: string;
  duration_minutes: number;
  type: string;
  is_free: boolean;
  order_index: number;
  video_url: string | null;
  video_file_name: string | null;
  video_size: string | null;
  content_html: string | null;
  practice_question: Record<string, any> | null;
  created_at?: string | null;
}

export interface ChapterOut {
  chapter_id: number;
  course_id: number;
  title: string;
  title_en: string | null;
  description: string | null;
  order_index: number;
  lesson_count: number;
}

export interface ChapterDetailOut extends ChapterOut {
  lessons: LessonOut[];
}

export interface CourseOut {
  course_id: number;
  title: string;
  slug: string;
  type: string;
  category: string;
  role: string;
  level: string;
  level_label: string | null;
  estimated_hours: number;
  description: string;
  target_companies: string[];
  skills: string[];
  highlights: string[];
  image: string | null;
  is_active: boolean;
  chapter_count: number;
  lesson_count: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CourseDetailOut extends CourseOut {
  chapters: ChapterDetailOut[];
}

export interface CourseListResponse {
  items: CourseOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface CourseFilterParams {
  category?: string;
  level?: string;
  type?: string;
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
