"use client";

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

const QUICK_TECH_CHIPS = [
  "Java, Spring Boot, PostgreSQL",
  "React, TypeScript, Next.js",
  "Python, FastAPI, Redis",
  "Node.js, Express, MongoDB",
  "DevOps, Docker, Kubernetes, CI/CD",
  ".NET Core, C#, SQL Server",
  "Flutter, Dart, Mobile App",
  "Data Engineer, Spark, Kafka",
];

const PROMPT_SUGGESTIONS = [
  "🔥 Trọng tâm tối ưu hiệu năng, Concurrency & Caching",
  "🛡️ Trọng tâm Bảo mật REST API, JWT & Authentication",
  "⚡ Kiến trúc Microservices, Clean Architecture & Design Patterns",
  "💼 Tình huống giải quyết bug Production & tư duy gỡ lỗi",
];

// AI Agent intelligent generator factory
function generateQuestionsByAgent({
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

  // Mode Selection: "manual" or "ai_agent"
  const [activeMainTab, setActiveMainTab] = useState<"manual" | "ai_agent">("ai_agent");

  // Common Profile & Tech Configuration (Clean Grid)
  const [domainId, setDomainId] = useState<number>(1);
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

  // Dynamic roles based on domain
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

  // Run AI Agent Generator
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

  // Save full set
  const handleSaveSet = (publish = true) => {
    setIsSaving(true);
    const count = activeMainTab === "ai_agent" ? aiQuestions.length : manualQuestions.length;
    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        publish
          ? `Đã lưu và xuất bản bộ đề (${count} câu hỏi) vào Ngân hàng đề thi!`
          : `Đã lưu bản nháp bộ đề (${count} câu hỏi).`
      );
      router.push("/admin/questions");
    }, 600);
  };

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
            Tạo bộ đề theo ngành nghề, vị trí, công nghệ và cấp độ kinh nghiệm bằng AI Agent hoặc tự soạn thủ công.
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
              {isSaving
                ? "Đang lưu..."
                : `Lưu & Xuất Bản ${
                    activeMainTab === "ai_agent" ? aiQuestions.length : manualQuestions.length
                  } Câu Hỏi`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Domain */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Ngành nghề tuyển dụng</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(domainId)}
                onValueChange={(v) => {
                  const dId = Number(v);
                  setDomainId(dId);
                  const firstRole = MOCK_ROLES_LIST.find((r) => r.domain_id === dId);
                  if (firstRole) setRoleId(firstRole.role_id);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
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
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Vị trí chuyên môn</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(roleId)}
                onValueChange={(v) => setRoleId(Number(v))}
              >
                <SelectTrigger className="h-9 text-xs">
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
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Cấp độ kinh nghiệm</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="h-9 text-xs">
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
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Ngôn ngữ phỏng vấn</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 text-xs">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 pt-1">
            {/* Tech Stack (5 cols) */}
            <div className="lg:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="tech_stack" className="text-xs font-semibold">
                  Công nghệ / Kỹ năng trọng tâm (Tech Stack)
                </Label>
                <span className="text-[11px] text-muted-foreground">Ví dụ: Java, Spring Boot, React...</span>
              </div>
              <Input
                id="tech_stack"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Nhập công nghệ cần phỏng vấn (cách nhau bởi dấu phẩy)..."
                className="h-9 text-xs"
              />
            </div>

            {/* Question Distribution (3 cols) */}
            <div className="lg:col-span-3 space-y-1.5">
              <Label className="text-xs font-semibold">Phân bổ dạng câu hỏi</Label>
              <Select value={questionDistribution} onValueChange={setQuestionDistribution}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Kết hợp toàn diện (Mixed)</SelectItem>
                  <SelectItem value="technical">Thuần Kỹ thuật (Technical)</SelectItem>
                  <SelectItem value="situational">Xử lý Tình huống (Situational)</SelectItem>
                  <SelectItem value="behavioral">Hành vi & Văn hóa (Behavioral)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Count (2 cols) */}
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Số lượng câu hỏi</Label>
              <Select
                value={String(questionCount)}
                onValueChange={(v) => setQuestionCount(Number(v))}
              >
                <SelectTrigger className="h-9 text-xs">
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
              <Label className="text-xs font-semibold">Độ khó mục tiêu</Label>
              <Select value={targetDifficulty} onValueChange={setTargetDifficulty}>
                <SelectTrigger className="h-9 text-xs">
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
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
            <span className="text-muted-foreground text-[11px] font-medium mr-1 flex items-center gap-1">
              <Code2 className="size-3 text-primary" />
              Gợi ý Tech Stack:
            </span>
            {QUICK_TECH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTechStack(chip)}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-colors border ${
                  techStack === chip
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Hai Tab Lớn (AI Agent Generator vs Thêm Tay Thủ Công) */}
      <Tabs
        value={activeMainTab}
        onValueChange={(v) => setActiveMainTab(v as "manual" | "ai_agent")}
        className="space-y-4"
      >
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="h-10 p-1 bg-muted/60">
            <TabsTrigger value="ai_agent" className="text-xs gap-2 font-semibold data-[state=active]:shadow-xs">
              <Bot className="size-4 text-primary" />
              <span>Tab 1: AI Agent Generator (Tự động & Kiểm duyệt)</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs gap-2 font-semibold data-[state=active]:shadow-xs">
              <PenTool className="size-4 text-primary" />
              <span>Tab 2: Thêm Tay Thủ Công (Manual Creator)</span>
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
                      placeholder="Ví dụ: Tập trung vào Java concurrency, Spring Boot Security, tối ưu hóa Hibernate N+1 và câu hỏi tình huống xử lý deadlock..."
                      className="w-full rounded-md border border-input bg-background/90 p-2.5 text-xs leading-relaxed"
                      disabled={isAgentGenerating}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((sug, idx) => (
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
              {isSaving
                ? "Đang lưu..."
                : `Lưu & Xuất Bản ${
                    activeMainTab === "ai_agent" ? aiQuestions.length : manualQuestions.length
                  } Câu Hỏi`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
