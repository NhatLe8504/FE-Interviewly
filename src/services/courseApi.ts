import { request } from "./apiClient";
import type {
  CourseDetailOut,
  CourseFilterParams,
  CourseListResponse,
  LessonOut,
} from "@/types/course";

export const courseApi = {
  /**
   * List all active courses with filtering, pagination and stable sorting.
   */
  listCourses: async (params?: CourseFilterParams): Promise<CourseListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      searchParams.set("category", params.category);
    }
    if (params?.level && params.level !== "all") {
      searchParams.set("level", params.level);
    }
    if (params?.type && params.type !== "all") {
      searchParams.set("type", params.type);
    }
    if (params?.role && params.role !== "all") {
      searchParams.set("role", params.role);
    }
    if (params?.search && params.search.trim()) {
      searchParams.set("search", params.search.trim());
    }
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset !== undefined) {
      searchParams.set("offset", String(params.offset));
    }

    const qs = searchParams.toString();
    const endpoint = qs ? `/api/v1/courses?${qs}` : "/api/v1/courses";
    return request<CourseListResponse>(endpoint);
  },

  /**
   * Get public course details including chapters and lesson metadata.
   * Locked lessons will have content_html, video_url, and practice_question stripped for unauthorized users.
   */
  getCourseDetail: async (slugOrId: string | number): Promise<CourseDetailOut> => {
    return request<CourseDetailOut>(`/api/v1/courses/${encodeURIComponent(String(slugOrId))}`);
  },

  /**
   * Get lesson detail with authorization check.
   * Free lessons return 200 for everyone.
   * Locked lessons return 401 (if guest) or 403 (if non-pro).
   */
  getLesson: async (
    slugOrId: string | number,
    lessonId: number
  ): Promise<LessonOut> => {
    return request<LessonOut>(
      `/api/v1/courses/${encodeURIComponent(String(slugOrId))}/lessons/${lessonId}`
    );
  },
};
