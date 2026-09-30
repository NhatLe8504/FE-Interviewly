"use client";

import { questionAdminApi } from "@/services/admin/questionAdminApi";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Send,
  Eye,
  BookOpen,
  Plus,
  Search,
  FolderKanban,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Layers,
  Lightbulb,
  Clock,
  Wand2,
  Star,
  Check,
  RotateCcw,
  Bot,
  FileText,
  Link2,
  UploadCloud,
  Code2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderPlus,
  Flame,
  FileCode2,
  X,
  FileUp,
  Globe,
  PenTool,
  CheckSquare,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/admin/ui/tabs";
import { Separator } from "@/components/admin/ui/separator";
import { toast } from "sonner";
import { MOCK_DOMAINS_LIST, MOCK_ROLES_LIST } from "@/mock/adminQuestionsMock";
import { DEFAULT_RUBRIC_CRITERIA } from "@/services/catalogApi";
export interface GeneratedQuestionItem {
  id: string;
  question_text: string;
  question_type: "technical" | "situational" | "behavioral";
  difficulty: number;
  intent: string;
  situation_guide: string;
  task_guide: string;
  action_guide: string;
  result_guide: string;
  sample_answer: string;
  follow_up_questions: string[];
  tips: string[];
  tags: string[];
  is_active: boolean;
  status: "approved" | "pending" | "needs_edit";
}
export interface DomainSuggestionConfig {
  chipsTitle: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  defaultSkills: string;
  skillChips: string[];
  promptPlaceholder: string;
  promptSuggestions: string[];
}

export const DOMAIN_SUGGESTIONS: Record<number, DomainSuggestionConfig> = {
  1: {
    chipsTitle: "Gợi ý Tech Stack công nghệ:",
    fieldLabel: "Công nghệ trọng tâm (Tech Stack) / Ngôn ngữ",
    fieldPlaceholder: "Ví dụ: Java, Spring Boot, PostgreSQL, React, Docker...",
    defaultSkills: "Java, Spring Boot, PostgreSQL, React",
    skillChips: [
      "Java, Spring Boot, PostgreSQL",
      "React, TypeScript, Next.js",
      "Python, FastAPI, Redis",
      "Node.js, Express, MongoDB",
      "DevOps, Docker, Kubernetes, CI/CD",
      ".NET Core, C#, SQL Server",
      "Flutter, Dart, Mobile App",
      "Data Engineer, Spark, Kafka",
    ],
    promptPlaceholder: "Ví dụ: Tập trung vào Java concurrency, Spring Boot Security, tối ưu hóa Hibernate N+1 và tình huống xử lý deadlock...",
    promptSuggestions: [
      "🔥 Trọng tâm tối ưu hiệu năng, Concurrency & Caching",
      "🛡️ Trọng tâm Bảo mật REST API, JWT & Authentication",
      "⚡ Kiến trúc Microservices, Clean Architecture & Design Patterns",
      "💼 Tình huống giải quyết bug Production & tư duy gỡ lỗi",
    ],
  },
  2: {
    chipsTitle: "Gợi ý Kỹ năng & Nghiệp vụ Tài chính:",
    fieldLabel: "Kỹ năng chuyên môn / Nghiệp vụ Tài chính - Ngân hàng",
    fieldPlaceholder: "Ví dụ: Mô hình tài chính, Phân tích BCTC, IFRS, Quản trị rủi ro...",
    defaultSkills: "Mô hình tài chính, Excel nâng cao, Phân tích BCTC, Quản trị rủi ro",
    skillChips: [
      "Mô hình hóa tài chính, Excel nâng cao",
      "Định giá doanh nghiệp (DCF, P/E)",
      "Quản trị rủi ro tín dụng & thanh khoản",
      "Chuẩn mực kế toán VAS & IFRS",
      "Phân tích báo cáo tài chính (BCTC)",
      "Thẩm định dự án đầu tư & NPV/IRR",
      "Kiểm toán & Soát xét nội bộ",
      "Thị trường vốn, Chứng khoán & Trái phiếu",
    ],
    promptPlaceholder: "Ví dụ: Tập trung vào kỹ năng phân tích dòng tiền âm, định giá doanh nghiệp M&A, kiểm soát rủi ro nợ xấu ngân hàng...",
    promptSuggestions: [
      "📊 Trọng tâm Thẩm định dự án đầu tư và Phân tích BCTC",
      "⚖️ Trọng tâm Quản trị rủi ro tín dụng và thanh khoản ngân hàng",
      "📈 Xử lý tình huống dòng tiền âm và tái cấu trúc vốn",
      "🏦 Tuân thủ chuẩn mực kế toán IFRS và kiểm soát thất thoát",
    ],
  },
  3: {
    chipsTitle: "Gợi ý Kỹ năng & Kênh Marketing:",
    fieldLabel: "Kỹ năng chuyên môn / Kênh tiếp thị & Công cụ Marketing",
    fieldPlaceholder: "Ví dụ: SEO, Performance Ads, Google Analytics 4, Brand Positioning...",
    defaultSkills: "SEO, Performance Ads, Google Analytics 4, Content Strategy",
    skillChips: [
      "SEO & Content Marketing",
      "Facebook Ads & Google Performance Max",
      "Chiến lược định vị thương hiệu (Brand Positioning)",
      "Tối ưu tỷ lệ chuyển đổi (CRO & Landing Page)",
      "Google Analytics 4 & Data Tracking",
      "Email Marketing & Marketing Automation",
      "KOLs & Influencer Management",
      "Social Media Growth & TikTok Video Strategy",
    ],
    promptPlaceholder: "Ví dụ: Tập trung vào xử lý khủng hoảng truyền thông viral, tối ưu chi phí CPA tăng vọt, chiến lược SEO Topic Cluster...",
    promptSuggestions: [
      "🎯 Tối ưu chi phí CPA, ROAS và chiến dịch Performance Marketing",
      "🚀 Xử lý khủng hoảng truyền thông thương hiệu trên mạng xã hội",
      "🔍 Chiến lược SEO cụm chủ đề (Topic Cluster) và giữ chân người dùng",
      "💡 Lập kế hoạch ra mắt sản phẩm mới (Go-To-Market Strategy)",
    ],
  },
  4: {
    chipsTitle: "Gợi ý Kỹ năng & Phương pháp Bán hàng:",
    fieldLabel: "Kỹ năng bán hàng / Phương pháp đàm phán & Công cụ CRM",
    fieldPlaceholder: "Ví dụ: B2B Solution Selling, Đàm phán giá, CRM HubSpot, Sales Pipeline...",
    defaultSkills: "B2B Solution Selling, Đàm phán giá, CRM HubSpot, Sales Pipeline",
    skillChips: [
      "B2B Solution Selling & SPIN Selling",
      "Đàm phán & Chốt hợp đồng lớn (Enterprise Deal)",
      "Quản lý phễu bán hàng (Sales Pipeline)",
      "Hệ thống CRM (Salesforce, HubSpot)",
      "Kỹ năng xử lý phản đối về giá và đối thủ",
      "Khai phá khách hàng tiềm năng (Outbound Prospecting)",
      "Phát triển thị trường & Đối tác chiến lược",
      "Kỹ năng gia hạn hợp đồng & Up-selling",
    ],
    promptPlaceholder: "Ví dụ: Tập trung vào tình huống khách hàng chê giá đắt gấp đôi đối thủ, khôi phục doanh số khi thị trường suy giảm...",
    promptSuggestions: [
      "🤝 Tình huống xử lý từ chối giá đắt và đàm phán hợp đồng lớn",
      "💼 Chiến lược chốt deal với khách hàng doanh nghiệp B2B khó tính",
      "📈 Vực dậy doanh số khi thị trường suy giảm và đối thủ cạnh tranh gay gắt",
      "🎯 Quản lý phễu bán hàng và tối ưu tỷ lệ chuyển đổi Lead-to-Win",
    ],
  },
  5: {
    chipsTitle: "Gợi ý Kỹ năng & Phương pháp Sản phẩm:",
    fieldLabel: "Kỹ năng sản phẩm / Phương pháp quản trị & Công cụ thiết kế",
    fieldPlaceholder: "Ví dụ: Product Discovery, Figma, Agile/Scrum, A/B Testing, PRD...",
    defaultSkills: "Product Discovery, Figma, Agile/Scrum, A/B Testing, User Stories",
    skillChips: [
      "Product Discovery & User Journey Mapping",
      "Figma, Wireframing & Prototyping",
      "Design System & UI/UX Principles",
      "Scrum, Agile & Sprint Planning",
      "Đo lường chỉ số sản phẩm (Retention, Churn, NPS)",
      "Thử nghiệm A/B Testing & Data-driven Product",
      "Viết PRD & User Stories chuẩn hóa",
      "Product Roadmap & Prioritization (RICE/MoSCoW)",
    ],
    promptPlaceholder: "Ví dụ: Tập trung vào quy trình ưu tiên tính năng theo RICE framework, giải quyết xung đột ý kiến giữa Designer và Tech Lead...",
    promptSuggestions: [
      "📱 Quy trình ra quyết định ưu tiên tính năng (Feature Prioritization)",
      "🧪 Thiết kế thử nghiệm A/B Testing giải quyết sụt giảm Conversion Rate",
      "🎨 Xây dựng Design System đồng nhất và tối ưu trải nghiệm người dùng",
      "⏱️ Quản lý xung đột giữa Business, Design và Đội ngũ Kỹ thuật",
    ],
  },
  6: {
    chipsTitle: "Gợi ý Kỹ năng & Nghiệp vụ Nhân sự:",
    fieldLabel: "Kỹ năng nhân sự / Luật lao động & Hệ thống quản trị HR",
    fieldPlaceholder: "Ví dụ: Tuyển dụng Headhunting, C&B, Luật Lao động, KPI/OKRs...",
    defaultSkills: "Tuyển dụng nhân tài, C&B, Luật Lao động, Đào tạo L&D",
    skillChips: [
      "Headhunting & Tuyển dụng nhân sự chủ chốt",
      "Xây dựng hệ thống lương thưởng & Phúc lợi (C&B)",
      "Luật Lao động Việt Nam & Tuân thủ pháp chế",
      "Thiết lập khung năng lực, KPI & OKRs",
      "Đào tạo & Phát triển nhân tài (L&D)",
      "Văn hóa doanh nghiệp & Gắn kết nhân viên (Engagement)",
      "Đánh giá hiệu suất nhân sự (360 Degree Review)",
      "Xử lý kỷ luật & Tranh chấp lao động",
    ],
    promptPlaceholder: "Ví dụ: Tập trung vào tình huống săn Tech Lead trong thời gian gấp, giải quyết tranh chấp sa thải nhân viên đúng luật...",
    promptSuggestions: [
      "👥 Chiến lược săn nhân sự chủ chốt (Tech Lead/C-level) trong thời gian ngắn",
      "⚖️ Xử lý tranh chấp lao động và sa thải nhân sự đúng luật",
      "🌱 Xây dựng chính sách lương thưởng C&B cạnh tranh và giữ chân nhân tài",
      "🏢 Thúc đẩy văn hóa gắn kết khi nhân viên làm việc Hybrid/Remote",
    ],
  },
};

// AI Agent intelligent generator factory
function generateQuestionsByAgent({
  domainId = 1,
  domainName,
  roleName,
  level,
  techStack,
  questionDistribution,
  questionCount,
  customPrompt,
  sourceType,
  sourceValue,
}: {
  domainId?: number;
  domainName: string;
  roleName: string;
  level: string;
  techStack: string;
  questionDistribution: string;
  questionCount: number;
  customPrompt: string;
  sourceType: "prompt" | "document" | "url";
  sourceValue?: string;
}): GeneratedQuestionItem[] {
  const isJava = techStack.toLowerCase().includes("java") || roleName.toLowerCase().includes("backend");
  const isFrontend = techStack.toLowerCase().includes("react") || roleName.toLowerCase().includes("frontend");
  const isFresher = level === "fresher" || level === "intern";
  const isSenior = level === "senior" || level === "lead";

  const generated: GeneratedQuestionItem[] = [];

  // Question 1: Core Technical
  generated.push({
    id: "gen-1",
    question_text: isJava
      ? isFresher
        ? `Trong Java Spring Boot, bạn hiểu cơ chế Dependency Injection (DI) và Inversion of Control (IoC) hoạt động như thế nào? Phân biệt Bean Scope Singleton và Prototype?`
        : `Làm thế nào để thiết kế một hệ thống xử lý giao dịch phân tán (Distributed Transaction) trong Spring Boot Microservices với Saga Pattern?`
      : isFrontend
      ? `Trong React / Next.js, cơ chế Virtual DOM và Reconciliation hoạt động ra sao? Khi nào bạn nên sử dụng useMemo và useCallback để tránh lãng phí hiệu năng?`
      : `Hãy giải thích kiến trúc phân lớp (Layered Architecture) và các nguyên lý SOLID trong việc xây dựng ứng dụng với ${techStack}?`,
    question_type: "technical",
    difficulty: isFresher ? 2 : isSenior ? 5 : 3,
    intent: `Đánh giá kiến thức nền tảng vững chắc về ${techStack}, cơ chế vận hành bên dưới và tư duy thiết kế mã nguồn chuẩn mực.`,
    situation_guide: `Mô tả một chức năng hoặc module trong dự án đòi hỏi áp dụng ${techStack} theo tiêu chuẩn doanh nghiệp.`,
    task_guide: `Làm rõ yêu cầu kỹ thuật cần đạt: Tối ưu bộ nhớ, mã nguồn dễ mở rộng và kiểm thử đơn vị.`,
    action_guide: `Trình bày chi tiết cú pháp, thư viện sử dụng, cách cấu hình và những lỗi thường gặp cần tránh.`,
    result_guide: `Đo lường hiệu quả: Hệ thống chạy ổn định, code đạt chuẩn Clean Code và pass 100% unit tests.`,
    sample_answer: isJava
      ? `IoC là nguyên lý chuyển giao quyền khởi tạo và quản lý vòng đời đối tượng cho Spring Container thay vì dùng từ khóa 'new' thủ công. DI là mẫu thiết kế cụ thể thực hiện IoC, thường qua Constructor Injection để đảm bảo tính bất biến (Immutability). Singleton scope chỉ tạo 1 instance duy nhất trên toàn container, trong khi Prototype tạo instance mới mỗi lần được inject.`
      : `Virtual DOM là một bản sao nhẹ bằng JavaScript object của Real DOM. Khi state thay đổi, React chạy thuật toán Diffing để so sánh Virtual DOM mới và cũ, sau đó chỉ cập nhật đúng các node thay đổi lên Real DOM. useMemo ghi nhớ kết quả tính toán tốn kém, useCallback ghi nhớ tham chiếu hàm để tránh re-render component con.`,
    follow_up_questions: [
      `Tại sao Spring khuyến nghị Constructor Injection thay vì Field Injection (@Autowired trên thuộc tính)?`,
      `Nếu có hai Bean cùng implement một Interface, bạn làm thế nào để chỉ định Bean mong muốn?`,
    ],
    tips: [
      `Trình bày bản chất vấn đề trước, sau đó đưa ra ví dụ mã nguồn thực tế.`,
      `Nêu rõ ưu nhược điểm và thời điểm nên áp dụng.`,
    ],
    tags: [techStack.split(",")[0] || "Core Tech", "Architecture", "Interview"],
    is_active: true,
    status: "approved",
  });

  // Question 2: Database / Performance
  generated.push({
    id: "gen-2",
    question_text: `Khi làm việc với cơ sở dữ liệu trong dự án ${techStack}, bạn xử lý bài toán tối ưu truy vấn chậm (Slow Queries) và lỗi 'N+1 queries' như thế nào?`,
    question_type: "technical",
    difficulty: isFresher ? 2 : isSenior ? 4 : 3,
    intent: `Khảo sát năng lực làm việc với Database, ORM (JPA/Hibernate/Prisma) và kỹ năng profiling cơ sở dữ liệu.`,
    situation_guide: `Hệ thống gặp hiện tượng phản hồi chậm khi danh sách bản ghi tăng lên hàng chục nghìn dòng.`,
    task_guide: `Giảm thời gian phản hồi của API từ vài giây xuống dưới 200ms.`,
    action_guide: `Sử dụng EXPLAIN ANALYZE, bổ sung Index phù hợp, áp dụng JOIN FETCH hoặc Batch Fetching để loại bỏ N+1 query.`,
    result_guide: `Số lượng truy vấn gửi tới DB giảm 90%, thời gian xử lý API giảm 80%.`,
    sample_answer: `Lỗi N+1 xảy ra khi lấy 1 danh sách cha rồi với mỗi bản ghi lại thực hiện thêm 1 query phụ để lấy dữ liệu con. Tôi dùng JOIN FETCH trong JPQL hoặc EntityGraph để gom thành 1 query duy nhất. Đối với câu query chậm, tôi chạy EXPLAIN ANALYZE để xem execution plan và tạo Composite Index cho các trường thường xuất hiện trong mệnh đề WHERE và ORDER BY.`,
    follow_up_questions: [
      `Chỉ số B-Tree Index khác gì với Hash Index? Khi nào Index không được sử dụng dù đã tạo?`,
      `Làm sao để cấu hình Connection Pool (HikariCP) tối ưu trong môi trường Production?`,
    ],
    tips: [
      `Nêu rõ công cụ profiling bạn từng dùng (pgAdmin, MySQL Workbench, Hibernate SQL show).`,
    ],
    tags: ["Database", "Optimization", "SQL", "Performance"],
    is_active: true,
    status: "approved",
  });

  // Question 3: Situational / Problem Solving
  generated.push({
    id: "gen-3",
    question_text: `Giả sử sau khi deploy phiên bản mới của hệ thống ${techStack}, CPU của server tăng vọt lên 100% và API liên tục trả về mã lỗi 504 Gateway Timeout. Bạn sẽ tiến hành các bước điều tra và khắc phục như thế nào?`,
    question_type: "situational",
    difficulty: isSenior ? 5 : 4,
    intent: `Đánh giá sự bình tĩnh, kỹ năng phân tích log, sử dụng công cụ giám sát (APM) và quy trình ứng cứu sự cố Production.`,
    situation_guide: `Sự cố nghiêm trọng xảy ra ngay sau đợt phát hành tính năng mới, khách hàng không truy cập được.`,
    task_guide: `Nhanh chóng khôi phục dịch vụ cho người dùng và xác định nguyên nhân gốc rễ (Root Cause).`,
    action_guide: `Bước 1: Rollback phiên bản ngay lập tức nếu ảnh hưởng diện rộng. Bước 2: Thu thập Thread Dump và Heap Dump. Bước 3: Phân tích các thread ở trạng thái BLOCKED hoặc vòng lặp vô tận.`,
    result_guide: `Dịch vụ phục hồi trong vòng 15 phút, sau đó tổ chức buổi Post-Mortem và bổ sung bài stress test vào CI/CD.`,
    sample_answer: `Ưu tiên cao nhất là bảo vệ người dùng: Tôi sẽ kích hoạt quy trình Rollback về phiên bản ổn định trước đó nếu lỗi ảnh hưởng toàn bộ traffic. Trước khi rollback, tôi chụp nhanh Thread Dump (jstack) và CPU profiling để giữ bằng chứng. Sau khi hệ thống ổn định, tôi phân tích thread dump để tìm thread đang chiếm CPU cao, thường do vòng lặp while không có điểm dừng hoặc deadlock giữa các connection.`,
    follow_up_questions: [
      `Làm thế nào để phân biệt giữa lỗi rò rỉ bộ nhớ (Memory Leak) và lỗi CPU spike trong hệ thống?`,
      `Bạn xây dựng chính sách Healthcheck và Circuit Breaker như thế nào để hệ thống tự phục hồi?`,
    ],
    tips: [
      `Luôn nhấn mạnh thứ tự ưu tiên: Phục hồi dịch vụ trước -> Điều tra nguyên nhân -> Phòng ngừa dài hạn.`,
    ],
    tags: ["Incident Response", "Debugging", "Production", "Reliability"],
    is_active: true,
    status: "approved",
  });

  // Question 4: Behavioral (STAR)
  if (questionCount >= 4) {
    generated.push({
      id: "gen-4",
      question_text: `Hãy chia sẻ về một lần bạn gặp bất đồng ý kiến về giải pháp kỹ thuật với đồng nghiệp hoặc Tech Lead khi cùng phát triển dự án ${techStack}. Bạn đã giải quyết như thế nào?`,
      question_type: "behavioral",
      difficulty: 3,
      intent: `Đo lường kỹ năng giao tiếp, thái độ hợp tác chuyên nghiệp và khả năng bảo vệ quan điểm bằng số liệu khách quan.`,
      situation_guide: `Hai kỹ sư có quan điểm trái ngược nhau về việc chọn thư viện, kiến trúc hoặc cách tổ chức code.`,
      task_guide: `Đạt được sự đồng thuận chung của cả nhóm mà không làm chậm tiến độ dự án.`,
      action_guide: `Tạo một bản PoC nhỏ đo lường thực tế, so sánh ưu nhược điểm khách quan và tôn trọng quyết định của tập thể.`,
      result_guide: `Nhóm thống nhất được giải pháp tối ưu nhất, dự án kịp deadline và mối quan hệ đồng nghiệp được củng cố.`,
      sample_answer: `Trong dự án trước, tôi và một bạn Senior có bất đồng về việc có nên chuyển từ REST sang GraphQL cho mobile client. Thay vì tranh luận lý thuyết, tôi đã dựng một bản PoC thử nghiệm trên 2 API phức tạp nhất và đo lường kích thước payload. Kết quả chứng minh GraphQL giảm 45% lượng dữ liệu tải qua mạng 4G. Sau khi xem số liệu thực tế, cả nhóm đã đồng thuận áp dụng GraphQL cho màn hình chính.`,
      follow_up_questions: [
        `Nếu sau khi bạn đưa ra số liệu mà Lead vẫn kiên quyết từ chối, bạn sẽ phản ứng thế nào?`,
      ],
      tips: [
        `Tránh đổ lỗi cho đối phương; tập trung vào tinh thần học hỏi và lợi ích chung của dự án.`,
      ],
      tags: ["Behavioral", "Teamwork", "Soft Skills", "Conflict Resolution"],
      is_active: true,
      status: "approved",
    });
  }

  // Question 5: Code Quality & Testing
  if (questionCount >= 5) {
    generated.push({
      id: "gen-5",
      question_text: `Chiến lược viết Unit Test và Integration Test của bạn cho một dự án ${techStack} như thế nào để đảm bảo code coverage trên 80% mà không gây chậm tiến độ phát triển?`,
      question_type: "technical",
      difficulty: isFresher ? 2 : 3,
      intent: `Khảo sát tư duy kiểm thử phần mềm, áp dụng Test Pyramid, sử dụng Mock framework và tích hợp vào CI/CD pipeline.`,
      situation_guide: `Dự án mở rộng nhanh nhưng thường xuyên phát sinh lỗi hồi quy (Regression Bugs) khi merge code.`,
      task_guide: `Thiết lập thói quen viết test tự động và chuẩn hóa quy trình kiểm thử trước khi deploy.`,
      action_guide: `Áp dụng Kim tự tháp kiểm thử: Nhiều Unit Test (JUnit/Jest), vừa phải Integration Test (Testcontainers/Supertest) và ít E2E Test. Mock các phụ thuộc bên ngoài.`,
      result_guide: `Tỉ lệ bug lọt lên Staging giảm 60%, thời gian chạy test trên CI/CD dưới 5 phút.`,
      sample_answer: `Tôi tuân thủ mô hình Kim tự tháp kiểm thử: Tập trung 70% vào Unit Test kiểm tra logic nghiệp vụ thuần túy vì chúng chạy rất nhanh và không phụ thuộc network. 20% cho Integration Test kiểm tra việc tương tác với DB bằng Testcontainers. 10% còn lại cho Smoke E2E test. Tôi kết hợp JaCoCo để theo dõi độ bao phủ kiểm thử trong pipeline.`,
      follow_up_questions: [
        `Sự khác nhau giữa Mock, Stub và Spy trong kiểm thử phần mềm là gì?`,
      ],
      tips: [
        `Nhấn mạnh: Test tốt là test kiểm tra hành vi (Behavior) chứ không phải kiểm tra tiểu tiết cài đặt (Implementation details).`,
      ],
      tags: ["Testing", "CI/CD", "Unit Test", "Quality"],
      is_active: true,
      status: "approved",
    });
  }

  return generated.slice(0, questionCount);
}
export function QuestionCreateForm() {
  const router = useRouter();
  // Mode Selection: "ai_agent", "bank_picker" or "manual"
  const [activeMainTab, setActiveMainTab] = useState<"ai_agent" | "bank_picker" | "manual">("ai_agent");
  // Bank Picker State (Bốc từ ngân hàng câu hỏi có sẵn)
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [isLoadingBankQuestions, setIsLoadingBankQuestions] = useState<boolean>(false);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<any[]>([]);
  const [bankSearch, setBankSearch] = useState<string>("");
  const [bankDomainFilter, setBankDomainFilter] = useState<string>("all");
  const [bankLevelFilter, setBankLevelFilter] = useState<string>("all");
  const [bankTypeFilter, setBankTypeFilter] = useState<string>("all");
  React.useEffect(() => {
    async function loadBank() {
      setIsLoadingBankQuestions(true);
      try {
        const res = await questionAdminApi.getQuestions({ limit: 100 });
        if (res && Array.isArray(res.items)) {
          setBankQuestions(res.items);
        }
      } catch (err) {
        console.warn("Failed to load bank questions:", err);
      } finally {
        setIsLoadingBankQuestions(false);
      }
    }
    loadBank();
  }, []);

  const toggleBankQuestionSelection = (q: any) => {
    const isSelected = selectedBankQuestions.some((it) => it.question_id === q.question_id);
    if (isSelected) {
      setSelectedBankQuestions((prev) => prev.filter((it) => it.question_id !== q.question_id));
    } else {
      setSelectedBankQuestions((prev) => [...prev, q]);
    }
  };

  const removeSelectedBankQuestion = (questionId: number) => {
    setSelectedBankQuestions((prev) => prev.filter((it) => it.question_id !== questionId));
  };

  const clearAllSelectedBankQuestions = () => {
    setSelectedBankQuestions([]);
  };

  const pickAllVisibleBankQuestions = () => {
    const existingIds = new Set(selectedBankQuestions.map((q) => q.question_id));
    const newItems = filteredBankQuestions.filter((q) => !existingIds.has(q.question_id));
    setSelectedBankQuestions((prev) => [...prev, ...newItems]);
  };

  const [domainId, setDomainId] = useState<number>(1);
  const currentDomainConfig = DOMAIN_SUGGESTIONS[domainId] || DOMAIN_SUGGESTIONS[1];
  const [roleId, setRoleId] = useState<number>(1);
  const [level, setLevel] = useState<string>("fresher");
  const [language, setLanguage] = useState<string>("vi");
  const [techStack, setTechStack] = useState<string>("Java, Spring Boot, PostgreSQL, React");
  const [questionDistribution, setQuestionDistribution] = useState<string>("mixed");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [targetDifficulty, setTargetDifficulty] = useState<string>("auto");
  // Tab 2: AI Agent Generator State
  const [sourceType, setSourceType] = useState<"prompt" | "document" | "url">("prompt");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [extractedDocText, setExtractedDocText] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isAgentGenerating, setIsAgentGenerating] = useState<boolean>(false);
  const [agentStep, setAgentStep] = useState<string>("");
  // AI Agent Review Board State
  const [aiQuestions, setAiQuestions] = useState<GeneratedQuestionItem[]>(() =>
    generateQuestionsByAgent({
      domainName: "Công nghệ thông tin (IT)",
      roleName: "Backend Engineer",
      level: "fresher",
      techStack: "Java, Spring Boot, PostgreSQL, React",
      questionDistribution: "mixed",
      questionCount: 5,
      customPrompt: "",
      sourceType: "prompt",
    })
  );
  const [expandedId, setExpandedId] = useState<string>("gen-1");
  const [editingId, setEditingId] = useState<string | null>(null);
  // Tab 1: Manual Creator State
  const [manualSetName, setManualSetName] = useState<string>(
    "Bộ đề phỏng vấn Full Stack Java - Fresher (Tự soạn)"
  );
  const [manualQuestions, setManualQuestions] = useState<GeneratedQuestionItem[]>([
    {
      id: "man-1",
      question_text: "Hãy trình bày về vòng đời của một Bean trong Spring Boot và các annotation phổ biến?",
      question_type: "technical",
      difficulty: 2,
      intent: "Kiểm tra kiến thức Spring Core căn bản.",
      situation_guide: "Ứng dụng cần khởi tạo các tài nguyên DB khi khởi động.",
      task_guide: "Sử dụng @PostConstruct hoặc CommandLineRunner.",
      action_guide: "Cấu hình lifecycle callbacks.",
      result_guide: "Khởi tạo thành công không gây crash server.",
      sample_answer: "Vòng đời Bean gồm các bước: Khởi tạo instance -> Tiêm phụ thuộc (Dependency Injection) -> BeanPostProcessor -> @PostConstruct -> Sẵn sàng phục vụ -> @PreDestroy khi container đóng.",
      follow_up_questions: ["Phân biệt @Component, @Service và @Repository?"],
      tips: ["Vẽ sơ đồ luồng trong đầu trước khi nói."],
      tags: ["Spring Boot", "Java", "Core"],
      is_active: true,
      status: "approved",
    },
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // Filtered bank questions for picker
  const filteredBankQuestions = useMemo(() => {
    return bankQuestions.filter((q) => {
      if (bankSearch.trim()) {
        const kw = bankSearch.trim().toLowerCase();
        const inText = (q.question_text || "").toLowerCase().includes(kw);
        const inRole = (q.role_name || "").toLowerCase().includes(kw);
        const inDomain = (q.domain_name || "").toLowerCase().includes(kw);
        if (!inText && !inRole && !inDomain) return false;
      }
      if (bankDomainFilter !== "all" && String(q.domain_id) !== bankDomainFilter) {
        return false;
      }
      if (bankLevelFilter !== "all" && q.experience_level !== bankLevelFilter) {
        return false;
      }
      if (bankTypeFilter !== "all" && q.question_type !== bankTypeFilter) {
        return false;
      }
      return true;
    });
  }, [bankQuestions, bankSearch, bankDomainFilter, bankLevelFilter, bankTypeFilter]);

  const availableRoles = useMemo(() => {
    return MOCK_ROLES_LIST.filter((r) => r.domain_id === domainId);
  }, [domainId]);
  const currentDomainName =
    MOCK_DOMAINS_LIST.find((d) => d.domain_id === domainId)?.domain_name || "Công nghệ thông tin (IT)";
  const currentRoleName =
    MOCK_ROLES_LIST.find((r) => r.role_id === roleId)?.role_name || "Backend Engineer";
  // Simulate Document Upload
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      setExtractedDocText(
        `[Đã bóc tách từ ${file.name}]: Tuyển dụng vị trí ${currentRoleName} (${level.toUpperCase()}). Yêu cầu: Nắm chắc ${techStack}, kiến trúc Microservices, Clean Architecture, tối ưu hóa Database, có kinh nghiệm xử lý sự cố Production.`
      );
      toast.success(`Đã tải lên và bóc tách tài liệu: ${file.name}`);
    }
  };

  // Simulate URL Fetch
  const handleSimulateUrlFetch = () => {
    if (!inputUrl.trim()) {
      toast.error("Vui lòng nhập đường link hợp lệ");
      return;
    }
    toast.info("AI Agent đang kết nối và đọc nội dung từ trang web...");
    setTimeout(() => {
      toast.success("Đã phân tích nội dung từ URL thành công! Sẵn sàng sinh bộ câu hỏi.");
    }, 800);
  };

  const handleRunAgent = () => {
    setIsAgentGenerating(true);
    setAgentStep(
      sourceType === "document"
        ? `Bóc tách tài liệu ${uploadedFileName || "văn bản"} & phân tích yêu cầu...`
        : sourceType === "url"
        ? `Thu thập dữ liệu từ ${inputUrl || "đường link"} & nhận diện chủ đề...`
        : `Phân tích yêu cầu chân dung ${currentRoleName} - ${level.toUpperCase()}...`
    );

    setTimeout(() => {
      setAgentStep("Soạn thảo bộ câu hỏi theo chuẩn STAR & phân bổ tỷ lệ...");
    }, 700);

    setTimeout(() => {
      setAgentStep("Thiết lập tiêu chí Rubric AI & Đáp án mẫu Benchmark...");
    }, 1400);

    setTimeout(() => {
      const generated = generateQuestionsByAgent({
        domainName: currentDomainName,
        roleName: currentRoleName,
        level,
        techStack,
        questionDistribution,
        questionCount,
        customPrompt:
          sourceType === "document"
            ? extractedDocText
            : sourceType === "url"
            ? `Nguồn URL: ${inputUrl}. ${customPrompt}`
            : customPrompt,
        sourceType,
      });

      setAiQuestions(generated);
      setExpandedId(generated[0]?.id || "");
      setIsAgentGenerating(false);
      setAgentStep("");
      toast.success(
        `AI Agent đã tạo xong ${generated.length} câu hỏi phỏng vấn! Vui lòng kiểm duyệt.`
      );
    }, 2100);
  };

  // Approve single question
  const handleApproveOne = (qId: string) => {
    setAiQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, status: "approved" as const } : q))
    );
    toast.success("Đã phê duyệt câu hỏi.");
  };

  // Regenerate single question with AI
  const handleRegenerateOne = (qId: string) => {
    toast.info("AI Agent đang tạo lại câu hỏi...");
    setTimeout(() => {
      setAiQuestions((prev) =>
        prev.map((q) => {
          if (q.id === qId) {
            return {
              ...q,
              question_text: `[Tạo mới bởi AI] Làm thế nào để áp dụng nguyên lý Clean Architecture và Unit Testing hiệu quả trong dự án ${techStack}?`,
              intent: `Đánh giá tư duy viết mã sạch, phân tách tầng trách nhiệm và tính mở rộng của hệ thống.`,
              sample_answer: `Tôi tổ chức mã nguồn theo 4 tầng: Domain (Entities, Value Objects), Application (Use Cases), Infrastructure (Adapters, DB, Mail) và Presentation (API, Controllers). Tầng Domain hoàn toàn độc lập với framework bên ngoài.`,
              status: "approved",
            };
          }
          return q;
        })
      );
      toast.success("Đã tạo mới câu hỏi thành công!");
    }, 800);
  };

  // Delete question from set
  const handleDeleteQuestion = (qId: string, isManual = false) => {
    if (isManual) {
      if (manualQuestions.length <= 1) {
        toast.error("Bộ câu hỏi phải có tối thiểu 1 câu hỏi.");
        return;
      }
      setManualQuestions((prev) => prev.filter((q) => q.id !== qId));
    } else {
      if (aiQuestions.length <= 1) {
        toast.error("Bộ câu hỏi phải có tối thiểu 1 câu hỏi.");
        return;
      }
      setAiQuestions((prev) => prev.filter((q) => q.id !== qId));
    }
    toast.success("Đã xóa câu hỏi khỏi bộ đề.");
  };

  // Add manual question
  const handleAddManualItem = () => {
    const newId = `man-${Date.now()}`;
    const newQ: GeneratedQuestionItem = {
      id: newId,
      question_text: "Nhập nội dung câu hỏi phỏng vấn mới...",
      question_type: "technical",
      difficulty: 3,
      intent: "Mục tiêu đánh giá năng lực...",
      situation_guide: "Bối cảnh tình huống...",
      task_guide: "Nhiệm vụ cần giải quyết...",
      action_guide: "Hành động kỹ thuật...",
      result_guide: "Kết quả đo lường...",
      sample_answer: "Câu trả lời mẫu...",
      follow_up_questions: ["Câu hỏi đào sâu..."],
      tips: ["Mẹo phỏng vấn..."],
      tags: ["Chuyên môn", "Mới tạo"],
      is_active: true,
      status: "approved",
    };
    setManualQuestions((prev) => [...prev, newQ]);
    toast.success("Đã thêm 1 câu hỏi mới.");
  };

  // Save full set to Real Database
  const handleSaveSet = async (publish = true) => {
    setIsSaving(true);
    let createdIds: number[] = [];

    try {
      if (activeMainTab === "bank_picker") {
        if (selectedBankQuestions.length === 0) {
          toast.error("Vui lòng bốc ít nhất 1 câu hỏi từ ngân hàng câu hỏi vào bộ đề!");
          setIsSaving(false);
          return;
        }
        createdIds = selectedBankQuestions.map((q) => q.question_id);
      } else {
        const questionsToSave = activeMainTab === "ai_agent" ? aiQuestions : manualQuestions;
        if (questionsToSave.length === 0) {
          toast.error("Bộ đề phải có ít nhất 1 câu hỏi");
          setIsSaving(false);
          return;
        }

        // 1. Create each question in question_bank
        for (const q of questionsToSave) {
          try {
            const res = await questionAdminApi.createQuestion({
              domain_id: domainId,
              role_id: roleId,
              experience_level: level,
              question_type: (q.question_type as any) || "behavioral",
              language: (language as any) || "vi",
              question_text: q.question_text,
              sample_answer: q.sample_answer,
              follow_up_questions: q.follow_up_questions,
              tips: q.tips,
            });
            if (res && res.question_id) {
              createdIds.push(res.question_id);
            }
          } catch (e) {
            console.warn("Error creating question item in set:", e);
          }
        }
      }

      // 2. Create the QuestionSet in database
      const tagsList = techStack
        ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Chuyên môn"];

      const domainName = MOCK_DOMAINS_LIST.find((d) => d.domain_id === domainId)?.domain_name || "Chuyên ngành";
      const roleName = MOCK_ROLES_LIST.find((r) => r.role_id === roleId)?.role_name || "Vị trí";

      const title =
        activeMainTab === "manual" && manualSetName.trim()
          ? manualSetName.trim()
          : activeMainTab === "bank_picker"
          ? `Bộ đề tuyển chọn ${roleName} - ${level.toUpperCase()} (${createdIds.length} câu hỏi)`
          : `Bộ đề phỏng vấn ${roleName} - ${level.toUpperCase()} (${techStack.split(",")[0]?.trim() || "Chuyên ngành"})`;

      await questionAdminApi.createQuestionSet({
        title,
        description: `Bộ đề tuyển dụng chuẩn hóa gồm ${createdIds.length} câu hỏi theo cấu trúc STAR và thang đo Rubric AI.`,
        domain_id: domainId,
        role_id: roleId,
        experience_level: level,
        tech_stack: tagsList,
        language,
        target_difficulty: targetDifficulty === "auto" ? 3 : Number(targetDifficulty) || 3,
        estimated_duration_minutes: Math.max(15, createdIds.length * 6),
        is_curated: true,
        is_active: publish,
        question_ids: createdIds,
      });

      toast.success(
        publish
          ? `Đã lưu và xuất bản bộ đề (${createdIds.length} câu hỏi) vào cơ sở dữ liệu thành công!`
          : `Đã lưu bản nháp bộ đề (${createdIds.length} câu hỏi).`
      );
      router.push("/admin/questions");
    } catch (err: any) {
      toast.error(`Lưu bộ đề thất bại: ${err.message || "Lỗi server"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const publishCount =
    activeMainTab === "ai_agent"
      ? aiQuestions.length
      : activeMainTab === "bank_picker"
      ? selectedBankQuestions.length
      : manualQuestions.length;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ngân hàng câu hỏi</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-semibold text-primary">Tạo bộ câu hỏi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tạo Bộ Câu Hỏi Phỏng Vấn Chuyên Môn
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tạo bộ đề theo ngành nghề, vị trí, công nghệ và cấp độ kinh nghiệm bằng AI Agent, bốc từ kho câu hỏi hoặc tự soạn thủ công.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSaveSet(false)}
            disabled={isSaving || isAgentGenerating}
            className="h-9 gap-1.5 text-xs"
          >
            <Save className="size-3.5" />
            <span>Lưu bản nháp</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveSet(true)}
            disabled={isSaving || isAgentGenerating}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <Send className="size-3.5" />
            <span>
              {isSaving ? "Đang lưu..." : `Lưu & Xuất Bản ${publishCount} Câu Hỏi`}
            </span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: Cấu hình Tiêu chí & Công nghệ Mục tiêu (Target Profile & Tech Stack) - Sắp xếp chỉn chu */}
      <Card className="shadow-xs border-muted/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                1. Thiết Lập Tiêu Chí Vị Trí & Công Nghệ Trọng Tâm
              </CardTitle>
              <CardDescription className="text-xs">
                Định hình đối tượng phỏng vấn chuẩn xác để áp dụng cho cả tạo thủ công lẫn AI Agent.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Bắt buộc
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: 4 Balanced Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Domain */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Ngành nghề tuyển dụng</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select
                value={String(domainId)}
                onValueChange={(v) => {
                  const dId = Number(v);
                  setDomainId(dId);
                  const firstRole = MOCK_ROLES_LIST.find((r) => r.domain_id === dId);
                  const newRoleName = firstRole?.role_name || "Chuyên ngành";
                  if (firstRole) setRoleId(firstRole.role_id);
                  const newCfg = DOMAIN_SUGGESTIONS[dId] || DOMAIN_SUGGESTIONS[1];
                  setTechStack(newCfg.defaultSkills);
                  setManualSetName(`Bộ đề phỏng vấn ${newRoleName} - ${level.toUpperCase()} (Tự soạn)`);
                  const domainObj = MOCK_DOMAINS_LIST.find((d) => d.domain_id === dId);
                  setAiQuestions(
                    generateQuestionsByAgent({
                      domainId: dId,
                      domainName: domainObj?.domain_name || "Chuyên ngành",
                      roleName: newRoleName,
                      level,
                      techStack: newCfg.defaultSkills,
                      questionDistribution,
                      questionCount,
                      customPrompt,
                      sourceType,
                    })
                  );
                }}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_DOMAINS_LIST.map((d) => (
                    <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                      {d.domain_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Vị trí chuyên môn</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select
                value={String(roleId)}
                onValueChange={(v) => {
                  const rId = Number(v);
                  setRoleId(rId);
                  const foundRole = MOCK_ROLES_LIST.find((r) => r.role_id === rId);
                  const newRoleName = foundRole?.role_name || "Chuyên ngành";
                  setManualSetName(`Bộ đề phỏng vấn ${newRoleName} - ${level.toUpperCase()} (Tự soạn)`);
                  const domainObj = MOCK_DOMAINS_LIST.find((d) => d.domain_id === domainId);
                  setAiQuestions(
                    generateQuestionsByAgent({
                      domainId,
                      domainName: domainObj?.domain_name || "Chuyên ngành",
                      roleName: newRoleName,
                      level,
                      techStack,
                      questionDistribution,
                      questionCount,
                      customPrompt,
                      sourceType,
                    })
                  );
                }}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.role_id} value={String(r.role_id)}>
                      {r.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Cấp độ kinh nghiệm</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern (Thực tập sinh)</SelectItem>
                  <SelectItem value="fresher">Fresher (Mới tốt nghiệp)</SelectItem>
                  <SelectItem value="junior">Junior (1 - 2 năm)</SelectItem>
                  <SelectItem value="mid">Middle (2 - 4 năm)</SelectItem>
                  <SelectItem value="senior">Senior (5+ năm)</SelectItem>
                  <SelectItem value="lead">Lead / Principal / Architect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Ngôn ngữ phỏng vấn</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt (VI)</SelectItem>
                  <SelectItem value="en">English (EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Tech Stack, Distribution, Count, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 pt-1">
            {/* Tech Stack (6 cols) */}
            <div className="lg:col-span-6 space-y-1.5">
              <Label htmlFor="tech_stack" className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>{currentDomainConfig.fieldLabel}</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Input
                id="tech_stack"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder={currentDomainConfig.fieldPlaceholder}
                className="h-9 text-xs bg-background"
              />
            </div>

            {/* Question Distribution (2 cols) */}
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Phân bổ dạng câu</Label>
              <Select value={questionDistribution} onValueChange={setQuestionDistribution}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Kết hợp (Mixed)</SelectItem>
                  <SelectItem value="technical">Kỹ thuật (Tech)</SelectItem>
                  <SelectItem value="situational">Tình huống (Situational)</SelectItem>
                  <SelectItem value="behavioral">Hành vi (Behavioral)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Count (2 cols) */}
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Số lượng câu</Label>
              <Select
                value={String(questionCount)}
                onValueChange={(v) => setQuestionCount(Number(v))}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 câu hỏi</SelectItem>
                  <SelectItem value="5">5 câu hỏi</SelectItem>
                  <SelectItem value="8">8 câu hỏi</SelectItem>
                  <SelectItem value="10">10 câu hỏi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Difficulty (2 cols) */}
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Độ khó mục tiêu</Label>
              <Select value={targetDifficulty} onValueChange={setTargetDifficulty}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Theo cấp độ ({level})</SelectItem>
                  <SelectItem value="easy">Cơ bản (1 - 2★)</SelectItem>
                  <SelectItem value="medium">Trung bình (3★)</SelectItem>
                  <SelectItem value="hard">Nâng cao (4 - 5★)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Tech Suggestion Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t text-xs">
            <span className="text-muted-foreground text-xs font-semibold shrink-0 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span>{currentDomainConfig.chipsTitle}</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {currentDomainConfig.skillChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTechStack(chip)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                    techStack === chip
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                      : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Ba Tab Lớn (AI Agent vs Bốc từ Ngân Hàng vs Thêm Tay) */}
      <Tabs
        value={activeMainTab}
        onValueChange={(v) => setActiveMainTab(v as any)}
        className="space-y-4"
      >
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="h-10 p-1 bg-muted/60">
            <TabsTrigger value="ai_agent" className="text-xs gap-2 font-semibold data-[state=active]:shadow-xs">
              <Bot className="size-4 text-primary" />
              <span>Tab 1: AI Agent Generator (Tự động)</span>
            </TabsTrigger>
            <TabsTrigger value="bank_picker" className="text-xs gap-2 font-semibold data-[state=active]:shadow-xs">
              <FolderPlus className="size-4 text-primary" />
              <span>Tab 2: Bốc Từ Ngân Hàng Câu Hỏi ({selectedBankQuestions.length} đã chọn)</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs gap-2 font-semibold data-[state=active]:shadow-xs">
              <PenTool className="size-4 text-primary" />
              <span>Tab 3: Soạn Thủ Công (Manual)</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* =========================================================
            TAB CONTENT 1: AI AGENT GENERATOR (KIỂM DUYỆT)
           ========================================================= */}
        <TabsContent value="ai_agent" className="space-y-6 m-0">
          {/* AI Generator Input Panel */}
          <Card className="shadow-xs border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                    <Bot className="size-5 text-primary" />
                    AI Question Generator Agent
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hỗ trợ 3 phương thức đầu vào: Tùy biến prompt, tải lên file tài liệu hoặc dán đường link website/JD.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  onClick={handleRunAgent}
                  disabled={isAgentGenerating}
                  className="h-9 gap-2 text-xs font-semibold shadow-sm shrink-0"
                >
                  <Sparkles className={`size-4 ${isAgentGenerating ? "animate-spin" : ""}`} />
                  <span>{isAgentGenerating ? "Agent Đang Phân Tích & Sinh..." : "Khởi Chạy AI Agent"}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 3 Source Modes Switcher */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={sourceType === "prompt" ? "default" : "outline"}
                  onClick={() => setSourceType("prompt")}
                  className="h-8 text-xs gap-1.5"
                >
                  <Lightbulb className="size-3.5" />
                  <span>1. Nhập yêu cầu tùy biến (Prompt)</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={sourceType === "document" ? "default" : "outline"}
                  onClick={() => setSourceType("document")}
                  className="h-8 text-xs gap-1.5"
                >
                  <FileUp className="size-3.5" />
                  <span>2. Tải lên tài liệu (PDF, DOCX, JD)</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={sourceType === "url" ? "default" : "outline"}
                  onClick={() => setSourceType("url")}
                  className="h-8 text-xs gap-1.5"
                >
                  <Globe className="size-3.5" />
                  <span>3. Nhập đường link (URL)</span>
                </Button>
              </div>

              {/* Source Mode 1: Custom Prompt */}
              {sourceType === "prompt" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <Label htmlFor="custom_prompt" className="text-xs font-semibold">
                      Chỉ dẫn cụ thể cho AI Agent:
                    </Label>
                    <textarea
                      id="custom_prompt"
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={currentDomainConfig.promptPlaceholder}
                      className="w-full rounded-md border border-input bg-background/90 p-2.5 text-xs leading-relaxed"
                      disabled={isAgentGenerating}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {currentDomainConfig.promptSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomPrompt(sug.replace(/^[^\s]+\s/, ""))}
                        className="px-2 py-1 rounded text-[11px] bg-background border hover:bg-muted text-muted-foreground transition-colors"
                        disabled={isAgentGenerating}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Mode 2: Document Upload */}
              {sourceType === "document" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-6 border-2 border-dashed rounded-xl bg-background/50 hover:bg-background/80 transition-colors text-center space-y-2">
                    <UploadCloud className="size-8 mx-auto text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Kéo thả file tài liệu hoặc bấm để duyệt file
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Hỗ trợ file PDF, DOCX, TXT, Markdown (Bản mô tả công việc JD, Slide kỹ thuật, Tài liệu dự án)
                      </p>
                    </div>
                    <label className="inline-block">
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs pointer-events-none">
                        Chọn file từ máy tính
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,.md"
                        onChange={handleSimulateUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadedFileName && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-emerald-600" />
                        <div>
                          <span className="font-semibold text-foreground">{uploadedFileName}</span>
                          <span className="text-muted-foreground ml-2">({uploadedFileSize})</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                        Đã bóc tách văn bản
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Source Mode 3: URL Import */}
              {sourceType === "url" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <Label htmlFor="input_url" className="text-xs font-semibold">
                      Đường link trang web / tài liệu công nghệ / bài viết:
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="input_url"
                          type="url"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="https://docs.spring.io/... hoặc link JD tuyển dụng LinkedIn, TopCV..."
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSimulateUrlFetch}
                        className="h-9 text-xs shrink-0"
                      >
                        Kết nối & Đọc
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Agent sẽ tự động trích xuất nội dung từ trang web để nhận diện các câu hỏi phỏng vấn bám sát tài liệu.
                  </p>
                </div>
              )}

              {/* Agent Progress Feedback Banner */}
              {isAgentGenerating && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 animate-in fade-in duration-200">
                  <RefreshCw className="size-4 animate-spin text-primary shrink-0" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-xs font-bold text-primary block">AI Agent đang phân tích nguồn & sinh câu hỏi:</span>
                    <span className="text-[11px] text-muted-foreground block truncate">{agentStep}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Review Board (Bảng Kiểm Duyệt Câu Hỏi Sau Khi AI Sinh) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-card shadow-xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="size-4 text-emerald-600" />
                  Bảng Kiểm Duyệt Bộ Câu Hỏi ({aiQuestions.length} câu hỏi)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Xem lại từng câu, duyệt nhanh hoặc bấm &quot;Tạo lại&quot; bằng AI cho câu cần điều chỉnh.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAiQuestions((prev) => prev.map((q) => ({ ...q, status: "approved" as const })));
                    toast.success("Đã phê duyệt tất cả câu hỏi trong bộ đề!");
                  }}
                  className="h-8 text-xs gap-1 text-emerald-600 hover:text-emerald-700"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Phê duyệt tất cả</span>
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {aiQuestions.map((q, index) => {
                const isExpanded = expandedId === q.id;
                const isEditing = editingId === q.id;

                const publishCount =
    activeMainTab === "ai_agent"
      ? aiQuestions.length
      : activeMainTab === "bank_picker"
      ? selectedBankQuestions.length
      : manualQuestions.length;

  return (
                  <Card
                    key={q.id}
                    className={`shadow-xs transition-all ${
                      isExpanded ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedId(isExpanded ? "" : q.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="size-7 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {q.question_type}
                            </Badge>

                            {q.status === "approved" ? (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                                <Check className="size-2.5 mr-1" /> Đã duyệt
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                                Chờ duyệt
                              </Badge>
                            )}

                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`size-2.5 ${
                                    s <= q.difficulty ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="font-semibold text-xs text-foreground truncate max-w-2xl">
                            {q.question_text}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {q.status !== "approved" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveOne(q.id);
                            }}
                            className="h-7 px-2 text-[11px] gap-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="size-3" />
                            <span>Duyệt</span>
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegenerateOne(q.id);
                          }}
                          className="h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          title="Yêu cầu AI tạo lại câu này"
                        >
                          <Sparkles className="size-3" />
                          <span className="hidden sm:inline">Tạo lại</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(isEditing ? null : q.id);
                            if (!isExpanded) setExpandedId(q.id);
                          }}
                          className="h-7 px-2 text-[11px] gap-1"
                        >
                          {isEditing ? "Đóng sửa" : "Sửa"}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(q.id, false);
                          }}
                          className="size-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>

                        <div className="text-muted-foreground ml-1">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t text-xs">
                        <div className="space-y-1.5 pt-3">
                          <Label className="text-xs font-semibold">Nội dung câu hỏi phỏng vấn:</Label>
                          {isEditing ? (
                            <textarea
                              rows={3}
                              value={q.question_text}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAiQuestions((prev) =>
                                  prev.map((item) => (item.id === q.id ? { ...item, question_text: val } : item))
                                );
                              }}
                              className="w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed"
                            />
                          ) : (
                            <p className="p-3 rounded-xl bg-muted/40 font-medium text-foreground leading-relaxed">
                              {q.question_text}
                            </p>
                          )}
                        </div>

                        {/* STAR Guides */}
                        <div className="space-y-2">
                          <span className="font-bold text-foreground block">Hướng dẫn cấu trúc 4 bước STAR:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            <div className="p-2.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-1">
                              <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-[11px]">
                                S - Bối cảnh (Situation)
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{q.situation_guide}</p>
                            </div>
                            <div className="p-2.5 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1">
                              <span className="font-bold text-blue-700 dark:text-blue-300 block text-[11px]">
                                T - Nhiệm vụ (Task)
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{q.task_guide}</p>
                            </div>
                            <div className="p-2.5 rounded-xl border bg-amber-500/5 border-amber-500/20 space-y-1">
                              <span className="font-bold text-amber-700 dark:text-amber-300 block text-[11px]">
                                A - Hành động (Action)
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{q.action_guide}</p>
                            </div>
                            <div className="p-2.5 rounded-xl border bg-purple-500/5 border-purple-500/20 space-y-1">
                              <span className="font-bold text-purple-700 dark:text-purple-300 block text-[11px]">
                                R - Kết quả (Result)
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{q.result_guide}</p>
                            </div>
                          </div>
                        </div>

                        {/* Benchmark Sample Answer */}
                        <div className="space-y-1.5 p-3 rounded-xl border bg-card">
                          <span className="font-bold text-foreground block">Câu trả lời mẫu xuất sắc:</span>
                          <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                            {q.sample_answer}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* =========================================================
            TAB CONTENT 2: BỐC TỪ NGÂN HÀNG CÂU HỎI (PICK FROM BANK)
           ========================================================= */}
        <TabsContent value="bank_picker" className="space-y-6 m-0">
          <Card className="shadow-xs border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                    <FolderPlus className="size-5 text-primary" />
                    Bốc Câu Hỏi Sẵn Có Từ Ngân Hàng Đề Thi
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tái sử dụng các câu hỏi chuẩn hóa có sẵn trong hệ thống (Next.js, Spring Boot, SQL, Behavior...) để gộp vào bộ đề ôn luyện này mà không cần tạo lại.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 bg-background/80">
                    Đã bốc: <strong className="text-primary ml-1 font-bold">{selectedBankQuestions.length}</strong> câu
                  </Badge>
                  {selectedBankQuestions.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllSelectedBankQuestions}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Bỏ chọn tất cả
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-background/80 border text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Tìm kiếm nội dung / từ khóa</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Tìm câu hỏi, từ khóa, công nghệ..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Ngành nghề</Label>
                  <Select value={bankDomainFilter} onValueChange={setBankDomainFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Tất cả ngành" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả ngành nghề</SelectItem>
                      {MOCK_DOMAINS_LIST.map((d) => (
                        <SelectItem key={d.domain_id} value={String(d.domain_id)}>
                          {d.domain_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Cấp độ</Label>
                  <Select value={bankLevelFilter} onValueChange={setBankLevelFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Tất cả cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả cấp độ</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Middle</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Dạng câu hỏi</Label>
                  <Select value={bankTypeFilter} onValueChange={setBankTypeFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Tất cả dạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả dạng câu</SelectItem>
                      <SelectItem value="technical">Kỹ thuật (Technical)</SelectItem>
                      <SelectItem value="situational">Tình huống (Situational)</SelectItem>
                      <SelectItem value="behavioral">Hành vi STAR (Behavioral)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 2-Column Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 items-start">
                {/* Left 8 Cols: Available Questions in Database */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <BookOpen className="size-4 text-primary" />
                      Kho câu hỏi sẵn có ({filteredBankQuestions.length} câu phù hợp)
                    </span>

                    {filteredBankQuestions.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={pickAllVisibleBankQuestions}
                        className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <CheckSquare className="size-3.5" />
                        <span>Bốc tất cả câu đang hiện</span>
                      </Button>
                    )}
                  </div>

                  {isLoadingBankQuestions ? (
                    <div className="p-12 text-center text-muted-foreground border rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
                      <Sparkles className="size-6 animate-spin text-primary" />
                      <span className="text-xs">Đang tải danh sách câu hỏi từ ngân hàng...</span>
                    </div>
                  ) : filteredBankQuestions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border rounded-2xl bg-card text-xs">
                      Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                      {filteredBankQuestions.map((q) => {
                        const isPicked = selectedBankQuestions.some((it) => it.question_id === q.question_id);
                        const publishCount =
    activeMainTab === "ai_agent"
      ? aiQuestions.length
      : activeMainTab === "bank_picker"
      ? selectedBankQuestions.length
      : manualQuestions.length;

  return (
                          <div
                            key={q.question_id}
                            className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                              isPicked
                                ? "bg-primary/5 border-primary/40 shadow-2xs"
                                : "bg-card hover:bg-muted/30 border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge variant="outline" className="font-mono text-[10px]">#{q.question_id}</Badge>
                                  <Badge variant="secondary" className="text-[10px]">{q.domain_name || `Ngành #${q.domain_id}`}</Badge>
                                  {q.role_name && <Badge variant="outline" className="text-[10px]">{q.role_name}</Badge>}
                                  <Badge variant="outline" className="text-[10px] capitalize">{q.experience_level}</Badge>
                                  <Badge variant="outline" className="text-[10px] text-muted-foreground capitalize">{q.question_type}</Badge>
                                </div>
                                <p className="font-bold text-foreground text-xs leading-relaxed pt-0.5">
                                  {q.question_text}
                                </p>
                              </div>

                              <Button
                                type="button"
                                size="sm"
                                variant={isPicked ? "secondary" : "outline"}
                                onClick={() => toggleBankQuestionSelection(q)}
                                className={`h-8 px-3 text-xs shrink-0 gap-1.5 font-semibold transition-all ${
                                  isPicked
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "border-primary/40 text-primary hover:bg-primary/10"
                                }`}
                              >
                                {isPicked ? (
                                  <>
                                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Đã Bốc</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="size-3.5" />
                                    <span>Bốc Vào Đề</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right 4 Cols: Selected Basket for this Question Set */}
                <div className="lg:col-span-4 sticky top-4 space-y-3">
                  <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <FolderKanban className="size-4 text-primary" />
                          Câu hỏi trong bộ đề
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          Thời lượng ước tính: ~{Math.max(15, selectedBankQuestions.length * 6)} phút
                        </span>
                      </div>

                      <Badge variant="default" className="text-xs font-bold font-mono">
                        {selectedBankQuestions.length} câu
                      </Badge>
                    </div>

                    {selectedBankQuestions.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground text-xs space-y-2">
                        <FolderPlus className="size-8 mx-auto text-muted-foreground/40" />
                        <p className="font-semibold text-foreground/80">Chưa bốc câu hỏi nào</p>
                        <p className="text-[11px] leading-relaxed">
                          Chọn từ danh sách bên trái để gom các câu hỏi liên quan vào bộ đề tuyển dụng này.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                        {selectedBankQuestions.map((q, idx) => (
                          <div
                            key={q.question_id}
                            className="p-2.5 rounded-lg border bg-muted/20 text-xs flex items-start justify-between gap-2 group hover:bg-muted/40 transition-colors"
                          >
                            <div className="space-y-0.5 flex-1 overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-primary text-[11px]">Câu #{idx + 1}</span>
                                <span className="text-muted-foreground text-[10px] font-mono">#{q.question_id}</span>
                              </div>
                              <p className="text-foreground text-[11px] font-medium leading-snug line-clamp-2">
                                {q.question_text}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSelectedBankQuestion(q.question_id)}
                              className="size-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0 transition-colors"
                              title="Bỏ câu hỏi này khỏi bộ đề"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedBankQuestions.length > 0 && (
                      <div className="pt-2 border-t">
                        <Button
                          type="button"
                          onClick={() => handleSaveSet(true)}
                          disabled={isSaving}
                          className="w-full h-9 text-xs font-bold gap-1.5 shadow-xs"
                        >
                          <Save className="size-3.5" />
                          <span>Xuất Bản Bộ Đề ({selectedBankQuestions.length} Câu)</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* =========================================================
            TAB CONTENT 2: THÊM TAY THỦ CÔNG (MANUAL CREATOR)
           ========================================================= */}
        <TabsContent value="manual" className="space-y-6 m-0">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <PenTool className="size-4 text-primary" />
                    Biên Soạn Bộ Câu Hỏi Thủ Công
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tự tay nhập các câu hỏi phỏng vấn đặc thù theo quy trình tuyển dụng của doanh nghiệp.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddManualItem}
                  className="h-8 text-xs gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Thêm câu hỏi mới</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="manual_set_name" className="text-xs font-semibold">Tên bộ đề phỏng vấn:</Label>
                <Input
                  id="manual_set_name"
                  value={manualSetName}
                  onChange={(e) => setManualSetName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Manual questions list */}
              <div className="space-y-3 pt-2">
                {manualQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary">Câu hỏi #{idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(q.id, true)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Nội dung câu hỏi *</Label>
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualQuestions((prev) =>
                            prev.map((item) => (item.id === q.id ? { ...item, question_text: val } : item))
                          );
                        }}
                        className="w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Mục tiêu đánh giá (Intent)</Label>
                        <Input
                          value={q.intent}
                          onChange={(e) => {
                            const val = e.target.value;
                            setManualQuestions((prev) =>
                              prev.map((item) => (item.id === q.id ? { ...item, intent: val } : item))
                            );
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Dạng câu hỏi</Label>
                        <Select
                          value={q.question_type}
                          onValueChange={(val: "technical" | "situational" | "behavioral") => {
                            setManualQuestions((prev) =>
                              prev.map((item) => (item.id === q.id ? { ...item, question_type: val } : item))
                            );
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Kỹ thuật (Technical)</SelectItem>
                            <SelectItem value="situational">Tình huống (Situational)</SelectItem>
                            <SelectItem value="behavioral">Hành vi (Behavioral)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Câu trả lời mẫu xuất sắc</Label>
                      <textarea
                        rows={3}
                        value={q.sample_answer}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualQuestions((prev) =>
                            prev.map((item) => (item.id === q.id ? { ...item, sample_answer: val } : item))
                          );
                        }}
                        className="w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Final Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-card shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span>
            Bộ đề sẽ được lưu và xuất bản vào danh mục <strong className="text-foreground">{currentDomainName}</strong> ·{" "}
            <strong className="text-foreground">{currentRoleName}</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/questions")}
            className="h-9 text-xs"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveSet(true)}
            disabled={isSaving || isAgentGenerating}
            className="h-9 gap-2 text-xs font-semibold shadow-xs"
          >
            <Send className="size-3.5" />
            <span>
              {isSaving ? "Đang lưu..." : `Lưu & Xuất Bản ${publishCount} Câu Hỏi`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
