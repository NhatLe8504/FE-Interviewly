export interface DomainItem {
  id: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  iconType: string;
  color: string;
}

export interface RoleOption {
  id: string;
  domainId: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
}

export const ONBOARDING_DOMAINS: DomainItem[] = [
  {
    id: "it",
    nameVi: "Công nghệ thông tin (IT & Phần mềm)",
    nameEn: "Information Technology & Software",
    descVi: "Phát triển phần mềm, ứng dụng, dữ liệu, đám mây & AI.",
    descEn: "Software engineering, cloud, data, security & AI.",
    iconType: "code",
    color: "#3b82f6",
  },
  {
    id: "marketing",
    nameVi: "Marketing & Truyền thông",
    nameEn: "Marketing & Communications",
    descVi: "Digital marketing, content, SEO/SEM, thương hiệu & PR.",
    descEn: "Digital marketing, content, SEO, branding & PR.",
    iconType: "megaphone",
    color: "#ec4899",
  },
  {
    id: "finance",
    nameVi: "Tài chính & Ngân hàng",
    nameEn: "Finance & Banking",
    descVi: "Phân tích đầu tư, kế toán, kiểm toán & dịch vụ ngân hàng.",
    descEn: "Financial analysis, accounting, auditing & banking.",
    iconType: "landmark",
    color: "#10b981",
  },
  {
    id: "sales",
    nameVi: "Kinh doanh & Bán hàng (Sales)",
    nameEn: "Sales & Business Development",
    descVi: "B2B sales, phát triển thị trường, account & chăm sóc khách hàng.",
    descEn: "B2B sales, account executive, business development.",
    iconType: "trending-up",
    color: "#f59e0b",
  },
  {
    id: "design",
    nameVi: "Thiết kế Sản phẩm (UI/UX)",
    nameEn: "Product Design (UI/UX)",
    descVi: "Thiết kế trải nghiệm người dùng, giao diện số & design system.",
    descEn: "UI/UX, product design, user research & motion design.",
    iconType: "palette",
    color: "#8b5cf6",
  },
  {
    id: "hr",
    nameVi: "Quản trị Nhân sự (HR)",
    nameEn: "Human Resources (HR)",
    descVi: "Tuyển dụng nhân tài, C&B, đào tạo & phát triển văn hóa doanh nghiệp.",
    descEn: "Talent acquisition, C&B, HRBP & culture.",
    iconType: "users",
    color: "#06b6d4",
  },
  {
    id: "student",
    nameVi: "Sinh viên & Mới tốt nghiệp",
    nameEn: "Student & Fresh Graduate",
    descVi: "Đang tìm kiếm cơ hội thực tập hoặc việc làm đầu tiên.",
    descEn: "Seeking first job or internship opportunity.",
    iconType: "graduation-cap",
    color: "#6366f1",
  },
  {
    id: "other",
    nameVi: "Lĩnh vực khác / Chuyển ngành",
    nameEn: "Other / Career Transition",
    descVi: "Quản trị dự án, chuỗi cung ứng hoặc đang định hướng mới.",
    descEn: "Project management, supply chain or career transition.",
    iconType: "globe",
    color: "#6b7280",
  },
];

export const COMPREHENSIVE_ROLES: RoleOption[] = [
  // --- IT & Software ---
  {
    id: "backend",
    domainId: "it",
    titleVi: "Backend Developer",
    titleEn: "Backend Developer",
    descVi: "Xây dựng API, cơ sở dữ liệu, microservices (Node/Python/Go/Java).",
    descEn: "APIs, databases, microservices (Node/Python/Go/Java).",
  },
  {
    id: "frontend",
    domainId: "it",
    titleVi: "Frontend Developer",
    titleEn: "Frontend Developer",
    descVi: "Phát triển giao diện web mượt mà (React/Next.js/Vue/TypeScript).",
    descEn: "Modern web interfaces (React/Next.js/Vue/TypeScript).",
  },
  {
    id: "fullstack",
    domainId: "it",
    titleVi: "Fullstack Developer",
    titleEn: "Fullstack Developer",
    descVi: "Làm chủ trọn vẹn cả kiến trúc Client-side lẫn Server-side.",
    descEn: "End-to-end client-side and server-side engineering.",
  },
  {
    id: "mobile",
    domainId: "it",
    titleVi: "Mobile Developer",
    titleEn: "Mobile Developer",
    descVi: "Phát triển ứng dụng di động iOS / Android (Flutter / React Native).",
    descEn: "Mobile apps for iOS & Android (Flutter / React Native).",
  },
  {
    id: "devops",
    domainId: "it",
    titleVi: "DevOps & Cloud Engineer",
    titleEn: "DevOps & Cloud Engineer",
    descVi: "Hạ tầng đám mây AWS/GCP, Docker, Kubernetes & CI/CD pipeline.",
    descEn: "Cloud AWS/GCP, Docker, Kubernetes & CI/CD pipeline.",
  },
  {
    id: "qa_qc",
    domainId: "it",
    titleVi: "QA / Automation Tester",
    titleEn: "QA / Automation Tester",
    descVi: "Kiểm thử tự động, viết test case & đảm bảo chất lượng phần mềm.",
    descEn: "Test automation, quality assurance & test suites.",
  },
  {
    id: "data_analyst",
    domainId: "it",
    titleVi: "Data Analyst / BI Specialist",
    titleEn: "Data Analyst / BI Specialist",
    descVi: "Khai phá dữ liệu, phân tích số liệu kinh doanh & xây dashboard.",
    descEn: "Data insights, business intelligence & interactive dashboards.",
  },
  {
    id: "ai_engineer",
    domainId: "it",
    titleVi: "AI / Machine Learning Engineer",
    titleEn: "AI / Machine Learning Engineer",
    descVi: "Mô hình ngôn ngữ lớn (LLM), NLP, Computer Vision & MLOps.",
    descEn: "Large Language Models, NLP, Computer Vision & MLOps.",
  },

  // --- Marketing ---
  {
    id: "digital_mkt",
    domainId: "marketing",
    titleVi: "Digital Marketing Specialist",
    titleEn: "Digital Marketing Specialist",
    descVi: "Triển khai chiến dịch đa kênh, tối ưu phễu chuyển đổi số.",
    descEn: "Multi-channel digital marketing & conversion funnels.",
  },
  {
    id: "content_mkt",
    domainId: "marketing",
    titleVi: "Content Creator / Copywriter",
    titleEn: "Content Creator / Copywriter",
    descVi: "Sáng tạo nội dung thu hút, kịch bản video & bài viết truyền thông.",
    descEn: "Compelling storytelling, video scripts & content strategy.",
  },
  {
    id: "seo_sem",
    domainId: "marketing",
    titleVi: "SEO / Performance Marketing",
    titleEn: "SEO / Performance Marketing",
    descVi: "Tối ưu hóa công cụ tìm kiếm, quản lý ngân sách Google & FB Ads.",
    descEn: "Search engine optimization, Google Ads & paid traffic.",
  },
  {
    id: "brand_manager",
    domainId: "marketing",
    titleVi: "Brand & Communications Manager",
    titleEn: "Brand & Communications Manager",
    descVi: "Định vị thương hiệu, quan hệ công chúng & chiến lược truyền thông.",
    descEn: "Brand positioning, PR & strategic corporate communications.",
  },

  // --- Finance & Banking ---
  {
    id: "financial_analyst",
    domainId: "finance",
    titleVi: "Financial Analyst",
    titleEn: "Financial Analyst",
    descVi: "Phân tích báo cáo tài chính, thẩm định dự án & định giá doanh nghiệp.",
    descEn: "Financial modeling, project valuation & market analysis.",
  },
  {
    id: "accountant",
    domainId: "finance",
    titleVi: "Kế toán / Kiểm toán viên (Auditor)",
    titleEn: "Accountant / Auditor",
    descVi: "Báo cáo thuế, kế toán tổng hợp & kiểm soát nội bộ chuẩn mực.",
    descEn: "Corporate tax, financial statements & internal auditing.",
  },
  {
    id: "rm_banking",
    domainId: "finance",
    titleVi: "Chuyên viên QHKH Doanh nghiệp (RM)",
    titleEn: "Corporate Relationship Manager",
    descVi: "Quản lý danh mục khách hàng doanh nghiệp, thẩm định tín dụng.",
    descEn: "Corporate credit appraisal & portfolio management.",
  },
  {
    id: "risk_manager",
    domainId: "finance",
    titleVi: "Quản trị Rủi ro (Risk Management)",
    titleEn: "Risk Management Specialist",
    descVi: "Đánh giá rủi ro tín dụng, thị trường & thanh khoản tài chính.",
    descEn: "Credit risk, liquidity assessment & regulatory compliance.",
  },

  // --- Sales & Business ---
  {
    id: "b2b_sales",
    domainId: "sales",
    titleVi: "B2B Sales / Account Executive",
    titleEn: "B2B Sales / Account Executive",
    descVi: "Tìm kiếm khách hàng doanh nghiệp, đàm phán hợp đồng giá trị cao.",
    descEn: "Enterprise client acquisition & high-ticket deal negotiation.",
  },
  {
    id: "bde",
    domainId: "sales",
    titleVi: "Business Development Executive (BDE)",
    titleEn: "Business Development Executive",
    descVi: "Mở rộng quan hệ đối tác chiến lược & phát triển thị trường mới.",
    descEn: "Strategic partnerships & new market expansion.",
  },
  {
    id: "csm",
    domainId: "sales",
    titleVi: "Customer Success Specialist (CSM)",
    titleEn: "Customer Success Specialist",
    descVi: "Gia tăng tỷ lệ giữ chân khách hàng, hỗ trợ giải pháp và upsell.",
    descEn: "Client retention, onboarding support & account expansion.",
  },

  // --- Design UI/UX ---
  {
    id: "ui_ux",
    domainId: "design",
    titleVi: "UI/UX Designer",
    titleEn: "UI/UX Designer",
    descVi: "Nghiên cứu hành vi người dùng, vẽ wireframe & prototype trên Figma.",
    descEn: "User behavior research, wireframing & interactive prototypes.",
  },
  {
    id: "product_designer",
    domainId: "design",
    titleVi: "Product Designer",
    titleEn: "Product Designer",
    descVi: "Làm chủ trọn vẹn từ tư duy kinh doanh, UX research đến UI hoàn thiện.",
    descEn: "Holistic product thinking from business goals to polished UI.",
  },
  {
    id: "graphic_designer",
    domainId: "design",
    titleVi: "Graphic & Brand Identity Designer",
    titleEn: "Graphic & Brand Identity Designer",
    descVi: "Bộ nhận diện thương hiệu, ấn phẩm truyền thông & digital visual.",
    descEn: "Brand identity systems, marketing assets & visual communication.",
  },

  // --- HR ---
  {
    id: "recruiter",
    domainId: "hr",
    titleVi: "Chuyên viên Tuyển dụng (Talent Acquisition)",
    titleEn: "Talent Acquisition Specialist",
    descVi: "Tìm kiếm nhân tài, sàng lọc hồ sơ & phỏng vấn vòng văn hóa.",
    descEn: "Candidate sourcing, resume screening & cultural interviews.",
  },
  {
    id: "hrbp",
    domainId: "hr",
    titleVi: "HRBP (HR Business Partner)",
    titleEn: "HR Business Partner",
    descVi: "Đồng hành cùng ban lãnh đạo tối ưu hóa chiến lược nhân sự.",
    descEn: "Strategic HR alignment with business leadership goals.",
  },

  // --- Student & Fresher ---
  {
    id: "intern_tech",
    domainId: "student",
    titleVi: "Thực tập sinh Công nghệ (Tech Intern)",
    titleEn: "Tech Intern",
    descVi: "Sinh viên CNTT mong muốn cọ xát dự án thực tế tại doanh nghiệp.",
    descEn: "IT students seeking hands-on enterprise project experience.",
  },
  {
    id: "intern_biz",
    domainId: "student",
    titleVi: "Thực tập sinh Kinh doanh / Marketing",
    titleEn: "Business / Marketing Intern",
    descVi: "Rèn luyện kỹ năng mềm, làm việc nhóm và giao tiếp chuyên nghiệp.",
    descEn: "Soft skills, team collaboration & business communication.",
  },

  // --- Other ---
  {
    id: "ba_po",
    domainId: "other",
    titleVi: "Business Analyst (BA) / Product Owner",
    titleEn: "Business Analyst (BA) / Product Owner",
    descVi: "Cầu nối giữa nghiệp vụ kinh doanh và đội ngũ kỹ thuật sản phẩm.",
    descEn: "Bridge between business operations and engineering teams.",
  },
  {
    id: "pm",
    domainId: "other",
    titleVi: "Project Manager (PMP / Agile)",
    titleEn: "Project Manager (PMP / Agile)",
    descVi: "Quản lý tiến độ, phân bổ nguồn lực & xử lý rủi ro dự án.",
    descEn: "Project timelines, resource allocation & risk mitigation.",
  },
];