# Kế Hoạch Thiết Kế & Triển Khai: Bộ Câu Hỏi Phỏng Vấn (Question Sets) & AI Agent Generator

> **Tài liệu đặc tả kỹ thuật và kế hoạch thực thi dành cho AI Agent và Developer**  
> **Phạm vi:** Cổng Quản trị Admin (`/admin/questions`, `/admin/questions/new`) và Cổng Ứng viên User (`/questions`, `/practice/[sessionId]`).  
> **Ngày lập:** 19/09/2026

---

## 1. Tổng Quan Kiến Trúc & Mục Tiêu Nghiệp Vụ

### 1.1. Bối cảnh & Vấn đề hiện tại
- Trước đây, hệ thống chỉ quản lý các **câu hỏi đơn lẻ (Individual Questions)**. Khi người dùng muốn phỏng vấn, họ phải tự lọc từng câu và bấm thêm vào giỏ (Question Basket), gây tốn thời gian và thiếu tính lộ trình bài bản.
- Phía Admin cần công cụ tạo nhanh một **Bộ câu hỏi (Question Set)** chuẩn hóa theo từng vị trí (Role), cấp độ (Level) và công nghệ cụ thể (Tech Stack).
- Cần có trợ lý **AI Question Generator Agent** có khả năng phân tích trực tiếp từ:
  1. Prompt/Yêu cầu tùy biến của admin.
  2. **Tài liệu tải lên (Document Import)**: File JD tuyển dụng (PDF, DOCX, TXT), tài liệu kỹ thuật, slide bài giảng.
  3. **Đường link URL (URL Import)**: Bài viết công nghệ, tài liệu framework (Next.js, Spring Boot, Kubernetes), link tin tuyển dụng LinkedIn/TopCV.
- Admin chỉ việc kiểm duyệt (Review), chỉnh sửa nhanh và bấm xuất bản vào hệ thống.
- Phía User (`/questions`) cần bổ sung Tab chuyển đổi để chọn ngay các **Bộ đề phỏng vấn có sẵn** theo công nghệ/vị trí để bắt đầu luyện tập 1-click mà không cần nhặt từng câu lẻ.

---

### 1.2. Khái niệm Cốt Lõi: Question vs. Question Set

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           QUESTION SET (BỘ CÂU HỎI PHỎNG VẤN)                     │
│  - Tiêu đề: "Bộ đề Full Stack Java Fresher (Spring Boot & PostgreSQL)"            │
│  - Ngành: Công nghệ thông tin (IT) | Vị trí: Backend / Fullstack                  │
│  - Level: Fresher | Tech Stack: [Java, Spring Boot, PostgreSQL, React]            │
│  - Số lượng: 5 câu hỏi | Thời lượng: 20 phút | Độ khó: 3/5 sao                   │
│  - Nguồn tạo: AI Agent (Trích xuất từ JD tuyển dụng / URL)                        │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │ Chứa 3 - 10 câu hỏi
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│   QUESTION 1 (Technical)│   │  QUESTION 2 (DB/System) │   │ QUESTION 3 (Behavioral) │
│ - Spring Boot IoC & DI  │   │ - Tối ưu Hibernate N+1  │   │ - Giải quyết bất đồng   │
│ - Chuẩn 4 bước STAR     │   │ - Chuẩn 4 bước STAR     │   │ - Chuẩn 4 bước STAR     │
│ - Đáp án mẫu benchmark  │   │ - Đáp án mẫu benchmark  │   │ - Đáp án mẫu benchmark  │
│ - Tiêu chí Rubric AI    │   │ - Tiêu chí Rubric AI    │   │ - Tiêu chí Rubric AI    │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

---

## 2. Mô Hình Dữ Liệu & Type Schema (Data Models)

### 2.1. TypeScript Interface cho Question Set (`src/types/catalog.ts`)

```typescript
export interface QuestionSetItem {
  set_id: number | string;
  title: string;                         // Tiêu đề bộ đề (VD: Bộ đề phỏng vấn Full Stack Java Fresher)
  description: string;                   // Mô tả mục tiêu bộ đề
  domain_id: number;
  domain_name: string;                   // Tên ngành nghề (IT, Finance, Marketing...)
  role_id: number;
  role_name: string;                     // Tên vị trí (Backend Engineer, Product Manager...)
  experience_level: "intern" | "fresher" | "junior" | "mid" | "senior" | "lead";
  tech_stack: string[];                  // ["Java", "Spring Boot", "PostgreSQL", "React"]
  language: "vi" | "en";
  target_difficulty: number;             // 1 đến 5 sao
  estimated_duration_minutes: number;    // 15, 20, 30 phút
  is_curated: boolean;                   // Bộ đề chuẩn do Admin/Chuyên gia tuyển chọn
  is_active: boolean;                    // Trạng thái kích hoạt hiển thị
  moderation_status: "approved" | "pending" | "draft" | "rejected";
  source: "admin_manual" | "admin_ai" | "imported_doc" | "imported_url";
  source_metadata?: {
    url?: string | null;                 // URL gốc nếu import từ web
    doc_name?: string | null;            // Tên file gốc nếu import từ tài liệu
    extracted_keywords?: string[];       // Từ khóa AI trích xuất được
  };
  questions: QuestionDetailOut[];        // Danh sách các câu hỏi trong bộ đề
  question_count: number;                // Số lượng câu hỏi (3, 5, 8, 10)
  practice_count: number;                // Số lượt ứng viên đã thi bộ đề này
  avg_score: number;                     // Điểm số trung bình (thang 100)
  pass_rate: number;                     // Tỷ lệ vượt qua (VD: 82.5%)
  created_at?: string;
  updated_at?: string;
}

export interface QuestionSetPageOut {
  items: QuestionSetItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface QuestionSetFilterParams {
  domain_id?: number | null;
  role_id?: number | null;
  level?: string | null;
  tech?: string | null;
  language?: string | null;
  difficulty?: number | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}
```

### 2.2. Dữ liệu đầu vào cho AI Agent Generator

```typescript
export interface AgentGenerateRequest {
  source_type: "prompt" | "document" | "url";
  custom_prompt?: string;
  document_text?: string;                // Nội dung bóc tách từ file tài liệu
  document_name?: string;
  url?: string;                          // Đường link bài viết/JD
  domain_id: number;
  role_id: number;
  level: string;
  tech_stack: string;
  question_distribution: "mixed" | "technical" | "situational" | "behavioral";
  question_count: number;
  target_difficulty: string;             // "auto" | "easy" | "medium" | "hard"
  language: "vi" | "en";
}
```

---

## 3. Thiết Kế Chi Tiết: Trang Tạo Bộ Câu Hỏi Admin (`/admin/questions/new`)

Trang `/admin/questions/new` sẽ được tái cấu trúc thành **2 Tabs chức năng lớn**:

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ [← Ngân hàng câu hỏi] / Tạo bộ câu hỏi mới                                       │
│                                                                                   │
│  ┌───────────────────────────────┬─────────────────────────────────────────────┐  │
│  │   TAB 1: THÊM TAY THỦ CÔNG    │   TAB 2: AI AGENT GENERATOR (KIỂM DUYỆT)    │  │
│  └───────────────────────────────┴─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1. Tab 1: Thêm Tay Thủ Công (Manual Creator)

#### Mục đích:
Dành cho chuyên gia nhân sự hoặc kỹ sư muốn tự biên soạn bộ câu hỏi chính xác theo ý muốn hoặc cập nhật từ ngân hàng câu hỏi nội bộ.

#### Các khối giao diện:
1. **Khối 1: Thông tin bộ đề & Phân loại mục tiêu**:
   - Tên bộ đề phỏng vấn (VD: *"Bộ đề phỏng vấn Senior DevOps - Kubernetes & CI/CD"*).
   - Ngành nghề tuyển dụng (Domain Select) & Vị trí chuyên môn (Role Select - tự động lọc theo ngành).
   - Cấp độ kinh nghiệm (Level Select: Intern, Fresher, Junior, Mid, Senior, Lead).
   - Ngôn ngữ phỏng vấn (VI / EN).
   - Công nghệ / Kỹ năng trọng tâm (Tech Stack Input + gợi ý chips nhanh).
   - Thời lượng đề xuất (15, 20, 30, 45 phút).
2. **Khối 2: Danh sách câu hỏi trong bộ đề (Question Builder)**:
   - Thêm từng câu hỏi vào bộ (Button `+ Thêm câu hỏi vào bộ đề`).
   - Mỗi câu hỏi có đầy đủ:
     - Nội dung câu hỏi phỏng vấn.
     - Dạng câu hỏi (Technical / Situational / Behavioral).
     - Độ khó (1 - 5 sao).
     - Mục tiêu đánh giá (Intent).
     - Hướng dẫn cấu trúc 4 bước STAR (Situation - Task - Action - Result).
     - Câu trả lời mẫu xuất sắc (Benchmark Answer).
     - Câu hỏi đào sâu (Follow-up questions) & Mẹo ứng viên (Pro Tips).
   - Cho phép kéo thả hoặc bấm mũi tên đổi thứ tự câu hỏi trong đề thi.
3. **Khối 3: Cấu hình xuất bản**:
   - Trạng thái kiểm duyệt (Đã duyệt / Chờ duyệt / Bản nháp).
   - Công tắc kích hoạt (Active / Inactive).
   - Gán nhãn "Bộ đề chuẩn tuyển chọn" (Curated Kit).

---

### 3.2. Tab 2: AI Agent Generator (Tạo Tự Động & Kiểm Duyệt)

#### Mục đích:
Quản trị viên chỉ cần cung cấp nguồn tài liệu hoặc đường link hoặc prompt yêu cầu, AI Agent sẽ tự động phân tích và sinh ra toàn bộ bộ đề hoàn chỉnh. Admin **chỉ việc duyệt (Review & Approve)**.

#### 3 Phương thức đầu vào (Input Modes):
1. **Nguồn 1: Nhập yêu cầu tùy chỉnh (Prompt Mode)**:
   - Nhập prompt: *"Tập trung vào Java Spring Boot Concurrency, Thread Pool, Transaction Management và câu hỏi tình huống xử lý Deadlock trong Database"*.
   - Gợi ý prompt mẫu nhanh (Performance, Security, Microservices, Agile Conflict).
2. **Nguồn 2: Tải lên tài liệu (Document Upload Mode)**:
   - Kéo thả file tài liệu: Hỗ trợ **PDF, DOCX, TXT, Markdown**.
   - Phù hợp với: Bản mô tả công việc (Job Description - JD), tài liệu kiến trúc dự án, slide kỹ thuật nội bộ.
   - Trình bóc tách text (Text Parser) tự động trích xuất các yêu cầu kỹ thuật chính (Skills, Responsibilities, Requirements).
3. **Nguồn 3: Nhập đường link (URL Import Mode)**:
   - Nhập URL: Link tài liệu công nghệ (VD: `https://docs.spring.io/...`, `https://nextjs.org/docs/...`), link bài viết tech blog (Medium, Dev.to), hoặc link tin tuyển dụng.
   - Agent phân tích nội dung từ trang web và bóc tách các chủ đề cốt lõi để tạo bộ đề phỏng vấn bám sát nội dung đó.

#### Tiến trình xử lý của AI Agent (Animated Progress):
- Bước 1: 🔍 *Bóc tách và phân tích tài liệu/link nguồn...*
- Bước 2: 🎯 *Xác định chân dung ứng viên, cấp độ & Tech Stack...*
- Bước 3: 📝 *Biên soạn bộ câu hỏi theo chuẩn STAR & phân bổ tỷ lệ...*
- Bước 4: ⚖️ *Thiết lập tiêu chí Rubric AI & Đáp án mẫu chuẩn...*
- Bước 5: ✨ *Hoàn tất! Mở bảng kiểm duyệt cho Admin.*

#### Bảng Kiểm Duyệt (Review & Approval Board):
- Hiển thị danh sách các câu hỏi vừa được sinh ra.
- Mỗi câu có trạng thái:
  - 🟢 **Đã duyệt (Approved)**
  - 🟡 **Cần tinh chỉnh (Needs Edit)**
  - 🔴 **Tạo lại câu này (Regenerate with AI)**
- Admin có thể:
  - Bấm **"Tạo lại bằng AI"** riêng cho câu chưa ưng ý.
  - Sửa trực tiếp nội dung (Inline Editor).
  - Bấm **"Phê duyệt toàn bộ & Xuất bản bộ đề"** để lưu cả bộ vào hệ thống.

---

## 4. Thiết Kế Chi Tiết: Trang Quản Lý Admin (`/admin/questions`)

Trang `/admin/questions` hiện tại sẽ được nâng cấp với **2 Tabs chuyển đổi chế độ xem (View Mode)**:

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│  CỔNG QUẢN TRỊ NGÂN HÀNG CÂU HỎI & BỘ ĐỀ PHỎNG VẤN                                │
│                                                                                   │
│  ┌────────────────────────────────────────┬────────────────────────────────────┐  │
│  │   TAB 1: BỘ ĐỀ PHỎNG VẤN (SETS)       │   TAB 2: CÂU HỎI ĐƠN LẺ (BANK)     │  │
│  └────────────────────────────────────────┴────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Tab 1: Bộ Đề Phỏng Vấn (Question Sets)
- **KPI Cards**:
  - Tổng số bộ đề phỏng vấn (VD: 85 bộ đề).
  - Bộ đề tuyển chọn chuẩn (Curated Sets: 48 bộ).
  - Tổng lượt thi bằng bộ đề (VD: 32,450 lượt).
  - Điểm đánh giá trung bình từ ứng viên (4.8 / 5 sao).
- **Bảng dữ liệu Bộ đề (Question Sets Table)**:
  - Cột: Tên bộ đề, Ngành nghề & Vị trí, Cấp độ, Tech Stack tags, Số câu hỏi, Độ khó, Nguồn tạo (AI/Thủ công/Import), Lượt luyện tập, Trạng thái, Thao tác.
  - Thao tác: Xem chi tiết bộ đề (mở Drawer hiển thị toàn bộ câu hỏi bên trong), Chỉnh sửa bộ đề, Xuất JSON, Xóa bộ đề.

### 4.2. Tab 2: Câu Hỏi Đơn Lẻ (Question Bank)
- Giữ nguyên bảng tra cứu và quản lý từng câu hỏi lẻ đã implement ở turn trước.
- Cho phép chọn nhiều câu hỏi lẻ để gom thành một Bộ đề mới (`Tạo Bộ Đề Từ Các Câu Đã Chọn`).

---

## 5. Thiết Kế Chi Tiết: Cổng Ứng Viên User (`/questions`)

Trang `http://localhost:3000/questions` hiện tại đang hỗ trợ tìm kiếm câu hỏi lẻ và thêm vào giỏ (Question Basket).  
Theo yêu cầu mới, trang sẽ được bổ sung **2 Tabs chuyển đổi trải nghiệm lớn**:

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│  NGÂN HÀNG CÂU HỎI & BỘ ĐỀ PHỎNG VẤN CHUẨN HOÁ                                    │
│                                                                                   │
│  ┌────────────────────────────────────────┬────────────────────────────────────┐  │
│  │  TAB 1: KHÁM PHÁ CÂU HỎI & TỰ BỐC ĐỀ   │  TAB 2: BỘ ĐỀ PHỎNG VẤN CÓ SẴN     │  │
│  │  (Question Explorer & Custom Basket)   │  (Curated Interview Kits & Sets)   │  │
│  └────────────────────────────────────────┴────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.1. Tab 1: Khám Phá Câu Hỏi & Tự Bốc Đề (Giữ nguyên & tối ưu)
- Ứng viên tự tra cứu câu hỏi theo ngành nghề, vị trí, từ khóa.
- Xem chi tiết câu hỏi, gợi ý STAR, tiêu chí Rubric.
- Nút `+ Thêm vào giỏ phỏng vấn` (Question Basket).
- Bấm **"Bắt đầu luyện tập (X câu đã chọn)"** để vào phòng phỏng vấn tùy chỉnh.

---

### 5.2. Tab 2: Bộ Đề Phỏng Vấn Có Sẵn (Curated Interview Kits & Sets)

#### Mục đích:
Giúp ứng viên không phải băn khoăn "nên luyện câu nào trước". Ứng viên chỉ cần chọn đúng Bộ đề phù hợp với vị trí và công nghệ mình chuẩn bị phỏng vấn (ví dụ: *"Fresher Full Stack Java (Spring Boot & React)"*, *"Senior DevOps Engineer (Kubernetes & AWS)"*) và bấm **Luyện tập ngay**.

#### Giao diện Lưới Thẻ Bộ Đề (Question Set Cards Grid):
Mỗi Card bộ đề được thiết kế theo phong cách Warm Glassmorphism sang trọng:
1. **Header Card**:
   - Badge Ngành nghề & Chức danh (VD: `IT` · `Backend Engineer`).
   - Badge Cấp độ (VD: `Fresher`, `Junior`, `Senior`).
   - Huy hiệu `⭐ Tuyển chọn chuẩn (Curated)` hoặc `🤖 AI Generated`.
2. **Body Card**:
   - Tiêu đề bộ đề: *"Bộ Đề Phỏng Vấn Full Stack Java Fresher"*.
   - Danh sách thẻ công nghệ (Tech Stack tags): `Java`, `Spring Boot`, `PostgreSQL`, `React`.
   - Mô tả ngắn về mục tiêu bộ đề (VD: *Đánh giá toàn diện kiến thức Spring Boot IoC/DI, Hibernate N+1, React hooks và xử lý sự cố database*).
   - Danh sách 2-3 câu hỏi tiêu biểu trong bộ đề (dạng preview rút gọn).
3. **Thống kê nhanh (Set Meta Info)**:
   - ⏱️ **Thời lượng:** `20 phút` · 📝 **Số lượng:** `5 câu hỏi`
   - 📊 **Độ khó:** `3 / 5 sao` · 👥 **Lượt thi:** `1,240 lượt`
   - ⭐ **Điểm đánh giá:** `4.9 / 5.0`
4. **Hành động cốt lõi**:
   - Nút chính: **"Luyện Tập Bộ Đề Này Ngay"** (Nổi bật với gradient màu cam ấm Interviewly).
     - **Cơ chế 1-Click:** Khi bấm, hệ thống tạo ngay một phiên phỏng vấn mới (`/practice/[sessionId]`), tự động nạp sẵn danh sách toàn bộ các câu hỏi trong bộ đề và chuyển thẳng ứng viên vào phòng luyện tập AI Coach!
   - Nút phụ: **"Xem Chi Tiết Đề Thi"** (Mở Modal / Slide Drawer hiển thị danh sách đầy đủ các câu hỏi, gợi ý STAR và tiêu chí chấm điểm của bộ đề).

---

## 6. Kế Hoạch Triển Khai & Danh Sách Công Việc (Implementation Roadmap)

| Giai đoạn | Nhiệm vụ kỹ thuật | File liên quan | Output cụ thể |
|:---:|:---|:---|:---|
| **P1** | **Mở rộng Data Schema & Mock Data** | `src/types/catalog.ts`<br>`src/mock/questionSetsMock.ts` | - Định nghĩa `QuestionSetItem`, `QuestionSetFilterParams`.<br>- Tạo mock 12+ bộ đề phỏng vấn hoàn chỉnh đa ngành (IT, Finance, Marketing, Sales, Product, HR) với tech stack phong phú. |
| **P2** | **Nâng cấp trang Tạo Mới Admin (`/admin/questions/new`)** | `src/components/admin/questions/QuestionCreateForm.tsx`<br>`src/app/(admin)/admin/questions/new/page.tsx` | - Chia 2 Tab: **Thêm tay thủ công** và **AI Agent Generator**.<br>- Căn chỉnh các trường Ngành, Vị trí, Level, Language, Tech Stack thành lưới 4 cột cân đối.<br>- Tích hợp 3 chế độ input: Prompt, Upload tài liệu (PDF/DOCX/TXT/JD) và Import đường link (URL).<br>- Bảng kiểm duyệt câu hỏi sau khi AI sinh (Approve, Edit, Regenerate, Delete). |
| **P3** | **Bổ sung Tab Bộ Đề vào trang Quản lý Admin (`/admin/questions`)** | `src/components/admin/questions/QuestionSetDataTable.tsx`<br>`src/app/(admin)/admin/questions/page.tsx` | - Thêm 2 Tab: **Bộ Đề Phỏng Vấn** và **Câu Hỏi Đơn Lẻ**.<br>- Bảng quản lý Bộ đề với đầy đủ bộ lọc, số câu, lượt luyện, độ khó, xem trước toàn bộ đề trong Drawer và xóa/sửa. |
| **P4** | **Nâng cấp trang User (`/questions`)** | `src/app/(user)/questions/QuestionExplorerClient.tsx`<br>`src/components/user-component/questions/QuestionSetList.tsx` | - Thêm 2 Tab lớn ở đầu trang: **Khám phá câu hỏi & Tự bốc đề** và **Bộ đề phỏng vấn có sẵn**.<br>- Lưới thẻ bộ đề Glassmorphism với Tech tags, Level, thời lượng.<br>- Modal xem trước các câu trong bộ đề.<br>- Nút 1-Click "Luyện tập bộ đề này ngay" tích hợp nạp sẵn câu hỏi vào `/practice/[sessionId]`. |
| **P5** | **Hoàn thiện & Kiểm thử dòng chảy (E2E Validation)** | Toàn bộ các trang liên quan | - Kiểm tra luồng tạo bộ đề từ link/tài liệu ở Admin -> Lưu vào hệ thống -> Hiển thị ở User -> Ứng viên bấm luyện tập mượt mà. |

---

## 7. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

1. **Giao diện & Căn chỉnh (UI Alignment)**:
   - Các trường cấu hình vị trí, ngành nghề, cấp độ, ngôn ngữ và tech stack phải thẳng hàng, cân đối theo lưới chuẩn Tailwind CSS.
   - Sử dụng các component chuẩn **shadcn/ui** và bảng màu Warm Glassmorphism của Interviewly.
2. **Chức năng AI Agent Generator**:
   - Cho phép quản trị viên nhập prompt HOẶC dán link bài viết/JD HOẶC tải file tài liệu.
   - AI Agent mô phỏng tiến trình phân tích và sinh ra bộ đề hoàn chỉnh gồm 3 - 10 câu hỏi chuẩn STAR và Rubric.
   - Có bảng kiểm duyệt (Review Board) để duyệt từng câu hoặc duyệt cả bộ trước khi lưu.
3. **Cấu trúc Bộ đề (Question Sets)**:
   - Phân biệt rõ giữa câu hỏi đơn lẻ và bộ đề phỏng vấn.
   - Trang `/admin/questions` có 2 tab quản lý riêng biệt cho Bộ đề và Câu hỏi lẻ.
4. **Trải nghiệm Ứng viên (User Portal)**:
   - Trang `http://localhost:3000/questions` có tab chuyển sang "Bộ đề phỏng vấn có sẵn".
   - Bấm "Luyện tập bộ đề này ngay" sẽ chuyển vào phòng phỏng vấn với các câu hỏi của bộ đề được nạp sẵn.
