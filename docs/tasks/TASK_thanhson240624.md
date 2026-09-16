# NHIỆM VỤ CHI TIẾT DÀNH CHO: HUỲNH THANH SƠN (Frontend Analytics & Reports Lead)

- **Mã sinh viên:** 28211106624
- **Email:** `thanhson240624@gmail.com`
- **Git Branch:** `thanhson240624`
- **Worktree BE:** `D:\DOANNHATLE\Interview_Coach_SRC_CODE\BE-thanhson240624`
- **Worktree FE:** `D:\DOANNHATLE\Interview_Coach_SRC_CODE\FE-thanhson240624`

---

## ⚠️ QUY TẮC BẮT BUỘC TRƯỚC KHI BẮT ĐẦU (GIT IDENTITY & WORKTREE)

1. Mở đúng thư mục worktree Frontend được phân công:
   - Frontend: `D:\DOANNHATLE\Interview_Coach_SRC_CODE\FE-thanhson240624`
2. Kiểm tra branch hiện tại:
   ```bash
   git branch --show-current
   ```
   *Kết quả phải đúng là: `thanhson240624`*
3. Cấu hình danh tính Git chính xác:
   ```bash
   git config user.name "thanhson240624"
   git config user.email "thanhson240624@gmail.com"
   ```
4. **Tuyệt đối KHÔNG commit trực tiếp lên nhánh `main`.** Chỉ push lên `thanhson240624` và tạo PR sang `main`.
5. 🛑 **QUY TẮC COMMIT & HỎI Ý KIẾN USER (BẮT BUỘC):**
   - Mỗi khi hoàn thành xong bất kỳ một task nhỏ hay bước nào (ví dụ: tạo xong component biểu đồ, sửa xong trang result, dựng xong trang dashboard):
     - **TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT NGAY.**
     - Chạy test / build kiểm tra trước (`npm run build`).
     - Báo cáo ngắn gọn cho User: đã làm được gì, thay đổi những file nào, kết quả ra sao.
     - **Hỏi ý kiến User:** *"Tôi đã hoàn thành task nhỏ này và kiểm tra không có lỗi. Bạn có đồng ý để tôi commit không?"*
     - **CHỈ KHI USER XÁC NHẬN ĐỒNG Ý** mới được thực hiện `git add`, `git commit` và tạo PR!

---

## 🎯 PHẠM VI NHIỆM VỤ CỦA BẠN

Bạn chịu trách nhiệm về **Trang Kết quả phỏng vấn (`/result`), Bảng điều khiển ứng viên (`/dashboard`), Lịch sử phỏng vấn & Nghe lại bản ghi âm quá khứ (`/dashboard/interviews`), Báo cáo phân tích chuyên sâu (`/dashboard/progress`), và Trang xem/tải báo cáo kỹ năng PDF (`/reports`, `/report`)**.

---

## 📋 DANH MỤC FILE CẦN TRIỂN KHAI TẠI FRONTEND (`FE-thanhson240624`)

```text
src/
├── app/(user)/
│   ├── dashboard/
│   │   ├── page.tsx                      # Candidate Dashboard chính: KPI Cards, Charts, Recent Sessions
│   │   ├── interviews/
│   │   │   ├── page.tsx                  # Danh sách lịch sử phỏng vấn (Bộ lọc đa tầng, phân trang)
│   │   │   └── [sessionId]/page.tsx      # Chi tiết phiên quá khứ: Audio player từng turn, rubric review
│   │   └── progress/page.tsx             # Báo cáo chuyên sâu: Radar kỹ năng, xu hướng WPM, STAR mastery
│   ├── practice/[sessionId]/
│   │   ├── result/page.tsx               # Trang kết quả đánh giá thật: Rubric 3 tiêu chí, Speech report
│   │   └── report/page.tsx               # Trang xem trước & in ấn báo cáo chuẩn A4
│   └── reports/
│       ├── page.tsx                      # Danh sách các báo cáo PDF đã từng xuất
│       └── [id]/page.tsx                 # Chi tiết báo cáo
├── components/analytics/
│   ├── ScoreRadarChart.tsx               # Biểu đồ radar đánh giá 5 khía cạnh kỹ năng (Recharts)
│   ├── ScoreTrendLineChart.tsx           # Biểu đồ đường thể hiện sự tiến bộ qua các phiên
│   ├── SpeechQualityCard.tsx             # Card phân tích WPM, từ đệm và độ ngập ngừng
│   ├── StarBreakdownCard.tsx             # Thẻ đánh giá tỷ lệ đạt 4 thành phần S-T-A-R
│   └── AudioPlayerTurn.tsx               # Trình phát lại âm thanh từng lượt trả lời trong quá khứ
└── services/
    ├── analyticsApi.ts                   # API client: getDashboardStats(), getProgressTrends()
    └── historyApi.ts                     # API client: getInterviewHistory(), getSessionDetails()
```

---

## 📋 CÁC BƯỚC THỰC HIỆN CHI TIẾT THEO THỨ TỰ ƯU TIÊN

### Bước 1: Xây dựng Bộ Components Biểu đồ (Recharts)
1. Cài đặt thư viện: `npm install recharts lucide-react` (nếu chưa có).
2. **`ScoreRadarChart.tsx`:**
   - Biểu đồ radar thể hiện 5 trục kỹ năng:
     - Độ rõ ràng (Clarity)
     - Cấu trúc logic (Logical Structure)
     - Dẫn chứng thực tế (Concrete Examples)
     - Phong thái & Giọng điệu (Delivery / Speech)
     - Xử lý câu hỏi đào sâu (Follow-up handling)
3. **`ScoreTrendLineChart.tsx`:**
   - Biểu đồ đường theo dõi sự thay đổi của Điểm tổng quát qua 10 phiên phỏng vấn gần nhất.
4. **`AudioPlayerTurn.tsx`:**
   - Trình phát âm thanh mini kèm thanh tiến trình (progress bar), nút Play/Pause để nghe lại câu trả lời giọng nói của từng turn trong quá khứ.

### Bước 2: Nâng cấp Trang Kết quả phiên phỏng vấn (`/practice/[sessionId]/result/page.tsx`)
1. Thay thế hoàn toàn mock data trong file hiện tại.
2. Gọi API Backend `GET /api/v1/interviews/sessions/{sessionId}/result` để nhận:
   - Điểm tổng thể (Overall Score) trên thang 100 và Huy hiệu sẵn sàng (Readiness Badge).
   - Điểm chi tiết 3 tiêu chí Rubric (Clarity, Structure, Concrete Examples).
   - Báo cáo chất lượng giọng nói: Tốc độ nói WPM (kèm nhãn đánh giá: Quá chậm / Lý tưởng / Quá nhanh), danh sách các từ đệm hay mắc phải, tổng thời gian ngập ngừng.
   - Phân tích mức độ hoàn thiện cấu trúc STAR.
   - Accordion chi tiết từng câu hỏi: Câu hỏi của AI, câu trả lời của ứng viên, nhận xét ưu/khuyết điểm và **AI Ideal Answer** (câu trả lời mẫu xuất sắc).
3. Nút hành động: "Tải Báo Cáo PDF Chính Thức" và "Luyện tập phiên mới".

### Bước 3: Xây dựng Candidate Dashboard (`/dashboard/page.tsx`)
1. Thay thế stub placeholder hiện tại bằng giao diện Dashboard đầy đủ:
   - **Thanh chào mừng:** Lời chào theo tên người dùng, chuỗi ngày luyện tập liên tục (Streak).
   - **Thẻ KPI:** Tổng số buổi phỏng vấn, Điểm trung bình, Thời gian luyện tập tích lũy.
   - **Biểu đồ:** Biểu đồ đường tiến độ điểm số và Radar chart 5 kỹ năng.
   - **Danh sách phiên gần nhất:** Bảng 5 phiên gần nhất kèm trạng thái và nút xem lại chi tiết.
   - **Gợi ý điểm yếu (AI Recommendations):** Thẻ gợi ý tự động câu hỏi cần luyện tập để khắc phục kỹ năng yếu nhất.

### Bước 4: Lịch sử phỏng vấn & Phân tích chuyên sâu
1. **Trang Lịch sử (`/dashboard/interviews/page.tsx`):**
   - Bảng danh sách phiên có bộ lọc theo Ngành nghề (Domain), Vị trí (Role), khoảng điểm số và hình thức (Voice/Text).
   - Phân trang 10 phiên/trang.
2. **Trang Chi tiết phiên (`/dashboard/interviews/[sessionId]/page.tsx`):**
   - Hiển thị timeline chi tiết toàn bộ các lượt hỏi - đáp trong quá khứ.
   - Tích hợp `AudioPlayerTurn.tsx` để phát lại file ghi âm giọng nói ứng viên đã trả lời.
3. **Trang Phân tích tiến độ (`/dashboard/progress/page.tsx`):**
   - Biểu đồ theo dõi sự giảm dần của từ đệm (filler words) và sự ổn định của WPM qua từng tuần.
   - Tỷ lệ làm chủ phương pháp STAR (Mastery Tracker).

### Bước 5: Hoàn thiện Báo cáo PDF (`/reports`, `/report/page.tsx`)
- Trang xem trước báo cáo PDF chuẩn A4.
- Nút "Tải file PDF" kết nối trực tiếp với endpoint Backend `GET /api/v1/sessions/{id}/pdf/download`.

---

## 🚀 QUY TRÌNH ĐẨY CODE (PULL REQUEST)
```bash
# Tại worktree FE-thanhson240624
git add .
git commit -m "feat(dashboard): candidate dashboard, analytics charts, interview history and result page"
git push -u origin thanhson240624
gh pr create --base main --head thanhson240624 --title "feat(analytics): Candidate Dashboard, History and Result Analytics" --body "Implement real result review with rubric/speech breakdown, candidate dashboard with Recharts, turn-by-turn history replay with audio, and progress trends."
```
