import { COURSES_DATA } from "@/data/coursesData";
import { EM_COURSE_SECTIONS } from "@/data/emCourseCurriculum";
import type { CourseItem } from "@/types/course";
import { CourseCurriculumSection, ResolvedLesson } from "@/data/lessonResolver";

const STORAGE_COURSES_KEY = "admin_managed_courses_v1";
const STORAGE_CURRICULUM_PREFIX = "admin_course_curriculum_";

export interface CourseAdminCreateIn {
  title: string;
  slug?: string;
  type: "Learning Path" | "Course" | "Workshop";
  category: string;
  role: string;
  level: "all" | "fresher" | "junior" | "mid" | "senior" | "lead";
  levelLabel?: string;
  estimatedHours: number;
  description: string;
  targetCompanies?: string[];
  skills?: string[];
  highlights?: string[];
  image?: string;
  is_active?: boolean;
}

export interface CourseAdminUpdateIn extends Partial<CourseAdminCreateIn> {}

export interface ChapterCreateIn {
  title: string;
  titleEn?: string;
  description?: string;
}

export interface LessonCreateIn {
  title: string;
  durationMinutes: number;
  type: "video" | "reading" | "star_practice" | "mock_simulation" | "quiz";
  isFree: boolean;
  videoUrl?: string;
}

// Helper: Get local saved courses or fallback to COURSES_DATA
function getStoredCourses(): CourseItem[] {
  if (typeof window === "undefined") return COURSES_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_COURSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Error reading stored courses:", e);
  }
  return COURSES_DATA;
}

function saveStoredCourses(courses: CourseItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(courses));
  } catch (e) {
    console.warn("Error saving stored courses:", e);
  }
}

// Helper: Get course curriculum sections
function getStoredCurriculum(slug: string): CourseCurriculumSection[] {
  if (typeof window === "undefined") {
    return slug === "engineering-management" ? (EM_COURSE_SECTIONS as any) : [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_CURRICULUM_PREFIX + slug);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }

  if (slug === "engineering-management") {
    return EM_COURSE_SECTIONS.map((sec) => ({
      id: sec.id,
      title: sec.title,
      titleEn: sec.titleEn,
      description: sec.description,
      lessons: sec.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        href: l.href || `/courses/engineering-management/${sec.id}/${l.id}`,
        durationMinutes: l.durationMinutes || 15,
        type: l.type as any,
        isFree: Boolean(l.isFree),
        isVideo: Boolean(l.isVideo),
        chapterId: sec.id,
        chapterTitle: sec.title,
      })),
    }));
  }

  return [
    {
      id: "m-1",
      title: "Chương 1: Nền Tảng Chuyên Môn & Tiêu Chí Phỏng Vấn",
      titleEn: "Core Fundamentals & Evaluation Rubric",
      description: "Bản đồ kiến thức cốt lõi và các vòng phỏng vấn chuyên sâu.",
      lessons: [
        {
          id: "l-1-1",
          title: "Tổng quan các vòng phỏng vấn và tiêu chuẩn đánh giá",
          href: `/courses/${slug}/m-1/l-1-1`,
          durationMinutes: 15,
          type: "video",
          isFree: true,
          isVideo: true,
          chapterId: "m-1",
          chapterTitle: "Chương 1: Nền Tảng Chuyên Môn",
        },
        {
          id: "l-1-2",
          title: "Khung năng lực chuyên sâu và tiêu chí phỏng vấn viên tìm kiếm",
          href: `/courses/${slug}/m-1/l-1-2`,
          durationMinutes: 20,
          type: "reading",
          isFree: true,
          isVideo: false,
          chapterId: "m-1",
          chapterTitle: "Chương 1: Nền Tảng Chuyên Môn",
        },
      ],
    },
  ];
}

function saveStoredCurriculum(slug: string, sections: CourseCurriculumSection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CURRICULUM_PREFIX + slug, JSON.stringify(sections));
  } catch (e) {
    console.warn("Error saving stored curriculum:", e);
  }
}

export const courseAdminApi = {
  // 1. Get Courses List
  async getCourses(params: {
    category?: string;
    level?: string;
    type?: string;
    search?: string;
  } = {}): Promise<CourseItem[]> {
    let list = getStoredCourses();

    if (params.category && params.category !== "all") {
      list = list.filter((c) => c.category === params.category);
    }
    if (params.type && params.type !== "all") {
      list = list.filter((c) => c.type === params.type);
    }
    if (params.level && params.level !== "all") {
      list = list.filter((c) => c.level === params.level || c.level === "all");
    }
    if (params.search && params.search.trim()) {
      const kw = params.search.trim().toLowerCase();
      list = list.filter((c) =>
        c.title.toLowerCase().includes(kw) ||
        c.role.toLowerCase().includes(kw) ||
        c.description.toLowerCase().includes(kw) ||
        c.skills.some((s) => s.toLowerCase().includes(kw))
      );
    }

    return list;
  },

  // 2. Get Single Course
  async getCourse(slug: string): Promise<CourseItem | null> {
    const list = getStoredCourses();
    const found = list.find((c) => c.slug === slug || c.id === slug);
    return found || null;
  },

  // 3. Create Course
  async createCourse(data: CourseAdminCreateIn): Promise<CourseItem> {
    const list = getStoredCourses();
    const slug = data.slug?.trim() || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newId = `course-${Date.now()}`;

    const newCourse: CourseItem = {
      id: newId,
      slug,
      title: data.title.trim(),
      type: data.type || "Learning Path",
      category: data.category || "swe",
      role: data.role || "Software Engineer",
      level: data.level || "mid",
      levelLabel: data.levelLabel || (data.level === "senior" ? "Senior / Lead" : "Fresher / Mid"),
      meta: "1 Chương · 2 Bài học",
      totalCoursesCount: data.type === "Learning Path" ? 3 : 1,
      totalLessonsCount: 2,
      estimatedHours: data.estimatedHours || 15,
      rating: 5.0,
      reviewCount: 0,
      enrolledCount: 1,
      targetCompanies: data.targetCompanies && data.targetCompanies.length > 0 ? data.targetCompanies : ["Google", "Meta", "Amazon"],
      description: data.description.trim(),
      highlights: data.highlights && data.highlights.length > 0 ? data.highlights : [
        "Lộ trình được chuẩn hóa theo tiêu chí tuyển dụng quốc tế.",
        "Rèn luyện kỹ năng trả lời theo khung STAR có số liệu định lượng.",
        "Giả lập phỏng vấn thử 1-1 cùng AI Coach."
      ],
      skills: data.skills && data.skills.length > 0 ? data.skills : ["Interview Prep", "STAR", "Problem Solving"],
      image: data.image?.trim() || "https://images.ctfassets.net/x78yjrjc11pq/25mhKSvDOiCwC89lDj89Ah/9a5fbfacc8d93f05c238ab55baa4e5e5/fde.png?w=800&h=800&fm=webp&q=75",
    };

    const updatedList = [newCourse, ...list];
    saveStoredCourses(updatedList);
    return newCourse;
  },

  // 4. Update Course
  async updateCourse(slug: string, data: CourseAdminUpdateIn): Promise<CourseItem> {
    const list = getStoredCourses();
    let updatedCourse: CourseItem | null = null;

    const nextList = list.map((c) => {
      if (c.slug === slug || c.id === slug) {
        updatedCourse = {
          ...c,
          ...data,
          targetCompanies: data.targetCompanies || c.targetCompanies,
          skills: data.skills || c.skills,
          highlights: data.highlights || c.highlights,
        };
        return updatedCourse;
      }
      return c;
    });

    if (!updatedCourse) throw new Error("Khóa học không tồn tại");
    saveStoredCourses(nextList);
    return updatedCourse;
  },

  // 5. Delete Course
  async deleteCourse(slug: string): Promise<void> {
    const list = getStoredCourses();
    const nextList = list.filter((c) => c.slug !== slug && c.id !== slug);
    saveStoredCourses(nextList);
  },

  // ==========================================
  // CURRICULUM & LESSONS MANAGEMENT (CRUD)
  // ==========================================
  async getCurriculum(slug: string): Promise<CourseCurriculumSection[]> {
    return getStoredCurriculum(slug);
  },

  async addChapter(slug: string, data: ChapterCreateIn): Promise<CourseCurriculumSection> {
    const sections = getStoredCurriculum(slug);
    const newSecId = `sec-${Date.now()}`;
    const newSec: CourseCurriculumSection = {
      id: newSecId,
      title: data.title.trim(),
      titleEn: data.titleEn?.trim() || data.title.trim(),
      description: data.description?.trim() || "Mô tả nội dung chương học.",
      lessons: [],
    };
    sections.push(newSec);
    saveStoredCurriculum(slug, sections);
    return newSec;
  },

  async updateChapter(slug: string, chapterId: string, data: Partial<ChapterCreateIn>): Promise<CourseCurriculumSection> {
    const sections = getStoredCurriculum(slug);
    const sec = sections.find((s) => s.id === chapterId);
    if (!sec) throw new Error("Chương học không tồn tại");
    if (data.title) sec.title = data.title.trim();
    if (data.titleEn) sec.titleEn = data.titleEn.trim();
    if (data.description) sec.description = data.description.trim();
    saveStoredCurriculum(slug, sections);
    return sec;
  },

  async deleteChapter(slug: string, chapterId: string): Promise<void> {
    const sections = getStoredCurriculum(slug);
    const nextSections = sections.filter((s) => s.id !== chapterId);
    saveStoredCurriculum(slug, nextSections);
  },

  async addLesson(slug: string, chapterId: string, data: LessonCreateIn): Promise<ResolvedLesson> {
    const sections = getStoredCurriculum(slug);
    const sec = sections.find((s) => s.id === chapterId);
    if (!sec) throw new Error("Chương học không tồn tại");

    const newId = `les-${Date.now()}`;
    const newLesson: ResolvedLesson = {
      id: newId,
      title: data.title.trim(),
      href: `/courses/${slug}/${chapterId}/${newId}`,
      durationMinutes: data.durationMinutes || 15,
      type: data.type || "video",
      isFree: Boolean(data.isFree),
      isVideo: data.type === "video" || Boolean(data.videoUrl),
      videoUrl: data.videoUrl?.trim(),
      chapterId: sec.id,
      chapterTitle: sec.title,
    };

    sec.lessons.push(newLesson);
    saveStoredCurriculum(slug, sections);

    // Update total count on course
    const allCourses = getStoredCourses();
    const course = allCourses.find((c) => c.slug === slug || c.id === slug);
    if (course) {
      course.totalLessonsCount = (course.totalLessonsCount || 0) + 1;
      saveStoredCourses(allCourses);
    }

    return newLesson;
  },

  async updateLesson(
    slug: string,
    chapterId: string,
    lessonId: string,
    data: Partial<LessonCreateIn>
  ): Promise<ResolvedLesson> {
    const sections = getStoredCurriculum(slug);
    const sec = sections.find((s) => s.id === chapterId);
    if (!sec) throw new Error("Chương học không tồn tại");
    const lesson = sec.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error("Bài học không tồn tại");

    if (data.title) lesson.title = data.title.trim();
    if (data.durationMinutes) lesson.durationMinutes = data.durationMinutes;
    if (data.type) {
      lesson.type = data.type;
      lesson.isVideo = data.type === "video" || Boolean(data.videoUrl);
    }
    if (data.isFree !== undefined) lesson.isFree = data.isFree;
    if (data.videoUrl !== undefined) {
      lesson.videoUrl = data.videoUrl.trim() || undefined;
      if (lesson.videoUrl) lesson.isVideo = true;
    }

    saveStoredCurriculum(slug, sections);
    return lesson;
  },

  async deleteLesson(slug: string, chapterId: string, lessonId: string): Promise<void> {
    const sections = getStoredCurriculum(slug);
    const sec = sections.find((s) => s.id === chapterId);
    if (!sec) throw new Error("Chương học không tồn tại");
    sec.lessons = sec.lessons.filter((l) => l.id !== lessonId);
    saveStoredCurriculum(slug, sections);

    // Update total count on course
    const allCourses = getStoredCourses();
    const course = allCourses.find((c) => c.slug === slug || c.id === slug);
    if (course && course.totalLessonsCount > 0) {
      course.totalLessonsCount -= 1;
      saveStoredCourses(allCourses);
    }
  },
};
