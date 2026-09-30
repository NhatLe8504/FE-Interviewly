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
