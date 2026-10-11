import { request } from "@/services/apiClient";
import type { CourseItem } from "@/types/course";
import type { CourseCurriculumSection, ResolvedLesson } from "@/data/lessonResolver";

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
  orderIndex?: number;
}

export interface LessonCreateIn {
  title: string;
  durationMinutes: number;
  type: "video" | "reading" | "star_practice" | "mock_simulation" | "quiz";
  isFree: boolean;
  orderIndex?: number;
  videoUrl?: string;
  videoFileName?: string;
  videoSize?: string;
  contentHtml?: string;
  targetChapterId?: string;
  practiceQuestion?: {
    prompt: string;
    intent?: string;
    starSituation?: string;
    starTask?: string;
    starAction?: string;
    starResult?: string;
    sampleAnswer?: string;
  };
}

// Convert Backend Course item to Frontend CourseItem interface
export function toCourseItem(c: any): CourseItem {
  const chapterCount = c.chapter_count || (c.chapters ? c.chapters.length : 0);
  const lessonCount = c.lesson_count || (c.chapters ? c.chapters.reduce((acc: number, ch: any) => acc + (ch.lessons ? ch.lessons.length : 0), 0) : 0);

  return {
    id: String(c.course_id || c.id || ""),
    slug: c.slug,
    title: c.title,
    type: c.type || "Course",
    category: c.category || "Engineering",
    role: c.role || "Software Engineer",
    level: c.level || "all",
    levelLabel: c.level_label || (c.level === "senior" ? "Senior / Lead" : "Fresher / Mid"),
    meta: `${chapterCount} Chương · ${lessonCount} Bài học`,
    totalCoursesCount: c.type === "Learning Path" ? 3 : 1,
    totalLessonsCount: lessonCount,
    estimatedHours: c.estimated_hours || c.estimatedHours || 10,
    rating: 5.0,
    reviewCount: 0,
    enrolledCount: 1,
    targetCompanies: c.target_companies || c.targetCompanies || ["Google", "Meta", "Amazon"],
    description: c.description || "",
    highlights: c.highlights || [
      "Lộ trình được chuẩn hóa theo tiêu chí tuyển dụng quốc tế.",
      "Rèn luyện kỹ năng trả lời theo khung STAR có số liệu định lượng.",
      "Giả lập phỏng vấn thử 1-1 cùng AI Coach.",
    ],
    skills: c.skills || ["Interview Prep", "STAR", "Problem Solving"],
    image: c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    modules: c.chapters
      ? c.chapters.map((ch: any) => ({
          id: String(ch.chapter_id || ch.id),
          title: ch.title,
          description: ch.description || "",
          lessons: ch.lessons
            ? ch.lessons.map((ls: any) => ({
                id: String(ls.lesson_id || ls.id),
                title: ls.title,
                durationMinutes: ls.duration_minutes || ls.durationMinutes || 10,
                type: ls.type || "reading",
                isFree: Boolean(ls.is_free ?? ls.isFree),
              }))
            : [],
        }))
      : [],
  };
}

// Convert Backend detail chapters to CourseCurriculumSection
export function toCurriculumSections(c: any): CourseCurriculumSection[] {
  if (!c || !c.chapters) return [];
  return c.chapters.map((ch: any) => {
    const chId = String(ch.chapter_id || ch.id);
    return {
      id: chId,
      title: ch.title,
      titleEn: ch.title_en || ch.titleEn || ch.title,
      description: ch.description || "",
      lessons: ch.lessons
        ? ch.lessons.map((ls: any) => {
            const lsId = String(ls.lesson_id || ls.id);
            return {
              id: lsId,
              title: ls.title,
              href: `/courses/${c.slug}/${chId}/${lsId}`,
              durationMinutes: ls.duration_minutes || ls.durationMinutes || 10,
              type: ls.type || "reading",
              isFree: Boolean(ls.is_free ?? ls.isFree),
              isVideo: ls.type === "video" || Boolean(ls.video_url || ls.videoUrl),
              videoUrl: ls.video_url || ls.videoUrl,
              videoFileName: ls.video_file_name || ls.videoFileName,
              videoSize: ls.video_size || ls.videoSize,
              contentHtml: ls.content_html || ls.contentHtml,
              practiceQuestion: ls.practice_question || ls.practiceQuestion,
              chapterId: chId,
              chapterTitle: ch.title,
            };
          })
        : [],
    };
  });
}

// Helper: resolve course ID from slug
async function resolveCourseId(slugOrId: string): Promise<number> {
  if (/^\d+$/.test(slugOrId)) {
    return Number(slugOrId);
  }
  const detail = await request<any>(`/api/v1/courses/${slugOrId}`);
  if (detail && detail.course_id) {
    return detail.course_id;
  }
  throw new Error("Khóa học không tồn tại");
}

export const courseAdminApi = {
  // 1. Get Courses List from Real Backend
  async getCourses(params: {
    category?: string;
    level?: string;
    type?: string;
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<CourseItem[]> {
    const q = new URLSearchParams();
    if (params.category && params.category !== "all") q.set("category", params.category);
    if (params.level && params.level !== "all") q.set("level", params.level);
    if (params.role && params.role !== "all") q.set("role", params.role);
    if (params.search && params.search.trim()) q.set("search", params.search.trim());
    if (params.limit) q.set("limit", String(params.limit));
    if (params.offset) q.set("offset", String(params.offset));

    const qs = q.toString() ? `?${q.toString()}` : "";
    try {
      const res = await request<{ items: any[]; total: number }>(`/api/v1/admin/courses${qs}`);
      if (res && Array.isArray(res.items)) {
        return res.items.map(toCourseItem);
      }
    } catch {
      // Fallback to public courses endpoint if not logged in as admin
      const pubRes = await request<{ items: any[]; total: number }>(`/api/v1/courses${qs}`);
      if (pubRes && Array.isArray(pubRes.items)) {
        return pubRes.items.map(toCourseItem);
      }
    }
    return [];
  },

  // 2. Get Single Course Detail
  async getCourse(slugOrId: string): Promise<CourseItem | null> {
    try {
      const res = await request<any>(`/api/v1/courses/${slugOrId}`);
      if (res) return toCourseItem(res);
    } catch (err) {
      console.warn("Course detail fetch failed:", err);
    }
    return null;
  },

  // 3. Create Course in Real DB
  async createCourse(data: CourseAdminCreateIn): Promise<CourseItem> {
    const payload = {
      title: data.title.trim(),
      slug: data.slug?.trim() || undefined,
      type: data.type || "Course",
      category: data.category || "Engineering",
      role: data.role || "Software Engineer",
      level: data.level || "all",
      level_label: data.levelLabel,
      estimated_hours: Number(data.estimatedHours) || 10,
      description: data.description.trim(),
      target_companies: data.targetCompanies || [],
      skills: data.skills || [],
      highlights: data.highlights || [],
      image: data.image?.trim() || undefined,
      is_active: data.is_active ?? true,
    };

    const res = await request<any>("/api/v1/admin/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return toCourseItem(res);
  },

  // 4. Update Course in Real DB
  async updateCourse(slugOrId: string, data: CourseAdminUpdateIn): Promise<CourseItem> {
    const courseId = await resolveCourseId(slugOrId);
    const payload = {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug.trim() } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.level !== undefined ? { level: data.level } : {}),
      ...(data.levelLabel !== undefined ? { level_label: data.levelLabel } : {}),
      ...(data.estimatedHours !== undefined ? { estimated_hours: Number(data.estimatedHours) } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(data.targetCompanies !== undefined ? { target_companies: data.targetCompanies } : {}),
      ...(data.skills !== undefined ? { skills: data.skills } : {}),
      ...(data.highlights !== undefined ? { highlights: data.highlights } : {}),
      ...(data.image !== undefined ? { image: data.image.trim() } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    };

    const res = await request<any>(`/api/v1/admin/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return toCourseItem(res);
  },

  // 5. Delete Course in Real DB
  async deleteCourse(slugOrId: string): Promise<void> {
    const courseId = await resolveCourseId(slugOrId);
    await request<void>(`/api/v1/admin/courses/${courseId}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // CURRICULUM & LESSONS MANAGEMENT (CRUD)
  // ==========================================
  async getCurriculum(slugOrId: string): Promise<CourseCurriculumSection[]> {
    try {
      const res = await request<any>(`/api/v1/courses/${slugOrId}`);
      if (res) return toCurriculumSections(res);
    } catch (err) {
      console.warn("Get curriculum failed:", err);
    }
    return [];
  },

  async addChapter(slugOrId: string, data: ChapterCreateIn): Promise<CourseCurriculumSection> {
    const courseId = await resolveCourseId(slugOrId);
    const payload = {
      title: data.title.trim(),
      title_en: data.titleEn?.trim() || undefined,
      description: data.description?.trim() || undefined,
      order_index: data.orderIndex ?? 0,
    };

    const res = await request<any>(`/api/v1/admin/courses/${courseId}/chapters`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      id: String(res.chapter_id),
      title: res.title,
      titleEn: res.title_en || res.title,
      description: res.description || "",
      lessons: [],
    };
  },

  async updateChapter(
    slugOrId: string,
    chapterId: string,
    data: Partial<ChapterCreateIn>
  ): Promise<CourseCurriculumSection> {
    const chId = Number(chapterId);
    const payload = {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.titleEn !== undefined ? { title_en: data.titleEn.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(data.orderIndex !== undefined ? { order_index: data.orderIndex } : {}),
    };

    const res = await request<any>(`/api/v1/admin/courses/chapters/${chId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return {
      id: String(res.chapter_id),
      title: res.title,
      titleEn: res.title_en || res.title,
      description: res.description || "",
      lessons: res.lessons || [],
    };
  },

  async deleteChapter(slugOrId: string, chapterId: string): Promise<void> {
    const chId = Number(chapterId);
    await request<void>(`/api/v1/admin/courses/chapters/${chId}`, {
      method: "DELETE",
    });
  },

  async addLesson(slugOrId: string, chapterId: string, data: LessonCreateIn): Promise<ResolvedLesson> {
    const chId = Number(chapterId);
    const payload = {
      title: data.title.trim(),
      duration_minutes: Number(data.durationMinutes) || 10,
      type: data.type || "reading",
      is_free: Boolean(data.isFree),
      order_index: data.orderIndex ?? 0,
      video_url: data.videoUrl?.trim() || undefined,
      video_file_name: data.videoFileName?.trim() || undefined,
      video_size: data.videoSize?.trim() || undefined,
      content_html: data.contentHtml?.trim() || undefined,
      practice_question: data.practiceQuestion || undefined,
    };

    const res = await request<any>(`/api/v1/admin/courses/chapters/${chId}/lessons`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      id: String(res.lesson_id),
      title: res.title,
      href: `/courses/${slugOrId}/${chId}/${res.lesson_id}`,
      durationMinutes: res.duration_minutes || 10,
      type: res.type || "reading",
      isFree: Boolean(res.is_free),
      isVideo: res.type === "video" || Boolean(res.video_url),
      videoUrl: res.video_url,
      videoFileName: res.video_file_name,
      videoSize: res.video_size,
      contentHtml: res.content_html,
      practiceQuestion: res.practice_question,
      chapterId: String(chId),
      chapterTitle: "",
    };
  },

  async updateLesson(
    slugOrId: string,
    chapterId: string,
    lessonId: string,
    data: Partial<LessonCreateIn>
  ): Promise<ResolvedLesson> {
    const lsId = Number(lessonId);
    const payload = {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.durationMinutes !== undefined ? { duration_minutes: Number(data.durationMinutes) } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.isFree !== undefined ? { is_free: Boolean(data.isFree) } : {}),
      ...(data.orderIndex !== undefined ? { order_index: data.orderIndex } : {}),
      ...(data.videoUrl !== undefined ? { video_url: data.videoUrl.trim() || null } : {}),
      ...(data.videoFileName !== undefined ? { video_file_name: data.videoFileName.trim() || null } : {}),
      ...(data.videoSize !== undefined ? { video_size: data.videoSize.trim() || null } : {}),
      ...(data.contentHtml !== undefined ? { content_html: data.contentHtml || null } : {}),
      ...(data.practiceQuestion !== undefined ? { practice_question: data.practiceQuestion } : {}),
    };

    const res = await request<any>(`/api/v1/admin/courses/lessons/${lsId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return {
      id: String(res.lesson_id),
      title: res.title,
      href: `/courses/${slugOrId}/${chapterId}/${res.lesson_id}`,
      durationMinutes: res.duration_minutes || 10,
      type: res.type || "reading",
      isFree: Boolean(res.is_free),
      isVideo: res.type === "video" || Boolean(res.video_url),
      videoUrl: res.video_url,
      videoFileName: res.video_file_name,
      videoSize: res.video_size,
      contentHtml: res.content_html,
      practiceQuestion: res.practice_question,
      chapterId: String(chapterId),
      chapterTitle: "",
    };
  },

  async deleteLesson(slugOrId: string, chapterId: string, lessonId: string): Promise<void> {
    const lsId = Number(lessonId);
    await request<void>(`/api/v1/admin/courses/lessons/${lsId}`, {
      method: "DELETE",
    });
  },

  // 6. Get Single Lesson with Chapter
  async getLesson(slugOrId: string, lessonId: string): Promise<{ lesson: ResolvedLesson; chapter: CourseCurriculumSection } | null> {
    try {
      const curriculum = await this.getCurriculum(slugOrId);
      for (const ch of curriculum) {
        const found = ch.lessons.find((l) => l.id === lessonId);
        if (found) return { lesson: found, chapter: ch };
      }
    } catch (err) {
      console.warn("Get lesson failed:", err);
    }
    return null;
  },

  // 7. Move Lesson / Chapter helpers
  async moveChapter(
    slugOrId: string,
    chapterId: string,
    direction: "up" | "down"
  ): Promise<CourseCurriculumSection[]> {
    return this.getCurriculum(slugOrId);
  },

  async moveLesson(
    slugOrId: string,
    chapterId: string,
    lessonId: string,
    direction: "up" | "down"
  ): Promise<CourseCurriculumSection[]> {
    return this.getCurriculum(slugOrId);
  },

  async moveLessonBetweenChapters(
    slugOrId: string,
    fromChapterId: string,
    toChapterId: string,
    lessonId: string
  ): Promise<CourseCurriculumSection[]> {
    return this.getCurriculum(slugOrId);
  },

  // 8. Upload Video File
  async uploadVideo(file: File): Promise<{ url: string; fileName: string; size: string }> {
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "interviewly/courses/videos");
      formData.append("resource_type", "video");

      const token = typeof window !== "undefined" ? localStorage.getItem("interviewly_token") : null;
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/api/v1/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          return { url: data.url, fileName: file.name, size: sizeStr };
        }
      }
    } catch (err) {
      console.warn("Upload to backend API failed:", err);
    }

    const localUrl = URL.createObjectURL(file);
    return { url: localUrl, fileName: file.name, size: sizeStr };
  },
};
