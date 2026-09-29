# Kế Hoạch Thiết Kế & Triển Khai Chi Tiết (Comprehensive Technical Plan)
## Hệ Thống Đánh Giá Đa Thức (15-35-50), Lịch Sử Luyện Tập Freemium & Bảng Xếp Hạng Bộ Đề

> **Phạm vi hệ thống:**  
> - **Frontend:** Không gian làm bài (`/questions/practice`), Trang Hồ sơ cá nhân (`/profile`), Bộ đề tuyển dụng (`CuratedQuestionSetsView`).  
> - **Backend:** Catalog & Evaluation Routers, Repositories, History & Ranking Services.  
> **Người lập kế hoạch:** Lê Minh Hiếu (lhieu20231 - Admin Portal & Question Catalog Lead)  
> **Ngày lập:** 19/09/2026  
> **Trạng thái:** Kế hoạch phân chặng chi tiết sẵn sàng thực thi

---

## I. Tổng Quan Yêu Cầu & Kiến Trúc Nghiệp Vụ

### 1.1. Cấu trúc Điểm Đa Thức (Multi-Modal Composite Scoring)
Mỗi câu hỏi trong phiên luyện tập có thang điểm tuyệt đối là **100 điểm**, được tính toán dựa trên trọng số của cả 3 hình thức làm bài:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TỔNG ĐIỂM 1 CÂU HỎI: 100 ĐIỂM (100%)                     │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│ 🔘 TRẮC NGHIỆM (QUIZ) │  📝 TỰ LUẬN THEO STAR (TEXT)│ 🎙️ NÓI GHI ÂM (VOICE)  │
│   Trọng số: 15%       │    Trọng số: 35%            │   Trọng số: 50%       │
│   Tối đa: 15 điểm     │    Tối đa: 35 điểm          │   Tối đa: 50 điểm     │
│   (Kiểm tra tư duy    │    (Kiểm tra logic câu chữ, │   (Kiểm tra phát âm,  │
│    chọn lọc tình huống)│    cấu trúc STAR & số liệu) │    WPM, độ trôi chảy) │
└───────────────────────┴─────────────────────────────┴───────────────────────┘
```

**Công thức tính điểm câu hỏi:**
$$\text{Score}_{Q} = (\text{Score}_{\text{quiz}} \times 0.15) + (\text{Score}_{\text{text}} \times 0.35) + (\text{Score}_{\text{voice}} \times 0.50)$$

---

### 1.2. Cơ Chế Kiểm Tra & Cảnh Báo Khi Chuyển Câu (Pre-Transition Validation)
Khi người dùng bấm chuyển câu (`← Câu trước`, `Câu kế tiếp →`, hoặc click chọn câu trên thanh Stepper), hệ thống tự động kiểm tra mức độ hoàn thiện của câu hiện tại:
1. **Kiểm tra phần Trắc nghiệm:** Đã chọn đáp án chưa?
2. **Kiểm tra phần Tự luận:**
   - Chưa nhập nội dung ➔ Cảnh báo thiếu.
   - Nội dung dưới 20 từ (`countWords(text) < 20`) ➔ Cảnh báo bài viết quá ngắn, khó để AI chấm điểm cấu trúc STAR chính xác.
3. **Kiểm tra phần Ghi âm giọng nói:**
   - Chưa ghi âm ➔ Cảnh báo thiếu (chiếm 50% số điểm).
   - Bản ghi âm dưới 5 giây ➔ Cảnh báo quá ngắn để phân tích tốc độ nói WPM và ngữ điệu.

👉 **Quyền tự quyết của người dùng:** Hệ thống mở Dialog thông báo cảnh báo thân thiện, giải thích các phần còn thiếu, nhưng cung cấp nút **[ Vẫn tiếp tục bỏ qua ]** để ứng viên tự do nhảy câu nếu muốn, hoặc **[ Ở lại làm tiếp ]**.

---

### 1.3. Phân Quyền Báo Cáo AI (Freemium AI Feedback Policy)
- **Tài khoản Miễn phí (Free Candidate):**
  - AI vẫn chấm điểm đầy đủ cả 3 phần (hiển thị con số: ví dụ `15/15đ Trắc nghiệm`, `28/35đ Tự luận`, `42/50đ Nói` = `85/100đ Tổng`).
  - **Khóa nhận xét chuyên sâu:** Phần *Nhận xét tổng quan*, *Phân tích chi tiết S-T-A-R*, *Chi tiết 4 tiêu chí Rubric*, *Điểm mạnh & Điểm cần cải thiện* sẽ hiển thị dạng làm mờ (Blur Preview) kèm huy hiệu:
    `🔒 Đặc quyền gói Pro: Nâng cấp tài khoản để xem toàn bộ nhận xét và hướng dẫn cải thiện từ AI Coach.`
- **Tài khoản Trả phí (Pro Member / VIP / Admin):**
  - Mở khóa 100% toàn bộ nhận xét chi tiết, câu trả lời mẫu tối ưu và các lời khuyên khắc phục nhược điểm.

---

### 1.4. Lịch Sử Luyện Tập Trong Trang Profile (`/profile`)
Bổ sung Tab chuyên biệt trong trang cá nhân: **"Lịch sử luyện tập & Bài thi" (Practice History)**:
- Danh sách các phiên luyện tập đã thực hiện (Bộ đề, Giỏ đề tự bốc hoặc Câu lẻ).
- Hiển thị: Thời gian hoàn thành, Tổng điểm, Phân bổ điểm 3 phần (Quiz - Text - Voice).
- Nút **[ Luyện lại bài này ]**: Tự động mở đúng URL `/questions/practice?q=...` hoặc `?set=...`.
- Nút **[ Xem lại báo cáo điểm ]**: Xem lại bài làm và nhận xét AI đã lưu.

---

### 1.5. Bảng Xếp Hạng (Leaderboard) & Đánh Giá (Reviews) Cho Bộ Đề Tuyển Dụng (`Set`)
Chỉ áp dụng cho các **Bộ đề tuyển dụng chính thức** đã được Admin kiểm duyệt và duyệt xuất bản:
1. **Bảng xếp hạng (Leaderboard & Ranking):**
   - Vinh danh Top thí sinh có điểm số cao nhất khi hoàn thành bộ đề.
   - Thể hiện: Xếp hạng (Top 1 🥇, Top 2 🥈, Top 3 🥉, Top 4-10), Họ tên, Avatar (kèm vương miện nếu là Pro), Điểm số (/100đ), Thời gian hoàn thành bài, Ngày thi.
2. **Nhận xét & Đánh giá (User Reviews & Ratings):**
   - Đánh giá sao (1 đến 5 sao ⭐).
   - Bình luận đóng góp về chất lượng bộ đề, độ sát thực tế với phỏng vấn doanh nghiệp.
   - Form gửi đánh giá và nhận xét sau khi ứng viên hoàn thành xong bài thi của bộ đề.

---

## II. Kế Hoạch Phân Chặng Triển Khai Chi Tiết (Roadmap & Phases)

### 🚀 CHẶNG 1: Đánh Giá Đa Thức 3 Phần (15% - 35% - 50%) & Cảnh Báo Chuyển Câu
**Mục tiêu:** Hoàn thiện giao diện làm bài tại `/questions/practice`, người dùng có thể thực hiện đồng thời cả 3 phần trên 1 câu hỏi, tính điểm trọng số và hiển thị cảnh báo thông minh khi bỏ dở.

1. **Nâng cấp state bài làm trong `useQuestionPracticeSession.ts`:**
   - Cấu trúc state `QuestionMultiModalAnswer`:
     - `quiz_option_id`: string (A, B, C, D) ➔ Điểm: 0 hoặc 100 ➔ Nhân hệ số 15%.
     - `text_answer`: string ➔ Kiểm tra độ dài từ (`word_count`) ➔ Điểm: 0 - 100 ➔ Nhân hệ số 35%.
     - `voice_audio_url`: string + `voice_duration_seconds`: number ➔ Điểm: 0 - 100 ➔ Nhân hệ số 50%.
     - `composite_score`: number (0 - 100đ).
2. **Giao diện làm bài 3 phần tích hợp trong `PracticeWorkspaceClient.tsx`:**
   - Thay vì radio chọn 1 trong 3, hiển thị 3 thẻ phần thi rõ ràng có thanh tiến độ:
     - Thẻ 1: Trắc nghiệm tình huống (15đ) - Chọn A, B, C, D.
     - Thẻ 2: Tự luận theo khung STAR (35đ) - Ô soạn thảo văn bản kèm bộ đếm từ (hiển thị màu đỏ nếu < 20 từ).
     - Thẻ 3: Ghi âm giọng nói (50đ) - Micro ghi âm, sóng âm, đếm giây (hiển thị màu đỏ nếu < 5 giây).
3. **Component Modal Cảnh Báo Khi Chuyển Câu (`IncompleteWarningModal`):**
   - Bắt sự kiện khi người dùng bấm `nextQuestion()`, `prevQuestion()` hoặc nhảy Stepper.
   - Nếu câu hiện tại thiếu trắc nghiệm, text < 20 từ, hoặc voice < 5s ➔ Bật modal cảnh báo.
   - Nút: *"Ở lại hoàn thành"* vs *"Vẫn tiếp tục bỏ qua"*.

---

### 🚀 CHẶNG 2: Phân Quyền Freemium Cho Báo Cáo AI & Lưu Trữ Lịch Sử Làm Bài
**Mục tiêu:** Tích hợp quy tắc gói cước (Free vs Pro) vào kết quả chấm điểm AI và lưu trữ lịch sử làm bài vào Backend/Local state.

1. **Phân quyền hiển thị nhận xét AI theo gói cước:**
   - Đọc trạng thái `isSubscribed` từ hook `useUserSubscription()`.
   - **Tài khoản Free:**
     - Điểm số 3 phần vẫn hiển thị công khai, rõ ràng.
     - Khối *Nhận xét STAR*, *Tiêu chí Rubric* và *Gợi ý cải thiện* được phủ lớp làm mờ (`filter: blur(5px)`) kèm overlay khóa: *"Nâng cấp Pro để xem toàn bộ nhận xét và hướng dẫn từ AI Coach"*.
   - **Tài khoản Pro:**
     - Mở khóa hiển thị đầy đủ 100% nội dung phân tích chi tiết.
2. **Mô hình dữ liệu lưu trữ Lịch sử bài thi (Backend & Frontend):**
   - **Backend API:**
     - `POST /api/v1/catalog/practice-history`: Lưu bản ghi bài thi của người dùng.
     - `GET /api/v1/catalog/practice-history/me`: Lấy danh sách lịch sử thi của tài khoản hiện tại.
   - **Frontend:**
     - Lưu trữ bổ sung vào `localStorage` (`interviewly_practice_history`) để đảm bảo dữ liệu luôn khả dụng ngay cả khi offline hoặc tài khoản vãng lai.

---

### 🚀 CHẶNG 3: Tab "Lịch Sử Luyện Tập" Trong Trang Profile (`/profile`)
**Mục tiêu:** Hiển thị toàn bộ nhật ký các bài thi đã làm của ứng viên trong trang Hồ sơ cá nhân.

1. **Bổ sung Tab thứ 5 trong `ProfileClient.tsx`:**
   - `activeTab: "general" | "career" | "security" | "readiness" | "history"`.
   - Tab nhãn: *"Lịch sử luyện tập & Bài thi"*.
2. **Giao diện danh sách lịch sử thi:**
   - Thống kê tổng quan: Tổng số đề đã làm, Điểm trung bình cao nhất, Tỉ lệ đạt chuẩn.
   - Thẻ từng bài thi:
     - Tên bài thi (hoặc giỏ đề tự chọn).
     - Ngày thi, Thời gian làm bài.
     - Huy hiệu điểm số (Xanh = Đạt, Vàng/Đỏ = Cần cải thiện).
     - Thanh phân bổ điểm 3 thành phần: 🔘 Quiz (15%), 📝 Text (35%), 🎙️ Voice (50%).
     - Nút *"Luyện lại đề này"* (mở đúng URL `/questions/practice?q=...` hoặc `?set=...`).
     - Nút *"Xem lại chi tiết & Nhận xét"*.

---

### 🚀 CHẶNG 4: Bảng Xếp Hạng (Leaderboard) & Đánh Giá (Reviews) Cho Bộ Đề Tuyển Dụng
**Mục tiêu:** Tạo động lực thi đua và tương tác cộng đồng cho các Bộ đề tuyển dụng chuẩn được Admin phê duyệt.

1. **Backend Endpoints:**
   - `GET /api/v1/catalog/question-sets/{set_id}/leaderboard`: Lấy Top 10 thí sinh điểm cao nhất của bộ đề.
   - `GET /api/v1/catalog/question-sets/{set_id}/reviews`: Lấy danh sách đánh giá sao và bình luận của người dùng.
   - `POST /api/v1/catalog/question-sets/{set_id}/reviews`: Gửi đánh giá mới (số sao từ 1-5 và nội dung nhận xét).
2. **Giao diện Bảng xếp hạng (Leaderboard) trong modal/trang Bộ đề:**
   - Top 3 Podium (Huy chương Vàng 🥇, Bạc 🥈, Đồng 🥉) với Avatar đội vương miện nếu là Pro.
   - Bảng xếp hạng Top 4 - 10: Tên, điểm số (/100đ), thời gian làm bài, ngày thi.
3. **Giao diện Đánh giá & Bình luận (Reviews & Feedback):**
   - Điểm đánh giá sao trung bình (ví dụ: `4.9 / 5.0 ⭐`).
   - Danh sách nhận xét của các ứng viên đã từng luyện đề này.
   - Form gửi đánh giá sao và cảm nhận sau khi ứng viên hoàn thành xong bài thi của bộ đề.

---

### 🚀 CHẶNG 5: Hoàn Thiện Song Ngữ (i18n), Tối Ưu Hóa & Bàn Giao
**Mục tiêu:** Đảm bảo toàn bộ từ khóa, thông báo cảnh báo và nhãn giao diện đều hỗ trợ chuẩn xác cả Tiếng Việt và Tiếng Anh.

1. Cập nhật file từ điển mô-đun:
   - `src/i18n/locales/vi/questions.ts` & `src/i18n/locales/en/questions.ts`.
   - `src/i18n/locales/vi/profile.ts` & `src/i18n/locales/en/profile.ts`.
2. Kiểm tra tính toàn vẹn cú pháp TypeScript và tuân thủ quy tắc Agent (không tự ý build/test/mở UI).
3. Bàn giao người dùng tự trải nghiệm trên trình duyệt.
