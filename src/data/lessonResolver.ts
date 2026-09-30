import { COURSES_DATA } from "@/data/coursesData";
import { EM_COURSE_SECTIONS } from "@/data/emCourseCurriculum";
import type { CourseItem, CourseLesson } from "@/types/course";

export interface ResolvedLesson {
  id: string;
  title: string;
  href: string;
  durationMinutes: number;
  type: "video" | "reading" | "star_practice" | "mock_simulation" | "quiz";
  isFree: boolean;
  isVideo: boolean;
  chapterId: string;
  chapterTitle: string;
  videoUrl?: string;
  contentHtml?: string;
  transcript?: { time: string; textVi: string; textEn: string }[];
  quiz?: {
    question: string;
    options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  };
  practiceQuestion?: {
    prompt: string;
    intent: string;
    starSituation: string;
    starTask: string;
    starAction: string;
    starResult: string;
    sampleAnswer: string;
  };
  keyTakeaways?: string[];
  pitfalls?: string[];
}

export interface CourseCurriculumSection {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  lessons: ResolvedLesson[];
}

export interface LessonContext {
  course: CourseItem;
  currentLesson: ResolvedLesson;
  allSections: CourseCurriculumSection[];
  flattenedLessons: ResolvedLesson[];
  currentIndex: number;
  totalLessons: number;
  prevLesson: ResolvedLesson | null;
  nextLesson: ResolvedLesson | null;
}

export function getCourseCurriculum(slug: string): {
  course: CourseItem;
  sections: CourseCurriculumSection[];
  flattened: ResolvedLesson[];
} {
  const course = COURSES_DATA.find((c) => c.slug === slug) || COURSES_DATA[0];

  let sections: CourseCurriculumSection[] = [];

  if (slug === "engineering-management") {
    sections = EM_COURSE_SECTIONS.map((sec) => ({
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
  } else if (course.modules && course.modules.length > 0) {
    sections = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        href: `/courses/${course.slug}/${m.id}/${l.id}`,
        durationMinutes: l.durationMinutes || 15,
        type: l.type as any,
        isFree: Boolean(l.isFree),
        isVideo: l.type === "video",
        chapterId: m.id,
        chapterTitle: m.title,
      })),
    }));
  } else {
    // Default fallback curriculum for any course
    sections = [
      {
        id: "m-1",
        title: "Chương 1: Nền Tảng Chuyên Môn & Khung Tiêu Chí Đánh Giá",
        description: `Bản đồ kiến thức cốt lõi và các vòng phỏng vấn cho ${course.role}.`,
        lessons: [
          {
            id: "l-1-1",
            title: `Tổng quan vòng phỏng vấn ${course.role}`,
            href: `/courses/${course.slug}/m-1/l-1-1`,
            durationMinutes: 15,
            type: "video",
            isFree: true,
            isVideo: true,
            chapterId: "m-1",
            chapterTitle: "Chương 1: Nền Tảng Chuyên Môn",
          },
          {
            id: "l-1-2",
            title: "Khung năng lực kỹ thuật và tiêu chí đánh giá của phỏng vấn viên",
            href: `/courses/${course.slug}/m-1/l-1-2`,
            durationMinutes: 20,
            type: "reading",
            isFree: true,
            isVideo: false,
            chapterId: "m-1",
            chapterTitle: "Chương 1: Nền Tảng Chuyên Môn",
          },
          {
            id: "l-1-3",
            title: "Kiểm tra trắc nghiệm: Đo lường độ nhạy bén nghiệp vụ",
            href: `/courses/${course.slug}/m-1/l-1-3`,
            durationMinutes: 15,
            type: "quiz",
            isFree: true,
            isVideo: false,
            chapterId: "m-1",
            chapterTitle: "Chương 1: Nền Tảng Chuyên Môn",
          },
        ],
      },
      {
        id: "m-2",
        title: "Chương 2: Mổ Xẻ Tình Huống Kỹ Thuật Thực Chiến (Case Studies)",
        description: "Các bài toán thực tế, tối ưu hóa kiến trúc và xử lý rủi ro.",
        lessons: [
          {
            id: "l-2-1",
            title: "Phân tích tình huống xử lý sự cố thực tế và các đánh đổi (Trade-offs)",
            href: `/courses/${course.slug}/m-2/l-2-1`,
            durationMinutes: 30,
            type: "video",
            isFree: false,
            isVideo: true,
            chapterId: "m-2",
            chapterTitle: "Chương 2: Mổ Xẻ Tình Huống Kỹ Thuật",
          },
          {
            id: "l-2-2",
            title: "Cấu trúc câu trả lời tự luận theo khung STAR chuẩn mực",
            href: `/courses/${course.slug}/m-2/l-2-2`,
            durationMinutes: 25,
            type: "reading",
            isFree: false,
            isVideo: false,
            chapterId: "m-2",
            chapterTitle: "Chương 2: Mổ Xẻ Tình Huống Kỹ Thuật",
          },
          {
            id: "l-2-3",
            title: "Bài tập thực hành STAR: Tối ưu hóa hiệu suất và độ tin cậy",
            href: `/courses/${course.slug}/m-2/l-2-3`,
            durationMinutes: 35,
            type: "star_practice",
            isFree: false,
            isVideo: false,
            chapterId: "m-2",
            chapterTitle: "Chương 2: Mổ Xẻ Tình Huống Kỹ Thuật",
          },
        ],
      },
      {
        id: "m-3",
        title: "Chương 3: Giả Lập Phỏng Vấn Thử 1-1 Cùng AI Coach",
        description: "Thực hành phản xạ trả lời bằng giọng nói và nhận chấm điểm tức thời.",
        lessons: [
          {
            id: "l-3-1",
            title: "Phỏng vấn thử: Câu hỏi tình huống lãnh đạo và văn hóa làm việc",
            href: `/courses/${course.slug}/m-3/l-3-1`,
            durationMinutes: 25,
            type: "mock_simulation",
            isFree: false,
            isVideo: false,
            chapterId: "m-3",
            chapterTitle: "Chương 3: Giả Lập Phỏng Vấn Thử 1-1",
          },
          {
            id: "l-3-2",
            title: "Phỏng vấn thử: Vòng kỹ thuật chuyên sâu đo lường độ mạch lạc",
            href: `/courses/${course.slug}/m-3/l-3-2`,
            durationMinutes: 30,
            type: "mock_simulation",
            isFree: false,
            isVideo: false,
            chapterId: "m-3",
            chapterTitle: "Chương 3: Giả Lập Phỏng Vấn Thử 1-1",
          },
        ],
      },
    ];
  }

  const flattened: ResolvedLesson[] = [];
  sections.forEach((sec) => {
    sec.lessons.forEach((l) => flattened.push(l));
  });

  return { course, sections, flattened };
}

export function resolveLesson(slug: string, lessonPath: string[] = []): LessonContext {
  const { course, sections, flattened } = getCourseCurriculum(slug);

  const pathStr = lessonPath.join("/").toLowerCase();
  const lastSegment = lessonPath[lessonPath.length - 1]?.toLowerCase() || "";

  // Find matching lesson
  let found = flattened.find((l) => {
    const lHref = l.href.toLowerCase();
    const lId = l.id.toLowerCase();
    return (
      (pathStr && lHref.endsWith(pathStr)) ||
      (lastSegment && (lId === lastSegment || lHref.endsWith("/" + lastSegment)))
    );
  });

  if (!found) {
    found = flattened[0];
  }

  const currentIndex = flattened.findIndex((l) => l.id === found?.id) + 1;
  const prevLesson = currentIndex > 1 ? flattened[currentIndex - 2] : null;
  const nextLesson = currentIndex < flattened.length ? flattened[currentIndex] : null;

  // Enrich with rich lesson content
  const enrichedLesson: ResolvedLesson = {
    ...found,
    videoUrl:
      found.isVideo || slug === "engineering-management"
        ? (found.id.includes("robot")
            ? "https://www.youtube.com/embed/XStqtnUGgTc?autoplay=0&rel=0"
            : found.id.includes("google")
            ? "https://www.youtube.com/embed/XStqtnUGgTc?autoplay=0&rel=0"
            : "https://www.youtube.com/embed/XStqtnUGgTc?autoplay=0&rel=0")
        : undefined,
    transcript: [
      { time: "00:15", textVi: "Chào mừng bạn đến với bài học quan trọng này. Trong buổi hôm nay, chúng ta sẽ phân tích chính xác những gì phỏng vấn viên tìm kiếm.", textEn: "Welcome to this critical lesson. Today we will break down exactly what interviewers look for." },
      { time: "02:40", textVi: "Khi trả lời, sai lầm phổ biến nhất là quá vội vàng đi vào chi tiết vụn vặt mà bỏ qua bức tranh toàn cảnh về mặt chiến lược.", textEn: "When answering, the most common mistake is jumping into weeds without setting up the strategic big picture." },
      { time: "05:10", textVi: "Hãy cấu trúc câu trả lời của bạn theo từng tầng: Bối cảnh vấn đề, các phương án cân nhắc, lý do chọn giải pháp và kết quả định lượng cụ thể.", textEn: "Structure your response into clear layers: Context, alternatives evaluated, rationale for the chosen path, and quantifiable impact." },
      { time: "09:30", textVi: "Bây giờ, hãy áp dụng khung tư duy này vào bài tập tình huống thực chiến bên dưới.", textEn: "Now let us apply this framework to the real-world practice scenario below." },
    ],
    keyTakeaways: [
      "Luôn làm rõ bối cảnh và mục tiêu trước khi đưa ra giải pháp cụ thể.",
      "Chứng minh tầm ảnh hưởng lãnh đạo bằng số liệu định lượng (% tăng trưởng, thời gian giảm, chi phí tiết kiệm).",
      "Thể hiện tư duy đa chiều: Nêu rõ các phương án đã xem xét và lý do chọn giải pháp tối ưu.",
      "Giữ nhịp nói đĩnh đạc (120 - 160 WPM), tránh các từ đệm ('ừm', 'kiểu như').",
    ],
    pitfalls: [
      "Nói quá lan man không có cấu trúc, khiến người nghe mất tập trung.",
      "Quá tập trung vào chi tiết kỹ thuật vi mô mà quên vai trò kết nối mục tiêu kinh doanh.",
      "Đổ lỗi cho hoàn cảnh hoặc đồng nghiệp khi đề cập đến các dự án sự cố.",
    ],
    quiz: {
      question: `Trong tình huống thực tế của bài học '${found.title}', bước xử lý đầu tiên nào thể hiện năng lực chuyên môn và tư duy lãnh đạo chuẩn xác nhất?`,
      options: [
        {
          id: "A",
          text: "Tự mình lao vào sửa code hoặc giải quyết trực tiếp mà không thông báo cho các bên liên quan.",
          isCorrect: false,
          explanation: "Cách tiếp cận vi mô (micromanagement), thiếu tầm nhìn bao quát và vi phạm quy trình giao tiếp.",
        },
        {
          id: "B",
          text: "Đánh giá phạm vi ảnh hưởng, thống nhất mục tiêu ưu tiên với các bên liên quan và trao quyền cho đội ngũ thực thi.",
          isCorrect: true,
          explanation: "Cách tiếp cận chuẩn mực: làm rõ bức tranh tổng thể, bảo vệ SLA và dẫn dắt tập thể hướng tới giải pháp bền vững.",
        },
        {
          id: "C",
          text: "Đổ lỗi cho quy trình trước đây hoặc nhân sự cấp dưới để chứng minh bản thân không có lỗi.",
          isCorrect: false,
          explanation: "Thiếu tinh thần trách nhiệm và tinh thần làm chủ (Extreme Ownership).",
        },
        {
          id: "D",
          text: "Trì hoãn ra quyết định và chờ đợi chỉ đạo tuyệt đối từ cấp trên.",
          isCorrect: false,
          explanation: "Thiếu tính chủ động và tự chủ trong vai trò phụ trách.",
        },
      ],
    },
    practiceQuestion: {
      prompt: `Dựa trên bài học '${found.title}': Hãy chia sẻ một tình huống thực tế bạn từng đối mặt liên quan đến chủ đề này và cách bạn đã vượt qua theo khung STAR?`,
      intent: "Đánh giá tư duy giải quyết vấn đề, khả năng làm chủ tình huống và phong thái giao tiếp tự tin.",
      starSituation: "Mô tả bối cảnh dự án, quy mô hệ thống, thách thức then chốt gặp phải.",
      starTask: "Mục tiêu cụ thể cần đạt được và trách nhiệm của bạn trong tình huống đó.",
      starAction: "Các hành động logic, kỹ thuật áp dụng, cách điều phối và tháo gỡ khó khăn.",
      starResult: "Kết quả đo lường định lượng, bài học kinh nghiệm và giá trị dài hạn mang lại.",
      sampleAnswer: `Trong dự án gần đây nhất, tôi đối mặt với bài toán tối ưu hóa quy trình phân phối sản phẩm khi hệ thống tăng trưởng 300% lượng người dùng. Tôi đã chủ động phân tích các nút thắt cổ chai, tái cấu trúc luồng làm việc thành các giai đoạn tự động hóa CI/CD và thiết lập các chỉ số SLO rõ ràng. Kết quả là thời gian release giảm từ 4 ngày xuống còn 2 giờ, tỷ lệ lỗi phát sinh giảm 65% và năng suất toàn đội ngũ được cải thiện vượt bậc.`,
    },
  };

  return {
    course,
    currentLesson: enrichedLesson,
    allSections: sections,
    flattenedLessons: flattened,
    currentIndex,
    totalLessons: flattened.length,
    prevLesson,
    nextLesson,
  };
}
