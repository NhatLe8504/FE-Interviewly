export interface PreMadeInterview {
  id: string;
  title: string;
  company: string;
  companyBadge: string;
  domain: string;
  category: "bigtech" | "software" | "ai" | "product" | "fintech";
  level: "junior" | "mid" | "senior" | "lead";
  levelLabel: string;
  imageUrl: string;
  topics: string[];
  questionsCount: number;
  durationMinutes: number;
  rating: number;
  reviewsCount: number;
  candidatesPracticed: string;
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  sampleQuestions: {
    question_id: number;
    question_text: string;
    star_hint: string;
  }[];
}

export const PRE_MADE_INTERVIEWS: PreMadeInterview[] = [
  {
    id: "google-fe-l5",
    title: "Senior Frontend System Architect",
    company: "Google",
    companyBadge: "Google L5",
    domain: "Software Engineering",
    category: "bigtech",
    level: "senior",
    levelLabel: "Senior (L5)",
    imageUrl:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80",
    topics: ["Core Web Vitals", "Virtual DOM Internals", "Micro-frontends", "Distributed Caching"],
    questionsCount: 5,
    durationMinutes: 25,
    rating: 4.95,
    reviewsCount: 1480,
    candidatesPracticed: "2.8k+",
    testimonial: {
      quote:
        "Bộ câu hỏi đào sâu về render cycle và tối ưu FCP/LCP cực kỳ giống vòng Onsite Google. Mình đã pass offer L5!",
      author: "Hoàng Long",
      role: "Ex-VNG, Now Google L5",
    },
    sampleQuestions: [
      {
        question_id: 101,
        question_text:
          "Hãy chia sẻ về một lần bạn phải tối ưu hóa Largest Contentful Paint (LCP) và INP cho một ứng dụng web phục vụ hàng triệu người dùng. Bạn đã profiling và đưa ra kiến trúc giải pháp ra sao?",
        star_hint:
          "Situation: Số liệu LCP ban đầu. Task: Mục tiêu giảm dưới 1.2s. Action: Dynamic imports, SSR streaming, service worker asset caching. Result: Cải thiện 45% chuyển đổi.",
      },
      {
        question_id: 102,
        question_text:
          "Khi thiết kế hệ thống Micro-frontend cho nhiều team cùng đóng góp, bạn giải quyết vấn đề shared state, style isolation và version mismatch của thư viện như thế nào?",
        star_hint:
          "Tập trung vào Module Federation, Shadow DOM, Custom Event Bus và cơ chế fallback graceful degradation.",
      },
      {
        question_id: 103,
        question_text:
          "Bạn đã từng giải quyết xung đột kỹ thuật gay gắt giữa việc đẩy nhanh tính năng theo Business hay dành thời gian refactor code chống sập hệ thống chưa?",
        star_hint:
          "Thể hiện kỹ năng Stakeholder Management, dùng dữ liệu downtime để thuyết phục và lộ trình giải quyết kỹ thuật từng bước.",
      },
    ],
  },
  {
    id: "meta-fullstack-e5",
    title: "Fullstack Real-Time Product Engineer",
    company: "Meta",
    companyBadge: "Meta E4/E5",
    domain: "Software Engineering",
    category: "bigtech",
    level: "senior",
    levelLabel: "Senior (E5)",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    topics: ["GraphQL Subscriptions", "WebSocket Scaling", "High Concurrency", "STAR Behavioral"],
    questionsCount: 5,
    durationMinutes: 25,
    rating: 4.93,
    reviewsCount: 2120,
    candidatesPracticed: "3.5k+",
    testimonial: {
      quote:
        "Phần phỏng vấn Behavioral kết hợp System Design rất sát với văn hóa Move Fast của Meta Singapore.",
      author: "Minh Trang",
      role: "Product Engineer @ Meta",
    },
    sampleQuestions: [
      {
        question_id: 201,
        question_text:
          "Mô tả kiến trúc của một hệ thống Real-time Live Reactions (thả tim, bình luận trực tiếp) với 500,000 người xem đồng thời. Làm thế nào để đảm bảo độ trễ dưới 200ms mà không làm nghẽn server?",
        star_hint:
          "Nêu rõ WebSocket Gateway, Redis Pub/Sub sharding, message batching trên client và backpressure handling.",
      },
      {
        question_id: 202,
        question_text:
          "Hãy kể về một lần dự án do bạn phụ trách bị lỗi nghiêm trọng trên production ngay giờ cao điểm. Bạn đã dập lửa, điều tra nguyên nhân và rút ra văn hóa blameless post-mortem ra sao?",
        star_hint:
          "Nhấn mạnh sự bình tĩnh, roll-back tức thì, thông báo stakeholder và các biện pháp tự động hóa phòng ngừa sau đó.",
      },
    ],
  },
  {
    id: "amazon-aws-l6",
    title: "Cloud & Distributed Systems Architect",
    company: "Amazon AWS",
    companyBadge: "AWS L6",
    domain: "Cloud & DevOps",
    category: "bigtech",
    level: "lead",
    levelLabel: "Staff / Lead (L6)",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    topics: ["16 Leadership Principles", "Multi-Region Active-Active", "Zero Trust", "Disaster Recovery"],
    questionsCount: 6,
    durationMinutes: 30,
    rating: 4.9,
    reviewsCount: 980,
    candidatesPracticed: "1.9k+",
    testimonial: {
      quote:
        "AI ép hỏi 16 Leadership Principles của Amazon cực kỳ chuẩn. Nhờ được luyện trước mà mình không bị khớp.",
      author: "Tuấn Anh",
      role: "Solutions Architect @ AWS",
    },
    sampleQuestions: [
      {
        question_id: 301,
        question_text:
          "Áp dụng nguyên tắc 'Customer Obsession' và 'Invent and Simplify', hãy kể về một giải pháp kỹ thuật phức tạp mà bạn đã chủ động đơn giản hóa để tiết kiệm hàng trăm ngàn USD chi phí hạ tầng.",
        star_hint:
          "Bắt đầu từ nỗi đau khách hàng, phân tích chi phí AWS CloudWatch/S3, đưa ra cơ chế Tiered Storage và caching thông minh.",
      },
      {
        question_id: 302,
        question_text:
          "Thiết kế kiến trúc Multi-region Disaster Recovery đạt RTO < 5 phút và RPO = 0 cho dịch vụ tài chính ngân hàng quốc tế.",
        star_hint:
          "Nêu rõ DynamoDB Global Tables, Route 53 latency routing, replication consistency và automated failover testings.",
      },
    ],
  },
  {
    id: "openai-ml-senior",
    title: "Large Language Model & RAG Research Engineer",
    company: "OpenAI / AI Labs",
    companyBadge: "AI Research",
    domain: "AI & Data Science",
    category: "ai",
    level: "senior",
    levelLabel: "Senior AI",
    imageUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    topics: ["RAG Architecture", "vLLM Inference", "Vector DB Scaling", "Quantization"],
    questionsCount: 5,
    durationMinutes: 25,
    rating: 4.98,
    reviewsCount: 2890,
    candidatesPracticed: "4.1k+",
    testimonial: {
      quote:
        "Chấm Rubric phần RAG và Latency vs Accuracy Trade-off của AI cực kỳ sâu sắc và thực tế.",
      author: "Đức Huy",
      role: "AI Lead Researcher",
    },
    sampleQuestions: [
      {
        question_id: 401,
        question_text:
          "Làm thế nào để xây dựng một pipeline RAG (Retrieval-Augmented Generation) hạn chế tối đa ảo giác (Hallucination) cho văn bản pháp lý và tài chính với hơn 10 triệu văn bản?",
        star_hint:
          "Đề cập Hybrid Search (BM25 + Dense Vectors), Re-ranking, Context Compression, Semantic Chunking và Evaluation với Ragas.",
      },
      {
        question_id: 402,
        question_text:
          "So sánh ưu nhược điểm giữa LoRA, QLoRA và Full Fine-tuning khi triển khai mô hình LLM trên cụm GPU có ngân sách hạn chế.",
        star_hint:
          "Phân tích memory footprint, training throughput, loss convergence và khả năng catastrophic forgetting.",
      },
    ],
  },
  {
    id: "shopee-backend-highload",
    title: "Flash Sale & High Concurrency Backend Engineer",
    company: "Shopee",
    companyBadge: "Shopee Tech",
    domain: "Software Engineering",
    category: "software",
    level: "senior",
    levelLabel: "Middle / Senior",
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    topics: ["Distributed Lock", "Redis Cluster", "Kafka Message Queue", "ACID Idempotency"],
    questionsCount: 5,
    durationMinutes: 20,
    rating: 4.88,
    reviewsCount: 3420,
    candidatesPracticed: "5.2k+",
    testimonial: {
      quote:
        "Đề flash sale 11.11 giống 95% câu hỏi phỏng vấn vòng 2 của Shopee Tech. Luyện xong tự tin hẳn!",
      author: "Đăng Khoa",
      role: "Senior Backend Engineer",
    },
    sampleQuestions: [
      {
        question_id: 501,
        question_text:
          "Trong sự kiện siêu sale 11.11 với 100,000 request/giây tranh mua 1,000 chiếc điện thoại giá sốc, bạn thiết kế cơ chế trừ kho (Inventory Deduction) như thế nào để đảm bảo không bị overselling mà DB không sập?",
        star_hint:
          "Phân tích Redis Lua Scripting trừ kho atomic, Kafka async order creation, Token bucket rate limiting và Data reconciliation.",
      },
    ],
  },
  {
    id: "microsoft-principal-pm",
    title: "Principal Enterprise Product Manager",
    company: "Microsoft",
    companyBadge: "Microsoft L65",
    domain: "Product & Management",
    category: "product",
    level: "lead",
    levelLabel: "Principal (L65)",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
    topics: ["B2B SaaS Roadmap", "North Star Metric", "Go-To-Market", "Stakeholder Alignment"],
    questionsCount: 5,
    durationMinutes: 30,
    rating: 4.91,
    reviewsCount: 1150,
    candidatesPracticed: "1.8k+",
    testimonial: {
      quote:
        "Các câu hỏi về xử lý bất đồng giữa Engineering và Sales vô cùng thử thách, giúp mình rèn tư duy lãnh đạo sắc sảo.",
      author: "Phương Thảo",
      role: "Lead PM @ Tech Global",
    },
    sampleQuestions: [
      {
        question_id: 601,
        question_text:
          "Sản phẩm SaaS doanh nghiệp của bạn đang có tỷ lệ churn tăng 15% trong quý vừa qua. Trình bày khung phân tích định lượng và kế hoạch 90 ngày để đảo ngược tình thế.",
        star_hint:
          "Cohort analysis, feature adoption drop-off, phỏng vấn khách hàng rời đi, ưu tiên tính năng theo RICE và Quick-wins.",
      },
    ],
  },
  {
    id: "vng-fintech-architect",
    title: "FinTech & Payment Core Architect",
    company: "VNG / ZaloPay",
    companyBadge: "ZaloPay L5",
    domain: "FinTech & Systems",
    category: "fintech",
    level: "senior",
    levelLabel: "Senior (L5)",
    imageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    topics: ["Payment Gateway", "Double-Entry Bookkeeping", "Fraud Detection", "PCI-DSS"],
    questionsCount: 5,
    durationMinutes: 20,
    rating: 4.89,
    reviewsCount: 1760,
    candidatesPracticed: "2.5k+",
    testimonial: {
      quote:
        "Bộ câu hỏi về đối soát tiền và cơ chế Idempotent xử lý thanh toán ngân hàng cực kỳ thực chiến.",
      author: "Văn Nam",
      role: "Payment Platform Architect",
    },
    sampleQuestions: [
      {
        question_id: 701,
        question_text:
          "Khi một giao dịch thanh toán ví điện tử bị timeout từ phía cổng thanh toán ngân hàng (chưa rõ thành công hay thất bại), bạn thiết kế state machine và cơ chế bồi hoàn ra sao để không thất thoát tài chính?",
        star_hint:
          "Idempotency key, Two-phase commit / Saga pattern, Auto polling query status, reconciliation đối soát cuối ngày.",
      },
    ],
  },
  {
    id: "bytedance-tiktok-recsys",
    title: "Recommendation & Viral Algorithm Engineer",
    company: "ByteDance / TikTok",
    companyBadge: "TikTok Tech",
    domain: "AI & Data Science",
    category: "ai",
    level: "senior",
    levelLabel: "Senior (2-2)",
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    topics: ["Feed Ranking", "Vector Embeddings", "Real-Time Feature Store", "Exploration vs Exploitation"],
    questionsCount: 5,
    durationMinutes: 25,
    rating: 4.94,
    reviewsCount: 1620,
    candidatesPracticed: "2.2k+",
    testimonial: {
      quote:
        "Nhờ luyện kỹ các kịch bản A/B test và cold-start problem với AI mà mình đã pass offer ByteDance Singapore!",
      author: "Thanh Tùng",
      role: "Algorithm Engineer",
    },
    sampleQuestions: [
      {
        question_id: 801,
        question_text:
          "Làm thế nào để hệ thống đề xuất video ngắn giải quyết bài toán Cold-Start cho video mới đăng để phát hiện nội dung tiềm năng viral trong vòng 30 phút đầu tiên?",
        star_hint:
          "Multi-armed bandit, multi-modal content analysis (audio, vision, text), initial test bucket routing và real-time completion rate tracking.",
      },
    ],
  },
  {
    id: "apple-ios-core",
    title: "iOS Core Graphics & Performance Specialist",
    company: "Apple",
    companyBadge: "Apple ICT4",
    domain: "Mobile Engineering",
    category: "software",
    level: "senior",
    levelLabel: "Senior (ICT4)",
    imageUrl:
      "https://images.unsplash.com/photo-1510519138197-04b820a4961a?w=800&auto=format&fit=crop&q=80",
    topics: ["Memory ARC Internals", "Metal & 120Hz ProMotion", "App Launch Time", "Swift Concurrency"],
    questionsCount: 5,
    durationMinutes: 25,
    rating: 4.92,
    reviewsCount: 840,
    candidatesPracticed: "1.3k+",
    testimonial: {
      quote:
        "Hỏi sâu vào Instruments, Memory Leaks và tối ưu pin. Đạt offer kỹ sư iOS cao cấp!",
      author: "Quốc Bảo",
      role: "Senior iOS Engineer",
    },
    sampleQuestions: [
      {
        question_id: 901,
        question_text:
          "Trình bày cách bạn profiling và loại bỏ hiện tượng giật khung hình (frame drop) trên màn hình 120Hz ProMotion khi render danh sách feed phức tạp gồm video, hình ảnh và text.",
        star_hint:
          "Offscreen rendering avoidance, async text layout calculation, CADisplayLink tracking và Instruments Core Animation template.",
      },
    ],
  },
];