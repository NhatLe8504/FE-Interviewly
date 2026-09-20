# BẢN ĐẶC TẢ YÊU CẦU & KẾ HOẠCH TRIỂN KHAI KỸ THUẬT (SRS & IMPLEMENTATION PLAN)
## Hệ Thống Đánh Giá Bất Đồng Bộ Theo Từng Câu, Pull MQ Phân Tách Text/Voice & Giao Diện Live Scorecard Tức Thì

> **Mục tiêu cốt lõi:**  
> 1. **Chấm điểm cuốn chiếu theo từng câu (Incremental Asynchronous Evaluation):** Ngay khi ứng viên hoàn thành câu nào, đưa ngay câu đó vào hàng đợi ngầm và dùng `async/await` đợi AI chấm điểm trong nền; không bắt người dùng đợi làm hết cả đề mới gửi chấm.  
> 2. **Tách biệt yêu cầu chấm Tự luận & Giọng nói (Decoupled Text & Voice Evaluation):**  
>    - **Tự luận (Text STAR):** Gửi nội dung văn bản để AI phân tích cấu trúc S-T-A-R và tính thuyết phục.  
>    - **Giọng nói (Voice):** Sử dụng STT Transcript của trình duyệt kết hợp bộ dữ liệu telemetry thu thập ngầm (từ đệm `ạ, ừm, ờ, kiểu như...`, số lần ngắt quãng dài, tốc độ WPM thực tế, lặp từ/nói lắp) và bộ quy tắc prompt tinh gọn để AI chấm điểm phát âm & ngữ điệu với độ trễ tối thiểu.  
> 3. **Giao diện Live Scorecard tức thì (Instant Scorecard UX):** Khi ứng viên bấm "Nộp bài" ở câu cuối, giao diện lập tức chuyển sang trang Kết quả tổng quan. Các câu đang được AI chấm ngầm sẽ hiển thị nhãn `⏳ Đang chấm điểm...` và tự động cập nhật kết quả theo thời gian thực ngay khi worker hoàn thành.  
> 4. **Nhận xét tổng thể cuối cùng (AI Overall Synthesis):** Sau khi toàn bộ các câu hỏi đã có điểm, hệ thống tự động tổng hợp toàn bộ kết quả để AI đưa ra nhận xét bao quát toàn bài thi.  
> 5. **Không nghẽn luồng (Zero Blocking I/O):** Toàn bộ các tác vụ mạng và xử lý nền từ Backend (FastAPI async) đến Frontend (Next.js polling) đều sử dụng `async/await`.

---

## I. KIẾN TRÚC LUỒNG DỮ LIỆU TỔNG THỂ (SYSTEM DATA FLOW)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   LUỒNG XỬ LÝ ĐÁNH GIÁ CUỐN CHIẾU THEO TỪNG CÂU                       │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ỨNG VIÊN HOÀN THÀNH CÂU i] ➔ [BẤM "CÂU KẾ TIẾP →"]
             │
             ├─────────────────────────────────────────────────────────┐
             ▼ (0ms - Không chặn UI)                                   ▼ (Xử lý ngầm qua async/await)
 ┌──────────────────────────────┐                   ┌──────────────────────────────────────────────┐
 │ • Chuyển ngay sang câu i + 1 │                   │ PIPELINE B: HÀNG ĐỢI PULL MQ                 │
 │ • Khóa câu i (Read-Only)     │                   │                                              │
 │ • Bắt đầu làm câu mới        │                   │ 1. Chấm Trắc nghiệm: 0ms bằng Answer Key     │
 └──────────────────────────────┘                   │ 2. Request A: POST /evaluations/text-queue   │
                                                    │    (Nội dung STAR -> AI phân tích logic)     │
                                                    │ 3. Request B: POST /evaluations/voice-queue  │
                                                    │    (STT Text + Telemetry ngầm -> AI chấm WPM)│
                                                    │ 4. Client Polling: GET /evaluations/pull/id  │
                                                    │    (async/await cập nhật ngầm vào memory)    │
                                                    └──────────────────────────────────────────────┘
                                                                       │
 ┌─────────────────────────────────────────────────────────────────────┘
 ▼
 [ỨNG VIÊN LÀM XONG CÂU CUỐI CÙNG] ➔ [BẤM "NỘP BÀI & TỔNG KẾT"]
             │
             ├─────────────────────────────────────────────────────────┐
             ▼ (Chuyển trang ngay lập tức)                             ▼ (Xử lý ngầm dưới nền)
 ┌───────────────────────────────────────────┐      ┌──────────────────────────────────────────────┐
 │ GIAO DIỆN LIVE SCORECARD HIỂN THỊ NGAY    │      │ 1. Đẩy câu cuối vào hàng đợi chấm ngầm       │
 │                                           │      │ 2. Khi tất cả N câu đã có điểm:              │
 │ • Câu 1, 2... (đã chấm xong):             │      │    POST /evaluations/overall-synthesis       │
 │   Hiển thị điểm số & phân tích chi tiết   │      │    (Gửi toàn bộ N kết quả cho AI nhận xét)   │
 │ • Câu đang chấm (chưa có kết quả):        │      │ 3. Client kéo kết quả và cập nhật trực tiếp  │
 │   Hiển thị badge [ ⏳ Đang chấm điểm... ] │      │    lên màn hình Scorecard                    │
 │ • Nhận xét tổng quát:                     │      │                                              │
 │   [ ⏳ AI Coach đang tổng hợp bài thi... ] │      │                                              │
 └───────────────────────────────────────────┘      └──────────────────────────────────────────────┘
```

---

## II. ĐẶC TẢ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX SPECIFICATION)

### 2.1. Trải nghiệm trong lúc chuyển câu
- Khi chuyển từ câu $i$ sang câu $i+1$:
  - Câu $i$ được khóa một chiều (`lockedQuestionIds`), chuyển sang chế độ chỉ xem (Read-Only).
  - Giao diện ngay lập tức mở câu $i+1$, mặc định hiển thị tab **Trắc nghiệm tình huống (Quiz)** đầu tiên.
  - Client gọi 2 request bất đồng bộ `enqueueTextEvaluation` và `enqueueVoiceEvaluation` để đẩy bài làm câu $i$ vào hàng đợi. Toàn bộ tiến trình diễn ra ngầm, ứng viên không phải chờ đợi dù chỉ 1 mili-giây.

### 2.2. Trải nghiệm khi bấm "Nộp bài & Tổng kết" (Instant Live Scorecard)
- Tuyệt đối **không hiển thị màn hình trắng xoá hoặc spinner chặn màn hình**.
- Ứng viên lập tức được đưa vào giao diện **Bảng Điểm Tổng Kết (Scorecard)**:
  - Vòng tròn điểm số trung bình hiển thị trạng thái động (tính toán dựa trên các câu đã có điểm).
  - Từng thẻ câu hỏi trong danh sách:
    - Câu đã có kết quả: Hiển thị điểm số 3 thành phần (Quiz 15%, Text 35%, Voice 50%), bóc tách STAR và thẻ phân tích phát âm.
    - Câu đang được AI xử lý: Hiển thị hiệu ứng ánh sáng nhẹ (pulse) kèm nhãn nổi bật:
      `⏳ Đang chấm điểm...`
  - Khi worker trả về kết quả của từng câu, thẻ đó lập tức chuyển từ `Đang chấm điểm...` sang bảng điểm chi tiết mà không cần tải lại trang (Zero reload).
  - Khối nhận xét tổng thể cả bài thi:
    - Ban đầu hiển thị: `⏳ AI Coach đang tổng hợp nhận xét toàn diện cho toàn bộ bài thi...`
    - Khi nhận được kết quả tổng hợp: Tự động bung ra các phân tích điểm mạnh cốt lõi, điểm cần hoàn thiện và lời khuyên định hướng nghề nghiệp.

---

## III. THIẾT KẾ YÊU CẦU ĐÁNH GIÁ (SEPARATE REQUESTS: TEXT VS. VOICE TELEMETRY)

### 3.1. Đánh giá phần Tự luận theo STAR (Text Evaluation)
- **Endpoint:** `POST /api/v1/catalog/evaluations/text-queue`
- **Payload:**
  ```json
  {
    "question_id": 1,
    "question_text": "Hãy kể về một lần bạn gặp phải critical bug trên production...",
    "answer_text": "Trong dự án thanh toán, tôi phát hiện lỗi cạn connection pool...",
    "language": "vi"
  }
  ```
- **Nội dung kiểm tra:** Phân tích 4 thành tố S-T-A-R, số liệu định lượng và chiều sâu kỹ thuật.
- **Trọng số điểm:** Tối đa 35 điểm.

---

### 3.2. Đánh giá phần Giọng nói & Phát âm (Voice Telemetry Evaluation)
- **Endpoint:** `POST /api/v1/catalog/evaluations/voice-queue`
- **Payload:**
  ```json
  {
    "question_id": 1,
    "transcript": "Dạ thưa anh thì là dự án của em gặp lỗi ừm connection pool...",
    "delivery_metrics": {
      "duration_ms": 48500,
      "active_speech_ms": 42100,
      "word_count": 96,
      "active_speech_wpm": 137,
      "elapsed_wpm": 118,
      "filler_count": 4,
      "fillers": [
        { "text": "dạ", "count": 2, "is_possible_filler": false },
        { "text": "ừm", "count": 1, "is_possible_filler": false },
        { "text": "thì là", "count": 1, "is_possible_filler": false }
      ],
      "long_pause_count": 2,
      "pause_durations_ms": [1400, 1850],
      "repetition_count": 0,
      "repeated_phrases": []
    },
    "language": "vi"
  }
  ```

#### Bộ Quy Tắc Chấm Điểm Ngắn Gọn Trong Prompt (Concise Delivery Scoring Prompt)
Để tối ưu hóa độ trễ (latency $< 1.2$s) và tiết kiệm token với OpenRouter DeepSeek Flash Free, prompt được tinh gọn tối đa theo bộ quy tắc định lượng:
```text
Bạn là chuyên gia giám khảo phân tích giọng nói phỏng vấn. Chấm điểm phần phát biểu (tối đa 50đ) theo bộ quy tắc định lượng sau:
1. Tốc độ nói (WPM):
   - 110 - 165 WPM: Tối ưu (+15đ).
   - 85 - 109 WPM: Hơi chậm (+11đ).
   - < 85 WPM hoặc > 175 WPM: Quá chậm hoặc quá nhanh (+7đ).
2. Độ trôi chảy & Khoảng lặng:
   - 0 - 1 khoảng lặng dài (>1.2s): Tốt (+15đ).
   - 2 - 3 khoảng lặng dài: Trung bình (+10đ).
   - > 3 khoảng lặng: Ngập ngừng (+6đ).
3. Từ đệm (Fillers: dạ, ừm, à, kiểu như, thì là mà...):
   - 0 - 2 từ đệm: Tự tin (+15đ).
   - 3 - 5 từ đệm: Trừ 3đ.
   - > 5 từ đệm: Trừ 6đ.
4. Lặp từ / nói lắp: Trừ 1đ cho mỗi cụm từ lặp.
5. Nội dung phát âm: Đánh giá độ rõ ràng và tác phong chuyên nghiệp (+5đ).

Trả về DUY NHẤT một JSON hợp lệ:
{
  "voice_score": 44.5,
  "pace_rating": "optimal",
  "feedback": "Tốc độ nói 137 WPM rất chuẩn mực và tự tin. Chú ý hạn chế các từ đệm 'dạ', 'ừm' khi bắt đầu câu trả lời.",
  "strengths": ["Tốc độ phát âm mạch lạc, nhịp thở đều đặn."],
  "improvements": ["Nên dừng 1 giây để lấy hơi thay vì dùng từ đệm 'thì là'."]
}
```

---

### 3.3. Nhận Xét Tổng Hợp Toàn Bộ Bài Thi (Overall Synthesis Evaluation)
- **Endpoint:** `POST /api/v1/catalog/evaluations/overall-synthesis`
- **Payload:**
  ```json
  {
    "session_title": "Bộ đề phỏng vấn Full Stack Java Fresher",
    "total_questions": 3,
    "evaluated_questions": [
      {
        "question_id": 1,
        "question_text": "Critical bug trên production...",
        "quiz_score": 15,
        "text_score": 31.5,
        "voice_score": 44.0,
        "total_score": 90.5
      },
      ...
    ]
  }
  ```
- **Kết quả:** Trả về nhận xét tổng quan về toàn bộ năng lực chuyên môn, phong thái trả lời và hướng dẫn cải thiện chiến lược cho ứng viên.

---

## IV. ĐẶC TẢ API BACKEND (FASTAPI ASYNC IMPLEMENTATION)

| Phương thức & Endpoint | Chức năng | Cơ chế xử lý |
| :--- | :--- | :--- |
| `POST /api/v1/catalog/evaluations/text-queue` | Đẩy bài tự luận STAR vào hàng đợi chấm điểm | Trả về `task_id` trong $< 10$ms; worker ngầm chạy AI phân tích STAR |
| `POST /api/v1/catalog/evaluations/voice-queue` | Đẩy STT text + telemetry ngữ âm vào hàng đợi | Trả về `task_id` trong $< 10$ms; worker ngầm chạy Prompt định lượng ngữ âm |
| `POST /api/v1/catalog/evaluations/overall-synthesis` | Tổng hợp nhận xét toàn bộ bài thi | Chạy ngầm khi tất cả các câu đã hoàn thành chấm điểm |
| `GET /api/v1/catalog/evaluations/pull/{task_id}` | Kéo kết quả của một task | Trả về trạng thái `queued` \| `processing` \| `completed` kèm kết quả |

---

## V. ĐẶC TẢ FRONTEND CLIENT & STATE MANAGEMENT

### 5.1. Hook `useEvaluationPullQueue.ts`
- Quản lý 3 loại task cho từng câu: `text_task_id`, `voice_task_id`, `overall_synthesis_task_id`.
- Chạy polling song song bằng `async/await` với thuật toán Exponential Backoff ngắn (250ms $\rightarrow$ 450ms $\rightarrow$ 750ms $\rightarrow$ tối đa 1200ms).
- Khi nhận được kết quả của thành phần nào, cập nhật ngay lập tức vào state điểm của câu đó.

### 5.2. Component `QuestionDetailClient.tsx`
- **Chuyển câu (`proceedToTargetQuestion`)**:
  - Gửi tự luận vào `text-queue` (nếu có nội dung).
  - Gửi giọng nói & telemetry vào `voice-queue` (nếu có bản ghi).
  - Khóa câu cũ và đưa sang câu mới ngay lập tức.
- **Nộp bài (`handleFinalSubmit`)**:
  - Gửi câu cuối cùng vào hàng đợi.
  - Ngay lập tức đặt `isFinished = true` để mở màn hình Scorecard.
  - Các câu đang chờ kết quả hiển thị badge: `⏳ Đang chấm điểm...`.
  - Tự động kích hoạt `POST /evaluations/overall-synthesis` khi toàn bộ câu hỏi đã có kết quả.

---

## VI. KẾ HOẠCH TRIỂN KHAI TỪNG BƯỚC (STEP-BY-STEP IMPLEMENTATION ROADMAP)

- [ ] **Bước 1: Backend API**: Bổ sung các schema và 3 router endpoint bất đồng bộ (`text-queue`, `voice-queue`, `overall-synthesis`) cùng worker xử lý chuyên biệt trong `catalog.py`.
- [ ] **Bước 2: Backend AI Prompt**: Viết template prompt chấm điểm giọng nói định lượng ngắn gọn trong `openai_adapter.py` / `prompt_templates.py`.
- [ ] **Bước 3: Frontend API Client**: Thêm các hàm gọi `enqueueTextEvaluation`, `enqueueVoiceEvaluation`, `synthesizeOverallEvaluation` trong `catalogApi.ts`.
- [ ] **Bước 4: Frontend Pull Queue Hook**: Nâng cấp `useEvaluationPullQueue.ts` hỗ trợ đa luồng task và polling tự động.
- [ ] **Bước 5: Frontend UI Live Scorecard**: Cập nhật `QuestionDetailClient.tsx` chuyển trạng thái tức thì sang Scorecard, hiển thị badge `⏳ Đang chấm điểm...` và cập nhật live.
- [ ] **Bước 6: Kiểm tra AST & Bàn giao**: Rà soát toàn bộ cú pháp TypeScript/Python đạt 0 lỗi và bàn giao người dùng kiểm tra.
