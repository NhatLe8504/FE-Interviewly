import type { QuestionDetailOut, QuestionModerationStatus, QuestionSource, RubricCriterion } from "@/types/catalog";

export interface AdminQuestionItem extends QuestionDetailOut {
  practice_count: number;
  avg_score: number;
  category?: string;
  tags?: string[];
}

export interface QuestionDailyPoint {
  date: string;
  practiceSessions: number;
  newQuestions: number;
}

export const MOCK_DOMAINS_LIST = [
  { domain_id: 1, domain_name: "Công nghệ thông tin (IT)" },
  { domain_id: 2, domain_name: "Tài chính & Ngân hàng (Finance)" },
  { domain_id: 3, domain_name: "Marketing & Truyền thông" },
  { domain_id: 4, domain_name: "Bán hàng & Kinh doanh (Sales)" },
  { domain_id: 5, domain_name: "Quản trị Sản phẩm (Product)" },
  { domain_id: 6, domain_name: "Quản trị Nhân sự (HR)" },
];

export const MOCK_ROLES_LIST = [
  { role_id: 1, domain_id: 1, role_name: "Backend Engineer" },
  { role_id: 2, domain_id: 1, role_name: "Frontend Developer" },
  { role_id: 3, domain_id: 1, role_name: "DevOps / Cloud Engineer" },
  { role_id: 4, domain_id: 1, role_name: "Data Scientist / AI Engineer" },
  { role_id: 5, domain_id: 1, role_name: "QA / Automation Tester" },
  { role_id: 6, domain_id: 2, role_name: "Chuyên viên Phân tích Tài chính" },
  { role_id: 7, domain_id: 2, role_name: "Kế toán viên tổng hợp" },
  { role_id: 8, domain_id: 2, role_name: "Chuyên viên Quản trị Rủi ro" },
  { role_id: 9, domain_id: 3, role_name: "Digital Marketing Specialist" },
  { role_id: 10, domain_id: 3, role_name: "Content & SEO Strategist" },
  { role_id: 11, domain_id: 3, role_name: "Brand Manager" },
  { role_id: 12, domain_id: 4, role_name: "B2B Sales Executive" },
  { role_id: 13, domain_id: 4, role_name: "Account Manager (Khách hàng DN)" },
  { role_id: 14, domain_id: 4, role_name: "Business Development Specialist" },
  { role_id: 15, domain_id: 5, role_name: "Product Manager (PM)" },
  { role_id: 16, domain_id: 5, role_name: "UI/UX Designer" },
  { role_id: 17, domain_id: 5, role_name: "Scrum Master / Agile Coach" },
  { role_id: 18, domain_id: 6, role_name: "Talent Acquisition Specialist" },
  { role_id: 19, domain_id: 6, role_name: "HR Generalist" },
];

export const MOCK_ADMIN_QUESTIONS: AdminQuestionItem[] = [
  {
    question_id: 101,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "junior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Hãy kể về một lần bạn phát hiện lỗi nghiêm trọng (critical bug) trên môi trường Production và các bước bạn đã xử lý?",
    star_template_id: 1,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 3,
    intent: "Đánh giá sự bình tĩnh, năng lực giải quyết sự cố dưới áp lực cao và quy trình post-mortem sau sự cố.",
    practice_count: 1420,
    avg_score: 84.5,
    tags: ["Production Incident", "Debugging", "Post-Mortem", "Sentry"],
    created_at: "2026-08-15T08:30:00Z",
    updated_at: "2026-09-12T14:20:00Z",
    star_template: {
      star_template_id: 1,
      title: "Xử lý sự cố Production theo chuẩn STAR",
      situation_guide: "Mô tả bối cảnh phát sinh lỗi (thời điểm, hệ thống, mức độ nghiêm trọng đối với người dùng).",
      task_guide: "Trách nhiệm của bạn trong đội ngũ trực incident và mục tiêu cần đạt được trong thời gian ngắn nhất.",
      action_guide: "Các thao tác kỹ thuật: cô lập lỗi, rollback/hotfix, giao tiếp nội bộ và cập nhật cho các bên liên quan.",
      result_guide: "Số liệu phục hồi (thời gian khôi phục dịch vụ, tỉ lệ ảnh hưởng) và giải pháp phòng ngừa dài hạn.",
      language: "vi",
    },
    sample_answer: "Vào đợt flash-sale 11/11, hệ thống thanh toán gặp tình trạng nghẽn connection pool khiến 25% yêu cầu bị timeout. Sau khi nhận cảnh báo từ Prometheus, tôi lập tức kích hoạt quy trình Incident, chuyển bớt traffic sang replica và xác định truy vấn ORM chậm chưa có index. Tôi triển khai hotfix bổ sung index và tăng pool size tạm thời. Hệ thống hồi phục sau 18 phút mà không mất mát dữ liệu giao dịch.",
    follow_up_questions: [
      "Tại sao bài kiểm thử tải ở Staging trước đó không bắt được hiện tượng nghẽn này?",
      "Chiến lược rollback của bạn được chuẩn bị như thế nào nếu bản hotfix gặp lỗi?"
    ],
    tips: [
      "Tránh đổ lỗi cho đồng nghiệp hoặc hệ sinh thái bên thứ ba.",
      "Nêu bật các số liệu định lượng: thời gian phát hiện, thời gian xử lý và biện pháp phòng ngừa triệt để."
    ]
  },
  {
    question_id: 102,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "senior",
    language: "vi",
    question_type: "technical",
    question_text: "Làm thế nào để thiết kế một hệ thống Distributed Rate Limiting phục vụ 100,000 request/giây với độ trễ dưới 5ms?",
    star_template_id: 2,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 5,
    intent: "Khảo sát kiến trúc phân tán, thuật toán Token Bucket / Sliding Window và kỹ năng tối ưu caching với Redis cluster.",
    practice_count: 2150,
    avg_score: 79.2,
    tags: ["Rate Limiting", "Redis", "Distributed Systems", "High Throughput"],
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-09-15T09:10:00Z",
    star_template: {
      star_template_id: 2,
      title: "Thiết kế kiến trúc Rate Limiter hiệu năng cao",
      situation_guide: "Phân tích yêu cầu bài toán: scale 100k RPS, latency < 5ms, độ chính xác giữa các node.",
      task_guide: "Chọn lựa thuật toán giới hạn (Token Bucket, Leaky Bucket, Sliding Window Log).",
      action_guide: "Thiết kế hạ tầng với Redis Cluster, Lua scripting để đảm bảo tính atomic và giải pháp fallback local memory.",
      result_guide: "Đánh giá chi phí tài nguyên, khả năng mở rộng khi traffic tăng gấp đôi.",
      language: "vi",
    },
    sample_answer: "Tôi sẽ chọn thuật toán Sliding Window Counter kết hợp Redis Cluster và chạy logic bằng Lua script để giảm thiểu network round-trip. Tại tầng API Gateway, bổ sung local memory cache (L1 cache) cho các rule tĩnh để giảm tải cho Redis. Nếu Redis gặp sự cố, hệ thống tự động degrade sang local in-memory token bucket nhằm bảo vệ service phía sau.",
    follow_up_questions: [
      "Làm sao tránh hiện tượng Thundering Herd khi một API key bị spam cực độ?",
      "Bạn sẽ xử lý vấn đề đồng hồ lệch (clock drift) giữa các server phân tán như thế nào?"
    ],
    tips: [
      "Vẽ sơ đồ luồng dữ liệu rõ ràng trong tâm trí trước khi diễn đạt.",
      "Giải thích trade-off giữa độ chính xác tuyệt đối và độ trễ phản hồi."
    ]
  },
  {
    question_id: 103,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 2,
    role_name: "Frontend Developer",
    experience_level: "mid",
    language: "vi",
    question_type: "technical",
    question_text: "Bạn làm thế nào để tối ưu hoá chỉ số Core Web Vitals (LCP, INP, CLS) cho một ứng dụng Next.js thương mại điện tử?",
    star_template_id: 3,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 3,
    intent: "Đo lường năng lực tối ưu web performance, lazy loading, font optimization và hydration.",
    practice_count: 1890,
    avg_score: 82.0,
    tags: ["Next.js", "Web Vitals", "LCP", "INP", "Performance"],
    created_at: "2026-08-22T14:15:00Z",
    updated_at: "2026-09-14T11:00:00Z",
    star_template: {
      star_template_id: 3,
      title: "Tối ưu hóa trải nghiệm tải trang Core Web Vitals",
      situation_guide: "Hiện trạng website trước khi tối ưu: điểm Lighthouse thấp, khách hàng thoát trang cao.",
      task_guide: "Mục tiêu đạt điểm số xanh trên Google PageSpeed Insights (>90 điểm).",
      action_guide: "Sử dụng next/image priority cho hero banner (LCP), tách nhỏ bundle, giảm blocking main-thread (INP), gán kích thước cố định khung hình (CLS).",
      result_guide: "LCP giảm từ 4.2s xuống 1.4s, điểm Lighthouse tăng từ 58 lên 94.",
      language: "vi",
    },
    sample_answer: "Tôi đã audit bằng Chrome DevTools Performance panel và Lighthouse. Để cải thiện LCP, tôi ưu tiên nạp pre-loaded critical image bằng priority attribute của next/image và sử dụng font self-hosted với font-display: swap. Với INP, tôi chuyển bớt các tác vụ tính toán nặng vào Web Worker và áp dụng React transitions. Kết quả là điểm trải nghiệm trang đạt 95/100, tỉ lệ bỏ giỏ hàng giảm 12%.",
    follow_up_questions: [
      "Chỉ số INP khác với FID (First Input Delay) trước đây như thế nào?",
      "Bạn áp dụng kỹ thuật gì để ngăn chặn layout shift khi render dynamic ads?"
    ],
    tips: [
      "Nêu cụ thể các công cụ profiling: DevTools, WebPageTest, Lighthouse.",
      "Liên kết việc tối ưu kỹ thuật với tác động trực tiếp tới tỷ lệ chuyển đổi doanh thu."
    ]
  },
  {
    question_id: 104,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 3,
    role_name: "DevOps / Cloud Engineer",
    experience_level: "senior",
    language: "vi",
    question_type: "situational",
    question_text: "Nếu cụm Kubernetes sản xuất xảy ra sự cố OOMKilled trên diện rộng vào giờ cao điểm, bạn sẽ điều tra và ứng cứu như thế nào?",
    star_template_id: 4,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đánh giá kỹ năng điều phối sự cố hạ tầng container, quản trị tài nguyên K8s và tuning memory limits.",
    practice_count: 870,
    avg_score: 76.8,
    tags: ["Kubernetes", "DevOps", "Troubleshooting", "OOMKilled"],
    created_at: "2026-08-25T09:40:00Z",
    updated_at: "2026-09-10T16:20:00Z",
    star_template: {
      star_template_id: 4,
      title: "Ứng cứu sự cố sập container Kubernetes",
      situation_guide: "Tình huống nhiều Pod liên tục bị restart với exit code 137 (OOMKilled).",
      task_guide: "Ổn định dịch vụ ngay lập tức, ngăn chặn hiệu ứng domino sang các node khác.",
      action_guide: "Tăng tạm thời memory limits qua HPA/VPA, điều tra memory leak bằng heap dump, rollback phiên bản nghi vấn.",
      result_guide: "Dịch vụ hoạt động ổn định trở lại sau 10 phút, không gây gián đoạn kéo dài.",
      language: "vi",
    },
    sample_answer: "Bước đầu tiên tôi scale out thêm số lượng Pods để san sẻ tải bộ nhớ và tạm thời nâng ngưỡng memory limit nếu node còn dư capacity. Sau đó, tôi kiểm tra kubectl describe pod và Grafana memory graph để xác định pod nào bắt đầu tăng đột ngột. Nếu là lỗi rò rỉ bộ nhớ từ phiên bản mới deploy, tôi kích hoạt rollback ngay lập tức qua ArgoCD.",
    follow_up_questions: [
      "Làm sao cấu hình LimitRange và ResourceQuota hợp lý để tránh một namespace làm kiệt quệ toàn bộ cluster?",
      "Bạn áp dụng công cụ nào để tự động cảnh báo pod sắp chạm ngưỡng limit?"
    ],
    tips: [
      "Trình bày theo thứ tự ưu tiên: Giảm thiểu thiệt hại trước -> Điều tra nguyên nhân -> Phòng ngừa lâu dài."
    ]
  },
  {
    question_id: 105,
    domain_id: 5,
    domain_name: "Quản trị Sản phẩm (Product)",
    role_id: 15,
    role_name: "Product Manager (PM)",
    experience_level: "senior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Hãy chia sẻ về một tính năng sản phẩm mà bạn từng quyết định khai tử (deprecate) dù có sự phản đối từ một nhóm người dùng trung thành?",
    star_template_id: 5,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đánh giá tư duy dựa trên dữ liệu (data-driven), kỹ năng ra quyết định chiến lược và giao tiếp xoa dịu khách hàng.",
    practice_count: 1650,
    avg_score: 86.4,
    tags: ["Product Strategy", "Deprecation", "Stakeholder Management", "Data-Driven"],
    created_at: "2026-08-28T11:00:00Z",
    updated_at: "2026-09-13T10:00:00Z",
    star_template: {
      star_template_id: 5,
      title: "Ra quyết định khai tử tính năng theo phương pháp STAR",
      situation_guide: "Tính năng cũ tiêu tốn 30% chi phí bảo trì của đội kỹ thuật nhưng chỉ 4% người dùng kích hoạt thường xuyên.",
      task_guide: "Cần dồn nguồn lực để phát triển sản phẩm lõi mới, chấp nhận rủi ro phản ứng tiêu cực.",
      action_guide: "Phân tích cohort người dùng, gửi thư thông báo lộ trình 6 tháng, tạo công cụ xuất dữ liệu và tặng gói ưu đãi cho tính năng thay thế.",
      result_guide: "Tỉ lệ churn dưới 1.5%, đội ngũ kỹ thuật tiết kiệm 120 giờ công/tháng cho các sáng kiến mới.",
      language: "vi",
    },
    sample_answer: "Tại công ty SaaS trước đây, chúng tôi có tính năng xuất báo cáo legacy bằng Flash. Dù 5% khách hàng VIP vẫn quen dùng, việc duy trì nó cản trở toàn bộ việc nâng cấp bảo mật hệ thống. Tôi đã trực tiếp gặp 10 khách hàng chủ chốt, giải thích lý do an toàn và đồng thiết kế tính năng mới xuất PDF tự động theo mẫu của họ. Nhờ lộ trình chuyển đổi 90 ngày rõ ràng, 98% khách hàng đã di chuyển thành công mà không có hợp đồng nào bị hủy.",
    follow_up_questions: [
      "Bạn đo lường các chỉ số sức khỏe sản phẩm nào để biết một tính năng đã đến lúc nên ngừng hỗ trợ?",
      "Nếu khách hàng lớn nhất đe dọa rời đi nếu bỏ tính năng, bạn xử lý ra sao?"
    ],
    tips: [
      "Thể hiện sự thấu cảm với người dùng kết hợp với cái đầu lạnh về mặt dữ liệu kinh doanh."
    ]
  },
  {
    question_id: 106,
    domain_id: 5,
    domain_name: "Quản trị Sản phẩm (Product)",
    role_id: 16,
    role_name: "UI/UX Designer",
    experience_level: "mid",
    language: "vi",
    question_type: "situational",
    question_text: "Khi kết quả thử nghiệm A/B cho thấy giao diện mới làm tăng 15% tỷ lệ bấm mua nhưng tỷ lệ khiếu nại trả hàng lại tăng 20%, bạn sẽ giải quyết mâu thuẫn này thế nào?",
    star_template_id: 6,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 3,
    intent: "Đánh giá tư duy thiết kế trung thực (Ethical Design), cân bằng giữa chỉ số kinh doanh ngắn hạn và trải nghiệm bền vững.",
    practice_count: 980,
    avg_score: 81.5,
    tags: ["A/B Testing", "Dark Patterns", "Conversion Rate", "UX Ethics"],
    created_at: "2026-08-30T13:20:00Z",
    updated_at: "2026-09-11T15:40:00Z",
    star_template: {
      star_template_id: 6,
      title: "Giải quyết bài toán mâu thuẫn chỉ số A/B Test",
      situation_guide: "Phát hiện thiết kế mới có dấu hiệu dark pattern hoặc gây hiểu lầm cho người mua.",
      task_guide: "Tìm nguyên nhân cốt lõi khiến tỷ lệ khiếu nại tăng và điều chỉnh thiết kế.",
      action_guide: "Phỏng vấn 5 người dùng vừa trả hàng, xem video replay session, làm rõ lại thông tin thông số kỹ thuật sản phẩm tại bước thanh toán.",
      result_guide: "Giữ được 11% tăng trưởng đơn hàng trong khi tỷ lệ trả hàng giảm về mức tiêu chuẩn.",
      language: "vi",
    },
    sample_answer: "Tôi sẽ không vội vàng coi thử nghiệm A/B là thành công. Việc khiếu nại tăng chứng tỏ kỳ vọng của khách hàng tại trang chi tiết bị sai lệch so với thực tế sản phẩm. Tôi sẽ xem lại bản ghi Hotjar và phỏng vấn bộ phận Chăm sóc khách hàng để tìm điểm gây hiểu lầm. Sau đó, tôi thiết kế lại phần mô tả chính sách bảo hành và kích thước sản phẩm nổi bật hơn.",
    follow_up_questions: [
      "Bạn làm sao bảo vệ quan điểm UX của mình trước áp lực doanh số từ bộ phận Sales?",
      "Chỉ số Net Promoter Score (NPS) có vai trò gì trong việc đánh giá sự thay đổi này?"
    ],
    tips: [
      "Nhấn mạnh quan điểm: Trải nghiệm khách hàng dài hạn quan trọng hơn việc gian lận số liệu ngắn hạn."
    ]
  },
  {
    question_id: 107,
    domain_id: 2,
    domain_name: "Tài chính & Ngân hàng (Finance)",
    role_id: 6,
    role_name: "Chuyên viên Phân tích Tài chính",
    experience_level: "senior",
    language: "vi",
    question_type: "technical",
    question_text: "Bạn xây dựng mô hình định giá DCF (Discounted Cash Flow) cho một doanh nghiệp công nghệ có dòng tiền tự do (FCF) âm như thế nào?",
    star_template_id: 7,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 5,
    intent: "Khảo sát kiến thức tài chính doanh nghiệp nâng cao, cách dự phóng tăng trưởng doanh thu và tính toán chi phí vốn WACC.",
    practice_count: 730,
    avg_score: 75.0,
    tags: ["Financial Modeling", "DCF", "Valuation", "WACC"],
    created_at: "2026-09-01T08:00:00Z",
    updated_at: "2026-09-12T17:00:00Z",
    star_template: {
      star_template_id: 7,
      title: "Định giá doanh nghiệp công nghệ giai đoạn tăng trưởng",
      situation_guide: "Doanh nghiệp tăng trưởng cao nhưng đang đốt tiền mở rộng thị trường, FCF âm.",
      task_guide: "Xây dựng mô hình dự phóng 10 năm chuyển biến từ âm sang điểm hòa vốn (inflection point).",
      action_guide: "Áp dụng phương pháp Multi-stage DCF, dự báo biên lợi nhuận hoạt động mục tiêu, ước tính Terminal Value bằng Gordon Growth kết hợp Exit Multiple.",
      result_guide: "Đưa ra khoảng định giá hợp lý kèm phân tích độ nhạy (Sensitivity Matrix).",
      language: "vi",
    },
    sample_answer: "Đối với startup tăng trưởng có FCF âm, mô hình DCF tiêu chuẩn 5 năm không phản ánh đúng giá trị. Tôi sử dụng mô hình dự phóng 10 năm với 3 kịch bản: Cơ sở, Lạc quan và Thận trọng. Trọng tâm là xác định năm hòa vốn dòng tiền dựa trên tỷ lệ đòn bẩy hoạt động (operating leverage). Tôi kết hợp WACC biến thiên theo thời gian và đối chiếu chéo với phương pháp EV/ARR của các công ty cùng ngành.",
    follow_up_questions: [
      "Cách bạn kiểm tra độ nhạy của giá trị doanh nghiệp đối với sự thay đổi của lãi suất chiết khấu?",
      "Tại sao nhiều quỹ đầu tư mạo hiểm lại ưu tiên chỉ số Rule of 40 hơn là DCF thuần túy?"
    ],
    tips: [
      "Luôn chuẩn bị phân tích độ nhạy (Sensitivity Analysis) thay vì một con số duy nhất."
    ]
  },
  {
    question_id: 108,
    domain_id: 3,
    domain_name: "Marketing & Truyền thông",
    role_id: 9,
    role_name: "Digital Marketing Specialist",
    experience_level: "junior",
    language: "vi",
    question_type: "situational",
    question_text: "Chiến dịch quảng cáo Facebook Ads của bạn đột ngột bị tăng gấp 3 lần chi phí trên mỗi đơn hàng (CPA) sau một đêm, bạn sẽ làm gì?",
    star_template_id: 8,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 2,
    intent: "Đánh giá tư duy troubleshoot chiến dịch paid ads, kiểm tra độ bão hòa tệp đối tượng (Ad Fatigue) và tracking pixel.",
    practice_count: 2410,
    avg_score: 87.1,
    tags: ["Facebook Ads", "CPA Optimization", "Troubleshooting", "Performance Marketing"],
    created_at: "2026-09-02T10:30:00Z",
    updated_at: "2026-09-14T08:45:00Z",
    star_template: {
      star_template_id: 8,
      title: "Khắc phục hiện tượng tăng đột biến chi phí quảng cáo",
      situation_guide: "Chiến dịch đang chạy hiệu quả bỗng dưng CPA tăng vọt.",
      task_guide: "Xác định nhanh nguyên nhân: lỗi trang đích, bão hòa tệp, cạnh tranh mùa cao điểm hay lỗi pixel.",
      action_guide: "Kiểm tra tỷ lệ click (CTR), tần suất hiển thị (Frequency), trạng thái link trang đích và sự kiện CAPI.",
      result_guide: "Đưa CPA về mức kỳ vọng ban đầu trong vòng 24 giờ.",
      language: "vi",
    },
    sample_answer: "Đầu tiên tôi sẽ không vội tắt chiến dịch. Tôi kiểm tra ngay trang đích xem có bị lỗi 500 hay tốc độ tải chậm không. Tiếp theo, tôi xem chỉ số Frequency (nếu > 3.0 nghĩa là tệp đã bão hòa) và chỉ số CPM (nếu tăng nghĩa là có sự cạnh tranh giá thầu tăng đột biến). Tôi cũng kiểm tra trạng thái Facebook Pixel Event. Sau khi xác định nguyên nhân, tôi sẽ đổi creative mới hoặc mở rộng lookalike audience.",
    follow_up_questions: [
      "Bạn áp dụng cơ chế phân bổ ngân sách Advantage Campaign Budget (CBO) như thế nào để tối ưu?",
      "Làm sao tính toán được điểm hòa vốn ROAS trước khi khởi chạy chiến dịch?"
    ],
    tips: [
      "Thực hiện theo các bước từ dễ kiểm tra nhất (Landing page, Pixel) tới phân tích chuyên sâu (Audience, Creative)."
    ]
  },
  {
    question_id: 109,
    domain_id: 4,
    domain_name: "Bán hàng & Kinh doanh (Sales)",
    role_id: 12,
    role_name: "B2B Sales Executive",
    experience_level: "senior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Hãy kể về thương vụ B2B phức tạp nhất mà bạn từng chốt thành công với khách hàng doanh nghiệp lớn sau hơn 6 tháng theo đuổi?",
    star_template_id: 9,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đo lường kỹ năng quản lý quan hệ nhiều cấp lãnh đạo (Multi-stakeholder), kỹ thuật chốt sale đường dài và đàm phán hợp đồng lớn.",
    practice_count: 1120,
    avg_score: 88.0,
    tags: ["B2B Sales", "Enterprise Deals", "Negotiation", "Pipeline Management"],
    created_at: "2026-09-03T15:00:00Z",
    updated_at: "2026-09-15T11:20:00Z",
    star_template: {
      star_template_id: 9,
      title: "Chinh phục hợp đồng B2B giá trị cao theo STAR",
      situation_guide: "Khách hàng là tập đoàn bán lẻ lớn, có 3 đối thủ cạnh tranh đang cùng báo giá.",
      task_guide: "Thuyết phục được cả Giám đốc Kỹ thuật (CTO) và Giám đốc Tài chính (CFO).",
      action_guide: "Xây dựng bài toán hoàn vốn ROI chi tiết cho CFO, tổ chức buổi PoC chạy thử cho CTO và tìm kiếm người ủng hộ nội bộ (Internal Champion).",
      result_guide: "Ký kết hợp đồng 2 năm trị giá 1.8 tỷ VNĐ, vượt 130% chỉ tiêu KPI quý.",
      language: "vi",
    },
    sample_answer: "Khách hàng là chuỗi siêu thị với 150 cửa hàng. Thách thức lớn nhất là bộ phận IT rất ngại thay đổi giải pháp ERP hiện tại. Tôi đã không bán tính năng phần mềm, mà tập trung xây dựng mối quan hệ với Trưởng phòng Vận hành - người đang chịu nhiều áp lực vì số liệu tồn kho sai lệch. Cùng với đội kỹ thuật, chúng tôi cung cấp bản PoC 2 tuần miễn phí tại 3 cửa hàng. Khi kết quả chứng minh giảm 40% thời gian kiểm kho, CFO đã trực tiếp ký duyệt ngân sách.",
    follow_up_questions: [
      "Nếu khách hàng yêu cầu giảm giá 30% vào phút chót, bạn đàm phán phương án nào để bảo vệ biên lợi nhuận?",
      "Làm thế nào để giữ chân khách hàng tiếp tục gia hạn sau năm đầu tiên?"
    ],
    tips: [
      "Khắc họa rõ chân dung các bên liên quan: Economic Buyer, Technical Buyer, User Buyer."
    ]
  },
  {
    question_id: 110,
    domain_id: 6,
    domain_name: "Quản trị Nhân sự (HR)",
    role_id: 18,
    role_name: "Talent Acquisition Specialist",
    experience_level: "mid",
    language: "vi",
    question_type: "behavioral",
    question_text: "Bạn làm thế nào để tuyển dụng thành công 15 kỹ sư phần mềm cao cấp (Senior Tech Leads) trong vòng 2 tháng với mức ngân sách lương hạn chế?",
    star_template_id: 10,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đánh giá chiến lược săn đầu người (Headhunting), xây dựng thương hiệu nhà tuyển dụng (Employer Branding) và bán cơ hội thăng tiến.",
    practice_count: 890,
    avg_score: 83.7,
    tags: ["Headhunting", "Talent Acquisition", "Employer Branding", "Tech Recruitment"],
    created_at: "2026-09-04T09:15:00Z",
    updated_at: "2026-09-16T14:10:00Z",
    star_template: {
      star_template_id: 10,
      title: "Chiến dịch tuyển dụng nhân sự cấp cao với ngân sách eo hẹp",
      situation_guide: "Công ty mở rộng dự án mới, cần gấp 15 Senior Leads nhưng dải lương thấp hơn 15% so với thị trường.",
      task_guide: "Hoàn thành 100% headcount đảm bảo chất lượng kỹ thuật.",
      action_guide: "Thiết kế gói đãi ngộ linh hoạt (Cổ phần ESOP, làm việc từ xa 100%, ngân sách học tập), khai thác mạng lưới Employee Referral và tiếp cận trực tiếp ứng viên tiềm năng trên GitHub/LinkedIn.",
      result_guide: "Tuyển đủ 15 vị trí sau 55 ngày, tỷ lệ nhận offer đạt 82%.",
      language: "vi",
    },
    sample_answer: "Khi lương cứng không thể cạnh tranh với các tập đoàn lớn, tôi tập trung vào 3 yếu tố: Cơ chế làm việc Remote hoàn toàn, gói cổ phần thưởng ESOP và cơ hội được tham gia kiến trúc hệ thống từ số 0. Tôi phối hợp với CTO tổ chức buổi Tech Talk trực tuyến chia sẻ về bài toán kỹ thuật thú vị của dự án. Đồng thời, tôi tăng gấp đôi mức thưởng giới thiệu nội bộ (Employee Referral).",
    follow_up_questions: [
      "Bạn sàng lọc như thế nào để đảm bảo ứng viên giới thiệu nội bộ không bị thiên vị?",
      "Khi ứng viên nhận được counter-offer từ công ty cũ, bạn thuyết phục thế nào?"
    ],
    tips: [
      "Nhấn mạnh Employee Value Proposition (EVP) thay vì chỉ nhìn vào mức lương cơ bản."
    ]
  },
  {
    question_id: 111,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "fresher",
    language: "vi",
    question_type: "technical",
    question_text: "Phân biệt sự khác nhau giữa SQL và NoSQL database? Khi nào bạn nên chọn MongoDB thay vì PostgreSQL?",
    star_template_id: 11,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 2,
    intent: "Đánh giá kiến thức nền tảng về cơ sở dữ liệu, mô hình dữ liệu quan hệ vs phi quan hệ và tính chất ACID.",
    practice_count: 3200,
    avg_score: 89.2,
    tags: ["SQL", "NoSQL", "PostgreSQL", "MongoDB", "Database"],
    created_at: "2026-09-05T08:00:00Z",
    updated_at: "2026-09-17T10:00:00Z",
    star_template: {
      star_template_id: 11,
      title: "So sánh kiến trúc SQL và NoSQL",
      situation_guide: "Nêu khái niệm tổng quát và cơ chế lưu trữ của cả hai nhóm.",
      task_guide: "Làm rõ các tiêu chí lựa chọn: Schema linh hoạt, tính toàn vẹn dữ liệu, khả năng scale ngang.",
      action_guide: "Đưa ra ví dụ cụ thể: eCommerce transaction dùng PostgreSQL, log phân tích hành vi người dùng dùng MongoDB.",
      result_guide: "Kết luận tóm tắt theo định lý CAP.",
      language: "vi",
    },
    sample_answer: "SQL phù hợp với hệ thống yêu cầu tính toàn vẹn dữ liệu cao (ACID) như tài chính, thanh toán với schema cố định. Trong khi đó, NoSQL như MongoDB tối ưu cho dữ liệu phi cấu trúc, schema thường xuyên thay đổi và cần khả năng scale ngang dễ dàng. Tuy nhiên, hiện tại PostgreSQL cũng hỗ trợ kiểu dữ liệu JSONB cực kỳ mạnh mẽ, nên với đa số dự án tôi vẫn ưu tiên PostgreSQL trước khi tách riêng cụm NoSQL.",
    follow_up_questions: [
      "Khái niệm Sharding và Replication trong cơ sở dữ liệu hoạt động ra sao?",
      "Bạn hiểu gì về tính nhất quán sau cùng (Eventual Consistency)?"
    ],
    tips: [
      "Đừng nói xấu một công nghệ nào, hãy nói về tính phù hợp với bài toán (Right tool for the right job)."
    ]
  },
  {
    question_id: 112,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 4,
    role_name: "Data Scientist / AI Engineer",
    experience_level: "senior",
    language: "vi",
    question_type: "technical",
    question_text: "Làm thế nào để xử lý hiện tượng Overfitting khi huấn luyện mô hình Deep Learning trên tập dữ liệu nhỏ có nhiều nhiễu?",
    star_template_id: 12,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đánh giá hiểu biết sâu về kỹ thuật Regularization, Data Augmentation, Transfer Learning và validation strategy.",
    practice_count: 670,
    avg_score: 80.4,
    tags: ["Machine Learning", "Deep Learning", "Overfitting", "Transfer Learning"],
    created_at: "2026-09-06T11:20:00Z",
    updated_at: "2026-09-16T09:30:00Z",
    star_template: {
      star_template_id: 12,
      title: "Chiến lược chống Overfitting trong mô hình AI",
      situation_guide: "Mô hình đạt độ chính xác 99% trên tập Train nhưng chỉ 65% trên tập Validation.",
      task_guide: "Thu hẹp khoảng cách giữa train và validation loss mà không làm giảm năng lực tổng quát hóa.",
      action_guide: "Áp dụng kỹ thuật Data Augmentation, Dropout, Early Stopping, L2 Regularization và fine-tuning pre-trained model.",
      result_guide: "Validation accuracy tăng lên 88%, mô hình chạy ổn định trên thực tế.",
      language: "vi",
    },
    sample_answer: "Với tập dữ liệu nhỏ và nhiều nhiễu, việc train model từ scratch chắc chắn dẫn tới overfitting. Giải pháp đầu tiên của tôi là áp dụng Transfer Learning từ một model đã được huấn luyện trên tập dữ liệu tương tự và đóng băng các tầng cơ sở. Tiếp theo, tôi áp dụng Data Augmentation và Dropout (0.3 - 0.5) cùng Early Stopping. Cuối cùng, tôi sử dụng K-Fold Cross Validation để đánh giá khách quan.",
    follow_up_questions: [
      "Sự khác biệt giữa L1 (Lasso) và L2 (Ridge) Regularization là gì?",
      "Bạn xử lý Label Noise trong tập dữ liệu gán nhãn thủ công như thế nào?"
    ],
    tips: [
      "Luôn nhấn mạnh tầm quan trọng của chất lượng dữ liệu sạch trước khi tinh chỉnh hyperparameter."
    ]
  },
  {
    question_id: 113,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "junior",
    language: "en",
    question_type: "behavioral",
    question_text: "Can you tell me about a time you had a strong technical disagreement with your senior lead and how you handled it?",
    star_template_id: 13,
    is_active: true,
    moderation_status: "approved",
    source: "user_manual",
    difficulty: 3,
    intent: "Assess constructive feedback reception, diplomacy, and dedication to team consensus.",
    practice_count: 1210,
    avg_score: 85.0,
    tags: ["Disagreement", "Collaboration", "Soft Skills", "English"],
    created_at: "2026-09-07T14:00:00Z",
    updated_at: "2026-09-15T16:00:00Z",
    star_template: {
      star_template_id: 13,
      title: "Handling Technical Disagreements Gracefully",
      situation_guide: "A dispute between choosing REST API or GraphQL for the mobile backend.",
      task_guide: "Find the best technical solution without harming team synergy or missing deadline.",
      action_guide: "Built a quick POC benchmarking both protocols under 3G network conditions.",
      result_guide: "The team agreed on GraphQL for complex feed views and REST for simple CRUD, saving 30% network payload.",
      language: "en",
    },
    sample_answer: "In my previous role, my lead wanted to use pure REST, whereas I believed GraphQL would drastically reduce network payload on mobile devices. Rather than arguing conceptually, I created a small benchmark script simulating poor network conditions. I presented the metrics objectively: GraphQL reduced over-fetching by 45%. My lead appreciated the data-driven approach, and we agreed to pilot GraphQL for the most complex screen.",
    follow_up_questions: [
      "What would you do if your lead still said no after seeing the benchmark data?",
      "How do you ensure you don't waste too much time building POCs during disputes?"
    ],
    tips: [
      "Show respect for authority while demonstrating personal initiative backed by objective data."
    ]
  },
  {
    question_id: 114,
    domain_id: 5,
    domain_name: "Quản trị Sản phẩm (Product)",
    role_id: 17,
    role_name: "Scrum Master / Agile Coach",
    experience_level: "mid",
    language: "vi",
    question_type: "situational",
    question_text: "Trong buổi Sprint Planning, một Developer kỳ cựu từ chối estimate story points vì cho rằng việc này vô bổ và tốn thời gian. Bạn sẽ xử lý thế nào?",
    star_template_id: 14,
    is_active: true,
    moderation_status: "pending",
    source: "user_ai",
    difficulty: 3,
    intent: "Đo lường kỹ năng khai vấn Agile, thấu hiểu tâm lý kỹ sư và khả năng giải thích bản chất thực sự của story points.",
    practice_count: 420,
    avg_score: 81.0,
    tags: ["Agile", "Scrum", "Conflict Resolution", "Estimation"],
    created_at: "2026-09-08T16:45:00Z",
    updated_at: "2026-09-17T08:15:00Z",
    star_template: {
      star_template_id: 14,
      title: "Giải quyết sự phản kháng đối với quy trình Scrum",
      situation_guide: "Thành viên cốt cán phản đối việc ước lượng story points trong buổi họp nhóm.",
      task_guide: "Không áp đặt quyền lực, giúp thành viên hiểu ý nghĩa của việc đồng thuận về độ phức tạp.",
      action_guide: "Gặp riêng 1-1 để lắng nghe bức xúc, giải thích story point dùng để đo lường năng lực đội ngũ chứ không phải đánh giá KPI cá nhân.",
      result_guide: "Thành viên hiểu ra và chủ động tham gia Planning Poker trong các Sprint tiếp theo.",
      language: "vi",
    },
    sample_answer: "Tôi sẽ không tranh cãi ngay trong buổi họp trước mặt cả nhóm để tránh tạo không khí căng thẳng. Sau buổi họp, tôi mời bạn ấy đi cà phê để trò chuyện 1-1. Tôi lắng nghe lý do sâu xa—thường là do trước đây story points bị ban giám đốc dùng để ép deadline hoặc so sánh cá nhân. Tôi giải thích rõ trong đội ngũ này, estimate chỉ nhằm mục đích giúp cả nhóm tự bảo vệ mình trước lượng công việc quá tải.",
    follow_up_questions: [
      "Nếu đội ngũ kiên quyết chuyển sang phương pháp Kanban không cần estimate, bạn ủng hộ không?",
      "Làm thế nào để các buổi Retrospective không biến thành nơi đổ lỗi cho nhau?"
    ],
    tips: [
      "Thể hiện tư duy Servant Leadership (Lãnh đạo phục vụ)."
    ]
  },
  {
    question_id: 115,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 5,
    role_name: "QA / Automation Tester",
    experience_level: "junior",
    language: "vi",
    question_type: "technical",
    question_text: "Bạn xây dựng chiến lược kiểm thử tự động (Automation Test Framework) với Playwright hoặc Cypress cho một ứng dụng Single Page App thế nào?",
    star_template_id: 15,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 3,
    intent: "Khảo sát kiến trúc kiểm thử tự động, áp dụng Page Object Model (POM) và tích hợp CI/CD.",
    practice_count: 940,
    avg_score: 83.2,
    tags: ["QA", "Automation", "Playwright", "Cypress", "CI/CD"],
    created_at: "2026-09-09T09:00:00Z",
    updated_at: "2026-09-17T11:00:00Z",
    star_template: {
      star_template_id: 15,
      title: "Xây dựng khung kiểm thử tự động End-to-End",
      situation_guide: "Dự án phụ thuộc hoàn toàn vào kiểm thử thủ công (manual test), thời gian release kéo dài.",
      task_guide: "Tự động hóa 70% các kịch bản kiểm thử hồi quy (Regression Test) quan trọng nhất.",
      action_guide: "Áp dụng mô hình Page Object Model, tạo mock API dữ liệu động, chạy song song trên GitHub Actions.",
      result_guide: "Thời gian kiểm thử giảm từ 2 ngày xuống còn 35 phút mỗi lần deploy.",
      language: "vi",
    },
    sample_answer: "Tôi lựa chọn Playwright vì hỗ trợ chạy song song đa luồng và auto-waiting rất tốt cho Single Page App. Tôi tổ chức mã nguồn theo mô hình Page Object Model để dễ bảo trì khi UI thay đổi. Đối với môi trường CI/CD, tôi cấu hình chỉ chạy Smoke Test trên mỗi Pull Request và chạy toàn bộ bộ E2E Test vào ban đêm để tối ưu chi phí runner.",
    follow_up_questions: [
      "Làm sao bạn giải quyết bài toán kiểm thử chập chờn (Flaky Tests)?",
      "Khi nào nên viết Unit Test thay vì tốn công viết E2E Test?"
    ],
    tips: [
      "Nhắc đến Kim tự tháp kiểm thử (Test Pyramid) để chứng tỏ tư duy phân bổ nguồn lực hợp lý."
    ]
  },
  {
    question_id: 116,
    domain_id: 2,
    domain_name: "Tài chính & Ngân hàng (Finance)",
    role_id: 7,
    role_name: "Kế toán viên tổng hợp",
    experience_level: "mid",
    language: "vi",
    question_type: "situational",
    question_text: "Khi khóa sổ cuối năm, bạn phát hiện có khoản chênh lệch 150 triệu đồng giữa số dư tài khoản ngân hàng và sổ cái kế toán tiền gửi. Bạn truy vết thế nào?",
    star_template_id: 16,
    is_active: false,
    moderation_status: "rejected",
    moderation_reason: "Thiếu hướng dẫn phương pháp STAR chi tiết và câu hỏi còn trùng lặp với bộ đề cơ bản.",
    source: "user_manual",
    difficulty: 3,
    intent: "Đánh giá quy trình đối soát tài khoản ngân hàng (Bank Reconciliation) và tính cẩn trọng của kế toán.",
    practice_count: 310,
    avg_score: 72.5,
    tags: ["Accounting", "Bank Reconciliation", "Auditing", "General Ledger"],
    created_at: "2026-09-10T10:00:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    star_template: null,
    sample_answer: "Tôi đối chiếu từng giao dịch trên sổ phụ ngân hàng với sổ chi tiết tài khoản 112 theo từng tháng. Lọc các giao dịch có giá trị đúng 150 triệu hoặc các khoản đảo số (như gõ 510 thay vì 150). Kiểm tra các khoản séc chưa thanh toán hoặc tiền đang chuyển cuối kỳ.",
    follow_up_questions: ["Nếu đây là giao dịch gian lận nội bộ, bạn báo cáo cho ai đầu tiên?"],
    tips: ["Nhấn mạnh nguyên tắc tuân thủ và quy trình kiểm soát nội bộ."]
  },
  {
    question_id: 117,
    domain_id: 3,
    domain_name: "Marketing & Truyền thông",
    role_id: 10,
    role_name: "Content & SEO Strategist",
    experience_level: "mid",
    language: "vi",
    question_type: "technical",
    question_text: "Sau đợt cập nhật thuật toán cốt lõi (Google Core Update), lưu lượng truy cập tự nhiên (Organic Traffic) giảm 40%, bạn hành động ra sao?",
    star_template_id: 17,
    is_active: true,
    moderation_status: "pending",
    source: "admin_ai",
    difficulty: 4,
    intent: "Khảo sát kiến thức chuyên sâu về tiêu chuẩn EEAT, Search Quality Rater Guidelines và chiến lược tái cấu trúc nội dung.",
    practice_count: 510,
    avg_score: 80.2,
    tags: ["SEO", "Google Core Update", "Content Strategy", "EEAT"],
    created_at: "2026-09-11T13:00:00Z",
    updated_at: "2026-09-17T14:30:00Z",
    star_template: {
      star_template_id: 17,
      title: "Hồi phục thứ hạng SEO sau Google Core Update",
      situation_guide: "Website tụt hạng mạnh sau đợt cập nhật Helpful Content của Google.",
      task_guide: "Xác định nhóm bài viết bị ảnh hưởng nặng nhất và lập kế hoạch nâng cấp chất lượng.",
      action_guide: "Dùng Google Search Console phân tích URL mất clicks, bổ sung bằng chứng chuyên gia (EEAT), xóa bỏ nội dung mỏng do AI tạo hàng loạt.",
      result_guide: "Sau 3 tháng, lưu lượng truy cập hồi phục 115% so với trước khi tụt.",
      language: "vi",
    },
    sample_answer: "Tôi dùng Google Search Console so sánh 28 ngày trước và sau update để lọc ra danh sách URL tụt mạnh nhất. Sau đó, tôi kiểm tra xem có phải nội dung thiếu chiều sâu trải nghiệm thực tế (Experience trong EEAT) hay không. Tôi lên kế hoạch viết lại nội dung, bổ sung trích dẫn của các chuyên gia thực thụ và xóa bỏ các trang trùng lặp nội dung rác.",
    follow_up_questions: ["Làm sao bạn cân bằng giữa việc dùng AI hỗ trợ viết bài và tiêu chuẩn nội dung hữu ích của Google?"],
    tips: ["Đừng vội vàng đổi cấu trúc URL hoặc disavow links khi chưa hiểu nguyên nhân thuật toán."]
  },
  {
    question_id: 118,
    domain_id: 4,
    domain_name: "Bán hàng & Kinh doanh (Sales)",
    role_id: 13,
    role_name: "Account Manager (Khách hàng DN)",
    experience_level: "senior",
    language: "vi",
    question_type: "behavioral",
    question_text: "Làm thế nào để bạn thuyết phục một khách hàng doanh nghiệp gia hạn hợp đồng phần mềm khi họ vừa trải qua một đợt cắt giảm 30% ngân sách toàn công ty?",
    star_template_id: 18,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đánh giá kỹ năng giữ chân khách hàng (Retention), tính toán giá trị tiết kiệm chi phí và thiết kế phương án thanh toán linh hoạt.",
    practice_count: 1340,
    avg_score: 86.8,
    tags: ["Account Management", "Customer Retention", "Negotiation", "SaaS Renewals"],
    created_at: "2026-09-12T09:30:00Z",
    updated_at: "2026-09-18T10:00:00Z",
    star_template: {
      star_template_id: 18,
      title: "Giữ chân khách hàng B2B trong giai đoạn cắt giảm ngân sách",
      situation_guide: "Khách hàng thông báo sẽ không gia hạn hợp đồng vì doanh nghiệp đang siết chặt chi phí.",
      task_guide: "Giữ được tài khoản khách hàng, tối thiểu duy trì gói cơ bản để không bị churn.",
      action_guide: "Lập bảng báo cáo hiệu quả: chỉ ra phần mềm đã giúp họ cắt giảm được bao nhiêu giờ công lao động, đề xuất chuyển sang thanh toán theo quý hoặc giảm bớt user thừa.",
      result_guide: "Khách hàng đồng ý tái ký hợp đồng 1 năm với gói tối ưu, duy trì được 85% giá trị hợp đồng.",
      language: "vi",
    },
    sample_answer: "Khi khách hàng cần cắt giảm ngân sách, nếu ta chỉ giảm giá thì ta tự hạ thấp giá trị giải pháp. Tôi đã gửi cho Giám đốc Điều hành một bản tóm tắt 1 trang chứng minh: Trong năm qua, phần mềm đã giúp đội ngũ họ xử lý tự động 12,000 đơn hàng, tương đương tiết kiệm 2 vị trí nhân sự toàn thời gian. Tôi đề xuất tái cấu trúc gói: Tạm thời khóa 10 tài khoản không hoạt động và chuyển sang kỳ thanh toán linh hoạt từng quý.",
    follow_up_questions: ["Làm sao dự đoán sớm nguy cơ khách hàng sẽ không gia hạn trước 90 ngày?"],
    tips: ["Nhấn mạnh: Phần mềm là công cụ giúp họ tiết kiệm tiền chứ không phải là một chi phí xa xỉ."]
  },
  {
    question_id: 119,
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "lead",
    language: "vi",
    question_type: "technical",
    question_text: "Chiến lược phân tách kiến trúc Monolith sang Microservices cho một hệ thống đang phục vụ hàng triệu người dùng hoạt động hàng ngày?",
    star_template_id: 19,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 5,
    intent: "Đánh giá tầm nhìn kiến trúc tổng thể, mô hình Strangler Fig Pattern, quản lý giao dịch phân tán (Saga Pattern) và văn hóa DevOps.",
    practice_count: 1780,
    avg_score: 82.3,
    tags: ["Microservices", "System Architecture", "Monolith", "Strangler Pattern"],
    created_at: "2026-09-13T11:00:00Z",
    updated_at: "2026-09-18T16:00:00Z",
    star_template: {
      star_template_id: 19,
      title: "Chuyển đổi kiến trúc Microservices theo mô hình Strangler Fig",
      situation_guide: "Monolith quá cồng kềnh, thời gian build deploy kéo dài 45 phút, một lỗi nhỏ làm sập toàn bộ hệ sinh thái.",
      task_guide: "Chuyển dịch từng phần sang Microservices mà không dừng hoạt động dịch vụ (Zero Downtime).",
      action_guide: "Sử dụng Strangler Fig Pattern bắt đầu từ module độc lập (Notification, Auth), thiết lập API Gateway điều phối routing, sử dụng Event-Driven Architecture với Kafka.",
      result_guide: "Tách thành công 8 services độc lập trong 12 tháng, thời gian release giảm xuống 10 phút, độ tin cậy hệ thống đạt 99.99%.",
      language: "vi",
    },
    sample_answer: "Sai lầm lớn nhất là đập đi viết lại từ đầu (Big Bang rewrite). Tôi luôn áp dụng Strangler Fig Pattern: Đặt một API Gateway phía trước, sau đó xác định các domain boundaries theo Domain-Driven Design (DDD). Tôi bắt đầu tách những dịch vụ ít phụ thuộc dữ liệu nhất như Notification hoặc Search Service. Đối với dữ liệu, sử dụng Change Data Capture (Debezium) để đồng bộ hai chiều trong giai đoạn chuyển tiếp.",
    follow_up_questions: [
      "Khi chuyển sang Microservices, bạn giải quyết bài toán Distributed Tracing như thế nào với OpenTelemetry?",
      "Bạn chọn Saga Orchestration hay Saga Choreography cho chuỗi thanh toán phức tạp?"
    ],
    tips: [
      "Nêu bật những thách thức của Microservices: Phức tạp vận hành, mạng không đáng tin cậy, dữ liệu không nhất quán tức thời."
    ]
  },
  {
    question_id: 120,
    domain_id: 6,
    domain_name: "Quản trị Nhân sự (HR)",
    role_id: 19,
    role_name: "HR Generalist",
    experience_level: "mid",
    language: "vi",
    question_type: "situational",
    question_text: "Bạn nhận được tố cáo ẩn danh về hành vi quấy rối tình dục hoặc bắt nạt nơi công sở nhắm vào một Trưởng phòng có thành tích xuất sắc. Bạn xử lý quy trình điều tra ra sao?",
    star_template_id: 20,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    difficulty: 4,
    intent: "Đánh giá tính công tâm, tuân thủ pháp luật lao động, kỹ năng bảo vệ người tố cáo và xử lý kỷ luật chuẩn mực.",
    practice_count: 620,
    avg_score: 84.0,
    tags: ["HR Compliance", "Investigation", "Workplace Ethics", "Labor Law"],
    created_at: "2026-09-14T08:30:00Z",
    updated_at: "2026-09-18T14:00:00Z",
    star_template: {
      star_template_id: 20,
      title: "Quy trình điều tra vi phạm đạo đức nơi công sở",
      situation_guide: "Tố cáo ẩn danh nhắm vào quản lý cấp cao mang lại nhiều doanh số.",
      task_guide: "Đảm bảo tính độc lập, khách quan, bảo vệ danh tính các bên liên quan và tuân thủ nội quy lao động.",
      action_guide: "Thành lập ban điều tra nội bộ bảo mật, thu thập bằng chứng văn bản/camera, phỏng vấn riêng biệt từng nhân chứng, lập biên bản rõ ràng.",
      result_guide: "Đưa ra hình thức xử lý kỷ luật minh bạch, củng cố lòng tin của nhân viên vào môi trường làm việc an toàn.",
      language: "vi",
    },
    sample_answer: "Thành tích kinh doanh không bao giờ được dùng làm lá chắn cho hành vi vi phạm đạo đức và pháp luật. Tôi sẽ tiếp nhận tố cáo, đảm bảo nguyên tắc bảo mật tối đa và cam kết không trả đũa đối với người tố cáo. Tôi lập kế hoạch thu thập chứng cứ gián tiếp trước (tin nhắn, email công vụ, log camera). Sau đó, tôi phỏng vấn riêng người bị tố cáo với sự có mặt của đại diện pháp chế.",
    follow_up_questions: ["Nếu người tố cáo không có bằng chứng cụ thể mà chỉ là lời nói một chiều, bạn xử lý thế nào?"],
    tips: ["Nhấn mạnh tính thượng tôn pháp luật và văn hóa công ty không dung thứ cho quấy rối (Zero-Tolerance Policy)."]
  }
];

export function generateQuestionsChartData(): QuestionDailyPoint[] {
  const points: QuestionDailyPoint[] = [];
  const now = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const basePractice = isWeekend ? 35 : 75;
    const randomVariation = Math.floor(Math.sin(i / 5) * 20) + Math.floor(Math.random() * 25);
    const practiceSessions = Math.max(20, basePractice + randomVariation);
    
    const newQuestions = Math.floor(Math.random() * 5) + (i % 7 === 0 ? 8 : 1);
    
    points.push({
      date: dateStr,
      practiceSessions,
      newQuestions,
    });
  }
  
  return points;
}

export const MOCK_QUESTION_STATS = {
  totalQuestions: 1280,
  approvedCount: 1154,
  pendingCount: 86,
  rejectedCount: 40,
  activeCount: 1210,
  totalPracticeSessions: 45678,
  starCoverageRate: 96.5,
  growthThisMonth: "+14.2%",
};
