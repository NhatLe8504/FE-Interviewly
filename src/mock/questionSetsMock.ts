import type { QuestionSetItem } from "@/types/catalog";
import { MOCK_ADMIN_QUESTIONS } from "./adminQuestionsMock";

export const MOCK_QUESTION_SETS: QuestionSetItem[] = [
  {
    set_id: 1,
    title: "Bộ đề phỏng vấn Full Stack Java - Fresher (Spring Boot & PostgreSQL)",
    description: "Khung đề thi phỏng vấn tiêu chuẩn dành cho sinh viên mới ra trường và fresher: Kiểm tra kiến thức OOP, Spring Boot IoC/DI, Hibernate N+1, tối ưu câu lệnh SQL và giải quyết bug.",
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 1,
    role_name: "Backend Engineer",
    experience_level: "fresher",
    tech_stack: ["Java", "Spring Boot", "PostgreSQL", "React", "RESTful API"],
    language: "vi",
    target_difficulty: 2,
    estimated_duration_minutes: 20,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 5,
    practice_count: 2450,
    avg_score: 82.5,
    pass_rate: 78.0,
    created_at: "2026-08-20T08:00:00Z",
    updated_at: "2026-09-15T10:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[0], // Bug production
      MOCK_ADMIN_QUESTIONS[10], // SQL vs NoSQL
      {
        ...MOCK_ADMIN_QUESTIONS[0],
        question_id: 201,
        question_text: "Trong Java Spring Boot, bạn hiểu cơ chế Dependency Injection (DI) và Inversion of Control (IoC) hoạt động như thế nào? Phân biệt Bean Scope Singleton và Prototype?",
        question_type: "technical",
        difficulty: 2,
        intent: "Đo lường kiến thức nền tảng về Spring Core, quản lý vòng đời Bean và IoC Container.",
      },
      {
        ...MOCK_ADMIN_QUESTIONS[0],
        question_id: 202,
        question_text: "Khi làm việc với Hibernate / JPA trong Spring Boot, lỗi 'N+1 queries' là gì và bạn xử lý nó bằng cách nào?",
        question_type: "technical",
        difficulty: 3,
        intent: "Khảo sát kỹ năng làm việc với ORM, tối ưu câu lệnh truy vấn và tránh nghẽn DB.",
      },
      {
        ...MOCK_ADMIN_QUESTIONS[0],
        question_id: 203,
        question_text: "Hãy chia sẻ về một đồ án hoặc dự án mà bạn gặp khó khăn khi kết nối Backend Spring Boot với Frontend React và cách bạn đã vượt qua.",
        question_type: "behavioral",
        difficulty: 2,
        intent: "Đánh giá khả năng tự học, giải quyết vấn đề CORS/Authentication và tinh thần trách nhiệm.",
      }
    ]
  },
  {
    set_id: 2,
    title: "Bộ đề Frontend React / Next.js - Senior (Web Vitals & Performance)",
    description: "Bộ câu hỏi chuyên sâu kiểm tra năng lực tối ưu hóa hiệu năng LCP/INP/CLS, kiến trúc Server Components, quản lý state phức tạp và kỹ năng Lead nhóm.",
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 2,
    role_name: "Frontend Developer",
    experience_level: "senior",
    tech_stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Web Vitals"],
    language: "vi",
    target_difficulty: 4,
    estimated_duration_minutes: 25,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 4,
    practice_count: 1820,
    avg_score: 79.4,
    pass_rate: 71.5,
    created_at: "2026-08-25T10:00:00Z",
    updated_at: "2026-09-14T14:30:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[2], // Web Vitals
      {
        ...MOCK_ADMIN_QUESTIONS[2],
        question_id: 204,
        question_text: "So sánh cơ chế Server Components (RSC) và Client Components trong Next.js App Router? Khi nào việc lạm dụng 'use client' làm suy giảm hiệu năng?",
        question_type: "technical",
        difficulty: 4,
        intent: "Đánh giá hiểu biết sâu về kiến trúc hybrid rendering và streaming HTML.",
      },
      {
        ...MOCK_ADMIN_QUESTIONS[2],
        question_id: 205,
        question_text: "Làm thế nào để thiết kế một hệ thống Design System dùng chung cho 5 dự án web khác nhau mà vẫn đảm bảo tính độc lập và dễ nâng cấp?",
        question_type: "technical",
        difficulty: 4,
        intent: "Khảo sát tư duy module hóa component, packaging npm và quản lý breaking changes.",
      },
      MOCK_ADMIN_QUESTIONS[12] // Technical disagreement
    ]
  },
  {
    set_id: 3,
    title: "Bộ đề DevOps / SRE - Senior (Kubernetes, Docker & Incident Response)",
    description: "Bộ đề thực chiến dành cho Kỹ sư Vận hành & Hạ tầng đám mây: Troubleshooting OOMKilled, thiết kế CI/CD pipeline an toàn, hạ tầng dưới dạng mã (Terraform) và giám sát hệ thống.",
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 3,
    role_name: "DevOps / Cloud Engineer",
    experience_level: "senior",
    tech_stack: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Prometheus"],
    language: "vi",
    target_difficulty: 5,
    estimated_duration_minutes: 30,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 4,
    practice_count: 1150,
    avg_score: 76.0,
    pass_rate: 65.0,
    created_at: "2026-08-28T09:00:00Z",
    updated_at: "2026-09-16T16:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[3], // K8s OOMKilled
      MOCK_ADMIN_QUESTIONS[1], // Distributed Rate Limiting
      {
        ...MOCK_ADMIN_QUESTIONS[3],
        question_id: 206,
        question_text: "Chiến lược bảo mật cho cụm Kubernetes (K8s Security Hardening) từ tầng Network Policy, RBAC đến quét lỗ hổng image trong CI/CD?",
        question_type: "technical",
        difficulty: 5,
        intent: "Đo lường tư duy DevSecOps và khả năng bảo vệ hạ tầng trọng yếu.",
      },
      {
        ...MOCK_ADMIN_QUESTIONS[3],
        question_id: 207,
        question_text: "Hãy kể về một lần hệ thống bị rớt mạng hoặc mất điện toán diện rộng trên Cloud và cách bạn đã kích hoạt kế hoạch Disaster Recovery (DR).",
        question_type: "situational",
        difficulty: 5,
        intent: "Đánh giá quy trình RTO, RPO và năng lực xử lý khủng hoảng.",
      }
    ]
  },
  {
    set_id: 4,
    title: "Bộ đề Product Manager - Mid-Level (RICE, Discovery & Stakeholder)",
    description: "Bộ đề phỏng vấn Quản trị Sản phẩm: Khung ưu tiên RICE, giao tiếp xử lý xung đột quyền lợi giữa Sales và Tech, phân tích chỉ số kinh doanh và khai tử tính năng.",
    domain_id: 5,
    domain_name: "Quản trị Sản phẩm (Product)",
    role_id: 15,
    role_name: "Product Manager (PM)",
    experience_level: "mid",
    tech_stack: ["Product Discovery", "RICE Scoring", "A/B Testing", "Agile", "OKRs"],
    language: "vi",
    target_difficulty: 3,
    estimated_duration_minutes: 20,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 3,
    practice_count: 1640,
    avg_score: 84.8,
    pass_rate: 81.0,
    created_at: "2026-09-01T14:00:00Z",
    updated_at: "2026-09-17T09:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[4], // Deprecate feature
      MOCK_ADMIN_QUESTIONS[5], // A/B testing ethical
      MOCK_ADMIN_QUESTIONS[13], // Scrum estimation
    ]
  },
  {
    set_id: 5,
    title: "Bộ đề B2B Sales Executive - Senior (Enterprise Deal Closing)",
    description: "Bộ câu hỏi đàm phán hợp đồng giá trị lớn, vượt qua rào cản đa phòng ban (Multi-stakeholders), giữ chân khách hàng khi cắt giảm ngân sách.",
    domain_id: 4,
    domain_name: "Bán hàng & Kinh doanh (Sales)",
    role_id: 12,
    role_name: "B2B Sales Executive",
    experience_level: "senior",
    tech_stack: ["B2B Enterprise", "CRM", "Contract Negotiation", "Pipeline Management"],
    language: "vi",
    target_difficulty: 4,
    estimated_duration_minutes: 20,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 3,
    practice_count: 980,
    avg_score: 87.5,
    pass_rate: 85.0,
    created_at: "2026-09-03T11:00:00Z",
    updated_at: "2026-09-18T10:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[8], // B2B deal 6 months
      MOCK_ADMIN_QUESTIONS[17], // Retention budget cut
      {
        ...MOCK_ADMIN_QUESTIONS[8],
        question_id: 208,
        question_text: "Làm thế nào để bạn xây dựng mối quan hệ với 'Internal Champion' (Người ủng hộ nội bộ) bên trong doanh nghiệp khách hàng để vượt qua đối thủ cạnh tranh?",
        question_type: "behavioral",
        difficulty: 4,
        intent: "Đo lường năng lực thiết lập liên minh và điều hướng nội bộ doanh nghiệp khách hàng.",
      }
    ]
  },
  {
    set_id: 6,
    title: "Bộ đề Chuyên viên Phân tích Tài chính - Senior (DCF & Valuation)",
    description: "Khung câu hỏi chuyên sâu về xây dựng mô hình tài chính 3 báo cáo (3-Statement Model), định giá doanh nghiệp công nghệ FCF âm và phân tích độ nhạy WACC.",
    domain_id: 2,
    domain_name: "Tài chính & Ngân hàng (Finance)",
    role_id: 6,
    role_name: "Chuyên viên Phân tích Tài chính",
    experience_level: "senior",
    tech_stack: ["Financial Modeling", "DCF Valuation", "WACC", "Excel Advanced", "M&A"],
    language: "vi",
    target_difficulty: 5,
    estimated_duration_minutes: 25,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 3,
    practice_count: 760,
    avg_score: 77.0,
    pass_rate: 68.0,
    created_at: "2026-09-05T09:30:00Z",
    updated_at: "2026-09-17T15:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[6], // DCF valuation
      MOCK_ADMIN_QUESTIONS[15], // Bank reconciliation discrepancy
      {
        ...MOCK_ADMIN_QUESTIONS[6],
        question_id: 209,
        question_text: "Khi lãi suất phi rủi ro (Risk-free rate) tăng mạnh do chính sách tiền tệ thắt chặt, giá trị định giá của các công ty công nghệ bị tác động như thế nào qua mô hình CAPM?",
        question_type: "technical",
        difficulty: 4,
        intent: "Đánh giá sự am hiểu về kinh tế vĩ mô và tác động của chi phí vốn lên định giá cổ phiếu.",
      }
    ]
  },
  {
    set_id: 7,
    title: "Bộ đề Data Scientist / AI Engineer - Senior (Deep Learning & MLOps)",
    description: "Bộ câu hỏi kiểm tra kỹ thuật xử lý Overfitting trên dữ liệu nhiễu, kiến trúc Transformer / LLMs và triển khai mô hình AI trên Production (MLOps).",
    domain_id: 1,
    domain_name: "Công nghệ thông tin (IT)",
    role_id: 4,
    role_name: "Data Scientist / AI Engineer",
    experience_level: "senior",
    tech_stack: ["Python", "PyTorch", "Deep Learning", "MLOps", "LLMs", "Docker"],
    language: "vi",
    target_difficulty: 5,
    estimated_duration_minutes: 25,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_ai",
    question_count: 3,
    practice_count: 920,
    avg_score: 81.2,
    pass_rate: 73.0,
    created_at: "2026-09-07T14:00:00Z",
    updated_at: "2026-09-18T11:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[11], // Overfitting
      {
        ...MOCK_ADMIN_QUESTIONS[11],
        question_id: 210,
        question_text: "Làm thế nào để bạn giải quyết bài toán Data Drift và Concept Drift khi mô hình AI đã triển khai trên môi trường Production bị suy giảm độ chính xác?",
        question_type: "technical",
        difficulty: 4,
        intent: "Đo lường năng lực giám sát mô hình liên tục (Continuous Monitoring) và retraining pipeline.",
      },
      {
        ...MOCK_ADMIN_QUESTIONS[11],
        question_id: 211,
        question_text: "Kỹ thuật tối ưu hóa mô hình ngôn ngữ lớn (LLM Quantization, LoRA / QLoRA Fine-tuning) hoạt động như thế nào để chạy trên phần cứng giới hạn?",
        question_type: "technical",
        difficulty: 5,
        intent: "Khảo sát kiến thức cập nhật về Generative AI và kỹ thuật nén mô hình.",
      }
    ]
  },
  {
    set_id: 8,
    title: "Bộ đề Talent Acquisition & HR - Mid-Level (Headhunting & Tuyển Dụng Tech)",
    description: "Bộ đề phỏng vấn nhân sự: Chiến lược săn đầu người lương thấp, xây dựng thương hiệu tuyển dụng, xử lý điều tra quấy rối và tuân thủ luật lao động.",
    domain_id: 6,
    domain_name: "Quản trị Nhân sự (HR)",
    role_id: 18,
    role_name: "Talent Acquisition Specialist",
    experience_level: "mid",
    tech_stack: ["Headhunting", "Employer Branding", "Tech Recruitment", "Labor Law", "EVP"],
    language: "vi",
    target_difficulty: 3,
    estimated_duration_minutes: 20,
    is_curated: true,
    is_active: true,
    moderation_status: "approved",
    source: "admin_manual",
    question_count: 3,
    practice_count: 1100,
    avg_score: 85.5,
    pass_rate: 83.0,
    created_at: "2026-09-09T08:00:00Z",
    updated_at: "2026-09-18T14:00:00Z",
    questions: [
      MOCK_ADMIN_QUESTIONS[9], // Tech lead hiring
      MOCK_ADMIN_QUESTIONS[19], // Sexual harassment investigation
      {
        ...MOCK_ADMIN_QUESTIONS[9],
        question_id: 212,
        question_text: "Khi một ứng viên xuất sắc đồng ý nhận việc nhưng 2 ngày trước khi Onboarding bất ngờ thông báo từ chối (Drop offer), bạn sẽ xử lý thế nào để giảm thiểu thiệt hại cho dự án?",
        question_type: "situational",
        difficulty: 3,
        intent: "Đánh giá kỹ năng quản trị rủi ro tuyển dụng và chiến lược ứng viên dự phòng (Talent Pipeline).",
      }
    ]
  }
];

export const MOCK_QUESTION_SET_STATS = {
  totalSets: 85,
  curatedSets: 48,
  totalSetPractices: 32450,
  avgSetRating: 4.8,
  growthThisMonth: "+16.8%",
};
