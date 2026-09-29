# Tài Liệu Thiết Kế Kỹ Thuật & Kế Hoạch Triển Khai (Design & Implementation Plan)
## Phân Hệ: Không Gian Luyện Tập Câu Hỏi Độc Lập & Bộ Đề (Unified Question Practice Workspace)

> **Mục tiêu:** Xây dựng một không gian làm bài và luyện tập kiến thức/kỹ năng chuẩn hóa đồng nhất (`/questions/practice`), nơi người dùng có thể thực hành một danh sách câu hỏi bất kỳ — dù đến từ **Bộ đề tuyển dụng (Question Set)** hay từ **Giỏ đề tự bốc (Custom Basket)** hay **Luyện tập một câu hỏi đơn lẻ**.  
> **Người lập:** Lê Minh Hiếu (lhieu20231 - Admin Portal & Question Catalog Lead)  
> **Ngày lập:** 19/09/2026  
> **Trạng thái:** Kế hoạch thiết kế & Kiến trúc chuẩn bị thực thi

---

## 1. Bối Cảnh Nghiệp Vụ & Vấn Đề Cần Giải Quyết

### 1.1. Phân biệt rõ hai phân hệ Luyện tập trong hệ thống
Hệ thống Interviewly có 2 hình thức luyện tập với mục đích hoàn toàn khác nhau:

| Tiêu chí so sánh | Phân hệ 1: Phòng Phỏng Vấn Đàm Thoại 1:1 (`/practice/[sessionId]`) | Phân hệ 2: Không Gian Luyện Tập Câu Hỏi (`/questions/practice`) |
| :--- | :--- | :--- |
| **Mục đích cốt lõi** | Mô phỏng một buổi phỏng vấn trực tiếp với AI Interviewer (áp lực thời gian, không khí phòng họp, webcam/avatar AI). | Rèn luyện kiến thức chuyên môn, kiểm tra tư duy tình huống, chỉnh sửa câu chữ theo khung STAR và chấm điểm kỹ năng. |
| **Hình thức tương tác** | AI hỏi từng câu, người dùng phản hồi liên tục, AI nghe và đặt câu hỏi tiếp nối (follow-up). | Người dùng chủ động chọn cách làm bài: **Trắc nghiệm (Quiz)**, **Tự luận theo khung STAR (Text)**, hoặc **Ghi âm trực tiếp (Voice)**. |
| **Đánh giá & Chấm điểm** | Chấm điểm toàn diện sau khi hết toàn bộ buổi phỏng vấn (Session Result / Report). | **Chấm điểm chi tiết từng câu một ngay sau khi làm xong**: thang điểm 100, 4 thành tố STAR, 4 tiêu chí Rubric chuẩn hóa, ưu/nhược điểm. |
| **Nguồn câu hỏi** | Sinh ra từ cấu hình phỏng vấn (Role, Domain, Seniority). | Đến từ **Bộ đề tuyển dụng (Question Set)** hoặc **Giỏ đề do ứng viên tự bốc (Custom Basket)** hoặc câu hỏi đơn lẻ. |

### 1.2. Vấn đề hiện tại
- Trước đây, khi bấm *"Luyện tập ngay"* ở Bộ đề hoặc Giỏ đề, hệ thống điều hướng nhầm sang `/practice/set-...` hoặc `/practice/custom-...` (vốn là Phân hệ 1), gây hiểu lầm và mất đi tính năng rèn luyện kiến thức, làm bài trắc nghiệm và chấm điểm kỹ năng của phân hệ Ngân hàng câu hỏi.
- Vì bản chất một **Bộ đề tuyển dụng** hay một **Giỏ câu hỏi tự chọn** đều là **một tập hợp gồm N câu hỏi**, nên trải nghiệm làm bài phải được quy về **CÙNG MỘT TRANG WORKSPACE DUY NHẤT** (`/questions/practice`).

---

## 2. Kiến Trúc Luồng Dữ Liệu (Unified Data Architecture & Flow)

### 2.1. Ba Điểm Vào Đồng Nhất (3 Unified Entry Points)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             3 ĐIỂM VÀO HỆ THỐNG                             │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                 │                                │
          ▼                                 ▼                                ▼
[1. BỘ ĐỀ TUYỂN DỤNG]             [2. GIỎ ĐỀ TỰ BỐC]            [3. CÂU HỎI ĐƠN LẺ]
  - Chọn Bộ đề có sẵn               - Tự chọn N câu bất kỳ        - Từ thẻ câu hỏi lẻ
  - Bấm "Luyện tập ngay"            - Bấm "Luyện tập (✓)"         - Bấm "Luyện câu này"
  - set_id, danh sách câu hỏi       - basket_questions            - question_id
          │                                 │                                │
          └────────────────────────┬────────┴────────────────────────────────┘
                                   │
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │  LƯU VÀO PHIÊN LUYỆN TẬP (SessionStorage/Memory)  │
          │  key: "active_practice_workspace_session"        │
          └──────────────────────────────────────────────────┘
                                   │
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │      TRANG WORKSPACE ĐỒNG NHẤT:                  │
          │      URL: /questions/practice                    │
          │      ?source=set&setId=1                         │
          │      hoặc ?source=basket                         │
          │      hoặc ?source=single&questionId=10           │
          └──────────────────────────────────────────────────┘
```

### 2.2. Cấu Trúc Dữ Liệu Phiên Làm Bài (`PracticeWorkspaceSession`)

```typescript
export type PracticeItemStatus = "unanswered" | "draft" | "evaluated";

export interface UserPracticeAnswer {
  mode: "quiz" | "text" | "voice";
  selected_option_id?: string | null;      // Dành cho trắc nghiệm (A, B, C, D)
  written_text?: string;                   // Dành cho tự luận theo STAR
  audio_url?: string | null;               // Dành cho ghi âm giọng nói
  audio_duration_seconds?: number;
  submitted_at?: string;
}

export interface QuestionPracticeProgressItem {
  question_id: number;
  question_data: QuestionDetailOut;
  status: PracticeItemStatus;
  user_answer?: UserPracticeAnswer | null;
  evaluation_result?: AIEvaluationResult | null;
}

export interface UnifiedPracticeSession {
  session_id: string;                      // "ps-basket-xxx" hoặc "ps-set-xxx"
  source_type: "basket" | "set" | "single";
  source_title: string;                    // "Giỏ đề tự chọn (3 câu)" hoặc tên Bộ đề
  domain_id?: number;
  domain_name?: string;
  items: QuestionPracticeProgressItem[];
  current_index: number;                   // 0 -> items.length - 1
  started_at: string;
  finished_at?: string | null;
}
```

---

## 3. Thiết Kế Giao Diện & Trải Nghiệm Người Dùng (UI/UX Specification)

Giao diện trang `/questions/practice` được thiết kế theo đúng nhận diện **Glassmorphism & Warm Design System** (`#f8f4ee`, `#211914`, `#d98236`, `#8b4513`):

### 3.1. Khu vực 1: Header Tiến Độ & Thanh Chọn Câu Hỏi Nhanh (Top Navigation & Stepper)
- **Hàng trên cùng (Top Bar):**
  - Nút *← Quay lại Ngân hàng câu hỏi* (kèm popup xác nhận nếu đang làm dở).
  - Tên bộ đề / giỏ đề: ví dụ `👑 Bộ đề Fullstack Java Fresher` hoặc `🧺 Giỏ câu hỏi tự chọn (4 câu)`.
  - Đồng hồ đếm thời gian làm bài: `⏱️ 08:24`.
  - Nút *Nộp bài & Xem bảng điểm tổng kết* (chỉ kích hoạt khi đã hoàn thành ít nhất 1 câu).
- **Thanh Stepper / Question Palette (Bàn cờ câu hỏi):**
  - Hiển thị danh sách câu hỏi: `Câu 1`, `Câu 2`, `Câu 3`, ..., `Câu N`.
  - Trạng thái màu sắc trực quan:
    - **Màu cam đậm (#d98236):** Câu đang làm hiện tại.
    - **Màu xanh lá (#10b981) kèm dấu tích (✓):** Câu đã nộp và được AI chấm điểm.
    - **Màu trắng viền xám:** Câu chưa làm.
  - Người dùng có thể click vào bất kỳ câu nào để chuyển nhanh qua lại mà không mất dữ liệu nháp của câu trước.

### 3.2. Khu vực 2: Thẻ Câu Hỏi Hiện Tại (Question Card)
- Tag định danh: Chuyên ngành, Vị trí, Cấp độ (Fresher/Junior/Senior), Dạng đề (Technical/Behavioral/Situational).
- Nội dung câu hỏi hiển thị dạng Typography nổi bật, dễ đọc.
- Khối gợi ý Khung STAR (Situation - Task - Action - Result) & Tiêu chuẩn chấm điểm Rubric có thể thu gọn/mở rộng để ứng viên tham khảo ý tứ trước khi làm bài.

### 3.3. Khu vực 3: Bộ Chuyển Đổi 3 Hình Thức Làm Bài (3 Interactive Answer Modes)
Người dùng có quyền tự do lựa chọn 1 trong 3 hình thức làm bài cho câu hỏi hiện tại:

1. **Hình thức 1: Trắc nghiệm tình huống (Situational Quiz)**
   - Danh sách 4 phương án A, B, C, D được thiết kế dạng thẻ bo tròn.
   - Bấm chọn phương án -> Bấm nút *"Kiểm tra đáp án & Giải thích"*.
   - Hiển thị kết quả Đúng (xanh)/Sai (đỏ) kèm phân tích sâu sắc vì sao phương án đó tối ưu theo chuẩn quốc tế.
2. **Hình thức 2: Trả lời tự luận theo khung STAR (Written Response)**
   - Khung nhập văn bản rộng rãi, bộ đếm số từ và độ dài khuyến nghị.
   - **4 nút chip chèn nhanh mẫu gợi ý**:
     - `+ Tình huống (Situation)`
     - `+ Nhiệm vụ (Task)`
     - `+ Hành động (Action)`
     - `+ Kết quả (Result)`
   - Nút *"Gửi câu trả lời để AI chấm điểm"*.
3. **Hình thức 3: Ghi âm giọng nói trực tiếp (Live Voice Recording)**
   - Bấm nút micro để bắt đầu ghi âm câu trả lời như đang trong phòng thi.
   - Đồng hồ đếm giây thời gian thực + thanh sóng âm sinh động (Audio Waveform).
   - Bấm nút dừng -> Trình phát audio hiển thị để ứng viên nghe lại giọng của mình.
   - Nút *"Gửi bản ghi âm để AI chấm điểm"*.

### 3.4. Khu vực 4: Báo Cáo Chấm Điểm AI Theo Thời Gian Thực (AI Instant Evaluation Report)
Ngay sau khi gửi câu trả lời (Tự luận hoặc Ghi âm), hệ thống hiển thị khối chấm điểm AI chi tiết:
- **Thẻ điểm tổng quan:** Điểm số (0 - 100đ) kèm nhận xét đánh giá tổng quát.
- **Phân tích 4 thành tố STAR:**
  - S (Situation): Điểm /10 + Nhận xét bối cảnh.
  - T (Task): Điểm /10 + Nhận xét mục tiêu.
  - A (Action): Điểm /10 + Nhận xét hành động và giải pháp kỹ thuật.
  - R (Result): Điểm /10 + Nhận xét số liệu dẫn chứng định lượng.
- **Bảng điểm 4 Tiêu chí Rubric:**
  - Cấu trúc STAR (30%), Chiều sâu kỹ thuật (30%), Độ lưu loát & Mạch lạc (20%), Tác động & Bài học (20%).
- **Ưu điểm nổi bật (Strengths)** & **Điểm cần cải thiện (Improvements)**.
- Nút *"Làm lại câu này"* hoặc *"Lưu & Chuyển sang câu tiếp theo →"*.

### 3.5. Khu vực 5: Màn Hình Bảng Điểm Tổng Kết (Session Scorecard / Summary)
Khi ứng viên hoàn thành câu hỏi cuối cùng hoặc bấm *"Nộp bài & Xem tổng kết"*:
- **Bảng vàng thành tích (Scorecard Hero):**
  - Điểm trung bình toàn bài thi: ví dụ `86/100đ - ĐẠT CHUẨN XUẤT SẮC`.
  - Tỉ lệ hoàn thành: `4 / 4 câu hỏi đã được chấm điểm`.
  - Thời gian hoàn thành: `14 phút 20 giây`.
- **Bảng phân tích chi tiết từng câu hỏi:**
  - Danh sách câu hỏi kèm điểm số từng câu, dạng bài đã làm (Quiz/Text/Voice).
  - Nhấp vào câu bất kỳ để xem lại lời nhận xét chi tiết của AI.
- **Hành động tiếp theo:**
  - Nút *Luyện lại các câu điểm chưa cao*.
  - Nút *Làm lại toàn bộ bài*.
  - Nút *Trở về Ngân hàng câu hỏi*.

---

## 4. Kế Hoạch Triển Khai Chi Tiết Từng Bước (Implementation Plan)

### Bước 1: Thiết Lập Quản Lý State & Service Phiên Làm Bài
- **Tập tin:** `src/hooks/useQuestionPracticeSession.ts`
- **Mục tiêu:**
  - Quản lý nạp danh sách câu hỏi từ `sessionStorage` (`basket_questions` hoặc bộ đề).
  - Lưu trữ câu trả lời, trạng thái làm bài và điểm số AI của từng câu hỏi.
  - Cung cấp các phương thức điều hướng: `goToQuestion(index)`, `nextQuestion()`, `prevQuestion()`, `submitAnswer()`, `finishSession()`.

### Bước 2: Tạo Trang Route Mới `/questions/practice`
- **Tập tin:**
  - `src/app/(user)/questions/practice/page.tsx` (Server component cung cấp SEO metadata).
  - `src/app/(user)/questions/practice/PracticeWorkspaceClient.tsx` (Client component giao diện chính).
  - `src/app/(user)/questions/practice/practiceWorkspace.module.css` (Style kính mờ, stepper, quiz, voice waveform, report).

### Bước 3: Đồng Bộ Tất Cả Các Nút Điều Hướng Về Trang `/questions/practice`
- **Tập tin cần cập nhật:**
  1. `src/components/user-component/questions/CuratedQuestionSetsView.tsx`:
     - Cập nhật hàm `handleStartSetPractice(set)`: Nạp toàn bộ câu hỏi của bộ đề vào phiên và điều hướng tới `/questions/practice?source=set&setId=${set.set_id}`.
  2. `src/app/(user)/questions/QuestionExplorerClient.tsx`:
     - Cập nhật nút Giỏ đề `handleConfirmBasketPractice()`: Nạp các câu hỏi đã bốc và điều hướng tới `/questions/practice?source=basket`.
     - Cập nhật nút *"Luyện câu này"* trên từng thẻ: Điều hướng tới `/questions/practice?source=single&questionId=${q.question_id}`.
  3. `src/app/(user)/questions/[id]/QuestionDetailClient.tsx`:
     - Nút *"Luyện tập câu này ngay"* chuyển sang `/questions/practice?source=single&questionId=${id}` hoặc mở tab tương ứng.

### Bước 4: Hoàn Thiện Màn Hình Tổng Kết & Đa Ngôn Ngữ (i18n)
- Thêm từ khóa i18n cho màn hình tổng kết vào `src/i18n/locales/vi/questions.ts` và `en/questions.ts`.
- Đảm bảo chuyển ngữ tức thì giữa Tiếng Việt và Tiếng Anh trên trang workspace.
