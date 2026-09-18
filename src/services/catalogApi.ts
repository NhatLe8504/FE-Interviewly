import { request } from "./apiClient";
import type {
  DomainOut,
  RoleOut,
  StarTemplateOut,
  QuestionOut,
  QuestionDetailOut,
  QuestionPageOut,
  QuestionFilterParams,
  RubricCriterion,
} from "@/types/catalog";

export const DEFAULT_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    criterion_id: "star_structure",
    title: "Cấu trúc trả lời & Phương pháp STAR",
    description: "Đánh giá mức độ hoàn thiện của 4 thành tố: Tình huống (S), Nhiệm vụ (T), Hành động cụ thể (A) và Kết quả đo lường (R).",
    weight: 30,
    descriptors: {
      poor: {
        score_range: "1 - 3",
        label: "Chưa đạt",
        description: "Trả lời lan man, thiếu bối cảnh hoặc không chỉ rõ vai trò của bản thân trong câu chuyện.",
      },
      average: {
        score_range: "4 - 6",
        label: "Đạt chuẩn cơ bản",
        description: "Có đề cập đến bối cảnh và hành động nhưng phần kết quả còn mờ nhạt, thiếu số liệu đo lường.",
      },
      good: {
        score_range: "7 - 8",
        label: "Tốt",
        description: "Cấu trúc STAR rõ ràng, mạch lạc, có số liệu và bài học kinh nghiệm cụ thể.",
      },
      excellent: {
        score_range: "9 - 10",
        label: "Xuất sắc",
        description: "Cấu trúc hoàn hảo, làm nổi bật vai trò cá nhân, giải pháp có tính sáng tạo và kết quả tác động lớn.",
      },
    },
  },
  {
    criterion_id: "technical_depth",
    title: "Chiều sâu chuyên môn & Tư duy xử lý vấn đề",
    description: "Khả năng phân tích nguyên nhân gốc rễ, áp dụng công cụ công nghệ phù hợp và đưa ra quyết định kỹ thuật đúng đắn.",
    weight: 30,
    descriptors: {
      poor: {
        score_range: "1 - 3",
        label: "Chưa đạt",
        description: "Hiểu sai bản chất vấn đề hoặc đề xuất giải pháp thiếu tính khả thi, không an toàn.",
      },
      average: {
        score_range: "4 - 6",
        label: "Đạt chuẩn cơ bản",
        description: "Nêu được giải pháp quen thuộc nhưng chưa đánh giá được đánh đổi (trade-offs) và rủi ro phát sinh.",
      },
      good: {
        score_range: "7 - 8",
        label: "Tốt",
        description: "Phân tích kỹ lưỡng, nắm chắc nguyên lý hoạt động, cân nhắc trade-offs giữa chi phí và thời gian.",
      },
      excellent: {
        score_range: "9 - 10",
        label: "Xuất sắc",
        description: "Tư duy kiến trúc hệ thống vượt trội, dự phòng rủi ro và tối ưu hóa mở rộng (scalability) cao.",
      },
    },
  },
  {
    criterion_id: "communication_clarity",
    title: "Giao tiếp, Ngữ điệu & Độ mạch lạc",
    description: "Khả năng truyền đạt ngắn gọn, tự tin, diễn giải vấn đề phức tạp một cách dễ hiểu cho người nghe.",
    weight: 20,
    descriptors: {
      poor: {
        score_range: "1 - 3",
        label: "Chưa đạt",
        description: "Nói ngắc ngứ, nhiều từ đệm (filler words), diễn đạt khó hiểu hoặc quá dài dòng.",
      },
      average: {
        score_range: "4 - 6",
        label: "Đạt chuẩn cơ bản",
        description: "Trình bày nghe hiểu được nhưng tốc độ nói chưa đều, đôi khi lạc đề.",
      },
      good: {
        score_range: "7 - 8",
        label: "Tốt",
        description: "Tự tin, tốc độ nói vừa phải (120-150 WPM), từ ngữ chuyên ngành chính xác và mạch lạc.",
      },
      excellent: {
        score_range: "9 - 10",
        label: "Xuất sắc",
        description: "Thuyết phục, lôi cuốn, tạo sự tin tưởng tuyệt đối cho nhà tuyển dụng.",
      },
    },
  },
  {
    criterion_id: "impact_learning",
    title: "Tác động định lượng & Tinh thần học hỏi",
    description: "Chứng minh giá trị mang lại cho doanh nghiệp và bài học sâu sắc rút ra sau tình huống thử thách.",
    weight: 20,
    descriptors: {
      poor: {
        score_range: "1 - 3",
        label: "Chưa đạt",
        description: "Không có kết quả đo lường, không nhận diện được điểm bản thân cần cải thiện.",
      },
      average: {
        score_range: "4 - 6",
        label: "Đạt chuẩn cơ bản",
        description: "Có kết quả chung chung (dự án kịp tiến độ), bài học còn cơ bản.",
      },
      good: {
        score_range: "7 - 8",
        label: "Tốt",
        description: "Nêu bật số liệu thực tế (% tăng trưởng, thời gian giảm tải) kèm bài học hữu ích.",
      },
      excellent: {
        score_range: "9 - 10",
        label: "Xuất sắc",
        description: "Tác động kinh doanh rõ rệt, đúc kết thành quy trình hoặc chuẩn hóa cho toàn tổ chức.",
      },
    },
  },
];

export const FALLBACK_DOMAINS: DomainOut[] = [
  {
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    description: "Phát triển phần mềm, hạ tầng đám mây, kiến trúc dữ liệu và an toàn thông tin.",
  },
  {
    domain_id: 2,
    domain_name: "Marketing & Truyền thông",
    description: "Digital Marketing, tiếp thị nội dung, SEO/SEM, quảng cáo và phát triển thương hiệu.",
  },
  {
    domain_id: 3,
    domain_name: "Kinh doanh & Bán hàng (Sales)",
    description: "Bán hàng B2B, quản trị khách hàng doanh nghiệp và tư vấn giải pháp chuyển đổi số.",
  },
  {
    domain_id: 4,
    domain_name: "Quản trị Nhân sự (HR)",
    description: "Tuyển dụng nhân tài, gắn kết văn hóa doanh nghiệp và chế độ lương thưởng đãi ngộ.",
  },
  {
    domain_id: 5,
    domain_name: "Tài chính & Kế toán",
    description: "Phân tích tài chính, quản lý dòng tiền, kế toán quản trị và kiểm toán nội bộ.",
  },
  {
    domain_id: 6,
    domain_name: "Sản phẩm & Thiết kế (Product & Design)",
    description: "Quản lý sản phẩm công nghệ (Product Management), thiết kế trải nghiệm người dùng UI/UX.",
  },
];

export const FALLBACK_ROLES: RoleOut[] = [
  { role_id: 1, domain_id: 1, role_name: "Backend Engineer", description: "Thiết kế RESTful/gRPC API, kiến trúc microservices và cơ sở dữ liệu." },
  { role_id: 2, domain_id: 1, role_name: "Frontend Engineer", description: "Xây dựng web app hiện đại với React, Next.js, tối ưu hóa Web Vitals." },
  { role_id: 3, domain_id: 1, role_name: "Fullstack Developer", description: "Lập trình từ giao diện người dùng đến nghiệp vụ backend và triển khai." },
  { role_id: 4, domain_id: 1, role_name: "DevOps / SRE Engineer", description: "Thiết lập CI/CD pipeline, hạ tầng Kubernetes, Docker và giám sát 24/7." },
  { role_id: 5, domain_id: 1, role_name: "Data / AI Engineer", description: "Xử lý luồng dữ liệu lớn, tích hợp mô hình Machine Learning và LLM." },
  { role_id: 6, domain_id: 2, role_name: "Digital Marketing Specialist", description: "Tối ưu hóa chiến dịch chuyển đổi Facebook Ads, Google Ads và TikTok Ads." },
  { role_id: 7, domain_id: 2, role_name: "Content & SEO Creator", description: "Sản xuất nội dung thu hút, tối ưu từ khóa và gia tăng organic traffic." },
  { role_id: 8, domain_id: 3, role_name: "B2B Account Executive", description: "Khai thác khách hàng doanh nghiệp, tư vấn giải pháp và đàm phán hợp đồng." },
  { role_id: 9, domain_id: 4, role_name: "Talent Acquisition (Recruiter)", description: "Tìm kiếm, đánh giá và tuyển dụng nhân sự kỹ thuật chất lượng cao." },
  { role_id: 10, domain_id: 5, role_name: "Financial Analyst", description: "Mô hình hóa tài chính, dự báo dòng tiền và phân tích hiệu quả vốn." },
  { role_id: 11, domain_id: 6, role_name: "Product Manager", description: "Định hình tầm nhìn sản phẩm, quản lý roadmap và làm việc cùng Tech Lead." },
  { role_id: 12, domain_id: 6, role_name: "UI/UX Designer", description: "Nghiên cứu hành vi người dùng, xây dựng Design System và wireframe Figma." },
];

export const FALLBACK_STAR_TEMPLATES: Record<number, StarTemplateOut> = {
  1: {
    star_template_id: 1,
    title: "Khung STAR Xử lý Sự cố Kỹ thuật (Incident Management)",
    situation_guide: "Hệ thống gặp sự cố gì? Tỉ lệ lỗi hoặc số lượng người dùng bị gián đoạn là bao nhiêu? Bạn phát hiện ra sự cố vào thời điểm nào?",
    task_guide: "Mục tiêu ưu tiên của bạn là gì? (Phục hồi hệ thống trước, hay truy tìm nguyên nhân gốc rễ? Mục tiêu SLA/RTO là bao nhiêu phút?)",
    action_guide: "Từng bước bạn xử lý: Kiểm tra log, hạ tải, rollback bản build, bật circuit breaker, vá lỗi nóng. Bạn đã phối hợp với ai?",
    result_guide: "Thời gian phục hồi dịch vụ là bao lâu? Thiệt hại được ngăn chặn ra sao? Biện pháp phòng ngừa dài hạn bạn đã đưa vào quy trình là gì?",
    language: "vi",
  },
  2: {
    star_template_id: 2,
    title: "Khung STAR Phỏng vấn Hành vi & Giải quyết Bất đồng (Conflict Resolution)",
    situation_guide: "Bối cảnh dự án, ai là người có ý kiến trái chiều với bạn? Bất đồng xoay quanh kiến trúc công nghệ, thời hạn deadline hay phạm vi tính năng?",
    task_guide: "Mục tiêu chung bạn cần đạt được cho cả đội ngũ mà không làm rạn nứt mối quan hệ hợp tác công việc.",
    action_guide: "Bạn đã lắng nghe quan điểm của đối phương ra sao? Bạn đã sử dụng dữ liệu, benchmark hay prototype thử nghiệm nào để thuyết phục khách quan?",
    result_guide: "Giải pháp cuối cùng được áp dụng có thành công không? Dự án hoàn thành ra sao và mối quan hệ đồng nghiệp sau đó như thế nào?",
    language: "vi",
  },
  3: {
    star_template_id: 3,
    title: "Khung STAR Tối ưu hóa Hiệu năng & Quy mô (Performance & Scalability)",
    situation_guide: "Thắt nút cổ chai xuất hiện ở đâu trong hệ thống? Chỉ số đo lường ban đầu (Latency p99, CPU 100%, slow queries) là bao nhiêu?",
    task_guide: "Chỉ tiêu kỹ thuật cần đạt (giảm latency từ 1200ms xuống dưới 150ms, chịu tải được 10,000 req/s).",
    action_guide: "Quy trình profiling của bạn: Công cụ sử dụng (APM, Grafana, EXPLAIN ANALYZE), kỹ thuật tối ưu (indexing, redis cache, connection pooling).",
    result_guide: "Chỉ số sau khi tối ưu được cải thiện bao nhiêu %? Chi phí hạ tầng cloud tiết kiệm được bao nhiêu mỗi tháng?",
    language: "vi",
  },
  4: {
    star_template_id: 4,
    title: "Standard STAR Framework for Senior Leadership",
    situation_guide: "Describe the high-stakes organizational challenge or mission-critical initiative you were leading.",
    task_guide: "What strategic objectives were you held accountable for across engineering, product, and business goals?",
    action_guide: "How did you rally cross-functional teams, make tough prioritization trade-offs, and mentor engineers?",
    result_guide: "Share the quantified business outcome, long-term team capability improvement, and lessons learned.",
    language: "en",
  },
};

export const FALLBACK_QUESTIONS: QuestionDetailOut[] = [
  {
    question_id: 1,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "junior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Hãy kể về một lần bạn phát hiện một lỗi nghiêm trọng (critical bug) trên môi trường Production và các bước bạn đã giải quyết nó?",
    star_template_id: 1,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[1],
    sample_answer: "Trong một đợt phát hành tính năng thanh toán vào tối thứ Sáu, hệ thống ghi nhận tỉ lệ giao dịch thất bại tăng đột biến lên 28% do lỗi connection pool bị cạn kiệt. Sau khi nhận cảnh báo từ Prometheus, tôi đã lập tức thông báo trên kênh incident của đội ngũ, chuyển hướng bớt traffic sang replica và nhanh chóng trace log bằng Sentry. Tôi phát hiện một truy vấn ORM không giải phóng connection khi xảy ra timeout. Tôi đã viết hotfix điều chỉnh connection timeout và bổ sung khối try-finally giải phóng tài nguyên. Trong vòng 25 phút, tỉ lệ lỗi trở về 0%. Sau sự cố, tôi tổ chức buổi post-mortem và bổ sung bài test stress-test 500 connection concurrent vào CI/CD pipeline.",
    follow_up_questions: [
      "Tại sao bài kiểm thử ở môi trường Staging trước đó không bắt được lỗi cạn kiệt connection này?",
      "Nếu lỗi xảy ra ngay lúc Black Friday với lượng traffic gấp 10 lần, bạn sẽ áp dụng chiến lược degrade tính năng nào?",
    ],
    tips: [
      "Nhấn mạnh tinh thần bình tĩnh, tuân thủ quy trình xử lý sự cố thay vì vội vàng đẩy code chưa kiểm tra.",
      "Luôn đưa ra con số định lượng (thời gian phát hiện, thời gian khắc phục, tỉ lệ lỗi giảm).",
    ],
  },
  {
    question_id: 2,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "mid",
    language: "vi",
    question_type: "technical",
    question_text: "Bạn tiếp cận và tối ưu hóa một câu lệnh truy vấn cơ sở dữ liệu bị chậm (slow query) đang làm nghẽn API như thế nào?",
    star_template_id: 3,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[3],
    sample_answer: "Khi API lịch sử giao dịch tăng thời gian phản hồi lên 3.2 giây vào giờ cao điểm, tôi sử dụng lệnh EXPLAIN ANALYZE của PostgreSQL để kiểm tra kế hoạch thực thi. Tôi nhận thấy database đang thực hiện Sequential Scan trên bảng có hơn 12 triệu bản ghi vì thiếu composite index cho cặp cột (user_id, created_at). Tôi đã tạo một B-Tree composite index với cờ CONCURRENTLY để không lock bảng, đồng thời điều chỉnh lại truy vấn dùng keyset pagination thay thế cho OFFSET lớn. Kết quả là thời gian thực thi câu lệnh giảm từ 3200ms xuống còn 42ms, CPU database server giảm từ 85% xuống 25%.",
    follow_up_questions: [
      "Khi nào việc đánh thêm index lại gây hại nhiều hơn có lợi cho cơ sở dữ liệu?",
      "Làm thế nào để bạn lưu cache (Redis caching) cho truy vấn này mà không gặp phải vấn đề Cache Invalidation hoặc Cache Stampede?",
    ],
    tips: [
      "Bắt đầu bằng phương pháp đo lường (profiling) trước khi đi thẳng vào giải pháp.",
      "Giải thích rõ ràng cơ chế index hoạt động dưới tầng đĩa và bộ nhớ.",
    ],
  },
  {
    question_id: 3,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 2,
    role_name: "Frontend Engineer",
    experience_level: "junior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Kể về một tình huống bạn có quan điểm bất đồng với đồng nghiệp hoặc Product Manager về thiết kế giao diện hay giải pháp kỹ thuật, và cách bạn giải quyết?",
    star_template_id: 2,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[2],
    sample_answer: "Khi Product Manager yêu cầu thêm một bảng dữ liệu động với hơn 30 cột và tính năng kéo thả phức tạp vào một màn hình di động nhằm đẩy nhanh tiến độ bàn giao, tôi nhận thấy giao diện này sẽ gây trải nghiệm cực kỳ ức chế cho người dùng màn hình nhỏ. Thay vì từ chối thẳng thừng, tôi đã chủ động hẹn PM và Designer một buổi thảo luận 20 phút. Tôi chuẩn bị sẵn số liệu Google Analytics cho thấy 72% người dùng truy cập bằng smartphone, cùng với 1 bản prototype dạng thẻ thu gọn thông tin quan trọng kèm nút xem chi tiết. Cả đội ngũ đã đồng thuận với phương án của tôi, giúp tính năng phát hành đúng hạn với chỉ số hài lòng đạt 4.8/5 sao từ khảo sát người dùng.",
    follow_up_questions: [
      "Nếu PM vẫn kiên quyết yêu cầu làm theo cách cũ dù số liệu chỉ ra bất lợi, bạn sẽ phản hồi ra sao?",
      "Bạn cân bằng giữa tốc độ ship tính năng của công ty khởi nghiệp và chất lượng code bền vững như thế nào?",
    ],
    tips: [
      "Thể hiện tư duy đặt lợi ích của người dùng và sản phẩm lên trên cái tôi cá nhân.",
      "Sử dụng dữ liệu thực tế và nguyên mẫu trực quan làm công cụ thuyết phục.",
    ],
  },
  {
    question_id: 4,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 2,
    role_name: "Frontend Engineer",
    experience_level: "mid",
    language: "vi",
    question_type: "technical",
    question_text: "Làm thế nào để bạn cải thiện điểm số Core Web Vitals (LCP, CLS, INP) cho một ứng dụng Single Page Application hoặc Next.js có kích thước lớn?",
    star_template_id: 3,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[3],
    sample_answer: "Tại trang chủ của hệ thống thương mại điện tử, điểm LCP ban đầu là 4.6s và CLS là 0.28 do tải quá nhiều hình ảnh chưa nén và font chữ gây layout shift. Tôi tiến hành phân tích bằng Chrome Lighthouse và bundle-analyzer. Đầu tiên, tôi chuyển đổi các component nặng phía dưới màn hình đầu tiên sang dynamic import với React.lazy. Thứ hai, tôi cấu hình next/image tự động chuyển đổi sang WebP/AVIF và bổ sung thuộc tính fetchpriority='high' cho banner chính. Thứ ba, áp dụng font-display: optional để dứt điểm layout shift. Điểm LCP giảm xuống còn 1.8s, CLS về 0.02 và điểm hiệu năng tổng thể tăng từ 51 lên 94 điểm.",
    follow_up_questions: [
      "Chỉ số INP (Interaction to Next Paint) đo lường điều gì và cách tối ưu các tác vụ JavaScript dài?",
      "Bạn phân chia chiến lược render Server-Side (SSR), Static (SSG) hay Client-Side (CSR) như thế nào cho từng trang?",
    ],
    tips: [
      "Nắm vững định nghĩa các chỉ số Core Web Vitals của Google.",
      "Kể tên các công cụ đo lường thực tế bạn đã áp dụng.",
    ],
  },
  {
    question_id: 5,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 4,
    role_name: "DevOps / SRE Engineer",
    experience_level: "senior",
    language: "vi",
    question_type: "situational",
    question_text: "Nếu một đường ống CI/CD bị nghẽn đúng vào thời điểm toàn công ty cần triển khai bản sửa lỗi khẩn cấp, bạn sẽ xử lý tình huống này theo thứ tự ưu tiên nào?",
    star_template_id: 1,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[1],
    sample_answer: "Khi đường ống CI/CD GitLab runner bị treo do hết disk space trên cụm build nodes trong giờ cao điểm release, tôi chia việc xử lý làm 2 giai đoạn: Khẩn cấp và Triệt để. Ở giai đoạn khẩn cấp, tôi kích hoạt một runner dự phòng trên AWS EC2 với docker cache có sẵn để các đội nhóm có thể chạy pipeline hotfix trong vòng 10 phút. Song song đó, tôi dọn dẹp các dangling docker images và volume cũ trên cụm runner chính. Về lâu dài, tôi viết daemon script tự động prune định kỳ khi ổ cứng vượt ngưỡng 80%, đồng thời thiết lập cảnh báo Prometheus khi disk space runner đạt 75%.",
    follow_up_questions: [
      "Làm sao để đảm bảo an toàn bí mật (secrets/API keys) khi chạy pipeline trên các runner linh hoạt?",
      "Bạn triển khai chiến lược Canary deployment hay Blue/Green deployment để giảm thiểu rủi ro khi release?",
    ],
    tips: [
      "Phân biệt rõ ràng giữa giải pháp dập lửa tức thì và giải pháp ngăn ngừa tái phát.",
    ],
  },
  {
    question_id: 6,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "senior",
    language: "en",
    question_type: "behavioral",
    question_text: "Describe a high-pressure engineering deadline you managed. How did you prioritize technical debt versus shipping features on time?",
    star_template_id: 4,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[4],
    sample_answer: "Two weeks before our Q4 enterprise launch, our team realized that supporting real-time data sync would require either refactoring our legacy websocket layer (2 weeks of work) or adopting an off-the-shelf message broker with technical debt. I convened an engineering sync to assess risks. I proposed a phased strategy: build an adapter layer decoupling our domain logic from the temporary broker for the deadline, while scheduling the full architectural refactor for sprint 1 of the new quarter. We delivered the launch on time with zero downtime for 50,000 active users, and successfully paid down the tech debt 3 weeks later without customer disruption.",
    follow_up_questions: [
      "How do you communicate technical debt trade-offs to non-technical stakeholders?",
      "What metrics do you use to measure whether technical debt is slowing down developer velocity?",
    ],
    tips: [
      "Use clear professional English, structuring your answer around strategic accountability and risk management.",
    ],
  },
  {
    question_id: 7,
    domain_id: 2,
    domain_name: "Marketing & Truyền thông",
    role_id: 6,
    role_name: "Digital Marketing Specialist",
    experience_level: "junior",
    language: "vi",
    question_type: "situational",
    question_text: "Khi chi phí trên mỗi lượt chuyển đổi (CPA) của một chiến dịch quảng cáo đột ngột tăng vọt 50% trong 48 giờ, bạn sẽ rà soát các yếu tố nào đầu tiên?",
    star_template_id: 1,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[1],
    sample_answer: "Khi nhận thấy CPA chiến dịch Google Ads tăng từ 120.000đ lên 185.000đ trong hai ngày, tôi lập tức thực hiện quy trình rà soát 4 bước: 1. Kiểm tra website và landing page xem có bị lỗi tracking Pixel/GTM hoặc tốc độ tải trang chậm không. 2. Xem xét tần suất hiển thị (Frequency) và độ bão hòa mẫu quảng cáo (Ad fatigue). 3. Kiểm tra báo cáo Search Terms để xem có click tặc hoặc từ khóa rác kích hoạt quảng cáo không. 4. Đánh giá sự cạnh tranh từ thị trường. Tôi phát hiện đối thủ vừa tung chương trình giảm giá sốc cùng từ khóa; tôi đã điều chỉnh lại thông điệp USP nổi bật và loại bỏ các từ khóa tiêu cực, đưa CPA trở lại mức 115.000đ sau 3 ngày.",
    follow_up_questions: [
      "Làm sao để bạn phân bổ ngân sách tối ưu giữa các kênh Top of Funnel và Bottom of Funnel?",
      "Bạn thiết lập A/B testing cho mẫu quảng cáo như thế nào để đạt ý nghĩa thống kê?",
    ],
    tips: [
      "Thể hiện tư duy dựa trên dữ liệu và khả năng chẩn đoán phễu chuyển đổi toàn diện.",
    ],
  },
  {
    question_id: 8,
    domain_id: 3,
    domain_name: "Kinh doanh & Bán hàng (Sales)",
    role_id: 8,
    role_name: "B2B Account Executive",
    experience_level: "mid",
    language: "vi",
    question_type: "behavioral",
    question_text: "Hãy chia sẻ về một thương vụ B2B phức tạp với nhiều người ra quyết định mà bạn đã đàm phán thành công sau nhiều lần bị trì hoãn?",
    star_template_id: 2,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[2],
    sample_answer: "Tôi phụ trách thương vụ bán phần mềm quản lý kho trị giá 1.2 tỷ VNĐ cho một tập đoàn bán lẻ. Dự án bị hoãn 4 tháng vì Giám đốc Vận hành ủng hộ nhưng Giám đốc Tài chính (CFO) ngần ngại về thời gian thu hồi vốn (ROI). Tôi đã chủ động đề xuất làm việc riêng với bộ phận kế toán của họ trong 1 tuần để thu thập số liệu thất thoát hàng hóa thực tế. Tôi xây dựng một bảng mô hình hoàn vốn chi tiết chứng minh hệ thống sẽ giúp tiết kiệm 280 triệu/tháng và hoàn vốn sau 5 tháng. Tại buổi bảo vệ với Hội đồng quản trị, bảng phân tích định lượng này đã thuyết phục hoàn toàn CFO và hợp đồng được ký kết sau đó 10 ngày.",
    follow_up_questions: [
      "Nếu khách hàng yêu cầu giảm giá 30% vào phút chót trước khi ký hợp đồng, bạn sẽ ứng xử thế nào?",
      "Cách bạn xác định Champion trong tổ chức của khách hàng là gì?",
    ],
    tips: [
      "Nhấn mạnh vào kỹ năng thấu cảm với nỗi lo của các bên liên quan và khả năng bảo vệ giá trị sản phẩm.",
    ],
  },
  {
    question_id: 9,
    domain_id: 6,
    domain_name: "Sản phẩm & Thiết kế (Product & Design)",
    role_id: 11,
    role_name: "Product Manager",
    experience_level: "senior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Bạn đã từng phải đưa ra quyết định khai tử (deprecate) một tính năng được phát triển kỳ công nhưng không mang lại hiệu quả như kỳ vọng chưa? Bạn quản lý phản ứng của người dùng và đội ngũ như thế nào?",
    star_template_id: 4,
    is_active: true,
    star_template: FALLBACK_STAR_TEMPLATES[4],
    sample_answer: "Sau 6 tháng phát hành tính năng mạng xã hội nội bộ trong ứng dụng học tập, dữ liệu cho thấy chỉ có 4% người dùng hoạt động hàng tháng nhưng tính năng lại chiếm tới 25% chi phí bảo trì hệ thống và phàn nàn của người dùng. Tôi quyết định đề xuất khai tử tính năng này để dồn tài nguyên vào tính năng luyện thi thích ứng (Adaptive Test). Tôi tổ chức buổi họp giải thích chân thành với đội ngũ kỹ sư về lý do chiến lược kèm các số liệu thực tế để ghi nhận công sức của họ. Đồng thời, gửi thông báo trước 30 ngày cho nhóm 4% người dùng kèm hướng dẫn sao lưu dữ liệu và tặng gói học bổng tri ân. Quyết định dứt khoát này giúp tốc độ ra mắt tính năng mới tăng 40% trong quý tiếp theo.",
    follow_up_questions: [
      "Khung tiêu chí bạn sử dụng để ưu tiên tính năng trên Product Roadmap là gì (RICE, Kano, hay MoSCoW)?",
      "Làm sao để biết một tính năng thất bại là do ý tưởng sai hay do cách thực thi chưa tới?",
    ],
    tips: [
      "Thể hiện bản lĩnh lãnh đạo, sự dũng cảm chịu trách nhiệm và khả năng ra quyết định dựa trên dữ liệu sản phẩm.",
    ],
  },
];

export const catalogApi = {
  async getQuestionsForSelection(
    params: QuestionFilterParams = {}
  ): Promise<QuestionPageOut> {
    const searchParams = new URLSearchParams();
    if (params.domain_id) searchParams.set("domain_id", String(params.domain_id));
    if (params.role_id) searchParams.set("role_id", String(params.role_id));
    if (params.level && params.level !== "all") searchParams.set("level", params.level);
    if (params.type && params.type !== "all") searchParams.set("type", params.type);
    if (params.language && params.language !== "all") searchParams.set("language", params.language);
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.offset) searchParams.set("offset", String(params.offset));

    const query = searchParams.toString();
    const result = await request<QuestionPageOut>(
      `/api/v1/catalog/questions${query ? `?${query}` : ""}`
    );
    const search = params.search?.trim().toLowerCase();
    const items = search
      ? result.items.filter((question) =>
          question.question_text.toLowerCase().includes(search)
        )
      : result.items;

    return {
      ...result,
      items,
      total: search ? items.length : result.total,
    };
  },

  async getDomains(): Promise<DomainOut[]> {
    try {
      const data = await request<DomainOut[]>("/api/v1/catalog/domains");
      if (Array.isArray(data) && data.length > 0) {
        const clean = data.filter((d) => !/^Software Dev [a-f0-9]+$/i.test(d.domain_name));
        if (clean.length > 0) return clean;
      }
      return FALLBACK_DOMAINS;
    } catch {
      return FALLBACK_DOMAINS;
    }
  },

  async getRoles(domainId?: number | null): Promise<RoleOut[]> {
    try {
      const query = domainId ? `?domain_id=${domainId}` : "";
      const data = await request<RoleOut[]>(`/api/v1/catalog/roles${query}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return domainId
        ? FALLBACK_ROLES.filter((r) => r.domain_id === domainId)
        : FALLBACK_ROLES;
    } catch {
      return domainId
        ? FALLBACK_ROLES.filter((r) => r.domain_id === domainId)
        : FALLBACK_ROLES;
    }
  },

  async getQuestions(params: QuestionFilterParams = {}): Promise<QuestionPageOut> {
    try {
      const searchParams = new URLSearchParams();
      if (params.domain_id) searchParams.set("domain_id", String(params.domain_id));
      if (params.role_id) searchParams.set("role_id", String(params.role_id));
      if (params.level && params.level !== "all") searchParams.set("level", params.level);
      if (params.type && params.type !== "all") searchParams.set("type", params.type);
      if (params.language && params.language !== "all") searchParams.set("language", params.language);
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.offset) searchParams.set("offset", String(params.offset));

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await request<QuestionPageOut>(`/api/v1/catalog/questions${queryStr}`);
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        let filtered = res.items;
        if (params.search && params.search.trim()) {
          const kw = params.search.trim().toLowerCase();
          filtered = filtered.filter((q) =>
            q.question_text.toLowerCase().includes(kw)
          );
        }
        return {
          items: filtered,
          total: filtered.length,
          limit: res.limit || 50,
          offset: res.offset || 0,
        };
      }
      return this.filterFallbackQuestions(params);
    } catch {
      return this.filterFallbackQuestions(params);
    }
  },

  async getQuestionDetail(questionId: number | string): Promise<QuestionDetailOut> {
    try {
      const res = await request<QuestionDetailOut>(`/api/v1/catalog/questions/${questionId}`);
      if (res && res.question_id) {
        if (!res.rubric_criteria) {
          res.rubric_criteria = DEFAULT_RUBRIC_CRITERIA;
        }
        return res;
      }
      return this.getFallbackQuestionDetail(Number(questionId));
    } catch {
      return this.getFallbackQuestionDetail(Number(questionId));
    }
  },

  filterFallbackQuestions(params: QuestionFilterParams): QuestionPageOut {
    let list = [...FALLBACK_QUESTIONS];

    if (params.domain_id) {
      list = list.filter((q) => q.domain_id === Number(params.domain_id));
    }
    if (params.role_id) {
      list = list.filter((q) => q.role_id === Number(params.role_id));
    }
    if (params.level && params.level !== "all") {
      list = list.filter((q) => q.experience_level === params.level);
    }
    if (params.type && params.type !== "all") {
      list = list.filter((q) => q.question_type === params.type);
    }
    if (params.language && params.language !== "all") {
      list = list.filter((q) => q.language === params.language);
    }
    if (params.search && params.search.trim()) {
      const kw = params.search.trim().toLowerCase();
      list = list.filter(
        (q) =>
          q.question_text.toLowerCase().includes(kw) ||
          q.role_name?.toLowerCase().includes(kw) ||
          q.domain_name?.toLowerCase().includes(kw)
      );
    }

    return {
      items: list,
      total: list.length,
      limit: params.limit || 50,
      offset: params.offset || 0,
    };
  },

  getFallbackQuestionDetail(id: number): QuestionDetailOut {
    const found = FALLBACK_QUESTIONS.find((q) => q.question_id === id);
    if (found) {
      return {
        ...found,
        rubric_criteria: DEFAULT_RUBRIC_CRITERIA,
      };
    }
    const first = FALLBACK_QUESTIONS[0];
    return {
      ...first,
      question_id: id,
      rubric_criteria: DEFAULT_RUBRIC_CRITERIA,
    };
  },
};
